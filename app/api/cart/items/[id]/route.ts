import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CART_COOKIE = "cart_session";

async function getSessionId() {
  const store = cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const sessaoCarrinho = await getSessionId();
  if (!sessaoCarrinho) {
    return NextResponse.json(
      { error: "Sessão de carrinho não encontrada" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const quantidade = Number(body?.quantidade);
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    return NextResponse.json(
      { error: "Quantidade inválida" },
      { status: 400 }
    );
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: params.id },
    include: { product: true },
  });

  if (!item || item.sessaoCarrinho !== sessaoCarrinho) {
    return NextResponse.json(
      { error: "Item não encontrado" },
      { status: 404 }
    );
  }

  if (quantidade > item.product.estoqueDisponivel) {
    return NextResponse.json(
      { error: "Quantidade acima do estoque disponível" },
      { status: 400 }
    );
  }

  const precoUnitario = Number(item.precoUnitario);
  const subtotal = precoUnitario * quantidade;

  const atualizado = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantidade, subtotal },
  });

  return NextResponse.json({
    id: atualizado.id,
    quantidade: atualizado.quantidade,
    subtotal: Number(atualizado.subtotal),
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/cart/items/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const sessaoCarrinho = await getSessionId();
  if (!sessaoCarrinho) {
    return NextResponse.json(
      { error: "Sessão de carrinho não encontrada" },
      { status: 401 }
    );
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: params.id },
  });

  if (!item || item.sessaoCarrinho !== sessaoCarrinho) {
    return NextResponse.json(
      { error: "Item não encontrado" },
      { status: 404 }
    );
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/cart/items/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
