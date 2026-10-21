import { singleton, fields } from '@keystatic/core';
import { cta, reqText, optText } from '../fields';

// Field keys mirror src/content/settings.json exactly (names and nesting), or the CMS shows empty fields.
const linkItem = (label: string, description?: string) =>
  fields.array(
    fields.object({
      label: reqText('Navigation label (link text)'),
      link: reqText('Link URL', 'A page on this site like /about/, a full URL like https://..., or tel:/mailto:'),
    }),
    { label, ...(description ? { description } : {}), itemLabel: (p) => `${p.fields.label.value || 'Link'} (${p.fields.link.value || 'no link'})` },
  );

export const settings = singleton({
  label: 'Site settings and SEO',
  path: 'src/content/settings',
  format: { data: 'json' },
  schema: {
    // Practice details
    name: reqText('Site title (practice name)', 'Used in meta titles, the footer and Google structured data (schema).'),
    logoWord: reqText('Logo text: main word', 'The large word beside the leaf, for example: Linden'),
    logoSub: optText('Logo text: small line', 'The small capitals under it, for example: Dental Studio'),
    tagline: reqText('Tagline', 'Like the WordPress tagline. Shown at the start of the footer paragraph, followed by a full stop.'),
    phone: reqText('Phone number', 'Shown as typed; the tel: link is built from the digits.'),
    email: reqText('Email address', 'Shown in the footer as a mailto: link.'),
    addressLine1: reqText('Address line 1 (street)'),
    addressLine2: reqText('Address line 2 (city, state and ZIP)', 'Format: Portland, OR 97202 (used for Google structured data).'),
    mapLink: fields.url({ label: 'Google Maps link (directions URL)', description: 'Where the "Get directions" links go, for example a Google Maps link. Required.', validation: { isRequired: true } }),
    hours: fields.array(
      fields.object({
        days: reqText('Days (definition term)', 'For example: Mon to Thu, or Saturday'),
        time: reqText('Opening times', 'For example: 7:30 am to 6:00 pm'),
      }),
      { label: 'Opening hours (days + times each)', description: 'Shown in the footer and the home page visit us section. At least one row is required.', validation: { length: { min: 1 } }, itemLabel: (p) => `${p.fields.days.value} ${p.fields.time.value}` },
    ),

    // Navigation and calls to action
    nav: linkItem('Header menu (menu items)', 'The top navigation links. Also repeated in the footer contact column and the mobile menu.'),
    primaryCta: cta('Button: book a visit (site-wide)', 'The green button in the header menu, the hero, the visit us section and the call to action band.'),
    ctaBand: fields.object(
      {
        title: reqText('H2 heading'),
        text: reqText('Paragraph', undefined, { multiline: true }),
      },
      { label: 'Call to action band (bottom of page, default)', description: 'The green "Ready when you are" band near the bottom of pages. Some pages set their own wording.' },
    ),

    // Footer
    footer: fields.object(
      {
        intro: optText('Paragraph (under the logo)', 'Shown after the tagline under the logo.', { multiline: true }),
        visitHeading: reqText('H2 heading (address column)'),
        hoursHeading: reqText('H2 heading (hours column)'),
        contactHeading: reqText('H2 heading (contact column)'),
        directionsLabel: reqText('Link text (get directions)', 'Used in the footer and the home page visit us section.'),
        extraLinks: linkItem('Footer menu (extra contact column links)', 'Shown after the header menu links in the footer contact column.'),
        note: optText('Footer bottom line (small print)', 'Bottom-right line of the footer, next to the copyright.'),
      },
      { label: 'Footer', description: 'Footer column headings and text. Address, hours and phone come from the practice details above.' },
    ),

    // Small interface words
    labels: fields.object(
      {
        skipLink: reqText('Accessibility label: skip to content link (screen reader text)', 'Hidden link for keyboard users that jumps to the main content.'),
        menu: reqText('Accessibility label: mobile menu button (screen reader text)', 'Read out by screen readers.'),
        themeToggle: reqText('Accessibility label: dark theme button (aria-label)', 'Read out by screen readers.'),
        minRead: reqText('Reading time text', 'Shown after the minutes, for example: 4 min read'),
        stepOf: reqText('Step counter text (home page first visit steps)', 'Use {n} for the step number and {total} for the number of steps, for example: Step {n} of {total}'),
        pause: reqText('Button text: pause reviews'),
        play: reqText('Button text: play reviews'),
        mainNav: reqText('Accessibility label: header menu (aria-label)', 'Read out by screen readers for the top navigation.'),
        homeLink: reqText('Accessibility label: logo home link (aria-label)', 'Read out by screen readers. Use {name} for the practice name.'),
        portraitAlt: reqText('Image alt text (team portraits)', 'Alt attribute for every team portrait. Use {name} for the person, for example: Portrait of {name}'),
      },
      { label: 'Interface labels and accessibility text', description: 'Short words used across the site, including text only screen readers hear.' },
    ),

    // SEO
    seoDefaultTitle: reqText('Default meta title (home page)', 'The <title> tag for the home page and any page without its own meta title. Ideal 50 to 60 characters.'),
    seoTitleSuffix: optText('Meta title separator and suffix', 'Added after every meta title, like the Yoast separator and site title, for example: | Linden Dental Studio'),
    seoDefaultDescription: reqText('Default meta description', 'The meta description tag for any page without its own. Ideal 140 to 160 characters.', { multiline: true }),
    twitterHandle: optText('Twitter / X handle (twitter:site)', 'For example: @lindendental'),
  },
});
