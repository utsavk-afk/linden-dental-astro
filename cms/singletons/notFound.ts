import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

// TODO(agent): define the schema for this screen.
export const notFound = singleton({
  label: 'notFound',
  path: 'src/content/pages/notFound',
  format: { data: 'json' },
  schema: {},
});
