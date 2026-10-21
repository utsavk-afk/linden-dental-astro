// Design language reference data, rendered on /design and mirrored in DESIGN.md.
export const palette = [
  { name: 'Linden paper', token: '--bg', light: '#f3f3ec', dark: '#0f1612', use: 'Page background. A pale, slightly green paper rather than cream.' },
  { name: 'Sage wash', token: '--bg-2', light: '#e7eadf', dark: '#162019', use: 'Section tint, icon wells, footer.' },
  { name: 'Surface', token: '--surface', light: '#fbfbf7', dark: '#1b251f', use: 'Cards, form panel, review cards.' },
  { name: 'Forest ink', token: '--ink', light: '#16211b', dark: '#e8ece3', use: 'Headlines and body text.' },
  { name: 'Moss', token: '--ink-2', light: '#49554d', dark: '#a8b3aa', use: 'Secondary text. Passes AA on every surface.' },
  { name: 'Linden green', token: '--accent', light: '#2c5c43', dark: '#8cc5a2', use: 'The one accent. Buttons, links, active states.' },
  { name: 'Blossom', token: '--bloom', light: '#eee2a6', dark: '#3a3720', use: 'Quiet tint for one highlight per section. Never on controls.' },
];

export const inspirations = [
  {
    who: 'Havenise Studio', where: 'United States', title: 'Dental Website, Confidence Before the Appointment',
    url: 'https://dribbble.com/shots/27731839-Dental-Website-Confidence-Before-the-Appointment',
    took: 'Warm off-white base and a small card sitting on the hero photo. Ours carries opening hours instead of a booking widget.',
  },
  {
    who: 'Phenomenon Studio', where: 'United States', title: 'Bloom, mental health clinic',
    url: 'https://dribbble.com/shots/26661884-Mental-Health-Clinic-Web-Design-Bloom',
    took: 'The inset, rounded photo frame. It became the hero reveal: the frame opens out from an inset clip.',
  },
  {
    who: 'Phenomenon Studio', where: 'United States', title: 'Atelier Aesthetica, aesthetic clinic',
    url: 'https://dribbble.com/shots/27705580-Aesthetic-Clinic-Website-Design-Atelier-Aesthetica',
    took: 'Calm pacing, generous margins and short, declarative headlines.',
  },
  {
    who: 'Cuberto', where: 'San Francisco, CA', title: 'Website and motion concept for a dentist clinic',
    url: 'https://dribbble.com/shots/20124844-Motion-design-concept-for-dentist-clinic',
    took: 'Real, diverse faces and motion that feels playful without being loud. The cursor-follow photo on the services list comes from here.',
  },
  {
    who: 'Musemind', where: 'New York City, NY', title: "Women's hormone clinic",
    url: 'https://dribbble.com/shots/27787277-Healthcare-Website-UI-UX-Women-s-Hormone-Clinic-Web-Design',
    took: 'A single reassuring sentence given the whole screen. That is our scroll-filled manifesto.',
  },
  {
    who: 'Nixtio', where: 'New York City, NY', title: 'Dental clinic landing page',
    url: 'https://dribbble.com/shots/19948281-Dental-Clinic-Landing-Page',
    took: 'Big confident type set against photography, and process explained as a sequence of image cards.',
  },
  {
    who: 'Phenomenon Studio', where: 'United States', title: 'Nova Dental, team page',
    url: 'https://dribbble.com/shots/26633521-Nova-Dental-Team-Page-for-Dental-Website-UI-Design',
    took: 'Large portraits with a human detail beside each one, which shaped our team bios.',
  },
];

export const motion = [
  { name: 'Hero opening', why: 'Draws the eye to the photo first, then the promise.', how: 'clip-path inset to full frame, image eases from 1.28 to 1.08 scale, card lifts in last.' },
  { name: 'Line reveals', why: 'Gives each section heading a clear arrival without moving body text.', how: 'GSAP SplitText lines in a mask, once, on enter.' },
  { name: 'Manifesto fill', why: 'Reads the core promise at the visitor\'s pace.', how: 'Words go from 16% to 100% opacity, scrubbed to scroll.' },
  { name: 'First-visit pan', why: 'Tells the appointment as a sequence, which is what nervous patients want to know.', how: 'Section pins at the top; vertical scroll moves the track sideways. Swipeable list on touch screens.' },
  { name: 'Service preview', why: 'Puts a face to each service without adding images to the list.', how: 'A photo follows the cursor and swaps per row. Fine pointers only.' },
  { name: 'Parallax frames', why: 'Adds depth to framed photos so the calm layout does not feel flat.', how: 'Image drifts within its frame, about 5 to 8 percent.' },
  { name: 'Reading progress', why: 'Shows how much of a journal post is left.', how: 'A 3px bar under the nav, scrubbed to the article.' },
];
