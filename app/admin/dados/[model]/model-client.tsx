'use client';
// jgnext:admin-data — tela de uma tabela (cliente): busca, lista, criar, editar e excluir. Recebe meta já autenticada do servidor.
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FieldMeta, ModelMeta } from '@/lib/admin-schema';

type Row = Record<string, any>;
type Opt = { id: string | number; label: string };

const fmt = (f: FieldMeta, v: any, opts: Record<string, Opt[]>) => {
  if (v === null || v === undefined || v === '') return '—';
  if (f.relation && opts[f.relation]) return opts[f.relation].find((o) => String(o.id) === String(v))?.label ?? String(v);
  if (f.kind === 'bool') return v ? 'Sim' : 'Não';
  if (f.kind === 'datetime') return new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  if (f.kind === 'decimal') return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (f.kind === 'json') return JSON.stringify(v).slice(0, 40);
  const s = String(v);
  return s.length > 60 ? s.slice(0, 58) + '…' : s;
};
const toInput = (f: FieldMeta, v: any) => {
  if (v === null || v === undefined) return f.kind === 'bool' ? false : '';
  if (f.kind === 'datetime') { const d = new Date(v); return isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
  if (f.kind === 'json') return JSON.stringify(v, null, 2);
  return v;
};

export default function ModelClient({ meta }: { meta: ModelMeta | null }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [opts, setOpts] = useState<Record<string, Opt[]>>({});
  const [form, setForm] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const cols = useMemo(() => (meta ? meta.fields.filter((f) => !f.hidden && f.kind !== 'json' && !(f.kind === 'text' && f.long)).slice(0, 6) : []), [meta]);

  const load = useCallback(async () => {
    if (!meta) return;
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/admin/data/' + meta.name + '?page=' + page + '&q=' + encodeURIComponent(q));
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erro ao carregar.');
      setRows(d.rows); setTotal(d.total);
    } catch (e: any) { setErr(e.message || 'Erro ao carregar.'); } finally { setLoading(false); }
  }, [meta, page, q]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);

  useEffect(() => {
    if (!meta) return;
    const rels = Array.from(new Set(meta.fields.filter((f) => f.relation).map((f) => f.relation as string)));
    rels.forEach(async (m) => {
      try { const r = await fetch('/api/admin/data/' + m + '?options=1'); const d = await r.json(); if (r.ok) setOpts((o) => ({ ...o, [m]: d.options })); } catch { /* sem opções */ }
    });
  }, [meta]);

  if (!meta) return <main className="mx-auto max-w-3xl px-5 py-16"><p>Tabela não encontrada.</p><Link href="/admin/dados" className="text-brand underline">Voltar</Link></main>;

  const openNew = () => { const init: Row = {}; meta.fields.filter((f) => f.writable).forEach((f) => { init[f.name] = f.kind === 'bool' ? (f.defaultBool ?? false) : f.defaultValue ?? ''; }); setEditing(null); setForm(init); setFormErr(''); };
  const openEdit = (row: Row) => { const init: Row = {}; meta.fields.filter((f) => f.writable).forEach((f) => { init[f.name] = toInput(f, row[f.name]); }); setEditing(row); setForm(init); setFormErr(''); };

  const save = async () => {
    if (!form) return;
    setSaving(true); setFormErr('');
    try {
      const url = '/api/admin/data/' + meta.name + (editing ? '/' + encodeURIComponent(editing[meta.idField]) : '');
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Não foi possível salvar.');
      setForm(null); load();
    } catch (e: any) { setFormErr(e.message || 'Não foi possível salvar.'); } finally { setSaving(false); }
  };
  const remove = async (row: Row) => {
    if (!window.confirm('Excluir este registro? Isso não pode ser desfeito.')) return;
    const r = await fetch('/api/admin/data/' + meta.name + '/' + encodeURIComponent(row[meta.idField]), { method: 'DELETE' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(d.error || 'Não foi possível excluir.'); return; }
    load();
  };

  const input = 'w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/admin/dados" className="text-sm text-fg-muted hover:text-fg">← Todas as tabelas</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{meta.label}</h1>
          <p className="mt-1 text-sm text-fg-muted">{total} {total === 1 ? 'registro' : 'registros'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar…" className={input + ' w-56'} />
          <button type="button" onClick={openNew} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg shadow-lg shadow-brand/25 transition hover:-translate-y-0.5">+ Novo</button>
        </div>
      </div>
      {err && <p role="alert" className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-fg-muted">
            <tr>{cols.map((c) => (<th key={c.name} className="px-4 py-3 font-semibold">{c.label}</th>))}<th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={cols.length + 1} className="px-4 py-10 text-center text-fg-muted">Carregando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={cols.length + 1} className="px-4 py-14 text-center text-fg-muted">Nada cadastrado ainda. Clique em <strong>+ Novo</strong> para começar.</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={String(r[meta.idField])} className="border-b border-border/60 transition hover:bg-brand/5">
                {cols.map((c) => (<td key={c.name} className="px-4 py-3">{fmt(c, r[c.name], opts)}</td>))}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button type="button" onClick={() => openEdit(r)} className="mr-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-brand hover:text-brand">Editar</button>
                  <button type="button" onClick={() => remove(r)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-danger transition hover:border-danger">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 50 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border border-border px-4 py-2 disabled:opacity-40">Anterior</button>
          <span>Página {page} de {Math.ceil(total / 50)}</span>
          <button type="button" disabled={page * 50 >= total} onClick={() => setPage(page + 1)} className="rounded-full border border-border px-4 py-2 disabled:opacity-40">Próxima</button>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setForm(null)}>
          <div className="flex h-full w-full max-w-md flex-col bg-bg shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ animation: 'jgx-drawer 280ms cubic-bezier(.2,.8,.2,1) both' }}>
            <style>{'@keyframes jgx-drawer{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}'}</style>
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-display text-xl font-bold">{editing ? 'Editar' : 'Novo'} · {meta.label}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setForm(null)} className="text-2xl leading-none text-fg-muted hover:text-fg">×</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {meta.fields.filter((f) => f.writable).map((f) => (
                <label key={f.name} className="block">
                  <span className="mb-1.5 block text-sm font-semibold">{f.label}{f.required && <span className="text-danger"> *</span>}</span>
                  {f.kind === 'bool' ? (
                    <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} className="h-5 w-5 accent-[hsl(var(--brand))]" />
                  ) : f.kind === 'enum' ? (
                    <select value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input}><option value="">Selecione…</option>{(f.options || []).map((o) => (<option key={o} value={o}>{o}</option>))}</select>
                  ) : f.relation ? (
                    <select value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input}><option value="">Selecione…</option>{(opts[f.relation] || []).map((o) => (<option key={String(o.id)} value={String(o.id)}>{o.label}</option>))}</select>
                  ) : f.kind === 'text' && f.long ? (
                    <textarea rows={4} value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input} />
                  ) : f.kind === 'json' ? (
                    <textarea rows={5} value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input + ' font-mono'} />
                  ) : (
                    <input type={f.kind === 'datetime' ? 'datetime-local' : f.kind === 'int' || f.kind === 'float' || f.kind === 'decimal' ? 'number' : 'text'} step={f.kind === 'int' ? 1 : 'any'} value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input} />
                  )}
                </label>
              ))}
              {formErr && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{formErr}</p>}
            </div>
            <div className="flex gap-3 border-t border-border px-6 py-4">
              <button type="button" onClick={() => setForm(null)} className="flex-1 rounded-full border border-border py-3 text-sm font-semibold">Cancelar</button>
              <button type="button" onClick={save} disabled={saving} className="flex-1 rounded-full bg-brand py-3 text-sm font-semibold text-brand-fg disabled:opacity-60">{saving ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
