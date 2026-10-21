import { singleton, fields } from '@keystatic/core';
import { reqText, optText } from '../fields';

// The /services/ listing page, plus the labels shared by every service detail page.
// The services themselves are edited under Content > Services.
export const servicesPage = singleton({
  label: 'Services page',
  path: 'src/content/pages/servicesPage',
  format: { data: 'json' },
  schema: {
    title: reqText('H1 heading (hero)'),
    lede: optText('Intro paragraph', 'The paragraph under the H1. Hidden when empty.', { multiline: true }),
    ctaTitle: optText('Call to action band: H2 heading', 'The green band at the bottom of the page. Leave empty to use the default from Site settings.'),
    ctaText: optText('Call to action band: paragraph', 'Leave empty to use the default from Site settings.', { multiline: true }),
    detail: fields.object(
      {
        backLabel: reqText('Link text (back to services)', 'The link above the H1 that returns to the services list.'),
        costLabel: reqText('Label: price', 'Shown before the price under the intro paragraph, for example: Cost'),
        timeLabel: reqText('Label: appointment length', 'Shown before the appointment length, for example: Time'),
        stepsTitle: reqText('H2 heading (steps)', 'Above the numbered steps.'),
        faqTitle: reqText('H2 heading (FAQs)', 'Above the FAQ list (hidden when a service has no questions).'),
        moreTitle: reqText('H2 heading (other services)', 'Above the three links to other services.'),
        ctaTitle: optText('Call to action band: H2 heading', 'The green band at the bottom of every service page. Leave empty to use the default from Site settings.'),
        ctaText: optText('Call to action band: paragraph', 'Leave empty to use the default from Site settings.', { multiline: true }),
      },
      { label: 'Single service template', description: 'Labels shared by every individual service page. The Book a visit button comes from Settings.' },
    ),
    seo: fields.object(
      {
        title: fields.text({ label: 'Meta title', description: 'The <title> tag: shown in Google results and the browser tab. Ideal 50 to 60 characters (70 max). Leave empty to use the H1 heading.', validation: { length: { max: 70 } } }),
        description: fields.text({ label: 'Meta description', description: 'The meta description tag: the grey snippet under the title in Google. Ideal 140 to 160 characters (170 max). Leave empty to use the default.', multiline: true, validation: { length: { max: 170 } } }),
      },
      { label: 'SEO (meta tags)' },
    ),
  },
});
