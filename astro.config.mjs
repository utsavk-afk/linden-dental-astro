// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

// Default build: a standalone site at the domain root.
// PSI staging build (C:\Gemini\psi-monitor\deploy\deploy-linden-dental.ps1) sets:
//   LINDEN_BASE=/linden-dental  LINDEN_SITE=https://stanventures-psi.fly.dev
//   PUBLIC_BOOKING_ENDPOINT=/api/linden/bookings  PUBLIC_NOINDEX=1
const base = process.env.LINDEN_BASE || '/';

// The Keystatic CMS (localhost:4321/keystatic) runs with `npm run dev` only. It edits the
// files in src/content directly, so the published site stays 100% static.
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: process.env.LINDEN_SITE || 'https://linden-dental.example',
  base,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { layout: 'constrained' },
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.endsWith('/404/') }),
    ...(isDev ? [keystatic()] : []),
  ],
});
