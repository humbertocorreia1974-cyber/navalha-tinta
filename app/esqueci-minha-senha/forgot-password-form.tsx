'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setMessage('Informe seu e-mail para continuar.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(
          data?.error ||
            'Não foi possível enviar o e-mail agora. Tente novamente em alguns instantes.'
        );
        return;
      }

      setStatus('success');
      setMessage(
        'Se este e-mail estiver cadastrado, você receberá em instantes um link para redefinir sua senha. Confira também a caixa de spam.'
      );
    } catch {
      setStatus('error');
      setMessage('Falha de conexão. Verifique sua internet e tente novamente.');
    }
  }

  if (status === 'success') {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="rounded-md border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-fg"
        >
          {message}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          onClick={() => {
            setStatus('idle');
            setMessage('');
          }}
        >
          Enviar para outro e-mail
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-fg">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          required
        />
      </div>

      {status === 'error' && message ? (
        <p role="alert" className="text-sm text-accent">
          {message}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="md" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : 'Enviar link de redefinição'}
      </Button>

      <p className="text-xs text-fg-muted">
        Por segurança, não informamos se o e-mail está cadastrado. O link expira em poucas horas.
      </p>
    </form>
  );
}
