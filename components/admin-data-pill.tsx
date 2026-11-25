'use client';
// jgnext:admin-data — atalho flutuante "Meus dados": aparece só para o dono logado.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function AdminDataPill() {
  const [ok, setOk] = useState(false);
  const path = usePathname() || '/';
  useEffect(() => {
    let alive = true;
    fetch('/api/admin/data/_me').then((r) => { if (alive && r.ok) setOk(true); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!ok || path.startsWith('/admin/dados')) return null;
  return (
    <Link href="/admin/dados" className="fixed bottom-5 left-5 z-[55] inline-flex items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-sm font-semibold text-bg shadow-2xl transition hover:-translate-y-0.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg>
      Meus dados
    </Link>
  );
}
