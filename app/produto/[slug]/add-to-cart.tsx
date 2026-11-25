'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  productId: string;
  preco: number;
  esgotado: boolean;
  estoque: number;
};

export function AddToCart({ productId, preco, esgotado, estoque }: Props) {
  const router = useRouter();
  const [qtd, setQtd] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const max = Math.max(1, estoque);

  async function adicionar() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantidade: qtd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ tipo: 'erro', texto: data?.error ?? 'Não foi possível adicionar.' });
      } else {
        setMsg({ tipo: 'ok', texto: 'Adicionado ao carrinho.' });
        router.refresh();
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de rede. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qtd" className="text-sm text-fg-muted">
          Quantidade
        </label>
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQtd((q) => Math.max(1, q - 1))}
            disabled={esgotado || qtd <= 1}
            className="px-3 py-1.5 text-fg-muted transition-colors hover:text-fg disabled:opacity-40"
            aria-label="Diminuir quantidade"
          >
            -
          </button>
          <input
            id="qtd"
            type="number"
            min={1}
            max={max}
            value={qtd}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v)) setQtd(Math.min(max, Math.max(1, Math.floor(v))));
            }}
            className="w-14 border-x border-border bg-transparent py-1.5 text-center text-sm text-fg focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQtd((q) => Math.min(max, q + 1))}
            disabled={esgotado || qtd >= max}
            className="px-3 py-1.5 text-fg-muted transition-colors hover:text-fg disabled:opacity-40"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
        <span className="text-sm text-fg-muted">
          Total:{' '}
          <span className="font-semibold text-fg">
            {(preco * qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={adicionar} disabled={esgotado || loading} size="lg">
          {loading ? 'Adicionando...' : esgotado ? 'Esgotado' : 'Adicionar ao carrinho'}
        </Button>
        <a
          href="/carrinho"
          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm text-fg transition-colors hover:bg-white/5"
        >
          Ver carrinho
        </a>
      </div>

      {msg && (
        <p
          role="status"
          className={`text-sm ${msg.tipo === 'ok' ? 'text-brand' : 'text-accent'}`}
        >
          {msg.texto}
        </p>
      )}
    </div>
  );
}
