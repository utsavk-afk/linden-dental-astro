// Shared Keystatic field helpers for the Linden Dental CMS.
import { fields } from '@keystatic/core';

export const ICONS = [
  'tooth', 'smiley', 'hand-heart', 'shield-check', 'first-aid-kit', 'sparkle', 'sun', 'clock',
  'wallet', 'hand-waving', 'chat-circle', 'heartbeat', 'baby', 'leaf', 'calendar-blank',
].map((v) => ({ label: v, value: v }));

// Image fields read and write web-sized photos in src/assets/photos (Astro optimises them).
// publicPath is relative to the content file, which is two folders below src.
export const photo = (label: string, description?: string, dir = 'photos') =>
  fields.image({ label, description, directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/`, validation: { isRequired: true } });

export const seoTitle = () =>
  fields.text({ label: 'SEO title', description: 'Shown in Google results and browser tabs. Aim for 50 to 60 characters. Leave empty to use the page title.' });
export const seoDescription = () =>
  fields.text({ label: 'SEO description', description: 'The grey snippet under the title in Google. Aim for 140 to 160 characters. Leave empty to use the summary.', multiline: true });
export const seoImage = () =>
  fields.image({ label: 'Social share image (optional)', description: 'Shown when the page is shared on LinkedIn, Facebook, iMessage. Defaults to the main photo.', directory: 'src/assets/photos', publicPath: '../../assets/photos/' });

/** A call-to-action: the button/link text plus where it goes. */
export const cta = (label: string, description?: string) =>
  fields.object(
    {
      label: fields.text({ label: 'Text' }),
      link: fields.text({ label: 'Link', description: 'A page on this site like /book/ or /services/kids/, a full URL like https://..., or tel:/mailto:' }),
    },
    { label, ...(description ? { description } : {}) },
  );
