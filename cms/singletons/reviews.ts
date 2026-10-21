import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

export const reviews = singleton({
  label: 'Reviews',
  path: 'src/content/reviews',
  format: { data: 'json' },
  schema: {
    items: fields.array(
      fields.object({ quote: fields.text({ label: 'Quote', description: 'Keep it to three lines or less.', multiline: true }), name: fields.text({ label: 'Name' }), where: fields.text({ label: 'Neighbourhood' }) }),
      { label: 'Reviews', itemLabel: (p) => p.fields.name.value || 'Review' },
    ),
  },
});
