import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { ProductFormClient } from './product-form-client';
import { ProductRowClient } from './product-row-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gerenciar produtos | Navalha & Tinta',
  description: 'Cadastre, edite e organize o catálogo de produtos da barbearia Navalha & Tinta.',
  openGraph: {
    title: 'Gerenciar produtos | Navalha & Tinta',
    description: 'Painel do dono para o catálogo de produtos.',
  },
};

export default async function GestorProdutosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin' && session.user.role !== 'barber') {
    redirect('/sem-permissao');
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, nomeCategoria: true } } },
    }),
    prisma.category.findMany({
      where: { ativa: true },
      orderBy: { ordemExibicao: 'asc' },
      select: { id: true, nomeCategoria: true },
    }),
  ]);

  const totalAtivos = products.filter((p) => p.ativo).length;
  const valorCatalogo = products.reduce(
    (acc, p) => acc + Number(p.precoVenda) * p.estoqueDisponivel,
    0,
  );
  const semEstoque = products.filter((p) => p.estoqueDisponivel === 0).length;

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand">Painel do dono</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">
              Gerenciar produtos
            </h1>
            <p className="mt-2 max-w-xl text-sm text-fg-muted">
              Cadastre pomadas, óleos, camisas e tudo que a Navalha & Tinta vende no balcão.
              Estoque e preço atualizados aqui refletem direto no catálogo público.
            </p>
          </div>
          <Link href="/catalogo">
            <Button variant="secondary" size="md">Ver catálogo público</Button>
          </Link>
        </div>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Produtos ativos</p>
            <p className="mt-2 font-display text-3xl font-bold text-fg">{totalAtivos}</p>
            <p className="mt-1 text-xs text-fg-muted">de {products.length} no total</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Valor em catálogo</p>
            <p className="mt-2 font-display text-3xl font-bold text-brand">{brl.format(valorCatalogo)}</p>
            <p className="mt-1 text-xs text-fg-muted">preço x estoque disponível</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Sem estoque</p>
            <p className="mt-2 font-display text-3xl font-bold text-accent">{semEstoque}</p>
            <p className="mt-1 text-xs text-fg-muted">reponha para não perder venda</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[380px_1fr]">
        <Reveal variant="left">
          <Card>
            <CardBody>
              <CardTitle>Novo produto</CardTitle>
              <p className="mt-1 text-sm text-fg-muted">
                Preencha os dados e envie a foto principal. O produto entra ativo no catálogo.
              </p>
              <div className="mt-5">
                <ProductFormClient categories={categories} />
              </div>
            </CardBody>
          </Card>
        </Reveal>

        <Reveal variant="right" delay={80}>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos cadastrados</CardTitle>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                  {products.length}
                </span>
              </div>

              {products.length === 0 ? (
                <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="font-display text-lg text-fg">Nenhum produto ainda</p>
                  <p className="mt-1 text-sm text-fg-muted">
                    Cadastre o primeiro item no formulário ao lado para começar a vender.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-fg-muted">
                        <th className="pb-3 pr-3 font-medium">Produto</th>
                        <th className="pb-3 pr-3 font-medium">Categoria</th>
                        <th className="pb-3 pr-3 font-medium">Preço</th>
                        <th className="pb-3 pr-3 font-medium">Estoque</th>
                        <th className="pb-3 pr-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <ProductRowClient
                          key={p.id}
                          product={{
                            id: p.id,
                            nomeProduto: p.nomeProduto,
                            precoVenda: Number(p.precoVenda),
                            estoqueDisponivel: p.estoqueDisponivel,
                            ativo: p.ativo,
                            imagemPrincipal: p.imagemPrincipal,
                            marca: p.marca,
                            categoria: p.category?.nomeCategoria ?? 'Sem categoria',
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </Reveal>
      </div>
    </main>
  );
}
