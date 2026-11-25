import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const barbers = await prisma.barber.findMany({
    orderBy: [{ ativo: 'desc' }, { nomeCompleto: 'asc' }],
  });
  return NextResponse.json({ barbers });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/barbers/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const nomeCompleto = String(body?.nomeCompleto || '').trim();
  const emailContato = String(body?.emailContato || '').trim();
  const telefoneCelular = String(body?.telefoneCelular || '').trim();
  if (!nomeCompleto || !emailContato || !telefoneCelular) {
    return NextResponse.json(
      { error: 'Nome, e-mail e telefone são obrigatórios' },
      { status: 400 }
    );
  }

  const userId = body?.userId ? String(body.userId) : null;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 400 });
    const existing = await prisma.barber.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json(
        { error: 'Este usuário já está vinculado a outro barbeiro' },
        { status: 400 }
      );
    }
  }

  const barber = await prisma.barber.create({
    data: {
      nomeCompleto,
      apelido: body?.apelido ? String(body.apelido).trim() : null,
      emailContato,
      telefoneCelular,
      fotoPerfil: body?.fotoPerfil ? String(body.fotoPerfil) : null,
      especialidades: body?.especialidades ? String(body.especialidades).trim() : null,
      bio: body?.bio ? String(body.bio).trim() : null,
      ativo: body?.ativo !== false,
      userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: 'barber.create',
      entidadeAfetada: 'Barber',
      usuarioResponsavel: session.user.email || session.user.id,
      detalhesEvento: `Barbeiro ${barber.nomeCompleto} criado`,
      userId: session.user.id,
      nivelCriticidade: 'info',
    },
  });

  return NextResponse.json({ barber }, { status: 201 });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/barbers/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
