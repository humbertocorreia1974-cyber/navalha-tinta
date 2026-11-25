'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Service = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao: number;
  preco: number;
  categoria: string;
};
type Barber = {
  id: string;
  nome: string;
  apelido: string | null;
  especialidades: string | null;
  foto: string | null;
  bio: string | null;
};

type Step = 1 | 2 | 3 | 4;

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function nextDays(count: number) {
  const out: { iso: string; label: string; weekday: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    out.push({ iso, label, weekday });
  }
  return out;
}

export function BookingWizard({ services, barbers }: { services: Service[]; barbers: Barber[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [coupon, setCoupon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => nextDays(14), []);
  const service = services.find((s) => s.id === serviceId) ?? null;
  const barber = barbers.find((b) => b.id === barberId) ?? null;

  useEffect(() => {
    if (!barberId || !date) return;
    let alive = true;
    setLoadingSlots(true);
    setSlots([]);
    setTime(null);
    const qs = new URLSearchParams({ date });
    if (serviceId) qs.set('serviceId', serviceId);
    fetch(`/api/barbers/${barberId}/availability?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setSlots(Array.isArray(data.slots) ? data.slots : []);
      })
      .catch(() => {
        if (alive) setSlots([]);
      })
      .finally(() => {
        if (alive) setLoadingSlots(false);
      });
    return () => {
      alive = false;
    };
  }, [barberId, date, serviceId]);

  async function submit() {
    if (!serviceId || !barberId || !date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, barberId, date, time, notes, couponCode: coupon }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Nao foi possivel concluir o agendamento.');
        setSubmitting(false);
        return;
      }
      router.push(`/agendamento/confirmacao?id=${data.id}`);
    } catch {
      setError('Falha de conexao. Tente novamente.');
      setSubmitting(false);
    }
  }

  const stepLabel = ['Servico', 'Barbeiro', 'Data', 'Horario'];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <ol className="mb-8 flex flex-wrap gap-2 text-xs">
          {stepLabel.map((label, i) => {
            const n = (i + 1) as Step;
            const active = step === n;
            const done = step > n;
            return (
              <li
                key={label}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  active
                    ? 'border-brand bg-brand/10 text-brand'
                    : done
                      ? 'border-border bg-surface text-fg'
                      : 'border-border text-fg-muted'
                }`}
              >
                {n}. {label}
              </li>
            );
          })}
        </ol>

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => {
              const active = serviceId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setServiceId(s.id);
                    setStep(2);
                  }}
                  className={`hover-lift rounded-lg border p-4 text-left transition-all duration-150 ${
                    active ? 'border-brand bg-brand/5' : 'border-border bg-surface hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-lg">{s.nome}</span>
                    <span className="text-sm text-brand">{brl(s.preco)}</span>
                  </div>
                  {s.descricao && <p className="mt-1 text-sm text-fg-muted">{s.descricao}</p>}
                  <p className="mt-2 text-xs uppercase tracking-wider text-fg-muted">
                    {s.duracao} min · {s.categoria}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {barbers.map((b) => {
              const active = barberId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBarberId(b.id);
                    setStep(3);
                  }}
                  className={`hover-lift flex gap-3 rounded-lg border p-4 text-left transition-all duration-150 ${
                    active ? 'border-brand bg-brand/5' : 'border-border bg-surface hover:bg-white/5'
                  }`}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-bg">
                    {b.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.foto} alt={b.nome} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-lg text-brand">
                        {b.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg leading-tight">{b.apelido ?? b.nome}</p>
                    {b.especialidades && (
                      <p className="mt-1 text-xs uppercase tracking-wider text-fg-muted">
                        {b.especialidades}
                      </p>
                    )}
                    {b.bio && <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{b.bio}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
              {days.map((d) => {
                const active = date === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setDate(d.iso);
                      setStep(4);
                    }}
                    className={`rounded-lg border px-2 py-3 text-center transition-all duration-150 ${
                      active
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border bg-surface text-fg hover:bg-white/5'
                    }`}
                  >
                    <span className="block text-[10px] uppercase tracking-wider text-fg-muted">
                      {d.weekday}
                    </span>
                    <span className="mt-1 block font-display text-base">{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            {loadingSlots ? (
              <p className="text-sm text-fg-muted">Carregando horarios...</p>
            ) : slots.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-6 text-center">
                <p className="text-fg-muted">
                  Nenhum horario livre para este dia. Escolha outra data.
                </p>
                <Button variant="secondary" className="mt-4" onClick={() => setStep(3)}>
                  Trocar data
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((s) => {
                  const active = time === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTime(s)}
                      className={`rounded-md border px-2 py-2 text-sm transition-all duration-150 ${
                        active
                          ? 'border-brand bg-brand text-brand-fg'
                          : 'border-border bg-surface text-fg hover:bg-white/5'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
                  Observacoes (opcional)
                </span>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: maquina 1 nas laterais"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wider text-fg-muted">
                  Cupom (opcional)
                </span>
                <Input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="NAVALHA10"
                />
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" disabled={!time || submitting} onClick={submit}>
                {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
              </Button>
              <Button variant="ghost" onClick={() => setStep(3)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-border bg-surface p-5 lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-[0.25em] text-brand">Resumo</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">Servico</dt>
            <dd className="text-right">{service ? service.nome : 'Escolha acima'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">Barbeiro</dt>
            <dd className="text-right">{barber ? barber.apelido ?? barber.nome : 'Escolha acima'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">Data</dt>
            <dd className="text-right">{date ?? 'Escolha acima'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">Horario</dt>
            <dd className="text-right">{time ?? 'Escolha acima'}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-3">
            <dt className="text-fg-muted">Total</dt>
            <dd className="font-display text-lg text-brand">
              {service ? brl(service.preco) : 'R$ 0,00'}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-fg-muted">
          Antecedencia minima de 2 horas. Cancelamento gratuito ate 12 horas antes do horario.
        </p>
      </aside>
    </div>
  );
}
