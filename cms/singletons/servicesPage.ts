import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

// TODO(agent): define the schema for this screen.
export const servicesPage = singleton({
  label: 'servicesPage',
  path: 'src/content/pages/servicesPage',
  format: { data: 'json' },
  schema: {},
});
