// @ts-check
import { defineConfig, sessionDrivers } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import emdash, { local } from 'emdash/astro';
import { sqlite } from 'emdash/db';

// Linden Dental runs as a server-rendered Astro app with the EmDash CMS (https://emdashcms.com):
// content lives in a SQLite database, media on disk, and the admin is at <base>/_emdash/admin.
//
// Local dev:  npm run dev  ->  http://localhost:4321/  (admin: /_emdash/admin)
// In PSI:     built and started by psi-monitor (Dockerfile + scripts/start-linden.sh) with
//   PUBLIC_LINK_PREFIX=/linden-dental  EMDASH_SITE_URL=https://stanventures-psi.fly.dev
//   LINDEN_DB=/app/data/linden/emdash.db  LINDEN_UPLOADS=/app/data/linden/uploads
//   PUBLIC_BOOKING_ENDPOINT=/api/linden/bookings  PUBLIC_NOINDEX=1
// PSI proxies /linden-dental/* to this server with the prefix stripped, and /_emdash/*, /_astro/*
// and /_image unchanged (EmDash only works at the server root).
const base = '/'; // EmDash requires the server root; staging uses PUBLIC_LINK_PREFIX instead
const basePrefix = (process.env.PUBLIC_LINK_PREFIX || '').replace(/\/+$/, '');

// Links typed inside article content (e.g. "/services/kids/") need the base prefix on staging.
function rehypeBaseLinks() {
  /** @param {any} tree */
  return (tree) => {
    if (!basePrefix) return;
    /** @param {any} node */
    const walk = (node) => {
      const href = node.properties?.href;
      if (node.tagName === 'a' && typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !href.startsWith(basePrefix + '/')) {
        node.properties.href = basePrefix + href;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: process.env.EMDASH_SITE_URL || process.env.LINDEN_SITE || 'http://localhost:4321',
  base,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // EmDash keeps admin logins in Astro sessions. The adapter default lives in node_modules/.astro,
  // which a redeploy wipes; on PSI this points at the volume (inlined at build time).
  session: { driver: sessionDrivers.fsLite({ base: process.env.LINDEN_SESSIONS || './data/sessions' }) },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { layout: 'constrained' },
  markdown: { rehypePlugins: [rehypeBaseLinks] },
  integrations: [
    react(),
    emdash({
      database: sqlite({ url: `file:${process.env.LINDEN_DB || './data/emdash.db'}` }),
      storage: local({
        directory: process.env.LINDEN_UPLOADS || './uploads',
        baseUrl: '/_emdash/api/media/file',
      }),
    }),
  ],
  vite: {
    // Build output and local docs are not source; watching them triggered reloads.
    server: { watch: { ignored: ['**/dist/**', '**/dist-psi/**', '**/docs/**', '**/data/**', '**/uploads/**'] } },
  },
});
