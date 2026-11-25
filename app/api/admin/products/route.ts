import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function guard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  if (session.user.role !== 'admin' && session.user.role !== 'barber') {
    return { error: NextResponse.json({ error: 'Sem permissão' }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  try {
  const g = await guard();
  if (g.error) return g.error;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, nomeCategoria: true } } },
  });
  return NextResponse.json({ products });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/products/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function POST(request: Request) {
  try {
  const g = await guard();
  if (g.error) return g.error;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const nomeProduto = typeof body?.nomeProduto === 'string' ? body.nomeProduto.trim() : '';
  const precoVenda = Number(body?.precoVenda);
  if (!nomeProduto) return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });
  if (!Number.isFinite(precoVenda) || precoVenda <= 0) {
    return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
  }

  const estoque = Number.isFinite(Number(body?.estoqueDisponivel)) ? Math.max(0, Math.trunc(Number(body.estoqueDisponivel))) : 0;

  try {
    const product = await prisma.product.create({
      data: {
        nomeProduto,
        descricao: typeof body?.descricao === 'string' && body.descricao.trim() ? body.descricao.trim() : null,
        precoVenda,
        estoqueDisponivel: estoque,
        marca: typeof body?.marca === 'string' && body.marca.trim() ? body.marca.trim() : null,
        imagemPrincipal: typeof body?.imagemPrincipal === 'string' && body.imagemPrincipal ? body.imagemPrincipal : null,
        categoryId: typeof body?.categoryId === 'string' && body.categoryId ? body.categoryId : null,
        ativo: body?.ativo === false ? false : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        acaoRealizada: 'product.create',
        entidadeAfetada: `Product:${product.id}`,
        usuarioResponsavel: g.session!.user.email ?? g.session!.user.id,
        detalhesEvento: `Produto "${product.nomeProduto}" criado`,
        userId: g.session!.user.id,
        nivelCriticidade: 'info',
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[admin/products POST]', err);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/products/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
