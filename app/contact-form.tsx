"use client";

// Form de contato da landing. O DeveloperAgent pode reescrever se quiser campos
// diferentes, mas o padrão já funciona: POST /api/contact -> grava no banco.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Falha ao enviar. Tente de novo.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <p className="rounded-lg border border-border bg-surface/60 px-4 py-3 text-sm text-fg">Recebido! Entramos em contato em breve.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-sm flex-col gap-3 text-left">
      <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <textarea
        placeholder="Como podemos ajudar?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-brand focus:outline-none"
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar"}</Button>
    </form>
  );
}
