'use client';
// jgnext:polish — rotula campos sem nome e garante um h1 por tela (títulos só para leitores de tela quando a tela não tem h1 visível).
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const HUMAN: Record<string, string> = { email: 'E-mail', password: 'Senha', senha: 'Senha', tel: 'Telefone', phone: 'Telefone', search: 'Buscar', q: 'Buscar', name: 'Nome', nome: 'Nome', date: 'Data', time: 'Horário', number: 'Número', url: 'Endereço', file: 'Arquivo' };
const nice = (s: string) => HUMAN[s.toLowerCase()] || s.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

export function A11yPolish() {
  const pathname = usePathname();
  useEffect(() => {
    const run = () => {
      document.querySelectorAll<HTMLElement>('input:not([type=hidden]), select, textarea').forEach((el: any) => {
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label')) return;
        if (el.id && document.querySelector('label[for="' + el.id + '"]')) return;
        const text = el.getAttribute('placeholder') || el.getAttribute('name') || el.getAttribute('type') || 'Campo';
        el.setAttribute('aria-label', nice(String(text)));
      });
      if (!document.querySelector('h1') && !document.querySelector('[data-polish-h1]')) {
        const main = document.querySelector('main') || document.body;
        const h = document.createElement('h1');
        h.className = 'sr-only-h1';
        h.setAttribute('data-polish-h1', '');
        h.textContent = (document.title || '').split('|')[0].trim() || 'Página';
        main.insertBefore(h, main.firstChild);
      }
    };
    run();
    const t = window.setTimeout(run, 900); // telas que montam o formulário/título depois
    const t2 = window.setTimeout(() => { const mine = document.querySelector('[data-polish-h1]'); if (mine && document.querySelectorAll('h1').length > 1) mine.remove(); }, 2500);
    return () => { window.clearTimeout(t); window.clearTimeout(t2); };
  }, [pathname]);
  return null;
}
export default A11yPolish;
