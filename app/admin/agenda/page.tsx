import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Agenda | Navalha & Tinta",
  description:
    "Agenda geral da barbearia Navalha & Tinta — visão consolidada de agendamentos, ocupação e no-shows.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type StatusAgendamento = "CONFIRMADO" | "PENDENTE" | "CONCLUIDO" | "NO_SHOW" | "CANCELADO";

const statusLabel: Record<StatusAgendamento, string> = {
  CONFIRMADO: "Confirmado",
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  NO_SHOW: "No-show",
  CANCELADO: "Cancelado",
};

const statusClass: Record<StatusAgendamento, string> = {
  CONFIRMADO: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  PENDENTE: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  CONCLUIDO: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  NO_SHOW: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  CANCELADO: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(d);
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default async function AdminAgendaPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?next=/admin/agenda");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "BARBEIRO") {
    redirect("/sem-permissao");
  }

  const hoje = new Date();
  const inicio = startOfDay(hoje);
  const fim = endOfDay(hoje);

  const proximos7 = new Date(hoje);
  proximos7.setDate(proximos7.getDate() + 7);

  const [agendamentosHoje, proximos, totalHoje, noShowsHoje] = await Promise.all([
    prisma.agendamento.findMany({
      where: {
        dataHora: { gte: inicio, lte: fim },
        status: { not: "CANCELADO" },
      },
      include: {
        cliente: { select: { nome: true, telefone: true } },
        barbeiro: { select: { nome: true } },
        servico: { select: { nome: true, duracaoMin: true, preco: true } },
      },
      orderBy: { dataHora: "asc" },
    }),
    prisma.agendamento.findMany({
      where: {
        dataHora: { gt: fim, lte: proximos7 },
        status: { in: ["CONFIRMADO", "PENDENTE"] },
      },
      include: {
        cliente: { select: { nome: true } },
        barbeiro: { select: { nome: true } },
        servico: { select: { nome: true } },
      },
      orderBy: { dataHora: "asc" },
      take: 8,
    }),
    prisma.agendamento.count({
      where: { dataHora: { gte: inicio, lte: fim }, status: { not: "CANCELADO" } },
    }),
    prisma.agendamento.count({
      where: { dataHora: { gte: inicio, lte: fim }, status: "NO_SHOW" },
    }),
  ]);

  const receitaPrevista = agendamentosHoje
    .filter((a) => a.status !== "NO_SHOW")
    .reduce((acc, a) => acc + Number(a.servico?.preco ?? 0), 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero curto */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                Painel administrativo
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
                Agenda
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Visão consolidada do dia e dos próximos 7 dias. Acompanhe ocupação,
                confirmações e no-shows em tempo real.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/agendar"
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Novo agendamento
              </Link>
              <Link
                href="/painel/gestor"
                className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Painel do gestor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Hoje</p>
            <p className="mt-1 text-2xl font-bold text-zinc-50">{totalHoje}</p>
            <p className="text-xs text-zinc-500">agendamentos</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Receita prevista</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {receitaPrevista.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p className="text-xs text-zinc-500">excluindo no-shows</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">No-shows</p>
            <p className="mt-1 text-2xl font-bold text-rose-400">{noShowsHoje}</p>
            <p className="text-xs text-zinc-500">hoje</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Próximos 7 dias</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">{proximos.length}</p>
            <p className="text-xs text-zinc-500">confirmados/pendentes</p>
          </div>
        </div>
      </section>

      {/* Agenda do dia */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-zinc-100">
            Hoje · {formatDate(hoje)}
          </h2>
          <Link
            href="/painel/gestor/profissionais"
            className="text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Gerenciar barbeiros →
          </Link>
        </div>

        {agendamentosHoje.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <p className="text-sm text-zinc-400">
              Nenhum agendamento para hoje. Aproveite para revisar a agenda dos próximos dias.
            </p>
            <Link
              href="/agendar"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              Criar agendamento
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Horário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Cliente
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400 sm:table-cell">
                    Barbeiro
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400 md:table-cell">
                    Serviço
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                {agendamentosHoje.map((a) => {
                  const status = a.status as StatusAgendamento;
                  return (
                    <tr key={a.id} className="hover:bg-zinc-900/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-100">
                        {formatTime(a.dataHora)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-200">
                        <div className="font-medium">{a.cliente?.nome ?? "—"}</div>
                        {a.cliente?.telefone && (
                          <div className="text-xs text-zinc-500">{a.cliente.telefone}</div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-zinc-300 sm:table-cell">
                        {a.barbeiro?.nome ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-zinc-300 md:table-cell">
                        {a.servico?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass[status]}`}
                        >
                          {statusLabel[status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Próximos 7 dias */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-zinc-100">
            Próximos 7 dias
          </h2>
          <Link
            href="/painel/gestor/clientes"
            className="text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Ver clientes →
          </Link>
        </div>

        {proximos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <p className="text-sm text-zinc-400">
              Nenhum agendamento confirmado para os próximos 7 dias.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {proximos.map((a) => {
              const status = a.status as StatusAgendamento;
              return (
                <li
                  key={a.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {formatDate(a.dataHora)} · {formatTime(a.dataHora)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {a.cliente?.nome ?? "—"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {a.barbeiro?.nome ?? "—"} · {a.servico?.nome ?? "—"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass[status]}`}
                    >
                      {statusLabel[status]}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* CTA final */}
      <section className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h3 className="font-serif text-lg font-semibold text-zinc-100">
              Precisa de mais detalhes?
            </h3>
            <p className="text-sm text-zinc-400">
              Acesse o painel do gestor para relatórios completos de ocupação e financeiro.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/painel/gestor"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              Painel do gestor
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              Administração
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}