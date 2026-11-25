import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Body = {
  cep?: unknown;
  logradouro?: unknown;
  numero?: unknown;
  complemento?: unknown;
  bairro?: unknown;
  cidade?: unknown;
  estado?: unknown;
};

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function PUT(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const data = {
    cep: str(body.cep, 9),
    logradouro: str(body.logradouro, 160),
    numero: str(body.numero, 20),
    complemento: str(body.complemento, 120) || null,
    bairro: str(body.bairro, 80),
    cidade: str(body.cidade, 80),
    estado: str(body.estado, 2).toUpperCase(),
  };

  if (!data.cep || !data.logradouro || !data.numero || !data.bairro || !data.cidade || data.estado.length !== 2) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
  }

  try {
    const existing = await prisma.address.findFirst({
      where: { userId: session.user.id, principal: true },
      select: { id: true },
    });

    if (existing) {
      const updated = await prisma.address.update({
        where: { id: existing.id },
        data,
      });
      return NextResponse.json({ address: updated });
    }

    const created = await prisma.address.create({
      data: { ...data, userId: session.user.id, principal: true },
    });
    return NextResponse.json({ address: created });
  } catch {
    return NextResponse.json({ error: 'Não foi possível salvar o endereço.' }, { status: 500 });
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/account/address/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
