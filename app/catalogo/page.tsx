import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { Package, Search, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo de produtos | Navalha & Tinta',
  description:
    'Pomadas, óleos, navalhas e tudo que você precisa para manter o corte em casa. Produtos selecionados pela Navalha & Tinta.',
  openGraph: {
    title: 'Catálogo de produtos | Navalha & Tinta',
    description:
      'Pomadas, óleos, navalhas e tudo que você precisa para manter o corte em casa.',
    type: 'website',
  },
};

type SearchParams = {
  categoria?: string;
  q?: string;
};

function formatBRL(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value ?? 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categoria = searchParams?.categoria?.trim() || '';
  const q = searchParams?.q?.trim() || '';

  const [categorias, produtos] = await Promise.all([
    prisma.category.findMany({
      where: { ativa: true },
      orderBy: [{ ordemExibicao: 'asc' }, { nomeCategoria: 'asc' }],
      select: { id: true, nomeCategoria: true, slug: true },
    }),
    prisma.product.findMany({
      where: {
        ativo: true,
        ...(categoria ? { category: { slug: categoria } } : {}),
        ...(q
          ? {
              OR: [
                { nomeProduto: { contains: q, mode: 'insensitive' } },
                { descricao: { contains: q, mode: 'insensitive' } },
                { marca: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        category: { select: { nomeCategoria: true, slug: true } },
      },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand">
              Loja Navalha & Tinta
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-fg sm:text-5xl">
              Catálogo de produtos
            </h1>
            <p className="mt-3 max-w-2xl text-fg-muted">
              Pomadas, óleos, navalhas e cuidados selecionados para você manter
              o corte em casa com o mesmo padrão da cadeira.
            </p>
          </div>
          <Link href="/carrinho">
            <Button variant="primary" size="lg">
              Ver carrinho
            </Button>
          </Link>
        </header>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <form
          action="/catalogo"
          method="get"
          className="mb-8 flex flex-col gap-3 rounded-lg border border-border bg-surface/60 p-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome, marca ou descrição"
              className="w-full rounded-md border border-border bg-bg py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>
          <select
            name="categoria"
            defaultValue={categoria}
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nomeCategoria}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" size="md">
            Filtrar
          </Button>
        </form>
      </Reveal>

      {produtos.length === 0 ? (
        <Reveal variant="up">
          <Card className="p-10 text-center">
            <Package
              className="mx-auto mb-4 h-10 w-10 text-fg-muted"
              aria-hidden="true"
            />
            <h2 className="font-display text-xl font-semibold text-fg">
              Nenhum produto encontrado
            </h2>
            <p className="mt-2 text-sm text-fg-muted">
              Ajuste a busca ou explore todas as categorias disponíveis.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/catalogo">
                <Button variant="primary" size="md">
                  Limpar filtros
                </Button>
              </Link>
            </div>
          </Card>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((p, i) => (
            <Reveal key={p.id} variant="up" delay={i * 60}>
              <Card className="hover-lift flex h-full flex-col overflow-hidden">
                <div className="relative aspect-square w-full overflow-hidden bg-bg">
                  {p.imagemPrincipal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagemPrincipal}
                      alt={p.nomeProduto}
                      className="img-zoom h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package
                        className="h-12 w-12 text-fg-muted"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {p.category ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-brand-fg">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {p.category.nomeCategoria}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {p.marca ? (
                    <p className="text-xs uppercase tracking-wider text-fg-muted">
                      {p.marca}
                    </p>
                  ) : null}
                  <h3 className="font-display text-lg font-semibold text-fg">
                    {p.nomeProduto}
                  </h3>
                  {p.descricao ? (
                    <p className="line-clamp-2 text-sm text-fg-muted">
                      {p.descricao}
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="font-display text-xl font-bold text-brand">
                      {formatBRL(p.precoVenda)}
                    </span>
                    <span
                      className={
                        p.estoqueDisponivel > 0
                          ? 'rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent'
                          : 'rounded-full bg-border px-2 py-0.5 text-xs text-fg-muted'
                      }
                    >
                      {p.estoqueDisponivel > 0
                        ? `${p.estoqueDisponivel} em estoque`
                        : 'Esgotado'}
                    </span>
                  </div>
                  <Link
                    href={`/catalogo/${p.id}`}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-fg transition-colors duration-150 hover:bg-white/5"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
