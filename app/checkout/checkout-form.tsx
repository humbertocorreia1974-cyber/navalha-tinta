'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody, CardTitle } from '@/components/ui/card';

type Endereco = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export default function CheckoutForm({
  enderecoPrincipal,
  cupom,
  logado,
  nomeInicial,
  emailInicial,
}: {
  enderecoPrincipal: Endereco | null;
  cupom: string;
  logado: boolean;
  nomeInicial: string;
  emailInicial: string;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeInicial);
  const [email, setEmail] = useState(emailInicial);
  const [telefone, setTelefone] = useState('');
  const [metodo, setMetodo] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
  const [cep, setCep] = useState(enderecoPrincipal?.cep ?? '');
  const [logradouro, setLogradouro] = useState(enderecoPrincipal?.logradouro ?? '');
  const [numero, setNumero] = useState(enderecoPrincipal?.numero ?? '');
  const [complemento, setComplemento] = useState(enderecoPrincipal?.complemento ?? '');
  const [bairro, setBairro] = useState(enderecoPrincipal?.bairro ?? '');
  const [cidade, setCidade] = useState(enderecoPrincipal?.cidade ?? '');
  const [estado, setEstado] = useState(enderecoPrincipal?.estado ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const enderecoEntrega = `${logradouro}, ${numero}${
        complemento ? ` - ${complemento}` : ''
      }, ${bairro}, ${cidade} - ${estado}, CEP ${cep}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCliente: nome,
          emailCliente: email,
          telefoneCliente: telefone,
          metodoPagamento: metodo,
          enderecoEntrega,
          cupom: cupom || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? 'Não foi possível concluir o pedido.');
        setEnviando(false);
        return;
      }
      router.push(`/meus-pedidos?status=${data.numeroPedido}`);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardBody>
          <CardTitle className="mb-4">Dados de contato</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-fg-muted mb-1">Nome completo</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs text-fg-muted mb-1">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-fg-muted mb-1">Telefone (WhatsApp)</label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>
          {!logado && (
            <p className="text-xs text-fg-muted mt-3">
              Você pode finalizar como visitante. Para acompanhar pedidos,{' '}
              <a href="/login" className="text-brand underline">
                entre na sua conta
              </a>
              .
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle className="mb-4">Endereço de entrega</CardTitle>
          <div className="grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="block text-xs text-fg-muted mb-1">CEP</label>
              <Input value={cep} onChange={(e) => setCep(e.target.value)} required />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs text-fg-muted mb-1">Logradouro</label>
              <Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-fg-muted mb-1">Número</label>
              <Input value={numero} onChange={(e) => setNumero(e.target.value)} required />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs text-fg-muted mb-1">Complemento</label>
              <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-fg-muted mb-1">Bairro</label>
              <Input value={bairro} onChange={(e) => setBairro(e.target.value)} required />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs text-fg-muted mb-1">Cidade</label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} required />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs text-fg-muted mb-1">UF</label>
              <Input
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                required
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardTitle className="mb-4">Forma de pagamento</CardTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['pix', 'cartao', 'dinheiro'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodo(m)}
                className={`rounded-md border px-4 py-3 text-sm text-left transition-colors ${
                  metodo === m
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-border bg-surface text-fg hover:bg-white/5'
                }`}
              >
                <span className="block font-medium capitalize">
                  {m === 'cartao' ? 'Cartão' : m === 'pix' ? 'Pix' : 'Dinheiro'}
                </span>
                <span className="block text-xs text-fg-muted mt-1">
                  {m === 'pix'
                    ? 'Aprovação imediata'
                    : m === 'cartao'
                    ? 'Crédito ou débito'
                    : 'Pague na entrega'}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {erro && (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          {erro}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={enviando}>
        {enviando ? 'Processando...' : 'Confirmar pedido'}
      </Button>
    </form>
  );
}
