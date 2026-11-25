'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarbeiroForm } from './barbeiro-form-client';

type Barbeiro = {
  id: string;
  nomeCompleto: string;
  apelido: string | null;
  emailContato: string;
  telefoneCelular: string;
  fotoPerfil: string | null;
  especialidades: string | null;
  bio: string | null;
  ativo: boolean;
  totalAgendamentos: number;
  totalGaleria: number;
};

export function BarbeiroRow({ barbeiro }: { barbeiro: Barbeiro }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function alternarAtivo() {
    setBusy(true);
    setErro(null);
    try {
      const res = await fetch(`/api/admin/barbers/${barbeiro.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !barbeiro.ativo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Falha');
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro');
    } finally {
      setBusy(false);
    }
  }

  if (editando) {
    return (
      <li className="py-4">
        <BarbeiroForm barbeiro={barbeiro} onDone={() => setEditando(false)} />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      {barbeiro.fotoPerfil ? (
        <img
          src={barbeiro.fotoPerfil}
          alt={barbeiro.nomeCompleto}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
          {barbeiro.nomeCompleto.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-fg">{barbeiro.nomeCompleto}</p>
          {barbeiro.apelido && (
            <span className="text-xs text-fg-muted">({barbeiro.apelido})</span>
          )}
          <span
            className={
              barbeiro.ativo
                ? 'rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand'
                : 'rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent'
            }
          >
            {barbeiro.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <p className="truncate text-xs text-fg-muted">
          {barbeiro.emailContato} · {barbeiro.telefoneCelular}
        </p>
        {barbeiro.especialidades && (
          <p className="truncate text-xs text-fg-muted">Especialidades: {barbeiro.especialidades}</p>
        )}
        <p className="mt-1 text-[11px] text-fg-muted">
          {barbeiro.totalAgendamentos} agendamento{barbeiro.totalAgendamentos === 1 ? '' : 's'} ·{' '}
          {barbeiro.totalGaleria} item{barbeiro.totalGaleria === 1 ? '' : 's'} na galeria
        </p>
        {erro && <p className="mt-1 text-xs text-accent">{erro}</p>}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditando(true)}>
          Editar
        </Button>
        <Button variant="secondary" size="sm" onClick={alternarAtivo} disabled={busy}>
          {busy ? '...' : barbeiro.ativo ? 'Desativar' : 'Reativar'}
        </Button>
      </div>
    </li>
  );
}
