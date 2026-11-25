'use client';

import MapView, { type MapPoint } from '@/components/map-view';

const PONTOS: MapPoint[] = [
  {
    id: 'navalha-tinta',
    lat: -23.5566,
    lng: -46.6905,
    title: 'Navalha & Tinta',
    subtitle: 'Rua das Navalhas, 245, Vila Madalena, São Paulo, SP',
  },
];

export function MapEmbed() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <MapView points={PONTOS} center={[-23.5566, -46.6905]} zoom={15} />
    </div>
  );
}
