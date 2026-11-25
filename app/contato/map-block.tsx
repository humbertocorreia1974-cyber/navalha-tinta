'use client';

import { useEffect, useState } from 'react';
import MapView, { type MapPoint } from '@/components/map-view';

type Props = {
  points: MapPoint[];
};

export function MapBlock({ points }: Props) {
  const [center, setCenter] = useState<[number, number] | undefined>(undefined);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => setGeoError('Não foi possível obter sua localização. O mapa mostra a barbearia.'),
      { timeout: 6000, maximumAge: 60_000 }
    );
  }, []);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-border">
        <MapView points={points} center={center} />
      </div>
      {geoError && <p className="text-xs text-fg-muted">{geoError}</p>}
    </div>
  );
}
