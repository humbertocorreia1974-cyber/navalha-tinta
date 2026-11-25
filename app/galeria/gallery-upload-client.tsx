'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BarbeiroOpt = { id: string; nomeCompleto: string; apelido: string | null };

export function GalleryUpload({ barbeiros }: { barbeiros: BarbeiroOpt[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setOk(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get('file');
    if (!(file instanceof File) || file.size === 0) {
      setErro('Escolha uma imagem do trabalho.');
      return;
    }

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const upRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const upJson = await upRes.json().catch(() => ({}));
      if (!upRes.ok || !upJson.url) {
        throw new Error(upJson.error || 'Falha no upload da imagem.');
      }

      const payload = {
        titulo: String(data.get('titulo') || '').trim(),
        descricao: String(data.get('descricao') || '').trim() || null,
        estiloCorte: String(data.get('estiloCorte') || '') || null,
        barberId: String(data.get('barberId') || '') || null,
        imagemTrabalho: upJson.url as string,
      };

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Não foi possível publicar o trabalho.');

      setOk('Trabalho publicado na galeria.');
      form.reset();
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-8 flex justify-end">
        <Button variant="secondary" size="md" onClick={() => setOpen(true)}>
          Publicar trabalho
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-fg">Publicar novo trabalho</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-fg-muted transition-colors duration-150 hover:text-fg"
        >
          Fechar
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fg-muted">Título</span>
          <Input name="titulo" required maxLength={80} placeholder="Fade com risco" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fg-muted">Estilo</span>
          <select
            name="estiloCorte"
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="">Sem estilo</option>
            <option value="fade">Fade</option>
            <option value="classico">Clássico</option>
            <option value="barba">Barba</option>
            <option value="combo">Combo</option>
            <option value="outro">Outro</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fg-muted">Barbeiro</span>
          <select
            name="barberId"
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <option value="">Sem barbeiro</option>
            {barbeiros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.apelido || b.nomeCompleto}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-fg-muted">Imagem</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg file:mr-3 file:rounded file:border-0 file:bg-brand file:px-2 file:py-1 file:text-brand-fg"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-fg-muted">Descrição (opcional)</span>
          <textarea
            name="descricao"
            rows={2}
            maxLength={240}
            className="rounded-md border border-border bg-bg px-3 py-2 text-fg outline-none focus-visible:ring-2 focus-visible:ring-brand"
            placeholder="Detalhes do corte, produtos usados, referência"
          />
        </label>

        {erro && (
          <p className="sm:col-span-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
            {erro}
          </p>
        )}
        {ok && (
          <p className="sm:col-span-2 rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
            {ok}
          </p>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
