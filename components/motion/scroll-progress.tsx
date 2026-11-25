'use client';
import { useEffect, useState } from 'react';

/** Barra fina no topo que mostra o progresso de rolagem da página. */
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return <div aria-hidden className="fixed left-0 top-0 z-[60] h-[3px] origin-left bg-[hsl(var(--brand,220_90%_50%))]" style={{ transform: `scaleX(${p})` }} />;
}

export default ScrollProgress;
