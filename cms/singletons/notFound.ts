import { singleton, fields } from '@keystatic/core';
import { cta, reqText, optText } from '../fields';

// The 404 page shown for any broken or old link.
export const notFound = singleton({
  label: 'Page not found (404)',
  path: 'src/content/pages/notFound',
  format: { data: 'json' },
  schema: {
    pageTitle: optText('Meta title', 'The <title> tag shown in the browser tab. The meta title separator and suffix from Site settings is added after it. Leave empty to use the H1 heading.'),
    title: reqText('H1 heading'),
    lede: optText('Intro paragraph', 'The paragraph under the H1. Hidden when empty.', { multiline: true }),
    primary: cta('Button: main action'),
    secondary: cta('Link: second action', 'Optional. Leave the link text empty to hide it.', 'link', false),
  },
});
