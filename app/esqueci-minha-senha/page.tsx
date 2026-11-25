import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Esqueci minha senha | Navalha & Tinta',
  description:
    'Recupere o acesso à sua conta Navalha & Tinta. Enviaremos um link seguro para redefinir sua senha em poucos instantes.',
  openGraph: {
    title: 'Esqueci minha senha | Navalha & Tinta',
    description:
      'Recupere o acesso à sua conta Navalha & Tinta. Enviaremos um link seguro para redefinir sua senha.',
    type: 'website',
  },
};

export default function EsqueciMinhaSenhaPage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand">Navalha & Tinta</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-fg sm:text-4xl">
            Esqueci minha senha
          </h1>
          <p className="mt-3 text-sm text-fg-muted">
            Informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-fg-muted">
          Lembrou a senha?{' '}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Voltar para o login
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-fg-muted">
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="font-medium text-brand hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
