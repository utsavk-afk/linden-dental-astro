// Practice details. Edit them in the CMS (EmDash > Site settings); this file only derives
// links from them. Settings are read through src/lib/cms.ts, so a field cleared in the CMS
// reads as "" instead of undefined.
// Linden Dental Studio is a fictional practice. Phone uses the reserved 555-01xx range.
import { href } from '../lib/url';
import { getSettings } from '../lib/cms';

export type Settings = Awaited<ReturnType<typeof getSettings>>;

const pairs = (list: { label: string; link: string }[]) =>
  list.filter((l) => l.label).map((l) => ({ href: href(l.link), label: l.label }));

/** Site details derived from the CMS settings (plus the raw `settings` for SEO fields). */
export async function getSite() {
  const settings = await getSettings();
  const digits = settings.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return {
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
    settings,
  };
}

export type Site = Awaited<ReturnType<typeof getSite>>;

/** Fills {name} placeholders in a CMS label, e.g. fill('Step {n} of {total}', { n: 2, total: 5 }). */
export const fill = (text: string | null | undefined, values: Record<string, string | number>) =>
  (text ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
