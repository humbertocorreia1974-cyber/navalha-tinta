import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Sem permissão | Navalha & Tinta",
  description: "Você não tem permissão para acessar esta área.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <Card>
        <CardBody className="space-y-4 text-center">
          <CardTitle>Acesso restrito</CardTitle>
          <p className="text-fg-muted">
            Sua conta não tem permissão para acessar esta área. Se você acredita que isso é um erro, fale com a gestão da barbearia.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/"><Button variant="primary">Voltar para a home</Button></Link>
            <Link href="/minha-conta"><Button variant="ghost">Minha conta</Button></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
