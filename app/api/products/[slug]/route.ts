import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const product = await prisma.product.findFirst({
    where: { OR: [{ id: params.slug }], ativo: true },
    include: { category: true },
  });
  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  }
  return NextResponse.json({
    id: product.id,
    nomeProduto: product.nomeProduto,
    descricao: product.descricao,
    precoVenda: Number(product.precoVenda),
    estoqueDisponivel: product.estoqueDisponivel,
    marca: product.marca,
    imagemPrincipal: product.imagemPrincipal,
    categoria: product.category
      ? { id: product.category.id, nome: product.category.nomeCategoria, slug: product.category.slug }
      : null,
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/products/[slug]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
