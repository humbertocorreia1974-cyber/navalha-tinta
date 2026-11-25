'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BarberUser = { id: string; name: string; email: string };

type Props = {
  barberUsers: BarberUser[];
  initial?: {
    id: string;
    nomeCompleto: string;
    apelido: string | null;
    emailContato: string;
    telefoneCelular: string;
    fotoPerfil: string | null;
    especialidades: string | null;
    bio: string | null;
    ativo: boolean;
    userId: string | null;
  };
  onDone?: () => void;
};

export function BarberForm({ barberUsers, initial, onDone }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(initial?.fotoPerfil ?? null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha no upload');
      setFoto(data.url);
    } catch (e: any) {
      setError(e?.message || 'Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      nomeCompleto: String(form.get('nomeCompleto') || '').trim(),
      apelido: String(form.get('apelido') || '').trim() || null,
      emailContato: String(form.get('emailContato') || '').trim(),
      telefoneCelular: String(form.get('telefoneCelular') || '').trim(),
      especialidades: String(form.get('especialidades') || '').trim() || null,
      bio: String(form.get('bio') || '').trim() || null,
      userId: String(form.get('userId') || '').trim() || null,
      fotoPerfil: foto,
      ativo: form.get('ativo') === 'on',
    };

    try {
      const url = initial ? `/api/admin/barbers/${initial.id}` : '/api/admin/barbers';
      const method = initial ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao salvar');
      router.refresh();
      onDone?.();
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-fg-muted">Nome completo</label>
        <Input name="nomeCompleto" required defaultValue={initial?.nomeCompleto ?? ''} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-fg-muted">Apelido (aparece no site)</label>
        <Input name="apelido" defaultValue={initial?.apelido ?? ''} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-fg-muted">E-mail de contato</label>
        <Input name="emailContato" type="email" required defaultValue={initial?.emailContato ?? ''} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-fg-muted">Telefone / WhatsApp</label>
        <Input name="telefoneCelular" required defaultValue={initial?.telefoneCelular ?? ''} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-fg-muted">Especialidades</label>
        <Input
          name="especialidades"
          placeholder="Fade, navalhado, barba"
          defaultValue={initial?.especialidades ?? ''}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-fg-muted">Bio curta</label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={initial?.bio ?? ''}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-fg-muted">Vincular a usuário (opcional)</label>
        <select
          name="userId"
          defaultValue={initial?.userId ?? ''}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg"
        >
          <option value="">Sem vínculo</option>
          {barberUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-fg-muted">Foto de perfil</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
          className="block w-full text-xs text-fg-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:text-brand-fg"
        />
        {uploading && <p className="mt-1 text-xs text-fg-muted">Enviando...</p>}
        {foto && (
          <img
            src={foto}
            alt="Prévia"
            className="mt-2 h-16 w-16 rounded-md object-cover"
          />
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" name="ativo" defaultChecked={initial?.ativo ?? true} />
        Ativo na agenda
      </label>

      {error && <p className="text-xs text-accent">{error}</p>}

      <Button type="submit" disabled={loading || uploading} className="w-full">
        {loading ? 'Salvando...' : initial ? 'Salvar alterações' : 'Cadastrar profissional'}
      </Button>
    </form>
  );
}
