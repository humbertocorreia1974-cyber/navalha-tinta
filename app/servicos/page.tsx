import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Serviços | Navalha & Tinta",
  description: "Corte, barba, combo e tratamentos com preço e duração transparentes. Escolha o serviço e agende com o barbeiro que você confia.",
  openGraph: { title: "Serviços | Navalha & Tinta", description: "Corte, barba, combo e tratamentos com preço e duração transparentes." },
};

const CATEGORIAS: Record<string, string> = {
  corte: "Corte",
  barba: "Barba",
  combo: "Combo",
  tratamento: "Tratamento",
  outro: "Outros",
};

export default async function Page() {
  const services = await prisma.service.findMany({
    where: { disponivel: true },
    orderBy: [{ categoriaServico: "asc" }, { nomeServico: "asc" }],
  });

  const grupos = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.categoriaServico] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Reveal variant="up">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brand">Serviços</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl text-fg">O corte certo, sem surpresa no preço.</h1>
          <p className="mt-4 text-fg-muted">
            Cada serviço mostra duração e valor antes de você agendar. Escolha o barbeiro na próxima etapa.
          </p>
        </div>
      </Reveal>

      {services.length === 0 ? (
        <Card>
          <CardBody className="text-center space-y-3">
            <CardTitle>Nenhum serviço publicado ainda</CardTitle>
            <p className="text-fg-muted">A gestão está montando o catálogo. Volte em breve ou fale com a gente.</p>
            <Link href="/contato"><Button variant="primary">Falar com a barbearia</Button></Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-12">
          {Object.entries(grupos).map(([cat, lista], gi) => (
            <section key={cat}>
              <Reveal variant="left" delay={gi * 60}>
                <h2 className="font-display text-2xl text-fg mb-4">{CATEGORIAS[cat] ?? cat}</h2>
              </Reveal>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lista.map((s, i) => (
                  <Reveal key={s.id} variant="up" delay={i * 60}>
                    <Card className="hover-lift h-full">
                      <CardBody className="flex h-full flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-lg">{s.nomeServico}</CardTitle>
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand whitespace-nowrap">
                            {s.duracaoMinutos} min
                          </span>
                        </div>
                        {s.descricao && <p className="text-sm text-fg-muted flex-1">{s.descricao}</p>}
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-display text-xl text-brand">{brl(s.precoBase)}</span>
                          <Link href={`/agendar?serviceId=${s.id}`}>
                            <Button size="sm" variant="primary">Agendar</Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
