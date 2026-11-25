import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardBody } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { AddToCart } from './add-to-cart';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { id: slug, ativo: true },
    include: { category: true },
  });
  return product;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return { title: 'Produto não encontrado | Navalha & Tinta' };
  }
  const title = `${product.nomeProduto} | Navalha & Tinta`;
  const description =
    product.descricao?.slice(0, 155) ??
    `Compre ${product.nomeProduto} na Navalha & Tinta. Tradição no corte, ousadia no estilo.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imagemPrincipal ? [product.imagemPrincipal] : undefined,
      type: 'website',
    },
  };
}

export default async function ProdutoDetalhePage({ params }: { params: Params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const relacionados = await prisma.product.findMany({
    where: {
      ativo: true,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  const preco = Number(product.precoVenda);
  const precoFmt = preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esgotado = product.estoqueDisponivel <= 0;

  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-fg-muted">
          <Link href="/catalogo" className="hover:text-brand transition-colors">
            Catálogo
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <span>{product.category.nomeCategoria}</span>
              <span>/</span>
            </>
          )}
          <span className="text-fg">{product.nomeProduto}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal variant="left">
            <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
              {product.imagemPrincipal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imagemPrincipal}
                  alt={product.nomeProduto}
                  className="img-zoom aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-surface text-fg-muted">
                  Sem imagem
                </div>
              )}
              {esgotado && (
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-fg">
                  Esgotado
                </span>
              )}
            </div>
          </Reveal>

          <Reveal variant="right" delay={80}>
            <div className="flex flex-col gap-5">
              {product.marca && (
                <span className="text-xs uppercase tracking-widest text-fg-muted">
                  {product.marca}
                </span>
              )}
              <h1 className="font-display text-4xl font-bold leading-tight text-fg">
                {product.nomeProduto}
              </h1>
              <p className="text-3xl font-semibold text-brand">{precoFmt}</p>

              {product.descricao && (
                <p className="text-fg-muted leading-relaxed">{product.descricao}</p>
              )}

              <div className="flex items-center gap-3 text-sm text-fg-muted">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    esgotado
                      ? 'bg-accent/10 text-accent'
                      : 'bg-brand/10 text-brand'
                  }`}
                >
                  {esgotado
                    ? 'Sem estoque'
                    : `${product.estoqueDisponivel} em estoque`}
                </span>
                {product.category && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs">
                    {product.category.nomeCategoria}
                  </span>
                )}
              </div>

              <div className="mt-2">
                <AddToCart
                  productId={product.id}
                  preco={preco}
                  esgotado={esgotado}
                  estoque={product.estoqueDisponivel}
                />
              </div>

              <div className="mt-4 rounded-lg border border-border p-4 text-sm text-fg-muted">
                <p className="font-medium text-fg">Retirada na barbearia</p>
                <p className="mt-1">
                  Reserve agora e retire na sua próxima visita. Combine o horário pelo WhatsApp.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {relacionados.length > 0 && (
          <section className="mt-16">
            <Reveal variant="up">
              <h2 className="font-display text-2xl font-bold text-fg">Você também pode gostar</h2>
            </Reveal>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relacionados.map((r, i) => (
                <Reveal key={r.id} variant="up" delay={i * 80}>
                  <Link href={`/produto/${r.id}`} className="block">
                    <Card className="hover-lift h-full overflow-hidden">
                      {r.imagemPrincipal ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imagemPrincipal}
                          alt={r.nomeProduto}
                          className="img-zoom aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-surface" />
                      )}
                      <CardBody>
                        <p className="line-clamp-2 text-sm font-medium text-fg">{r.nomeProduto}</p>
                        <p className="mt-1 text-sm font-semibold text-brand">
                          {Number(r.precoVenda).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                      </CardBody>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
