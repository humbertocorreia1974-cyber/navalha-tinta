"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Check = {
  key: string;
  label: string;
  status: "ok" | "error" | "skipped";
  detail: string;
  latencyMs: number;
};

type Counts = {
  users: number;
  barbers: number;
  services: number;
  appointments: number;
  orders: number;
  subscriptions: number;
};

const STATUS_CLASS: Record<Check["status"], string> = {
  ok: "bg-brand/15 text-brand border-brand/40",
  error: "bg-accent/15 text-accent border-accent/40",
  skipped: "bg-fg/10 text-fg-muted border-border",
};

const STATUS_LABEL: Record<Check["status"], string> = {
  ok: "Operacional",
  error: "Falha",
  skipped: "Ignorado",
};

export function HealthClient({
  initialChecks,
  initialCounts,
  initialCheckedAt,
}: {
  initialChecks: Check[];
  initialCounts: Counts;
  initialCheckedAt: string;
}) {
  const [checks, setChecks] = useState(initialChecks);
  const [counts, setCounts] = useState(initialCounts);
  const [checkedAt, setCheckedAt] = useState(initialCheckedAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rerun() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao executar health-check");
        return;
      }
      setChecks(data.checks);
      setCounts(data.counts);
      setCheckedAt(data.checkedAt);
    } catch {
      setError("Erro de rede ao executar health-check");
    } finally {
      setLoading(false);
    }
  }

  const allOk = checks.every((c) => c.status === "ok");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
              allOk
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-accent/40 bg-accent/10 text-accent"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                allOk ? "bg-brand" : "bg-accent"
              }`}
            />
            {allOk ? "Tudo operacional" : "Atenção necessária"}
          </span>
          <span className="text-xs text-fg-muted">
            Verificado em{" "}
            {new Date(checkedAt).toLocaleString("pt-BR")}
          </span>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={rerun}
          disabled={loading}
        >
          {loading ? "Testando..." : "Re-executar testes"}
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {checks.map((c) => (
          <div
            key={c.key}
            className="rounded-lg border border-border p-4 transition-colors duration-150 hover:bg-white/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-fg">{c.label}</p>
                <p className="mt-1 text-xs text-fg-muted">{c.detail}</p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                  STATUS_CLASS[c.status]
                }`}
              >
                {STATUS_LABEL[c.status]}
              </span>
            </div>
            <p className="mt-3 text-xs text-fg-muted">
              Latência: {c.latencyMs} ms
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-xs uppercase tracking-wide text-fg-muted">
          Volumetria do domínio
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["Usuários", counts.users],
              ["Barbeiros", counts.barbers],
              ["Serviços", counts.services],
              ["Agendamentos", counts.appointments],
              ["Pedidos", counts.orders],
              ["Assinaturas", counts.subscriptions],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-md bg-surface/60 p-3">
              <p className="text-xs text-fg-muted">{label}</p>
              <p className="mt-1 font-display text-xl font-bold text-fg">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
