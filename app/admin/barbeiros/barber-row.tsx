'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarberForm } from './barber-form';

type BarberUser = { id: string; name: string; email: string };

type Barber = {
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
  totalAgendamentos: number;
  userEmail: string | null;
};

export function BarberRow({
  barber,
  barberUsers,
}: {
  barber: Barber;
  barberUsers: BarberUser[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleAtivo() {
    setBusy(true);
    try {
      await fetch(`/api/admin/barbers/${barber.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !barber.ativo }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remover() {
    if (!confirm(`Remover ${barber.nomeCompleto}? Só é possível se não houver agendamentos.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/barbers/${barber.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || 'Não foi possível remover');
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-start gap-4">
          {barber.fotoPerfil ? (
            <img
              src={barber.fotoPerfil}
              alt={barber.nomeCompleto}
              className="h-16 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-brand/10 font-display text-xl text-brand">
              {barber.nomeCompleto.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg text-fg">
                {barber.apelido || barber.nomeCompleto}
              </h3>
              <span
                className={
                  'rounded-full px-2 py-0.5 text-xs ' +
                  (barber.ativo
                    ? 'bg-brand/10 text-brand'
                    : 'bg-fg-muted/10 text-fg-muted')
                }
              >
                {barber.ativo ? 'Ativo' : 'Inativo'}
              </span>
              <span className="text-xs text-fg-muted">
                {barber.totalAgendamentos} agendamentos
              </span>
            </div>
            <p className="mt-1 text-sm text-fg-muted">
              {barber.emailContato} · {barber.telefoneCelular}
            </p>
            {barber.especialidades && (
              <p className="mt-1 text-xs text-fg-muted">Especialidades: {barber.especialidades}</p>
            )}
            {barber.userEmail && (
              <p className="mt-1 text-xs text-fg-muted">Login vinculado: {barber.userEmail}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Fechar' : 'Editar'}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleAtivo} disabled={busy}>
              {barber.ativo ? 'Desativar' : 'Ativar'}
            </Button>
            <Button variant="ghost" size="sm" onClick={remover} disabled={busy}>
              Remover
            </Button>
          </div>
        </div>

        {editing && (
          <div className="mt-4 border-t border-border pt-4">
            <BarberForm
              barberUsers={barberUsers}
              initial={{
                id: barber.id,
                nomeCompleto: barber.nomeCompleto,
                apelido: barber.apelido,
                emailContato: barber.emailContato,
                telefoneCelular: barber.telefoneCelular,
                fotoPerfil: barber.fotoPerfil,
                especialidades: barber.especialidades,
                bio: barber.bio,
                ativo: barber.ativo,
                userId: barber.userId,
              }}
              onDone={() => setEditing(false)}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
