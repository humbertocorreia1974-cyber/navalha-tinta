import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SubscriptionActions } from "./subscription-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Minha assinatura | Navalha & Tinta",
  description:
    "Gerencie seu plano de assinatura da Navalha & Tinta: veja o ciclo, o uso do mês e pause ou cancele quando precisar.",
  openGraph: {
    title: "Minha assinatura | Navalha & Tinta",
    description:
      "Gerencie seu plano de assinatura da Navalha & Tinta: veja o ciclo, o uso do mês e pause ou cancele quando precisar.",
    type: "website",
  },
};

const brl = (v: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    typeof v === "string" ? Number(v) : v
  );

const dt = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(d);

const statusLabel: Record<string, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  cancelada: "Cancelada",
  inadimplente: "Inadimplente",
};

const statusTone: Record<string, string> = {
  ativa: "bg-brand/15 text-brand",
  pausada: "bg-accent/15 text-accent",
  cancelada: "bg-fg-muted/15 text-fg-muted",
  inadimplente: "bg-red-500/15 text-red-400",
};

export default async function MinhaAssinaturaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/minha-assinatura");

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      plan: true,
      payments: { orderBy: { createdAt: "desc" }, take: 6 },
      pauseRecords: { orderBy: { createdAt: "desc" }, take: 4 },
    },
  });

  if (!subscription) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Reveal variant="up">
          <p className="text-xs uppercase tracking-[0.2em] text-brand">Assinatura</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-fg">Minha assinatura</h1>
        </Reveal>
        <Reveal variant="up" delay={120}>
          <Card className="mt-10">
            <CardBody className="flex flex-col items-center gap-4 py-14 text-center">
              <p className="font-display text-2xl text-fg">Você ainda não tem um plano ativo</p>
              <p className="max-w-md text-sm text-fg-muted">
                Assine e garanta seus cortes do mês com barba com desconto, cobrança recorrente no cartão e pausa quando precisar.
              </p>
              <Link href="/planos">
                <Button variant="primary" size="lg">Ver planos disponíveis</Button>
              </Link>
            </CardBody>
          </Card>
        </Reveal>
      </main>
    );
  }

  const limite = subscription.plan.quantidadeServicosMes || 0;
  const usados = subscription.servicosUsadosMes;
  const pct = limite > 0 ? Math.min(100, Math.round((usados / limite) * 100)) : 0;
  const diasParaRenovar = Math.max(
    0,
    Math.ceil((subscription.dataRenovacao.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Reveal variant="up">
        <p className="text-xs uppercase tracking-[0.2em] text-brand">Assinatura</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-fg">Minha assinatura</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Tradição no corte, ousadia no estilo. Aqui você controla seu plano.
        </p>
      </Reveal>

      <Reveal variant="up" delay={100}>
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-fg-muted">Plano atual</p>
                  <CardTitle className="mt-1 font-display text-3xl text-fg">
                    {subscription.plan.nomePlano}
                  </CardTitle>
                  {subscription.plan.descricao && (
                    <p className="mt-2 max-w-md text-sm text-fg-muted">{subscription.plan.descricao}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    statusTone[subscription.statusAssinatura] ?? "bg-fg-muted/15 text-fg-muted"
                  }`}
                >
                  {statusLabel[subscription.statusAssinatura] ?? subscription.statusAssinatura}
                </span>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Valor mensal</dt>
                  <dd className="mt-1 font-display text-xl text-fg">{brl(subscription.valorMensal.toString())}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Início</dt>
                  <dd className="mt-1 text-sm text-fg">{dt(subscription.dataInicio)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Renova em</dt>
                  <dd className="mt-1 text-sm text-fg">{dt(subscription.dataRenovacao)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Faltam</dt>
                  <dd className="mt-1 text-sm text-fg">{diasParaRenovar} dias</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-widest text-fg-muted">Uso do mês</p>
              <p className="mt-2 font-display text-3xl text-fg">
                {usados}
                <span className="text-lg text-fg-muted"> / {limite}</span>
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-fg-muted">
                {pct >= 100
                  ? "Você usou todos os serviços do mês. Renova em " + dt(subscription.dataRenovacao) + "."
                  : `Restam ${limite - usados} serviços até a próxima renovação.`}
              </p>
              {subscription.plan.descontoProdutos && (
                <p className="mt-4 rounded-md border border-border px-3 py-2 text-xs text-fg-muted">
                  Você tem {Number(subscription.plan.descontoProdutos)}% de desconto em produtos do catálogo.
                </p>
              )}
            </CardBody>
          </Card>
        </section>
      </Reveal>

      <Reveal variant="up" delay={180}>
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardBody>
              <CardTitle className="text-base">Ações do plano</CardTitle>
              <p className="mt-1 text-xs text-fg-muted">
                Pausar mantém seu histórico. Cancelar encerra a cobrança recorrente.
              </p>
              <SubscriptionActions
                subscriptionId={subscription.id}
                status={subscription.statusAssinatura}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle className="text-base">Últimos pagamentos</CardTitle>
              {subscription.payments.length === 0 ? (
                <p className="mt-4 text-sm text-fg-muted">
                  Nenhum pagamento registrado ainda. O primeiro será gerado na próxima cobrança.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {subscription.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <p className="text-fg">{brl(p.valorPago.toString())}</p>
                        <p className="text-xs text-fg-muted">
                          {p.dataPagamento ? dt(p.dataPagamento) : dt(p.createdAt)} · {p.metodoPagamento}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                          p.statusPagamento === "pago"
                            ? "bg-brand/15 text-brand"
                            : p.statusPagamento === "falhou"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-fg-muted/15 text-fg-muted"
                        }`}
                      >
                        {p.statusPagamento}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>
      </Reveal>

      {subscription.pauseRecords.length > 0 && (
        <Reveal variant="up" delay={240}>
          <section className="mt-8">
            <Card>
              <CardBody>
                <CardTitle className="text-base">Histórico de pausas</CardTitle>
                <ul className="mt-4 space-y-3">
                  {subscription.pauseRecords.map((r) => (
                    <li key={r.id} className="rounded-md border border-border px-4 py-3 text-sm">
                      <p className="text-fg">
                        {dt(r.dataInicio)} até {r.dataFim ? dt(r.dataFim) : "em aberto"}
                      </p>
                      {r.motivo && <p className="mt-1 text-xs text-fg-muted">{r.motivo}</p>}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </section>
        </Reveal>
      )}

      <Reveal variant="up" delay={300}>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/meus-agendamentos">
            <Button variant="secondary">Ver meus agendamentos</Button>
          </Link>
          <Link href="/planos">
            <Button variant="ghost">Comparar planos</Button>
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
