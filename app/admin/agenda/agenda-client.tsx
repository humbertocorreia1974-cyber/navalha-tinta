'use client';
// jgnext:admin-pack — agenda do dia: agrupa por profissional e troca o status com um toque.
import { useMemo, useState } from 'react';

type Item = { id: string; at: string; time?: string | null; status: string; title: string; rel: Record<string, string> };
type Cfg = { statusField: string | null; statusOptions: string[]; relations: { field: string; model: string; label: string; person?: boolean }[] };

const tone = (s: string) => /cancel|falt|no.?show|recus|perd/i.test(s) ? 'bg-red-500/15 text-red-600 border-red-500/30'
  : /conclu|feito|done|atendid|finaliz|pago|confirm/i.test(s) ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
  : 'bg-amber-500/15 text-amber-600 border-amber-500/30';
const nice = (s: string) => String(s).replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
const hhmm = (iso: string) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));

export default function AgendaClient({ model, cfg, items }: { model: string; cfg: Cfg; items: Item[] }) {
  const [list, setList] = useState(items);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const personRel = cfg.relations.find((r) => r.person) || cfg.relations[0];
  const groups = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const it of list) {
      const k = (personRel && it.rel[personRel.field]) || 'Sem profissional definido';
      m.set(k, [...(m.get(k) || []), it]);
    }
    return Array.from(m.entries());
  }, [list, personRel]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const it of list) c[it.status || '—'] = (c[it.status || '—'] || 0) + 1;
    return c;
  }, [list]);

  async function setStatus(id: string, status: string) {
    if (!cfg.statusField) return;
    setBusy(id); setErr('');
    try {
      const r = await fetch(`/api/admin/data/${model}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [cfg.statusField]: status }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Não foi possível atualizar.');
      setList((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    } catch (e: any) { setErr(e.message || 'Falha ao atualizar.'); }
    setBusy(null);
  }

  if (!list.length) return <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface/70 p-10 text-center backdrop-blur"><p className="font-display text-xl font-bold">Dia livre</p><p className="mt-1 text-fg-muted">Nenhum agendamento para esta data.</p></div>;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-fg px-3 py-1 text-xs font-bold text-bg">{list.length} no dia</span>
        {Object.entries(counts).map(([k, v]) => <span key={k} className={'rounded-full border px-3 py-1 text-xs font-semibold ' + tone(k)}>{v} · {nice(k)}</span>)}
      </div>
      {err && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{err}</p>}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {groups.map(([who, its]) => (
          <section key={who} className="rounded-3xl border border-border bg-surface/80 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/15 font-display font-bold text-brand">{who.slice(0, 1).toUpperCase()}</span>
              <div><h2 className="font-display text-lg font-bold tracking-tight">{who}</h2><p className="text-xs text-fg-muted">{its.length} atendimento{its.length > 1 ? 's' : ''}</p></div>
            </div>
            <ol className="mt-4 space-y-3">
              {its.map((it) => (
                <li key={it.id} className="rounded-2xl border border-border bg-bg/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-xl font-bold tabular-nums">{it.time || hhmm(it.at)}</p>
                      <p className="truncate text-sm font-semibold">{it.title}</p>
                      <p className="truncate text-xs text-fg-muted">{cfg.relations.filter((r) => !r.person).map((r) => it.rel[r.field]).filter(Boolean).filter((x) => x !== it.title).join(' · ')}</p>
                    </div>
                    {it.status && <span className={'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ' + tone(it.status)}>{nice(it.status)}</span>}
                  </div>
                  {cfg.statusField && cfg.statusOptions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cfg.statusOptions.filter((o) => o !== it.status).map((o) => (
                        <button key={o} type="button" disabled={busy === it.id} onClick={() => setStatus(it.id, o)} className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition hover:border-brand hover:text-brand disabled:opacity-50">{nice(o)}</button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
