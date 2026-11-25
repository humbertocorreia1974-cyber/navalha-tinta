import Link from 'next/link';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import CheckoutForm from './checkout-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Checkout | Navalha & Tinta',
  description: 'Finalize seu pedido na Navalha & Tinta com entrega e pagamento seguros.',
  openGraph: {
    title: 'Checkout | Navalha & Tinta',
    description: 'Finalize seu pedido na Navalha & Tinta com entrega e pagamento seguros.',
  },
};

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { cupom?: string };
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const sessaoCarrinho = cookieStore.get('sessaoCarrinho')?.value ?? '';

  const itens = sessaoCarrinho
    ? await prisma.cartItem.findMany({
        where: { sessaoCarrinho, orderId: null },
        include: { product: true },
        orderBy: { createdAt: 'asc' },
      })
    : [];

  const subtotal = itens.reduce((acc, i) => acc + Number(i.subtotal), 0);

  let cupomAplicado: { codigo: string; desconto: number } | null = null;
  if (searchParams.cupom) {
    const cupom = await prisma.coupon.findUnique({
      where: { codigoCupom: searchParams.cupom.toUpperCase() },
    });
    if (cupom && cupom.ativo && cupom.dataValidade > new Date()) {
      const desconto =
        cupom.tipoDesconto === 'percentual'
          ? (subtotal * Number(cupom.valorDesconto)) / 100
          : Number(cupom.valorDesconto);
      cupomAplicado = {
        codigo: cupom.codigoCupom,
        desconto: Math.min(desconto, subtotal),
      };
    }
  }

  const total = Math.max(0, subtotal - (cupomAplicado?.desconto ?? 0));

  const enderecoPrincipal = session?.user?.id
    ? await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: [{ principal: 'desc' }, { createdAt: 'desc' }],
      })
    : null;

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <Reveal variant="up">
          <Card>
            <CardBody className="text-center py-16">
              <h1 className="font-display text-3xl text-fg mb-3">
                Seu carrinho está vazio
              </h1>
              <p className="text-fg-muted mb-6">
                Adicione produtos do catálogo para finalizar um pedido.
              </p>
              <Link href="/catalogo">
                <Button variant="primary" size="lg">
                  Ver catálogo
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Reveal variant="up">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-brand mb-2">
            Finalizar pedido
          </p>
          <h1 className="font-display text-4xl text-fg">Checkout</h1>
          <p className="text-fg-muted mt-2">
            Confirme seus dados de entrega e pagamento para concluir.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Reveal variant="left">
          <CheckoutForm
            enderecoPrincipal={
              enderecoPrincipal
                ? {
                    cep: enderecoPrincipal.cep,
                    logradouro: enderecoPrincipal.logradouro,
                    numero: enderecoPrincipal.numero,
                    complemento: enderecoPrincipal.complemento ?? '',
                    bairro: enderecoPrincipal.bairro,
                    cidade: enderecoPrincipal.cidade,
                    estado: enderecoPrincipal.estado,
                  }
                : null
            }
            cupom={cupomAplicado?.codigo ?? ''}
            logado={Boolean(session?.user?.id)}
            nomeInicial={session?.user?.name ?? ''}
            emailInicial={session?.user?.email ?? ''}
          />
        </Reveal>

        <Reveal variant="right" delay={120}>
          <Card className="sticky top-24">
            <CardBody>
              <CardTitle className="mb-4">Resumo do pedido</CardTitle>
              <ul className="space-y-3 mb-4">
                {itens.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="text-fg font-medium">
                        {item.product.nomeProduto}
                      </p>
                      <p className="text-fg-muted text-xs">
                        {item.quantidade} x {brl(Number(item.precoUnitario))}
                      </p>
                    </div>
                    <span className="text-fg">{brl(Number(item.subtotal))}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-fg-muted">
                  <span>Subtotal</span>
                  <span>{brl(subtotal)}</span>
                </div>
                {cupomAplicado && (
                  <div className="flex justify-between text-brand">
                    <span>Cupom {cupomAplicado.codigo}</span>
                    <span>-{brl(cupomAplicado.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-fg font-semibold text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{brl(total)}</span>
                </div>
              </div>

              <form
                action="/checkout"
                method="get"
                className="mt-4 flex gap-2"
              >
                <input
                  name="cupom"
                  placeholder="Cupom de desconto"
                  defaultValue={cupomAplicado?.codigo ?? ''}
                  className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Aplicar
                </Button>
              </form>
            </CardBody>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
