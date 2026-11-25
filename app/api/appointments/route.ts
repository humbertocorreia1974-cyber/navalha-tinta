import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Faca login para agendar' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  const { serviceId, barberId, date, time, notes, couponCode } = body ?? {};
  if (!serviceId || !barberId || !date || !time) {
    return NextResponse.json({ error: 'Preencha servico, barbeiro, data e horario' }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: 'Data ou horario em formato invalido' }, { status: 400 });
  }

  const [service, barber] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.barber.findUnique({ where: { id: barberId } }),
  ]);
  if (!service || !service.disponivel) {
    return NextResponse.json({ error: 'Servico indisponivel' }, { status: 404 });
  }
  if (!barber || !barber.ativo) {
    return NextResponse.json({ error: 'Barbeiro indisponivel' }, { status: 404 });
  }

  const startMin = toMinutes(time);
  const endMin = startMin + service.duracaoMinutos;
  const horaInicio = time;
  const horaFim = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;

  const dataAgendamento = new Date(`${date}T${horaInicio}:00`);
  if (Number.isNaN(dataAgendamento.getTime())) {
    return NextResponse.json({ error: 'Data invalida' }, { status: 400 });
  }
  if (dataAgendamento.getTime() - Date.now() < MIN_ADVANCE_MS) {
    return NextResponse.json(
      { error: 'Agendamentos precisam de no minimo 2 horas de antecedencia' },
      { status: 400 }
    );
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const [existing, blocked] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId,
        dataAgendamento: { gte: dayStart, lte: dayEnd },
        statusAgendamento: { in: ['pendente', 'confirmado'] },
      },
      select: { horaInicio: true, horaFim: true },
    }),
    prisma.blockedSlot.findMany({
      where: { barberId, data: { gte: dayStart, lte: dayEnd } },
      select: { horaInicio: true, horaFim: true },
    }),
  ]);

  const conflict = [...existing, ...blocked].some((b) => {
    const bs = toMinutes(b.horaInicio);
    const be = toMinutes(b.horaFim);
    return startMin < be && endMin > bs;
  });
  if (conflict) {
    return NextResponse.json({ error: 'Este horario acabou de ser ocupado. Escolha outro.' }, { status: 409 });
  }

  let couponId: string | null = null;
  let valorTotal = Number(service.precoBase);
  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const coupon = await prisma.coupon.findUnique({ where: { codigoCupom: couponCode.trim().toUpperCase() } });
    if (coupon && coupon.ativo && coupon.dataValidade.getTime() > Date.now()) {
      couponId = coupon.id;
      const off = coupon.tipoDesconto === 'percentual'
        ? valorTotal * (Number(coupon.valorDesconto) / 100)
        : Number(coupon.valorDesconto);
      valorTotal = Math.max(0, valorTotal - off);
    }
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      dataAgendamento,
      horaInicio,
      horaFim,
      statusAgendamento: 'pendente',
      nomeCliente: user.name,
      telefoneCliente: user.phone ?? '',
      observacoes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
      valorTotal,
      clientId: user.id,
      barberId,
      serviceId,
      couponId,
    },
  });

  if (couponId) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { quantidadeUsos: { increment: 1 } },
    }).catch(() => undefined);
  }

  await prisma.notification.create({
    data: {
      titulo: 'Agendamento recebido',
      mensagem: `Seu horario com ${barber.nomeCompleto} em ${date} as ${horaInicio} foi registrado.`,
      tipoNotificacao: 'confirmacao',
      canalEnvio: 'app',
      userId: user.id,
      appointmentId: appointment.id,
    },
  }).catch(() => undefined);

  sendEmail({
    to: user.email,
    subject: 'Agendamento confirmado na Navalha & Tinta',
    html: `<p>Ola ${user.name},</p><p>Seu horario com <strong>${barber.nomeCompleto}</strong> para <strong>${service.nomeServico}</strong> em <strong>${date} as ${horaInicio}</strong> foi registrado.</p><p>Tradicao no corte, ousadia no estilo.</p>`,
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, id: appointment.id });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/appointments/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
