// Downloads shortlisted Envato Elements photos with the signed-in session saved by login.mjs.
// Usage: node scripts/envato/download.mjs <slots.json> [onlyFile...]
// Each licence is registered to the project name below. Stops if the credit balance drops.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('C:/Users/khamb/ad-library/package.json');
const { chromium } = require('playwright');

const PROJECT = 'Linden Dental concept';
const OUT = 'C:/Users/khamb/linden-dental-astro/docs/envato-downloads';
const SHOTS = process.env.SHOTS || OUT;
const [slotFile, ...only] = process.argv.slice(2);
let slots = JSON.parse(fs.readFileSync(slotFile, 'utf8'));
if (only.length) slots = slots.filter(s => only.includes(s.f));
fs.mkdirSync(OUT, { recursive: true });

const ctx = await chromium.launchPersistentContext('C:/Users/khamb/.envato-chrome', {
  channel: 'chrome', headless: false, viewport: { width: 1440, height: 900 }, acceptDownloads: true,
});
const page = ctx.pages()[0] || await ctx.newPage();
const credits = async () => {
  const t = await page.locator('text=/Credits remaining/').first().innerText().catch(() => '');
  return parseInt(t, 10);
};

await page.goto('https://elements.envato.com/photos', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
const startCredits = await credits();
console.log('credits before:', startCredits);

for (const s of slots) {
  if (fs.readdirSync(OUT).some(f => f.startsWith(s.f + '.'))) { console.log('skip', s.f); continue; }
  await page.goto(s.url, { waitUntil: 'domcontentloaded' });
  const dl = page.getByRole('button', { name: /^Download$/ }).first();
  await dl.waitFor({ timeout: 30000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
  await dl.click();
  await page.waitForTimeout(2500);
  // Licence dialog: fill project name if asked, then confirm.
  const input = page.locator('input[type=text], input:not([type])').filter({ hasNot: page.locator('[placeholder*="Describe"]') });
  const dialog = page.locator('[role=dialog]').last();
  if (await dialog.isVisible().catch(() => false)) {
    await page.screenshot({ path: path.join(SHOTS, `_dialog-${s.f}.png`) });
    const field = dialog.locator('input').first();
    if (await field.isVisible().catch(() => false)) await field.fill(PROJECT);
    const confirm = dialog.getByRole('button', { name: /download|add|license|confirm/i }).last();
    if (await confirm.isVisible().catch(() => false)) await confirm.click();
  }
  try {
    const d = await downloadPromise;
    const ext = path.extname(d.suggestedFilename()) || '.jpg';
    await d.saveAs(path.join(OUT, s.f + ext));
    console.log('saved', s.f + ext, d.suggestedFilename());
  } catch (e) {
    await page.screenshot({ path: path.join(SHOTS, `_fail-${s.f}.png`) });
    console.log('FAILED', s.f, e.message.split('\n')[0]);
  }
  await page.goto('https://elements.envato.com/photos', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const now = await credits();
  console.log('credits now:', now);
  if (Number.isFinite(startCredits) && Number.isFinite(now) && now < startCredits) {
    console.log('CREDITS_SPENT: stopping so the user can decide'); break;
  }
}
await ctx.close();
