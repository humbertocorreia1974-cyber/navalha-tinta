'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  barbeiro?: {
    id: string;
    nomeCompleto: string;
    apelido: string | null;
    emailContato: string;
    telefoneCelular: string;
    fotoPerfil: string | null;
    especialidades: string | null;
    bio: string | null;
  };
  onDone?: () => void;
};

export function BarbeiroForm({ barbeiro, onDone }: Props) {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState(barbeiro?.nomeCompleto ?? '');
  const [apelido, setApelido] = useState(barbeiro?.apelido ?? '');
  const [emailContato, setEmailContato] = useState(barbeiro?.emailContato ?? '');
  const [telefoneCelular, setTelefoneCelular] = useState(barbeiro?.telefoneCelular ?? '');
  const [especialidades, setEspecialidades] = useState(barbeiro?.especialidades ?? '');
  const [bio, setBio] = useState(barbeiro?.bio ?? '');
  const [fotoPerfil, setFotoPerfil] = useState(barbeiro?.fotoPerfil ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Falha no upload');
      setFotoPerfil(data.url);
    } catch (e) {
      setMsg({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Erro no upload' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const url = barbeiro ? `/api/admin/barbers/${barbeiro.id}` : '/api/admin/barbers';
      const method = barbeiro ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto,
          apelido: apelido || null,
          emailContato,
          telefoneCelular,
          especialidades: especialidades || null,
          bio: bio || null,
          fotoPerfil: fotoPerfil || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Falha ao salvar');
      setMsg({ tipo: 'ok', texto: barbeiro ? 'Profissional atualizado.' : 'Profissional cadastrado.' });
      if (!barbeiro) {
        setNomeCompleto('');
        setApelido('');
        setEmailContato('');
        setTelefoneCelular('');
        setEspecialidades('');
        setBio('');
        setFotoPerfil('');
      }
      onDone?.();
      router.refresh();
    } catch (e) {
      setMsg({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardTitle>{barbeiro ? 'Editar profissional' : 'Novo profissional'}</CardTitle>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Nome completo</label>
            <Input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Apelido (opcional)</label>
            <Input value={apelido} onChange={(e) => setApelido(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fg-muted">E-mail de contato</label>
            <Input type="email" value={emailContato} onChange={(e) => setEmailContato(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Telefone celular</label>
            <Input value={telefoneCelular} onChange={(e) => setTelefoneCelular(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Especialidades</label>
            <Input
              value={especialidades}
              onChange={(e) => setEspecialidades(e.target.value)}
              placeholder="Ex: fade, barba, navalhado"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Bio curta</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            />
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
              className="block w-full text-xs text-fg-muted file:mr-2 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-fg"
            />
            {uploading && <p className="mt-1 text-xs text-fg-muted">Enviando...</p>}
            {fotoPerfil && (
              <img src={fotoPerfil} alt="Prévia" className="mt-2 h-16 w-16 rounded-full object-cover" />
            )}
          </div>
          {msg && (
            <p className={msg.tipo === 'ok' ? 'text-xs text-brand' : 'text-xs text-accent'}>
              {msg.texto}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving || uploading} size="sm">
              {saving ? 'Salvando...' : barbeiro ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
            {barbeiro && onDone && (
              <Button type="button" variant="ghost" size="sm" onClick={onDone}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
