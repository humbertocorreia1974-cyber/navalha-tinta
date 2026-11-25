'use client';
// jgnext-motion: revela o bloco com fade + subida suave ao entrar na tela (uma vez). Respeita "reduzir movimento".
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'ssr' | 'hidden' | 'shown'>('ssr');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { setState('shown'); return; }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) { setState('shown'); return; }
    setState('hidden');
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setState('shown'); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} transition-[opacity,transform] duration-700 ease-out ${state === 'hidden' ? 'translate-y-5 opacity-0' : 'translate-y-0 opacity-100'}`} style={{ transitionDelay: state === 'shown' ? `${delay}ms` : '0ms' }}>
      {children}
    </div>
  );
}
