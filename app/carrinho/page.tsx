import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { CartItemRow } from "./cart-item-row";
import { CartSummary } from "./cart-summary";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrinho | Navalha & Tinta",
  description:
    "Revise os produtos do seu carrinho na Navalha & Tinta e finalize seu pedido com entrega ou retirada na barbearia.",
  openGraph: {
    title: "Carrinho | Navalha & Tinta",
    description:
      "Revise os produtos do seu carrinho e finalize seu pedido na Navalha & Tinta.",
    type: "website",
  },
};

const CART_COOKIE = "cart_session";

async function getOrReadSessionId(): Promise<string> {
  const store = cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  return "anon";
}

export default async function CarrinhoPage() {
  const sessaoCarrinho = await getOrReadSessionId();

  const items = await prisma.cartItem.findMany({
    where: { sessaoCarrinho, orderId: null },
    include: {
      product: {
        select: {
          id: true,
          nomeProduto: true,
          imagemPrincipal: true,
          marca: true,
          estoqueDisponivel: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const subtotal = items.reduce(
    (acc, it) => acc + Number(it.subtotal),
    0
  );
  const totalItens = items.reduce((acc, it) => acc + it.quantidade, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Sua sacola
          </p>
          <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">
            Carrinho
          </h1>
          <p className="max-w-2xl text-fg-muted">
            Revise os itens antes de finalizar. Pomadas, óleos e cuidados
            selecionados pela Navalha & Tinta.
          </p>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <Reveal variant="up" delay={80}>
          <Card className="border border-border">
            <CardBody className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </div>
              <CardTitle>Seu carrinho está vazio</CardTitle>
              <p className="max-w-md text-sm text-fg-muted">
                Explore o catálogo e adicione produtos para cuidar do visual
                entre um corte e outro.
              </p>
              <Link href="/catalogo">
                <Button variant="primary" size="md">
                  Ver catálogo
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Reveal>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <Reveal variant="up" delay={80}>
            <div className="space-y-3">
              {items.map((item, i) => (
                <CartItemRow
                  key={item.id}
                  id={item.id}
                  nome={item.product.nomeProduto}
                  marca={item.product.marca}
                  imagem={item.product.imagemPrincipal}
                  quantidade={item.quantidade}
                  precoUnitario={Number(item.precoUnitario)}
                  subtotal={Number(item.subtotal)}
                  estoque={item.product.estoqueDisponivel}
                  delay={i * 60}
                />
              ))}
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <CartSummary
              subtotal={subtotal}
              totalItens={totalItens}
              sessaoCarrinho={sessaoCarrinho}
            />
          </Reveal>
        </div>
      )}
    </main>
  );
}
