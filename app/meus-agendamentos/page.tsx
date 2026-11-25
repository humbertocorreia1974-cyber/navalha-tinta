import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { CancelAppointmentButton } from './cancel-appointment-button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Meus agendamentos | Navalha & Tinta',
  description: 'Acompanhe seus próximos cortes e o histórico de atendimentos na Navalha & Tinta.',
  openGraph: {
    title: 'Meus agendamentos | Navalha & Tinta',
    description: 'Acompanhe seus próximos cortes e o histórico de atendimentos na Navalha & Tinta.',
    type: 'website',
  },
};

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Aguardando confirmação',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  no_show: 'Não compareceu',
};

const STATUS_CLASS: Record<string, string> = {
  pendente: 'bg-accent/15 text-accent',
  confirmado: 'bg-brand/15 text-brand',
  concluido: 'bg-fg/10 text-fg-muted',
  cancelado: 'bg-fg/10 text-fg-muted line-through',
  no_show: 'bg-red-500/15 text-red-400',
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function formatBRL(v: unknown) {
  const n = typeof v === 'number' ? v : Number(v);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(n) ? n : 0,
  );
}

function canCancel(data: Date, horaInicio: string) {
  const [h, m] = horaInicio.split(':').map(Number);
  const when = new Date(data);
  when.setHours(h, m, 0, 0);
  return when.getTime() - Date.now() > 12 * 60 * 60 * 1000;
}

export default async function MeusAgendamentosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/meus-agendamentos');
  }

  const appointments = await prisma.appointment.findMany({
    where: { clientId: session.user.id },
    include: {
      barber: { select: { nomeCompleto: true, apelido: true, fotoPerfil: true } },
      service: { select: { nomeServico: true, duracaoMinutos: true } },
    },
    orderBy: { dataAgendamento: 'desc' },
  });

  const now = new Date();
  const upcoming = appointments
    .filter((a) => a.dataAgendamento >= now && a.statusAgendamento !== 'cancelado')
    .sort((a, b) => a.dataAgendamento.getTime() - b.dataAgendamento.getTime());
  const history = appointments.filter(
    (a) => a.dataAgendamento < now || a.statusAgendamento === 'cancelado',
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <Reveal variant="up">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Sua agenda</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-fg">Meus agendamentos</h1>
            <p className="mt-2 max-w-xl text-sm text-fg-muted">
              Tradição no corte, ousadia no estilo. Aqui você acompanha cada visita à Navalha & Tinta.
            </p>
          </div>
          <Link href="/agendar">
            <Button variant="primary" size="md">Novo agendamento</Button>
          </Link>
        </div>
      </Reveal>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl text-fg">Próximos</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardBody className="flex flex-col items-start gap-3 py-8">
              <p className="text-sm text-fg-muted">
                Você ainda não tem horário marcado. Escolha seu barbeiro e garanta o próximo corte.
              </p>
              <Link href="/agendar">
                <Button variant="primary" size="sm">Agendar agora</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((a, i) => (
              <Reveal key={a.id} variant="up" delay={i * 60}>
                <Card className="hover-lift">
                  <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                        <span className="font-display text-lg font-bold">{a.horaInicio}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{a.service.nomeServico}</CardTitle>
                        <p className="mt-1 text-sm text-fg-muted">
                          {formatDate(a.dataAgendamento)} · {a.horaInicio} às {a.horaFim}
                        </p>
                        <p className="text-sm text-fg-muted">
                          com {a.barber.apelido || a.barber.nomeCompleto}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[a.statusAgendamento] ?? 'bg-fg/10 text-fg-muted'}`}
                          >
                            {STATUS_LABEL[a.statusAgendamento] ?? a.statusAgendamento}
                          </span>
                          <span className="text-xs text-fg-muted">{formatBRL(a.valorTotal)}</span>
                        </div>
                      </div>
                    </div>
                    {canCancel(a.dataAgendamento, a.horaInicio) &&
                      (a.statusAgendamento === 'pendente' || a.statusAgendamento === 'confirmado') && (
                        <CancelAppointmentButton id={a.id} />
                      )}
                  </CardBody>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl text-fg">Histórico</h2>
        {history.length === 0 ? (
          <p className="text-sm text-fg-muted">Nenhum atendimento anterior por aqui ainda.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase tracking-wider text-fg-muted">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Barbeiro</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3 text-fg-muted">{formatDate(a.dataAgendamento)}</td>
                    <td className="px-4 py-3 text-fg">{a.service.nomeServico}</td>
                    <td className="px-4 py-3 text-fg-muted">
                      {a.barber.apelido || a.barber.nomeCompleto}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[a.statusAgendamento] ?? 'bg-fg/10 text-fg-muted'}`}
                      >
                        {STATUS_LABEL[a.statusAgendamento] ?? a.statusAgendamento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-fg-muted">{formatBRL(a.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
