import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

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

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    checks,
    counts: { users, barbers, services, appointments, orders, subscriptions },
  });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/admin/health/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
