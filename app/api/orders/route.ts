import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function gerarNumeroPedido() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NT-${ts}-${rand}`;
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const {
    nomeCliente,
    emailCliente,
    telefoneCliente,
    metodoPagamento,
    enderecoEntrega,
    cupom,
  } = body as {
    nomeCliente?: string;
    emailCliente?: string;
    telefoneCliente?: string;
    metodoPagamento?: string;
    enderecoEntrega?: string;
    cupom?: string;
  };

  if (!nomeCliente || !emailCliente || !telefoneCliente || !metodoPagamento) {
    return NextResponse.json(
      { error: 'Preencha nome, e-mail, telefone e forma de pagamento.' },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const sessaoCarrinho = cookieStore.get('sessaoCarrinho')?.value ?? '';
  if (!sessaoCarrinho) {
    return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
  }

  const itens = await prisma.cartItem.findMany({
    where: { sessaoCarrinho, orderId: null },
    include: { product: true },
  });
  if (itens.length === 0) {
    return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
  }

  for (const item of itens) {
    if (item.product.estoqueDisponivel < item.quantidade) {
      return NextResponse.json(
        { error: `Estoque insuficiente para ${item.product.nomeProduto}.` },
        { status: 400 }
      );
    }
  }

  const subtotal = itens.reduce((acc, i) => acc + Number(i.subtotal), 0);

  let cupomId: string | null = null;
  let desconto = 0;
  if (cupom) {
    const c = await prisma.coupon.findUnique({
      where: { codigoCupom: cupom.toUpperCase() },
    });
    if (c && c.ativo && c.dataValidade > new Date()) {
      cupomId = c.id;
      desconto =
        c.tipoDesconto === 'percentual'
          ? (subtotal * Number(c.valorDesconto)) / 100
          : Number(c.valorDesconto);
      desconto = Math.min(desconto, subtotal);
    }
  }

  const valorTotal = Math.max(0, subtotal - desconto);
  const numeroPedido = gerarNumeroPedido();

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          numeroPedido,
          nomeCliente,
          emailCliente,
          telefoneCliente,
          enderecoEntrega: enderecoEntrega ?? null,
          valorTotal,
          statusPedido: 'pendente',
          userId: session?.user?.id ?? null,
          couponId: cupomId,
          items: {
            create: itens.map((i) => ({
              nomeProdutoSnapshot: i.product.nomeProduto,
              quantidade: i.quantidade,
              precoUnitario: i.precoUnitario,
              subtotal: i.subtotal,
              productId: i.productId,
            })),
          },
        },
      });

      await tx.cartItem.updateMany({
        where: { id: { in: itens.map((i) => i.id) } },
        data: { orderId: order.id },
      });

      for (const item of itens) {
        await tx.product.update({
          where: { id: item.productId },
          data: { estoqueDisponivel: { decrement: item.quantidade } },
        });
      }

      await tx.payment.create({
        data: {
          valorPago: valorTotal,
          metodoPagamento,
          statusPagamento: 'pendente',
          orderId: order.id,
        },
      });

      if (cupomId) {
        await tx.coupon.update({
          where: { id: cupomId },
          data: { quantidadeUsos: { increment: 1 } },
        });
      }

      if (session?.user?.id) {
        await tx.notification.create({
          data: {
            titulo: 'Pedido recebido',
            mensagem: `Seu pedido ${numeroPedido} foi registrado e está aguardando pagamento.`,
            tipoNotificacao: 'sistema',
            canalEnvio: 'app',
            userId: session.user.id,
            orderId: order.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          acaoRealizada: 'criar_pedido',
          entidadeAfetada: 'Order',
          usuarioResponsavel: session?.user?.email ?? emailCliente,
          detalhesEvento: `Pedido ${numeroPedido} criado com valor ${valorTotal.toFixed(2)}`,
          userId: session?.user?.id ?? null,
          orderId: order.id,
        },
      });

      return order;
    });

    try {
      await sendEmail({
        to: emailCliente,
        subject: `Pedido ${numeroPedido} confirmado - Navalha & Tinta`,
        html: `<h1>Pedido recebido</h1><p>Olá ${nomeCliente}, seu pedido <strong>${numeroPedido}</strong> foi registrado com sucesso.</p><p>Valor total: R$ ${valorTotal.toFixed(2)}</p><p>Forma de pagamento: ${metodoPagamento}</p><p>Você receberá novas atualizações por e-mail.</p><p>Navalha & Tinta - Tradição no corte, ousadia no estilo.</p>`,
      });
    } catch {
      // Falha de e-mail não bloqueia o pedido
    }

    return NextResponse.json({
      id: pedido.id,
      numeroPedido: pedido.numeroPedido,
      valorTotal,
    });
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    return NextResponse.json(
      { error: 'Não foi possível criar o pedido. Tente novamente.' },
      { status: 500 }
    );
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/orders/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
