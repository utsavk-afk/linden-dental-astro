import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

export const settings = singleton({
  label: 'Site settings and SEO',
  path: 'src/content/settings',
  format: { data: 'json' },
  schema: {
    name: fields.text({ label: 'Practice name' }),
    tagline: fields.text({ label: 'Tagline' }),
    phone: fields.text({ label: 'Phone' }),
    email: fields.text({ label: 'Email' }),
    addressLine1: fields.text({ label: 'Street address' }),
    addressLine2: fields.text({ label: 'City, state and ZIP', description: 'Format: Portland, OR 97202 (used for Google structured data).' }),
    mapLink: fields.url({ label: 'Directions link' }),
    hours: fields.array(
      fields.object({ days: fields.text({ label: 'Days', description: 'For example: Mon to Thu, or Saturday' }), time: fields.text({ label: 'Time', description: 'For example: 7:30 am to 6:00 pm' }) }),
      { label: 'Opening hours', itemLabel: (p) => `${p.fields.days.value} ${p.fields.time.value}` },
    ),
    bookLabel: fields.text({ label: 'Booking button label' }),
    seoTitleSuffix: fields.text({ label: 'SEO title suffix', description: 'Added after page titles, for example: | Linden Dental Studio' }),
    seoDefaultDescription: fields.text({ label: 'Default SEO description', multiline: true }),
    twitterHandle: fields.text({ label: 'X / Twitter handle (optional)', description: 'For example: @lindendental' }),
  },
});
