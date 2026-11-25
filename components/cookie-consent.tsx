'use client';
/* brand-guard */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'cookie-consent-v1';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { if (!localStorage.getItem(STORAGE_KEY)) setVisible(true); } catch { /* sem storage — não bloqueia */ }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const apply = () => { document.body.style.paddingBottom = (ref.current?.offsetHeight ?? 0) + 'px'; };
    apply();
    window.addEventListener('resize', apply);
    return () => { window.removeEventListener('resize', apply); document.body.style.paddingBottom = ''; };
  }, [visible]);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* segue */ }
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div ref={ref} role="region" aria-label="Aviso de cookies" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 py-2.5 pl-4 pr-20 sm:px-6 sm:pr-24">
        <p className="text-xs leading-snug text-fg-muted">
          Usamos cookies essenciais. Ao continuar, você concorda com a{' '}
          <Link href="/privacidade" className="underline underline-offset-2 hover:text-fg">Política de Privacidade</Link>.
        </p>
        <button type="button" onClick={accept} className="shrink-0 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-bg transition hover:opacity-90">Entendi</button>
      </div>
    </div>
  );
}
