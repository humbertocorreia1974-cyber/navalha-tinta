'use client';

import { Button } from '@/components/ui/button';

export function WhatsappButton() {
  function abrir() {
    const texto = encodeURIComponent('Olá! Quero saber mais sobre os serviços da Navalha & Tinta.');
    window.open(`https://wa.me/5511999990000?text=${texto}`, '_blank', 'noopener,noreferrer');
  }
  return (
    <Button type="button" variant="secondary" size="lg" onClick={abrir}>
      Falar no WhatsApp
    </Button>
  );
}
