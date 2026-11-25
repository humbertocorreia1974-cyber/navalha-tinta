import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const STATUS_VALIDOS = ['ativa', 'pausada', 'cancelada', 'inadimplente'];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const novoStatus = body?.statusAssinatura;
  if (typeof novoStatus !== 'string' || !STATUS_VALIDOS.includes(novoStatus)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
  }

  const subscription = await prisma.subscription.update({
    where: { id: params.id },
    data: { statusAssinatura: novoStatus },
  });

  if (novoStatus === 'pausada') {
    await prisma.pauseRecord.create({
      data: {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        dataInicio: new Date(),
        motivo: 'Pausa manual pelo gestor',
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      acaoRealizada: `subscription.${novoStatus}`,
      entidadeAfetada: 'Subscription',
      usuarioResponsavel: session.user.email ?? session.user.id,
      userId: session.user.id,
      subscriptionId: subscription.id,
      detalhesEvento: `Assinatura ${subscription.id} alterada para ${novoStatus}`,
    },
  });

  return NextResponse.json({ ok: true, subscription });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/gestor/subscriptions/[id]/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
