import { singleton, fields } from '@keystatic/core';
import { reqText, optText } from '../fields';

// The /journal/ listing page, plus the labels shared by every journal post.
// The posts themselves are edited under Content > Journal; "min read" is in Settings > Labels.
export const journalPage = singleton({
  label: 'Journal page',
  path: 'src/content/pages/journalPage',
  format: { data: 'json' },
  schema: {
    title: reqText('H1 heading (hero)'),
    lede: optText('Intro paragraph', 'The paragraph under the H1. Hidden when empty.', { multiline: true }),
    readLabel: reqText('Link text (featured post)', 'The arrow link on the large featured post at the top.'),
    post: fields.object(
      {
        backLabel: reqText('Link text (back to journal)', 'The link above the post H1 that returns to the journal.'),
        authorLine: reqText('Author box: paragraph start', 'Shown before the first sentence of the author bio. {role} is replaced with the author’s role from Content > Team.'),
        nextTitle: reqText('H2 heading (more posts)', 'Above the two suggested posts at the end of each post.'),
        updatedLabel: reqText('Last modified label', 'Shown in the byline before the last modified date on posts that have one, for example: Updated'),
        draftBanner: reqText('Draft notice', 'Shown at the top of draft posts on staging previews.'),
        ctaTitle: optText('Call to action band: H2 heading', 'The green band at the bottom of every post. Leave empty to use the default from Site settings.'),
        ctaText: optText('Call to action band: paragraph', 'Leave empty to use the default from Site settings.', { multiline: true }),
      },
      { label: 'Single post template', description: 'Labels shared by every journal post.' },
    ),
    seo: fields.object(
      {
        title: fields.text({ label: 'Meta title', description: 'The <title> tag: shown in Google results and the browser tab. Ideal 50 to 60 characters (70 max). Leave empty to use the H1 heading.', validation: { length: { max: 70 } } }),
        description: fields.text({ label: 'Meta description', description: 'The meta description tag: the grey snippet under the title in Google. Ideal 140 to 160 characters (170 max). Leave empty to use the intro paragraph.', multiline: true, validation: { length: { max: 170 } } }),
      },
      { label: 'SEO (meta tags)' },
    ),
  },
});
