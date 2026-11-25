import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const WINDOW_MIN_MS = 23 * 60 * 60 * 1000;
const WINDOW_MAX_MS = 25 * 60 * 60 * 1000;

function buildReminderMessage(nome: string, servico: string, barbeiro: string, quando: string) {
  return `Olá ${nome}! Lembrete do seu horário na Navalha & Tinta: ${servico} com ${barbeiro} em ${quando}. Se precisar remarcar, responda por aqui.`;
}

async function sendWhatsApp(to: string, body: string) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneId || !token) return { ok: false, reason: 'whatsapp_not_configured' };

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, reason: `whatsapp_${res.status}_${text.slice(0, 120)}` };
  }
  return { ok: true };
}

export async function GET(request: Request) {
  try {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const now = Date.now();
  const from = new Date(now + WINDOW_MIN_MS);
  const to = new Date(now + WINDOW_MAX_MS);

  const appointments = await prisma.appointment.findMany({
    where: {
      statusAgendamento: { in: ['pendente', 'confirmado'] },
      dataAgendamento: { gte: from, lte: to },
    },
    include: {
      service: { select: { nomeServico: true } },
      barber: { select: { nomeCompleto: true } },
      client: { select: { id: true, name: true, email: true, phone: true } },
    },
    take: 200,
  });

  let sentWhatsApp = 0;
  let sentEmail = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const appt of appointments) {
    const alreadySent = await prisma.notification.findFirst({
      where: {
        appointmentId: appt.id,
        tipoNotificacao: 'lembrete',
      },
      select: { id: true },
    });
    if (alreadySent) {
      skipped += 1;
      continue;
    }

    const quando = `${appt.dataAgendamento.toLocaleDateString('pt-BR')} às ${appt.horaInicio}`;
    const mensagem = buildReminderMessage(
      appt.nomeCliente,
      appt.service.nomeServico,
      appt.barber.nomeCompleto,
      quando,
    );

    const phone = appt.client?.phone ?? appt.telefoneCliente;
    const email = appt.client?.email;

    let canalEnvio = 'app';
    let enviado = false;

    if (phone) {
      try {
        const result = await sendWhatsApp(phone.replace(/\D/g, ''), mensagem);
        if (result.ok) {
          canalEnvio = 'whatsapp';
          enviado = true;
          sentWhatsApp += 1;
        } else if (result.reason) {
          errors.push(`appt ${appt.id}: ${result.reason}`);
        }
      } catch (err) {
        errors.push(`appt ${appt.id}: whatsapp_exception`);
      }
    }

    if (!enviado && email) {
      try {
        await sendEmail({
          to: email,
          subject: 'Lembrete do seu horário na Navalha & Tinta',
          html: `<p>${mensagem}</p>`,
        });
        canalEnvio = 'email';
        enviado = true;
        sentEmail += 1;
      } catch {
        errors.push(`appt ${appt.id}: email_exception`);
      }
    }

    await prisma.notification.create({
      data: {
        titulo: 'Lembrete de agendamento',
        mensagem,
        tipoNotificacao: 'lembrete',
        canalEnvio,
        dataEnvio: enviado ? new Date() : null,
        destinatarioEmail: email ?? null,
        userId: appt.client?.id ?? null,
        appointmentId: appt.id,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    scanned: appointments.length,
    sentWhatsApp,
    sentEmail,
    skipped,
    errors: errors.slice(0, 10),
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/cron/reminders/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
