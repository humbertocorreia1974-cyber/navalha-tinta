"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  subscriptionId: string;
  status: string;
};

export function SubscriptionActions({ subscriptionId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function call(action: "pause" | "resume" | "cancel") {
    setBusy(action);
    setMsg(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: action === "pause" ? "Pausa solicitada pelo cliente" : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ kind: "err", text: data?.error ?? "Não foi possível concluir a ação." });
        return;
      }
      const labels: Record<string, string> = {
        pause: "Assinatura pausada com sucesso.",
        resume: "Assinatura retomada com sucesso.",
        cancel: "Assinatura cancelada. Sentiremos sua falta.",
      };
      setMsg({ kind: "ok", text: labels[action] });
      startTransition(() => router.refresh());
    } catch {
      setMsg({ kind: "err", text: "Falha de conexão. Tente novamente." });
    } finally {
      setBusy(null);
    }
  }

  const ativa = status === "ativa";
  const pausada = status === "pausada";
  const cancelada = status === "cancelada";

  return (
    <div className="mt-5 space-y-3">
      {ativa && (
        <Button
          variant="secondary"
          size="md"
          disabled={busy !== null || pending}
          onClick={() => call("pause")}
        >
          {busy === "pause" ? "Pausando..." : "Pausar assinatura"}
        </Button>
      )}
      {pausada && (
        <Button
          variant="primary"
          size="md"
          disabled={busy !== null || pending}
          onClick={() => call("resume")}
        >
          {busy === "resume" ? "Retomando..." : "Retomar assinatura"}
        </Button>
      )}
      {!cancelada && (
        <Button
          variant="ghost"
          size="md"
          disabled={busy !== null || pending}
          onClick={() => {
            if (confirm("Cancelar a assinatura encerra a cobrança recorrente. Deseja continuar?")) {
              call("cancel");
            }
          }}
        >
          {busy === "cancel" ? "Cancelando..." : "Cancelar assinatura"}
        </Button>
      )}
      {cancelada && (
        <p className="text-xs text-fg-muted">
          Esta assinatura foi cancelada. Você pode assinar novamente quando quiser.
        </p>
      )}

      {msg && (
        <p
          role="status"
          className={`rounded-md px-3 py-2 text-xs ${
            msg.kind === "ok"
              ? "border border-brand/40 bg-brand/10 text-brand"
              : "border border-red-500/40 bg-red-500/10 text-red-400"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
