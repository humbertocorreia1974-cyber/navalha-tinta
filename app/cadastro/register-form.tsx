'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  terms: boolean;
};

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  terms: false,
};

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (form.name.trim().length < 2) return 'Informe seu nome completo.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Informe um e-mail válido.';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) return 'Informe um telefone com DDD.';
    if (form.password.length < 8)
      return 'A senha precisa ter no mínimo 8 caracteres.';
    if (form.password !== form.confirm) return 'As senhas não conferem.';
    if (!form.terms)
      return 'É necessário aceitar os Termos e a Política de Privacidade.';
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\D/g, ''),
          password: form.password,
          termsAcceptedAt: new Date().toISOString(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível criar sua conta.');
        setLoading(false);
        return;
      }
      router.push('/login?registered=1');
    } catch {
      setError('Falha de conexão. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nome completo
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Ex: João da Silva"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">
          Telefone (WhatsApp)
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(11) 91234-5678"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-fg-muted">
          Usamos para enviar lembretes do seu agendamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Senha
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium">
            Confirmar senha
          </label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
            required
          />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-border bg-bg/40 p-3 text-sm">
        <input
          type="checkbox"
          name="terms"
          checked={form.terms}
          onChange={(e) => update('terms', e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[color:var(--brand)]"
          required
        />
        <span className="text-fg-muted">
          Li e aceito os{' '}
          <Link
            href="/termos"
            className="text-brand underline-offset-4 hover:underline"
          >
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link
            href="/privacidade"
            className="text-brand underline-offset-4 hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Criando conta...' : 'Criar minha conta'}
      </Button>

      <p className="text-center text-xs text-fg-muted">
        Seus dados são tratados conforme a LGPD. Você pode solicitar exclusão a
        qualquer momento.
      </p>
    </form>
  );
}
