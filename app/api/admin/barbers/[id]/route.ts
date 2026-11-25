import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  if (session.user.role !== 'admin') return { error: NextResponse.json({ error: 'Sem permissão' }, { status: 403 }) };
  return { session };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { session } = guard;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const existing = await prisma.barber.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });

  const data: Record<string, any> = {};
  if (typeof body?.nomeCompleto === 'string') data.nomeCompleto = body.nomeCompleto.trim();
  if (typeof body?.apelido === 'string') data.apelido = body.apelido.trim() || null;
  if (typeof body?.emailContato === 'string') data.emailContato = body.emailContato.trim();
  if (typeof body?.telefoneCelular === 'string') data.telefoneCelular = body.telefoneCelular.trim();
  if (typeof body?.especialidades === 'string') data.especialidades = body.especialidades.trim() || null;
  if (typeof body?.bio === 'string') data.bio = body.bio.trim() || null;
  if (typeof body?.fotoPerfil === 'string') data.fotoPerfil = body.fotoPerfil || null;
  if (typeof body?.ativo === 'boolean') data.ativo = body.ativo;
  if (body?.userId === null) data.userId = null;
  else if (typeof body?.userId === 'string' && body.userId) {
    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 400 });
    const other = await prisma.barber.findUnique({ where: { userId: body.userId } });
    if (other && other.id !== params.id) {
      return NextResponse.json(
        { error: 'Este usuário já está vinculado a outro barbeiro' },
        { status: 400 }
      );
    }
    data.userId = body.userId;
  }

  const barber = await prisma.barber.update({ where: { id: params.id }, data });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: 'barber.update',
      entidadeAfetada: 'Barber',
      usuarioResponsavel: session.user.email || session.user.id,
      detalhesEvento: `Barbeiro ${barber.nomeCompleto} atualizado`,
      userId: session.user.id,
      nivelCriticidade: 'info',
    },
  });

  return NextResponse.json({ barber });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/barbers/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { session } = guard;

  const existing = await prisma.barber.findUnique({
    where: { id: params.id },
    include: { _count: { select: { appointments: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 });

  if (existing._count.appointments > 0) {
    return NextResponse.json(
      { error: 'Não é possível remover: existem agendamentos vinculados. Desative em vez de remover.' },
      { status: 400 }
    );
  }

  await prisma.barber.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: 'barber.delete',
      entidadeAfetada: 'Barber',
      usuarioResponsavel: session.user.email || session.user.id,
      detalhesEvento: `Barbeiro ${existing.nomeCompleto} removido`,
      userId: session.user.id,
      nivelCriticidade: 'warning',
    },
  });

  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/barbers/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
