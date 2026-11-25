'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) {
      setMsg({ type: 'err', text: 'A nova senha precisa ter ao menos 8 caracteres.' });
      return;
    }
    if (next !== confirm) {
      setMsg({ type: 'err', text: 'A confirmação não confere.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Não foi possível trocar a senha.');
      setMsg({ type: 'ok', text: 'Senha atualizada.' });
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro inesperado.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="current" className="mb-1 block text-sm text-fg-muted">Senha atual</label>
        <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="next" className="mb-1 block text-sm text-fg-muted">Nova senha</label>
        <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm text-fg-muted">Confirmar nova senha</label>
        <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
      </div>
      {msg && (
        <p className={msg.type === 'ok' ? 'text-sm text-brand' : 'text-sm text-accent'}>
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Atualizando...' : 'Trocar senha'}
      </Button>
    </form>
  );
}
