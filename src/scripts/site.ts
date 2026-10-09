import { initContactForm } from './contact-form';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
if (!reduced.matches && 'IntersectionObserver' in window) root.classList.add('js-motion');

/* ---------- Header & menu ---------- */
const header = document.querySelector<HTMLElement>('#site-header');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#main-nav');
const mobileBar = document.querySelector<HTMLElement>('.mobile-bar');

function setMenu(open: boolean): void {
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav?.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
});
matchMedia('(min-width: 1200px)').addEventListener('change', () => setMenu(false));

/* ---------- Scroll-linked state (rAF-throttled) ---------- */
const curves = [...document.querySelectorAll<HTMLElement>('.journey-timeline, .journey-detailed')];
let ticking = false;
function onScroll(): void {
  const y = scrollY;
  header?.classList.toggle('is-scrolled', y > 24);
  mobileBar?.classList.toggle('is-visible', y > innerHeight * 0.6);
  if (!reduced.matches) {
    for (const el of curves) {
      const box = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight * 0.85 - box.top) / (box.height + innerHeight * 0.2)));
      el.style.setProperty(el.classList.contains('journey-detailed') ? '--progress' : '--draw', progress.toFixed(3));
    }
  }
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (root.classList.contains('js-motion')) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Count-up statistics ---------- */
function countUp(el: HTMLElement): void {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || reduced.matches) return;
  const start = performance.now();
  const duration = 1400;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
}
if ('IntersectionObserver' in window) {
  const counter = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
      counter.unobserve(entry.target);
    }
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-countup]').forEach((el) => counter.observe(el));
}

/* ---------- Carousels ---------- */
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector<HTMLElement>('.carousel-track');
  const controls = carousel.querySelector<HTMLElement>('.carousel-controls');
  if (!track || !controls) return;
  const [prev, next] = controls.querySelectorAll<HTMLButtonElement>('.carousel-btn');
  const bar = controls.querySelector<HTMLElement>('.carousel-progress span');
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    controls.hidden = max <= 4;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
    const ratio = track.clientWidth / track.scrollWidth;
    bar?.style.setProperty('--progress-w', `${Math.max(12, ratio * 100)}%`);
    bar?.style.setProperty('--progress-x', `${max > 0 ? (track.scrollLeft / max) * ((1 / ratio - 1) * 100) : 0}%`);
  };
  const scrollByCard = (dir: number) => {
    const card = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const amount = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amount, behavior: reduced.matches ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));
  track.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
});

initContactForm();
