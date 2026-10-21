# Linden Dental Studio: design language

This is the design system behind the Linden Dental Studio concept site. It is written for designers. The same content is rendered live at `/design/`, and the source of truth for every value is `src/styles/global.css` (tokens) and `src/data/design.ts` (palette names, motion list, inspiration).

## Design read

Warm minimal, for a family dentist. Calm enough for a nervous adult, friendly enough for a four-year-old, and specific enough to feel like a real neighbourhood practice in Sellwood, Portland.

The site should feel like the practice it describes: unhurried, plain-spoken, and upfront about prices. Most dental sites lean clinical (white, blue, gloss, stock tooth renders). We went the other way: pale paper tones, deep forest ink, one green accent, people photographed in warm light, and motion that explains order instead of decorating.

## Principles

1. **Calm over clinical.** Paper tones, forest ink and photos of people. Hospital blue and stock tooth renders are out.
2. **Say the price.** Copy is plain and specific. Exact prices and appointment lengths, and never "starting from".
3. **One accent.** Linden green is the only colour that signals "you can act on this". Bloom yellow is a quiet surface tint and never appears on a control.
4. **Every control is a pill.** Buttons, inputs, selects, chips, nav links and icon buttons all use the full pill radius. Media and panels use soft fixed radii.
5. **Emphasis by colour, never italics.** Mark a key phrase with the accent colour or with weight. The site uses no italic styles.
6. **Motion explains.** Every animation reveals order or depth. Reduced motion turns it all off.
7. **Two themes, each designed on its own terms.** Dark mode has its own palette, picked for contrast on dark surfaces. We did not invert the light theme to get it.

## Colour

Token names below drop the leading double hyphen of the CSS custom property, so `bg` is the property named bg in `global.css`. The dark values apply when the system prefers dark (unless the visitor picked light with the toggle) or when the visitor picks dark.

### Tokens

| Name | Token | Light | Dark | Use |
| --- | --- | --- | --- | --- |
| Linden paper | `bg` | `#f3f3ec` | `#0f1612` | Page background. A pale, slightly green paper rather than cream. |
| Sage wash | `bg-2` | `#e7eadf` | `#162019` | Section tint, icon wells, footer. |
| Surface | `surface` | `#fbfbf7` | `#1b251f` | Cards, the form panel, review cards. |
| Forest ink | `ink` | `#16211b` | `#e8ece3` | Headlines and body text. |
| Moss | `ink-2` | `#49554d` | `#a8b3aa` | Secondary text, captions, hints. |
| Line | `line` | `#d3d8ca` | `#2b382f` | Dividers and card outlines only. Too faint for control borders. |
| Linden green | `accent` | `#2c5c43` | `#8cc5a2` | The one accent. Buttons, links, focus rings, active states. |
| Green, hover | `accent-hover` | `#234b36` | `#a5d5b7` | Button hover. |
| On accent | `on-accent` | `#f6f6f0` | `#0d1510` | Text and icons on accent fills. |
| Blossom | `bloom` | `#eee2a6` | `#3a3720` | Quiet tint for one highlight per section at most. Never on a control. |
| Blossom ink | `bloom-ink` | `#3d3713` | `#ece0a2` | Text on bloom panels. |
| Danger | `danger` | `#a23a2a` | `#f08c78` | Form errors and invalid borders. |

There is one shadow token, `shadow`, a soft two-layer shadow tinted green in light mode and plain black in dark. It is used on floating things only: the hero hours card, the booking panel and the services hover photo.

### Contrast

Ratios are WCAG 2.x relative-luminance contrast, computed from the hex values above. AA needs 4.5:1 for body text, 3:1 for large text and for control boundaries. AAA needs 7:1.

| Foreground on background | Light | Dark | Result |
| --- | --- | --- | --- |
| `ink` on `bg` | 14.87 | 15.33 | AAA |
| `ink` on `surface` | 15.97 | 13.18 | AAA |
| `ink` on `bg-2` | 13.60 | 13.98 | AAA |
| `ink-2` on `bg` | 7.00 | 8.47 | AAA |
| `ink-2` on `surface` | 7.53 | 7.28 | AAA |
| `ink-2` on `bg-2` | 6.41 | 7.73 | AA (light), AAA (dark) |
| `accent` on `bg` | 6.93 | 9.29 | AA (light), AAA (dark) |
| `accent` on `surface` | 7.45 | 7.98 | AAA |
| `accent` on `bg-2` | 6.34 | 8.47 | AA (light), AAA (dark) |
| `on-accent` on `accent` | 7.12 | 9.39 | AAA |
| `on-accent` on `accent-hover` | 9.08 | 11.31 | AAA |
| `bloom-ink` on `bloom` | 9.16 | 9.01 | AAA |
| `bloom-ink` at 78% opacity on `bloom` (muted text on bloom panels) | 5.09 | 6.19 | AA |
| `danger` on `surface` | 6.38 | 6.56 | AA |
| `danger` on `bg` | 5.93 | 7.63 | AA (light), AAA (dark) |
| `line` on `surface` | 1.40 | 1.28 | Decorative only |
| Form field outline on `surface` | 3.93 | 4.29 | Passes 3:1 for controls |

The form field outline is `ink-2` mixed 72% into `surface` (in OKLab), set locally on the booking form. Use it, or something stronger, wherever a border is the only thing that shows a control's edge. Keep `line` for dividers.

### Colour rules

- One accent per screen. If two things compete for green, one of them should become ink.
- Bloom appears at most once per section: the first principle card, the team lead panel, the first step of the first visit, the hero card's icon well.
- Never put bloom on a button, link, input or chip.
- Green text on a photo needs a surface behind it.

## Type

| Role | Family | Why |
| --- | --- | --- |
| Display | Bricolage Grotesque (variable, with optical sizes) | Warm and slightly irregular. It reads friendly at large sizes without turning cute, and the optical sizes keep big headlines tight. |
| Text | Figtree (variable) | Round, open and very readable at body sizes. It pairs with Bricolage without competing. |

Both are self-hosted through Fontsource, so there is no third-party font request. Fallbacks: Avenir Next then system UI for display, Segoe UI then system UI for text.

Settings: headings at weight 560 with tracking of minus 0.025em and line height 1.04. Body at weight 400 with line height 1.6. Small labels are uppercase Figtree at weight 600 with 0.08em tracking. Emphasis inside a headline uses the accent colour (the `accent-word` class), never italics.

### Fluid scale

Each step is a `clamp()` that grows with the viewport. Pixel values assume a 16px root.

| Step | Value in `global.css` | Smallest | Largest | Used for |
| --- | --- | --- | --- | --- |
| `step--1` | `clamp(0.84rem, 0.81rem + 0.12vw, 0.92rem)` | 13.4px | 14.7px | Labels, meta lines, captions, form hints |
| `step-0` | `clamp(1rem, 0.96rem + 0.2vw, 1.12rem)` | 16px | 17.9px | Body text |
| `step-1` | `clamp(1.2rem, 1.1rem + 0.45vw, 1.45rem)` | 19.2px | 23.2px | Ledes, `h4`, review quotes |
| `step-2` | `clamp(1.5rem, 1.3rem + 0.9vw, 2.05rem)` | 24px | 32.8px | `h3`, card titles |
| `step-3` | `clamp(1.95rem, 1.6rem + 1.6vw, 2.95rem)` | 31.2px | 47.2px | Feature headings, service list titles, manifesto |
| `step-4` | `clamp(2.45rem, 1.9rem + 2.6vw, 4.2rem)` | 39.2px | 67.2px | `h2`, section headings |
| `step-5` | `clamp(2.9rem, 2.1rem + 3.8vw, 5.6rem)` | 46.4px | 89.6px | `h1`, page titles |

The home hero headline uses its own clamp, `clamp(2.6rem, 1.5rem + 3.2vw, 4.4rem)`, so it sits beside the photo without wrapping into a tower.

## Shape

| Token | Value | Use |
| --- | --- | --- |
| `r-lg` | 28px | Photos, large panels, the booking panel, tinted step cards |
| `r-md` | 18px | Cards, the hero hours card, review cards, swatches, the textarea |
| `r-sm` | 12px | Small thumbnails |
| `pill` | 999px | Every interactive control |

Rules:

- If you can click it, tap it or type in it, it is a pill. That covers buttons, text inputs, selects, radio and checkbox chips, the toggle switch, nav links, icon buttons and the skip link.
- The one exception is the multi-line textarea, which uses `r-md`, because a pill-shaped box of several lines reads as a mistake.
- Photos always sit in a `frame`: rounded, clipped, with the sage wash behind while loading.

## Spacing and layout

| Token | Value | Range |
| --- | --- | --- |
| `gutter` | `clamp(1rem, 0.6rem + 2vw, 2.5rem)` | 16px to 40px side padding |
| `max` | `1320px` | Content width cap |
| `section` | `clamp(4.5rem, 3rem + 7vw, 9.5rem)` | 72px to 152px between sections |

- The `wrap` class centres content at the max width minus gutters.
- Body copy is capped at 62 characters (`measure`). Ledes cap at 46 characters.
- Sections breathe: generous vertical space and few borders. Tinted backgrounds separate sections more often than lines do.
- Grids collapse to one column at 860px to 960px depending on the component. The nav switches to the menu button at 860px.

## Components

| Component | Where | Notes |
| --- | --- | --- |
| Nav | Every page | Sticky. Tucks away while scrolling down, returns on scroll up. Phone link (hidden under 1100px), theme toggle, Book button, full-screen menu sheet under 860px. |
| Logo | Nav, footer, `/design/` | Phosphor leaf in an accent pill plus the wordmark: "Linden" in Bricolage over "Dental Studio" in small caps Figtree. |
| Buttons | Everywhere | `btn` (accent fill), `btn--ghost` (outline), `btn--lg`. Arrow icons nudge right on hover. |
| Text link with arrow | Everywhere | `link-arrow`, accent text, arrow moves on hover. |
| Frame | Everywhere | Rounded photo container; most carry parallax. |
| Hero with hours card | Home | Photo opens from an inset frame; a small surface card with a bloom icon well overlaps the photo's lower edge. |
| Manifesto | Home | One paragraph in display type, centred, filled word by word on scroll. |
| Service index rows | Home | Icon, title, summary, round arrow. A photo follows the cursor on fine pointers. |
| First-visit track | Home | Five steps in a row. Pinned sideways pan on wide screens, swipeable list elsewhere. |
| Team bento | Home | Bloom lead panel plus four portraits in a fixed grid. |
| Reviews marquee | Home | Slow horizontal loop of review cards; pauses on hover or focus; static scroll row under reduced motion. |
| Journal feature and rows | Home, `/journal/` | One large feature card plus compact rows with square thumbnails. |
| Visit us block | Home | Address, hours as a definition list, practical facts with icons. |
| Service cards | `/services/` | Bento grid of photo cards with icon, summary and the headline price. |
| Service page | `/services/<slug>/` | Facts list (cost, time), numbered "What happens" steps, FAQ in `details` elements, "Also at Linden" links. |
| Principle cards | `/about/` | Icon well, title, one sentence. |
| Person cards | `/about/` | Portrait, name, role, bio, one detail from outside work. |
| Article | Journal posts | Reading progress bar, cover, prose, author box, "Keep reading". |
| CTA band | About, services, service pages, posts | Closing heading, one line, Book and phone buttons. |
| Booking form | `/book/` | Segmented radio pills, text fields, select, checkbox chips, nervous-patient toggle switch, inline errors, success state. |
| Footer | Every page | Brand blurb, address, hours, contact and nav links, fictional-practice notice. |
| Skip link | Every page | Accent pill that drops into view on keyboard focus. |

## Motion

GSAP with ScrollTrigger and SplitText. Each effect is opt-in by data attribute (see the README for the attribute table).

| Effect | Why | How |
| --- | --- | --- |
| Hero opening | Draws the eye to the photo first, then the promise. | Clip-path opens from an inset to the full frame, the image eases from 1.28 to 1.08 scale, and the card lifts in last. |
| Line reveals | Gives each section heading a clear arrival without moving body text. | GSAP SplitText lines in a mask, once, on enter. |
| Manifesto fill | Reads the core promise at the visitor's pace. | Words go from 16% to 100% opacity, scrubbed to scroll. |
| First-visit pan | Tells the appointment as a sequence, which is what nervous patients want to know. | The section pins at the top and vertical scroll moves the track sideways. Swipeable list on touch screens. |
| Service preview | Puts a face to each service without adding images to the list. | A photo follows the cursor and swaps per row. Fine pointers only. |
| Parallax frames | Adds depth to framed photos so the calm layout does not feel flat. | The image drifts within its frame, about 5 to 8 percent. |
| Reading progress | Shows how much of a journal post is left. | A 3px bar under the nav, scrubbed to the article. |

Principles:

- Scroll effects move only position, scale, opacity and clip-path. Width, height and margins never animate. Colour changes are reserved for hover feedback.
- One easing family: `expo.out` in GSAP and `cubic-bezier(0.16, 1, 0.3, 1)` in CSS. Arrivals take about one second. Hover feedback takes between a fifth and half a second.
- Reveals run once. Nothing replays when you scroll back up.
- The reviews marquee is the only loop. It is slow (60 seconds per cycle) and stops on hover and on keyboard focus.
- Hover effects need a fine pointer. Pinning needs a screen at least 900px wide.

### Reduced motion

When the visitor sets `prefers-reduced-motion: reduce`:

- No GSAP effect runs except the header tucking away on scroll.
- Reveal targets are never hidden, so all content is present from the first paint.
- CSS transitions and animations drop to near zero.
- The reviews marquee stops and becomes a horizontally scrollable row.
- The first-visit section becomes a swipeable list instead of a pinned pan.

If JavaScript fails or is slow, the pre-hide class is removed after three seconds, so content never stays invisible.

## Imagery

- Families and staff in warm, natural light, looking like themselves. Kids in the chair with parents beside them, and adults talking with the dentist before anything happens.
- Rooms that look calm: daylight, wood, plants, a single chair.
- Faces over equipment. When a tool appears, a person is using it to explain something.
- Out: stock tooth renders, 3D molars, blue clinical glow, gloved hands in close-up, before-and-after smile grids.
- Photos are framed with `r-lg` corners and usually carry a light parallax. Portraits are cropped close to 4:5, scenes to 4:3 or wider.
- Every content photo needs alt text that describes the moment in one plain sentence, for example "A dentist chatting with a patient before her exam."

The current set is 19 licensed Envato Elements photos, listed in `docs/envato-shortlist.md`.

## Voice and copy

- Plain and specific. "$185 without insurance. Usually covered in full by PPO plans." beats "affordable care".
- Say the time. "60 minutes", "within one working day", "8 am to 1 pm".
- Use names. June answers the phone, Marcus does most fillings, Danielle sees most kids.
- Tell people what happens next, step by step. Nervous patients want the sequence.
- No lectures and no guilt. We explain; we never scold about flossing.
- Short declarative headlines in sentence case, often ending with a full stop: "Come and see us."
- No em dashes or en dashes. Use a full stop, a comma or a colon. Write ranges with "to".
- Skip italics and exclamation marks in body copy.
- Avoid filler words that every agency site uses. If a sentence would fit any dentist in any city, rewrite it with a detail only Linden has.

## Inspiration

UK and US studios only. We studied each shot and took one idea from it.

| Studio | Location | Shot | What we took |
| --- | --- | --- | --- |
| Havenise Studio | United States | [Dental Website, Confidence Before the Appointment](https://dribbble.com/shots/27731839-Dental-Website-Confidence-Before-the-Appointment) | Warm off-white base and a small card sitting on the hero photo. Ours carries opening hours instead of a booking widget. |
| Phenomenon Studio | United States | [Bloom, mental health clinic](https://dribbble.com/shots/26661884-Mental-Health-Clinic-Web-Design-Bloom) | The inset, rounded photo frame. It became the hero reveal: the frame opens out from an inset clip. |
| Phenomenon Studio | United States | [Atelier Aesthetica, aesthetic clinic](https://dribbble.com/shots/27705580-Aesthetic-Clinic-Website-Design-Atelier-Aesthetica) | Calm pacing, generous margins and short, declarative headlines. |
| Cuberto | San Francisco, CA | [Website and motion concept for a dentist clinic](https://dribbble.com/shots/20124844-Motion-design-concept-for-dentist-clinic) | Diverse, natural faces and motion that feels playful without being loud. The cursor-follow photo on the services list comes from here. |
| Musemind | New York City, NY | [Women's hormone clinic](https://dribbble.com/shots/27787277-Healthcare-Website-UI-UX-Women-s-Hormone-Clinic-Web-Design) | A single reassuring sentence given the whole screen. That is our scroll-filled manifesto. |
| Nixtio | New York City, NY | [Dental clinic landing page](https://dribbble.com/shots/19948281-Dental-Clinic-Landing-Page) | Big confident type set against photography, and process explained as a sequence of image cards. |
| Phenomenon Studio | United States | [Nova Dental, team page](https://dribbble.com/shots/26633521-Nova-Dental-Team-Page-for-Dental-Website-UI-Design) | Large portraits with a human detail beside each one, which shaped our team bios. |
