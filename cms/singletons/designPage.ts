import { singleton, fields } from '@keystatic/core';
import { reqText, optText } from '../fields';

// The /design/ design-language page. Colour hex values and CSS token names stay in
// src/data/design.ts because they mirror global.css; only the words live here.
// Keep TOKENS in step with the palette in src/data/design.ts.
const TOKENS = ['--bg', '--bg-2', '--surface', '--ink', '--ink-2', '--accent', '--bloom'].map((t) => ({ label: t.slice(2), value: t }));
const STEPS = ['--step-5', '--step-4', '--step-3', '--step-2', '--step-1', '--step-0'].map((t) => ({ label: t.slice(2), value: t }));

const heading = (section: string) => reqText(`H2 heading (${section})`);
const intro = (section: string) => optText(`Paragraph (${section} intro)`, 'Hidden when empty.', { multiline: true });
const atLeastOne = { length: { min: 1 } };

export const designPage = singleton({
  label: 'Design language page',
  path: 'src/content/pages/designPage',
  format: { data: 'json' },
  schema: {
    title: reqText('H1 heading (hero)'),
    lede: optText('Intro paragraph', 'The paragraph under the H1. Hidden when empty.', { multiline: true }),
    principles: fields.object(
      {
        title: heading('principles'),
        items: fields.array(
          fields.object({ title: reqText('H3 heading'), text: reqText('Paragraph', undefined, { multiline: true }) }),
          { label: 'Principle cards (H3 + paragraph each)', description: 'The first card gets the Blossom highlight. At least one is required.', validation: atLeastOne, itemLabel: (p) => p.fields.title.value || 'Principle' },
        ),
      },
      { label: 'Section: principles' },
    ),
    colour: fields.object(
      {
        title: heading('colour'),
        intro: intro('colour'),
        swatches: fields.array(
          fields.object({
            token: fields.select({ label: 'Colour token', description: 'Which colour this describes. Hex values are set in code (src/data/design.ts).', options: TOKENS, defaultValue: '--bg' }),
            name: optText('Colour name (bold text)', 'Leave empty to show the token name.'),
            use: optText('Paragraph (where it is used)', undefined, { multiline: true }),
          }),
          { label: 'Colour swatches (name + paragraph each)', description: 'Swatches always show in the code order. A colour with no entry here shows its token name only.', itemLabel: (p) => p.fields.name.value || p.fields.token.value },
        ),
      },
      { label: 'Section: colour' },
    ),
    type: fields.object(
      {
        title: heading('type'),
        intro: intro('type'),
        specimens: fields.array(
          fields.object({
            step: fields.select({ label: 'Type size', options: STEPS, defaultValue: '--step-0' }),
            label: reqText('Row label (bold text)'),
            sample: reqText('Sample sentence (shown at that size)'),
          }),
          { label: 'Type specimen rows (label + sample each)', description: 'At least one is required.', validation: atLeastOne, itemLabel: (p) => `${p.fields.label.value || 'Row'}: ${p.fields.sample.value}`.slice(0, 60) },
        ),
      },
      { label: 'Section: typography' },
    ),
    components: fields.object(
      {
        title: heading('components'),
        intro: intro('components'),
        primaryButton: reqText('Button text (demo primary button)'),
        secondaryButton: reqText('Button text (demo secondary button)'),
        textLink: reqText('Link text (demo arrow link)'),
      },
      { label: 'Section: shape and components' },
    ),
    motion: fields.object(
      {
        title: heading('motion'),
        intro: intro('motion'),
        items: fields.array(
          fields.object({
            name: reqText('Effect name (definition term)'),
            why: reqText('Paragraph (why it is there)', undefined, { multiline: true }),
            how: reqText('Paragraph (how it works)', undefined, { multiline: true }),
          }),
          { label: 'Motion effects (name + two paragraphs each)', description: 'At least one is required.', validation: atLeastOne, itemLabel: (p) => p.fields.name.value || 'Effect' },
        ),
      },
      { label: 'Section: motion' },
    ),
    inspiration: fields.object(
      {
        title: heading('inspiration'),
        intro: intro('inspiration'),
        items: fields.array(
          fields.object({
            who: reqText('Studio name (bold text)'),
            where: optText('Location'),
            title: reqText('Link text (project title)'),
            url: fields.url({ label: 'Link URL', description: 'Required.', validation: { isRequired: true } }),
            took: optText('Text (what we took from it)', undefined, { multiline: true }),
          }),
          { label: 'References (studio + link + text each)', description: 'At least one is required.', validation: atLeastOne, itemLabel: (p) => `${p.fields.who.value}: ${p.fields.title.value}`.slice(0, 60) },
        ),
      },
      { label: 'Section: inspiration' },
    ),
    seo: fields.object(
      {
        title: fields.text({ label: 'Meta title', description: 'The <title> tag: shown in Google results and the browser tab. Ideal 50 to 60 characters (70 max). Leave empty to use the H1 heading.', validation: { length: { max: 70 } } }),
        description: fields.text({ label: 'Meta description', description: 'The meta description tag: the grey snippet under the title in Google. Ideal 140 to 160 characters (170 max).', multiline: true, validation: { length: { max: 170 } } }),
      },
      { label: 'SEO (meta tags)' },
    ),
  },
});
