'use client';
// jgnext:landing-fx — movimento próprio da landing (sem dependências). Respeita "reduzir movimento".
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

function reduced(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

type Variant = 'up' | 'left' | 'right' | 'scale' | 'mask' | 'fade';

/** Revela o bloco ao entrar na tela. `mask` abre a imagem como uma cortina. */
export function Reveal({
  children, variant = 'up', delay = 0, duration = 900, className = '', style,
}: { children: ReactNode; variant?: Variant; delay?: number; duration?: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || !('IntersectionObserver' in window)) { setShown(true); setReady(true); return; }
    setReady(true);
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setShown(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const from: Record<Variant, CSSProperties> = {
    up: { transform: 'translate3d(0,40px,0)', opacity: 0 },
    left: { transform: 'translate3d(-56px,0,0)', opacity: 0 },
    right: { transform: 'translate3d(56px,0,0)', opacity: 0 },
    scale: { transform: 'scale(.92)', opacity: 0 },
    mask: { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
    fade: { opacity: 0 },
  };
  const to: CSSProperties = variant === 'mask' ? { clipPath: 'inset(0 0 0 0)' } : { transform: 'none', opacity: 1 };
  const base: CSSProperties = ready && !shown ? from[variant] : shown ? to : {};
  const tr = variant === 'mask' ? 'clip-path ' + duration + 'ms cubic-bezier(.77,0,.18,1) ' + delay + 'ms' : 'opacity ' + duration + 'ms cubic-bezier(.2,.7,.2,1) ' + delay + 'ms, transform ' + duration + 'ms cubic-bezier(.2,.7,.2,1) ' + delay + 'ms';
  // mask: o observador fica no contêiner externo (sem recorte) — um alvo já recortado a 100% nunca é visto como visível.
  if (variant === 'mask') {
    return <div ref={ref} className={className} style={style}><div style={{ ...base, transition: ready ? tr : undefined }}>{children}</div></div>;
  }
  return <div ref={ref} className={className} style={{ ...base, ...style, transition: ready ? tr : undefined, willChange: 'transform, opacity' }}>{children}</div>;
}

/** Título que entra palavra por palavra. */
export function Words({ text, className = '', delay = 0, as = 'h1' }: { text: string; className?: string; delay?: number; as?: 'h1' | 'h2' | 'p' | 'div' }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 80); return () => clearTimeout(t); }, []);
  const Tag = as as any;
  return (
    <Tag className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden="true" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.14em', marginBottom: '-0.14em' }}>
          <span style={{ display: 'inline-block', transform: on ? 'translateY(0)' : 'translateY(115%)', opacity: on ? 1 : 0, transition: 'transform 900ms cubic-bezier(.2,.8,.2,1) ' + (delay + i * 65) + 'ms, opacity 700ms ease ' + (delay + i * 65) + 'ms' }}>{w}&nbsp;</span>
        </span>
      ))}
    </Tag>
  );
}

/** Foto que se move mais devagar que a rolagem (profundidade). */
export function Parallax({ src, alt = '', speed = 0.14, className = '', children }: { src: string; alt?: string; speed?: number; className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);
  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        setY((r.top + r.height / 2 - window.innerHeight / 2) * -speed);
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [speed]);
  return (
    <div ref={ref} className={(/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative ') + 'overflow-hidden ' + className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="absolute left-0 w-full object-cover" style={{ top: '-12%', height: '124%', transform: 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(1.06)', willChange: 'transform' }} />
      {children}
    </div>
  );
}

/** Cartão que acompanha o mouse em 3D. */
export function Tilt({ children, className = '', max = 9 }: { children: ReactNode; className?: string; max?: number }) {
  const [t, setT] = useState('perspective(900px) rotateX(0deg) rotateY(0deg)');
  return (
    <div
      className={className}
      onMouseMove={(e) => {
        if (reduced()) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setT('perspective(900px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg) translateZ(0)');
      }}
      onMouseLeave={() => setT('perspective(900px) rotateX(0deg) rotateY(0deg)')}
      style={{ transform: t, transition: 'transform 260ms ease-out', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/** Botão que é atraído pelo cursor. */
export function Magnetic({ children, className = '', strength = 0.28 }: { children: ReactNode; className?: string; strength?: number }) {
  const [p, setP] = useState({ x: 0, y: 0 });
  return (
    <span
      className={'inline-block ' + className}
      onMouseMove={(e) => {
        if (reduced()) return;
        const r = e.currentTarget.getBoundingClientRect();
        setP({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength });
      }}
      onMouseLeave={() => setP({ x: 0, y: 0 })}
      style={{ transform: 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0)', transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)' }}
    >
      {children}
    </span>
  );
}

/** Número que sobe até o valor quando aparece. */
export function Counter({ to, suffix = '', className = '' }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduced() || !('IntersectionObserver' in window)) { setV(to); return; }
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 1400);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref} className={className}>{v}{suffix}</span>;
}

/** Faixa de texto em loop infinito. */
export function Marquee({ items, className = '', speed = 38 }: { items: string[]; className?: string; speed?: number }) {
  const row = items.concat(items);
  return (
    <div className={'overflow-hidden ' + className} aria-hidden="true">
      <style>{'@keyframes jgx-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){.jgx-marquee{animation:none!important}}'}</style>
      <div className="jgx-marquee flex w-max items-center gap-10 whitespace-nowrap" style={{ animation: 'jgx-marquee ' + speed + 's linear infinite' }}>
        {row.map((t, i) => (<span key={i} className="flex items-center gap-10"><span>{t}</span><span style={{ width: 8, height: 8, borderRadius: 999, background: 'currentColor', opacity: 0.5, display: 'inline-block' }} /></span>))}
      </div>
    </div>
  );
}

/** Barra de progresso da rolagem no topo. */
export function ScrollBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => { const h = document.documentElement.scrollHeight - window.innerHeight; setP(h > 0 ? window.scrollY / h : 0); };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]"><div className="h-full bg-brand" style={{ width: (p * 100).toFixed(1) + '%', transition: 'width 80ms linear' }} /></div>;
}

/** Flutua suavemente (para selos e chips). */
export function Float({ children, className = '', amp = 10, dur = 6, delay = 0 }: { children: ReactNode; className?: string; amp?: number; dur?: number; delay?: number }) {
  const name = 'jgx-float-' + amp;
  return (
    <div className={className} style={{ animation: name + ' ' + dur + 's ease-in-out ' + delay + 's infinite alternate' }}>
      <style>{'@keyframes ' + name + '{from{transform:translateY(0)}to{transform:translateY(-' + amp + 'px)}}@media (prefers-reduced-motion:reduce){[style*="jgx-float"]{animation:none!important}}'}</style>
      {children}
    </div>
  );
}

/** Cabeçalho que muda ao rolar (transparente → sólido). */
export function useScrolled(offset = 40): boolean {
  const [s, setS] = useState(false);
  useEffect(() => {
    const on = () => setS(window.scrollY > offset);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [offset]);
  return s;
}
