import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// These schemas mirror the Keystatic fields in cms/. Keystatic deletes a cleared field from the
// file instead of saving "", so:
//   - fields the CMS refuses to save empty (validation in cms/) stay required here;
//   - every field the CMS lets an editor clear is optional or has a default here, and the
//     templates fall back when it is empty. Keep the two in step when adding a field.

/** Optional text: missing (cleared in the CMS) reads as "". */
const opt = () => z.string().default('');
/** A cleared optional date can arrive as a missing key or null; both mean "no date". */
const optDate = () => z.coerce.date().nullish().transform((d) => d ?? undefined);
const link = z.object({ label: z.string(), link: z.string() });

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      icon: z.string().default('tooth'),
      order: z.number().default(10),
      photo: image(),
      photoAlt: z.string(),
      price: z.string(),
      duration: z.string(),
      steps: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      seoTitle: opt(),
      seoDescription: opt(),
    }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updatedDate: optDate(),
      author: reference('team'),
      draft: z.boolean().default(false),
      cover: image(),
      coverAlt: z.string(),
      // Read time is always calculated from the article (src/lib/journal.ts).
      tag: z.string().default('Everyday care'),
      seoTitle: opt(),
      seoDescription: opt(),
    }),
});

// One JSON file per person (src/content/team/<id>.json); the filename is the id.
const team = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      photo: image(),
      bio: z.string(),
      outside: opt(),
      order: z.number().default(10),
    }),
});

// Page copy edited in the CMS (Keystatic singletons). Each is a single JSON file in
// src/content/pages; image paths are relative to that file, so Astro optimises them.
// SEO blocks are optional: a cleared block is saved as {} or dropped entirely.
const seo = <T extends z.ZodType>(img: T) =>
  z.object({ title: opt(), description: opt(), image: img.nullish() }).prefault({});

const home = defineCollection({
  loader: glob({ pattern: 'home.json', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      heroTitle: z.string(),
      heroAccent: z.string(),
      heroLede: z.string(),
      heroImage: image(),
      heroImageAlt: z.string(),
      heroCardTitle: z.string(),
      heroCardText: z.string(),
      manifesto: z.string(),
      manifestoCta: link,
      servicesTitle: z.string(),
      visitTitle: z.string(),
      visitLede: z.string(),
      // A step with no image drops the key (or saves null): it shows the calendar card instead.
      visitSteps: z.array(z.object({ title: z.string(), body: z.string(), image: image().nullish(), imageAlt: opt() })).default([]),
      teamTitle: z.string(),
      teamText: z.string(),
      teamCta: link,
      reviewsTitle: z.string(),
      reviewsLabel: z.string(),
      journalTitle: z.string(),
      journalCta: link,
      findTitle: z.string(),
      findImage: image(),
      findImageAlt: z.string(),
      insurance: z.string(),
      parking: z.string(),
      access: z.string(),
      seo: seo(image()),
    }),
});

const about = defineCollection({
  loader: glob({ pattern: 'about.json', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lede: z.string(),
      image: image(),
      imageAlt: z.string(),
      storyTitle: z.string(),
      story: z.array(z.string()).default([]),
      principlesTitle: z.string(),
      principles: z.array(z.object({ icon: z.string().default('clock'), title: z.string(), body: z.string() })).default([]),
      teamTitle: z.string(),
      // Optional overrides: empty means the site-wide call to action band wording (Site settings).
      ctaTitle: opt(),
      ctaText: opt(),
      seo: seo(image()),
    }),
});

export const collections = { services, journal, team, home, about };
