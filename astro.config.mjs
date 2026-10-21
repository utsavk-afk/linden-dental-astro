// @ts-check
import { defineConfig } from 'astro/config';

// Default build: a standalone site at the domain root.
// PSI staging build (deploy/sync_linden_dental.ps1 in psi-monitor) sets:
//   LINDEN_BASE=/linden-dental  LINDEN_SITE=https://stanventures-psi.fly.dev
//   PUBLIC_BOOKING_ENDPOINT=/api/linden/bookings  PUBLIC_NOINDEX=1
const base = process.env.LINDEN_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site: process.env.LINDEN_SITE || 'https://linden-dental.example',
  base,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { layout: 'constrained' },
});
