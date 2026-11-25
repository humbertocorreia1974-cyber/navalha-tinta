"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  appointments: number;
  orders: number;
};

const ROLE_LABEL: Record<string, string> = {
  user: "Cliente",
  barber: "Barbeiro",
  admin: "Admin",
};

const ROLE_CLASS: Record<string, string> = {
  user: "bg-brand/10 text-brand",
  barber: "bg-accent/15 text-accent",
  admin: "bg-fg/10 text-fg",
};

export function UsersTableClient({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(
    null
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  async function changeRole(id: string, role: string) {
    setPendingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ ok: false, msg: data.error ?? "Falha ao alterar papel" });
        return;
      }
      setFeedback({ ok: true, msg: `Papel atualizado para ${ROLE_LABEL[role] ?? role}` });
      startTransition(() => router.refresh());
    } catch {
      setFeedback({ ok: false, msg: "Erro de rede ao alterar papel" });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:max-w-xs"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <option value="all">Todos os papéis</option>
          <option value="user">Cliente</option>
          <option value="barber">Barbeiro</option>
          <option value="admin">Admin</option>
        </select>
        <span className="text-xs text-fg-muted sm:ml-auto">
          {filtered.length} de {users.length} usuários
        </span>
      </div>

      {feedback && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            feedback.ok
              ? "border-brand/40 bg-brand/10 text-brand"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}
        >
          {feedback.msg}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-fg-muted">
            Nenhum usuário encontrado com esses filtros.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              setQuery("");
              setRoleFilter("all");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-xs uppercase tracking-wide text-fg-muted">
              <tr>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Agend.</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-border transition-colors duration-150 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg">{u.name}</p>
                    <p className="text-xs text-fg-muted">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        ROLE_CLASS[u.role] ?? "bg-fg/10 text-fg"
                      }`}
                    >
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{u.plan}</td>
                  <td className="px-4 py-3 text-fg-muted">{u.appointments}</td>
                  <td className="px-4 py-3 text-fg-muted">{u.orders}</td>
                  <td className="px-4 py-3 text-fg-muted">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {(["user", "barber", "admin"] as const)
                        .filter((r) => r !== u.role)
                        .map((r) => (
                          <Button
                            key={r}
                            variant="ghost"
                            size="sm"
                            disabled={pendingId === u.id || u.id === currentUserId}
                            onClick={() => changeRole(u.id, r)}
                          >
                            {pendingId === u.id
                              ? "..."
                              : `Tornar ${ROLE_LABEL[r]}`}
                          </Button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
