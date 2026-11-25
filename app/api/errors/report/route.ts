import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.slice(0, 500) : "Erro desconhecido";
    const digest = typeof body?.digest === "string" ? body.digest.slice(0, 100) : null;
    const path = typeof body?.path === "string" ? body.path.slice(0, 300) : null;
    const userAgent = typeof body?.userAgent === "string" ? body.userAgent.slice(0, 300) : null;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    const usuarioResponsavel = session?.user?.email ?? "anonimo";

    const detalhes = JSON.stringify({
      message,
      digest,
      path,
      userAgent,
    }).slice(0, 2000);

    await prisma.auditLog.create({
      data: {
        acaoRealizada: "erro_global_capturado",
        entidadeAfetada: "GlobalErrorBoundary",
        usuarioResponsavel,
        detalhesEvento: detalhes,
        nivelCriticidade: "critical",
        userId: userId ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Nunca falhar o report: se o banco estiver fora, apenas retorna ok
    return NextResponse.json({ ok: true });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/errors/report/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
