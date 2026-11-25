import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
  const __session = await getServerSession(authOptions as any);
  if (!(__session as any)?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const codigo = String(body?.codigo ?? "").trim().toUpperCase();
  const subtotal = Number(body?.subtotal ?? 0);

  if (!codigo) {
    return NextResponse.json({ error: "Informe um cupom" }, { status: 400 });
  }
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return NextResponse.json(
      { error: "Subtotal inválido" },
      { status: 400 }
    );
  }

  const cupom = await prisma.coupon.findUnique({ where: { codigoCupom: codigo } });

  if (!cupom || !cupom.ativo) {
    return NextResponse.json({ error: "Cupom inválido" }, { status: 404 });
  }
  if (cupom.dataValidade.getTime() < Date.now()) {
    return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
  }

  const valor = Number(cupom.valorDesconto);
  const desconto =
    cupom.tipoDesconto === "percentual"
      ? Math.min((subtotal * valor) / 100, subtotal)
      : Math.min(valor, subtotal);

  return NextResponse.json({
    codigo: cupom.codigoCupom,
    tipo: cupom.tipoDesconto,
    desconto: Number(desconto.toFixed(2)),
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/cart/coupon/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
