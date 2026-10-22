import type { APIRoute } from 'astro';
import { url } from '../lib/url';

// Staging (PUBLIC_NOINDEX) blocks all crawlers; production points them at the sitemap.
// This route overrides EmDash's built-in /robots.txt so the sitemap URL carries the link prefix.
export const GET: APIRoute = ({ site }) => {
  const body = import.meta.env.PUBLIC_NOINDEX
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('/sitemap.xml'), site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
