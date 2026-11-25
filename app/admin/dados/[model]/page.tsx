// jgnext:admin-data — página de uma tabela (servidor): confere o dono ANTES de entregar qualquer dado ou metadado.
import { ownerOrRedirect } from '@/lib/admin-gate';
import { MODELS } from '@/lib/admin-schema';
import ModelClient from './model-client';

export const dynamic = 'force-dynamic';

export default async function ModelPage({ params }: { params: { model: string } }) {
  if (!(await ownerOrRedirect())) {
    return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="font-display text-3xl font-bold tracking-tight">Acesso restrito</h1><p className="mt-3 text-fg-muted">Esta área é só para o dono do site.</p></main>;
  }
  const meta = MODELS[params.model] && !MODELS[params.model].optionsOnly ? MODELS[params.model] : null;
  return <ModelClient meta={meta} />;
}