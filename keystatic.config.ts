// Keystatic CMS: the visual editor for every piece of site content. Each screen's schema
// lives in its own file under cms/ (collections) and cms/singletons/ (one-off pages).
// Local: http://localhost:4321/keystatic during `npm run dev` (edits write to src/content).
// Hosted: stanventures-psi.fly.dev/keystatic (GitHub mode; deploy/sync_linden_cms.mjs in
// psi-monitor copies this file and cms/ and swaps the storage line).
import { config } from '@keystatic/core';
import { services } from './cms/services';
import { journal } from './cms/journal';
import { team } from './cms/team';
import { home } from './cms/singletons/home';
import { about } from './cms/singletons/about';
import { servicesPage } from './cms/singletons/servicesPage';
import { journalPage } from './cms/singletons/journalPage';
import { bookPage } from './cms/singletons/bookPage';
import { notFound } from './cms/singletons/notFound';
import { designPage } from './cms/singletons/designPage';
import { reviews } from './cms/singletons/reviews';
import { settings } from './cms/singletons/settings';
import { redirects } from './cms/singletons/redirects';

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Linden Dental' },
    navigation: {
      Pages: ['home', 'about', 'servicesPage', 'journalPage', 'bookPage', 'notFound', 'designPage'],
      Content: ['services', 'journal', 'team', 'reviews'],
      Settings: ['settings', 'redirects'],
    },
  },
  collections: { services, journal, team },
  singletons: { home, about, servicesPage, journalPage, bookPage, notFound, designPage, reviews, settings, redirects },
});
