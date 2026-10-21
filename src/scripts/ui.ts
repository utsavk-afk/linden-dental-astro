// Small UI behaviours, re-bound on every Astro page load (View Transitions keep the JS alive).

const THEME_KEY = 'linden-theme';

export function applyStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch { /* storage blocked: follow the system setting */ }
}

// Document-level listeners are tied to this controller and dropped on each page swap.
let pageListeners: AbortController | null = null;

const currentTheme = () =>
  document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function themeToggle() {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    btn.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      btn.setAttribute('aria-pressed', String(next === 'dark'));
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    });
  }
}

function menu(signal: AbortSignal) {
  const header = document.querySelector<HTMLElement>('[data-nav]');
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const sheet = document.querySelector<HTMLElement>('[data-menu]');
  if (!header || !btn || !sheet) return;
  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
  const set = (open: boolean) => {
    header.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) sheet.querySelector<HTMLElement>('a, button')?.focus();
  };
  btn.addEventListener('click', () => set(!isOpen()));
  sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { set(false); btn.focus(); return; }
    if (e.key !== 'Tab') return;
    // Keep focus inside the open menu: the toggle button plus the sheet's links.
    const stops = [btn, ...sheet.querySelectorAll<HTMLElement>('a, button')];
    const i = stops.indexOf(document.activeElement as HTMLElement);
    const next = e.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : (i === stops.length - 1 ? 0 : i + 1);
    e.preventDefault();
    stops[next].focus();
  }, { signal });
}

function bookingForm() {
  const form = document.querySelector<HTMLFormElement>('[data-book-form]');
  if (!form) return;
  const success = document.querySelector<HTMLElement>('[data-book-success]');
  const messages: Record<string, string> = {
    name: 'Please tell us your name.',
    email: 'We need an email to confirm your visit.',
    phone: 'A phone number helps if we need to move things around.',
    reason: 'Pick the closest reason. You can explain more below.',
  };

  const showError = (field: HTMLInputElement | HTMLSelectElement, msg: string) => {
    const err = form.querySelector<HTMLElement>(`#${field.name}-error`);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
  };

  const check = (field: HTMLInputElement | HTMLSelectElement) => {
    if (!(field.name in messages)) return true;
    let msg = '';
    if (field.validity.valueMissing) msg = messages[field.name];
    else if (field.validity.typeMismatch) msg = field.type === 'email' ? 'That email looks incomplete.' : 'Please check this field.';
    else if (field.validity.patternMismatch) msg = 'Use digits, for example 503 555 0142.';
    showError(field, msg);
    return !msg;
  };

  form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach((f) => {
    f.addEventListener('blur', () => f.value && check(f));
    f.addEventListener('input', () => f.getAttribute('aria-invalid') === 'true' && check(f));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[name], select[name]'));
    const bad = fields.filter((f) => !check(f));
    if (bad.length) { bad[0].focus(); return; }
    const submit = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (submit) { submit.disabled = true; submit.dataset.loading = 'true'; }
    // Concept site: no backend. Swap this for a real endpoint (Formspree, Netlify Forms, practice software).
    await new Promise((r) => setTimeout(r, 900));
    const first = (form.elements.namedItem('name') as HTMLInputElement).value.split(' ')[0];
    form.hidden = true;
    if (success) {
      const n = success.querySelector('[data-first-name]');
      if (n) n.textContent = first;
      success.hidden = false;
      success.focus();
    }
  });
}

function marqueeToggle() {
  const btn = document.querySelector<HTMLButtonElement>('[data-marquee-toggle]');
  const marquee = document.querySelector<HTMLElement>('.marquee');
  if (!btn || !marquee) return;
  const label = btn.querySelector('.reviews__pause-label');
  btn.addEventListener('click', () => {
    const paused = marquee.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    if (label) label.textContent = paused ? 'Play' : 'Pause';
  });
}

export function initUI() {
  pageListeners?.abort();
  pageListeners = new AbortController();
  document.body.style.overflow = '';
  themeToggle();
  menu(pageListeners.signal);
  marqueeToggle();
  bookingForm();
}
