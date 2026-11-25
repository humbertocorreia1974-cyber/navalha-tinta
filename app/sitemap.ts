import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://exemplo.com';
  const routes = ["/","/sem-permissao","/servicos","/barbeiros","/planos","/galeria","/catalogo","/carrinho","/checkout","/agendar","/agendamento/confirmacao","/cadastro","/esqueci-minha-senha","/redefinir-senha","/meus-agendamentos","/meus-pedidos","/gestor","/primeiros-passos","/termos","/privacidade","/minha-conta","/minha-assinatura","/contato","/gestor/produtos","/gestor/barbeiros"];
  return routes.map((r) => ({ url: base + (r === '/' ? '' : r), lastModified: new Date(), changeFrequency: 'weekly' as const, priority: r === '/' ? 1 : 0.6 }));
}
