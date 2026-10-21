import { collection, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, ALT_HELP, reqText, order } from './fields';

export const services = collection({
  label: 'Services',
  path: 'src/content/services/*',
  slugField: 'title',
  format: { contentField: 'body' },
  entryLayout: 'content',
  columns: ['title', 'order'],
  previewUrl: 'https://stanventures-psi.fly.dev/linden-dental/services/{slug}/',
  schema: {
    title: fields.slug({
      name: { label: 'H1 heading (service name)', description: 'The service name. Also the H2 on the services page cards. Required.', validation: { length: { min: 1, max: 110 } } },
      slug: { label: 'URL slug (permalink)', description: 'The page address: /services/<slug>/' },
    }),
    summary: reqText('Excerpt', 'One or two sentences. Shown as the intro paragraph under the H1, on the services page cards and the home page list. Also the fallback meta description.', { multiline: true }),
    order: order(),
    icon: fields.select({ label: 'Icon', options: ICONS, defaultValue: 'tooth' }),
    photo: photo('Featured image', 'Shown beside the H1 and on the services page cards. Also the Open Graph image.', 'services'),
    photoAlt: fields.text({ label: 'Featured image alt text', description: `${ALT_HELP} Required.`, validation: { length: { min: 1, max: 160 } } }),
    price: reqText('Price', 'Shown under the intro paragraph. The cards show the text up to the first full stop, so put the headline price first, for example: $185 without insurance. Usually covered by PPO plans.'),
    duration: reqText('Appointment length', 'For example: 60 minutes'),
    steps: fields.array(
      fields.object({ title: reqText('H3 heading (step title)'), body: reqText('Paragraph (step text)', undefined, { multiline: true }) }),
      { label: 'Steps (H3 + paragraph each)', description: 'The numbered "what happens" list. At least one step is required.', validation: { length: { min: 1 } }, itemLabel: (p) => p.fields.title.value || 'Step' },
    ),
    faqs: fields.array(
      fields.object({ q: reqText('Question'), a: reqText('Answer (paragraph)', undefined, { multiline: true }) }),
      { label: 'FAQs (question + answer)', description: 'Shown as an accordion. Also published to Google as FAQ schema (structured data). Optional: with no questions the FAQ section is hidden.', itemLabel: (p) => p.fields.q.value || 'Question' },
    ),
    seoTitle: seoTitle(),
    seoDescription: seoDescription(),
    // Standard Markdown so Astro renders everything the editor offers.
    body: fields.mdx({
      label: 'Page content',
      description: 'The main text under the hero. Use H2 and H3 for subheadings (the H1 is the service name above).',
      extension: 'md',
      options: {
        heading: [2, 3, 4],
        image: {
          directory: 'src/assets/services',
          publicPath: '../../assets/services/',
          schema: {
            alt: fields.text({ label: 'Image alt text', description: 'Describe the image for screen readers and Google Images (alt attribute). Required.', validation: { length: { min: 1, max: 160 } } }),
            title: fields.text({ label: 'Caption (title attribute, optional)' }),
          },
        },
      },
    }),
  },
});
