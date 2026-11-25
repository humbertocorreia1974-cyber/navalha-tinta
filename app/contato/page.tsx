import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { MapPin, Clock, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { ContactForm } from './contact-form';
import { MapEmbed } from './map-embed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contato e Localização | Navalha & Tinta',
  description:
    'Fale com a Navalha & Tinta, veja o endereço da barbearia, horários de funcionamento e canais diretos de atendimento por WhatsApp, telefone e e-mail.',
  openGraph: {
    title: 'Contato e Localização | Navalha & Tinta',
    description:
      'Endereço, horários e canais de atendimento da barbearia Navalha & Tinta.',
    type: 'website',
  },
};

const HORARIOS = [
  { dia: 'Segunda', horario: 'Fechado' },
  { dia: 'Terça a Sexta', horario: '09:00 às 20:00' },
  { dia: 'Sábado', horario: '08:00 às 18:00' },
  { dia: 'Domingo', horario: 'Fechado' },
];

const FAQ = [
  {
    q: 'Preciso agendar ou posso chegar direto?',
    a: 'Recomendamos agendar pelo site para escolher o barbeiro e o horário. Encaixes são possíveis, mas dependem da agenda do dia.',
  },
  {
    q: 'Como funciona a assinatura mensal?',
    a: 'Você escolhe um plano, paga no cartão com cobrança recorrente e usa os cortes do mês. Pode pausar ou cancelar quando quiser.',
  },
  {
    q: 'Vocês atendem com hora marcada para crianças?',
    a: 'Sim. Selecione o serviço infantil no agendamento e indique a idade nas observações para reservarmos o tempo certo.',
  },
];

export default function ContatoPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999';
  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    'Olá, gostaria de saber mais sobre a Navalha & Tinta.'
  )}`;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@navalhaetinta.com.br';
  const telefone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '(11) 99999-9999';
  const endereco = 'Rua das Navalhas, 245, Vila Madalena, São Paulo, SP';
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    endereco
  )}`;

  return (
    <main className="min-h-screen bg-bg text-fg">
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <Reveal variant="up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs uppercase tracking-widest text-brand">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Contato e localização
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">
              Tradição no corte, ousadia no estilo.
            </h1>
            <p className="mt-4 max-w-2xl text-fg-muted md:text-lg">
              Estamos na Vila Madalena, com atendimento por hora marcada. Fale com a gente
              por WhatsApp, telefone ou pelo formulário abaixo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/agendar">
                <Button variant="primary" size="lg">
                  Agendar horário
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg">
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
                  WhatsApp
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal variant="left" className="lg:col-span-3">
            <Card>
              <CardTitle>Envie uma mensagem</CardTitle>
              <CardBody>
                <p className="mb-6 text-sm text-fg-muted">
                  Respondemos em até 1 dia útil. Para agendamentos urgentes, use o WhatsApp.
                </p>
                <ContactForm />
              </CardBody>
            </Card>
          </Reveal>

          <Reveal variant="right" delay={120} className="lg:col-span-2">
            <div className="space-y-4">
              <Card>
                <CardTitle>Endereço</CardTitle>
                <CardBody>
                  <p className="text-sm text-fg-muted">{endereco}</p>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-brand hover:underline"
                  >
                    Abrir no Google Maps
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </CardBody>
              </Card>

              <Card>
                <CardTitle>Canais diretos</CardTitle>
                <CardBody>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <MessageCircle className="mt-0.5 h-4 w-4 text-brand" aria-hidden />
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        WhatsApp: {telefone}
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-brand" aria-hidden />
                      <a href={`tel:${telefone.replace(/\D/g, '')}`} className="hover:underline">
                        Telefone: {telefone}
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-brand" aria-hidden />
                      <a href={`mailto:${email}`} className="hover:underline">
                        {email}
                      </a>
                    </li>
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardTitle>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand" aria-hidden />
                    Horários
                  </span>
                </CardTitle>
                <CardBody>
                  <ul className="divide-y divide-border text-sm">
                    {HORARIOS.map((h) => (
                      <li key={h.dia} className="flex items-center justify-between py-2">
                        <span className="text-fg-muted">{h.dia}</span>
                        <span className="font-medium">{h.horario}</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Reveal variant="up">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Como chegar</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Estamos a 5 minutos do metrô Fradique Coutinho. Estacionamento conveniado na quadra.
            </p>
          </Reveal>
          <Reveal variant="scale" delay={120} className="mt-8">
            <MapEmbed />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <Reveal variant="up">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Perguntas frequentes</h2>
        </Reveal>
        <div className="mt-6 space-y-3">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} variant="up" delay={i * 80}>
              <details className="group rounded-lg border border-border bg-surface/60 p-4 open:bg-surface">
                <summary className="cursor-pointer list-none font-medium text-fg marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-brand transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-fg-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
