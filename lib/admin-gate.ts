// jgnext:admin-data — confere no SERVIDOR, antes de renderizar qualquer coisa, se quem abriu a página é o dono.
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ADMIN = /^(admin|administrador|dono|owner|superadmin|super_admin|gerente)$/i;

/** Sem login → manda para /login. Logado sem ser dono → devolve false (a página mostra "Acesso restrito"). */
export async function ownerOrRedirect(): Promise<boolean> {
  const session: any = await getServerSession(authOptions as any);
  const email = session?.user?.email;
  if (!email) redirect('/login');
  const me = await (prisma as any).user.findUnique({ where: { email }, select: { role: true } }).catch(() => null);
  return !!me && ADMIN.test(String(me.role));
}
