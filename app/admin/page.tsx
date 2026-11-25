import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin | Navalha & Tinta",
  description:
    "Painel administrativo do Navalha & Tinta: gestão de usuários, health-check de integrações, agenda geral, financeiro e operação da barbearia.",
  robots: { index: false, follow: false },
};

type AdminCard = {
  href: string;
  title: string;
  description: string;
  tag: string;
  accent: "gold" | "red" | "neutral";
};

const primaryCards: AdminCard[] = [
  {
    href: "/admin/usuarios",
    title: "Usuários & permissões",
    description:
      "Gerencie contas, papéis (cliente, barbeiro, admin) e o bootstrap do primeiro administrador.",
    tag: "RBAC",
    accent: "gold",
  },
  {
    href: "/admin/health",
    title: "Health-check",
    description:
      "Status de backend, banco de dados, Stripe, WhatsApp e e-mail transacional em tempo real.",
    tag: "Integrações",
    accent: "red",
  },
  {
    href: "/gestor",
    title: "Painel do gestor",
    description:
      "Agenda geral, barbeiros, serviços, planos, assinantes e financeiro básico em um só lugar.",
    tag: "Operação",
    accent: "gold",
  },
];

const secondaryCards: AdminCard[] = [
  {
    href: "/agendar",
    title: "Agenda geral",
    description: "Visão consolidada dos agendamentos do dia e da semana por barbeiro.",
    tag: "Agenda",
    accent: "neutral",
  },
  {
    href: "/meus-agendamentos",
    title: "Agendamentos",
    description: "Acompanhe próximos atendimentos, histórico e no-shows registrados.",
    tag: "Clientes",
    accent: "neutral",
  },
  {
    href: "/minha-assinatura",
    title: "Assinantes",
    description: "Planos ativos, pausas, cancelamentos e histórico de uso por cliente.",
    tag: "Stripe",
    accent: "neutral",
  },
  {
    href: "/meus-pedidos",
    title: "Pedidos",
    description: "Pedidos recebidos, status de pagamento e itens do catálogo.",
    tag: "Vendas",
    accent: "neutral",
  },
  {
    href: "/barbeiros",
    title: "Barbeiros",
    description: "Equipe, especialidades e galeria de trabalhos por profissional.",
    tag: "Equipe",
    accent: "neutral",
  },
  {
    href: "/servicos",
    title: "Serviços",
    description: "Catálogo de serviços, duração, preço e disponibilidade.",
    tag: "Catálogo",
    accent: "neutral",
  },
  {
    href: "/planos",
    title: "Planos",
    description: "Planos de assinatura mensal, benefícios e cobrança recorrente.",
    tag: "Assinatura",
    accent: "neutral",
  },
  {
    href: "/galeria",
    title: "Galeria",
    description: "Trabalhos publicados, curadoria de imagens e destaques da home.",
    tag: "Conteúdo",
    accent: "neutral",
  },
];

const accentClasses: Record<AdminCard["accent"], string> = {
  gold: "border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10",
  red: "border-red-700/40 hover:border-red-500 hover:shadow-red-500/10",
  neutral: "border-zinc-800 hover:border-zinc-600 hover:shadow-zinc-500/5",
};

const tagClasses: Record<AdminCard["accent"], string> = {
  gold: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  red: "bg-red-500/10 text-red-300 ring-red-500/30",
  neutral: "bg-zinc-800/60 text-zinc-300 ring-zinc-700",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Trilha de navegação" className="mb-6 text-xs text-zinc-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-amber-400">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-zinc-300">Admin</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="mb-10 border-b border-zinc-800 pb-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            Painel administrativo
          </p>
          <h1 className="font-serif text-4xl font-black leading-tight tracking-tight text-zinc-50 sm:text-5xl">
            Admin
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Central de controle do Navalha &amp; Tinta. Gerencie usuários, monitore integrações
            críticas (Stripe, WhatsApp, e-mail e banco de dados) e acompanhe a operação da
            barbearia — agenda, assinantes e financeiro — em um só lugar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/usuarios"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Gerenciar usuários
            </Link>
            <Link
              href="/admin/health"
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Ver health-check
            </Link>
            <Link
              href="/gestor"
              className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Ir para o painel do gestor →
            </Link>
          </div>
        </header>

        {/* Aviso de acesso */}
        <section
          aria-labelledby="aviso-acesso"
          className="mb-10 rounded-lg border border-red-700/40 bg-red-950/20 p-4 sm:p-5"
        >
          <h2
            id="aviso-acesso"
            className="mb-1 text-sm font-semibold uppercase tracking-wider text-red-300"
          >
            Acesso restrito
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300">
            Esta área é exclusiva para administradores. Se você chegou aqui sem permissão,
            verifique sua conta ou{" "}
            <Link
              href="/sem-permissao"
              className="font-semibold text-amber-300 underline-offset-4 hover:underline"
            >
              veja a página de acesso negado
            </Link>
            .
          </p>
        </section>

        {/* Ações principais */}
        <section aria-labelledby="acoes-principais" className="mb-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2
              id="acoes-principais"
              className="font-serif text-2xl font-bold tracking-tight text-zinc-50"
            >
              Ações principais
            </h2>
            <span className="text-xs uppercase tracking-wider text-zinc-500">
              Prioridade
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {primaryCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group flex flex-col justify-between rounded-lg border bg-zinc-900/60 p-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${accentClasses[card.accent]}`}
              >
                <div>
                  <span
                    className={`mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${tagClasses[card.accent]}`}
                  >
                    {card.tag}
                  </span>
                  <h3 className="mb-2 font-serif text-lg font-bold text-zinc-50 group-hover:text-amber-200">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {card.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-amber-400 group-hover:text-amber-300">
                  Abrir
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Atalhos operacionais */}
        <section aria-labelledby="atalhos" className="mb-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2
              id="atalhos"
              className="font-serif text-2xl font-bold tracking-tight text-zinc-50"
            >
              Atalhos operacionais
            </h2>
            <span className="text-xs uppercase tracking-wider text-zinc-500">
              Gestão do dia a dia
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {secondaryCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group flex flex-col rounded-lg border bg-zinc-900/40 p-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${accentClasses[card.accent]}`}
              >
                <span
                  className={`mb-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${tagClasses[card.accent]}`}
                >
                  {card.tag}
                </span>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100 group-hover:text-amber-200">
                  {card.title}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-400">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Guia rápido */}
        <section
          aria-labelledby="guia-rapido"
          className="mb-12 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6"
        >
          <h2
            id="guia-rapido"
            className="mb-3 font-serif text-xl font-bold tracking-tight text-zinc-50"
          >
            Primeiros passos
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-zinc-400">
            Novo por aqui? Siga o guia de configuração inicial para conectar Stripe, WhatsApp
            e e-mail, cadastrar barbeiros e serviços, e publicar os planos de assinatura.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/primeiros-passos"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Abrir guia de primeiros passos
            </Link>
            <Link
              href="/termos"
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Termos de uso
            </Link>
            <Link
              href="/privacidade"
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Política de privacidade
            </Link>
          </div>
        </section>

        {/* Rodapé interno */}
        <footer className="border-t border-zinc-800 pt-6 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              Navalha &amp; Tinta · Painel administrativo · Acesso monitorado e registrado em
              audit log.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/" className="hover:text-amber-400">
                Site público
              </Link>
              <Link href="/minha-conta" className="hover:text-amber-400">
                Minha conta
              </Link>
              <Link href="/sem-permissao" className="hover:text-amber-400">
                Sem permissão
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}