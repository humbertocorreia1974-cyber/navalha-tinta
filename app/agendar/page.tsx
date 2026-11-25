import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { BookingWizard } from './booking-wizard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agendar horario | Navalha & Tinta',
  description:
    'Escolha o servico, o barbeiro, a data e o horario. Agende online na Navalha & Tinta em menos de um minuto.',
  openGraph: {
    title: 'Agendar horario | Navalha & Tinta',
    description: 'Agende com o barbeiro que voce confia. Tradicao no corte, ousadia no estilo.',
    type: 'website',
  },
};

export default async function AgendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/agendar');
  }

  const [services, barbers] = await Promise.all([
    prisma.service.findMany({
      where: { disponivel: true },
      orderBy: { nomeServico: 'asc' },
      select: {
        id: true,
        nomeServico: true,
        descricao: true,
        duracaoMinutos: true,
        precoBase: true,
        categoriaServico: true,
      },
    }),
    prisma.barber.findMany({
      where: { ativo: true },
      orderBy: { nomeCompleto: 'asc' },
      select: {
        id: true,
        nomeCompleto: true,
        apelido: true,
        especialidades: true,
        fotoPerfil: true,
        bio: true,
      },
    }),
  ]);

  const servicesData = services.map((s) => ({
    id: s.id,
    nome: s.nomeServico,
    descricao: s.descricao,
    duracao: s.duracaoMinutos,
    preco: Number(s.precoBase),
    categoria: s.categoriaServico,
  }));

  const barbersData = barbers.map((b) => ({
    id: b.id,
    nome: b.nomeCompleto,
    apelido: b.apelido,
    especialidades: b.especialidades,
    foto: b.fotoPerfil,
    bio: b.bio,
  }));

  const empty = servicesData.length === 0 || barbersData.length === 0;

  return (
    <main className="min-h-screen bg-bg text-fg">
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <Reveal variant="up">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Agendamento</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
              Escolha o corte, o barbeiro e o horario.
            </h1>
            <p className="mt-4 max-w-2xl text-fg-muted">
              Quatro passos rapidos. Voce recebe a confirmacao por e-mail e pode acompanhar tudo em
              Meus agendamentos.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {empty ? (
          <Card>
            <div className="p-10 text-center">
              <h2 className="font-display text-2xl">Agenda em preparacao</h2>
              <p className="mt-2 text-fg-muted">
                Ainda nao ha servicos ou barbeiros disponiveis para agendamento online. Fale com a
                recepcao para reservar seu horario.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/contato">
                  <Button variant="primary">Falar com a barbearia</Button>
                </Link>
                <Link href="/servicos">
                  <Button variant="secondary">Ver servicos</Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <BookingWizard services={servicesData} barbers={barbersData} />
        )}
      </section>
    </main>
  );
}
