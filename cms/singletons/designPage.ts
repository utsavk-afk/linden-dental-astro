import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

// TODO(agent): define the schema for this screen.
export const designPage = singleton({
  label: 'designPage',
  path: 'src/content/pages/designPage',
  format: { data: 'json' },
  schema: {},
});
