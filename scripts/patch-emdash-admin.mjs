// The EmDash admin's "View Site" button is hard-coded to "/". On PSI staging the site lives at
// PUBLIC_LINK_PREFIX (/linden-dental) and "/" is the PSI dashboard, so point the button at the
// prefix. Runs before `astro build` (npm prebuild, and psi-monitor's Dockerfile). Idempotent;
// a no-op when PUBLIC_LINK_PREFIX is empty (site at the domain root).
import fs from 'node:fs';
import { createRequire } from 'node:module';

const prefix = (process.env.PUBLIC_LINK_PREFIX || '').replace(/\/+$/, '');
const require = createRequire(import.meta.url);
const file = require.resolve('@emdash-cms/admin').replace(/[^\\/]+$/, 'index.js');
const src = fs.readFileSync(file, 'utf8');

// Matches the header link whether it still says "/" or was patched by an earlier run.
const RE = /(href: )"[^"]*"(,\s*external: true,\s*children: \[\/\* @__PURE__ \*\/ jsx\(ArrowSquareOut)/;
if (!RE.test(src)) {
  console.warn('[patch-emdash-admin] View Site link not found; EmDash admin changed, check this script.');
  process.exit(0);
}
const out = src.replace(RE, `$1${JSON.stringify(prefix ? `${prefix}/` : '/')}$2`);
if (out !== src) fs.writeFileSync(file, out);
console.log(`[patch-emdash-admin] View Site -> ${prefix ? `${prefix}/` : '/'}`);
