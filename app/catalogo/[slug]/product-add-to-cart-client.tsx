'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  productId: string;
  maxQuantity: number;
  disabled: boolean;
};

export function ProductAddToCartClient({ productId, maxQuantity, disabled }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const limit = Math.max(1, Math.min(maxQuantity, 20));

  function dec() {
    setQuantity((q) => Math.max(1, q - 1));
  }
  function inc() {
    setQuantity((q) => Math.min(limit, q + 1));
  }

  async function handleAdd() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantidade: quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: 'err', msg: data?.error ?? 'Não foi possível adicionar ao carrinho.' });
      } else {
        setFeedback({ type: 'ok', msg: 'Adicionado ao carrinho.' });
        router.refresh();
      }
    } catch {
      setFeedback({ type: 'err', msg: 'Falha de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <Button variant="secondary" disabled className="w-full md:w-auto">
        Produto esgotado
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-fg-muted">Quantidade</span>
        <div className="inline-flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={dec}
            disabled={quantity <= 1}
            className="px-3 py-2 text-fg hover:bg-white/5 disabled:opacity-40 transition-colors"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="w-10 text-center text-fg font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={inc}
            disabled={quantity >= limit}
            className="px-3 py-2 text-fg hover:bg-white/5 disabled:opacity-40 transition-colors"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAdd} disabled={loading}>
          {loading ? 'Adicionando...' : 'Adicionar ao carrinho'}
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await handleAdd();
            router.push('/carrinho');
          }}
          disabled={loading}
        >
          Comprar agora
        </Button>
      </div>

      {feedback && (
        <p
          className={
            feedback.type === 'ok'
              ? 'text-sm text-brand'
              : 'text-sm text-accent'
          }
          role="status"
        >
          {feedback.msg}
        </p>
      )}
    </div>
  );
}
