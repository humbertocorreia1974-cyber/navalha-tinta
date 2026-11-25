import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import ASSETS from "@/lib/assets";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Barbeiros | Navalha & Tinta",
  description: "Conheça os barbeiros da Navalha & Tinta e agende com o profissional que já conhece o seu corte.",
  openGraph: { title: "Barbeiros | Navalha & Tinta", description: "Agende com o barbeiro que já conhece o seu corte." },
};

export default async function Page() {
  const barbers = await prisma.barber.findMany({
    where: { ativo: true },
    orderBy: { nomeCompleto: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Reveal variant="up">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brand">Equipe</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl text-fg">Quem segura a navalha.</h1>
          <p className="mt-4 text-fg-muted">
            Cada barbeiro tem agenda própria. Escolha o profissional e veja os horários livres em tempo real.
          </p>
        </div>
      </Reveal>

      {barbers.length === 0 ? (
        <Card>
          <CardBody className="text-center space-y-3">
            <CardTitle>Equipe em atualização</CardTitle>
            <p className="text-fg-muted">Ainda não há barbeiros publicados. Fale com a barbearia para agendar.</p>
            <Link href="/contato"><Button variant="primary">Falar com a barbearia</Button></Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {barbers.map((b, i) => (
            <Reveal key={b.id} variant="up" delay={i * 80}>
              <Card className="hover-lift h-full overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.fotoPerfil || ASSETS.photos[i % ASSETS.photos.length]}
                    alt={`Foto de ${b.nomeCompleto}`}
                    className="img-zoom h-full w-full object-cover"
                  />
                </div>
                <CardBody className="space-y-2">
                  <CardTitle>{b.apelido || b.nomeCompleto}</CardTitle>
                  {b.especialidades && <p className="text-xs uppercase tracking-wider text-brand">{b.especialidades}</p>}
                  {b.bio && <p className="text-sm text-fg-muted line-clamp-3">{b.bio}</p>}
                  <div className="pt-2">
                    <Link href={`/agendar?barberId=${b.id}`}>
                      <Button size="sm" variant="primary">Ver agenda</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
