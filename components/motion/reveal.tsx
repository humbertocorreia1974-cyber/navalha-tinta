'use client';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

type Variant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur' | 'fade';
const FROM: Record<Variant, string> = {
  up: 'translate3d(0,28px,0)', down: 'translate3d(0,-28px,0)', left: 'translate3d(-36px,0,0)',
  right: 'translate3d(36px,0,0)', scale: 'scale(.94)', blur: 'translate3d(0,12px,0)', fade: 'none',
};

/** Revela o conteúdo ao entrar na tela. Use em seções, cards e títulos; escalone com delay. */
export function Reveal({
  children, variant = 'up', delay = 0, duration = 700, once = true, className = '', as = 'div',
}: {
  children: ReactNode; variant?: Variant; delay?: number; duration?: number; once?: boolean;
  className?: string; as?: 'div' | 'section' | 'li' | 'span' | 'article' | 'p' | 'h1' | 'h2' | 'h3';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); if (once) io.disconnect(); }
      else if (!once) setShown(false);
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  const Tag = as as any;
  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : FROM[variant],
    filter: variant === 'blur' && !shown ? 'blur(8px)' : 'none',
    transition: `opacity ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms, filter ${duration}ms ease ${delay}ms`,
    willChange: 'opacity, transform',
  };
  return <Tag ref={ref} className={`rv ${className}`} style={style}>{children}</Tag>;
}

export default Reveal;
