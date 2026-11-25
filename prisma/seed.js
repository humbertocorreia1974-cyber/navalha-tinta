const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const senha = bcrypt.hashSync('Demo@1234', 10);

async function main() {
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@demo.app' },
      update: {},
      create: { email: 'admin@demo.app', name: 'Administrador Demo', passwordHash: senha, role: 'admin', phone: '(11) 99999-0001', plan: 'pro', termsAcceptedAt: new Date() },
    });
    await prisma.user.upsert({ where: { email: 'barber@demo.app' }, update: {}, create: { email: 'barber@demo.app', name: 'Barbeiro Demo', passwordHash: senha, role: 'barber', phone: '(11) 99999-0002', plan: 'pro', termsAcceptedAt: new Date() } });
    await prisma.user.upsert({ where: { email: 'jogador@demo.app' }, update: {}, create: { email: 'jogador@demo.app', name: 'Cliente Demo', passwordHash: senha, role: 'user', phone: '(11) 99999-0003', plan: 'free', termsAcceptedAt: new Date() } });
    await prisma.user.upsert({ where: { email: 'cliente2@demo.app' }, update: {}, create: { email: 'cliente2@demo.app', name: 'João Silva', passwordHash: senha, role: 'user', phone: '(11) 98888-1234', plan: 'free' } });
    await prisma.user.upsert({ where: { email: 'cliente3@demo.app' }, update: {}, create: { email: 'cliente3@demo.app', name: 'Pedro Santos', passwordHash: senha, role: 'user', phone: '(11) 97777-5678', plan: 'free' } });
  } catch (e) { console.warn('[seed] pulou User:', e.message); }

  try {
    const barbeiroUser = await prisma.user.findUnique({ where: { email: 'barber@demo.app' } });
    await prisma.barber.upsert({
      where: { userId: barbeiroUser.id },
      update: {},
      create: { userId: barbeiroUser.id, nomeCompleto: 'Carlos Eduardo Barbeiro', apelido: 'Carlão', emailContato: 'barber@demo.app', telefoneCelular: '(11) 99999-0002', especialidades: 'Fade, Barba, Clássico', bio: 'Barbeiro há 10 anos, especialista em cortes modernos.', ativo: true },
    });
    await prisma.barber.upsert({
      where: { userId: null },
      update: {},
      create: { nomeCompleto: 'Rafael Mendes', apelido: 'Rafa', emailContato: 'rafa@navalha.com', telefoneCelular: '(11) 96666-1111', especialidades: 'Degradê, Navalhado', bio: 'Especialista em degradê e acabamento.', ativo: true },
    });
  } catch (e) { console.warn('[seed] pulou Barber:', e.message); }

  try {
    const n = await prisma.service.count();
    if (n === 0) await prisma.service.createMany({ data: [
      { nomeServico: 'Corte Clássico', descricao: 'Corte tradicional na tesoura', duracaoMinutos: 30, precoBase: 50.00, categoriaServico: 'corte', disponivel: true },
      { nomeServico: 'Corte Fade', descricao: 'Degradê moderno', duracaoMinutos: 45, precoBase: 65.00, categoriaServico: 'corte', disponivel: true },
      { nomeServico: 'Barba Completa', descricao: 'Modelagem e hidratação', duracaoMinutos: 30, precoBase: 40.00, categoriaServico: 'barba', disponivel: true },
      { nomeServico: 'Combo Corte + Barba', descricao: 'Corte e barba', duracaoMinutos: 60, precoBase: 90.00, categoriaServico: 'combo', disponivel: true },
      { nomeServico: 'Tratamento Capilar', descricao: 'Hidratação profunda', duracaoMinutos: 40, precoBase: 70.00, categoriaServico: 'tratamento', disponivel: true },
    ]});
  } catch (e) { console.warn('[seed] pulou Service:', e.message); }

  try {
    const n = await prisma.subscriptionPlan.count();
    if (n === 0) await prisma.subscriptionPlan.createMany({ data: [
      { nomePlano: 'Básico', descricao: '2 cortes por mês', precoMensal: 89.90, quantidadeServicosMes: 2, descontoProdutos: 5.00, destaque: false, ativo: true },
      { nomePlano: 'Premium', descricao: '4 cortes + barba', precoMensal: 159.90, quantidadeServicosMes: 4, descontoProdutos: 10.00, destaque: true, ativo: true },
      { nomePlano: 'VIP', descricao: 'Cortes ilimitados', precoMensal: 249.90, quantidadeServicosMes: 10, descontoProdutos: 15.00, destaque: false, ativo: true },
    ]});
  } catch (e) { console.warn('[seed] pulou SubscriptionPlan:', e.message); }

  try {
    const n = await prisma.category.count();
    if (n === 0) await prisma.category.createMany({ data: [
      { nomeCategoria: 'Pomadas', descricao: 'Pomadas e ceras', slug: 'pomadas', ordemExibicao: 1, ativa: true },
      { nomeCategoria: 'Shampoos', descricao: 'Shampoos e condicionadores', slug: 'shampoos', ordemExibicao: 2, ativa: true },
      { nomeCategoria: 'Óleos', descricao: 'Óleos para barba', slug: 'oleos', ordemExibicao: 3, ativa: true },
    ]});
  } catch (e) { console.warn('[seed] pulou Category:', e.message); }

  try {
    const cats = await prisma.category.findMany();
    const n = await prisma.product.count();
    if (n === 0 && cats.length > 0) await prisma.product.createMany({ data: [
      { nomeProduto: 'Pomada Modeladora', descricao: 'Fixação forte', precoVenda: 45.90, estoqueDisponivel: 30, marca: 'Barba Forte', categoryId: cats[0].id, ativo: true },
      { nomeProduto: 'Cera Matte', descricao: 'Efeito matte', precoVenda: 39.90, estoqueDisponivel: 25, marca: 'Navalha', categoryId: cats[0].id, ativo: true },
      { nomeProduto: 'Shampoo Anticaspa', descricao: 'Limpeza profunda', precoVenda: 32.90, estoqueDisponivel: 40, marca: 'Tinta', categoryId: cats[1].id, ativo: true },
      { nomeProduto: 'Óleo para Barba', descricao: 'Hidratação', precoVenda: 55.90, estoqueDisponivel: 20, marca: 'Barba Forte', categoryId: cats[2].id, ativo: true },
    ]});
  } catch (e) { console.warn('[seed] pulou Product:', e.message); }

  try {
    const n = await prisma.coupon.count();
    if (n === 0) await prisma.coupon.createMany({ data: [
      { codigoCupom: 'BEMVINDO10', tipoDesconto: 'percentual', valorDesconto: 10.00, dataValidade: new Date('2026-12-31'), quantidadeUsos: 0, ativo: true },
      { codigoCupom: 'NAVALHA20', tipoDesconto: 'fixo', valorDesconto: 20.00, dataValidade: new Date('2026-12-31'), quantidadeUsos: 5, ativo: true },
    ]});
  } catch (e) { console.warn('[seed] pulou Coupon:', e.message); }

  try {
    const barbers = await prisma.barber.findMany();
    const services = await prisma.service.findMany();
    const clients = await prisma.user.findMany({ where: { role: 'user' } });
    const n = await prisma.appointment.count();
    if (n === 0 && barbers.length && services.length && clients.length) {
      const hoje = new Date();
      const dados = [];
      for (let i = 0; i < 8; i++) {
        const d = new Date(hoje); d.setDate(d.getDate() + i);
        const b = barbers[i % barbers.length];
        const s = services[i % services.length];
        const c = clients[i % clients.length];
        dados.push({ dataAgendamento: d, horaInicio: `${9 + (i % 8)}:00`, horaFim: `${10 + (i % 8)}:00`, statusAgendamento: i < 3 ? 'concluido' : 'confirmado', nomeCliente: c.name || 'Cliente', telefoneCliente: c.phone || '(11) 90000-0000', valorTotal: s.precoBase, clientId: c.id, barberId: b.id, serviceId: s.id });
      }
      await prisma.appointment.createMany({ data: dados });
    }
  } catch (e) { console.warn('[seed] pulou Appointment:', e.message); }

  try {
    const barbers = await prisma.barber.findMany();
    const n = await prisma.blockedSlot.count();
    if (n === 0 && barbers.length) {
      const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
      await prisma.blockedSlot.createMany({ data: [
        { barberId: barbers[0].id, data: amanha, horaInicio: '12:00', horaFim: '13:00', motivo: 'Almoço' },
        { barberId: barbers[0].id, data: amanha, horaInicio: '18:00', horaFim: '19:00', motivo: 'Compromisso' },
      ]});
    }
  } catch (e) { console.warn('[seed] pulou BlockedSlot:', e.message); }

  try {
    const plans = await prisma.subscriptionPlan.findMany();
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const n = await prisma.subscription.count();
    if (n === 0 && plans.length && users.length) {
      const hoje = new Date();
      const renov = new Date(hoje); renov.setMonth(renov.getMonth() + 1);
      await prisma.subscription.createMany({ data: users.map((u, i) => ({
        nomeAssinante: u.name || 'Cliente', emailAssinante: u.email, telefoneAssinante: u.phone || '(11) 90000-0000',
        dataInicio: hoje, dataRenovacao: renov, statusAssinatura: 'ativa', valorMensal: plans[i % plans.length].precoMensal,
        servicosUsadosMes: i % 3, userId: u.id, planId: plans[i % plans.length].id,
      }))});
    }
  } catch (e) { console.warn('[seed] pulou Subscription:', e.message); }

  try {
    const products = await prisma.product.findMany();
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const n = await prisma.order.count();
    if (n === 0 && products.length && users.length) {
      for (let i = 0; i < 3; i++) {
        const u = users[i % users.length];
        const p = products[i % products.length];
        const qtd = 1 + (i % 2);
        const total = Number(p.precoVenda) * qtd;
        const order = await prisma.order.create({ data: {
          numeroPedido: `PED-${1000 + i}`, nomeCliente: u.name || 'Cliente', emailCliente: u.email, telefoneCliente: u.phone || '(11) 90000-0000',
          statusPedido: i === 0 ? 'pago' : 'pendente', valorTotal: total, userId: u.id,
          enderecoEntrega: 'Rua das Flores, 123 - São Paulo/SP',
          items: { create: [{ nomeProdutoSnapshot: p.nomeProduto, quantidade: qtd, precoUnitario: p.precoVenda, subtotal: total, productId: p.id }] },
        }});
        await prisma.payment.create({ data: { valorPago: total, metodoPagamento: 'pix', statusPagamento: i === 0 ? 'pago' : 'pendente', dataPagamento: i === 0 ? new Date() : null, orderId: order.id } });
      }
    }
  } catch (e) { console.warn('[seed] pulou Order:', e.message); }

  try {
    const barbers = await prisma.barber.findMany();
    const n = await prisma.galleryItem.count();
    if (n === 0 && barbers.length) await prisma.galleryItem.createMany({ data: [
      { titulo: 'Fade Navalhado', descricao: 'Degradê com acabamento navalhado', imagemTrabalho: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1', estiloCorte: 'fade', destaque: true, ordemExibicao: 1, barberId: barbers[0].id },
      { titulo: 'Clássico Executivo', descricao: 'Corte social clássico', imagemTrabalho: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a', estiloCorte: 'classico', destaque: false, ordemExibicao: 2, barberId: barbers[0].id },
      { titulo: 'Barba Modelada', descricao: 'Barba desenhada', imagemTrabalho: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c', estiloCorte: 'barba', destaque: true, ordemExibicao: 3, barberId: barbers[0].id },
    ]});
  } catch (e) { console.warn('[seed] pulou GalleryItem:', e.message); }

  try {
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const n = await prisma.notification.count();
    if (n === 0 && users.length) await prisma.notification.createMany({ data: users.map((u, i) => ({
      titulo: i === 0 ? 'Agendamento confirmado' : 'Lembrete de agendamento',
      mensagem: i === 0 ? 'Seu horário foi confirmado!' : 'Não esqueça seu horário amanhã.',
      tipoNotificacao: i === 0 ? 'confirmacao' : 'lembrete', canalEnvio: 'app', dataEnvio: new Date(), lida: false, destinatarioEmail: u.email, userId: u.id,
    }))});
  } catch (e) { console.warn('[seed] pulou Notification:', e.message); }

  try {
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const n = await prisma.address.count();
    if (n === 0 && users.length) await prisma.address.createMany({ data: users.map((u, i) => ({
      userId: u.id, cep: '01310-100', logradouro: 'Avenida Paulista', numero: `${1000 + i}`, complemento: 'Apto 12', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', principal: true,
    }))});
  } catch (e) { console.warn('[seed] pulou Address:', e.message); }

  try {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@demo.app' } });
    const n = await prisma.auditLog.count();
    if (n === 0 && admin) await prisma.auditLog.createMany({ data: [
      { acaoRealizada: 'LOGIN', entidadeAfetada: 'User', usuarioResponsavel: 'admin@demo.app', detalhesEvento: 'Login realizado', enderecoIp: '192.168.1.1', nivelCriticidade: 'info', userId: admin.id },
      { acaoRealizada: 'CREATE_APPOINTMENT', entidadeAfetada: 'Appointment', usuarioResponsavel: 'admin@demo.app', detalhesEvento: 'Novo agendamento criado', enderecoIp: '192.168.1.1', nivelCriticidade: 'info', userId: admin.id },
    ]});
  } catch (e) { console.warn('[seed] pulou AuditLog:', e.message); }

  try {
    const n = await prisma.lead.count();
    if (n === 0) await prisma.lead.createMany({ data: [
      { name: 'Maria Souza', email: 'maria@exemplo.com', message: 'Gostaria de saber sobre planos.' },
      { name: 'Lucas Pereira', email: 'lucas@exemplo.com', message: 'Vocês atendem aos domingos?' },
    ]});
  } catch (e) { console.warn('[seed] pulou Lead:', e.message); }

  console.log('[seed] concluído com sucesso');
}

main().then(()=>prisma.$disconnect()).catch(async(e)=>{console.error('[seed] ERRO:',e.message);await prisma.$disconnect();process.exitCode = 0;});