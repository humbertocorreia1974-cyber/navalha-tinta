import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meus pedidos | Navalha & Tinta",
  description:
    "Acompanhe o status dos seus pedidos de produtos da Navalha & Tinta: pagamento, envio e entrega em um só lugar.",
  openGraph: {
    title: "Meus pedidos | Navalha & Tinta",
    description:
      "Acompanhe o status dos seus pedidos de produtos da Navalha & Tinta.",
    type: "website",
  },
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  pendente: "bg-accent/15 text-accent border-accent/30",
  pago: "bg-brand/15 text-brand border-brand/30",
  enviado: "bg-brand/15 text-brand border-brand/30",
  entregue: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelado: "bg-red-500/15 text-red-400 border-red-500/30",
};

const FILTROS = [
  { value: "", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "pago", label: "Pagos" },
  { value: "enviado", label: "Enviados" },
  { value: "entregue", label: "Entregues" },
  { value: "cancelado", label: "Cancelados" },
];

function formatBRL(v: unknown): string {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function MeusPedidosPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/meus-pedidos");
  }

  const statusFiltro = searchParams.status?.trim() || "";
  const where: { userId: string; statusPedido?: string } = {
    userId: session.user.id,
  };
  if (statusFiltro && STATUS_LABEL[statusFiltro]) {
    where.statusPedido = statusFiltro;
  }

  const [pedidos, totalGeral] = await Promise.all([
    prisma.order.findMany({
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
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              Sua conta
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">
              Meus pedidos
            </h1>
            <p className="mt-2 max-w-xl text-sm text-fg-muted">
              Acompanhe cada compra feita na loja da Navalha & Tinta, do
              pagamento até a entrega.
            </p>
          </div>
          <Link href="/catalogo">
            <Button variant="primary" size="md">
              Continuar comprando
            </Button>
          </Link>
        </div>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <form
          method="GET"
          className="mt-8 flex flex-wrap items-center gap-2 border-b border-border pb-4"
        >
          <span className="mr-2 text-xs uppercase tracking-wider text-fg-muted">
            Filtrar:
          </span>
          {FILTROS.map((f) => {
            const ativo = (statusFiltro || "") === f.value;
            return (
              <button
                key={f.value || "todos"}
                type="submit"
                name="status"
                value={f.value}
                className={
                  "rounded-full border px-3 py-1 text-xs transition-all duration-150 " +
                  (ativo
                    ? "border-brand bg-brand text-brand-fg"
                    : "border-border text-fg-muted hover:bg-white/5 hover:text-fg")
                }
              >
                {f.label}
              </button>
            );
          })}
        </form>
      </Reveal>

      {pedidos.length === 0 ? (
        <Reveal variant="up" delay={120}>
          <Card className="mt-10">
            <CardBody className="flex flex-col items-center gap-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-7 w-7"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <CardTitle>
                {totalGeral === 0
                  ? "Você ainda não fez nenhum pedido"
                  : "Nenhum pedido com esse status"}
              </CardTitle>
              <p className="max-w-md text-sm text-fg-muted">
                {totalGeral === 0
                  ? "Quando você comprar pomadas, óleos ou acessórios no catálogo, seus pedidos aparecem aqui com status em tempo real."
                  : "Tente outro filtro para ver seus pedidos em outros estágios."}
              </p>
              <Link href="/catalogo">
                <Button variant="primary" size="md">
                  Explorar catálogo
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Reveal>
      ) : (
        <ul className="mt-8 space-y-4">
          {pedidos.map((pedido, i) => {
            const status = pedido.statusPedido;
            const statusCls =
              STATUS_CLASS[status] ?? "bg-surface text-fg-muted border-border";
            const statusLbl = STATUS_LABEL[status] ?? status;
            const qtdItens = pedido.items.reduce(
              (acc, it) => acc + it.quantidade,
              0,
            );
            return (
              <Reveal key={pedido.id} variant="up" delay={i * 60}>
                <li>
                  <Card className="hover-lift">
                    <CardBody className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-fg-muted">
                            Pedido
                          </p>
                          <p className="font-display text-lg font-semibold text-fg">
                            #{pedido.numeroPedido}
                          </p>
                          <p className="mt-1 text-xs text-fg-muted">
                            Feito em {formatDate(pedido.dataPedido)}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <span
                            className={
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                              statusCls
                            }
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusLbl}
                          </span>
                          <p className="font-display text-xl font-bold text-fg">
                            {formatBRL(pedido.valorTotal)}
                          </p>
                          <p className="text-xs text-fg-muted">
                            {qtdItens} {qtdItens === 1 ? "item" : "itens"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-fg-muted">
                            Entrega
                          </p>
                          <p className="mt-1 text-fg">
                            {pedido.enderecoEntrega ||
                              "Retirada na barbearia"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-fg-muted">
                            Pagamento
                          </p>
                          <p className="mt-1 text-fg">
                            {pedido.payments.length > 0
                              ? pedido.payments
                                  .map(
                                    (p) =>
                                      `${p.metodoPagamento} (${p.statusPagamento})`,
                                  )
                                  .join(", ")
                              : "Aguardando confirmação"}
                          </p>
                        </div>
                      </div>

                      <details className="group border-t border-border pt-3">
                        <summary className="cursor-pointer list-none text-sm font-medium text-brand transition-colors duration-150 hover:text-accent">
                          Ver itens do pedido
                        </summary>
                        <ul className="mt-3 space-y-2">
                          {pedido.items.map((it) => (
                            <li
                              key={it.id}
                              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                            >
                              <span className="text-fg">
                                {it.quantidade}x {it.nomeProdutoSnapshot}
                              </span>
                              <span className="text-fg-muted">
                                {formatBRL(it.subtotal)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </CardBody>
                  </Card>
                </li>
              </Reveal>
            );
          })}
        </ul>
      )}
    </main>
  );
}
