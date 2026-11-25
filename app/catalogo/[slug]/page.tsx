import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card, CardBody } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { AddToCartClient } from './add-to-cart-client';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { id: slug, ativo: true },
    include: { category: true },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return {
      title: 'Produto não encontrado | Navalha & Tinta',
      description: 'O produto que você procura não está mais disponível no catálogo da Navalha & Tinta.',
    };
  }
  const description =
    product.descricao?.slice(0, 155) ??
    `Compre ${product.nomeProduto} na Navalha & Tinta. Tradição no corte, ousadia no estilo.`;
  return {
    title: `${product.nomeProduto} | Navalha & Tinta`,
    description,
    openGraph: {
      title: product.nomeProduto,
      description,
      images: product.imagemPrincipal ? [{ url: product.imagemPrincipal }] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = product.categoryId
    ? await prisma.product.findMany({
        where: {
          ativo: true,
          categoryId: product.categoryId,
          id: { not: product.id },
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const preco = Number(product.precoVenda);
  const precoFmt = preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const emEstoque = product.estoqueDisponivel > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <nav className="mb-6 flex items-center gap-2 text-sm text-fg-muted" aria-label="Breadcrumb">
        <Link href="/catalogo" className="hover:text-brand transition-colors duration-150">
          Catálogo
        </Link>
        <span aria-hidden>/</span>
        {product.category && (
          <>
            <Link
              href={`/catalogo?categoria=${product.category.slug}`}
              className="hover:text-brand transition-colors duration-150"
            >
              {product.category.nomeCategoria}
            </Link>
            <span aria-hidden>/</span>
          </>
        )}
        <span className="text-fg">{product.nomeProduto}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <Reveal variant="left">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface">
            {product.imagemPrincipal ? (
              <Image
                src={product.imagemPrincipal}
                alt={product.nomeProduto}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="img-zoom object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-fg-muted">
                Sem imagem disponível
              </div>
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
            <h1 className="font-display text-3xl font-bold text-fg md:text-4xl">
              {product.nomeProduto}
            </h1>
            <p className="text-2xl font-semibold text-brand">{precoFmt}</p>

            <div className="flex items-center gap-2 text-sm">
              {emEstoque ? (
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                  Em estoque ({product.estoqueDisponivel})
                </span>
              ) : (
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  Esgotado
                </span>
              )}
            </div>

            {product.descricao && (
              <p className="whitespace-pre-line text-fg-muted leading-relaxed">
                {product.descricao}
              </p>
            )}

            <div className="mt-2">
              <AddToCartClient
                productId={product.id}
                productName={product.nomeProduto}
                precoUnitario={preco}
                emEstoque={emEstoque}
              />
            </div>

            <div className="mt-4 border-t border-border pt-4 text-xs text-fg-muted">
              Retirada na barbearia ou entrega local. Dúvidas? Fale com a gente pelo WhatsApp.
            </div>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <Reveal variant="up">
            <h2 className="font-display text-2xl font-bold text-fg">Você também pode gostar</h2>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} variant="up" delay={i * 80}>
                <Link href={`/catalogo/${p.id}`} className="block">
                  <Card className="hover-lift h-full overflow-hidden">
                    <div className="relative aspect-square bg-surface">
                      {p.imagemPrincipal ? (
                        <Image
                          src={p.imagemPrincipal}
                          alt={p.nomeProduto}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="img-zoom object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-fg-muted">
                          Sem imagem
                        </div>
                      )}
                    </div>
                    <CardBody>
                      <p className="line-clamp-2 text-sm font-medium text-fg">{p.nomeProduto}</p>
                      <p className="mt-1 text-sm font-semibold text-brand">
                        {Number(p.precoVenda).toLocaleString('pt-BR', {
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
    </main>
  );
}
