// Structured data (schema.org JSON-LD) built from the CMS settings, so Google can show
// the practice's address, phone, hours, FAQs and articles as rich results.
import settings from '../content/settings.json';

type Json = Record<string, unknown>;

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function dayIndex(word: string): number {
  const w = word.trim().slice(0, 3).toLowerCase();
  return DAY_NAMES.findIndex((d) => d.slice(0, 3).toLowerCase() === w);
}

/** "Mon to Thu" -> [Monday..Thursday]; "Saturday" -> [Saturday]. Unknown text -> []. */
function parseDays(text: string): string[] {
  const [a, b] = text.split(/\s+(?:to|-)\s+/i);
  const start = dayIndex(a ?? '');
  if (start < 0) return [];
  const end = b ? dayIndex(b) : start;
  if (end < start) return [];
  return DAY_NAMES.slice(start, end + 1);
}

/** "7:30 am" -> "07:30". */
function to24(t: string): string | null {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const mins = m[2] ?? '00';
  const ap = m[3]?.toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${mins}`;
}

function openingHours() {
  return settings.hours.flatMap((h) => {
    const days = parseDays(h.days);
    const [o, c] = h.time.split(/\s+to\s+/i);
    const opens = to24(o ?? '');
    const closes = to24(c ?? '');
    if (!days.length || !opens || !closes) return [];
    return [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes }];
  });
}

function postalAddress() {
  // "Portland, OR 97202"
  const m = settings.addressLine2.match(/^(.+?),\s*([A-Z]{2})\s+(\d{5})/);
  return {
    '@type': 'PostalAddress',
    streetAddress: settings.addressLine1,
    addressLocality: m?.[1] ?? settings.addressLine2,
    ...(m ? { addressRegion: m[2], postalCode: m[3] } : {}),
    addressCountry: 'US',
  };
}

export function dentistSchema(siteUrl: string, image?: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${siteUrl}#practice`,
    name: settings.name,
    description: settings.seoDefaultDescription,
    url: siteUrl,
    telephone: settings.phone,
    email: settings.email,
    address: postalAddress(),
    openingHoursSpecification: openingHours(),
    ...(image ? { image } : {}),
    priceRange: '$$',
  };
}

export function faqSchema(faqs: { q: string; a: string }[]): Json | null {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function articleSchema(a: { title: string; description: string; url: string; image?: string; date: Date; author: string; siteUrl: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: a.url,
    ...(a.image ? { image: [a.image] } : {}),
    datePublished: a.date.toISOString(),
    author: { '@type': 'Person', name: a.author },
    publisher: { '@id': `${a.siteUrl}#practice` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
