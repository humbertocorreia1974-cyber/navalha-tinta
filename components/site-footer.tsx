'use client';
// jgnext:site-chrome — rodapé único: logo, slogan e links. Some se a tela já tiver rodapé próprio (home dos arquétipos).
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ASSETS from '@/lib/assets';

const NAV = {"links":[{"href":"/servicos","label":"Serviços"},{"href":"/barbeiros","label":"Barbeiros"},{"href":"/planos","label":"Planos"},{"href":"/galeria","label":"Galeria"},{"href":"/contato","label":"Contato"}],"cta":{"href":"/agendar","label":"Agendar"},"hasLogin":true,"account":"/minha-conta","footer":[{"href":"/termos","label":"Termos de uso"},{"href":"/privacidade","label":"Privacidade"}]};
const HIDE = [/^\/$/, /^\/login/, /^\/register/, /^\/cadastro/, /^\/redefinir-senha/, /^\/esqueci-senha/, /^\/admin/];

export function SiteFooter() {
  const pathname = usePathname() || '/';
  const [own, setOwn] = useState(false);
  useEffect(() => { setOwn(document.querySelectorAll('footer:not([data-site-footer])').length > 0); }, [pathname]);
  if (own || HIDE.some((re) => re.test(pathname))) return null;
  const all = [...NAV.links, ...(NAV.cta ? [NAV.cta] : []), ...NAV.footer];
  return (
    <footer data-site-footer className="mt-20 border-t border-border bg-surface/70 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[1.3fr_1fr] sm:px-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ASSETS.logo} alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
            <span className="font-display text-lg font-bold tracking-tight">{ASSETS.name}</span>
          </Link>
          {ASSETS.slogan && <p className="mt-3 max-w-sm text-sm text-fg-muted">{ASSETS.slogan}</p>}
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {all.map((l: any) => <li key={l.href}><Link href={l.href} className="text-fg-muted transition hover:text-brand">{l.label}</Link></li>)}
        </ul>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-fg-muted">© {new Date().getFullYear()} {ASSETS.name}. Todos os direitos reservados.</div>
    </footer>
  );
}
export default SiteFooter;
