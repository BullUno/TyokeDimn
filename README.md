##  TyokeDimn 作品集 · TyokeDimn Portfolio

###  本项目是根据这位大神的项目所动的：Portfolio Cosmic — Michael Smith
Vibe coding LLM：Deepseek-V4-Flash-Vision-Exp（MAX）(95%) and Deepseek V4 Flash(MAX)(3%) and Deepseek V4 Pro(MAX)(2%)

Built with React + Vite + Tailwind CSS + TypeScript + GSAP + Framer Motion + hls.js.

## Features

- Loading screen: 000→100 rAF counter, rotating words (Design / Create / Inspire), gradient progress bar
- Hero: Mux HLS video background (hls.js / native HLS dual mode), GSAP entrance, role words rotating every 2s,
  gradient-stroked button, scroll indicator
- Fixed floating pill navigation (logo gradient ring, scrollspy, smooth scrolling, gradient-stroked "Say hi")
- Selected Works: Bento grid (7/5/5/7 column spans), halftone dot mask, hover frosted glass + gradient-stroked tags
- Journal: pill-shaped entry list (title / image / date / read time)
- Explorations: GSAP ScrollTrigger pinned across a 300vh range + dual-column speed-differential parallax gallery;
  click a card to open the Lightbox (close with Esc); automatically degrades to a flowing gallery on small screens
- Stats: 20+ / 95+ / 200% three-column figures
- Contact: inverted HLS video background, GSAP infinite scrolling marquee,
  mailto button, social links, green pulsing dot "Available for projects"

## Running Locally

```bash
pnpm install
pnpm dev      # http://127.0.0.1:5173
```

Production build:

```bash
pnpm build
pnpm preview
```

## Project Structure

- `src/components`：page components（LoadingScreen / Navbar / Hero / Works / Journal /
  Explorations / Stats / Contact / Lightbox / SectionHeader）
- `src/data.ts`：site content (works, journal, exploration gallery, stats, social links
- `src/lib`：GSAP registration and smooth scrolling, HLS video hook
- `public/assets`：placeholder images and video posters
- `scripts/shoot.mjs`：headless Chrome CDP screenshot verification script (dev server + debug port 9222)

## Notes

The work and journal images are existing dark-toned placeholder assets; replace the paths in `public/assets` or
`src/data.ts` o swap in real work images. The HLS video source is in `src/data.ts` in`HLS_URL` 

The project is currently hosted on Netlify.The visiting address is ： https://tyokedimn.netlify.app
