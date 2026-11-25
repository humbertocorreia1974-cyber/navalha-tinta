'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  planId: string;
  planName: string;
  isAuthenticated: boolean;
  isCurrent: boolean;
  highlight?: boolean;
};

export function SubscribeButton({ planId, planName, isAuthenticated, isCurrent, highlight }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setError(null);
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/planos')}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error ?? 'Não foi possível iniciar o checkout. Tente novamente.');
        setLoading(false);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setError('Falha de conexão. Tente novamente.');
      setLoading(false);
    }
  }

  if (isCurrent) {
    return (
      <Button variant="secondary" size="md" disabled className="w-full">
        Plano atual
      </Button>
    );
  }

  return (
    <div className="w-full">
      <Button
        variant={highlight ? 'primary' : 'secondary'}
        size="md"
        className="w-full"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? 'Abrindo checkout...' : `Assinar ${planName}`}
      </Button>
      {error && <p className="mt-2 text-xs text-accent">{error}</p>}
    </div>
  );
}
