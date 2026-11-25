'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Status = 'idle' | 'loading' | 'ok' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    };
    if (!payload.name || !payload.email || !payload.message) {
      setError('Preencha nome, e-mail e mensagem.');
      setStatus('error');
      return;
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Não foi possível enviar sua mensagem.');
      }
      form.reset();
      setStatus('ok');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-fg-muted">Nome</span>
          <Input name="name" placeholder="Seu nome" autoComplete="name" required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-fg-muted">E-mail</span>
          <Input
            name="email"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            required
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-fg-muted">Mensagem</span>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Conte como podemos ajudar"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>

      {status === 'ok' && (
        <p className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          Mensagem enviada. Retornaremos em breve.
        </p>
      )}
      {status === 'error' && error && (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
      </Button>
    </form>
  );
}
