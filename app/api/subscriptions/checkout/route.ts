import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: { planId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  if (!body?.planId) {
    return NextResponse.json({ error: 'planId é obrigatório' }, { status: 400 });
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: body.planId } });
  if (!plan || !plan.ativo) {
    return NextResponse.json({ error: 'Plano indisponível' }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const origin =
    request.headers.get('origin') ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000';

  try {
    let customerId = user.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: Math.round(Number(plan.precoMensal) * 100),
            recurring: { interval: 'month' },
            product_data: {
              name: plan.nomePlano,
              description: plan.descricao ?? undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: plan.id,
        kind: 'subscription_plan',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
        },
      },
      success_url: `${origin}/minha-assinatura?status=sucesso`,
      cancel_url: `${origin}/planos?status=cancelado`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('[subscriptions/checkout] erro', err);
    return NextResponse.json(
      { error: 'Não foi possível iniciar o checkout. Tente novamente.' },
      { status: 500 },
    );
  }

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/subscriptions/checkout/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
