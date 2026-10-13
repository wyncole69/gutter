import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Set SITE_URL in your host's environment settings (e.g. https://example.com).
// It is used for the canonical link, sitemap.xml and robots.txt.
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
});
