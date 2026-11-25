import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Webhook do Telegram - o Bot API chama esta rota via POST a cada mensagem
// recebida (configurado uma vez via setWebhook, ver TELEGRAM_SETUP.md).
// Encaminha pro cerebro unificado da JGNEXT (AssistantEngine, via o mesmo
// endpoint que o chatbot embutido e o WhatsApp Baileys usam) e responde de
// volta no mesmo chat.
export async function POST(request: Request) {
  try {
  try {
    const update = await request.json();
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text;

    if (!chatId || !text) {
      return NextResponse.json({ ok: true }); // update sem texto (foto, sticker, etc) - ignora
    }

    const apiBase = process.env.JGNEXT_API_BASE_URL;
    const token = process.env.JGNEXT_CHATBOT_TOKEN;
    if (!apiBase || !token) {
      console.error('[Telegram] JGNEXT_API_BASE_URL/JGNEXT_CHATBOT_TOKEN ausentes - nao e possivel responder.');
      return NextResponse.json({ ok: true });
    }

    const response = await fetch(`${apiBase}/api/v1/embedded-chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: text, channel: 'telegram' })
    });
    const data = await response.json();

    if (data?.reply && process.env.TELEGRAM_BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: data.reply })
      });
    } else if (!data?.reply) {
      console.error('[Telegram] Resposta sem reply do AssistantEngine:', data);
    }
  } catch (err) {
    console.error('[Telegram] Erro ao processar mensagem recebida:', err);
  }

  // Telegram espera 200 rapido, mesmo se algo falhar acima - senao ele
  // reenvia o mesmo update em loop.
  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/telegram/webhook/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
