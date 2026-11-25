"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

type Step = {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
  cta: string;
};

const STORAGE_KEY = "navalha-onboarding-dismissed";

export function OnboardingChecklistClient({ steps }: { steps: Step[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setDismissed(parsed.filter((x) => typeof x === "string"));
        }
      }
    } catch {
      // ignora falha de parse, mantém estado vazio
    }
    setHydrated(true);
  }, []);

  const persist = (next: string[]) => {
    setDismissed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignora falha de storage
    }
  };

  const toggle = (id: string) => {
    if (dismissed.includes(id)) {
      persist(dismissed.filter((x) => x !== id));
    } else {
      persist([...dismissed, id]);
    }
  };

  const visibleSteps = useMemo(
    () =>
      steps.map((s) => ({
        ...s,
        checked: s.done || dismissed.includes(s.id),
      })),
    [steps, dismissed],
  );

  const allDone = visibleSteps.every((s) => s.checked);

  return (
    <Card className="border border-border">
      <CardBody>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-fg">
            Seu checklist
          </h2>
          {allDone && (
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              Tudo pronto
            </span>
          )}
        </div>

        <ul className="flex flex-col divide-y divide-border">
          {visibleSteps.map((step) => (
            <li
              key={step.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  aria-pressed={step.checked}
                  aria-label={
                    step.checked
                      ? `Marcar como pendente: ${step.label}`
                      : `Marcar como concluído: ${step.label}`
                  }
                  className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded border transition-all duration-150 ${
                    step.checked
                      ? "border-brand bg-brand text-brand-fg"
                      : "border-border bg-surface hover:bg-white/5"
                  }`}
                  disabled={step.done}
                >
                  {step.checked && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step.checked
                        ? "text-fg-muted line-through"
                        : "text-fg"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {step.description}
                  </p>
                </div>
              </div>
              <div className="flex-none pl-8 sm:pl-0">
                {step.done ? (
                  <span className="text-xs font-medium text-brand">
                    Concluído
                  </span>
                ) : (
                  <Link href={step.href}>
                    <Button variant="secondary" size="sm">
                      {step.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>

        {!hydrated && (
          <p className="mt-4 text-xs text-fg-muted">Carregando seu progresso...</p>
        )}
      </CardBody>
    </Card>
  );
}
