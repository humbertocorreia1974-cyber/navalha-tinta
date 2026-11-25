import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { BarberForm } from './barber-form';
import { BarberRow } from './barber-row';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gerenciar profissionais | Navalha & Tinta',
  description: 'Cadastre, edite e desative os barbeiros da Navalha & Tinta.',
  openGraph: {
    title: 'Gerenciar profissionais | Navalha & Tinta',
    description: 'Cadastre, edite e desative os barbeiros da Navalha & Tinta.',
  },
};

export default async function AdminBarbeirosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/sem-permissao');

  const [barbers, barberUsers] = await Promise.all([
    prisma.barber.findMany({
      orderBy: [{ ativo: 'desc' }, { nomeCompleto: 'asc' }],
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { appointments: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: 'barber' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const ativos = barbers.filter((b) => b.ativo).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Painel do dono</p>
          <h1 className="mt-1 font-display text-3xl text-fg">Gerenciar profissionais</h1>
          <p className="mt-2 text-sm text-fg-muted">
            {barbers.length} cadastrados, {ativos} ativos na agenda.
          </p>
        </div>
        <a
          href="/gestor"
          className="rounded-md border border-border px-3 py-2 text-sm text-fg-muted transition-colors duration-150 hover:bg-white/5 hover:text-fg"
        >
          Voltar ao painel
        </a>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          {barbers.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-fg-muted">
                  Nenhum profissional cadastrado ainda. Use o formulário ao lado para
                  adicionar o primeiro barbeiro da equipe.
                </p>
              </CardBody>
            </Card>
          ) : (
            barbers.map((b) => (
              <BarberRow
                key={b.id}
                barber={{
                  id: b.id,
                  nomeCompleto: b.nomeCompleto,
                  apelido: b.apelido,
                  emailContato: b.emailContato,
                  telefoneCelular: b.telefoneCelular,
                  fotoPerfil: b.fotoPerfil,
                  especialidades: b.especialidades,
                  bio: b.bio,
                  ativo: b.ativo,
                  userId: b.userId,
                  totalAgendamentos: b._count.appointments,
                  userEmail: b.user?.email ?? null,
                }}
                barberUsers={barberUsers}
              />
            ))
          )}
        </section>

        <aside>
          <Card>
            <CardBody>
              <CardTitle>Novo profissional</CardTitle>
              <p className="mt-1 text-xs text-fg-muted">
                Preencha os dados do barbeiro. Ele aparece imediatamente na página
                pública de barbeiros se estiver ativo.
              </p>
              <div className="mt-4">
                <BarberForm barberUsers={barberUsers} />
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </main>
  );
}
