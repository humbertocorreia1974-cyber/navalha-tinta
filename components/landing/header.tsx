'use client';
// jgnext:landing-header — cabeçalho com 3 variantes (cinema / editorial / mosaico). Muda ao rolar; menu móvel em tela cheia.
import Link from 'next/link';
import { useState } from 'react';
import { useScrolled } from './fx';

type NavItem = { href: string; label: string };

export function SiteHeader({ name, logo, nav, variant }: { name: string; logo: string; nav: NavItem[]; variant: 'cinema' | 'editorial' | 'mosaico' }) {
  const scrolled = useScrolled(30);
  const [open, setOpen] = useState(false);
  const links = nav.slice(0, 5);
  const close = () => setOpen(false);

  const brand = (
    <Link href="/" onClick={close} className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" className="h-9 w-9 rounded-lg object-cover" />
      <span className="font-display text-lg font-bold tracking-tight">{name}</span>
    </Link>
  );
  const cta = (
    <div className="hidden items-center gap-2 md:flex">
      <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-70">Entrar</Link>
      <Link href="/register" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg shadow-lg shadow-brand/30 transition hover:-translate-y-0.5">Começar</Link>
    </div>
  );
  const burger = (
    <button type="button" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(!open)} className="relative z-[70] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden">
      <span className="block h-0.5 w-6 bg-current transition" style={{ transform: open ? 'translateY(4px) rotate(45deg)' : 'none' }} />
      <span className="block h-0.5 w-6 bg-current transition" style={{ transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none' }} />
    </button>
  );
  const menu = open ? (
    <div className="fixed inset-0 z-[65] flex flex-col justify-center gap-5 bg-bg px-8 text-fg md:hidden">
      {links.map((l, i) => (
        <Link key={l.href} href={l.href} onClick={close} className="font-display text-4xl font-bold tracking-tight" style={{ animation: 'jgx-menu-in 500ms cubic-bezier(.2,.8,.2,1) ' + i * 70 + 'ms both' }}>{l.label}</Link>
      ))}
      <Link href="/register" onClick={close} className="mt-4 inline-flex w-fit rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-brand-fg">Começar agora</Link>
      <style>{'@keyframes jgx-menu-in{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}'}</style>
    </div>
  ) : null;
  const navLinks = (
    <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Principal">
      {links.map((l) => (<Link key={l.href} href={l.href} className="opacity-80 transition hover:opacity-100">{l.label}</Link>))}
    </nav>
  );

  if (variant === 'mosaico') {
    return (
    <><header className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
        <div className={'flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-border px-4 py-2 text-fg backdrop-blur-xl transition-all ' + (scrolled ? 'bg-surface/90 shadow-xl' : 'bg-surface/60')}>
          {brand}{navLinks}{cta}{burger}
        </div>
      </header>{menu}</>
    );
  }
  if (variant === 'editorial') {
    return (
    <><header className={'sticky top-0 z-[60] border-b text-fg backdrop-blur transition-colors ' + (scrolled ? 'border-fg/20 bg-bg/95' : 'border-fg/10 bg-bg/70')}>
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 py-4 sm:px-10">
          <div className="hidden md:block">{navLinks}</div>
          <div className="justify-self-start md:justify-self-center">{brand}</div>
          <div className="flex items-center justify-end gap-2">{cta}{burger}</div>
        </div>
      </header>{menu}</>
    );
  }
  return (
    <><header className={'fixed inset-x-0 top-0 z-[60] transition-all duration-300 ' + (scrolled ? 'border-b border-border bg-bg/85 text-fg backdrop-blur-xl' : 'bg-transparent text-white')}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-10">
        {brand}{navLinks}{cta}{burger}
      </div>
    </header>{menu}</>
  );
}
