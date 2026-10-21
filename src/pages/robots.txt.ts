import type { APIRoute } from 'astro';
import { url } from '../lib/url';

// Staging builds (PUBLIC_NOINDEX) block all crawlers; production points them at the sitemap.
export const GET: APIRoute = ({ site }) => {
  const body = import.meta.env.PUBLIC_NOINDEX
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('/sitemap-index.xml'), site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
