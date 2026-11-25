"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "idle" | "sending" | "ok" | "error";

export function ContactFormClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      nome: String(data.get("nome") ?? ""),
      email: String(data.get("email") ?? ""),
      telefone: String(data.get("telefone") ?? ""),
      assunto: String(data.get("assunto") ?? ""),
      mensagem: String(data.get("mensagem") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? "Nao foi possivel enviar agora. Tente novamente.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("ok");
    } catch {
      setError("Falha de conexao. Verifique sua internet e tente de novo.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Nome</span>
          <Input name="nome" required minLength={2} placeholder="Como podemos te chamar" autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fg-muted">E-mail</span>
          <Input name="email" type="email" required placeholder="voce@email.com" autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Telefone (opcional)</span>
          <Input name="telefone" placeholder="(11) 99999-9999" autoComplete="tel" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Assunto</span>
          <select
            name="assunto"
            defaultValue="duvida"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus:border-brand"
          >
            <option value="duvida">Duvida geral</option>
            <option value="agendamento">Agendamento</option>
            <option value="assinatura">Planos de assinatura</option>
            <option value="produtos">Produtos e pedidos</option>
            <option value="parceria">Parceria</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Mensagem</span>
        <textarea
          name="mensagem"
          required
          minLength={10}
          rows={5}
          placeholder="Conte pra gente como podemos ajudar."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus:border-brand"
        />
      </label>

      {status === "error" && error ? (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
      ) : null}
      {status === "ok" ? (
        <p className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          Mensagem enviada. Retornamos em ate 1 dia util.
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="md" disabled={status === "sending"}>
          {status === "sending" ? "Enviando..." : "Enviar mensagem"}
        </Button>
        <span className="text-xs text-fg-muted">Respondemos em ate 1 dia util.</span>
      </div>
    </form>
  );
}
