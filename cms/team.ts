import { collection, fields } from '@keystatic/core';
import { photo, reqText, optText, order } from './fields';

export const team = collection({
  label: 'Team',
  path: 'src/content/team/*',
  slugField: 'name',
  format: { data: 'json' },
  columns: ['name', 'role'],
  schema: {
    name: fields.slug({
      name: {
        label: 'H3 heading (name)',
        description: 'Shown as the H3 on the About page and in the author box. Include letters after the name, for example: Dr. Ana Whitlock, DDS. Required.',
        validation: { length: { min: 1, max: 80 } },
      },
      slug: {
        label: 'URL slug (ID)',
        description: 'Warning: this is the ID journal posts use for their author. Renaming it breaks the author on every post this person wrote (the build stops) until you re-select them as the author on each post. Set it once and leave it.',
      },
    }),
    role: reqText('Paragraph (job title)', 'Shown under the name. Also fills {role} in the journal author box.'),
    photo: photo('Image (portrait)', 'Portrait orientation works best. Alt text is set in Site settings (Accessibility label: team portrait alt text).', 'team'),
    bio: reqText('Paragraph (bio)', 'The first sentence is reused in the journal author box.', { multiline: true }),
    outside: optText('Paragraph (outside work)', 'One human detail, shown with a leaf icon on the About page. Leave empty to hide it.'),
    order: order(),
  },
});
