import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

export const home = singleton({
  label: 'Home page',
  path: 'src/content/pages/home',
  format: { data: 'json' },
  schema: {
    heroTitle: fields.text({ label: 'Hero headline (first part)' }),
    heroAccent: fields.text({ label: 'Hero headline (green part)' }),
    heroLede: fields.text({ label: 'Hero intro', description: 'Keep it under about 20 words.', multiline: true }),
    heroImage: photo('Hero photo'),
    heroImageAlt: fields.text({ label: 'Hero photo description (alt text)' }),
    heroCardTitle: fields.text({ label: 'Hero card title' }),
    heroCardText: fields.text({ label: 'Hero card text' }),
    manifesto: fields.text({ label: 'Big statement', multiline: true }),
    servicesTitle: fields.text({ label: 'Services heading' }),
    visitTitle: fields.text({ label: 'First visit heading' }),
    visitLede: fields.text({ label: 'First visit intro', multiline: true }),
    visitSteps: fields.array(
      fields.object({
        title: fields.text({ label: 'Step title' }),
        body: fields.text({ label: 'Step text', multiline: true }),
        image: fields.image({ label: 'Step photo (leave empty for the yellow calendar card)', directory: 'src/assets/photos', publicPath: '../../assets/photos/' }),
        imageAlt: fields.text({ label: 'Photo description (alt text)' }),
      }),
      { label: 'First visit steps', itemLabel: (p) => p.fields.title.value || 'Step' },
    ),
    teamTitle: fields.text({ label: 'Team heading' }),
    teamText: fields.text({ label: 'Team text', multiline: true }),
    reviewsTitle: fields.text({ label: 'Reviews heading' }),
    journalTitle: fields.text({ label: 'Journal heading' }),
    findTitle: fields.text({ label: 'Visit us heading' }),
    findImage: photo('Visit us photo'),
    findImageAlt: fields.text({ label: 'Visit us photo description (alt text)' }),
    insurance: fields.text({ label: 'Insurance line', multiline: true }),
    parking: fields.text({ label: 'Parking line' }),
    access: fields.text({ label: 'Accessibility line' }),
    seo: fields.object({ title: seoTitle(), description: seoDescription(), image: seoImage() }, { label: 'SEO' }),
  },
});
