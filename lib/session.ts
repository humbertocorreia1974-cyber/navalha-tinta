import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireUser();
  const role = (session.user as { role?: string }).role ?? "user";
  if (!roles.includes(role)) redirect("/sem-permissao");
  return session;
}
