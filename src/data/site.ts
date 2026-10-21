// Practice details. Edit them in the CMS (Keystatic > Site settings) or in
// src/content/settings.json; this file only derives links from them.
// Linden Dental Studio is a fictional practice. Phone uses the reserved 555-01xx range.
// Settings are read through src/lib/content.ts, so a field cleared in the CMS reads as ""
// instead of undefined.
import { href } from '../lib/url';
import { settings } from '../lib/content';

export { settings };

const digits = settings.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const pairs = (list: { label: string; link: string }[]) =>
  list.filter((l) => l.label).map((l) => ({ href: href(l.link), label: l.label }));

export const site = {
  name: settings.name,
  short: settings.name.split(' ')[0] ?? '',
  tagline: settings.tagline,
  phone: settings.phone,
  phoneHref: digits ? 'tel:+1' + digits : '',
  email: settings.email,
  address: [settings.addressLine1, settings.addressLine2].filter(Boolean),
  mapHref: settings.mapLink || undefined,
  hours: settings.hours.filter((h) => h.days || h.time),
  nav: pairs(settings.nav),
  cta: { href: href(settings.primaryCta.link), label: settings.primaryCta.label },
  logo: { word: settings.logoWord, sub: settings.logoSub },
  ctaBand: settings.ctaBand,
  footer: {
    ...settings.footer,
    extraLinks: pairs(settings.footer.extraLinks),
  },
  labels: settings.labels,
};

/** Fills {name} placeholders in a CMS label, e.g. fill('Step {n} of {total}', { n: 2, total: 5 }). */
export const fill = (text: string | null | undefined, values: Record<string, string | number>) =>
  (text ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
