'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Category = { id: string; nomeCategoria: string };

export function ProductFormClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [form, setForm] = useState({
    nomeProduto: '',
    descricao: '',
    precoVenda: '',
    estoqueDisponivel: '0',
    marca: '',
    categoryId: '',
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Falha no upload');
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeProduto: form.nomeProduto.trim(),
          descricao: form.descricao.trim() || null,
          precoVenda: Number(form.precoVenda.replace(',', '.')),
          estoqueDisponivel: Number(form.estoqueDisponivel) || 0,
          marca: form.marca.trim() || null,
          categoryId: form.categoryId || null,
          imagemPrincipal: imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao criar produto');
      setForm({ nomeProduto: '', descricao: '', precoVenda: '', estoqueDisponivel: '0', marca: '', categoryId: '' });
      setImageUrl('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-fg-muted">Nome do produto</label>
        <Input
          required
          value={form.nomeProduto}
          onChange={(e) => update('nomeProduto', e.target.value)}
          placeholder="Pomada modeladora matte"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-fg-muted">Descrição</label>
        <textarea
          value={form.descricao}
          onChange={(e) => update('descricao', e.target.value)}
          rows={2}
          placeholder="Fixação forte, acabamento seco."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-fg-muted">Preço (R$)</label>
          <Input
            required
            inputMode="decimal"
            value={form.precoVenda}
            onChange={(e) => update('precoVenda', e.target.value)}
            placeholder="49,90"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-fg-muted">Estoque</label>
          <Input
            type="number"
            min={0}
            value={form.estoqueDisponivel}
            onChange={(e) => update('estoqueDisponivel', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-fg-muted">Marca</label>
        <Input
          value={form.marca}
          onChange={(e) => update('marca', e.target.value)}
          placeholder="Navalha & Tinta"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-fg-muted">Categoria</label>
        <select
          value={form.categoryId}
          onChange={(e) => update('categoryId', e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nomeCategoria}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-fg-muted">Foto principal</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="block w-full text-xs text-fg-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-fg hover:file:opacity-90"
        />
        {uploading && <p className="mt-1 text-xs text-fg-muted">Enviando imagem...</p>}
        {imageUrl && (
          <p className="mt-1 truncate text-xs text-brand">Imagem enviada: {imageUrl}</p>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="md" disabled={loading || uploading}>
        {loading ? 'Salvando...' : 'Cadastrar produto'}
      </Button>
    </form>
  );
}
