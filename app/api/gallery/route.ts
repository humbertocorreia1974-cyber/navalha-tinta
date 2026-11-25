import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const estilo = searchParams.get('estilo') || undefined;
  const barbeiro = searchParams.get('barbeiro') || undefined;

  const items = await prisma.galleryItem.findMany({
    where: {
      ...(estilo ? { estiloCorte: estilo } : {}),
      ...(barbeiro ? { barberId: barbeiro } : {}),
    },
    orderBy: [{ destaque: 'desc' }, { ordemExibicao: 'asc' }, { dataPublicacao: 'desc' }],
    include: { barber: { select: { id: true, nomeCompleto: true, apelido: true } } },
    take: 60,
  });

  return NextResponse.json({ items });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/gallery/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== 'barber' && role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão para publicar trabalhos.' }, { status: 403 });
  }

  let body: {
    titulo?: string;
    descricao?: string | null;
    estiloCorte?: string | null;
    barberId?: string | null;
    imagemTrabalho?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
  }

  const titulo = (body.titulo || '').trim();
  const imagemTrabalho = (body.imagemTrabalho || '').trim();
  if (!titulo || titulo.length > 80) {
    return NextResponse.json({ error: 'Informe um título de até 80 caracteres.' }, { status: 400 });
  }
  if (!imagemTrabalho) {
    return NextResponse.json({ error: 'Envie a imagem do trabalho.' }, { status: 400 });
  }

  const estilosValidos = ['fade', 'classico', 'barba', 'combo', 'outro'];
  const estiloCorte =
    body.estiloCorte && estilosValidos.includes(body.estiloCorte) ? body.estiloCorte : null;

  let barberId: string | null = null;
  if (body.barberId) {
    const barber = await prisma.barber.findUnique({
      where: { id: body.barberId },
      select: { id: true, userId: true },
    });
    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado.' }, { status: 400 });
    }
    if (role === 'barber' && barber.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você só pode publicar trabalhos em seu próprio nome.' },
        { status: 403 },
      );
    }
    barberId = barber.id;
  } else if (role === 'barber') {
    const proprio = await prisma.barber.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!proprio) {
      return NextResponse.json(
        { error: 'Perfil de barbeiro não encontrado para este usuário.' },
        { status: 400 },
      );
    }
    barberId = proprio.id;
  }

  const item = await prisma.galleryItem.create({
    data: {
      titulo,
      descricao: body.descricao?.trim() || null,
      estiloCorte,
      imagemTrabalho,
      barberId,
      userId: session.user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: 'gallery.create',
      entidadeAfetada: 'GalleryItem',
      usuarioResponsavel: session.user.email || session.user.id,
      detalhesEvento: `Publicou trabalho "${titulo}"`,
      nivelCriticidade: 'info',
      userId: session.user.id,
    },
  });

  return NextResponse.json({ item }, { status: 201 });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/gallery/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}

export async function DELETE(request: Request) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Informe o id do item.' }, { status: 400 });
  }

  const item = await prisma.galleryItem.findUnique({
    where: { id },
    select: { id: true, userId: true, barberId: true, titulo: true },
  });
  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
  }

  const role = session.user.role;
  let podeApagar = role === 'admin' || item.userId === session.user.id;
  if (!podeApagar && role === 'barber' && item.barberId) {
    const proprio = await prisma.barber.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    podeApagar = proprio?.id === item.barberId;
  }
  if (!podeApagar) {
    return NextResponse.json({ error: 'Sem permissão para remover este item.' }, { status: 403 });
  }

  await prisma.galleryItem.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      acaoRealizada: 'gallery.delete',
      entidadeAfetada: 'GalleryItem',
      usuarioResponsavel: session.user.email || session.user.id,
      detalhesEvento: `Removeu trabalho "${item.titulo}"`,
      nivelCriticidade: 'warning',
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });

  } catch (__jgnextApiErrorReportErr: any) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/gallery/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
