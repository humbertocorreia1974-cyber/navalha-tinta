'use client';
// jgnext-motion: barra fina no topo durante a troca de página (feedback imediato do toque).
import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [w, setW] = useState(0);
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  useEffect(() => {
    stop(); setW(100);
    const t = setTimeout(() => { setOn(false); setW(0); }, 260);
    return () => clearTimeout(t);
  }, [pathname, search]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      stop(); setOn(true); setW(12);
      timer.current = setInterval(() => setW((x) => (x < 85 ? x + (90 - x) * 0.12 : x)), 180);
    };
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('click', onClick); stop(); };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" style={{ opacity: on ? 1 : 0, transition: 'opacity 200ms' }}>
      <div className="h-full bg-brand" style={{ width: `${w}%`, transition: 'width 220ms ease-out' }} />
    </div>
  );
}
