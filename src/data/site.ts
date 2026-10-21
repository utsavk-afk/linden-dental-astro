// Practice details. Edit them in the CMS (Keystatic > Site settings) or in
// src/content/settings.json; this file only derives links from them.
// Linden Dental Studio is a fictional practice. Phone uses the reserved 555-01xx range.
import { url } from '../lib/url';
import settings from '../content/settings.json';

export const site = {
  name: settings.name,
  short: settings.name.split(' ')[0],
  tagline: settings.tagline,
  phone: settings.phone,
  phoneHref: 'tel:+1' + settings.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''),
  email: settings.email,
  address: [settings.addressLine1, settings.addressLine2].filter(Boolean),
  mapHref: settings.mapLink,
  hours: settings.hours,
  nav: [
    { href: url('/about/'), label: 'About' },
    { href: url('/services/'), label: 'Services' },
    { href: url('/journal/'), label: 'Journal' },
  ],
  cta: { href: url('/book/'), label: settings.bookLabel },
};
