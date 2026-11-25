'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarberFormClient } from './barber-form-client';

type Props = {
  id: string;
  ativo: boolean;
  nomeCompleto: string;
  apelido: string;
  emailContato: string;
  telefoneCelular: string;
  especialidades: string;
  bio: string;
  fotoPerfil: string;
};

export function BarberRowActions(props: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleAtivo() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/barbers/${props.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !props.ativo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  }

  async function remover() {
    if (!confirm(`Remover ${props.nomeCompleto}? Esta ação não pode ser desfeita.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/barbers/${props.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao remover');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 shadow-xl">
          <h3 className="mb-4 font-display text-lg font-semibold">
            Editar {props.nomeCompleto}
          </h3>
          <BarberFormClient
            mode="edit"
            initial={props}
            onDone={() => {
              setEditing(false);
              router.refresh();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={busy}>
        Editar
      </Button>
      <Button size="sm" variant="ghost" onClick={toggleAtivo} disabled={busy}>
        {props.ativo ? 'Desativar' : 'Ativar'}
      </Button>
      <Button size="sm" variant="ghost" onClick={remover} disabled={busy}>
        Remover
      </Button>
      {error && <p className="w-full text-right text-xs text-accent">{error}</p>}
    </div>
  );
}
