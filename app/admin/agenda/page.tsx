// jgnext:admin-pack — Agenda do dia do dono (só o dono): quem atende, que horas, status com um toque.
import Link from 'next/link';
import { MODELS } from '@/lib/admin-schema';
import { PACK } from '@/lib/admin-pack';
import { ownerOrRedirect } from '@/lib/admin-gate';
import { prisma } from '@/lib/prisma';
import AgendaClient from './agenda-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Agenda do dia' };

const TZ = '-03:00';
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function AgendaPage({ searchParams }: { searchParams: { d?: string } }) {
  if (!(await ownerOrRedirect())) {
    return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="font-display text-3xl font-bold tracking-tight">Acesso restrito</h1><p className="mt-3 text-fg-muted">Esta área é só para o dono do site.</p></main>;
  }
  const cfg = PACK.agenda;
  const meta = cfg ? MODELS[cfg.model] : null;
  if (!cfg || !meta) {
    return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="font-display text-3xl font-bold tracking-tight">Agenda indisponível</h1><p className="mt-3 text-fg-muted">Este app não tem uma tabela de agendamentos.</p><Link href="/admin/dados" className="mt-6 inline-block font-semibold text-brand">← Painel do dono</Link></main>;
  }
  const raw = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.d || '') ? (searchParams!.d as string) : new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
  // campo só-data (dia + hora em texto) é guardado à meia-noite UTC; campo com horário usa o fuso de Brasília
  const dateOnly = !!cfg.timeField;
  const start = new Date(raw + 'T00:00:00' + (dateOnly ? 'Z' : TZ));
  const end = new Date(start.getTime() + 86400000);
  const base = new Date(raw + 'T12:00:00Z');
  const db: any = (prisma as any)[meta.delegate];
  let rows: any[] = [];
  try { rows = await db.findMany({ where: { [cfg.dateField]: { gte: start, lt: end } }, select: meta.select, orderBy: { [cfg.dateField]: 'asc' }, take: 300 }); } catch { rows = []; }

  // nomes legíveis para cada vínculo (barbeiro, serviço, cliente…)
  const labels: Record<string, Record<string, string>> = {};
  for (const rel of cfg.relations) {
    const rm = MODELS[rel.model];
    const ids = Array.from(new Set(rows.map((r) => r[rel.field]).filter(Boolean)));
    labels[rel.field] = {};
    if (!rm || !ids.length) continue;
    try {
      const got: any[] = await (prisma as any)[rm.delegate].findMany({ where: { [rm.idField]: { in: ids } }, select: { [rm.idField]: true, [rm.labelField]: true } });
      for (const g of got) labels[rel.field][String(g[rm.idField])] = String(g[rm.labelField] ?? '');
    } catch { /* sem nomes */ }
  }
  const items = rows.map((r) => ({
    id: String(r[meta.idField]),
    at: new Date(r[cfg.dateField]).toISOString(),
    time: cfg.timeField ? String(r[cfg.timeField] ?? '') : null,
    status: cfg.statusField ? String(r[cfg.statusField] ?? '') : '',
    title: String((cfg.clientNameField ? r[cfg.clientNameField] : null) ?? r[meta.labelField] ?? ''),
    rel: Object.fromEntries(cfg.relations.map((x) => [x.field, labels[x.field]?.[String(r[x.field])] || ''])),
  }));
  if (cfg.timeField) items.sort((a, b) => String(a.time).localeCompare(String(b.time)));
  const prev = iso(new Date(base.getTime() - 86400000));
  const next = iso(new Date(base.getTime() + 86400000));
  const pretty = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(base);
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <Link href="/admin/dados" className="text-sm font-semibold text-brand">← Painel do dono</Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand">Agenda</p>
      <h1 className="font-display mt-2 text-3xl font-bold capitalize tracking-tight sm:text-5xl">{pretty}</h1>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href={'/admin/agenda?d=' + prev} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-brand">← Anterior</Link>
        <Link href="/admin/agenda" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-brand">Hoje</Link>
        <Link href={'/admin/agenda?d=' + next} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-brand">Próximo →</Link>
        <Link href={'/admin/dados/' + meta.name} className="ml-auto rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">+ Novo {meta.label.toLowerCase()}</Link>
      </div>
      <AgendaClient model={meta.name} cfg={cfg} items={items} />
    </main>
  );
}
