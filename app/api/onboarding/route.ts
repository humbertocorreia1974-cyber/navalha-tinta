import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, appointmentsCount, activeSubscription, ordersCount, addressesCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, role: true },
      }),
      prisma.appointment.count({ where: { clientId: userId } }),
      prisma.subscription.findFirst({
        where: { userId, statusAssinatura: "ativa" },
        select: { id: true, dataRenovacao: true },
      }),
      prisma.order.count({ where: { userId } }),
      prisma.address.count({ where: { userId } }),
    ]);

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    progress: {
      hasPhone: Boolean(user.phone && user.phone.trim().length > 0),
      hasAppointment: appointmentsCount > 0,
      hasSubscription: Boolean(activeSubscription),
      hasOrder: ordersCount > 0,
      hasAddress: addressesCount > 0,
    },
    counts: {
      appointments: appointmentsCount,
      orders: ordersCount,
      addresses: addressesCount,
    },
    subscription: activeSubscription
      ? {
          id: activeSubscription.id,
          dataRenovacao: activeSubscription.dataRenovacao,
        }
      : null,
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/onboarding/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
