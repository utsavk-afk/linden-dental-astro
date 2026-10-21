import { collection, fields } from '@keystatic/core';
import { ICONS, photo, seoTitle, seoDescription } from './fields';

export const journal = collection({
  label: 'Journal (blog)',
  path: 'src/content/journal/*',
  slugField: 'title',
  format: { contentField: 'body' },
  entryLayout: 'content',
  columns: ['title', 'date'],
  schema: {
    title: fields.slug({ name: { label: 'Title' }, slug: { label: 'URL slug', description: 'The post address: /journal/<slug>/' } }),
    draft: fields.checkbox({ label: 'Draft', description: 'Drafts show on your local preview only and are left out of the published site.', defaultValue: false }),
    description: fields.text({ label: 'Summary', description: 'One sentence under the title and on the journal list.', multiline: true }),
    date: fields.date({ label: 'Publish date', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
    author: fields.relationship({ label: 'Author', collection: 'team', validation: { isRequired: true } }),
    tag: fields.select({
      label: 'Topic',
      options: ['Kids', 'Everyday care', 'Costs', 'Treatments', 'News'].map((v) => ({ label: v, value: v })),
      defaultValue: 'Everyday care',
    }),
    cover: photo('Cover image', 'Wide photo, at least 1600px across.', 'journal'),
    coverAlt: fields.text({ label: 'Cover description (alt text)' }),
    seoTitle: seoTitle(),
    seoDescription: seoDescription(),
    body: fields.markdoc({
      label: 'Article',
      extension: 'md',
      options: {
        image: { directory: 'src/assets/journal', publicPath: '../../assets/journal/' },
      },
    }),
  },
});
