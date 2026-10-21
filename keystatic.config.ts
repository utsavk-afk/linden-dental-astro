// Keystatic CMS: the visual editor for every piece of site content.
// Open http://localhost:4321/keystatic while `npm run dev` is running. Edits are written
// straight to the files in src/content (and images to src/assets), so they show up on the
// local site immediately and ship with the next commit + deploy.
import { config, fields, collection, singleton } from '@keystatic/core';

const ICONS = [
  'tooth', 'smiley', 'hand-heart', 'shield-check', 'first-aid-kit', 'sparkle', 'sun', 'clock',
  'wallet', 'hand-waving', 'chat-circle', 'heartbeat', 'baby', 'leaf', 'calendar-blank',
].map((v) => ({ label: v, value: v }));

// Image fields read and write web-sized photos in src/assets/photos (Astro optimises them).
// publicPath is relative to the content file, which is two folders below src.
const photo = (label: string, description?: string, dir = 'photos') =>
  fields.image({ label, description, directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/`, validation: { isRequired: true } });

const seoTitle = () =>
  fields.text({ label: 'SEO title', description: 'Shown in Google results and browser tabs. Aim for 50 to 60 characters. Leave empty to use the page title.' });
const seoDescription = () =>
  fields.text({ label: 'SEO description', description: 'The grey snippet under the title in Google. Aim for 140 to 160 characters. Leave empty to use the summary.', multiline: true });
const seoImage = () =>
  fields.image({ label: 'Social share image (optional)', description: 'Shown when the page is shared on LinkedIn, Facebook, iMessage. Defaults to the main photo.', directory: 'src/assets/photos', publicPath: '../../assets/photos/' });

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Linden Dental' },
    navigation: {
      Pages: ['home', 'about', 'listings'],
      Content: ['services', 'journal', 'team', 'reviews'],
      Settings: ['settings'],
    },
  },

  collections: {
    services: collection({
      label: 'Services',
      path: 'src/content/services/*',
      slugField: 'title',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title' }, slug: { label: 'URL slug', description: 'The page address: /services/<slug>/' } }),
        summary: fields.text({ label: 'Summary', description: 'One or two sentences. Used on cards and the home list.', multiline: true }),
        order: fields.integer({ label: 'Order', description: 'Lower numbers show first.', defaultValue: 10 }),
        icon: fields.select({ label: 'Icon', options: ICONS, defaultValue: 'tooth' }),
        photo: photo('Photo', undefined, 'services'),
        photoAlt: fields.text({ label: 'Photo description (alt text)', description: 'Describe the photo for screen readers and Google Images.' }),
        price: fields.text({ label: 'Price', description: 'Plain and specific, for example: $185 without insurance.' }),
        duration: fields.text({ label: 'Time', description: 'For example: 60 minutes' }),
        steps: fields.array(
          fields.object({ title: fields.text({ label: 'Step title' }), body: fields.text({ label: 'Step text', multiline: true }) }),
          { label: 'What happens (steps)', itemLabel: (p) => p.fields.title.value || 'Step' },
        ),
        faqs: fields.array(
          fields.object({ q: fields.text({ label: 'Question' }), a: fields.text({ label: 'Answer', multiline: true }) }),
          { label: 'FAQs', description: 'Also published to Google as FAQ structured data.', itemLabel: (p) => p.fields.q.value || 'Question' },
        ),
        seoTitle: seoTitle(),
        seoDescription: seoDescription(),
        body: fields.markdoc({ label: 'Page text', extension: 'md' }),
      },
    }),

    journal: collection({
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
    }),

    team: collection({
      label: 'Team',
      path: 'src/content/team/*',
      slugField: 'name',
      format: { data: 'json' },
      columns: ['name', 'role'],
      schema: {
        name: fields.slug({ name: { label: 'Name', description: 'Include letters after the name, for example: Dr. Ana Whitlock, DDS' } }),
        role: fields.text({ label: 'Role' }),
        photo: photo('Portrait', 'Portrait orientation works best.', 'team'),
        bio: fields.text({ label: 'Bio', multiline: true }),
        outside: fields.text({ label: 'Outside work', description: 'One human detail, shown with a leaf icon.' }),
        order: fields.integer({ label: 'Order', defaultValue: 10 }),
      },
    }),
  },

  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'src/content/pages/home',
      format: { data: 'json' },
      schema: {
        heroTitle: fields.text({ label: 'Hero headline (first part)' }),
        heroAccent: fields.text({ label: 'Hero headline (green part)' }),
        heroLede: fields.text({ label: 'Hero intro', description: 'Keep it under about 20 words.', multiline: true }),
        heroImage: photo('Hero photo'),
        heroImageAlt: fields.text({ label: 'Hero photo description (alt text)' }),
        heroCardTitle: fields.text({ label: 'Hero card title' }),
        heroCardText: fields.text({ label: 'Hero card text' }),
        manifesto: fields.text({ label: 'Big statement', multiline: true }),
        servicesTitle: fields.text({ label: 'Services heading' }),
        visitTitle: fields.text({ label: 'First visit heading' }),
        visitLede: fields.text({ label: 'First visit intro', multiline: true }),
        visitSteps: fields.array(
          fields.object({
            title: fields.text({ label: 'Step title' }),
            body: fields.text({ label: 'Step text', multiline: true }),
            image: fields.image({ label: 'Step photo (leave empty for the yellow calendar card)', directory: 'src/assets/photos', publicPath: '../../assets/photos/' }),
            imageAlt: fields.text({ label: 'Photo description (alt text)' }),
          }),
          { label: 'First visit steps', itemLabel: (p) => p.fields.title.value || 'Step' },
        ),
        teamTitle: fields.text({ label: 'Team heading' }),
        teamText: fields.text({ label: 'Team text', multiline: true }),
        reviewsTitle: fields.text({ label: 'Reviews heading' }),
        journalTitle: fields.text({ label: 'Journal heading' }),
        findTitle: fields.text({ label: 'Visit us heading' }),
        findImage: photo('Visit us photo'),
        findImageAlt: fields.text({ label: 'Visit us photo description (alt text)' }),
        insurance: fields.text({ label: 'Insurance line', multiline: true }),
        parking: fields.text({ label: 'Parking line' }),
        access: fields.text({ label: 'Accessibility line' }),
        seo: fields.object({ title: seoTitle(), description: seoDescription(), image: seoImage() }, { label: 'SEO' }),
      },
    }),

    about: singleton({
      label: 'About page',
      path: 'src/content/pages/about',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Headline' }),
        lede: fields.text({ label: 'Intro', multiline: true }),
        image: photo('Main photo'),
        imageAlt: fields.text({ label: 'Main photo description (alt text)' }),
        storyTitle: fields.text({ label: 'Story heading' }),
        story: fields.array(fields.text({ label: 'Paragraph', multiline: true }), { label: 'Story paragraphs', itemLabel: (p) => (p.value || '').slice(0, 60) || 'Paragraph' }),
        principlesTitle: fields.text({ label: 'Principles heading' }),
        principles: fields.array(
          fields.object({ icon: fields.select({ label: 'Icon', options: ICONS, defaultValue: 'clock' }), title: fields.text({ label: 'Title' }), body: fields.text({ label: 'Text', multiline: true }) }),
          { label: 'Principles', itemLabel: (p) => p.fields.title.value || 'Principle' },
        ),
        teamTitle: fields.text({ label: 'Team heading' }),
        ctaTitle: fields.text({ label: 'Bottom banner heading' }),
        ctaText: fields.text({ label: 'Bottom banner text', multiline: true }),
        seo: fields.object({ title: seoTitle(), description: seoDescription(), image: seoImage() }, { label: 'SEO' }),
      },
    }),

    listings: singleton({
      label: 'Other pages (SEO)',
      path: 'src/content/pages/listings',
      format: { data: 'json' },
      schema: {
        services: fields.object({ title: seoTitle(), description: seoDescription() }, { label: 'Services page' }),
        journal: fields.object({ title: seoTitle(), description: seoDescription() }, { label: 'Journal page' }),
        book: fields.object({ title: seoTitle(), description: seoDescription() }, { label: 'Book a visit page' }),
      },
    }),

    reviews: singleton({
      label: 'Reviews',
      path: 'src/content/reviews',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({ quote: fields.text({ label: 'Quote', description: 'Keep it to three lines or less.', multiline: true }), name: fields.text({ label: 'Name' }), where: fields.text({ label: 'Neighbourhood' }) }),
          { label: 'Reviews', itemLabel: (p) => p.fields.name.value || 'Review' },
        ),
      },
    }),

    settings: singleton({
      label: 'Site settings and SEO',
      path: 'src/content/settings',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Practice name' }),
        tagline: fields.text({ label: 'Tagline' }),
        phone: fields.text({ label: 'Phone' }),
        email: fields.text({ label: 'Email' }),
        addressLine1: fields.text({ label: 'Street address' }),
        addressLine2: fields.text({ label: 'City, state and ZIP', description: 'Format: Portland, OR 97202 (used for Google structured data).' }),
        mapLink: fields.url({ label: 'Directions link' }),
        hours: fields.array(
          fields.object({ days: fields.text({ label: 'Days', description: 'For example: Mon to Thu, or Saturday' }), time: fields.text({ label: 'Time', description: 'For example: 7:30 am to 6:00 pm' }) }),
          { label: 'Opening hours', itemLabel: (p) => `${p.fields.days.value} ${p.fields.time.value}` },
        ),
        bookLabel: fields.text({ label: 'Booking button label' }),
        seoTitleSuffix: fields.text({ label: 'SEO title suffix', description: 'Added after page titles, for example: | Linden Dental Studio' }),
        seoDefaultDescription: fields.text({ label: 'Default SEO description', multiline: true }),
        twitterHandle: fields.text({ label: 'X / Twitter handle (optional)', description: 'For example: @lindendental' }),
      },
    }),
  },
});
