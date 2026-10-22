// Data access for the EmDash CMS (content lives in the database; see seed/seed.json for the model).
// Every function returns the shape its templates expect,
// fills missing fields with defaults, and never throws on empty or missing content.
import { getEmDashCollection, getEmDashEntry, getEmDashReferences, getMenu, getRequestContext } from 'emdash';

// ---------------------------------------------------------------------------
// Types and helpers
// ---------------------------------------------------------------------------
export type CmsImage = { src: string; alt: string; width?: number; height?: number } & Record<string, unknown>;
/** Portable Text value (array of blocks), rendered with src/components/RichText.astro. */
export type PortableTextValue = Array<{ _type: string; _key?: string; [key: string]: unknown }>;
export type Link = { label: string; link: string };

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => !!v && typeof v === 'object' && !Array.isArray(v);

/** Deep-merges data over a defaults shape (arrays of objects merge item by item). */
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

const MEDIA_PREFIX = '/_emdash/api/media/file/';

/** An EmDash image field value as a CmsImage (src always set), or null when empty. */
export function toImage(value: unknown, fallbackAlt = ''): CmsImage | null {
  if (!isPlain(value)) return null;
  const meta = isPlain(value.meta) ? value.meta : {};
  const key = typeof meta.storageKey === 'string' ? meta.storageKey : '';
  const src =
    typeof value.src === 'string' && value.src
      ? value.src
      : key
        ? MEDIA_PREFIX + key
        : typeof value.id === 'string' && value.id && (value.provider ?? 'local') === 'local'
          ? MEDIA_PREFIX + value.id
          : '';
  if (!src) return null;
  const alt = typeof value.alt === 'string' && value.alt ? value.alt : fallbackAlt;
  return {
    ...value,
    src,
    alt,
    width: typeof value.width === 'number' ? value.width : undefined,
    height: typeof value.height === 'number' ? value.height : undefined,
  } as CmsImage;
}

const s = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const n = (v: unknown, fallback = 10): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const arr = (v: unknown): Plain[] => (Array.isArray(v) ? v.filter(isPlain) : []);
const pt = (v: unknown): PortableTextValue => (Array.isArray(v) ? (v as PortableTextValue) : []);
const date = (v: unknown): Date | undefined => {
  if (v instanceof Date) return Number.isNaN(+v) ? undefined : v;
  if (typeof v === 'string' && v) {
    const d = new Date(v);
    return Number.isNaN(+d) ? undefined : d;
  }
  return undefined;
};
/** Per-entry SEO panel values (supports: ["seo"]) live at data.seo. */
const seoPanel = (data: Plain) => {
  const seo = isPlain(data.seo) ? data.seo : {};
  return { title: s(seo.title), description: s(seo.description), image: s(seo.image) };
};

/** Logs and swallows errors so a broken query renders defaults instead of a 500. */
async function safe<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[cms] ${label} failed:`, error);
    return fallback;
  }
}

type Entry = { id: string; data: Plain };

async function collection(type: string, status?: 'published' | 'draft'): Promise<Entry[]> {
  return safe(`collection ${type}`, [] as Entry[], async () => {
    const { entries, error } = await getEmDashCollection(type, { ...(status ? { status } : {}), limit: 500 });
    if (error) console.error(`[cms] collection ${type}:`, error);
    return ((entries ?? []) as unknown as Entry[]).map((e) => ({ id: e.id, data: isPlain(e.data) ? e.data : {} }));
  });
}

async function entry(type: string, slug: string): Promise<Entry | null> {
  return safe(`entry ${type}/${slug}`, null as Entry | null, async () => {
    const { entry: e, error } = await getEmDashEntry(type, slug);
    if (error && error.name !== 'LiveEntryNotFoundError') console.error(`[cms] entry ${type}/${slug}:`, error);
    return e ? { id: e.id, data: isPlain(e.data) ? (e.data as Plain) : {} } : null;
  });
}

/** The data of a one-entry page settings collection (slug "main"), or {}. */
async function single(type: string): Promise<Plain> {
  return (await entry(type, 'main'))?.data ?? {};
}

async function menuLinks(name: string): Promise<Link[]> {
  return safe(`menu ${name}`, [] as Link[], async () => {
    const menu = await getMenu(name);
    return (menu?.items ?? []).filter((i) => i.label).map((i) => ({ label: i.label, link: i.url || '/' }));
  });
}

/** True when this request is an EmDash preview or edit-mode render (drafts may be shown). */
export function isPreviewRequest(): boolean {
  const ctx = getRequestContext() as { preview?: unknown; editMode?: boolean } | undefined;
  return !!ctx && (ctx.preview !== undefined || ctx.editMode === true);
}

// ---------------------------------------------------------------------------
// Site settings (+ menus). Called by many components per request, so it is memoised briefly.
// ---------------------------------------------------------------------------
const linkShape = (): Link => ({ label: '', link: '' });
const settingsShape = () => ({
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
  nav: [linkShape()],
  primaryCta: linkShape(),
  ctaBand: { title: '', text: '' },
  footer: {
    intro: '',
    visitHeading: '',
    hoursHeading: '',
    contactHeading: '',
    directionsLabel: '',
    extraLinks: [linkShape()],
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
});
export type Settings = ReturnType<typeof settingsShape>;

async function loadSettings(): Promise<Settings> {
  const [d, nav, extraLinks] = await Promise.all([single('site_settings'), menuLinks('primary'), menuLinks('footer')]);
  return withDefaults(settingsShape(), {
    name: d.name,
    logoWord: d.logo_word,
    logoSub: d.logo_sub,
    tagline: d.tagline,
    phone: d.phone,
    email: d.email,
    addressLine1: d.address_line_1,
    addressLine2: d.address_line_2,
    mapLink: d.map_link,
    hours: arr(d.hours).map((h) => ({ days: h.days, time: h.time })),
    nav,
    primaryCta: { label: d.primary_cta_label, link: d.primary_cta_link },
    ctaBand: { title: d.cta_band_title, text: d.cta_band_text },
    footer: {
      intro: d.footer_intro,
      visitHeading: d.footer_visit_heading,
      hoursHeading: d.footer_hours_heading,
      contactHeading: d.footer_contact_heading,
      directionsLabel: d.footer_directions_label,
      extraLinks,
      note: d.footer_note,
    },
    labels: {
      skipLink: d.labels_skip_link,
      menu: d.labels_menu,
      themeToggle: d.labels_theme_toggle,
      minRead: d.labels_min_read,
      stepOf: d.labels_step_of,
      pause: d.labels_pause,
      play: d.labels_play,
      mainNav: d.labels_main_nav,
      homeLink: d.labels_home_link,
      portraitAlt: d.labels_portrait_alt,
    },
    seoDefaultTitle: d.seo_default_title,
    seoTitleSuffix: d.seo_title_suffix,
    seoDefaultDescription: d.seo_default_description,
    twitterHandle: d.twitter_handle,
  });
}

const SETTINGS_TTL_MS = 3000;
let settingsCache: { at: number; value: Promise<Settings> } | null = null;

/** Site settings, with defaults filled in. Memoised for a few seconds. */
export function getSettings(): Promise<Settings> {
  const now = Date.now();
  if (!settingsCache || now - settingsCache.at > SETTINGS_TTL_MS) {
    const value = loadSettings().catch((error) => {
      console.error('[cms] settings failed:', error);
      settingsCache = null;
      return settingsShape();
    });
    settingsCache = { at: now, value };
  }
  return settingsCache.value;
}

// ---------------------------------------------------------------------------
// Reviews and team
// ---------------------------------------------------------------------------
export type Review = { quote: string; name: string; where: string };

/** Reviews in menu order: [{ quote, name, where }]. */
export async function getReviews(): Promise<Review[]> {
  const entries = await collection('reviews');
  return entries
    .map((e) => ({ order: n(e.data.order), quote: s(e.data.quote), name: s(e.data.name), where: s(e.data.where) }))
    .filter((r) => r.quote || r.name)
    .sort((a, b) => a.order - b.order)
    .map(({ quote, name, where }) => ({ quote, name, where }));
}

export type TeamMember = { id: string; name: string; role: string; photo: CmsImage | null; bio: string; outside: string; order: number };

const toTeamMember = (e: Entry): TeamMember => ({
  id: e.id,
  name: s(e.data.name),
  role: s(e.data.role),
  photo: toImage(e.data.photo, s(e.data.name)),
  bio: s(e.data.bio),
  outside: s(e.data.outside),
  order: n(e.data.order),
});

/** Team members in menu order. */
export async function getTeam(): Promise<TeamMember[]> {
  return (await collection('team')).map(toTeamMember).sort((a, b) => a.order - b.order);
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export type Service = {
  id: string;
  title: string;
  summary: string;
  order: number;
  icon: string;
  photo: CmsImage | null;
  photoAlt: string;
  price: string;
  duration: string;
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  seoTitle: string;
  seoDescription: string;
  body: PortableTextValue;
  draft: boolean;
};

function toService(e: Entry): Service {
  const d = e.data;
  const photo = toImage(d.photo, s(d.title));
  const seo = seoPanel(d);
  return {
    id: e.id,
    title: s(d.title),
    summary: s(d.summary),
    order: n(d.order),
    icon: s(d.icon) || 'tooth',
    photo,
    photoAlt: photo?.alt ?? '',
    price: s(d.price),
    duration: s(d.duration),
    steps: arr(d.steps).map((st) => ({ title: s(st.title), body: s(st.body) })),
    faqs: arr(d.faqs).map((q) => ({ q: s(q.q), a: s(q.a) })),
    seoTitle: seo.title,
    seoDescription: seo.description,
    body: pt(d.content),
    draft: s(d.status) === 'draft',
  };
}

/** Published services (plus drafts in an EmDash preview), in menu order. */
export async function getServices(): Promise<Service[]> {
  return (await collection('services')).map(toService).sort((a, b) => a.order - b.order);
}

/** One service by slug, or null. */
export async function getService(slug: string): Promise<Service | null> {
  const e = await entry('services', slug);
  return e ? toService(e) : null;
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------
export type Post = {
  id: string;
  title: string;
  description: string;
  date: Date;
  updatedDate?: Date;
  author: TeamMember | null;
  tag: string;
  cover: CmsImage | null;
  coverAlt: string;
  seoTitle: string;
  seoDescription: string;
  body: PortableTextValue;
  draft: boolean;
  readMinutes: number;
};

/** Words in a Portable Text value (span text only). */
export function wordCount(value: unknown): number {
  let words = 0;
  for (const block of pt(value)) {
    const children = Array.isArray(block.children) ? block.children : [];
    for (const child of children) {
      if (isPlain(child) && typeof child.text === 'string') words += child.text.split(/\s+/).filter(Boolean).length;
    }
  }
  return words;
}

/** Reading time at ~200 words a minute, at least 1. */
export const readMinutesOf = (value: unknown) => Math.max(1, Math.round(wordCount(value) / 200));

async function authorOf(e: Entry, team: TeamMember[]): Promise<TeamMember | null> {
  const rowId = s(e.data.id) || e.id;
  const refs = await safe(`author of ${e.id}`, null, async () => {
    const res = await getEmDashReferences('journal', rowId, 'author', { limit: 1 });
    if (res.error) console.error(`[cms] author of ${e.id}:`, res.error);
    return res.entries ?? [];
  });
  const ref = refs?.[0] as unknown as Entry | undefined;
  if (!ref) return null;
  const refData = isPlain(ref.data) ? ref.data : {};
  return (
    team.find((t) => t.id === ref.id || t.id === s(refData.slug)) ??
    toTeamMember({ id: ref.id, data: refData })
  );
}

async function toPost(e: Entry, team: TeamMember[]): Promise<Post> {
  const d = e.data;
  const cover = toImage(d.featured_image, s(d.title));
  const seo = seoPanel(d);
  const body = pt(d.content);
  return {
    id: e.id,
    title: s(d.title),
    description: s(d.excerpt),
    date: date(d.publish_date) ?? date(d.publishedAt) ?? date(d.createdAt) ?? new Date(0),
    updatedDate: date(d.updated_date),
    author: await authorOf(e, team),
    tag: s(d.category) || 'Everyday care',
    cover,
    coverAlt: cover?.alt ?? '',
    seoTitle: seo.title,
    seoDescription: seo.description,
    body,
    draft: s(d.status) !== 'published',
    readMinutes: readMinutesOf(body),
  };
}

/**
 * Journal posts, newest first. Published only, unless includeDrafts is true (staging and dev
 * previews) or the request is an EmDash preview.
 */
export async function getPosts(options: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  const withDrafts = options.includeDrafts === true;
  const [published, drafts, team] = await Promise.all([
    collection('journal', 'published'),
    withDrafts ? collection('journal', 'draft') : Promise.resolve([] as Entry[]),
    getTeam(),
  ]);
  const seen = new Set(published.map((e) => e.id));
  const all = [...published, ...drafts.filter((e) => !seen.has(e.id))];
  const posts = await Promise.all(all.map((e) => toPost(e, team)));
  return posts.sort((a, b) => +b.date - +a.date);
}

/**
 * One post by slug, or null. Drafts are returned in an EmDash preview (EmDash serves them
 * through the request context) or when includeDrafts is true.
 */
export async function getPost(slug: string, options: { includeDrafts?: boolean } = {}): Promise<Post | null> {
  const team = await getTeam();
  const e = await entry('journal', slug);
  if (e) return toPost(e, team);
  if (options.includeDrafts) {
    const draft = (await collection('journal', 'draft')).find((d) => d.id === slug || s(d.data.slug) === slug);
    if (draft) return toPost(draft, team);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Page settings (one entry each)
// ---------------------------------------------------------------------------
const seoShape = () => ({ title: '', description: '' });

export async function getServicesPage() {
  const d = await single('services_page');
  return withDefaults(
    {
      title: '',
      lede: '',
      ctaTitle: '',
      ctaText: '',
      detail: { backLabel: '', costLabel: '', timeLabel: '', stepsTitle: '', faqTitle: '', moreTitle: '', ctaTitle: '', ctaText: '' },
      seo: seoShape(),
    },
    {
      title: d.title,
      lede: d.lede,
      ctaTitle: d.cta_title,
      ctaText: d.cta_text,
      detail: {
        backLabel: d.detail_back_label,
        costLabel: d.detail_cost_label,
        timeLabel: d.detail_time_label,
        stepsTitle: d.detail_steps_title,
        faqTitle: d.detail_faq_title,
        moreTitle: d.detail_more_title,
        ctaTitle: d.detail_cta_title,
        ctaText: d.detail_cta_text,
      },
      seo: { title: d.meta_title, description: d.meta_description },
    },
  );
}

export async function getJournalPage() {
  const d = await single('journal_page');
  return withDefaults(
    {
      title: '',
      lede: '',
      readLabel: '',
      post: { backLabel: '', authorLine: '', nextTitle: '', updatedLabel: '', draftBanner: '', ctaTitle: '', ctaText: '' },
      seo: seoShape(),
    },
    {
      title: d.title,
      lede: d.lede,
      readLabel: d.read_label,
      post: {
        backLabel: d.post_back_label,
        authorLine: d.post_author_line,
        nextTitle: d.post_next_title,
        updatedLabel: d.post_updated_label,
        draftBanner: d.post_draft_banner,
        ctaTitle: d.post_cta_title,
        ctaText: d.post_cta_text,
      },
      seo: { title: d.meta_title, description: d.meta_description },
    },
  );
}

const FORM_KEYS = [
  'whoLegend', 'whoMe', 'whoChild', 'whoFamily', 'name', 'phone', 'email', 'emailHelp', 'reason', 'reasonPlaceholder',
  'days', 'nervousLead', 'nervousText', 'notes', 'optional', 'submit', 'sending', 'fineStaging', 'fineConcept',
] as const;
const MESSAGE_KEYS = ['name', 'emailMissing', 'emailInvalid', 'phoneMissing', 'phonePattern', 'reason', 'fieldInvalid', 'sendFailed', 'retry'] as const;
const snake = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const blankRecord = <K extends string>(keys: readonly K[]) => Object.fromEntries(keys.map((k) => [k, ''])) as Record<K, string>;
const pick = (d: Plain, prefix: string, keys: readonly string[]) => Object.fromEntries(keys.map((k) => [k, d[`${prefix}_${snake(k)}`]]));

export async function getBookPage() {
  const d = await single('book_page');
  return withDefaults(
    {
      intro: { title: '', lede: '', callLabel: '' },
      nextSteps: [{ icon: 'envelope-simple', lead: '', text: '' }],
      form: blankRecord(FORM_KEYS),
      options: { reasons: [''], days: [''] },
      messages: blankRecord(MESSAGE_KEYS),
      success: { headingPrefix: '', headingSuffix: '', text: '', link: linkShape() },
      seo: seoShape(),
    },
    {
      intro: { title: d.intro_title, lede: d.intro_lede, callLabel: d.intro_call_label },
      nextSteps: arr(d.next_steps).map((st) => ({ icon: st.icon, lead: st.lead, text: st.text })),
      form: pick(d, 'form', FORM_KEYS),
      options: {
        reasons: arr(d.options_reasons).map((o) => s(o.option)),
        days: arr(d.options_days).map((o) => s(o.option)),
      },
      messages: pick(d, 'messages', MESSAGE_KEYS),
      success: {
        headingPrefix: d.success_heading_prefix,
        headingSuffix: d.success_heading_suffix,
        text: d.success_text,
        link: { label: d.success_link_label, link: d.success_link_link },
      },
      seo: { title: d.meta_title, description: d.meta_description },
    },
  );
}

export async function getNotFoundPage() {
  const d = await single('not_found_page');
  return withDefaults(
    { pageTitle: '', title: '', lede: '', primary: linkShape(), secondary: linkShape() },
    {
      pageTitle: d.page_title,
      title: d.title,
      lede: d.lede,
      primary: { label: d.primary_label, link: d.primary_link },
      secondary: { label: d.secondary_label, link: d.secondary_link },
    },
  );
}

export async function getDesignPage() {
  const d = await single('design_page');
  return withDefaults(
    {
      title: '',
      lede: '',
      principles: { title: '', items: [{ title: '', text: '' }] },
      colour: { title: '', intro: '', swatches: [{ token: '', name: '', use: '' }] },
      type: { title: '', intro: '', specimens: [{ step: '--step-0', label: '', sample: '' }] },
      components: { title: '', intro: '', primaryButton: '', secondaryButton: '', textLink: '' },
      motion: { title: '', intro: '', items: [{ name: '', why: '', how: '' }] },
      inspiration: { title: '', intro: '', items: [{ who: '', where: '', title: '', url: '', took: '' }] },
      seo: seoShape(),
    },
    {
      title: d.title,
      lede: d.lede,
      principles: { title: d.principles_title, items: arr(d.principles_items) },
      colour: { title: d.colour_title, intro: d.colour_intro, swatches: arr(d.colour_swatches) },
      type: { title: d.type_title, intro: d.type_intro, specimens: arr(d.type_specimens) },
      components: {
        title: d.components_title,
        intro: d.components_intro,
        primaryButton: d.components_primary_button,
        secondaryButton: d.components_secondary_button,
        textLink: d.components_text_link,
      },
      motion: { title: d.motion_title, intro: d.motion_intro, items: arr(d.motion_items) },
      inspiration: { title: d.inspiration_title, intro: d.inspiration_intro, items: arr(d.inspiration_items) },
      seo: { title: d.meta_title, description: d.meta_description },
    },
  );
}

export type PageSeo = { title: string; description: string; image: CmsImage | null };
export type VisitStep = { title: string; body: string; image: CmsImage | null; imageAlt: string };
export type HomePage = {
  heroTitle: string;
  heroAccent: string;
  heroLede: string;
  heroImage: CmsImage | null;
  heroImageAlt: string;
  heroCardTitle: string;
  heroCardText: string;
  manifesto: string;
  manifestoCta: Link;
  servicesTitle: string;
  visitTitle: string;
  visitLede: string;
  visitSteps: VisitStep[];
  teamTitle: string;
  teamText: string;
  teamCta: Link;
  reviewsTitle: string;
  reviewsLabel: string;
  journalTitle: string;
  journalCta: Link;
  findTitle: string;
  findImage: CmsImage | null;
  findImageAlt: string;
  insurance: string;
  parking: string;
  access: string;
  seo: PageSeo;
};

/** Home page copy: same keys as the old src/content/pages/home.json, images as CmsImage. */
export async function getHomePage(): Promise<HomePage> {
  const d = await single('home_page');
  const heroImage = toImage(d.hero_image);
  const findImage = toImage(d.find_image);
  const link = (label: unknown, href: unknown): Link => ({ label: s(label), link: s(href) });
  return {
    heroTitle: s(d.hero_title),
    heroAccent: s(d.hero_accent),
    heroLede: s(d.hero_lede),
    heroImage,
    heroImageAlt: heroImage?.alt ?? '',
    heroCardTitle: s(d.hero_card_title),
    heroCardText: s(d.hero_card_text),
    manifesto: s(d.manifesto),
    manifestoCta: link(d.manifesto_cta_label, d.manifesto_cta_link),
    servicesTitle: s(d.services_title),
    visitTitle: s(d.visit_title),
    visitLede: s(d.visit_lede),
    visitSteps: arr(d.visit_steps).map((st) => {
      const image = toImage(st.image, s(st.title));
      return { title: s(st.title), body: s(st.body), image, imageAlt: image?.alt ?? '' };
    }),
    teamTitle: s(d.team_title),
    teamText: s(d.team_text),
    teamCta: link(d.team_cta_label, d.team_cta_link),
    reviewsTitle: s(d.reviews_title),
    reviewsLabel: s(d.reviews_label),
    journalTitle: s(d.journal_title),
    journalCta: link(d.journal_cta_label, d.journal_cta_link),
    findTitle: s(d.find_title),
    findImage,
    findImageAlt: findImage?.alt ?? '',
    insurance: s(d.insurance),
    parking: s(d.parking),
    access: s(d.access),
    seo: { title: s(d.meta_title), description: s(d.meta_description), image: toImage(d.og_image) },
  };
}

export type AboutPage = {
  title: string;
  lede: string;
  image: CmsImage | null;
  imageAlt: string;
  storyTitle: string;
  story: string[];
  principlesTitle: string;
  principles: { icon: string; title: string; body: string }[];
  teamTitle: string;
  ctaTitle: string;
  ctaText: string;
  seo: PageSeo;
};

/** About page copy: same keys as the old src/content/pages/about.json, images as CmsImage. */
export async function getAboutPage(): Promise<AboutPage> {
  const d = await single('about_page');
  const image = toImage(d.image);
  return {
    title: s(d.title),
    lede: s(d.lede),
    image,
    imageAlt: image?.alt ?? '',
    storyTitle: s(d.story_title),
    story: arr(d.story).map((p) => s(p.paragraph)).filter(Boolean),
    principlesTitle: s(d.principles_title),
    principles: arr(d.principles).map((p) => ({ icon: s(p.icon) || 'clock', title: s(p.title), body: s(p.body) })),
    teamTitle: s(d.team_title),
    ctaTitle: s(d.cta_title),
    ctaText: s(d.cta_text),
    seo: { title: s(d.meta_title), description: s(d.meta_description), image: toImage(d.og_image) },
  };
}
