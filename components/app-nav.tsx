'use client';
// jgnext:site-chrome — menu único do site (gerado; não edite à mão). Logo da marca, 5 links no máximo, hambúrguer no celular.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import ASSETS from '@/lib/assets';

const NAV = {"links":[{"href":"/servicos","label":"Serviços"},{"href":"/barbeiros","label":"Barbeiros"},{"href":"/planos","label":"Planos"},{"href":"/galeria","label":"Galeria"},{"href":"/contato","label":"Contato"}],"cta":{"href":"/agendar","label":"Agendar"},"hasLogin":false,"account":"/minha-conta","footer":[{"href":"/termos","label":"Termos de uso"},{"href":"/privacidade","label":"Privacidade"}]};
const HIDE = [/^\/$/, /^\/login/, /^\/register/, /^\/cadastro/, /^\/redefinir-senha/, /^\/esqueci-senha/, /^\/recuperar/, /^\/verificar/];

export function AppNav() {
  const pathname = usePathname() || '/';
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  if (HIDE.some((re) => re.test(pathname))) return null;
  const isActive = (h: string) => pathname === h || pathname.startsWith(h + '/');
  const role = String((session?.user as any)?.role || '').toLowerCase();
  const staff = /admin|dono|owner|gestor|gerente|barbeiro|profissional/.test(role);
  return (
    <header data-site-nav className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={ASSETS.name + ' — início'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ASSETS.logo} alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
          <span className="font-display text-base font-bold tracking-tight">{ASSETS.name}</span>
        </Link>
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.links.map((l: any) => (
            <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? 'page' : undefined} className={'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ' + (isActive(l.href) ? 'text-brand' : 'text-fg-muted hover:text-fg')}>
              {l.label}
              <span aria-hidden="true" className={'absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand transition-transform duration-300 ' + (isActive(l.href) ? 'scale-x-100' : 'scale-x-0')} />
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              {staff && <Link href="/admin/dados" className="rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted transition hover:text-fg">Painel</Link>}
              {NAV.account && <Link href={NAV.account} className="rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted transition hover:text-fg">Minha conta</Link>}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted transition hover:text-fg">Sair</button>
            </>
          ) : NAV.hasLogin ? <Link href="/login" className="rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted transition hover:text-fg">Entrar</Link> : null}
          {NAV.cta && <Link href={NAV.cta.href} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:shadow-xl">{NAV.cta.label}</Link>}
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-border lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
        </button>
      </div>
      <div className={'fixed inset-x-0 top-16 bottom-0 z-30 bg-bg/95 backdrop-blur-xl transition-all duration-300 lg:hidden ' + (open ? 'visible opacity-100' : 'invisible opacity-0')}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-6" aria-label="Menu do celular">
          {NAV.links.map((l: any, i: number) => (
            <Link key={l.href} href={l.href} style={{ transitionDelay: open ? i * 45 + 'ms' : '0ms' }} className={'rounded-2xl px-4 py-4 font-display text-2xl font-bold tracking-tight transition-all duration-300 ' + (open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0') + (isActive(l.href) ? ' text-brand' : '')}>{l.label}</Link>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-5">
            {NAV.cta && <Link href={NAV.cta.href} className="rounded-full bg-brand px-6 py-4 text-center text-base font-semibold text-white">{NAV.cta.label}</Link>}
            {session ? (
              <>
                {staff && <Link href="/admin/dados" className="rounded-full border border-border px-6 py-3.5 text-center font-medium">Painel do dono</Link>}
                {NAV.account && <Link href={NAV.account} className="rounded-full border border-border px-6 py-3.5 text-center font-medium">Minha conta</Link>}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="rounded-full px-6 py-3.5 text-center font-medium text-fg-muted">Sair</button>
              </>
            ) : NAV.hasLogin ? <Link href="/login" className="rounded-full border border-border px-6 py-3.5 text-center font-medium">Entrar</Link> : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
export default AppNav;
