"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ConfirmarPresencaClient({
  appointmentId,
  jaConfirmado,
}: {
  appointmentId: string;
  jaConfirmado: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(jaConfirmado);

  async function confirmar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/confirm`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível confirmar");
      } else {
        setOk(true);
        router.refresh();
      }
    } catch {
      setErro("Falha de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="rounded-lg border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand">
        Presença confirmada. Te esperamos na Navalha &amp; Tinta.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={confirmar} disabled={loading} variant="primary" size="lg">
        {loading ? "Confirmando..." : "Confirmar presença"}
      </Button>
      {erro && <p className="text-sm text-accent">{erro}</p>}
    </div>
  );
}
