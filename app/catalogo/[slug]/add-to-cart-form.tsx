'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = { productId: string; estoque: number };

export function AddToCartForm({ productId, estoque }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(
    null,
  );

  const esgotado = estoque <= 0;
  const max = Math.max(1, estoque);

  async function handleAdd() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantidade: qty }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({
          type: 'err',
          msg: data?.error ?? 'Não foi possível adicionar ao carrinho.',
        });
        return;
      }
      setFeedback({ type: 'ok', msg: 'Adicionado ao carrinho!' });
      router.refresh();
    } catch {
      setFeedback({ type: 'err', msg: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm text-fg-muted">
          Quantidade
        </label>
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={esgotado || qty <= 1}
            className="px-3 py-2 text-fg-muted transition-colors hover:text-fg disabled:opacity-40"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <input
            id="qty"
            type="number"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => {
              const v = Number(e.target.value) || 1;
              setQty(Math.min(max, Math.max(1, v)));
            }}
            disabled={esgotado}
            className="w-14 border-x border-border bg-transparent py-2 text-center text-sm text-fg focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={esgotado || qty >= max}
            className="px-3 py-2 text-fg-muted transition-colors hover:text-fg disabled:opacity-40"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        disabled={loading || esgotado}
        size="lg"
        className="w-full"
      >
        {esgotado ? 'Produto esgotado' : loading ? 'Adicionando...' : 'Adicionar ao carrinho'}
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() => router.push('/carrinho')}
      >
        Ir para o carrinho
      </Button>

      {feedback && (
        <p
          role="status"
          className={`text-sm ${
            feedback.type === 'ok' ? 'text-brand' : 'text-accent'
          }`}
        >
          {feedback.msg}
        </p>
      )}
    </div>
  );
}
