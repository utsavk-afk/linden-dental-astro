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
  // Copy comes from the CMS via data-msg-* attributes on the form; the defaults keep old builds working.
  const d = form.dataset;
  const t = {
    emailInvalid: d.msgEmailInvalid || 'That email looks incomplete.',
    phonePattern: d.msgPhonePattern || 'Use digits, for example 503 555 0142.',
    invalid: d.msgInvalid || 'Please check this field.',
    sendFailed: d.msgSendFailed || 'We could not send that just now.',
    retry: d.msgRetry || 'Please try again, or call us.',
  };
  const messages: Record<string, string> = {
    name: d.msgName || 'Please tell us your name.',
    email: d.msgEmailMissing || 'We need an email to confirm your visit.',
    phone: d.msgPhoneMissing || 'A phone number helps if we need to move things around.',
    reason: d.msgReason || 'Pick the closest reason. You can explain more below.',
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
    else if (field.validity.typeMismatch) msg = field.type === 'email' ? t.emailInvalid : t.invalid;
    else if (field.validity.patternMismatch) msg = t.phonePattern;
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
    const formError = form.querySelector<HTMLElement>('[data-form-error]');
    if (formError) formError.hidden = true;
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      const data = new FormData(form);
      const payload = {
        who: data.get('who'), name: data.get('name'), phone: data.get('phone'), email: data.get('email'),
        reason: data.get('reason'), days: data.getAll('days'), nervous: data.get('nervous') === 'on',
        notes: data.get('notes'), company: data.get('company'),
      };
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || t.sendFailed);
        }
      } catch (err) {
        if (submit) { submit.disabled = false; delete submit.dataset.loading; }
        if (formError) {
          formError.textContent = `${err instanceof Error ? err.message : t.sendFailed} ${t.retry}`;
          formError.hidden = false;
          formError.focus?.();
        }
        return;
      }
    } else {
      // Concept build: no backend configured, so simulate the send.
      await new Promise((r) => setTimeout(r, 900));
    }
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
  const pauseText = btn.dataset.labelPause || 'Pause';
  const playText = btn.dataset.labelPlay || 'Play';
  btn.addEventListener('click', () => {
    const paused = marquee.classList.toggle('is-paused');
    btn.setAttribute('aria-pressed', String(paused));
    if (label) label.textContent = paused ? playText : pauseText;
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
