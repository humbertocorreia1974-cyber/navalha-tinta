'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SubscriptionActionClient({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(novo: 'pausada' | 'ativa' | 'cancelada') {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusAssinatura: novo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Falha ao atualizar');
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || pending;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'ativa' && (
        <Button size="sm" variant="secondary" onClick={() => action('pausada')} disabled={busy}>Pausar</Button>
      )}
      {(status === 'pausada' || status === 'inadimplente') && (
        <Button size="sm" onClick={() => action('ativa')} disabled={busy}>Retomar</Button>
      )}
      {status !== 'cancelada' && (
        <Button size="sm" variant="ghost" onClick={() => action('cancelada')} disabled={busy}>Cancelar</Button>
      )}
      {error && <span className="text-xs text-accent">{error}</span>}
    </div>
  );
}
