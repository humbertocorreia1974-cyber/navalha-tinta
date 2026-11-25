# Sistema de design — Navalha & Tinta
Gerado com **UI/UX Pro Max** (curadoria de estilo + paleta + tipografia).
- **Estilo:** Liquid Glass
- **Palavras-chave:** dynamic material, optical glass, translucency, lensing, refraction, fluid morphing, system navigation
- **Modo:** light
- **Fontes:** Space Grotesk (títulos) / Inter (corpo)
- **Efeitos:** Lensing and refraction, adaptive translucency, and fluid morph transitions aligned to Apple platform behavior
- **Padrão de landing:** Scroll-Triggered Storytelling — Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA
- **Evitar:** Cheap visuals + Fast animations
## Tokens (CSS vars em `app/globals.css`)
```css
--bg: 210 40% 98%;
--surface: 0 0% 100%;
--surface-2: 221 25% 95%;
--border: 221 20% 88%;
--fg: 221 35% 14%;
--fg-muted: 221 15% 40%;
--brand: 221 83% 50%;
--brand-fg: 0 0% 100%;
--accent: 224 64% 33%;
--accent-fg: 0 0% 100%;
--danger: 0 72% 45%;
--danger-fg: 0 0% 100%;
--warning: 38 92% 50%;
--warning-fg: 20 40% 12%;
--success: 142 70% 33%;
--success-fg: 0 0% 100%;
```
_Use SEMPRE os tokens (`bg-brand`, `text-fg`, `border-border`…), nunca hex cru._