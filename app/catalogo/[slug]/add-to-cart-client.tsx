'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  productId: string;
  productName: string;
  precoUnitario: number;
  emEstoque: boolean;
};

export function AddToCartClient({ productId, productName, precoUnitario, emEstoque }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleAdd() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantidade: qty, precoUnitario }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'err', text: data?.error ?? 'Não foi possível adicionar ao carrinho.' });
      } else {
        setMsg({ type: 'ok', text: `${qty}x ${productName} adicionado ao carrinho.` });
        router.refresh();
      }
    } catch {
      setMsg({ type: 'err', text: 'Falha de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  if (!emEstoque) {
    return (
      <Button variant="secondary" size="lg" disabled className="w-full md:w-auto">
        Produto esgotado
      </Button>
    );
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
            className="px-3 py-2 text-fg hover:bg-white/5 transition-colors duration-150"
            aria-label="Diminuir quantidade"
          >
            -
          </button>
          <span id="qty" className="min-w-[2.5rem] text-center text-sm font-medium text-fg">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2 text-fg hover:bg-white/5 transition-colors duration-150"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          onClick={handleAdd}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? 'Adicionando...' : 'Adicionar ao carrinho'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => router.push('/carrinho')}
          className="w-full sm:w-auto"
        >
          Ver carrinho
        </Button>
      </div>

      {msg && (
        <p
          role="status"
          className={
            msg.type === 'ok'
              ? 'text-sm text-brand'
              : 'text-sm text-accent'
          }
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
