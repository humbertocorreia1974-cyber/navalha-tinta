// jgnext:admin-data — lista / cria registros de qualquer tabela do negócio (só o dono).
import { NextResponse } from 'next/server';
import { guard, coerce, friendly } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { model: string } }) {
  if (params.model === '_me') {
    const g = await guard(null);
    if ('error' in g) return g.error;
    return NextResponse.json({ ok: true });
  }
  const g = await guard(params.model);
  if ('error' in g) return g.error;
  const { meta, db } = g as any;
  const url = new URL(req.url);
  try {
    if (url.searchParams.get('options')) {
      const rows = await db.findMany({ take: 200, select: meta.select, orderBy: { [meta.idField]: 'desc' } });
      return NextResponse.json({ options: rows.map((r: any) => ({ id: r[meta.idField], label: String(r[meta.labelField] ?? r[meta.idField]) })) });
    }
    if (meta.optionsOnly) return NextResponse.json({ error: 'Esta tabela não é listada aqui.' }, { status: 403 });
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const q = (url.searchParams.get('q') || '').trim().slice(0, 80);
    const textFields = meta.fields.filter((f: any) => f.kind === 'text' && !f.hidden).slice(0, 6);
    const where = q && textFields.length ? { OR: textFields.map((f: any) => ({ [f.name]: { contains: q, mode: 'insensitive' } })) } : undefined;
    const [rows, total] = await Promise.all([
      db.findMany({ where, select: meta.select, take: 50, skip: (page - 1) * 50, orderBy: { [meta.idField]: 'desc' } }),
      db.count({ where }),
    ]);
    return NextResponse.json({ rows, total, page });
  } catch (e: any) {
    return NextResponse.json({ error: 'Não foi possível carregar os dados.' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { model: string } }) {
  const g = await guard(params.model, true);
  if ('error' in g) return g.error;
  const { meta, db } = g as any;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  const { data, errors } = coerce(meta, body, 'create');
  if (errors.length) return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
  try {
    const row = await db.create({ data, select: meta.select });
    return NextResponse.json({ row }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: friendly(e) }, { status: 400 });
  }
}
