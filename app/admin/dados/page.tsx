// jgnext:admin-data — painel do dono: números do negócio, atividade dos últimos 14 dias e atalhos para cada tabela (só o dono).
import Link from 'next/link';
import { MODELS } from '@/lib/admin-schema';
import { ownerOrRedirect } from '@/lib/admin-gate';
import { PACK } from '@/lib/admin-pack';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Painel do dono' };

const DAY = 86400000;

async function stats() {
  const list = Object.values(MODELS).filter((m) => !m.optionsOnly);
  const since = new Date(Date.now() - 13 * DAY);
  since.setHours(0, 0, 0, 0);
  const series = new Array(14).fill(0);
  const rows: { m: (typeof list)[number]; total: number; week: number; last: string[] }[] = [];
  for (const m of list) {
    const d: any = (prisma as any)[m.delegate];
    let total = 0, week = 0, last: string[] = [];
    if (!d) { rows.push({ m, total, week, last }); continue; }
    try { total = await d.count(); } catch { /* tabela inacessível */ }
    const stamp = m.fields.find((f) => f.kind === 'datetime' && /^(createdAt|created_at|criadoEm|date|data|startsAt|inicio)$/i.test(f.name));
    if (stamp) {
      try {
        week = await d.count({ where: { [stamp.name]: { gte: new Date(Date.now() - 7 * DAY) } } });
        const recent: any[] = await d.findMany({ where: { [stamp.name]: { gte: since } }, select: { [stamp.name]: true }, take: 2000 });
        for (const r of recent) {
          const idx = Math.floor((new Date(r[stamp.name]).getTime() - since.getTime()) / DAY);
          if (idx >= 0 && idx < 14) series[idx] += 1;
        }
      } catch { /* sem série */ }
    }
    try {
      const ls = m.labelField;
      const sel: any = { [ls]: true };
      const got: any[] = await d.findMany({ select: sel, take: 3, ...(stamp ? { orderBy: { [stamp.name]: 'desc' } } : {}) });
      last = got.map((g) => String(g[ls] ?? '').slice(0, 40)).filter(Boolean);
    } catch { /* sem prévia */ }
    rows.push({ m, total, week, last });
  }
  return { rows, series };
}

function Spark({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const w = 560, h = 120, step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - 8 - (v / max) * (h - 24)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full" role="img" aria-label="Novos registros nos últimos 14 dias">
      <defs><linearGradient id="adm-spark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".35" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <path d={line + ` L ${w} ${h} L 0 ${h} Z`} fill="url(#adm-spark)" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4.5 : 2} fill="currentColor" />)}
    </svg>
  );
}

export default async function AdminDataIndex() {
  if (!(await ownerOrRedirect())) {
    return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="font-display text-3xl font-bold tracking-tight">Acesso restrito</h1><p className="mt-3 text-fg-muted">Esta área é só para o dono do site.</p></main>;
  }
  const { rows, series } = await stats();
  const totalWeek = rows.reduce((a, r) => a + r.week, 0);
  const totalAll = rows.reduce((a, r) => a + r.total, 0);
  const empty = rows.filter((r) => r.total === 0);
  const top = [...rows].sort((a, b) => b.total - a.total).slice(0, 3);
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">Painel do dono</p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-5xl">Seu negócio, hoje</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">Veja o que entrou nos últimos dias e cadastre ou edite tudo o que aparece no site e nas telas dos clientes.</p>

      {PACK.agenda && (
        <Link href="/admin/agenda" className="group mt-8 flex items-center justify-between gap-4 rounded-3xl border border-brand/40 bg-brand/10 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/10">
          <div><p className="font-display text-xl font-bold tracking-tight">Agenda do dia</p><p className="mt-1 text-sm text-fg-muted">Veja quem atende quem, a que horas, e confirme ou conclua com um toque.</p></div>
          <span aria-hidden="true" className="text-2xl text-brand transition group-hover:translate-x-1">→</span>
        </Link>
      )}

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur lg:col-span-2 text-brand">
          <div className="flex flex-wrap items-end justify-between gap-3 text-fg">
            <div><p className="text-sm text-fg-muted">Novos registros — 14 dias</p><p className="font-display text-5xl font-bold tracking-tight">{series.reduce((a, b) => a + b, 0)}</p></div>
            <div className="flex gap-6 text-sm"><div><p className="text-fg-muted">Esta semana</p><p className="font-display text-2xl font-bold">{totalWeek}</p></div><div><p className="text-fg-muted">No total</p><p className="font-display text-2xl font-bold">{totalAll}</p></div></div>
          </div>
          <div className="mt-4"><Spark data={series} /></div>
        </div>
        <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur">
          <p className="text-sm text-fg-muted">Mais movimentadas</p>
          <ul className="mt-4 space-y-4">
            {top.map((r) => (
              <li key={r.m.name}>
                <div className="flex items-baseline justify-between"><Link href={'/admin/dados/' + r.m.name} className="font-semibold hover:text-brand">{r.m.label}</Link><span className="font-display text-xl font-bold">{r.total}</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-brand" style={{ width: Math.max(6, (r.total / Math.max(1, top[0].total)) * 100) + '%' }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {empty.length > 0 && (
        <div className="mt-4 rounded-3xl border border-brand/40 bg-brand/5 p-6">
          <p className="font-display text-lg font-bold">Comece por aqui</p>
          <p className="mt-1 text-sm text-fg-muted">Estas tabelas ainda estão vazias e alimentam o seu site. Preencha para ele ganhar vida:</p>
          <div className="mt-4 flex flex-wrap gap-2">{empty.map((r) => <Link key={r.m.name} href={'/admin/dados/' + r.m.name} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5">+ {r.m.label}</Link>)}</div>
        </div>
      )}

      <h2 className="font-display mt-12 text-xl font-bold tracking-tight">Todas as tabelas</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Link key={r.m.name} href={'/admin/dados/' + r.m.name} className="group rounded-2xl border border-border bg-surface/80 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-brand hover:shadow-xl hover:shadow-brand/10">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold tracking-tight">{r.m.label}</h3>
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-sm font-bold text-brand">{r.total}</span>
            </div>
            <p className="mt-1 text-sm text-fg-muted">{r.week > 0 ? `+${r.week} nesta semana` : `${r.m.fields.filter((f) => f.writable).length} campos`}</p>
            {r.last.length > 0 && <p className="mt-3 truncate text-xs text-fg-muted">Último: <span className="text-fg">{r.last[0]}</span></p>}
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">Abrir <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span></span>
          </Link>
        ))}
      </div>
    </main>
  );
}
