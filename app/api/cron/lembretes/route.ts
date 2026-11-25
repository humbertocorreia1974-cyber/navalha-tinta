import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const agora = new Date();
  const daqui24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
  const daqui25h = new Date(agora.getTime() + 25 * 60 * 60 * 1000);

  const agendamentos = await prisma.appointment.findMany({
    where: {
      statusAgendamento: { in: ["pendente", "confirmado"] },
      dataAgendamento: { gte: daqui24h, lte: daqui25h },
    },
    include: {
      client: true,
      barber: true,
      service: true,
    },
  });

  let enviados = 0;
  for (const ag of agendamentos) {
    const email = ag.client?.email;
    if (!email) continue;

    const jaNotificado = await prisma.notification.findFirst({
      where: {
        appointmentId: ag.id,
        tipoNotificacao: "lembrete",
        canalEnvio: "email",
      },
    });
    if (jaNotificado) continue;

    const dataFmt = ag.dataAgendamento.toLocaleDateString("pt-BR");
    const html = `
      <div style="font-family:Georgia,serif;color:#111;line-height:1.6">
        <h2 style="margin:0 0 12px">Lembrete do seu horário na Navalha & Tinta</h2>
        <p>Olá, ${ag.nomeCliente}.</p>
        <p>Seu atendimento de <strong>${ag.service.nomeServico}</strong> com <strong>${ag.barber.nomeCompleto}</strong> está marcado para <strong>${dataFmt} às ${ag.horaInicio}</strong>.</p>
        <p>Se precisar remarcar, cancele com pelo menos 12 horas de antecedência pelo painel.</p>
        <p style="margin-top:24px;color:#666">Tradição no corte, ousadia no estilo.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject: `Lembrete: ${ag.service.nomeServico} em ${dataFmt} às ${ag.horaInicio}`,
        html,
      });

      await prisma.notification.create({
        data: {
          titulo: "Lembrete de agendamento",
          mensagem: `Seu ${ag.service.nomeServico} é amanhã às ${ag.horaInicio}.`,
          tipoNotificacao: "lembrete",
          canalEnvio: "email",
          dataEnvio: new Date(),
          destinatarioEmail: email,
          userId: ag.clientId,
          appointmentId: ag.id,
        },
      });
      enviados += 1;
    } catch (err) {
      console.error("Falha ao enviar lembrete", ag.id, err);
    }
  }

  return NextResponse.json({ ok: true, total: agendamentos.length, enviados });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/cron/lembretes/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
