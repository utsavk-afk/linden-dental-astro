// Safe access to the CMS singletons that are plain JSON files (no content-collection schema).
// Keystatic deletes a field from the file when an editor clears it (and collapses an emptied
// group to {}), so reading the JSON directly can hand a template `undefined`. Every page and
// helper must import these singletons from here, never from src/content/*.json directly:
// each file is merged over a defaults "shape", so a missing key reads as "" (or [] / the
// fallback below) instead of crashing the build.
import settingsJson from '../content/settings.json';
import reviewsJson from '../content/reviews.json';
import servicesPageJson from '../content/pages/servicesPage.json';
import journalPageJson from '../content/pages/journalPage.json';
import bookPageJson from '../content/pages/bookPage.json';
import notFoundJson from '../content/pages/notFound.json';
import designPageJson from '../content/pages/designPage.json';

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Deep-merges CMS data over a defaults shape and returns the shape's type.
 * - object: every key in the shape is filled (extra keys in the data are kept);
 * - array: `[item]` means "array of item", each entry merged over `item`; a missing array is [];
 *   empty strings are dropped from string lists;
 * - value: a missing, null or wrong-typed value falls back to the shape's value.
 */
export function withDefaults<T>(shape: T, data: unknown): T {
  if (Array.isArray(shape)) {
    if (!Array.isArray(data)) return [] as T;
    const item: unknown = shape[0];
    if (item === undefined) return data as T;
    const out = data.map((d) => withDefaults(item, d));
    return (typeof item === 'string' ? out.filter(Boolean) : out) as T;
  }
  if (isPlain(shape)) {
    const src = isPlain(data) ? data : {};
    const out: Plain = { ...src };
    for (const key of Object.keys(shape)) out[key] = withDefaults(shape[key], src[key]);
    return out as T;
  }
  if (data === undefined || data === null) return shape;
  return (typeof data === typeof shape ? data : shape) as T;
}

const link = () => ({ label: '', link: '' });
const seo = () => ({ title: '', description: '' });

export const settings = withDefaults(
  {
    name: '',
    logoWord: '',
    logoSub: '',
    tagline: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    mapLink: '',
    hours: [{ days: '', time: '' }],
    nav: [link()],
    primaryCta: link(),
    ctaBand: { title: '', text: '' },
    footer: {
      intro: '',
      visitHeading: '',
      hoursHeading: '',
      contactHeading: '',
      directionsLabel: '',
      extraLinks: [link()],
      note: '',
    },
    labels: {
      skipLink: '',
      menu: '',
      themeToggle: '',
      minRead: '',
      stepOf: '',
      pause: '',
      play: '',
      mainNav: '',
      homeLink: '',
      portraitAlt: '',
    },
    seoDefaultTitle: '',
    seoTitleSuffix: '',
    seoDefaultDescription: '',
    twitterHandle: '',
  },
  settingsJson,
);

export const reviews = withDefaults({ items: [{ quote: '', name: '', where: '' }] }, reviewsJson).items;

export const servicesPage = withDefaults(
  {
    title: '',
    lede: '',
    ctaTitle: '',
    ctaText: '',
    detail: { backLabel: '', costLabel: '', timeLabel: '', stepsTitle: '', faqTitle: '', moreTitle: '', ctaTitle: '', ctaText: '' },
    seo: seo(),
  },
  servicesPageJson,
);

export const journalPage = withDefaults(
  {
    title: '',
    lede: '',
    readLabel: '',
    post: { backLabel: '', authorLine: '', nextTitle: '', updatedLabel: '', draftBanner: '', ctaTitle: '', ctaText: '' },
    seo: seo(),
  },
  journalPageJson,
);

export const bookPage = withDefaults(
  {
    intro: { title: '', lede: '', callLabel: '' },
    nextSteps: [{ icon: 'envelope-simple', lead: '', text: '' }],
    form: {
      whoLegend: '',
      whoMe: '',
      whoChild: '',
      whoFamily: '',
      name: '',
      phone: '',
      email: '',
      emailHelp: '',
      reason: '',
      reasonPlaceholder: '',
      days: '',
      nervousLead: '',
      nervousText: '',
      notes: '',
      optional: '',
      submit: '',
      sending: '',
      fineStaging: '',
      fineConcept: '',
    },
    options: { reasons: [''], days: [''] },
    messages: {
      name: '',
      emailMissing: '',
      emailInvalid: '',
      phoneMissing: '',
      phonePattern: '',
      reason: '',
      fieldInvalid: '',
      sendFailed: '',
      retry: '',
    },
    success: { headingPrefix: '', headingSuffix: '', text: '', link: link() },
    seo: seo(),
  },
  bookPageJson,
);

export const notFound = withDefaults(
  { pageTitle: '', title: '', lede: '', primary: link(), secondary: link() },
  notFoundJson,
);

export const designPage = withDefaults(
  {
    title: '',
    lede: '',
    principles: { title: '', items: [{ title: '', text: '' }] },
    colour: { title: '', intro: '', swatches: [{ token: '', name: '', use: '' }] },
    type: { title: '', intro: '', specimens: [{ step: '--step-0', label: '', sample: '' }] },
    components: { title: '', intro: '', primaryButton: '', secondaryButton: '', textLink: '' },
    motion: { title: '', intro: '', items: [{ name: '', why: '', how: '' }] },
    inspiration: { title: '', intro: '', items: [{ who: '', where: '', title: '', url: '', took: '' }] },
    seo: seo(),
  },
  designPageJson,
);
