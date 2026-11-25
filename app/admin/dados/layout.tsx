// jgnext:admin-data — trava no servidor: o painel de dados só abre para o dono logado.
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN = /^(admin|administrador|dono|owner|superadmin|super_admin|gerente)$/i;

export default async function AdminDataLayout({ children }: { children: React.ReactNode }) {
  const session: any = await getServerSession(authOptions as any);
  const email = session?.user?.email;
  if (!email) redirect('/login');
  const me = await (prisma as any).user.findUnique({ where: { email }, select: { role: true } }).catch(() => null);
  if (!me || !ADMIN.test(String(me.role))) {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">Acesso restrito</h1>
        <p className="mt-3 text-fg-muted">Esta área é só para o dono do site.</p>
      </main>
    );
  }
  return <>{children}</>;
}
