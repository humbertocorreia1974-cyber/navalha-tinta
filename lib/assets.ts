// Gerado pelo JGNEXT — fonte única de identidade e imagens do app.
// Sempre válido: foto real quando disponível, arte da marca caso contrário.
const BP = process.env.NEXT_PUBLIC_SANDBOX_BASE_PATH || '';
const RAW = {
  "name": "Navalha & Tinta",
  "slogan": "Tradição no corte, ousadia no estilo.",
  "logo": "/logo-mark.svg",
  "logoFull": "/logo.svg",
  "hero": "/photos/photo-1.jpg",
  "photos": [
    "/photos/photo-1.jpg",
    "/photos/photo-2.jpg",
    "/photos/photo-3.jpg",
    "/photos/photo-4.jpg"
  ],
  "hasRealPhotos": true,
  "primary": "#1659E9"
};
export const ASSETS = { ...RAW, logo: BP + RAW.logo, logoFull: BP + RAW.logoFull, hero: BP + RAW.hero, photos: RAW.photos.map((s: string) => BP + s) };
export default ASSETS;
