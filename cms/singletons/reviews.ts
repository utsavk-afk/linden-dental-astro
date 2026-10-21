import { singleton, fields } from '@keystatic/core';
import { reqText, optText } from '../fields';

export const reviews = singleton({
  label: 'Reviews',
  path: 'src/content/reviews',
  format: { data: 'json' },
  schema: {
    items: fields.array(
      fields.object({
        quote: reqText('Blockquote (review text)', 'Keep it to three lines or less.', { multiline: true }),
        name: reqText('Reviewer name (caption)'),
        where: optText('Reviewer neighbourhood (caption)', 'Shown after the name.'),
      }),
      { label: 'Reviews (blockquote + name each)', description: 'The scrolling reviews strip on the home page. The strip is hidden when there are no reviews.', itemLabel: (p) => p.fields.name.value || 'Review' },
    ),
  },
});
