import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ASSETS } from '@/lib/assets';
import { RegisterForm } from './register-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cadastro | Navalha & Tinta',
  description:
    'Crie sua conta na Navalha & Tinta e agende com o barbeiro que você confia. Tradição no corte, ousadia no estilo.',
  openGraph: {
    title: 'Cadastro | Navalha & Tinta',
    description:
      'Crie sua conta na Navalha & Tinta e agende com o barbeiro que você confia.',
    type: 'website',
  },
};

export default async function CadastroPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect('/minha-conta');
  }

  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
        <section className="hidden md:block">
          <div className="relative overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.hero}
              alt="Ambiente da barbearia Navalha & Tinta"
              className="h-[520px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-brand">
                Navalha & Tinta
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white">
                {ASSETS.slogan}
              </h2>
              <p className="mt-3 max-w-sm text-sm text-white/80">
                Agende com o barbeiro que você confia, assine o plano que combina
                com sua rotina e chegue sem espera.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">
              Criar conta
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Bem-vindo à Navalha & Tinta
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              Leva menos de um minuto. Depois você já pode agendar seu primeiro
              corte.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-sm text-fg-muted">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="font-medium text-brand underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
