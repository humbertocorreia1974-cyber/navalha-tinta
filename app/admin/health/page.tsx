import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { HealthClient } from "./health-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Health-check | Painel Admin Navalha & Tinta",
  description:
    "Status em tempo real de backend, banco de dados, Stripe, e-mail e WhatsApp da Navalha & Tinta.",
  openGraph: {
    title: "Health-check | Painel Admin Navalha & Tinta",
    description:
      "Monitoramento das integrações críticas da barbearia Navalha & Tinta.",
    type: "website",
  },
};

type Check = {
  key: string;
  label: string;
  status: "ok" | "error" | "skipped";
  detail: string;
  latencyMs: number;
};

async function timed(
  key: string,
  label: string,
  fn: () => Promise<string>
): Promise<Check> {
  const start = Date.now();
  try {
    const detail = await fn();
    return { key, label, status: "ok", detail, latencyMs: Date.now() - start };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Falha desconhecida";
    return {
      key,
      label,
      status: "error",
      detail: msg.slice(0, 220),
      latencyMs: Date.now() - start,
    };
  }
}

export default async function AdminHealthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/sem-permissao");

  const checks: Check[] = [];

  checks.push(
    await timed("backend", "Backend / App Router", async () => {
      return `Node ${process.version}, uptime ${Math.round(process.uptime())}s`;
    })
  );

  checks.push(
    await timed("database", "Banco de dados (Postgres)", async () => {
      const rows = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
      if (!rows?.[0] || rows[0].ok !== 1) throw new Error("SELECT 1 não retornou 1");
      return "SELECT 1 respondeu corretamente";
    })
  );

  checks.push(
    await timed("stripe", "Stripe (cobrança recorrente)", async () => {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY não configurada");
      }
      const balance = await stripe.balance.retrieve();
      const currencies = balance.available.map((b) => b.currency.toUpperCase());
      return `Balance OK (${currencies.join(", ") || "sem saldo disponível"})`;
    })
  );

  checks.push(
    await timed("email", "E-mail transacional (Resend/SMTP)", async () => {
      if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY não configurada");
      }
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Resend ${res.status}: ${text.slice(0, 120)}`);
      }
      return "Credencial Resend válida";
    })
  );

  checks.push(
    await timed("whatsapp", "WhatsApp Cloud API (lembretes)", async () => {
      const token = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      if (!token || !phoneId) {
        throw new Error(
          "WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID não configurados"
        );
      }
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${phoneId}?fields=display_phone_number,verified_name`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Graph API ${res.status}: ${text.slice(0, 120)}`);
      }
      const data = (await res.json()) as {
        display_phone_number?: string;
        verified_name?: string;
      };
      return `${data.verified_name ?? "Número"} (${data.display_phone_number ?? "?"})`;
    })
  );

  const [users, barbers, services, appointments, orders, subscriptions] =
    await Promise.all([
      prisma.user.count(),
      prisma.barber.count(),
      prisma.service.count(),
      prisma.appointment.count(),
      prisma.order.count(),
      prisma.subscription.count(),
    ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal variant="up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand">
              Painel admin
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">
              Health-check
            </h1>
            <p className="mt-2 max-w-xl text-sm text-fg-muted">
              Testes reais de backend, banco de dados, Stripe, e-mail e WhatsApp.
              Cada item é verificado no momento da consulta.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/usuarios">
              <Button variant="secondary" size="md">
                Usuários
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
        <div className="mt-8">
          <Card>
            <CardBody>
              <CardTitle className="mb-4">Integrações e infraestrutura</CardTitle>
              <HealthClient
                initialChecks={checks}
                initialCounts={{
                  users,
                  barbers,
                  services,
                  appointments,
                  orders,
                  subscriptions,
                }}
                initialCheckedAt={new Date().toISOString()}
              />
            </CardBody>
          </Card>
        </div>
      </Reveal>
    </main>
  );
}
