import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';
import { BarberToggleClient } from './barber-toggle-client';
import { ServiceToggleClient } from './service-toggle-client';
import { SubscriptionActionClient } from './subscription-action-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Painel do gestor | Navalha & Tinta',
  description: 'Agenda geral, barbeiros, serviços, assinantes e financeiro da Navalha & Tinta.',
  openGraph: {
    title: 'Painel do gestor | Navalha & Tinta',
    description: 'Visão operacional completa da barbearia.',
  },
};

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function GestorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/sem-permissao');

  const hoje = new Date();
  const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [
    agendamentosHoje,
    totalBarbeiros,
    barbeirosAtivos,
    totalServicos,
    servicosAtivos,
    assinaturasAtivas,
    pagamentosMes,
    noShowsMes,
    totalAgendamentosMes,
    barbeiros,
    servicos,
    assinantes,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { dataAgendamento: { gte: inicioDia, lt: fimDia } },
      include: { barber: true, service: true, client: true },
      orderBy: [{ horaInicio: 'asc' }],
    }),
    prisma.barber.count(),
    prisma.barber.count({ where: { ativo: true } }),
    prisma.service.count(),
    prisma.service.count({ where: { disponivel: true } }),
    prisma.subscription.count({ where: { statusAssinatura: 'ativa' } }),
    prisma.payment.findMany({
      where: { statusPagamento: 'pago', dataPagamento: { gte: inicioMes } },
      select: { valorPago: true },
    }),
    prisma.appointment.count({
      where: { statusAgendamento: 'no_show', dataAgendamento: { gte: inicioMes } },
    }),
    prisma.appointment.count({
      where: { dataAgendamento: { gte: inicioMes } },
    }),
    prisma.barber.findMany({ orderBy: { nomeCompleto: 'asc' } }),
    prisma.service.findMany({ orderBy: { nomeServico: 'asc' } }),
    prisma.subscription.findMany({
      where: { statusAssinatura: { in: ['ativa', 'pausada', 'inadimplente'] } },
      include: { plan: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const receitaMes = pagamentosMes.reduce((acc, p) => acc + Number(p.valorPago), 0);
  const taxaNoShow = totalAgendamentosMes > 0 ? (noShowsMes / totalAgendamentosMes) * 100 : 0;
  const ocupacaoHoje = agendamentosHoje.filter((a) => a.statusAgendamento !== 'cancelado').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <Reveal variant="up">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Painel do gestor</p>
            <h1 className="font-display text-3xl md:text-4xl text-fg">Operação da barbearia</h1>
            <p className="text-fg-muted mt-1">Visão consolidada de agenda, equipe, serviços e financeiro.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin"><Button variant="secondary" size="sm">Painel admin</Button></Link>
            <Link href="/agendar"><Button size="sm">Novo agendamento</Button></Link>
          </div>
        </header>
      </Reveal>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Reveal variant="up" delay={0}>
          <div className="rounded-lg border border-border p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Receita do mês</p>
            <p className="font-display text-2xl text-brand mt-2"><CountUp to={Math.round(receitaMes)} prefix="R$ " /></p>
          </div>
        </Reveal>
        <Reveal variant="up" delay={80}>
          <div className="rounded-lg border border-border p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Agendamentos hoje</p>
            <p className="font-display text-2xl text-fg mt-2"><CountUp to={ocupacaoHoje} /></p>
          </div>
        </Reveal>
        <Reveal variant="up" delay={160}>
          <div className="rounded-lg border border-border p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Assinantes ativos</p>
            <p className="font-display text-2xl text-fg mt-2"><CountUp to={assinaturasAtivas} /></p>
          </div>
        </Reveal>
        <Reveal variant="up" delay={240}>
          <div className="rounded-lg border border-border p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">Taxa de no-show</p>
            <p className="font-display text-2xl text-accent mt-2">{taxaNoShow.toFixed(1)}%</p>
          </div>
        </Reveal>
      </section>

      <Reveal variant="up">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Agenda geral de hoje</CardTitle>
              <span className="text-xs text-fg-muted">{fmtDate(hoje)}</span>
            </div>
            {agendamentosHoje.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-fg-muted">Nenhum agendamento para hoje.</p>
                <Link href="/agendar" className="inline-block mt-3"><Button size="sm">Criar agendamento</Button></Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-fg-muted border-b border-border">
                      <th className="py-2 pr-3">Hora</th>
                      <th className="py-2 pr-3">Cliente</th>
                      <th className="py-2 pr-3">Barbeiro</th>
                      <th className="py-2 pr-3">Serviço</th>
                      <th className="py-2 pr-3">Valor</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentosHoje.map((a) => (
                      <tr key={a.id} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3 font-mono text-fg">{a.horaInicio}</td>
                        <td className="py-2 pr-3 text-fg">{a.nomeCliente}</td>
                        <td className="py-2 pr-3 text-fg-muted">{a.barber.nomeCompleto}</td>
                        <td className="py-2 pr-3 text-fg-muted">{a.service.nomeServico}</td>
                        <td className="py-2 pr-3 text-fg">{fmtBRL(Number(a.valorTotal))}</td>
                        <td className="py-2">
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{a.statusAgendamento}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-6">
        <Reveal variant="left">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Barbeiros</CardTitle>
                <span className="text-xs text-fg-muted">{barbeirosAtivos}/{totalBarbeiros} ativos</span>
              </div>
              {barbeiros.length === 0 ? (
                <p className="text-fg-muted text-sm py-6 text-center">Nenhum barbeiro cadastrado.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {barbeiros.map((b) => (
                    <li key={b.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-fg font-medium">{b.nomeCompleto}</p>
                        <p className="text-xs text-fg-muted">{b.especialidades ?? 'Sem especialidade cadastrada'}</p>
                      </div>
                      <BarberToggleClient id={b.id} ativo={b.ativo} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>

        <Reveal variant="right">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Serviços</CardTitle>
                <span className="text-xs text-fg-muted">{servicosAtivos}/{totalServicos} disponíveis</span>
              </div>
              {servicos.length === 0 ? (
                <p className="text-fg-muted text-sm py-6 text-center">Nenhum serviço cadastrado.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {servicos.map((s) => (
                    <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-fg font-medium">{s.nomeServico}</p>
                        <p className="text-xs text-fg-muted">{s.duracaoMinutos} min · {fmtBRL(Number(s.precoBase))}</p>
                      </div>
                      <ServiceToggleClient id={s.id} disponivel={s.disponivel} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>
      </div>

      <Reveal variant="up">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Assinantes</CardTitle>
              <Link href="/planos" className="text-xs text-brand hover:underline">Ver planos</Link>
            </div>
            {assinantes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-fg-muted">Nenhuma assinatura ativa no momento.</p>
                <Link href="/planos" className="inline-block mt-3"><Button size="sm" variant="secondary">Conhecer planos</Button></Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-fg-muted border-b border-border">
                      <th className="py-2 pr-3">Assinante</th>
                      <th className="py-2 pr-3">Plano</th>
                      <th className="py-2 pr-3">Renovação</th>
                      <th className="py-2 pr-3">Uso no mês</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assinantes.map((s) => (
                      <tr key={s.id} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3 text-fg">{s.nomeAssinante}</td>
                        <td className="py-2 pr-3 text-fg-muted">{s.plan.nomePlano}</td>
                        <td className="py-2 pr-3 text-fg-muted">{fmtDate(s.dataRenovacao)}</td>
                        <td className="py-2 pr-3 text-fg-muted">{s.servicosUsadosMes}/{s.plan.quantidadeServicosMes}</td>
                        <td className="py-2 pr-3">
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{s.statusAssinatura}</span>
                        </td>
                        <td className="py-2">
                          <SubscriptionActionClient id={s.id} status={s.statusAssinatura} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </Reveal>
    </div>
  );
}
