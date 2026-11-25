'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ProductRow = {
  id: string;
  nomeProduto: string;
  precoVenda: number;
  estoqueDisponivel: number;
  ativo: boolean;
  imagemPrincipal: string | null;
  marca: string | null;
  categoria: string;
};

export function ProductRowClient({ product }: { product: ProductRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preco, setPreco] = useState(String(product.precoVenda).replace('.', ','));
  const [estoque, setEstoque] = useState(String(product.estoqueDisponivel));
  const [ativo, setAtivo] = useState(product.ativo);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao salvar');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    await patch({
      precoVenda: Number(preco.replace(',', '.')),
      estoqueDisponivel: Number(estoque) || 0,
      ativo,
    });
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm(`Remover "${product.nomeProduto}" do catálogo?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao remover');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover');
    } finally {
      setSaving(false);
    }
  }

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <tr className="border-b border-border/60 align-middle">
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          {product.imagemPrincipal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imagemPrincipal}
              alt={product.nomeProduto}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-brand/10" aria-hidden />
          )}
          <div>
            <p className="font-medium text-fg">{product.nomeProduto}</p>
            {product.marca && <p className="text-xs text-fg-muted">{product.marca}</p>}
          </div>
        </div>
      </td>
      <td className="py-3 pr-3 text-fg-muted">{product.categoria}</td>
      <td className="py-3 pr-3">
        {editing ? (
          <Input
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            inputMode="decimal"
            className="w-24"
          />
        ) : (
          <span className="text-fg">{brl.format(product.precoVenda)}</span>
        )}
      </td>
      <td className="py-3 pr-3">
        {editing ? (
          <Input
            type="number"
            min={0}
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            className="w-20"
          />
        ) : (
          <span className={product.estoqueDisponivel === 0 ? 'text-accent' : 'text-fg'}>
            {product.estoqueDisponivel}
          </span>
        )}
      </td>
      <td className="py-3 pr-3">
        {editing ? (
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-fg-muted">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-border text-brand focus-visible:ring-brand"
            />
            Ativo
          </label>
        ) : (
          <span
            className={
              product.ativo
                ? 'rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand'
                : 'rounded-full bg-fg-muted/10 px-2 py-0.5 text-xs font-medium text-fg-muted'
            }
          >
            {product.ativo ? 'Ativo' : 'Inativo'}
          </span>
        )}
      </td>
      <td className="py-3 text-right">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando' : 'Salvar'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)} disabled={saving}>
                Editar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDelete} disabled={saving}>
                Remover
              </Button>
            </>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      </td>
    </tr>
  );
}
