import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const plans = await prisma.subscriptionPlan.findMany({
    where: { ativo: true },
    orderBy: [{ destaque: 'desc' }, { precoMensal: 'asc' }],
  });

  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      nomePlano: p.nomePlano,
      descricao: p.descricao,
      precoMensal: Number(p.precoMensal),
      quantidadeServicosMes: p.quantidadeServicosMes,
      descontoProdutos: p.descontoProdutos != null ? Number(p.descontoProdutos) : null,
      destaque: p.destaque,
    })),
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/plans/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
