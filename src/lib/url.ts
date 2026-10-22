// Internal links get an optional path prefix. EmDash must run at the server root (no Astro
// `base` support), so on PSI staging the whole site sits behind /linden-dental via a proxy and
// links are prefixed with PUBLIC_LINK_PREFIX=/linden-dental. On a real domain it is empty.
const PREFIX = (import.meta.env.PUBLIC_LINK_PREFIX ?? '').replace(/\/+$/, '');

export const url = (path: string) => PREFIX + path;

/** The current page's public path (adds the prefix to Astro.url.pathname). */
export const publicPath = (pathname: string) => (PREFIX && !pathname.startsWith(PREFIX + '/') ? PREFIX + pathname : pathname);

/** Resolves a CMS link: site paths ("/book/") get the prefix; URLs, tel: and mailto: pass through. */
export const href = (link: string | null | undefined) => {
  const l = (link ?? '').trim();
  if (!l) return url('/');
  if (/^(https?:|mailto:|tel:|#)/i.test(l)) return l;
  return url(l.startsWith('/') ? l : `/${l}`);
};
