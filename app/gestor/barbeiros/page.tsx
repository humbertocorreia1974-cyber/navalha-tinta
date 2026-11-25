import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { BarbeiroForm } from './barbeiro-form-client';
import { BarbeiroRow } from './barbeiro-row-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gerenciar profissionais | Navalha & Tinta',
  description: 'Cadastre, edite e desative os barbeiros da Navalha & Tinta.',
  openGraph: {
    title: 'Gerenciar profissionais | Navalha & Tinta',
    description: 'Painel do dono para gerenciar a equipe de barbeiros.',
  },
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/sem-permissao');

  const barbeiros = await prisma.barber.findMany({
    orderBy: [{ ativo: 'desc' }, { nomeCompleto: 'asc' }],
    include: {
      _count: { select: { appointments: true, galleryItems: true } },
    },
  });

  const totalAtivos = barbeiros.filter((b) => b.ativo).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Painel do dono</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">
              Gerenciar profissionais
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-fg-muted">
              Cadastre novos barbeiros, atualize fotos e especialidades, e desative quem saiu da equipe sem perder o histórico de atendimentos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-fg-muted">
              {totalAtivos} ativo{totalAtivos === 1 ? '' : 's'} de {barbeiros.length}
            </span>
            <Link href="/gestor">
              <Button variant="ghost" size="sm">Voltar ao painel</Button>
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Reveal variant="left" delay={80}>
          <Card>
            <CardTitle>Equipe</CardTitle>
            <CardBody>
              {barbeiros.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-fg-muted">
                    Nenhum profissional cadastrado ainda. Use o formulário ao lado para adicionar o primeiro barbeiro da equipe.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {barbeiros.map((b) => (
                    <BarbeiroRow
                      key={b.id}
                      barbeiro={{
                        id: b.id,
                        nomeCompleto: b.nomeCompleto,
                        apelido: b.apelido,
                        emailContato: b.emailContato,
                        telefoneCelular: b.telefoneCelular,
                        fotoPerfil: b.fotoPerfil,
                        especialidades: b.especialidades,
                        bio: b.bio,
                        ativo: b.ativo,
                        totalAgendamentos: b._count.appointments,
                        totalGaleria: b._count.galleryItems,
                      }}
                    />
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>

        <Reveal variant="right" delay={160}>
          <BarbeiroForm />
        </Reveal>
      </div>
    </main>
  );
}
