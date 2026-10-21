// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

// Default build: a standalone site at the domain root.
// Staging builds (repo GitHub Action, or C:\Gemini\psi-monitor\deploy\deploy-linden-dental.ps1) set:
//   LINDEN_BASE=/linden-dental  LINDEN_SITE=https://stanventures-psi.fly.dev
//   PUBLIC_BOOKING_ENDPOINT=/api/linden/bookings  PUBLIC_NOINDEX=1  PUBLIC_SHOW_DRAFTS=1
const base = process.env.LINDEN_BASE || '/';
const basePrefix = base.replace(/\/+$/, '');

// The Keystatic CMS (localhost:4321/keystatic) runs with `npm run dev` only. It edits the
// files in src/content directly, so the published site stays 100% static.
const isDev = process.argv.includes('dev');

// Redirects are edited in the CMS (Settings > Redirects) and stored in src/content/redirects.json.
// Static builds emit a redirect page per old URL (instant meta refresh + canonical to the new URL).
/** @type {Record<string, string>} */
const redirects = {};
try {
  const data = JSON.parse(fs.readFileSync(new URL('./src/content/redirects.json', import.meta.url), 'utf8'));
  for (const r of data.items ?? []) {
    const from = String(r.from ?? '').trim();
    const to = String(r.to ?? '').trim();
    if (!from.startsWith('/') || !to) continue;
    redirects[from] = /^https?:\/\//i.test(to) ? to : basePrefix + (to.startsWith('/') ? to : `/${to}`);
  }
} catch {
  /* no redirects file yet */
}

// Links typed inside CMS articles (e.g. "/services/kids/") need the base prefix on staging.
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
  site: process.env.LINDEN_SITE || 'https://linden-dental.example',
  base,
  redirects,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { layout: 'constrained' },
  markdown: { rehypePlugins: [rehypeBaseLinks] },
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.endsWith('/404/') }),
    ...(isDev ? [keystatic()] : []),
  ],
  vite: {
    // Pre-bundle the CMS at startup so Vite never re-optimises it mid-session
    // (that caused "504 Outdated Optimize Dep" and a blank /keystatic page).
    optimizeDeps: { include: ['@keystatic/core', '@keystatic/core/ui', '@keystatic/astro/ui'] },
    // Build output and local docs are not source; watching them triggered reloads.
    server: { watch: { ignored: ['**/dist/**', '**/dist-psi/**', '**/docs/**'] } },
  },
});
