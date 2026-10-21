import { collection, fields } from '@keystatic/core';
import { photo, seoTitle, seoDescription, ALT_HELP } from './fields';

export const journal = collection({
  label: 'Journal (blog posts)',
  path: 'src/content/journal/*',
  slugField: 'title',
  format: { contentField: 'body' },
  entryLayout: 'content',
  columns: ['title', 'date'],
  // "Preview" button in the editor: staging shows drafts too (never the live site).
  previewUrl: 'https://stanventures-psi.fly.dev/linden-dental/journal/{slug}/',
  schema: {
    title: fields.slug({
      name: { label: 'H1 heading (post title)', description: 'The post title. Also used as the H2/H3 on the journal list and home page cards. Required.', validation: { length: { min: 1, max: 110 } } },
      slug: { label: 'URL slug (permalink)', description: 'The post address: /journal/<slug>/. Changing it on a published post breaks old links, so avoid it.' },
    }),
    draft: fields.checkbox({
      label: 'Draft (unpublished)',
      description: 'Drafts appear on staging (with a Draft banner) so you can preview them, and never on the live site. Untick to publish.',
      defaultValue: false,
    }),
    description: fields.text({
      label: 'Excerpt',
      description: 'One sentence. Shown as the intro paragraph under the H1 and on the journal list and home page cards. Also the fallback meta description.',
      multiline: true,
      validation: { length: { min: 1, max: 220 } },
    }),
    date: fields.date({ label: 'Publish date', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
    updatedDate: fields.date({
      label: 'Last modified date',
      description: 'Optional. Set this when you make a meaningful change to a published post. Shown in the byline and sent to Google (dateModified). Leave empty if the post has not changed.',
    }),
    author: fields.relationship({ label: 'Author', description: 'Pick a team member. Required.', collection: 'team', validation: { isRequired: true } }),
    tag: fields.select({
      label: 'Category',
      description: 'Shown above the H1 and on post cards.',
      options: ['Kids', 'Everyday care', 'Costs', 'Treatments', 'News'].map((v) => ({ label: v, value: v })),
      defaultValue: 'Everyday care',
    }),
    cover: photo('Featured image', 'Wide image at the top of the post and on cards. At least 1600px across, under 2 MB. Also the Open Graph image.', 'journal'),
    coverAlt: fields.text({
      label: 'Featured image alt text',
      description: `${ALT_HELP} Required.`,
      validation: { length: { min: 1, max: 160 } },
    }),
    seoTitle: seoTitle(),
    seoDescription: seoDescription(),
    // Standard Markdown (pipe tables, plain images) so Astro renders every element the editor offers.
    body: fields.mdx({
      label: 'Post content',
      description: 'The article body. Use H2 and H3 for subheadings (the H1 is the post title above).',
      extension: 'md',
      options: {
        // H1 is the post title, so the editor offers H2 to H4 only.
        heading: [2, 3, 4],
        image: { directory: 'src/assets/journal', publicPath: '../../assets/journal/', schema: { alt: fields.text({ label: 'Image alt text', description: 'Describe the image for screen readers and Google Images (alt attribute). Required.', validation: { length: { min: 1, max: 160 } } }), title: fields.text({ label: 'Caption (title attribute, optional)' }) } },
      },
    }),
  },
});
