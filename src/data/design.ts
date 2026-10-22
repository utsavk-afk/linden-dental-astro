// Design language colour tokens, rendered on /design and mirrored in DESIGN.md.
// Hex values mirror src/styles/global.css, so they stay in code. Each colour's name and
// "use" text is edited in the CMS (EmDash, Design language page > Colour) and read through
// getDesignPage() in src/lib/cms.ts, matched by token. If you add a token here, add a matching
// swatch entry (same token) in the CMS so it gets a name and use text.
export const palette = [
  { token: '--bg', light: '#f3f3ec', dark: '#0f1612' },
  { token: '--bg-2', light: '#e7eadf', dark: '#162019' },
  { token: '--surface', light: '#fbfbf7', dark: '#1b251f' },
  { token: '--ink', light: '#16211b', dark: '#e8ece3' },
  { token: '--ink-2', light: '#49554d', dark: '#a8b3aa' },
  { token: '--accent', light: '#2c5c43', dark: '#8cc5a2' },
  { token: '--bloom', light: '#eee2a6', dark: '#3a3720' },
];
