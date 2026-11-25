"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";

type Props = {
  id: string;
  nome: string;
  marca: string | null;
  imagem: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  estoque: number;
  delay?: number;
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CartItemRow({
  id,
  nome,
  marca,
  imagem,
  quantidade,
  precoUnitario,
  subtotal,
  estoque,
  delay = 0,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [qty, setQty] = useState(quantidade);
  const [erro, setErro] = useState<string | null>(null);

  async function atualizar(novo: number) {
    if (novo < 1 || novo > Math.max(estoque, 1)) return;
    setErro(null);
    setQty(novo);
    const res = await fetch(`/api/cart/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade: novo }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error ?? "Não foi possível atualizar");
      setQty(quantidade);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remover() {
    setErro(null);
    const res = await fetch(`/api/cart/items/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error ?? "Não foi possível remover");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <Reveal variant="up" delay={delay}>
      <div className="flex gap-4 rounded-lg border border-border bg-surface/60 p-4 hover-lift transition-all duration-200">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-bg">
          {imagem ? (
            <Image
              src={imagem}
              alt={nome}
              fill
              sizes="96px"
              className="object-cover img-zoom"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-fg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            {marca && (
              <p className="text-[11px] uppercase tracking-wider text-accent">
                {marca}
              </p>
            )}
            <h3 className="font-display text-lg font-semibold text-fg">
              {nome}
            </h3>
            <p className="text-sm text-fg-muted">
              {brl(precoUnitario)} cada
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => atualizar(qty - 1)}
                disabled={qty <= 1 || pending}
                aria-label="Diminuir quantidade"
                className="px-3 py-1.5 text-fg-muted transition-colors duration-150 hover:bg-white/5 hover:text-fg disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm text-fg">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => atualizar(qty + 1)}
                disabled={qty >= estoque || pending}
                aria-label="Aumentar quantidade"
                className="px-3 py-1.5 text-fg-muted transition-colors duration-150 hover:bg-white/5 hover:text-fg disabled:opacity-40"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-display text-lg font-semibold text-brand">
                {brl(subtotal)}
              </span>
              <button
                type="button"
                onClick={remover}
                disabled={pending}
                className="text-xs uppercase tracking-wider text-fg-muted transition-colors duration-150 hover:text-accent disabled:opacity-40"
              >
                Remover
              </button>
            </div>
          </div>

          {erro && (
            <p className="mt-2 text-xs text-accent" role="alert">
              {erro}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}
