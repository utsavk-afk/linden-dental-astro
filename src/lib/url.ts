// Prefixes internal links with Astro's `base`, so the site works at the domain root
// (default build) and under a sub-path such as /linden-dental/ (PSI staging build).
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const url = (path: string) => BASE + path;
