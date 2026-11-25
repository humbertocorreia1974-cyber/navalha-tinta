import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agendamento confirmado | Navalha & Tinta',
  description: 'Seu horario na Navalha & Tinta foi registrado com sucesso.',
  openGraph: {
    title: 'Agendamento confirmado | Navalha & Tinta',
    description: 'Tradicao no corte, ousadia no estilo.',
    type: 'website',
  },
};

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function ConfirmacaoPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const id = searchParams.id;
  if (!id) redirect('/meus-agendamentos');

  const appointment = await prisma.appointment.findFirst({
    where: { id, clientId: session.user.id },
    include: {
      barber: { select: { nomeCompleto: true, apelido: true } },
      service: { select: { nomeServico: true, duracaoMinutos: true } },
    },
  });

  if (!appointment) redirect('/meus-agendamentos');

  const dataFmt = appointment.dataAgendamento.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <main className="min-h-screen bg-bg text-fg">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Reveal variant="up">
          <p className="text-xs uppercase tracking-[0.3em] text-brand">Tudo certo</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Horario reservado.
          </h1>
          <p className="mt-3 text-fg-muted">
            Enviamos os detalhes para o seu e-mail. Chegue com 5 minutos de antecedencia.
          </p>
        </Reveal>

        <Reveal variant="up" delay={80}>
          <Card className="mt-8">
            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Servico</dt>
                  <dd className="mt-1 font-display text-lg">{appointment.service.nomeServico}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Barbeiro</dt>
                  <dd className="mt-1 font-display text-lg">
                    {appointment.barber.apelido ?? appointment.barber.nomeCompleto}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Data</dt>
                  <dd className="mt-1 capitalize">{dataFmt}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Horario</dt>
                  <dd className="mt-1">
                    {appointment.horaInicio} as {appointment.horaFim}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Duracao</dt>
                  <dd className="mt-1">{appointment.service.duracaoMinutos} min</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-fg-muted">Total</dt>
                  <dd className="mt-1 font-display text-lg text-brand">
                    {brl(Number(appointment.valorTotal))}
                  </dd>
                </div>
              </dl>
              {appointment.observacoes && (
                <p className="mt-4 rounded-md border border-border bg-bg/40 px-3 py-2 text-sm text-fg-muted">
                  Observacoes: {appointment.observacoes}
                </p>
              )}
            </div>
          </Card>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/meus-agendamentos">
            <Button variant="primary">Ver meus agendamentos</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Voltar ao inicio</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
