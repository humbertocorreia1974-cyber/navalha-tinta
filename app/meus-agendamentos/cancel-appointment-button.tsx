'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CancelAppointmentButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm('Cancelar este agendamento?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'PATCH' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível cancelar.');
        return;
      }
      router.refresh();
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading}>
        {loading ? 'Cancelando...' : 'Cancelar'}
      </Button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
