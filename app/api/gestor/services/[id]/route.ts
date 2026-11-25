import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.disponivel !== 'boolean') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const service = await prisma.service.update({
    where: { id: params.id },
    data: { disponivel: body.disponivel },
  });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: body.disponivel ? 'service.ativar' : 'service.pausar',
      entidadeAfetada: 'Service',
      usuarioResponsavel: session.user.email ?? session.user.id,
      userId: session.user.id,
      detalhesEvento: `Serviço ${service.nomeServico} (${service.id}) atualizado`,
    },
  });

  return NextResponse.json({ ok: true, service });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/gestor/services/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
