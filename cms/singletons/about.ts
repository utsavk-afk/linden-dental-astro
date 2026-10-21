import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

export const about = singleton({
  label: 'About page',
  path: 'src/content/pages/about',
  format: { data: 'json' },
  schema: {
    title: fields.text({ label: 'Headline' }),
    lede: fields.text({ label: 'Intro', multiline: true }),
    image: photo('Main photo'),
    imageAlt: fields.text({ label: 'Main photo description (alt text)' }),
    storyTitle: fields.text({ label: 'Story heading' }),
    story: fields.array(fields.text({ label: 'Paragraph', multiline: true }), { label: 'Story paragraphs', itemLabel: (p) => (p.value || '').slice(0, 60) || 'Paragraph' }),
    principlesTitle: fields.text({ label: 'Principles heading' }),
    principles: fields.array(
      fields.object({ icon: fields.select({ label: 'Icon', options: ICONS, defaultValue: 'clock' }), title: fields.text({ label: 'Title' }), body: fields.text({ label: 'Text', multiline: true }) }),
      { label: 'Principles', itemLabel: (p) => p.fields.title.value || 'Principle' },
    ),
    teamTitle: fields.text({ label: 'Team heading' }),
    ctaTitle: fields.text({ label: 'Bottom banner heading' }),
    ctaText: fields.text({ label: 'Bottom banner text', multiline: true }),
    seo: fields.object({ title: seoTitle(), description: seoDescription(), image: seoImage() }, { label: 'SEO' }),
  },
});
