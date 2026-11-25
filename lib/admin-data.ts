// jgnext:admin-data — guarda de acesso + conversão de tipos do painel de dados (gerado a partir do schema.prisma).
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MODELS, type ModelMeta } from '@/lib/admin-schema';

const ADMIN = /^(admin|administrador|dono|owner|superadmin|super_admin|gerente)$/i;

type Guard = { error: NextResponse } | { meta: ModelMeta | null; db: any };

/** Só o dono entra. `modelName === null` apenas confirma o acesso. `edit` bloqueia tabelas só-leitura de opções. */
export async function guard(modelName: string | null, edit = false): Promise<Guard> {
  const session: any = await getServerSession(authOptions as any);
  const email = session?.user?.email;
  if (!email) return { error: NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 }) };
  const me = await (prisma as any).user.findUnique({ where: { email }, select: { role: true } }).catch(() => null);
  if (!me || !ADMIN.test(String(me.role))) return { error: NextResponse.json({ error: 'Acesso restrito ao dono.' }, { status: 403 }) };
  if (modelName === null) return { meta: null, db: null };
  const meta = MODELS[modelName];
  if (!meta) return { error: NextResponse.json({ error: 'Tabela não encontrada.' }, { status: 404 }) };
  if (edit && meta.optionsOnly) return { error: NextResponse.json({ error: 'Esta tabela não é editável aqui.' }, { status: 403 }) };
  return { meta, db: (prisma as any)[meta.delegate] };
}

export function coerce(meta: ModelMeta, body: any, mode: 'create' | 'update') {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  for (const f of meta.fields) {
    if (!f.writable) continue;
    const v = body?.[f.name];
    const missing = v === undefined || v === null || v === '';
    if (missing) {
      if (mode === 'create' && f.required) errors.push(f.label + ' é obrigatório.');
      else if (mode === 'update' && body && f.name in body && f.optional) data[f.name] = null;
      continue;
    }
    switch (f.kind) {
      case 'int': {
        const n = Number(v);
        if (!Number.isInteger(n)) errors.push(f.label + ' deve ser um número inteiro.'); else data[f.name] = n;
        break;
      }
      case 'float':
      case 'decimal': {
        const n = Number(String(v).replace(',', '.'));
        if (!Number.isFinite(n)) errors.push(f.label + ' deve ser um número.'); else data[f.name] = f.kind === 'decimal' ? String(n) : n;
        break;
      }
      case 'bool':
        data[f.name] = v === true || v === 'true' || v === 1 || v === '1';
        break;
      case 'datetime': {
        const d = new Date(v);
        if (isNaN(d.getTime())) errors.push(f.label + ' não é uma data válida.'); else data[f.name] = d;
        break;
      }
      case 'json':
        try { data[f.name] = typeof v === 'string' ? JSON.parse(v) : v; } catch { errors.push(f.label + ' não é um JSON válido.'); }
        break;
      case 'enum':
        if (!f.options || !f.options.includes(String(v))) errors.push(f.label + ' tem um valor inválido.'); else data[f.name] = String(v);
        break;
      default:
        data[f.name] = String(v).slice(0, 5000);
    }
  }
  return { data, errors };
}

export function friendly(e: any): string {
  const code = e?.code;
  if (code === 'P2002') return 'Já existe um registro com esse valor (campo único).';
  if (code === 'P2003') return 'Escolha um item válido na lista ou remova os vínculos antes de excluir.';
  if (code === 'P2025') return 'Registro não encontrado.';
  return 'Não foi possível salvar. Confira os campos e tente de novo.';
}
