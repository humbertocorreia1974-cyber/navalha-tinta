import type { ReactNode } from 'react';

/** Faixa que rola sozinha (logos de parceiros, serviços, selos). Pausa ao passar o mouse. */
export function Marquee({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`marquee overflow-hidden ${className}`} aria-hidden="false">
      <div className="marquee-track">
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

export default Marquee;
