import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria')?.trim() || '';
  const q = searchParams.get('q')?.trim() || '';

  try {
    const produtos = await prisma.product.findMany({
      where: {
        ativo: true,
        ...(categoria ? { category: { slug: categoria } } : {}),
        ...(q
          ? {
              OR: [
                { nomeProduto: { contains: q, mode: 'insensitive' } },
                { descricao: { contains: q, mode: 'insensitive' } },
                { marca: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        category: { select: { nomeCategoria: true, slug: true } },
      },
    });

    return NextResponse.json({ products: produtos });
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json(
      { error: 'Não foi possível carregar os produtos.' },
      { status: 500 },
    );
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/products/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
