# Pressure Washing Quote Calculator

Single-page static calculator (Astro + Tailwind). No backend.

## Run locally
```
npm install
npm run dev      # http://localhost:4321
npm test         # pricing maths tests
npm run build    # static site in dist/
```

## Deploy (Netlify / Cloudflare Pages / Vercel)
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22 (see `.nvmrc`)
- Environment variable: `SITE_URL=https://your-domain.com` (used for canonical link, sitemap.xml and robots.txt)

## Where things live
- Default rates, multipliers and the pricing formula: `src/lib/calc.js`
- Page, FAQ and copy: `src/pages/index.astro`
- Analytics snippet slot: `src/layouts/Layout.astro`
