import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Verificação ÚNICA feita pela Meta na hora de configurar o webhook (GET com
// hub.mode/hub.verify_token/hub.challenge) - confirma que o dono da conta
// controla esta URL antes da Meta começar a mandar eventos de verdade.
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
        file: "app/api/social/webhook/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

// Toda mensagem que a Meta encaminha vem ASSINADA com o App Secret
// (header x-hub-signature-256) - sem checar isso, qualquer um poderia mandar
// POST direto pra esta URL se passando por um cliente real (gastando
// créditos de IA e até criando agendamentos falsos). Comparação em tempo
// constante (timingSafeEqual) - não usar === normal em comparação de hash.
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

// Webhook do Instagram/Facebook - a Meta chama esta rota via POST a cada
// mensagem direta recebida. Encaminha pro cérebro unificado da JGNEXT
// (AssistantEngine, via o mesmo endpoint que os outros canais usam) e
// responde de volta na mesma conversa via Graph API.
export async function POST(request: Request) {
  try {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!isValidSignature(rawBody, signature)) {
    console.error('[Social] Assinatura inválida - requisição rejeitada (não veio da Meta).');
    return NextResponse.json({ received: true }); // 200 mesmo assim: a Meta desativa o webhook após falhas repetidas de status
  }

  try {
    const body = JSON.parse(rawBody);
    const channel = body.object === 'instagram' ? 'instagram' : 'facebook';

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        if (event.message?.is_echo) continue; // ignora eco da própria mensagem que o app acabou de enviar
        const senderId = event.sender?.id;
        const text = event.message?.text;
        if (!senderId || !text) continue;

        const apiBase = process.env.JGNEXT_API_BASE_URL;
        const jgToken = process.env.JGNEXT_CHATBOT_TOKEN;
        if (!apiBase || !jgToken) {
          console.error('[Social] JGNEXT_API_BASE_URL/JGNEXT_CHATBOT_TOKEN ausentes - nao e possivel responder.');
          continue;
        }

        const response = await fetch(`${apiBase}/api/v1/embedded-chatbot/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jgToken}` },
          body: JSON.stringify({ message: text, channel })
        });
        const data = await response.json();

        if (data?.reply && process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
          await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient: { id: senderId }, message: { text: data.reply } })
          });
        } else if (!data?.reply) {
          console.error('[Social] Resposta sem reply do AssistantEngine:', data);
        }
      }
    }
  } catch (err) {
    console.error('[Social] Erro ao processar mensagem recebida:', err);
  }

  // A Meta espera 200 rápido, mesmo se algo falhar acima - senão reenvia o
  // mesmo evento em loop.
  return NextResponse.json({ received: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/social/webhook/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
