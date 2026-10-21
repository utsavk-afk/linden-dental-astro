import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
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
    }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      author: z.string(),
      cover: image(),
      coverAlt: z.string(),
      readMinutes: z.number(),
      tag: z.string(),
    }),
});

const team = defineCollection({
  loader: file('./src/content/team.json'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
      photo: image(),
      bio: z.string(),
      outside: z.string(),
      order: z.number(),
    }),
});

export const collections = { services, journal, team };
