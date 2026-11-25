import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { UsersTableClient } from "./users-table-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Usuários | Painel Admin Navalha & Tinta",
  description:
    "Gestão de usuários da Navalha & Tinta: papéis de cliente, barbeiro e admin com auditoria.",
  openGraph: {
    title: "Usuários | Painel Admin Navalha & Tinta",
    description:
      "Gestão de usuários e papéis da barbearia Navalha & Tinta.",
    type: "website",
  },
};

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/sem-permissao");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      createdAt: true,
      _count: { select: { appointmentsAsClient: true, orders: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    plan: u.plan,
    createdAt: u.createdAt.toISOString(),
    appointments: u._count.appointmentsAsClient,
    orders: u._count.orders,
  }));

  const byRole = rows.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand">
              Painel admin
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">
              Usuários
            </h1>
            <p className="mt-2 max-w-xl text-sm text-fg-muted">
              Gerencie papéis de cliente, barbeiro e admin. Toda alteração fica
              registrada na auditoria.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/health">
              <Button variant="secondary" size="md">
                Health-check
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="md">
                Voltar ao site
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-fg-muted">
                Total
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-fg">
                {rows.length}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-fg-muted">
                Clientes
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-brand">
                {byRole.user ?? 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-fg-muted">
                Barbeiros
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">
                {byRole.barber ?? 0}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-fg-muted">
                Admins
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-fg">
                {byRole.admin ?? 0}
              </p>
            </CardBody>
          </Card>
        </div>
      </Reveal>

      <Reveal variant="up" delay={160}>
        <div className="mt-10">
          <Card>
            <CardBody>
              <CardTitle className="mb-4">Lista de usuários</CardTitle>
              {rows.length === 0 ? (
                <div className="rounded-lg border border-border p-8 text-center">
                  <p className="text-sm text-fg-muted">
                    Ainda não há usuários cadastrados na barbearia.
                  </p>
                  <Link href="/cadastro" className="mt-3 inline-block">
                    <Button variant="primary" size="sm">
                      Cadastrar primeiro cliente
                    </Button>
                  </Link>
                </div>
              ) : (
                <UsersTableClient
                  users={rows}
                  currentUserId={session.user.id}
                />
              )}
            </CardBody>
          </Card>
        </div>
      </Reveal>
    </main>
  );
}
