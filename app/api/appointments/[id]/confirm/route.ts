import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      clientId: true,
      statusAgendamento: true,
      dataAgendamento: true,
      horaInicio: true,
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  const isOwner = appointment.clientId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  if (appointment.statusAgendamento === "cancelado") {
    return NextResponse.json(
      { error: "Agendamento cancelado não pode ser confirmado" },
      { status: 400 }
    );
  }

  if (appointment.statusAgendamento === "concluido") {
    return NextResponse.json(
      { error: "Agendamento já foi concluído" },
      { status: 400 }
    );
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { statusAgendamento: "confirmado" },
  });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: "confirmar_agendamento",
      entidadeAfetada: "Appointment",
      usuarioResponsavel: session.user.email ?? session.user.id,
      detalhesEvento: `Agendamento ${appointment.id} confirmado pelo cliente`,
      nivelCriticidade: "info",
      userId: session.user.id,
      appointmentId: appointment.id,
    },
  });

  return NextResponse.json({ ok: true, appointment: updated });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/appointments/[id]/confirm/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
