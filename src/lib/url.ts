// Prefixes internal links with Astro's `base`, so the site works at the domain root
// (default build) and under a sub-path such as /linden-dental/ (PSI staging build).
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const url = (path: string) => BASE + path;

/** Resolves a CMS link: site paths ("/book/") get the base prefix; URLs, tel: and mailto: pass through. */
export const href = (link: string | null | undefined) => {
  const l = (link ?? '').trim();
  if (!l) return url('/');
  if (/^(https?:|mailto:|tel:|#)/i.test(l)) return l;
  return url(l.startsWith('/') ? l : `/${l}`);
};
