'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Address = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const EMPTY: Address = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
};

export function AddressForm({ initial }: { initial: Address | null }) {
  const router = useRouter();
  const [form, setForm] = useState<Address>(initial ?? EMPTY);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  function set<K extends keyof Address>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/account/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Não foi possível salvar o endereço.');
      setMsg({ type: 'ok', text: 'Endereço salvo.' });
      router.refresh();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro inesperado.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label htmlFor="cep" className="mb-1 block text-sm text-fg-muted">CEP</label>
          <Input id="cep" value={form.cep} onChange={(e) => set('cep', e.target.value)} required maxLength={9} />
        </div>
        <div className="col-span-2">
          <label htmlFor="logradouro" className="mb-1 block text-sm text-fg-muted">Logradouro</label>
          <Input id="logradouro" value={form.logradouro} onChange={(e) => set('logradouro', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="numero" className="mb-1 block text-sm text-fg-muted">Número</label>
          <Input id="numero" value={form.numero} onChange={(e) => set('numero', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label htmlFor="complemento" className="mb-1 block text-sm text-fg-muted">Complemento</label>
          <Input id="complemento" value={form.complemento} onChange={(e) => set('complemento', e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor="bairro" className="mb-1 block text-sm text-fg-muted">Bairro</label>
        <Input id="bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} required />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label htmlFor="cidade" className="mb-1 block text-sm text-fg-muted">Cidade</label>
          <Input id="cidade" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} required />
        </div>
        <div>
          <label htmlFor="estado" className="mb-1 block text-sm text-fg-muted">UF</label>
          <Input id="estado" value={form.estado} onChange={(e) => set('estado', e.target.value.toUpperCase())} required maxLength={2} />
        </div>
      </div>
      {msg && (
        <p className={msg.type === 'ok' ? 'text-sm text-brand' : 'text-sm text-accent'}>
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar endereço'}
      </Button>
    </form>
  );
}
