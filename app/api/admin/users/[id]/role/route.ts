import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ROLES = ["user", "barber", "admin"] as const;
type Role = (typeof ROLES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const role = (body as { role?: string })?.role;
  if (!role || !ROLES.includes(role as Role)) {
    return NextResponse.json(
      { error: "Papel inválido. Use user, barber ou admin." },
      { status: 400 }
    );
  }

  if (params.id === session.user.id && role !== "admin") {
    return NextResponse.json(
      { error: "Você não pode remover seu próprio acesso de admin." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: "ALTERAR_PAPEL_USUARIO",
      entidadeAfetada: "User",
      usuarioResponsavel: session.user.email ?? session.user.id,
      detalhesEvento: `${target.email}: ${target.role} -> ${role}`,
      nivelCriticidade: "warning",
      userId: session.user.id,
    },
  });

  return NextResponse.json({ user: updated });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/users/[id]/role/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
