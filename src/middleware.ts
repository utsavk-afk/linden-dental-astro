import { defineMiddleware } from 'astro:middleware';

// Staging (PUBLIC_NOINDEX=1) must never be indexed. PSI's next.config headers are dropped on
// proxied responses, so the header is set here for every page, feed and admin response.
const NOINDEX = !!import.meta.env.PUBLIC_NOINDEX;

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (NOINDEX) {
    try {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    } catch {
      // Immutable headers (e.g. a fetched Response passed through): leave as is.
    }
  }
  return response;
});
