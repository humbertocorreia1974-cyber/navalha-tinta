import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CART_COOKIE = 'sessaoCarrinho';

function getOrCreateCartSession(): string {
  const store = cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}

export async function POST(request: Request) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, quantidade, precoUnitario } = body ?? {};

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'productId é obrigatório.' }, { status: 400 });
    }
    const qty = Number(quantidade);
    if (!Number.isFinite(qty) || qty < 1) {
      return NextResponse.json({ error: 'Quantidade inválida.' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, ativo: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }
    if (product.estoqueDisponivel < qty) {
      return NextResponse.json(
        { error: 'Estoque insuficiente para a quantidade solicitada.' },
        { status: 409 }
      );
    }

    const preco = Number(precoUnitario ?? product.precoVenda);
    const sessao = getOrCreateCartSession();

    const existing = await prisma.cartItem.findFirst({
      where: { sessaoCarrinho: sessao, productId, orderId: null },
    });

    let item;
    if (existing) {
      const novaQtd = existing.quantidade + qty;
      if (novaQtd > product.estoqueDisponivel) {
        return NextResponse.json(
          { error: 'Quantidade total excede o estoque disponível.' },
          { status: 409 }
        );
      }
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantidade: novaQtd,
          precoUnitario: preco,
          subtotal: preco * novaQtd,
        },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          quantidade: qty,
          precoUnitario: preco,
          subtotal: preco * qty,
          sessaoCarrinho: sessao,
          productId,
        },
      });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error('[cart/items POST]', err);
    return NextResponse.json({ error: 'Erro ao adicionar item ao carrinho.' }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/cart/items/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
