import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
  }

  const isOwner = appointment.clientId === session.user.id;
  const isAdmin = session.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  if (appointment.statusAgendamento === 'cancelado') {
    return NextResponse.json({ error: 'Agendamento já cancelado' }, { status: 400 });
  }

  const [h, m] = appointment.horaInicio.split(':').map(Number);
  const when = new Date(appointment.dataAgendamento);
  when.setHours(h, m, 0, 0);
  const diffMs = when.getTime() - Date.now();
  if (!isAdmin && diffMs < 12 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: 'Cancelamento permitido apenas com 12h de antecedência.' },
      { status: 400 },
    );
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { statusAgendamento: 'cancelado' },
  });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: 'cancelar_agendamento',
      entidadeAfetada: 'Appointment',
      usuarioResponsavel: session.user.email ?? session.user.id,
      detalhesEvento: `Agendamento ${appointment.id} cancelado`,
      appointmentId: appointment.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/appointments/[id]/cancel/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
