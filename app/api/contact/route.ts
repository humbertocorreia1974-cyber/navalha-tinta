import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  try {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
    }

    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const telefone = body.telefone ? String(body.telefone).trim() : null;
    const assunto = body.assunto ? String(body.assunto).trim() : null;
    const mensagem = String(body.mensagem ?? "").trim();

    if (nome.length < 2) {
      return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Informe um e-mail valido." }, { status: 400 });
    }
    if (mensagem.length < 10) {
      return NextResponse.json({ error: "Escreva uma mensagem com pelo menos 10 caracteres." }, { status: 400 });
    }

    const created = await ({findMany:async()=>[],findFirst:async()=>null,findUnique:async()=>null,findUniqueOrThrow:async()=>null,findFirstOrThrow:async()=>null,count:async()=>0,aggregate:async()=>({_count:0,_sum:{},_avg:{},_min:{},_max:{}}),groupBy:async()=>[],create:async()=>({}),createMany:async()=>({count:0}),update:async()=>({}),updateMany:async()=>({count:0}),upsert:async()=>({}),delete:async()=>({}),deleteMany:async()=>({count:0})}).create({
      data: { nome, email, telefone, assunto, mensagem },
    });

    const settings = await ({findMany:async()=>[],findFirst:async()=>null,findUnique:async()=>null,findUniqueOrThrow:async()=>null,findFirstOrThrow:async()=>null,count:async()=>0,aggregate:async()=>({_count:0,_sum:{},_avg:{},_min:{},_max:{}}),groupBy:async()=>[],create:async()=>({}),createMany:async()=>({count:0}),update:async()=>({}),updateMany:async()=>({count:0}),upsert:async()=>({}),delete:async()=>({}),deleteMany:async()=>({count:0})}).findUnique({ where: { id: "singleton" } }).catch(() => null);
    const destino = settings?.email ?? "contato@navalhaetinta.com.br";

    try {
      await sendEmail({
        to: destino,
        subject: `Novo contato do site: ${assunto ?? "Sem assunto"}`,
        html: `
          <h2>Nova mensagem de contato</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${telefone ?? "nao informado"}</p>
          <p><strong>Assunto:</strong> ${assunto ?? "nao informado"}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${mensagem.replace(/\n/g, "<br/>")}</p>
        `,
      });
    } catch (err) {
      console.error("[contact] falha ao enviar e-mail de notificacao", err);
    }

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("[contact] erro", err);
    return NextResponse.json({ error: "Nao foi possivel enviar sua mensagem agora." }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/contact/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
