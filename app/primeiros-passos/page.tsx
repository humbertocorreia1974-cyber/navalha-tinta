import Link from 'next/link';

export const metadata = { title: "Primeiros passos | Navalha & Tinta", description: "Como usar o Navalha & Tinta passo a passo." };

export default function GuiaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-brand">Primeiros passos</p>
      <h1 className="mt-1 font-display text-3xl text-fg sm:text-4xl">Como usar o Navalha &amp; Tinta</h1>
      <p className="mt-3 text-fg-muted">Este guia mostra, na ordem, o que fazer. Você não precisa entender de tecnologia.</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-fg">Para você, dono do negócio</h2>
        <ol className="mt-3 space-y-3">
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">1</span>
            <div>
              <p className="font-medium text-fg">Entre como dono</p>
              <p className="mt-1 text-sm text-fg-muted">Entre com o e-mail da sua conta JGNEXT e a senha temporária que apareceu quando você publicou o site. Troque a senha no primeiro acesso. (Se você não anotou a senha, peça uma nova pelo “Esqueci minha senha”.)</p>
              <Link href="/login" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">2</span>
            <div>
              <p className="font-medium text-fg">Veja a agenda do dia</p>
              <p className="mt-1 text-sm text-fg-muted">Aqui aparecem os horários marcados pelos seus clientes, com quem e a que horas.</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">3</span>
            <div>
              <p className="font-medium text-fg">Cadastre seus serviços e preços</p>
              <p className="mt-1 text-sm text-fg-muted">Troque os serviços de exemplo pelos seus (nome, duração e valor).</p>
              <Link href="/servicos" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">4</span>
            <div>
              <p className="font-medium text-fg">Cadastre sua equipe</p>
              <p className="mt-1 text-sm text-fg-muted">Inclua cada profissional e os horários em que atende.</p>
              <Link href="/barbeiros" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">5</span>
            <div>
              <p className="font-medium text-fg">Cadastre seus produtos</p>
              <p className="mt-1 text-sm text-fg-muted">Troque os produtos de exemplo pelos seus (foto, descrição e preço).</p>
              <Link href="/catalogo" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">6</span>
            <div>
              <p className="font-medium text-fg">Acompanhe os pedidos</p>
              <p className="mt-1 text-sm text-fg-muted">Cada pedido novo aparece para você confirmar e atualizar o andamento.</p>
              <Link href="/meus-pedidos" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-fg">Para o seu cliente</h2>
        <ol className="mt-3 space-y-3">
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">1</span>
            <div>
              <p className="font-medium text-fg">Crie uma conta</p>
              <p className="mt-1 text-sm text-fg-muted">Leva menos de um minuto: nome, e-mail e senha.</p>
              <Link href="/cadastro" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">2</span>
            <div>
              <p className="font-medium text-fg">Escolha o serviço, o profissional e o horário</p>
              <p className="mt-1 text-sm text-fg-muted">Os horários livres aparecem para escolher. Dois clientes nunca pegam o mesmo horário.</p>
              <Link href="/agendar" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">3</span>
            <div>
              <p className="font-medium text-fg">Acompanhe, remarque ou cancele</p>
              <p className="mt-1 text-sm text-fg-muted">Em &quot;Meus agendamentos&quot; o cliente vê o histórico e pode mudar o horário.</p>
              <Link href="/meus-agendamentos" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">4</span>
            <div>
              <p className="font-medium text-fg">Escolha os produtos e finalize o pedido</p>
              <p className="mt-1 text-sm text-fg-muted">O cliente monta o carrinho e conclui a compra.</p>
              <Link href="/catalogo" className="mt-2 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">Abrir esta tela →</Link>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold text-fg">Quer mudar alguma coisa?</h2>
        <p className="mt-1 text-sm text-fg-muted">Volte ao chat do JGNEXT e escreva o que quer, por exemplo: &quot;troque o preço do meu produto principal&quot; ou &quot;coloque meu telefone no rodapé&quot;. Quando estiver satisfeito, peça: &quot;publique meu app&quot;.</p>
      </section>
    </main>
  );
}
