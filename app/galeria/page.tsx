import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { GalleryUpload } from './gallery-upload-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galeria de trabalhos | Navalha & Tinta',
  description:
    'Veja cortes, barbas e combos feitos pelos barbeiros da Navalha & Tinta. Filtre por estilo e por profissional e encontre a referência do seu próximo corte.',
  openGraph: {
    title: 'Galeria de trabalhos | Navalha & Tinta',
    description:
      'Cortes, barbas e combos reais feitos pelos barbeiros da Navalha & Tinta. Filtre por estilo e profissional.',
    type: 'website',
  },
};

const ESTILOS = [
  { value: '', label: 'Todos os estilos' },
  { value: 'fade', label: 'Fade' },
  { value: 'classico', label: 'Clássico' },
  { value: 'barba', label: 'Barba' },
  { value: 'combo', label: 'Combo' },
  { value: 'outro', label: 'Outro' },
];

const LABEL_ESTILO: Record<string, string> = {
  fade: 'Fade',
  classico: 'Clássico',
  barba: 'Barba',
  combo: 'Combo',
  outro: 'Outro',
};

type SearchParams = { estilo?: string; barbeiro?: string };

export default async function GaleriaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === 'barber' || session?.user?.role === 'admin';

  const estilo = searchParams.estilo || '';
  const barbeiroId = searchParams.barbeiro || '';

  const [barbeiros, itens] = await Promise.all([
    prisma.barber.findMany({
      where: { ativo: true },
      select: { id: true, nomeCompleto: true, apelido: true },
      orderBy: { nomeCompleto: 'asc' },
    }),
    prisma.galleryItem.findMany({
      where: {
        ...(estilo ? { estiloCorte: estilo } : {}),
        ...(barbeiroId ? { barberId: barbeiroId } : {}),
      },
      orderBy: [{ destaque: 'desc' }, { ordemExibicao: 'asc' }, { dataPublicacao: 'desc' }],
      include: {
        barber: { select: { id: true, nomeCompleto: true, apelido: true } },
      },
      take: 60,
    }),
  ]);

  const filtroAtivo = Boolean(estilo || barbeiroId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <header className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Portfólio</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-fg sm:text-5xl">
            Galeria de trabalhos
          </h1>
          <p className="mt-3 text-fg-muted">
            Cortes, barbas e combos feitos aqui dentro. Filtre por estilo ou pelo profissional
            que você já acompanha e traga a referência do seu próximo corte.
          </p>
        </header>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <form
          method="get"
          className="mb-8 flex flex-col gap-3 rounded-lg border border-border bg-surface/60 p-4 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-fg-muted">Estilo</span>
            <select
              name="estilo"
              defaultValue={estilo}
              className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {ESTILOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-fg-muted">Barbeiro</span>
            <select
              name="barbeiro"
              defaultValue={barbeiroId}
              className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="">Todos os barbeiros</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.apelido || b.nomeCompleto}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md">
              Filtrar
            </Button>
            {filtroAtivo && (
              <Link
                href="/galeria"
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm text-fg-muted transition-colors duration-150 hover:bg-white/5 hover:text-fg"
              >
                Limpar
              </Link>
            )}
          </div>
        </form>
      </Reveal>

      {isStaff && (
        <Reveal variant="up" delay={120}>
          <GalleryUpload barbeiros={barbeiros} />
        </Reveal>
      )}

      {itens.length === 0 ? (
        <Reveal variant="up">
          <Card>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <h2 className="font-display text-xl text-fg">
                {filtroAtivo ? 'Nenhum trabalho com esse filtro' : 'Os primeiros trabalhos chegam em breve'}
              </h2>
              <p className="max-w-md text-sm text-fg-muted">
                {filtroAtivo
                  ? 'Tente outro estilo ou outro barbeiro. Os trabalhos novos entram aqui toda semana.'
                  : 'Ainda não publicamos trabalhos nesta galeria. Enquanto isso, agende seu horário e veja o resultado pessoalmente.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {filtroAtivo && (
                  <Link href="/galeria">
                    <Button variant="secondary" size="md">
                      Ver todos os trabalhos
                    </Button>
                  </Link>
                )}
                <Link href="/agendar">
                  <Button variant="primary" size="md">
                    Agendar horário
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Reveal>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((item, i) => (
            <li key={item.id}>
              <Reveal variant="up" delay={i * 60}>
                <article className="hover-lift group overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="relative aspect-[4/5] overflow-hidden bg-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imagemTrabalho}
                      alt={item.titulo}
                      className="img-zoom h-full w-full object-cover"
                      loading="lazy"
                    />
                    {item.destaque && (
                      <span className="absolute left-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-fg">
                        Destaque
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-lg font-semibold text-fg">
                        {item.titulo}
                      </h2>
                      {item.estiloCorte && (
                        <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
                          {LABEL_ESTILO[item.estiloCorte] || item.estiloCorte}
                        </span>
                      )}
                    </div>
                    {item.descricao && (
                      <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{item.descricao}</p>
                    )}
                    <p className="mt-3 text-xs uppercase tracking-wide text-fg-muted">
                      {item.barber ? item.barber.apelido || item.barber.nomeCompleto : 'Navalha & Tinta'}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      <Reveal variant="up" delay={120}>
        <section className="mt-16 flex flex-col items-start justify-between gap-4 rounded-lg border border-border p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl text-fg">Gostou de algum corte?</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Escolha o barbeiro, o serviço e o horário. Sem espera, sem fila.
            </p>
          </div>
          <Link href="/agendar">
            <Button variant="primary" size="lg">
              Agendar agora
            </Button>
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
