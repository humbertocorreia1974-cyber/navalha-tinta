import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SLOT_MIN = 30;
const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000;

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function toHHMM(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(_request.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Data invalida (YYYY-MM-DD)' }, { status: 400 });
  }

  const barber = await prisma.barber.findUnique({ where: { id: params.id } });
  if (!barber || !barber.ativo) {
    return NextResponse.json({ error: 'Barbeiro indisponivel' }, { status: 404 });
  }

  let duration = 30;
  if (serviceId) {
    const svc = await prisma.service.findUnique({ where: { id: serviceId } });
    if (svc) duration = svc.duracaoMinutos;
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const [appointments, blocked] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId: params.id,
        dataAgendamento: { gte: dayStart, lte: dayEnd },
        statusAgendamento: { in: ['pendente', 'confirmado'] },
      },
      select: { horaInicio: true, horaFim: true },
    }),
    prisma.blockedSlot.findMany({
      where: { barberId: params.id, data: { gte: dayStart, lte: dayEnd } },
      select: { horaInicio: true, horaFim: true },
    }),
  ]);

  const busy: Array<[number, number]> = [];
  for (const a of appointments) busy.push([toMinutes(a.horaInicio), toMinutes(a.horaFim)]);
  for (const b of blocked) busy.push([toMinutes(b.horaInicio), toMinutes(b.horaFim)]);

  const openMin = 9 * 60;
  const closeMin = 20 * 60;
  const now = Date.now();
  const slots: string[] = [];

  for (let start = openMin; start + duration <= closeMin; start += SLOT_MIN) {
    const end = start + duration;
    const conflict = busy.some(([bs, be]) => start < be && end > bs);
    if (conflict) continue;

    const slotDate = new Date(`${date}T${toHHMM(start)}:00`);
    if (slotDate.getTime() - now < MIN_ADVANCE_MS) continue;

    slots.push(toHHMM(start));
  }

  return NextResponse.json({ date, barberId: params.id, duration, slots });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/barbers/[id]/availability/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
