// Opens a dedicated Chrome window on Envato Elements and waits for you to sign in.
// The session is kept in C:\Users\khamb\.envato-chrome so download runs reuse it.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/khamb/ad-library/package.json');
const { chromium } = require('playwright');

const ctx = await chromium.launchPersistentContext('C:/Users/khamb/.envato-chrome', {
  channel: 'chrome', headless: false, viewport: null, args: ['--start-maximized'],
});
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto('https://elements.envato.com/sign-in', { waitUntil: 'domcontentloaded' });
console.log('Waiting for sign-in (up to 10 min)...');
const deadline = Date.now() + 10 * 60 * 1000;
let ok = false;
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 4000));
  const cookies = await ctx.cookies('https://elements.envato.com');
  const onSignIn = /sign-in|account\.envato/.test(page.url());
  if (!onSignIn && cookies.some(c => /session|_elements_session|envato_client_id/i.test(c.name))) {
    const signedIn = await page.evaluate(() => !/Sign in/i.test(document.querySelector('header')?.innerText || 'Sign in')).catch(() => false);
    if (signedIn) { ok = true; break; }
  }
}
console.log(ok ? 'SIGNED_IN' : 'TIMEOUT', page.url());
await ctx.close();
