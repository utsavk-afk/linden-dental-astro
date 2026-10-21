import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, ALT_HELP, reqText, optText } from '../fields';

export const about = singleton({
  label: 'About page',
  path: 'src/content/pages/about',
  format: { data: 'json' },
  schema: {
    title: reqText('H1 heading (hero)'),
    lede: reqText('Intro paragraph', 'The paragraph under the H1.', { multiline: true }),
    image: photo('Image (hero)', 'The large photo beside the H1. Also the default Open Graph image.', 'pages/about'),
    imageAlt: reqText('Image alt text (hero)', ALT_HELP),
    storyTitle: reqText('H2 heading (our story)'),
    story: fields.array(reqText('Paragraph', undefined, { multiline: true }), { label: 'Paragraphs (our story)', description: 'At least one paragraph is required.', validation: { length: { min: 1 } }, itemLabel: (p) => (p.value || '').slice(0, 60) || 'Paragraph' }),
    principlesTitle: reqText('H2 heading (principles)'),
    principles: fields.array(
      fields.object({ icon: fields.select({ label: 'Icon', options: ICONS, defaultValue: 'clock' }), title: reqText('H3 heading'), body: reqText('Paragraph', undefined, { multiline: true }) }),
      { label: 'Principles (icon + H3 + paragraph each)', description: 'At least one principle is required.', validation: { length: { min: 1 } }, itemLabel: (p) => p.fields.title.value || 'Principle' },
    ),
    teamTitle: reqText('H2 heading (team)', 'Team members are edited under Content > Team.'),
    ctaTitle: optText('Call to action band: H2 heading', 'The green band at the bottom of the page. Leave empty to use the default from Site settings.'),
    ctaText: optText('Call to action band: paragraph', 'Leave empty to use the default from Site settings.', { multiline: true }),
    seo: fields.object({ title: seoTitle(), description: seoDescription(), image: seoImage('pages/about') }, { label: 'SEO (meta tags)', description: 'All optional: empty fields fall back to the site defaults and the hero image.' }),
  },
});
