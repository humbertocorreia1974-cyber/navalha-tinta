'use client';
// jgnext:backdrop — foto de fundo nas páginas internas (login, cadastro, painéis, listas). A home (data-landing) não usa.
import { usePathname } from 'next/navigation';
import ASSETS from '@/lib/assets';

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

export function PageBackdrop() {
  const path = usePathname() || '/';
  const photos: string[] = ((ASSETS as any).photos || []).filter(Boolean);
  const pool = photos.length ? photos : ((ASSETS as any).hero ? [(ASSETS as any).hero] : []);
  if (!pool.length) return null;
  const seg = '/' + (path.split('/')[1] || '');
  const src = pool[hash(seg) % pool.length];
  const auth = /^\/(login|cadastro|registro|signup|register|entrar|esqueci)/.test(path);
  return (
    <>
      <style>{`
        body:has([data-landing]) .jg-backdrop{display:none}
        body:has(.jg-backdrop){background-color:transparent !important}
        body:has(.jg-backdrop) main[class*="bg-bg"],body:has(.jg-backdrop) div[class*="min-h-screen"][class*="bg-bg"]{background-color:transparent !important}
        body:has(.jg-backdrop) [class*="from-bg"][class*="via-bg"]{background-image:none !important}
        body:has(.jg-backdrop) section[class*="bg-surface"]{background-color:color-mix(in srgb, var(--jg-surface, #fff) 55%, transparent) !important;backdrop-filter:blur(6px)}
        @keyframes jg-drift{from{transform:scale(1.06) translate3d(0,0,0)}to{transform:scale(1.14) translate3d(-1.5%,-1%,0)}}
        @media (prefers-reduced-motion: reduce){.jg-backdrop img{animation:none !important}}
      `}</style>
      <div aria-hidden="true" className="jg-backdrop bg-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" style={{ opacity: auth ? 0.55 : 0.34, animation: 'jg-drift 40s ease-in-out infinite alternate', filter: 'saturate(1.1)' }} />
        <div className="absolute inset-0" style={{ background: auth ? 'linear-gradient(180deg, rgb(0 0 0 / .25), rgb(0 0 0 / .55))' : 'linear-gradient(180deg, var(--jg-bg-a, transparent), var(--jg-bg-b, transparent))' }} />
        <div className="bg-bg absolute inset-0" style={{ opacity: auth ? 0.3 : 0.62 }} />
      </div>
    </>
  );
}
export default PageBackdrop;
