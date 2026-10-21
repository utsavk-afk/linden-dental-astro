import { collection, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription } from './fields';

export const team = collection({
  label: 'Team',
  path: 'src/content/team/*',
  slugField: 'name',
  format: { data: 'json' },
  columns: ['name', 'role'],
  schema: {
    name: fields.slug({ name: { label: 'Name', description: 'Include letters after the name, for example: Dr. Ana Whitlock, DDS' } }),
    role: fields.text({ label: 'Role' }),
    photo: photo('Portrait', 'Portrait orientation works best.', 'team'),
    bio: fields.text({ label: 'Bio', multiline: true }),
    outside: fields.text({ label: 'Outside work', description: 'One human detail, shown with a leaf icon.' }),
    order: fields.integer({ label: 'Order', defaultValue: 10 }),
  },
});
