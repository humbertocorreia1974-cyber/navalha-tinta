import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { Marquee } from '@/components/motion/marquee';
import { CountUp } from '@/components/motion/count-up';
import { copy } from '@/content/copy';
import ASSETS from '@/lib/assets';
import { Check, Scissors, Sparkles, Pause, XCircle, ShieldCheck } from 'lucide-react';
import { SubscribeButton } from './subscribe-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Planos de assinatura | Navalha & Tinta',
  description:
    'Assine e garanta seus cortes do mês com barba com desconto, cobrança recorrente no cartão e pausa quando precisar.',
  openGraph: {
    title: 'Planos de assinatura | Navalha & Tinta',
    description:
      'Assine e garanta seus cortes do mês com barba com desconto, cobrança recorrente no cartão e pausa quando precisar.',
    images: [ASSETS.hero],
  },
};

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function PlanosPage() {
  const session = await getServerSession(authOptions);
  const planos = await prisma.subscriptionPlan.findMany({
    where: { ativo: true },
    orderBy: [{ destaque: 'desc' }, { precoMensal: 'asc' }],
  });

  const minhaAssinatura = session?.user?.id
    ? await prisma.subscription.findFirst({
        where: { userId: session.user.id, statusAssinatura: { in: ['ativa', 'pausada'] } },
        include: { plan: true },
      })
    : null;

  return (
    <main className="min-h-screen bg-bg text-fg">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg to-brand/20" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <Reveal variant="up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs uppercase tracking-widest text-brand">
              <Sparkles className="h-3.5 w-3.5" /> Assinatura Navalha & Tinta
            </p>
            <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">
              {copy.marketing.headline}
            </h1>
            <p className="mt-4 max-w-xl text-fg-muted">{copy.sales.pricingBlurb}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#planos">
                <Button size="lg">{copy.sales.ctaPrimary}</Button>
              </Link>
              <Link href="/barbeiros">
                <Button size="lg" variant="ghost">
                  {copy.sales.ctaSecondary}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-fg-muted">{ASSETS.slogan}</p>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ASSETS.hero} alt="Ambiente da barbearia Navalha & Tinta" className="img-zoom h-80 w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee>
        <span className="mx-6 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-fg-muted">
          <Scissors className="h-4 w-4 text-brand" /> Corte ilimitado no plano
        </span>
        <span className="mx-6 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-fg-muted">
          <ShieldCheck className="h-4 w-4 text-brand" /> Cobrança recorrente segura
        </span>
        <span className="mx-6 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-fg-muted">
          <Pause className="h-4 w-4 text-brand" /> Pause quando precisar
        </span>
        <span className="mx-6 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-fg-muted">
          <XCircle className="h-4 w-4 text-brand" /> Cancele quando quiser
        </span>
      </Marquee>

      <section id="planos" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal variant="up">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Escolha seu plano</h2>
          <p className="mt-2 max-w-2xl text-fg-muted">
            Sem letras miúdas: você assina, usa e pausa ou cancela direto na sua conta.
          </p>
        </Reveal>

        {minhaAssinatura && (
          <Reveal variant="up" delay={80}>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-brand/40 bg-brand/10 p-4">
              <div>
                <p className="text-sm text-fg-muted">Sua assinatura atual</p>
                <p className="font-display text-lg font-bold text-brand">
                  {minhaAssinatura.plan.nomePlano} · {minhaAssinatura.statusAssinatura}
                </p>
              </div>
              <Link href="/minha-assinatura">
                <Button variant="secondary" size="sm">Gerenciar assinatura</Button>
              </Link>
            </div>
          </Reveal>
        )}

        {planos.length === 0 ? (
          <Reveal variant="up" delay={120}>
            <Card className="mt-10">
              <CardBody>
                <CardTitle>Planos em preparação</CardTitle>
                <p className="mt-2 text-fg-muted">
                  Nossos planos de assinatura estão sendo configurados. Fale com a gente para
                  entrar na lista de espera.
                </p>
                <Link href="/contato" className="mt-4 inline-block">
                  <Button variant="secondary">Falar com a barbearia</Button>
                </Link>
              </CardBody>
            </Card>
          </Reveal>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {planos.map((p, i) => (
              <Reveal key={p.id} variant="up" delay={i * 90}>
                <div
                  className={
                    'hover-lift flex h-full flex-col rounded-xl border p-6 transition-all duration-200 ' +
                    (p.destaque
                      ? 'border-brand bg-brand/10 shadow-xl'
                      : 'border-border bg-surface/70')
                  }
                >
                  {p.destaque && (
                    <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-fg">
                      <Sparkles className="h-3 w-3" /> Mais escolhido
                    </span>
                  )}
                  <h3 className="font-display text-2xl font-bold">{p.nomePlano}</h3>
                  {p.descricao && <p className="mt-1 text-sm text-fg-muted">{p.descricao}</p>}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-black text-brand">
                      {formatBRL(Number(p.precoMensal))}
                    </span>
                    <span className="text-sm text-fg-muted">/mês</span>
                  </div>
                  <ul className="mt-5 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>
                        <CountUp to={p.quantidadeServicosMes} /> serviços por mês
                      </span>
                    </li>
                    {p.descontoProdutos != null && Number(p.descontoProdutos) > 0 && (
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>{Number(p.descontoProdutos)}% de desconto em produtos</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>Agendamento prioritário com seu barbeiro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>Pausa e cancelamento a qualquer momento</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-2">
                    <SubscribeButton
                      planId={p.id}
                      planName={p.nomePlano}
                      isAuthenticated={Boolean(session?.user?.id)}
                      isCurrent={minhaAssinatura?.planId === p.id}
                      highlight={p.destaque}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          <Reveal variant="up">
            <h3 className="font-display text-xl font-bold">Como funciona</h3>
            <ol className="mt-3 space-y-2 text-sm text-fg-muted">
              <li>1. Escolha o plano que combina com sua rotina.</li>
              <li>2. Pague no cartão com cobrança recorrente segura.</li>
              <li>3. Agende com o barbeiro que você confia.</li>
            </ol>
          </Reveal>
          <Reveal variant="up" delay={80}>
            <h3 className="font-display text-xl font-bold">Pausa e cancelamento</h3>
            <p className="mt-3 text-sm text-fg-muted">
              Vai viajar? Pause o plano direto na sua conta. Mudou de ideia? Cancele quando quiser,
              sem multa e sem burocracia.
            </p>
          </Reveal>
          <Reveal variant="up" delay={160}>
            <h3 className="font-display text-xl font-bold">Dúvidas frequentes</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-semibold">Posso trocar de plano?</dt>
                <dd className="text-fg-muted">Sim, a troca vale no próximo ciclo de cobrança.</dd>
              </div>
              <div>
                <dt className="font-semibold">Os serviços acumulam?</dt>
                <dd className="text-fg-muted">Os serviços do mês são usados dentro do ciclo.</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
