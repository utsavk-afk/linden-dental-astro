// GSAP motion layer. Every effect is opt-in via a data attribute and only runs when the
// visitor has not asked for reduced motion. Content is visible without JS: the inline
// script in Base.astro adds `.motion` (which pre-hides reveal targets) and removes it
// again if this module has not reported ready within a few seconds.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
// Dev only: lets browser QA scripts inspect live triggers.
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

declare global {
  interface Window { __motionReady?: boolean }
}

const EASE = 'expo.out';
let mm: gsap.MatchMedia | null = null;

function q<T extends Element = HTMLElement>(sel: string, root: ParentNode = document) {
  return Array.from(root.querySelectorAll<T & Element>(sel)) as unknown as T[];
}

/** Hero: photo opens from an inset frame, card floats in, image drifts on scroll. */
function hero() {
  const el = document.querySelector<HTMLElement>('[data-hero]');
  if (!el) return;
  const frame = el.querySelector('[data-hero-frame]');
  const img = el.querySelector('[data-hero-frame] img');
  const card = el.querySelector('[data-hero-card]');
  const fade = q('[data-hero-fade]', el);
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  if (frame) tl.fromTo(frame, { clipPath: 'inset(14% 12% 14% 12% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.6 }, 0.1);
  if (img) tl.fromTo(img, { scale: 1.28 }, { scale: 1.08, duration: 1.9 }, 0.1);
  if (fade.length) tl.fromTo(fade, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.55);
  if (card) tl.fromTo(card, { y: 40, opacity: 0, rotate: -2 }, { y: 0, opacity: 1, rotate: 0, duration: 1.2 }, 0.9);
  if (img) {
    gsap.to(img, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/** Headlines: lines rise out of a mask when they enter the viewport. */
function headings() {
  for (const el of q('[data-split]')) {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 112, duration: 1.15, ease: EASE, stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  }
}

/** Blocks fade up in small batches as they scroll in. */
function reveals() {
  const els = q('[data-reveal]');
  if (!els.length) return;
  gsap.set(els, { y: 32 });
  ScrollTrigger.batch(els, {
    start: 'top 90%', once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.09, overwrite: true }),
  });
}

/** Photos drift slightly slower than the page, which gives the framed images depth. */
function parallax() {
  for (const wrap of q('[data-parallax]')) {
    const img = wrap.querySelector('img');
    if (!img) continue;
    const amt = Number(wrap.dataset.parallax || 8);
    gsap.fromTo(img, { yPercent: -amt, scale: 1.18 }, {
      yPercent: amt, scale: 1.18, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}

/** Manifesto: words fill in as you read down the paragraph. */
function scrubWords() {
  for (const el of q('[data-scrub-words]')) {
    SplitText.create(el, {
      type: 'words', autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(self.words, { opacity: 0.16 }, {
          opacity: 1, ease: 'none', stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 50%', scrub: 0.6 },
        });
      },
    });
  }
}

/** First visit: vertical scroll pans a pinned track sideways (desktop only). */
function horizontalPan() {
  for (const wrap of q('[data-hpan]')) {
    const track = wrap.querySelector<HTMLElement>('[data-hpan-track]');
    const bar = wrap.querySelector<HTMLElement>('[data-hpan-bar]');
    if (!track) continue;
    wrap.classList.add('is-pinned');
    // Pan until the last card sits on the right gutter. scrollWidth ignores the track's
    // end padding when overflow is visible, so measure the last card instead.
    const distance = () => {
      const last = track.lastElementChild;
      if (!last) return 0;
      const padEnd = parseFloat(getComputedStyle(track).paddingRight) || 0;
      // Both rects carry the same translateX, so their difference is transform-proof.
      const contentRight = last.getBoundingClientRect().right - track.getBoundingClientRect().left;
      return Math.max(0, Math.round(contentRight + padEnd - track.clientWidth));
    };
    // refreshPriority: the pin adds scroll distance, so it must be measured before the
    // reveal/parallax triggers further down the page.
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
      },
    });
    if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: wrap, start: 'top top', end: () => `+=${distance()}`, scrub: true, refreshPriority: 1 } });
    // Lazy images in the track sit outside the clipped section until panned in, so the
    // browser would only start fetching them mid-pan. Load them as the section approaches.
    ScrollTrigger.create({
      trigger: wrap, start: 'top 250%', once: true,
      onEnter: () => track.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; }),
    });
    q('[data-hpan-step]', wrap).forEach((step) => {
      const items = step.querySelectorAll('[data-hpan-in]');
      // Cards already on screen before the pan starts rise in as the section scrolls up;
      // the rest rise in as the pan brings them into view.
      const onScreen = step.getBoundingClientRect().left - track.getBoundingClientRect().left < window.innerWidth * 0.8;
      gsap.from(items, {
        y: 40, opacity: 0, stagger: 0.08, ease: EASE, duration: 1,
        scrollTrigger: onScreen
          ? { trigger: wrap, start: 'top 70%', once: true }
          : { trigger: step, containerAnimation: tween, start: 'left 85%', once: true },
      });
    });
    return () => wrap.classList.remove('is-pinned');
  }
}

/** Services index: a photo follows the cursor and swaps to the hovered row. */
function hoverReveal() {
  for (const list of q('[data-hover-reveal]')) {
    const media = list.querySelector<HTMLElement>('[data-hover-media]');
    if (!media) continue;
    const imgs = q('[data-hover-img]', media);
    const xTo = gsap.quickTo(media, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(media, 'y', { duration: 0.6, ease: 'power3' });
    gsap.set(media, { autoAlpha: 0, scale: 0.85, xPercent: -50, yPercent: -50 });
    const move = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      xTo(e.clientX - r.left); yTo(e.clientY - r.top);
    };
    const enterList = () => gsap.to(media, { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE });
    const leaveList = () => gsap.to(media, { autoAlpha: 0, scale: 0.85, duration: 0.4, ease: 'power2.out' });
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerenter', enterList);
    list.addEventListener('pointerleave', leaveList);
    const rows = q('[data-hover-row]', list);
    const enters = rows.map((row, i) => {
      const fn = () => imgs.forEach((img, j) => gsap.to(img, { autoAlpha: i === j ? 1 : 0, scale: i === j ? 1 : 1.08, duration: 0.5, ease: EASE }));
      row.addEventListener('pointerenter', fn);
      return fn;
    });
    return () => {
      list.removeEventListener('pointermove', move);
      list.removeEventListener('pointerenter', enterList);
      list.removeEventListener('pointerleave', leaveList);
      rows.forEach((row, i) => row.removeEventListener('pointerenter', enters[i]));
    };
  }
}

/** Journal posts: reading progress under the nav. */
function progress() {
  const bar = document.querySelector('[data-progress]');
  const article = document.querySelector('[data-article]');
  if (!bar || !article) return;
  gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: article, start: 'clamp(top 20%)', end: 'bottom bottom', scrub: true } });
}

/** Nav tucks away while reading down, returns on any upward scroll. */
function nav() {
  const header = document.querySelector<HTMLElement>('[data-nav]');
  if (!header) return;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      header.classList.toggle('is-scrolled', y > 24);
      const hide = self.direction === 1 && y > 320 && !header.classList.contains('menu-open');
      header.classList.toggle('is-hidden', hide);
    },
  });
}

/**
 * EmDash Edit mode (an editor toggled it in the toolbar): text is edited in place, so nothing
 * may be split into lines/words or start hidden. The page then behaves as with reduced motion.
 */
const isEditMode = () => !!document.querySelector('#emdash-toolbar[data-edit-mode="true"]');

export function initMotion() {
  const root = document.documentElement;
  mm = gsap.matchMedia();
  const MOTION = '(prefers-reduced-motion: no-preference)';
  mm.add('all', () => { nav(); });
  if (isEditMode()) {
    root.classList.remove('motion');
    window.__motionReady = true;
    return;
  }
  mm.add('(prefers-reduced-motion: reduce)', () => { root.classList.remove('motion'); });
  // Separate contexts so crossing the 900px breakpoint (or plugging in a mouse) only
  // rebuilds the pan or the hover photo, instead of replaying the whole page intro.
  // The pan is created first and carries refreshPriority, so triggers below it always
  // account for the pinned scroll distance, whichever context is rebuilt later.
  mm.add(`${MOTION} and (min-width: 900px)`, () => horizontalPan());
  mm.add(MOTION, () => {
    root.classList.add('motion');
    hero(); headings(); reveals(); parallax(); scrubWords(); progress();
  });
  mm.add(`${MOTION} and (hover: hover) and (pointer: fine)`, () => hoverReveal());
  window.__motionReady = true;
  // Images and fonts change layout; re-measure pins once everything has settled.
  // (On client-side navigations `load` has already fired, so don't stack listeners.)
  if (document.readyState !== 'complete') window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export function destroyMotion() {
  mm?.revert();
  mm = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}
