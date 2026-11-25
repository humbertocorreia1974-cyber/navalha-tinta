import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim() || "";

  const where: { userId: string; statusPedido?: string } = {
    userId: session.user.id,
  };
  const statusValidos = [
    "pendente",
    "pago",
    "enviado",
    "entregue",
    "cancelado",
  ];
  if (status && statusValidos.includes(status)) {
    where.statusPedido = status;
  }

  const pedidos = await prisma.order.findMany({
    where,
    orderBy: { dataPedido: "desc" },
    include: {
      items: true,
      payments: {
        select: {
          id: true,
          statusPagamento: true,
          metodoPagamento: true,
          valorPago: true,
        },
      },
    },
  });

  return NextResponse.json({ pedidos });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/orders/me/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
