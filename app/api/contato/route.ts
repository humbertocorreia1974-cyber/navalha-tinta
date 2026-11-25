import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

type Body = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: 'Informe seu nome (2 a 120 caracteres).' }, { status: 400 });
  }
  if (!isEmail(email) || email.length > 160) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json({ error: 'A mensagem precisa ter entre 10 e 2000 caracteres.' }, { status: 400 });
  }

  try {
    await prisma.lead.create({
      data: { name, email, message },
    });
  } catch {
    return NextResponse.json({ error: 'Não foi possível salvar sua mensagem. Tente novamente.' }, { status: 500 });
  }

  // Notificação opcional por e-mail. Falha aqui não bloqueia o contato.
  try {
    await sendEmail({
      to: 'contato@navalhaetinta.com.br',
      subject: `Novo contato pelo site: ${name}`,
      html: `<p><strong>Nome:</strong> ${name}</p><p><strong>E-mail:</strong> ${email}</p><p><strong>Mensagem:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
    });
  } catch {
    // silencioso: contato já foi persistido
  }

  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/contato/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
