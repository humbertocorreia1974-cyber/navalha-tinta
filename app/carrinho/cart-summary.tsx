"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  subtotal: number;
  totalItens: number;
  sessaoCarrinho: string;
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CartSummary({ subtotal, totalItens }: Props) {
  const router = useRouter();
  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [validando, setValidando] = useState(false);

  async function aplicarCupom(e: React.FormEvent) {
    e.preventDefault();
    if (!cupom.trim()) return;
    setErro(null);
    setOk(null);
    setValidando(true);
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: cupom.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Cupom inválido");
        setDesconto(0);
        return;
      }
      setDesconto(data.desconto ?? 0);
      setOk(`Cupom ${cupom.toUpperCase()} aplicado`);
    } catch {
      setErro("Falha ao validar cupom");
    } finally {
      setValidando(false);
    }
  }

  const total = Math.max(subtotal - desconto, 0);

  return (
    <aside className="sticky top-24 space-y-4 rounded-lg border border-border bg-surface p-6">
      <h2 className="font-display text-xl font-semibold text-fg">
        Resumo do pedido
      </h2>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between text-fg-muted">
          <dt>Itens ({totalItens})</dt>
          <dd>{brl(subtotal)}</dd>
        </div>
        {desconto > 0 && (
          <div className="flex justify-between text-accent">
            <dt>Desconto</dt>
            <dd>- {brl(desconto)}</dd>
          </div>
        )}
        <div className="flex justify-between text-fg-muted">
          <dt>Entrega</dt>
          <dd>Calculado no checkout</dd>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base">
          <dt className="font-semibold text-fg">Total</dt>
          <dd className="font-display text-xl font-bold text-brand">
            {brl(total)}
          </dd>
        </div>
      </dl>

      <form onSubmit={aplicarCupom} className="space-y-2">
        <label
          htmlFor="cupom"
          className="text-xs uppercase tracking-wider text-fg-muted"
        >
          Cupom de desconto
        </label>
        <div className="flex gap-2">
          <Input
            id="cupom"
            name="cupom"
            value={cupom}
            onChange={(e) => setCupom(e.target.value)}
            placeholder="NAVALHA10"
            autoComplete="off"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={validando}
          >
            {validando ? "..." : "Aplicar"}
          </Button>
        </div>
        {erro && (
          <p className="text-xs text-accent" role="alert">
            {erro}
          </p>
        )}
        {ok && <p className="text-xs text-brand">{ok}</p>}
      </form>

      <Link href="/checkout" className="block">
        <Button variant="primary" size="lg" className="w-full">
          Finalizar pedido
        </Button>
      </Link>

      <Link
        href="/catalogo"
        className="block text-center text-xs uppercase tracking-wider text-fg-muted transition-colors duration-150 hover:text-fg"
      >
        Continuar comprando
      </Link>

      <button
        type="button"
        onClick={() => router.refresh()}
        className="block w-full text-center text-[11px] text-fg-muted/70 transition-colors duration-150 hover:text-fg-muted"
      >
        Atualizar carrinho
      </button>
    </aside>
  );
}
