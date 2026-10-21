// Shared Keystatic field helpers for the Linden Dental CMS.
// Labels follow WordPress / Yoast wording: the HTML element first (H1 heading, Paragraph, Meta title), then a plain name.
import { fields } from '@keystatic/core';

export const ICONS = [
  'tooth', 'smiley', 'hand-heart', 'shield-check', 'first-aid-kit', 'sparkle', 'sun', 'clock',
  'wallet', 'hand-waving', 'chat-circle', 'heartbeat', 'baby', 'leaf', 'calendar-blank',
].map((v) => ({ label: v, value: v }));

// Image fields read and write web-sized photos in src/assets/photos (Astro optimises them).
// publicPath is relative to the content file, which is two folders below src.
// Every screen gets its OWN image folder (src/assets/<dir>). Keystatic renames and deletes
// images on save, so screens must never share a folder (sharing broke the site in testing).
export const photo = (label: string, description: string | undefined, dir: string) =>
  fields.image({ label, description, directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/`, validation: { isRequired: true } });

/** Standard description for every alt text field. */
export const ALT_HELP = 'Describe the image for screen readers and Google Images (alt attribute).';

// Keystatic deletes a cleared text field from the file instead of saving "". Anything the site
// shows must therefore be refused empty here (the site's schema would fail the build otherwise).
// Fields left optional are ones the site falls back from (meta tags, CTA band overrides, captions).
const withRequired = (description?: string) => (description ? `${description} Required.` : 'Required.');

/** A text field the site needs (cannot be saved empty). */
export const reqText = (label: string, description?: string, opts: { multiline?: boolean; max?: number } = {}) =>
  fields.text({
    label,
    description: withRequired(description),
    ...(opts.multiline ? { multiline: true } : {}),
    validation: { length: { min: 1, ...(opts.max ? { max: opts.max } : {}) } },
  });

/** An optional text field: the site hides it or falls back when it is empty. */
export const optText = (label: string, description?: string, opts: { multiline?: boolean; max?: number } = {}) =>
  fields.text({
    label,
    description: description ? `${description} Optional.` : 'Optional.',
    ...(opts.multiline ? { multiline: true } : {}),
    ...(opts.max ? { validation: { length: { max: opts.max } } } : {}),
  });

/** Menu order number (cannot be cleared). */
export const order = () =>
  fields.integer({ label: 'Menu order', description: 'Lower numbers show first. Required.', defaultValue: 10, validation: { isRequired: true } });

export const seoTitle = () =>
  fields.text({ label: 'Meta title', description: 'The <title> tag: shown in Google results and the browser tab. Ideal 50 to 60 characters. Leave empty to fall back to the H1 heading or the default meta title.', validation: { length: { max: 70 } } });
export const seoDescription = () =>
  fields.text({ label: 'Meta description', description: 'The meta description tag: the grey snippet under the title in Google. Ideal 140 to 160 characters. Leave empty to fall back to the excerpt or the default meta description.', multiline: true, validation: { length: { max: 170 } } });
export const seoImage = (dir: string) =>
  fields.image({ label: 'Open Graph image (og:image)', description: 'Shown when the page is shared on LinkedIn, Facebook, X or iMessage. Optional: defaults to the main image.', directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/` });

/**
 * A call to action: the visible text plus where it goes.
 * kind 'button' gives "Button text" / "Button link (URL)"; kind 'link' gives "Link text" / "Link URL".
 * required (default true): both parts must be filled in. Pass false only where the page hides
 * the link when its text is empty.
 */
export const cta = (label: string, description?: string, kind: 'button' | 'link' = 'button', required = true) => {
  const linkHelp = 'A page on this site like /book/ or /services/kids/, a full URL like https://..., or tel:/mailto:';
  const textLabel = kind === 'button' ? 'Button text' : 'Link text';
  const linkLabel = kind === 'button' ? 'Button link (URL)' : 'Link URL';
  return fields.object(
    {
      label: required ? reqText(textLabel) : optText(textLabel, 'Leave empty to hide this link.'),
      link: required ? reqText(linkLabel, linkHelp) : fields.text({ label: linkLabel, description: linkHelp }),
    },
    { label, ...(description ? { description } : {}) },
  );
};
