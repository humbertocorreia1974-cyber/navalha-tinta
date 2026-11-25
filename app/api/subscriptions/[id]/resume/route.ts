import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
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
  if (sub.statusAssinatura !== "pausada") {
    return NextResponse.json({ error: "Somente assinaturas pausadas podem ser retomadas." }, { status: 400 });
  }

  const openPause = await prisma.pauseRecord.findFirst({
    where: { subscriptionId: sub.id, dataFim: null },
    orderBy: { createdAt: "desc" },
  });

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: sub.id },
      data: { statusAssinatura: "ativa" },
    }),
    ...(openPause
      ? [
          prisma.pauseRecord.update({
            where: { id: openPause.id },
            data: { dataFim: new Date() },
          }),
        ]
      : []),
    prisma.auditLog.create({
      data: {
        acaoRealizada: "subscription.resume",
        entidadeAfetada: "Subscription",
        usuarioResponsavel: session.user.email ?? session.user.id,
        detalhesEvento: `Assinatura ${sub.id} retomada`,
        subscriptionId: sub.id,
        userId: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, status: "ativa" });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/subscriptions/[id]/resume/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
