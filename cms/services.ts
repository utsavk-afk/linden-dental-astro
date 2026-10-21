import { collection, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription } from './fields';

export const services = collection({
  label: 'Services',
  path: 'src/content/services/*',
  slugField: 'title',
  format: { contentField: 'body' },
  entryLayout: 'content',
  columns: ['title', 'order'],
  schema: {
    title: fields.slug({ name: { label: 'Title' }, slug: { label: 'URL slug', description: 'The page address: /services/<slug>/' } }),
    summary: fields.text({ label: 'Summary', description: 'One or two sentences. Used on cards and the home list.', multiline: true }),
    order: fields.integer({ label: 'Order', description: 'Lower numbers show first.', defaultValue: 10 }),
    icon: fields.select({ label: 'Icon', options: ICONS, defaultValue: 'tooth' }),
    photo: photo('Photo', undefined, 'services'),
    photoAlt: fields.text({ label: 'Photo description (alt text)', description: 'Describe the photo for screen readers and Google Images.' }),
    price: fields.text({ label: 'Price', description: 'Plain and specific, for example: $185 without insurance.' }),
    duration: fields.text({ label: 'Time', description: 'For example: 60 minutes' }),
    steps: fields.array(
      fields.object({ title: fields.text({ label: 'Step title' }), body: fields.text({ label: 'Step text', multiline: true }) }),
      { label: 'What happens (steps)', itemLabel: (p) => p.fields.title.value || 'Step' },
    ),
    faqs: fields.array(
      fields.object({ q: fields.text({ label: 'Question' }), a: fields.text({ label: 'Answer', multiline: true }) }),
      { label: 'FAQs', description: 'Also published to Google as FAQ structured data.', itemLabel: (p) => p.fields.q.value || 'Question' },
    ),
    seoTitle: seoTitle(),
    seoDescription: seoDescription(),
    body: fields.markdoc({ label: 'Page text', extension: 'md' }),
  },
});
