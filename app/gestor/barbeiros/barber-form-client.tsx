'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  mode: 'create' | 'edit';
  initial?: {
    id: string;
    nomeCompleto: string;
    apelido: string;
    emailContato: string;
    telefoneCelular: string;
    especialidades: string;
    bio: string;
    fotoPerfil: string;
  };
  onDone?: () => void;
};

export function BarberFormClient({ mode, initial, onDone }: Props) {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState(initial?.nomeCompleto ?? '');
  const [apelido, setApelido] = useState(initial?.apelido ?? '');
  const [emailContato, setEmailContato] = useState(initial?.emailContato ?? '');
  const [telefoneCelular, setTelefoneCelular] = useState(initial?.telefoneCelular ?? '');
  const [especialidades, setEspecialidades] = useState(initial?.especialidades ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [fotoPerfil, setFotoPerfil] = useState(initial?.fotoPerfil ?? '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha no upload');
      setFotoPerfil(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const payload = {
        nomeCompleto,
        apelido: apelido || null,
        emailContato,
        telefoneCelular,
        especialidades: especialidades || null,
        bio: bio || null,
        fotoPerfil: fotoPerfil || null,
      };
      const url = mode === 'create' ? '/api/admin/barbers' : `/api/admin/barbers/${initial?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setOk(mode === 'create' ? 'Profissional cadastrado.' : 'Profissional atualizado.');
      if (mode === 'create') {
        setNomeCompleto('');
        setApelido('');
        setEmailContato('');
        setTelefoneCelular('');
        setEspecialidades('');
        setBio('');
        setFotoPerfil('');
      }
      router.refresh();
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
          Nome completo
        </label>
        <Input
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
          required
          placeholder="Ex: Rafael Souza"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
          Apelido
        </label>
        <Input
          value={apelido}
          onChange={(e) => setApelido(e.target.value)}
          placeholder="Ex: Rafa"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
          Especialidades
        </label>
        <Input
          value={especialidades}
          onChange={(e) => setEspecialidades(e.target.value)}
          placeholder="Ex: fade, barba, navalhado"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
          E-mail de contato
        </label>
        <Input
          type="email"
          value={emailContato}
          onChange={(e) => setEmailContato(e.target.value)}
          required
          placeholder="barbeiro@navalhaetinta.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
          Telefone celular
        </label>
        <Input
          value={telefoneCelular}
          onChange={(e) => setTelefoneCelular(e.target.value)}
          required
          placeholder="(11) 99999-0000"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          placeholder="Um pouco sobre o profissional"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
          Foto de perfil
        </label>
        <div className="flex items-center gap-3">
          {fotoPerfil && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoPerfil}
              alt="Prévia"
              className="h-14 w-14 rounded-full object-cover border border-border"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
            className="text-sm text-fg-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-brand-fg file:text-sm hover:file:opacity-90"
          />
          {uploading && <span className="text-xs text-fg-muted">Enviando...</span>}
        </div>
      </div>

      {error && <p className="sm:col-span-2 text-sm text-accent">{error}</p>}
      {ok && <p className="sm:col-span-2 text-sm text-brand">{ok}</p>}

      <div className="sm:col-span-2 flex justify-end gap-2">
        {mode === 'edit' && onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || uploading}>
          {loading ? 'Salvando...' : mode === 'create' ? 'Cadastrar profissional' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
