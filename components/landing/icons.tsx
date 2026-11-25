// jgnext:landing-icons — ícones duotom desenhados à mão (32x32). Escolha semântica pelo texto da função.
import type { ReactNode } from 'react';

const T = { fill: 'currentColor', fillOpacity: 0.14, stroke: 'none' } as const;

const ICONS: Record<string, ReactNode> = {
  calendar: (<><rect x="4" y="6" width="24" height="22" rx="5" {...T} /><rect x="4" y="6" width="24" height="22" rx="5" /><path d="M4 13h24M10 3v6M22 3v6" /><circle cx="11" cy="19" r="1.4" fill="currentColor" stroke="none" /><circle cx="16" cy="19" r="1.4" fill="currentColor" stroke="none" /><circle cx="21" cy="19" r="1.4" fill="currentColor" stroke="none" /><circle cx="11" cy="24" r="1.4" fill="currentColor" stroke="none" /><circle cx="16" cy="24" r="1.4" fill="currentColor" stroke="none" /></>),
  wallet: (<><rect x="3" y="8" width="26" height="18" rx="5" {...T} /><rect x="3" y="8" width="26" height="18" rx="5" /><path d="M3 14h26" /><circle cx="23" cy="20" r="1.8" fill="currentColor" stroke="none" /><path d="M7 5l14 0" /></>),
  check: (<><circle cx="16" cy="16" r="12" {...T} /><circle cx="16" cy="16" r="12" /><path d="M10 16.5l4 4 8-9" /></>),
  users: (<><circle cx="12" cy="12" r="4.5" {...T} /><circle cx="12" cy="12" r="4.5" /><path d="M3.5 27c0-5 3.8-8 8.5-8s8.5 3 8.5 8" /><circle cx="23" cy="11" r="3.4" /><path d="M23 18.2c3.6.3 5.5 2.7 5.5 6.3" /></>),
  bell: (<><path d="M8 22v-7a8 8 0 0116 0v7l2 3H6z" {...T} /><path d="M8 22v-7a8 8 0 0116 0v7l2 3H6z" /><path d="M13 28a3 3 0 006 0" /></>),
  chart: (<><rect x="5" y="16" width="5" height="11" rx="1.6" {...T} /><rect x="13.5" y="9" width="5" height="18" rx="1.6" {...T} /><rect x="22" y="4" width="5" height="23" rx="1.6" {...T} /><rect x="5" y="16" width="5" height="11" rx="1.6" /><rect x="13.5" y="9" width="5" height="18" rx="1.6" /><rect x="22" y="4" width="5" height="23" rx="1.6" /><path d="M3 29.5h26" /></>),
  clock: (<><circle cx="16" cy="16" r="12" {...T} /><circle cx="16" cy="16" r="12" /><path d="M16 9v7l5 3" /></>),
  shield: (<><path d="M16 3l11 4v8c0 7-4.6 11.5-11 14C9.600 26.500 5 22 5 15V7z" {...T} /><path d="M16 3l11 4v8c0 7-4.6 11.5-11 14C9.600 26.500 5 22 5 15V7z" /><path d="M11 16l3.500 3.500L21 12" /></>),
  chat: (<><path d="M5 7a4 4 0 014-4h14a4 4 0 014 4v11a4 4 0 01-4 4H14l-6 5v-5H9a4 4 0 01-4-4z" {...T} /><path d="M5 7a4 4 0 014-4h14a4 4 0 014 4v11a4 4 0 01-4 4H14l-6 5v-5H9a4 4 0 01-4-4z" /><circle cx="11" cy="12.500" r="1.200" fill="currentColor" stroke="none" /><circle cx="16" cy="12.500" r="1.200" fill="currentColor" stroke="none" /><circle cx="21" cy="12.500" r="1.200" fill="currentColor" stroke="none" /></>),
  box: (<><path d="M4 10l12-6 12 6v12l-12 6-12-6z" {...T} /><path d="M4 10l12-6 12 6v12l-12 6-12-6z" /><path d="M4 10l12 6 12-6M16 16v12" /></>),
  trophy: (<><path d="M10 4h12v8a6 6 0 01-12 0z" {...T} /><path d="M10 4h12v8a6 6 0 01-12 0z" /><path d="M10 7H5v2a4 4 0 004 4M22 7h5v2a4 4 0 01-4 4M16 18v5M11 28h10M13 23h6" /></>),
  camera: (<><rect x="3" y="9" width="26" height="18" rx="5" {...T} /><rect x="3" y="9" width="26" height="18" rx="5" /><path d="M11 9l2-4h6l2 4" /><circle cx="16" cy="18" r="5" /></>),
  pin: (<><path d="M16 29s9-8.200 9-15a9 9 0 10-18 0c0 6.800 9 15 9 15z" {...T} /><path d="M16 29s9-8.200 9-15a9 9 0 10-18 0c0 6.800 9 15 9 15z" /><circle cx="16" cy="14" r="3.200" /></>),
  dumbbell: (<><path d="M9 8v16M23 8v16M5 12v8M27 12v8M9 16h14" /><rect x="7" y="8" width="4" height="16" rx="1.500" {...T} /><rect x="21" y="8" width="4" height="16" rx="1.500" {...T} /></>),
  lotus: (<><path d="M16 27c-5-2-8-6-8-11 3 .4 6 2.200 8 5.500 2-3.300 5-5.100 8-5.500 0 5-3 9-8 11z" {...T} /><path d="M16 27c-5-2-8-6-8-11 3 .4 6 2.200 8 5.500 2-3.300 5-5.100 8-5.500 0 5-3 9-8 11z" /><path d="M16 21.500c-2-2.500-3-5.500-3-9 0-3 1.200-5.500 3-7.500 1.800 2 3 4.500 3 7.500 0 3.500-1 6.500-3 9z" /><path d="M3 24.500c3 1.800 7 2.800 13 2.800s10-1 13-2.800" /></>),
  scissors: (<><circle cx="8" cy="8" r="4" {...T} /><circle cx="8" cy="24" r="4" {...T} /><circle cx="8" cy="8" r="4" /><circle cx="8" cy="24" r="4" /><path d="M11.500 10.500L28 24M11.500 21.500L28 8" /></>),
  flame: (<><path d="M16 29c5.500 0 9-3.600 9-8.600 0-4-2.500-6.400-4.500-9.200-1 1.800-2.300 2.600-3.800 3 .6-3.800-.8-8-4.700-10.200.3 5-3.800 7.400-5.400 11.400C6 17 6.500 19 7 21c1.300 4.400 4.500 8 9 8z" {...T} /><path d="M16 29c5.500 0 9-3.600 9-8.600 0-4-2.500-6.400-4.500-9.200-1 1.800-2.300 2.600-3.800 3 .6-3.800-.8-8-4.700-10.200.3 5-3.800 7.400-5.400 11.400C6 17 6.500 19 7 21c1.300 4.400 4.500 8 9 8z" /></>),
  drop: (<><path d="M16 4s8 8.200 8 14a8 8 0 01-16 0c0-5.800 8-14 8-14z" {...T} /><path d="M16 4s8 8.200 8 14a8 8 0 01-16 0c0-5.800 8-14 8-14z" /><path d="M12.500 19a3.500 3.500 0 003.500 3.200" /></>),
  tooth: (<><path d="M9 5c-3 0-4.800 2.400-4.800 5.400 0 4 2 6 2.700 9.400.4 2.400 1.200 6.700 3.400 6.700s1.900-5.400 4.100-5.400 1.900 5.400 4.100 5.400 3-4.300 3.400-6.700c.7-3.400 2.700-5.400 2.700-9.400C25.600 7.400 23.800 5 20.800 5c-2.400 0-3.500 1.300-4.800 1.300S11.400 5 9 5z" {...T} /><path d="M9 5c-3 0-4.800 2.400-4.800 5.400 0 4 2 6 2.700 9.400.4 2.400 1.200 6.700 3.400 6.700s1.900-5.400 4.100-5.400 1.900 5.400 4.100 5.400 3-4.300 3.400-6.700c.7-3.400 2.700-5.400 2.700-9.400C25.600 7.400 23.800 5 20.800 5c-2.400 0-3.500 1.300-4.800 1.300S11.400 5 9 5z" /></>),
  paw: (<><circle cx="7" cy="14" r="2.600" /><circle cx="12.500" cy="7.500" r="2.600" /><circle cx="19.500" cy="7.500" r="2.600" /><circle cx="25" cy="14" r="2.600" /><path d="M16 15c-4 0-7.500 4-7.500 7.500 0 2.400 2 3.500 4 3.500 1.400 0 2.200-.7 3.500-.7s2.100.7 3.500.7c2 0 4-1.100 4-3.500C23.500 19 20 15 16 15z" {...T} /><path d="M16 15c-4 0-7.500 4-7.500 7.500 0 2.400 2 3.500 4 3.500 1.400 0 2.200-.7 3.500-.7s2.100.7 3.500.7c2 0 4-1.100 4-3.500C23.500 19 20 15 16 15z" /></>),
  book: (<><path d="M5 5.500A3 3 0 018 3h19v22H8a3 3 0 00-3 3z" {...T} /><path d="M5 5.500A3 3 0 018 3h19v22H8a3 3 0 00-3 3z" /><path d="M5 28a3 3 0 003 3h19M11 9h11M11 14h8" /></>),
  bag: (<><path d="M5 10h22l-1.500 18h-19z" {...T} /><path d="M5 10h22l-1.500 18h-19z" /><path d="M11 10V8a5 5 0 0110 0v2" /></>),
  house: (<><path d="M5 15L16 5l11 10v13H5z" {...T} /><path d="M3 15L16 4l13 11M6 13v15h20V13" /><path d="M13 28v-8h6v8" /></>),
  leaf: (<><path d="M6 26C6 13 13 6 27 5c0 13-7 20-18 20z" {...T} /><path d="M6 26C6 13 13 6 27 5c0 13-7 20-18 20z" /><path d="M6 26c4-7 9-11 14-14" /></>),
  target: (<><circle cx="16" cy="16" r="12" {...T} /><circle cx="16" cy="16" r="12" /><circle cx="16" cy="16" r="6.500" /><circle cx="16" cy="16" r="1.500" fill="currentColor" stroke="none" /></>),
  spark: (<><path d="M16 3l3.200 9.800L29 16l-9.800 3.200L16 29l-3.200-9.800L3 16l9.800-3.200z" {...T} /><path d="M16 3l3.200 9.800L29 16l-9.800 3.200L16 29l-3.200-9.800L3 16l9.800-3.200z" /></>),
  repeat: (<><path d="M5 14V12a5 5 0 015-5h15M27 18v2a5 5 0 01-5 5H7" /><path d="M21 3l4 4-4 4M11 29l-4-4 4-4" /></>),
  tag: (<><path d="M3 4h12l14 14-11 11L4 15z" {...T} /><path d="M3 4h12l14 14-11 11L4 15z" /><circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" /></>),
  mail: (<><rect x="3" y="7" width="26" height="19" rx="4.500" {...T} /><rect x="3" y="7" width="26" height="19" rx="4.500" /><path d="M4 10l12 9 12-9" /></>),
  lock: (<><rect x="6" y="14" width="20" height="14" rx="4" {...T} /><rect x="6" y="14" width="20" height="14" rx="4" /><path d="M10 14V10a6 6 0 0112 0v4" /><circle cx="16" cy="21" r="1.800" fill="currentColor" stroke="none" /></>),
  list: (<><rect x="5" y="4" width="22" height="24" rx="4.500" {...T} /><rect x="5" y="4" width="22" height="24" rx="4.500" /><path d="M10 11h12M10 16h12M10 21h7" /></>),
  heart: (<><path d="M16 28S4 20.500 4 12.500A6.500 6.500 0 0116 9a6.500 6.500 0 0112 3.500C28 20.500 16 28 16 28z" {...T} /><path d="M16 28S4 20.500 4 12.500A6.500 6.500 0 0116 9a6.500 6.500 0 0112 3.500C28 20.500 16 28 16 28z" /></>),
};

const RULES: [RegExp, string][] = [
  [/pilates|yoga|alonga|bem-?estar|medita|postur/i, 'lotus'],
  [/treino|exerc[ií]cio|muscula|academia|fitness|crossfit/i, 'dumbbell'],
  [/corte|barba|cabelo|barbeir|tesoura/i, 'scissors'],
  [/dente|dental|odonto|sorriso/i, 'tooth'],
  [/pet\b|cachorro|gato|veterin/i, 'paw'],
  [/pix|pagament|cart[ãa]o|cobran|mensalid|assinatur|fatura|checkout|recebiment/i, 'wallet'],
  [/chamada|check-?in|presen[çc]a|confirma/i, 'check'],
  [/lembrete|notifica|aviso|sino/i, 'bell'],
  [/whatsapp|mensagem|chat|atendimento|suporte/i, 'chat'],
  [/agend|reserv|vaga|hor[áa]rio|calend|grade|slot|aula/i, 'calendar'],
  [/relat[óo]rio|painel|m[ée]trica|dashboard|ocupa[çc]|indicador|desempenho|an[áa]lise|faturamento/i, 'chart'],
  [/turma|aluno|cliente|equipe|profission|instrutor|membro|comunidade|time/i, 'users'],
  [/seguran|privacid|lgpd|prote[çc]|acesso|senha|permiss/i, 'shield'],
  [/estoque|pedido|entrega|log[íi]stica|produto|loja|carrinho|frete/i, 'box'],
  [/torneio|ranking|premi|campe|pontua/i, 'trophy'],
  [/foto|galeria|imagem|portf[óo]lio|v[íi]deo/i, 'camera'],
  [/localiza|mapa|endere[çc]o|unidade|regi[ãa]o/i, 'pin'],
  [/fidelidade|cashback|desconto|cupom|promo/i, 'tag'],
  [/recorr|renova|assinante|repeti/i, 'repeat'],
  [/curso|aula gravada|conte[úu]do|material|ebook|trilha/i, 'book'],
  [/hist[óo]rico|lista|cadastro|registro|ficha|prontu/i, 'list'],
  [/tempo|prazo|rapidez|r[áa]pid|minutos|24h/i, 'clock'],
];
const FALLBACK = ['spark', 'target', 'leaf', 'heart', 'repeat', 'list'];

export function pickIcon(text: string, index = 0): string {
  for (const [re, name] of RULES) if (re.test(text)) return name;
  return FALLBACK[index % FALLBACK.length];
}

export function Icon({ name, className = '', size = 28, stroke = 1.6 }: { name: string; className?: string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICONS[name] || ICONS.spark}
    </svg>
  );
}
