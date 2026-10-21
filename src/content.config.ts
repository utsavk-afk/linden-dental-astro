import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      icon: z.string(),
      order: z.number(),
      photo: image(),
      photoAlt: z.string(),
      price: z.string(),
      duration: z.string(),
      steps: z.array(z.object({ title: z.string(), body: z.string() })),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      author: reference('team'),
      draft: z.boolean().default(false),
      cover: image(),
      coverAlt: z.string(),
      readMinutes: z.number().optional(), // calculated from the article when empty
      tag: z.string(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
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
      outside: z.string(),
      order: z.number(),
    }),
});

// Page copy edited in the CMS (Keystatic singletons). Each is a single JSON file in
// src/content/pages; image paths are relative to that file, so Astro optimises them.
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
      servicesTitle: z.string(),
      visitTitle: z.string(),
      visitLede: z.string(),
      visitSteps: z.array(z.object({ title: z.string(), body: z.string(), image: image().nullable(), imageAlt: z.string().default('') })),
      teamTitle: z.string(),
      teamText: z.string(),
      reviewsTitle: z.string(),
      journalTitle: z.string(),
      findTitle: z.string(),
      findImage: image(),
      findImageAlt: z.string(),
      insurance: z.string(),
      parking: z.string(),
      access: z.string(),
      seo: z.object({ title: z.string().default(''), description: z.string().default(''), image: image().nullable().default(null) }).default({ title: '', description: '', image: null }),
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
      story: z.array(z.string()),
      principlesTitle: z.string(),
      principles: z.array(z.object({ icon: z.string(), title: z.string(), body: z.string() })),
      teamTitle: z.string(),
      ctaTitle: z.string(),
      ctaText: z.string(),
      seo: z.object({ title: z.string().default(''), description: z.string().default(''), image: image().nullable().default(null) }).default({ title: '', description: '', image: null }),
    }),
});

export const collections = { services, journal, team, home, about };
