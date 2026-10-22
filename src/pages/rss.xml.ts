// RSS feed for the journal at /rss.xml. Feed title and description come from the CMS
// (Journal page > SEO, falling back to the page headline and intro). Drafts never appear.
import type { APIRoute } from 'astro';
import { getPosts, getJournalPage, getSettings } from '../lib/cms';
import { url } from '../lib/url';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const [posts, page, settings] = await Promise.all([getPosts(), getJournalPage(), getSettings()]);
  const abs = (p: string) => new URL(url(p), site).href;
  const items = posts.map((p) => {
    const author = p.author?.name || settings.name;
    const link = abs(`/journal/${p.id}/`);
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(p.seoDescription || p.description)}</description>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <dc:creator>${esc(author)}</dc:creator>
      <category>${esc(p.tag)}</category>
    </item>`;
  });
  const title = page.seo?.title || `${page.title} | ${settings.name}`;
  const description = page.seo?.description || page.lede;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(title)}</title>
    <link>${abs('/journal/')}</link>
    <description>${esc(description)}</description>
    <language>en-us</language>
    <atom:link href="${abs('/rss.xml')}" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
