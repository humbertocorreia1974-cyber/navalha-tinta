export type LandingContent = {
  name: string;
  slogan: string;
  hero: {
    badge: string;
    headline: string;
    sub: string;
    cta: string;
    image?: string;
    imageAlt?: string;
  };
  features: Array<{
    icon: string;
    title: string;
    body: string;
    image?: string;
    imageAlt?: string;
  }>;
  steps: Array<{ title: string; body: string }>;
  pricing: Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    cta: string;
    highlight?: boolean;
  }>;
  testimonials: Array<{ quote: string; name: string; role: string }>;
  faq: Array<{ q: string; a: string }>;
  footer?: {
    links: Array<{ label: string; href: string }>;
    whatsapp?: string;
    whatsappHref?: string;
    email?: string;
    areas?: string[];
  };
};

export const landing: LandingContent = {
  name: "Navalha & Tinta",
  logoSrc: "/logo.svg",
  slogan: "Tradição no corte, ousadia no estilo.",
  hero: {
    badge: "Barbearia premium desde 2018",
    headline: "Seu corte, seu barbeiro, seu horário.",
    sub: "Agende com o barbeiro que você confia, assine o plano que combina com sua rotina e chegue na Navalha & Tinta sem espera. Identidade clássica, atendimento de barbearia premium.",
    cta: "Agendar meu horário",
    image: "/photos/photo-1.jpg",
    imageAlt: "Interior da barbearia Navalha & Tinta com cadeira clássica e espelho",
  },
  features: [
    {
      icon: "Scissors",
      title: "Barbeiro fixo",
      body: "Escolha o profissional que já conhece o seu corte e agende sempre com ele, sem revezamento.",
      image: "/photos/photo-1.jpg",
      imageAlt: "Barbeiro finalizando um fade com navalha",
    },
    {
      icon: "CalendarCheck",
      title: "Agenda sem espera",
      body: "Horários reais por barbeiro, com bloqueio automático de conflito e confirmação em segundos.",
      image: "/photos/photo-2.jpg",
      imageAlt: "Cliente conferindo horário confirmado no celular",
    },
    {
      icon: "Crown",
      title: "Assinatura mensal",
      body: "Cortes do mês com barba inclusa, desconto em produtos e pausa quando você viajar.",
      image: "/photos/photo-3.jpg",
      imageAlt: "Kit de produtos premium da barbearia",
    },
    {
      icon: "Sparkles",
      title: "Acabamento premium",
      body: "Toalha quente, óleo, navalha e finalização com produtos importados em todo atendimento.",
      image: "/photos/photo-4.jpg",
      imageAlt: "Detalhe de acabamento com toalha quente e navalha",
    },
  ],
  steps: [
    { title: "Escolha o serviço", body: "Corte, barba, combo ou tratamento. Cada serviço mostra duração e preço antes de você decidir." },
    { title: "Selecione o barbeiro", body: "Veja a agenda real de cada profissional e escolha quem combina com o seu estilo." },
    { title: "Confirme o horário", body: "Receba a confirmação no app e um lembrete por WhatsApp 24h antes do atendimento." },
  ],
  pricing: [
    {
      name: "Avulso",
      price: "R$ 0",
      period: "/mês",
      features: [
        "Agendamento online por barbeiro",
        "Histórico completo de atendimentos",
        "Lembrete por WhatsApp 24h antes",
        "Pagamento no local (Pix, cartão ou dinheiro)",
      ],
      cta: "Agendar avulso",
    },
    {
      name: "Clube Navalha",
      price: "R$ 149",
      period: "/mês",
      features: [
        "4 cortes por mês com o barbeiro fixo",
        "1 barba completa inclusa",
        "10% de desconto em produtos da loja",
        "Pausa gratuita quando precisar",
        "Prioridade na agenda da semana",
      ],
      cta: "Assinar Clube Navalha",
      highlight: true,
    },
    {
      name: "Clube Tinta",
      price: "R$ 229",
      period: "/mês",
      features: [
        "Cortes ilimitados no mês",
        "Barba ilimitada com navalha",
        "15% de desconto em produtos",
        "Tratamento capilar trimestral",
        "Atendimento prioritário e pausa livre",
      ],
      cta: "Assinar Clube Tinta",
    },
  ],
  testimonials: [
    {
      quote: "Chego, sento e saio no horário. Nunca mais esperei em barbearia depois que comecei a agendar por aqui.",
      name: "Rafael M.",
      role: "Cliente desde 2022",
    },
    {
      quote: "O barbeiro já sabe exatamente o que eu gosto. O plano mensal resolveu minha vida e ainda economizo.",
      name: "Diego S.",
      role: "Assinante Clube Navalha",
    },
    {
      quote: "Ambiente clássico, atendimento impecável e o lembrete no WhatsApp me salva toda semana.",
      name: "Bruno A.",
      role: "Cliente desde 2021",
    },
  ],
  faq: [
    {
      q: "Preciso assinar um plano para agendar?",
      a: "Não. Você pode agendar avulso quando quiser. O plano mensal é para quem corta com frequência e quer economizar com prioridade na agenda.",
    },
    {
      q: "Posso escolher o barbeiro?",
      a: "Sim. Cada profissional tem agenda própria e você escolhe exatamente com quem quer cortar, sempre que agendar.",
    },
    {
      q: "Como funciona a cobrança do plano?",
      a: "A cobrança é recorrente no cartão de crédito, todo mês na data da assinatura. Você pode pausar ou cancelar a qualquer momento pelo painel.",
    },
    {
      q: "Posso remarcar ou cancelar um agendamento?",
      a: "Sim. Cancelamentos e remarcações são liberados até 12 horas antes do horário marcado, direto em Meus agendamentos.",
    },
    {
      q: "Vocês vendem produtos para levar?",
      a: "Sim. Pomadas, óleos, shampoos e navalhas estão no catálogo da loja, com desconto para assinantes.",
    },
  ],
  footer: {
    links: [
      { label: "Serviços", href: "/servicos" },
      { label: "Barbeiros", href: "/barbeiros" },
      { label: "Planos", href: "/planos" },
      { label: "Galeria", href: "/galeria" },
      { label: "Loja", href: "/loja" },
      { label: "Contato", href: "/contato" },
      { label: "Termos de uso", href: "/termos" },
      { label: "Política de privacidade", href: "/privacidade" },
    ],
    whatsapp: "+55 11 98888-1234",
    whatsappHref: "https://wa.me/5511988881234",
    email: "contato@navalhaetinta.com.br",
    areas: ["São Paulo", "Zona Sul", "Zona Oeste", "ABC Paulista"],
  },
};
