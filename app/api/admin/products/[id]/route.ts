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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
  const g = await guard();
  if (g.error) return g.error;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body?.nomeProduto === 'string' && body.nomeProduto.trim()) data.nomeProduto = body.nomeProduto.trim();
  if (typeof body?.descricao === 'string') data.descricao = body.descricao.trim() || null;
  if (body?.precoVenda !== undefined) {
    const p = Number(body.precoVenda);
    if (!Number.isFinite(p) || p <= 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    data.precoVenda = p;
  }
  if (body?.estoqueDisponivel !== undefined) {
    const e = Number(body.estoqueDisponivel);
    if (!Number.isFinite(e) || e < 0) return NextResponse.json({ error: 'Estoque inválido' }, { status: 400 });
    data.estoqueDisponivel = Math.trunc(e);
  }
  if (typeof body?.marca === 'string') data.marca = body.marca.trim() || null;
  if (typeof body?.imagemPrincipal === 'string') data.imagemPrincipal = body.imagemPrincipal || null;
  if (typeof body?.categoryId === 'string') data.categoryId = body.categoryId || null;
  if (typeof body?.ativo === 'boolean') data.ativo = body.ativo;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({ where: { id: params.id }, data });
    await prisma.auditLog.create({
      data: {
        acaoRealizada: 'product.update',
        entidadeAfetada: `Product:${product.id}`,
        usuarioResponsavel: g.session!.user.email ?? g.session!.user.id,
        detalhesEvento: `Campos atualizados: ${Object.keys(data).join(', ')}`,
        userId: g.session!.user.id,
        nivelCriticidade: 'info',
      },
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error('[admin/products PATCH]', err);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/products/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
  const g = await guard();
  if (g.error) return g.error;

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });

  try {
    const refs = await prisma.orderItem.count({ where: { productId: params.id } });
    if (refs > 0) {
      const product = await prisma.product.update({
        where: { id: params.id },
        data: { ativo: false },
      });
      await prisma.auditLog.create({
        data: {
          acaoRealizada: 'product.deactivate',
          entidadeAfetada: `Product:${product.id}`,
          usuarioResponsavel: g.session!.user.email ?? g.session!.user.id,
          detalhesEvento: 'Produto desativado (possui pedidos vinculados)',
          userId: g.session!.user.id,
          nivelCriticidade: 'warning',
        },
      });
      return NextResponse.json({ product, deactivated: true });
    }

    await prisma.product.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      data: {
        acaoRealizada: 'product.delete',
        entidadeAfetada: `Product:${params.id}`,
        usuarioResponsavel: g.session!.user.email ?? g.session!.user.id,
        detalhesEvento: `Produto "${existing.nomeProduto}" removido`,
        userId: g.session!.user.id,
        nivelCriticidade: 'warning',
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/products DELETE]', err);
    return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/products/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
