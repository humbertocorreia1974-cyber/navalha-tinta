// Gerado pelo JGNEXT — geração de PDF (via gateway JGNEXT). Use em route handlers (server).
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** Moldura de documento A4 com estilo de impressão. `bodyHtml` NÃO pode ter script, form, link externo ou imagem http(s): logo/assinatura só como data: URI. */
export function pdfDocument(title: string, bodyHtml: string, accent = '#111827'): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; } body { font-family: Helvetica, Arial, sans-serif; color: #111827; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 4px; color: ${accent}; } h2 { font-size: 14px; margin: 18px 0 6px; color: ${accent}; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; } th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; } th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
  .muted { color: #6b7280; } .right { text-align: right; } .total { font-size: 15px; font-weight: 700; } footer { margin-top: 28px; font-size: 10px; color: #9ca3af; }
  </style></head><body>${bodyHtml}</body></html>`;
}

/** Gera o PDF e devolve uma Response pronta para retornar do route handler. Escape todo dado do usuário com esc(). */
export async function renderPdf(html: string, filename = 'documento.pdf'): Promise<Response> {
  const url = process.env.PDF_GATEWAY_URL, key = process.env.PDF_GATEWAY_KEY, ws = process.env.PDF_WORKSPACE_ID;
  if (!url || !key || !ws) return Response.json({ error: 'Geração de PDF indisponível neste ambiente (disponível após a publicação).' }, { status: 503 });
  try {
    const r = await fetch(`${url}/${ws}/render`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key }, body: JSON.stringify({ html }), signal: AbortSignal.timeout(30000) });
    if (!r.ok) return Response.json({ error: 'Não foi possível gerar o PDF agora. Tente novamente.' }, { status: 502 });
    const safe = filename.replace(/[^A-Za-z0-9._-]/g, '_');
    return new Response(await r.arrayBuffer(), { headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${safe}"`, 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Serviço de PDF indisponível no momento.' }, { status: 502 });
  }
}

export { esc };
