import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({ where: { id: params.id } });
  if (!sub) return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 404 });
  if (sub.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  if (sub.statusAssinatura !== "ativa") {
    return NextResponse.json({ error: "Somente assinaturas ativas podem ser pausadas." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const motivo = typeof body?.motivo === "string" ? body.motivo.slice(0, 200) : null;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: sub.id },
      data: { statusAssinatura: "pausada" },
    }),
    prisma.pauseRecord.create({
      data: {
        subscriptionId: sub.id,
        userId: sub.userId,
        dataInicio: new Date(),
        motivo,
      },
    }),
    prisma.auditLog.create({
      data: {
        acaoRealizada: "subscription.pause",
        entidadeAfetada: "Subscription",
        usuarioResponsavel: session.user.email ?? session.user.id,
        detalhesEvento: `Assinatura ${sub.id} pausada`,
        subscriptionId: sub.id,
        userId: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, status: "pausada" });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/subscriptions/[id]/pause/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
