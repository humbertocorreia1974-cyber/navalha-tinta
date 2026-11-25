import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './profile-form';
import { PasswordForm } from './password-form';
import { AddressForm } from './address-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Minha conta | Navalha & Tinta',
  description: 'Gerencie seus dados, endereço e senha na Navalha & Tinta.',
  openGraph: {
    title: 'Minha conta | Navalha & Tinta',
    description: 'Gerencie seus dados, endereço e senha na Navalha & Tinta.',
  },
};

export default async function MinhaContaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login?next=/minha-conta');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      plan: true,
      role: true,
      createdAt: true,
      addresses: {
        orderBy: [{ principal: 'desc' }, { createdAt: 'desc' }],
        take: 1,
      },
      _count: {
        select: { appointmentsAsClient: true, orders: true, subscriptions: true },
      },
    },
  });

  if (!user) redirect('/login?next=/minha-conta');

  const endereco = user.addresses[0] ?? null;
  const membroDesde = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(user.createdAt);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Conta</p>
          <h1 className="mt-2 font-display text-4xl font-black text-fg">Minha conta</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Cliente desde {membroDesde}. Plano atual: <span className="text-brand font-semibold">{user.plan}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/meus-agendamentos">
            <Button variant="secondary" size="sm">Meus agendamentos</Button>
          </Link>
          <Link href="/meus-pedidos">
            <Button variant="secondary" size="sm">Meus pedidos</Button>
          </Link>
          <Link href="/minha-assinatura">
            <Button variant="secondary" size="sm">Minha assinatura</Button>
          </Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-5">
          <p className="text-xs uppercase tracking-wider text-fg-muted">Agendamentos</p>
          <p className="mt-2 font-display text-3xl text-fg">{user._count.appointmentsAsClient}</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <p className="text-xs uppercase tracking-wider text-fg-muted">Pedidos</p>
          <p className="mt-2 font-display text-3xl text-fg">{user._count.orders}</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <p className="text-xs uppercase tracking-wider text-fg-muted">Assinaturas</p>
          <p className="mt-2 font-display text-3xl text-fg">{user._count.subscriptions}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <CardTitle>Dados pessoais</CardTitle>
            <p className="mt-1 mb-4 text-sm text-fg-muted">
              Nome e telefone usados nos seus agendamentos e lembretes.
            </p>
            <ProfileForm
              initialName={user.name}
              initialPhone={user.phone ?? ''}
              email={user.email}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Endereço principal</CardTitle>
            <p className="mt-1 mb-4 text-sm text-fg-muted">
              Usado para entrega de produtos comprados na loja.
            </p>
            <AddressForm
              initial={
                endereco
                  ? {
                      cep: endereco.cep,
                      logradouro: endereco.logradouro,
                      numero: endereco.numero,
                      complemento: endereco.complemento ?? '',
                      bairro: endereco.bairro,
                      cidade: endereco.cidade,
                      estado: endereco.estado,
                    }
                  : null
              }
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Segurança</CardTitle>
            <p className="mt-1 mb-4 text-sm text-fg-muted">
              Troque sua senha periodicamente. Você continuará logado neste dispositivo.
            </p>
            <PasswordForm />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle>Preferências e privacidade</CardTitle>
            <p className="mt-1 mb-4 text-sm text-fg-muted">
              Consulte como tratamos seus dados ou solicite a exclusão da conta.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/privacidade">
                <Button variant="secondary" size="sm">Política de privacidade</Button>
              </Link>
              <Link href="/termos">
                <Button variant="secondary" size="sm">Termos de uso</Button>
              </Link>
              <Link href="/contato">
                <Button variant="ghost" size="sm">Falar com o suporte</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
