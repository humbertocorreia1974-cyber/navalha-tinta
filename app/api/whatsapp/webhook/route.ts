import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Verificação ÚNICA feita pela Meta ao configurar o webhook (GET com
// hub.mode/hub.verify_token/hub.challenge) - mesmo verify token usado pelo
// webhook de Instagram/Facebook (um único App da Meta pode hospedar os 3).
export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/whatsapp/webhook/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

// Toda mensagem que a Meta encaminha vem ASSINADA com o App Secret (header
// x-hub-signature-256) - sem checar isso, qualquer um poderia mandar POST
// direto pra esta URL se passando por um cliente real.
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

// Webhook oficial do WhatsApp Cloud API (Meta) - a Meta chama esta rota via
// POST a cada mensagem recebida no número comercial do cliente. Encaminha
// pro cérebro unificado da JGNEXT (AssistantEngine, mesmo endpoint que o
// chatbot embutido/Telegram/Instagram/Facebook usam) e responde de volta no
// mesmo número via Cloud API.
export async function POST(request: Request) {
  try {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!isValidSignature(rawBody, signature)) {
    console.error('[WhatsApp Meta] Assinatura inválida - requisição rejeitada (não veio da Meta).');
    return NextResponse.json({ received: true });
  }

  try {
    const body = JSON.parse(rawBody);

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        for (const message of change.value?.messages || []) {
          if (message.type !== 'text') continue;
          const from = message.from;
          const text = message.text?.body;
          if (!from || !text) continue;

          const apiBase = process.env.JGNEXT_API_BASE_URL;
          const jgToken = process.env.JGNEXT_CHATBOT_TOKEN;
          if (!apiBase || !jgToken) {
            console.error('[WhatsApp Meta] JGNEXT_API_BASE_URL/JGNEXT_CHATBOT_TOKEN ausentes - nao e possivel responder.');
            continue;
          }

          const response = await fetch(`${apiBase}/api/v1/embedded-chatbot/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jgToken}` },
            body: JSON.stringify({ message: text, channel: 'whatsapp_meta' })
          });
          const data = await response.json();

          if (data?.reply && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
            await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
              body: JSON.stringify({ messaging_product: 'whatsapp', to: from, type: 'text', text: { body: data.reply } })
            });
          } else if (!data?.reply) {
            console.error('[WhatsApp Meta] Resposta sem reply do AssistantEngine:', data);
          }
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp Meta] Erro ao processar mensagem recebida:', err);
  }

  return NextResponse.json({ received: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/whatsapp/webhook/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
