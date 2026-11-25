'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'loading') return;

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage('Informe o e-mail da sua conta.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(
          data?.error ?? 'Não foi possível enviar o e-mail. Tente novamente.',
        );
      }

      setStatus('success');
      setMessage(
        'Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha. Verifique também a caixa de spam.',
      );
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o e-mail. Tente novamente.',
      );
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-md border border-brand/40 bg-brand/10 p-4 text-sm text-fg"
      >
        <p className="font-medium text-brand">E-mail enviado</p>
        <p className="mt-1 text-fg-muted">{message}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-brand hover:underline"
          >
            Voltar para o login
          </Link>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setMessage('');
            }}
            className="text-sm font-medium text-fg-muted hover:text-fg"
          >
            Enviar para outro e-mail
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-fg"
        >
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={status === 'loading'}
        />
      </div>

      {status === 'error' && message ? (
        <p
          role="alert"
          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-fg"
        >
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar link de recuperação'}
      </Button>
    </form>
  );
}
