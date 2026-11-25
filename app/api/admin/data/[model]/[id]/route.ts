// jgnext:admin-data — edita / exclui um registro (só o dono).
import { NextResponse } from 'next/server';
import { guard, coerce, friendly } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

const idOf = (meta: any, raw: string) => (meta.idKind === 'int' ? Number(raw) : raw);

export async function PUT(req: Request, { params }: { params: { model: string; id: string } }) {
  const g = await guard(params.model, true);
  if ('error' in g) return g.error;
  const { meta, db } = g as any;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  const { data, errors } = coerce(meta, body, 'update');
  if (errors.length) return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
  try {
    const row = await db.update({ where: { [meta.idField]: idOf(meta, params.id) }, data, select: meta.select });
    return NextResponse.json({ row });
  } catch (e: any) {
    return NextResponse.json({ error: friendly(e) }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { model: string; id: string } }) {
  const g = await guard(params.model, true);
  if ('error' in g) return g.error;
  const { meta, db } = g as any;
  try {
    await db.delete({ where: { [meta.idField]: idOf(meta, params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: friendly(e) }, { status: 409 });
  }
}
