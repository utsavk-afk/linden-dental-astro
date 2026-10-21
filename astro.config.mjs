// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://linden-dental.example',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { layout: 'constrained' },
});
