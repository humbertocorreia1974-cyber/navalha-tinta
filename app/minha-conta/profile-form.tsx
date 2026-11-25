'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  initialName: string;
  initialPhone: string;
  email: string;
};

export function ProfileForm({ initialName, initialPhone, email }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Não foi possível salvar.');
      setMsg({ type: 'ok', text: 'Dados atualizados.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro inesperado.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-fg-muted">Nome completo</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={120}
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm text-fg-muted">Telefone (WhatsApp)</label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          maxLength={20}
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-fg-muted">E-mail</label>
        <Input id="email" value={email} disabled readOnly />
        <p className="mt-1 text-xs text-fg-muted">Para trocar o e-mail, fale com o suporte.</p>
      </div>
      {msg && (
        <p className={msg.type === 'ok' ? 'text-sm text-brand' : 'text-sm text-accent'}>
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  );
}
