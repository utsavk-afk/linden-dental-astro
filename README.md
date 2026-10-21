# Linden Dental Studio concept site

A concept website for Linden Dental Studio, a family dental practice in Sellwood, Portland, Oregon. The practice, its staff, its patients and their reviews are all fictional, and the footer of every page says so. The site is a static Astro build with hand-written CSS, GSAP scroll motion, light and dark themes, and a booking form that validates in the browser but sends nothing. Phone numbers use the reserved 555-01xx range.

The design language (colour, type, shape, motion, inspiration) is documented in [DESIGN.md](DESIGN.md) and rendered live at `/design/`.

## Quick start

You need Node 22.12 or newer.

```sh
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # resizes photos (prebuild), then writes the static site to dist/
npm run preview   # serves dist/ locally to check the production build
```

`npm run photos` runs the photo resize step on its own. It also runs automatically before every build.

## Stack

| Part | What we use |
| --- | --- |
| Framework | Astro 6.4, static output |
| Content | Content collections (glob loader): services and journal as Markdown, team and page copy as JSON. Edited in the Keystatic CMS (local mode) |
| Images | `astro:assets` with responsive `srcset`, WebP output, default layout `constrained` |
| Page changes | Astro `ClientRouter` view transitions, link prefetch on hover |
| Motion | GSAP 3.15 with ScrollTrigger and SplitText |
| Fonts | Self-hosted with `@fontsource-variable`: Bricolage Grotesque (display), Figtree (text) |
| Icons | Phosphor (regular weight), inlined as SVG at build time by `src/components/Icon.astro` |
| CSS | No framework. Tokens and base rules in `src/styles/global.css`, component styles scoped in each `.astro` file |

## Pages

| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/about/` | `src/pages/about.astro` |
| `/services/` | `src/pages/services/index.astro` |
| `/services/<slug>/` (7 pages) | `src/pages/services/[slug].astro` |
| `/journal/` | `src/pages/journal/index.astro` |
| `/journal/<slug>/` (4 posts) | `src/pages/journal/[slug].astro` |
| `/book/` | `src/pages/book.astro` |
| `/design/` | `src/pages/design.astro`, the living design-language page |
| 404 | `src/pages/404.astro` |

## Project structure

```text
linden-dental-astro/
├── astro.config.mjs          site URL (placeholder), prefetch, image layout
├── package.json
├── tsconfig.json
├── README.md
├── DESIGN.md                 design language for designers
├── AGENTS.md                 notes for coding agents
├── public/
│   └── favicon.svg
├── docs/
│   ├── envato-shortlist.md   the 19 licensed photos, what each is used for, Envato links
│   └── envato-downloads/     licensed originals (gitignored, local only)
├── scripts/
│   ├── photos.mjs            resizes originals into src/assets/photos/
│   └── envato/               local helper scripts used to download the licensed photos
│       ├── login.mjs
│       ├── download.mjs
│       ├── probe.mjs
│       └── slots.json
└── src/
    ├── content.config.ts     collection schemas (services, journal, team)
    ├── assets/photos/        19 web-sized JPEGs (committed)
    ├── components/
    │   ├── CtaBand.astro     closing call-to-action band
    │   ├── Footer.astro
    │   ├── Icon.astro        Phosphor icon allow-list
    │   ├── Logo.astro        leaf mark + wordmark
    │   └── Nav.astro         sticky header, theme toggle, mobile menu
    ├── content/
    │   ├── services/         7 Markdown files
    │   ├── journal/          4 Markdown files
    │   ├── team/             one JSON file per team member
    │   ├── pages/            home, about and listing-page copy + SEO (CMS singletons)
    │   ├── settings.json     practice details + SEO defaults
    │   └── reviews.json      the review strip
    ├── data/
    │   ├── design.ts         palette, inspirations, motion list (feeds /design/)
    │   ├── reviews.ts        sample reviews (fictional)
    │   └── site.ts           derives links from content/settings.json
    ├── layouts/
    │   └── Base.astro        head, skip link, theme and motion flags, nav, footer
    ├── pages/                see the table above
    ├── scripts/
    │   ├── motion.ts         GSAP motion layer (data-attribute API below)
    │   └── ui.ts             theme toggle, mobile menu, booking form
    └── styles/
        └── global.css        tokens, base type, buttons, frames, motion gating
```

## Editing content (Keystatic CMS)

Every piece of text, every photo and all SEO fields can be edited in a visual CMS. No code needed.

1. Run `npm run dev`.
2. Open http://localhost:4321/keystatic.
3. Edit and press **Save**. The change is written straight into the files in `src/content` (images into `src/assets`) and shows on http://localhost:4321 within a second.
4. Publish: commit and push to GitHub, then run the staging deploy (see Deploying).

The CMS runs on your machine only (Keystatic local mode). The published site stays fully static, so there is no admin login to secure on the live server. To edit from a browser on staging instead, Keystatic can switch to GitHub mode, which needs a small server and a GitHub App.

| CMS screen | What it edits | File(s) |
|---|---|---|
| Pages > Home page | Every heading, paragraph, button/link (text + URL) and photo, the first-visit steps, meta tags | `src/content/pages/home.json` |
| Pages > About page | H1, story, principles, team heading, call to action band, meta tags | `src/content/pages/about.json` |
| Pages > Services page | Listing H1/intro/banner plus every label on service detail pages | `src/content/pages/servicesPage.json` |
| Pages > Journal page | Listing H1/intro plus the labels on every post (back link, author line, updated, draft banner) | `src/content/pages/journalPage.json` |
| Pages > Book a visit page | Every word of the booking page: labels, options, error messages, success message | `src/content/pages/bookPage.json` |
| Pages > 404 page | Page not found copy and buttons | `src/content/pages/notFound.json` |
| Pages > Design page | The whole /design/ page | `src/content/pages/designPage.json` |
| Content > Services | One page per service: excerpt, price, steps, FAQs, content, featured image, meta tags | `src/content/services/<slug>.md` |
| Content > Journal | Blog posts: H1, excerpt, author, category, dates, featured image, rich-text content, meta tags | `src/content/journal/<slug>.md` |
| Content > Team | Name, role, portrait, bio, outside-work line | `src/content/team/<slug>.json` |
| Content > Reviews | The scrolling review strip | `src/content/reviews.json` |
| Settings > Site settings | Practice details, hours, header menu, booking button, footer, default CTA band, accessibility labels, default meta tags | `src/content/settings.json` |
| Settings > Redirects (301) | Old URL to new URL, for changed slugs | `src/content/redirects.json` |

Field labels follow WordPress / Yoast wording (H1 heading, Intro paragraph, Meta title, Meta description, Excerpt, Featured image alt text, Open Graph image). Required fields cannot be saved empty; optional ones fall back to sensible defaults (`src/lib/content.ts`). Every build runs `scripts/check-content.mjs`, which fails on raw `{% %}` tags, missing images or a post whose author is not a team member.

All content is typed by the schemas in `src/content.config.ts`, so a missing or misspelled field fails the build with a clear message instead of shipping a broken page.

### Writing a blog post

In the CMS open **Journal (blog)** and choose **Create**. Type the title (the URL slug fills in from it), pick the author from the team list, upload a cover photo, write the article in the editor (headings, bold, links, lists and inline images all work), then Save.

- **Draft** keeps a post on your local preview only; it is left out of the published build, the sitemap and the journal list until you untick it.
- Read time is calculated from the article length. Use headings from level 2 down, because the title is the page's only h1.
- Inline images in an article are saved under `src/assets/journal/<slug>/` and optimised by Astro like every other photo.

### Services and team

Service, post and team images live in one folder per entry, for example `src/assets/services/kids/photo.jpg`. That is the layout Keystatic expects; uploading a new photo in the CMS replaces the file there. Service icons come from the allow-list in `src/components/Icon.astro`. The home page team bento has exactly four grid areas, so a fifth person needs a small layout change in `index.astro`.

## SEO

- **Per page:** every service and post has optional SEO title and SEO description fields. Home and About also take a social share image. Empty fields fall back to the page title and summary.
- **Titles:** the site suffix (Site settings) is added automatically, for example "Kids’ dentistry | Linden Dental Studio".
- **Social cards:** Open Graph and Twitter tags on every page, with the share image cropped to 1200 x 630.
- **Structured data (JSON-LD):** a `Dentist` listing on every page (name, address, phone, email, opening hours, all built from Site settings), `FAQPage` on service pages, `Article` on posts, and `BreadcrumbList` on detail pages.
- **Sitemap and robots:** `@astrojs/sitemap` writes `sitemap-index.xml`; `robots.txt` points to it. Staging builds (`PUBLIC_NOINDEX=1`) add a noindex meta tag and a robots.txt that blocks everything, so staging never competes with the real site.
- **Canonical URLs** come from `site` and `base` in `astro.config.mjs`. Set `LINDEN_SITE` to the real domain before launch.

## Photo pipeline

The 19 photos are licensed stock from Envato Elements, downloaded under the project name "Linden Dental concept". `docs/envato-shortlist.md` lists each file, where it is used and its Envato item page.

1. Licensed originals go in `docs/envato-downloads/`, named as in the shortlist (any extension). This folder is gitignored, so originals never reach the repo.
2. `npm run photos` (also the `prebuild` step) runs `scripts/photos.mjs`. It resizes each original to fit within 2000px, rotates by EXIF, and writes a JPEG at quality 82 to `src/assets/photos/`. It skips files whose output is already newer than the original.
3. Astro's `<Image>` generates responsive WebP sizes from those JPEGs at build time.

On a fresh clone the originals folder does not exist. The script exits without doing anything and the build uses the committed web copies.

The scripts in `scripts/envato/` drove a signed-in Chrome session to download and license the shortlist. They load Playwright from a fixed local path and are kept for the record. Nothing in the build depends on them.

**Licence note.** These photos are licensed through Envato Elements for this project only. They are not covered by any licence in this repository and must not be reused in another project without your own Envato Elements licence for each item.

## Motion system

Motion lives in `src/scripts/motion.ts`. Every effect is opt-in: add a data attribute to the markup and the effect runs. Effects are created inside `gsap.matchMedia()` contexts, so they only run when the visitor has not asked for reduced motion, and they are torn down and rebuilt on each view transition.

| Attribute | Effect | Where used |
| --- | --- | --- |
| `data-hero` | Container for the hero timeline; the image also drifts 7% as the hero scrolls away | Home hero |
| `data-hero-frame` | Photo frame opens from an inset rounded clip to full size; image scales from 1.28 to 1.08 | Home hero |
| `data-hero-fade` | Fades up after the frame starts opening | Home hero lede and buttons |
| `data-hero-card` | Lifts in last, with a slight rotation settling to zero | Home hero hours card |
| `data-split` | Heading lines rise out of a mask once, on scroll into view (SplitText) | Page and section headings on every page, CtaBand |
| `data-reveal` | Fades up 32px in small batches as blocks scroll in | Most blocks on every page |
| `data-parallax="N"` | Image (scaled to 1.18) drifts from N percent above to N percent below centre inside its frame, scrubbed to scroll (default 8) | Home team (5) and visit (7), about intro (6) and team (4), service hero (6), journal cover (5) |
| `data-scrub-words` | Words fill from 16% to 100% opacity as you scroll through the paragraph | Home manifesto |
| `data-hpan` | Pins the section; vertical scroll moves the track sideways. Wide screens only (900px and up) | Home first-visit section |
| `data-hpan-track` | The element that moves sideways | Home first-visit section |
| `data-hpan-step`, `data-hpan-in` | Each step's children fade up as the step enters | Home first-visit section |
| `data-hpan-bar` | Progress rail under the track, scrubbed to the pan | Home first-visit section |
| `data-hover-reveal` | List container; a photo follows the cursor. Fine pointers only | Home services list |
| `data-hover-row`, `data-hover-media`, `data-hover-img` | Rows, the floating frame and its images; the image swaps per hovered row | Home services list |
| `data-progress`, `data-article` | Reading progress bar under the nav, scrubbed to the article | Journal posts (`progress` prop on `Base.astro`) |
| `data-nav` | Header tucks away while scrolling down and returns on any upward scroll | `Nav.astro` |

UI behaviour in `src/scripts/ui.ts` uses the same pattern: `data-theme-toggle`, `data-menu-toggle` and `data-menu`, and `data-book-form` with `data-book-success` and `data-first-name`.

**Content is visible without JavaScript.** An inline script in `Base.astro` adds a `motion` class to `<html>` only when reduced motion is off. That class pre-hides reveal targets so they can animate in. If the motion module has not reported ready within three seconds, the class is removed and everything shows.

**Reduced motion.** With `prefers-reduced-motion: reduce`, no GSAP effect is created except the header tuck, the `motion` class never applies, CSS transitions and animations drop to near zero, the reviews marquee stops and becomes a scrollable row, and the first-visit section becomes a swipeable list.

## Accessibility

- A skip link is the first focusable element and jumps to `<main id="main">`.
- Landmarks on every page: `header`, `nav` labelled "Main", `main`, `footer`. Each page has exactly one `h1`, and headings step down one level at a time with no gaps from `h1` through `h3`.
- Every control shows a 2px accent outline on keyboard focus. Text fields swap to an accent border with a soft ring.
- Content images carry written alt text from the content files. Decorative images (thumbnails beside a text label, the hover preview) use `alt=""`, and icons are `aria-hidden`.
- The booking form uses visible `label` elements, fieldsets with legends for the radio and checkbox groups, `aria-invalid`, and error messages tied to fields with `aria-describedby`. On a failed submit, focus moves to the first field with an error. On success, focus moves to the confirmation.
- The mobile menu button exposes `aria-expanded` and `aria-controls`, and Escape closes the menu. The current page is marked with `aria-current`.
- Text and control colours meet WCAG AA in both themes. Ratios are in DESIGN.md.
- The reviews marquee duplicates its items for the loop; the copy is hidden from screen readers. It pauses on hover and on keyboard focus.

Audit (October 2026): axe-core 4.14 with WCAG 2.2 A and AA plus best-practice rules, on all 18 pages, in light and dark at 1280px and in light at 390px, with reduced motion on. Result: 0 violations.

Also handled:

- The reviews marquee has a Pause button (WCAG 2.2.2), pauses on hover and keyboard focus, and is static under reduced motion.
- Empty booking-form errors collapse to zero height but stay in the accessibility tree, so the `aria-live` region announces new errors.
- The open mobile menu keeps focus inside it, Escape closes it and returns focus to the menu button, and the theme toggle exposes its state with `aria-pressed`.

## Deploying

`npm run build` writes a fully static site to `dist/`, including `404.html`. Any static host works.

Before you deploy, change `site` in `astro.config.mjs`. It is a placeholder (`https://linden-dental.example`) and is used for canonical URLs.

| Host | Settings |
| --- | --- |
| Netlify | Build command `npm run build`, publish directory `dist`, environment variable `NODE_VERSION=22` |
| Vercel | Import the repo; the Astro preset fills in the build settings. Set Node to 22.x in project settings |
| Cloudflare Pages | Framework preset Astro, build command `npm run build`, output `dist`, `NODE_VERSION=22` |
| GitHub Pages | Use the official `withastro/action` workflow. If the site lives at `https://<user>.github.io/<repo>/`, also set `base: '/<repo>'` in `astro.config.mjs` |

The booking form has no backend. To make it send requests, replace the timeout in `bookingForm()` in `src/scripts/ui.ts` with a request to a form service or the practice's booking software.

## Credits and licences

| What | Source and licence |
| --- | --- |
| Practice, people and reviews | Fictional. Any resemblance to an existing practice is accidental. |
| Photos | 19 stock photos from Envato Elements, licensed to the project owner's Envato account for this project. See the licence note above. |
| Fonts | Bricolage Grotesque and Figtree, both under the SIL Open Font License 1.1, installed from Fontsource. |
| Icons | Phosphor Icons, MIT licence. |
| Motion | GSAP by GreenSock (Webflow), under the standard no-charge GSAP licence, which includes ScrollTrigger and SplitText. |
| Framework | Astro, MIT licence. |
| Design references | The UK and US Dribbble shots listed in DESIGN.md. We took one idea from each and copied no assets. |
