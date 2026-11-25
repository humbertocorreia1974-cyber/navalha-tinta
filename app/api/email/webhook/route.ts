import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// A Resend assina o webhook de e-mail recebido no padrão Svix (mesmo usado
// por vários provedores de webhook) - svix-id + svix-timestamp + corpo bruto,
// HMAC-SHA256 com o secret 'whsec_...' gerado no painel da Resend.
function isValidSignature(rawBody: string, svixId: string | null, svixTimestamp: string | null, svixSignature: string | null): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !svixId || !svixTimestamp || !svixSignature) return false;
  try {
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
    return svixSignature.split(' ').some((part) => {
      const [, sig] = part.split(',');
      if (!sig) return false;
      try {
        return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

async function sendReplyEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'no-reply@example.com';
  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY ausente - nao e possivel responder por e-mail.');
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) console.error('[Email] Resend (envio da resposta) falhou:', await res.text());
}

// Webhook de e-mail recebido (Resend Inbound) - a Resend chama esta rota via
// POST a cada e-mail recebido no domínio/subdomínio configurado. Encaminha
// pro cérebro unificado da JGNEXT (AssistantEngine, mesmo endpoint que os
// outros canais usam) e responde de volta no mesmo e-mail.
export async function POST(request: Request) {
  try {
  const rawBody = await request.text();
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!isValidSignature(rawBody, svixId, svixTimestamp, svixSignature)) {
    console.error('[Email] Assinatura inválida - requisição rejeitada (não veio da Resend).');
    return NextResponse.json({ received: true });
  }

  try {
    const payload = JSON.parse(rawBody);
    const data = payload?.data || payload;
    const from: string | undefined = data?.from?.address || (typeof data?.from === 'string' ? data.from : undefined);
    const subject: string = data?.subject || '(sem assunto)';
    const text: string | undefined = data?.text || (typeof data?.html === 'string' ? data.html.replace(/<[^>]+>/g, ' ') : undefined);

    if (!from || !text) {
      return NextResponse.json({ received: true });
    }

    const apiBase = process.env.JGNEXT_API_BASE_URL;
    const jgToken = process.env.JGNEXT_CHATBOT_TOKEN;
    if (!apiBase || !jgToken) {
      console.error('[Email] JGNEXT_API_BASE_URL/JGNEXT_CHATBOT_TOKEN ausentes - nao e possivel responder.');
      return NextResponse.json({ received: true });
    }

    const response = await fetch(`${apiBase}/api/v1/embedded-chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jgToken}` },
      body: JSON.stringify({ message: text, channel: 'email' })
    });
    const result = await response.json();

    if (result?.reply) {
      const safeSubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
      await sendReplyEmail(from, safeSubject, String(result.reply).replace(/\n/g, '<br/>'));
    } else {
      console.error('[Email] Resposta sem reply do AssistantEngine:', result);
    }
  } catch (err) {
    console.error('[Email] Erro ao processar e-mail recebido:', err);
  }

  // A Resend espera 200 rápido, mesmo se algo falhar acima.
  return NextResponse.json({ received: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/email/webhook/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
