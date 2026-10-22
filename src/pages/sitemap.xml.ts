// Sitemap at /sitemap.xml: the fixed pages plus every service, published journal post, and
// category/tag archive that has published posts.
// Overrides EmDash's built-in /sitemap.xml so every URL carries the link prefix on staging.
import type { APIRoute } from 'astro';
import { getServices, getPosts, getTerms } from '../lib/cms';
import type { Term } from '../lib/cms';
import { url } from '../lib/url';

const STATIC_PAGES = ['/', '/about/', '/services/', '/journal/', '/book/', '/design/'];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const [services, posts, categories, tags] = await Promise.all([getServices(), getPosts(), getTerms('category'), getTerms('tag')]);
  const flat = (list: Term[]): Term[] => list.flatMap((t) => [t, ...flat(t.children)]);
  const abs = (p: string) => new URL(url(p), site).href;
  const entry = (loc: string, lastmod?: Date) =>
    `  <url>\n    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}\n  </url>`;
  const urls = [
    ...STATIC_PAGES.map((p) => entry(abs(p))),
    ...services.map((s) => entry(abs(`/services/${s.id}/`))),
    ...posts.map((p) => entry(abs(`/journal/${p.id}/`), p.updatedDate ?? p.date)),
    ...flat(categories).filter((t) => t.count > 0).map((t) => entry(abs(`/journal/category/${t.slug}/`))),
    ...tags.filter((t) => t.count > 0).map((t) => entry(abs(`/journal/tag/${t.slug}/`))),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
