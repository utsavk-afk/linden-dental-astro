import { singleton, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription, seoImage, cta } from '../fields';

// TODO(agent): define the schema for this screen.
export const journalPage = singleton({
  label: 'journalPage',
  path: 'src/content/pages/journalPage',
  format: { data: 'json' },
  schema: {},
});
