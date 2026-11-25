// jgnext:landing-archetype cinema — página inicial gerada por arquétipo (layout, movimento e ícones próprios).
import Link from 'next/link';
import ASSETS from '@/lib/assets';
import { copy } from '@/content/copy';
import { Reveal, Words, Parallax, Tilt, Magnetic, Marquee, ScrollBar } from '@/components/landing/fx';
import { SiteHeader } from '@/components/landing/header';
import { Icon, pickIcon } from '@/components/landing/icons';

export const dynamic = 'force-static';

const M: any = (copy as any).marketing || {};
export const metadata = {
  title: M.seoTitle || ASSETS.name,
  description: M.seoDescription || M.subheadline || '',
  openGraph: { title: M.seoTitle || ASSETS.name, description: M.seoDescription || M.subheadline || '', images: [ASSETS.hero] },
};

const NAV = [{"href":"/planos","label":"Planos"},{"href":"/servicos","label":"Serviços"},{"href":"/catalogo","label":"Catálogo"},{"href":"/agendar","label":"Agendar"},{"href":"/galeria","label":"Galeria"},{"href":"/contato","label":"Contato"},{"href":"/primeiros-passos","label":"Como usar"}] as { href: string; label: string }[];
const FOOT = [{"href":"/termos","label":"Termos"},{"href":"/privacidade","label":"Privacidade"},{"href":"/contato","label":"Contato"}] as { href: string; label: string }[];
const HEAD: string = M.heroHeadline || M.headline || ASSETS.name;
const SUB: string = M.heroSubheadline || M.subheadline || (ASSETS as any).slogan || '';
const BULLETS: string[] = ((M.featureBullets || M.bullets || M.features || []) as string[]).filter((b) => typeof b === 'string' && b.trim()).slice(0, 6);
const STEPS: string[] = (((copy as any).onboarding?.steps || []) as any[]).map((s) => (typeof s === 'string' ? s : s?.title || s?.text || '')).filter(Boolean).slice(0, 5);
const PH: string[] = ((ASSETS as any).photos && (ASSETS as any).photos.length ? (ASSETS as any).photos : [ASSETS.hero]) as string[];
const ph = (i: number) => PH[i % PH.length];

/** título curto de uma função: corta no primeiro conector e limita o tamanho */
const shortTitle = (b: string) => {
  const t = b.split(/ (?:com|quando|para|por|que|e|em|sem|de) /)[0].replace(/[.,;:]+$/, '');
  const s = t.length > 46 ? t.slice(0, 44).trimEnd() + '…' : t;
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const year = new Date().getFullYear();

export default function Home() {
  return (
    <main data-landing="cinema" className="overflow-x-clip bg-bg text-fg">
      <ScrollBar />
      <SiteHeader name={ASSETS.name} logo={ASSETS.logo} nav={NAV} variant="cinema" />

      {/* HERO em tela cheia */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-black text-white">
        <Parallax src={ph(0)} alt={ASSETS.name} speed={0.16} className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/25" />
        </Parallax>
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-40 sm:px-10 sm:pb-24">
          <Reveal variant="fade" delay={150}>
            <p className="mb-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"><span className="h-px w-10 bg-white/70" />{(ASSETS as any).slogan || ASSETS.name}</p>
          </Reveal>
          <Words text={HEAD} delay={250} className="font-display max-w-5xl text-[clamp(2.6rem,7.4vw,6.8rem)] font-bold leading-[0.96] tracking-tight" />
          <Reveal delay={900}><p className="mt-8 max-w-2xl text-lg text-white/80 sm:text-xl">{SUB}</p></Reveal>
          <Reveal delay={1100}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic><Link href="/register" className="inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-base font-semibold text-brand-fg shadow-2xl shadow-brand/40">Começar agora <span aria-hidden="true">→</span></Link></Magnetic>
              <Link href="/login" className="rounded-full border border-white/40 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white hover:text-black">Já tenho conta</Link>
            </div>
          </Reveal>
        </div>
        <div aria-hidden="true" className="absolute bottom-8 right-8 hidden flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/60 sm:flex">
          <span style={{ writingMode: 'vertical-rl' }}>role</span><span className="h-12 w-px animate-pulse bg-white/50" />
        </div>
      </section>

      {BULLETS.length > 0 && (
        <Marquee items={BULLETS.map(shortTitle)} className="border-y border-border bg-brand py-5 font-display text-xl font-semibold uppercase tracking-wide text-brand-fg" />
      )}

      {/* FUNÇÕES: título fixo à esquerda, cartões numerados à direita */}
      {BULLETS.length > 0 && (
        <section className="mx-auto grid max-w-7xl gap-14 px-5 py-28 sm:px-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal><p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Por dentro</p></Reveal>
            <Reveal delay={100}><h2 className="font-display mt-4 text-[clamp(2.1rem,4.6vw,4rem)] font-bold leading-[1.02] tracking-tight">{shortTitle(BULLETS[0])} e muito mais.</h2></Reveal>
            <Reveal delay={200}><p className="mt-6 max-w-md text-lg text-fg-muted">{SUB}</p></Reveal>
          </div>
          <div className="grid gap-5">
            {BULLETS.map((b, i) => (
              <Reveal key={i} delay={(i % 2) * 90}>
                <Tilt max={5} className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-7 sm:p-9">
                  <span aria-hidden="true" className="font-display pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] font-bold leading-none text-brand/10 transition-transform duration-500 group-hover:-translate-y-2">{String(i + 1).padStart(2, '0')}</span>
                  <div className="relative flex items-start gap-5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"><Icon name={pickIcon(b, i)} size={30} /></span>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{shortTitle(b)}</h3>
                      <p className="mt-2 text-fg-muted">{b}</p>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FAIXA DE FOTO com profundidade */}
      <section className="relative isolate">
        <Parallax src={ph(1)} alt="" speed={0.2} className="h-[78vh] min-h-[460px]">
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center px-5 text-center text-white sm:px-10">
            <Reveal><p className="font-display text-[clamp(1.8rem,4.4vw,3.6rem)] font-semibold leading-[1.1] tracking-tight">{(ASSETS as any).slogan || SUB}</p></Reveal>
          </div>
        </Parallax>
      </section>

      {/* COMO COMEÇAR */}
      {STEPS.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-28 sm:px-10">
          <Reveal><p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Como começar</p></Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.slice(0, 3).map((s, i) => (
              <Reveal key={i} delay={i * 130}>
                <div className="relative border-t-2 border-fg pt-6">
                  <span className="font-display text-6xl font-bold text-brand">{i + 1}</span>
                  <p className="mt-4 text-lg leading-relaxed">{s}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* GALERIA que rola para o lado */}
      {PH.length > 2 && (
        <section className="pb-28">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-10" style={{ scrollbarWidth: 'none' }}>
            {PH.slice(0, 6).map((p, i) => (
              <Reveal key={i} variant="mask" delay={i * 90} className="shrink-0 snap-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" loading="lazy" className="h-[52vh] min-h-[320px] w-[78vw] max-w-[520px] rounded-3xl object-cover transition-transform duration-700 hover:scale-[1.03]" style={{ marginTop: i % 2 ? 40 : 0 }} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA final em tela cheia */}
      <section className="relative isolate overflow-hidden text-white">
        <Parallax src={ph(2)} alt="" speed={0.12} className="absolute inset-0 -z-10"><div className="absolute inset-0 bg-black/60" /></Parallax>
        <div className="mx-auto max-w-5xl px-5 py-36 text-center sm:px-10">
          <Reveal><h2 className="font-display text-[clamp(2.2rem,6vw,5.2rem)] font-bold leading-[1] tracking-tight">Comece hoje no {ASSETS.name}.</h2></Reveal>
          <Reveal delay={150}><div className="mt-10"><Magnetic><Link href="/register" className="inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-base font-semibold text-black">Criar minha conta <span aria-hidden="true">→</span></Link></Magnetic></div></Reveal>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-10 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-fg-muted">
          <span className="font-display font-semibold text-fg">{ASSETS.name} © {year}</span>
          <nav className="flex flex-wrap gap-5">{FOOT.map((l) => (<Link key={l.href} href={l.href} className="hover:text-fg">{l.label}</Link>))}</nav>
        </div>
      </footer>
    </main>
  );
}
