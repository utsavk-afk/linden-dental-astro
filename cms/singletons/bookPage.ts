import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

// TODO(agent): define the schema for this screen.
export const bookPage = singleton({
  label: 'bookPage',
  path: 'src/content/pages/bookPage',
  format: { data: 'json' },
  schema: {},
});
