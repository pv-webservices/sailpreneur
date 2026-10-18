// Browser verification of the production build: every route at 320–1440px (overflow, images, H1),
// axe WCAG 2.1 AA on every route, tap targets, keyboard (skip link, focus visibility), reduced motion,
// site interactions, console errors and HTTP 404. Run against `npm run preview -- --port 4321`.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.QA_URL || 'http://127.0.0.1:4321';
const output = 'output/audit';
const WIDTHS = [320, 375, 768, 1024, 1440];
const MIN_TARGET = 24; // WCAG 2.2 target size (minimum), CSS px
await mkdir(output, { recursive: true });

async function findRoutes(dir) {
  const results = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...await findRoutes(path));
    else if (entry.name === 'index.html') results.push('/' + relative('dist', path).replaceAll('\\', '/').replace(/index\.html$/, ''));
  }
  return results;
}

const routes = (await findRoutes('dist')).sort();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
// The intentional 404 document status is logged by the browser; it is not a page error.
page.on('console', (msg) => { if (msg.type() === 'error' && !(page.url().includes('/missing-page-qa/') && msg.text().includes('404'))) errors.push(`${page.url()}: ${msg.text()}`); });
const report = { routes: routes.length, widths: WIDTHS, responsive: 0, accessibility: [], smallTargets: [], interactions: [], consoleErrors: errors };

/** Interactive elements smaller than 24x24, excluding links inside running text (WCAG 2.5.8 inline exception). */
const smallTargets = (min) => [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary')]
  .filter((el) => {
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height || getComputedStyle(el).visibility === 'hidden' || el.closest('[aria-hidden="true"], .honey')) return false;
    const inline = el.tagName === 'A' && el.closest('p, li, label, figcaption, small') && (el.closest('p, li, label, figcaption, small').textContent.trim().length > el.textContent.trim().length + 2);
    return !inline && (box.width < min || box.height < min);
  })
  .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 40)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);

try {
  for (const route of routes) {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      await page.evaluate(() => document.fonts.ready);
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        h1: document.querySelectorAll('h1').length,
        hiddenHeadings: [...document.querySelectorAll('h1,h2')].filter((el) => getComputedStyle(el).opacity === '0').length,
      }));
      assert.equal(state.overflow, false, `Horizontal scroll on ${route} at ${width}px`);
      assert.equal(state.h1, 1, `H1 count ${route}`);
      assert.equal(state.hiddenHeadings, 0, `Hidden heading ${route}`);
      // Scroll to trigger lazy loading, then require every image to have decoded.
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 15)); } scrollTo(0, 0); });
      await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; }));
      await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 });
      report.responsive += 1;
      if (width <= 375) {
        const small = await page.evaluate(smallTargets, MIN_TARGET);
        if (small.length) report.smallTargets.push({ route, width, small });
      }
      if (width === 375 || width === 1440) {
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        report.accessibility.push({ route, width, violations: result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')) })) });
      }
    }
    console.log(`Verified ${route}`);
  }

  // Keyboard: the first Tab reaches a visible skip link that moves focus to <main>.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + '/about/');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300); // let the slide-in transition finish
  const skip = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), top: document.activeElement?.getBoundingClientRect().top }));
  assert.equal(skip.text, 'Skip to content');
  assert.ok(skip.top >= 0, 'skip link visible when focused');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');
  report.interactions.push('Skip link is first in tab order, visible on focus, and moves focus to main');

  // Focus is visible on the first 25 tab stops.
  await page.goto(base + '/contact/');
  const invisible = [];
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press('Tab');
    const style = await page.evaluate(() => {
      const el = document.activeElement; const cs = getComputedStyle(el);
      return { label: `${el.tagName} ${(el.textContent || el.id).trim().slice(0, 30)}`, visible: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none' };
    });
    if (!style.visible) invisible.push(style.label);
  }
  assert.deepEqual(invisible, [], `Focus indicator missing on: ${invisible.join(', ')}`);
  report.interactions.push('Focus indicator visible on the first 25 tab stops of the contact page');

  // Reduced motion: continuous animations are off.
  await page.goto(base + '/');
  const motion = await page.evaluate(() => ['.hero-bg', '.marquee-track', '.hero-badge svg'].map((s) => { const el = document.querySelector(s); return el ? getComputedStyle(el).animationName : 'none'; }));
  assert.ok(motion.every((name) => name === 'none'), `Animations still running with reduced motion: ${motion}`);
  report.interactions.push('prefers-reduced-motion disables hero zoom, marquee and badge rotation');

  // Site interactions
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/');
  const menu = page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Programs', exact: true }).focus();
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  report.interactions.push('Mobile navigation opens and Escape closes it');
  await menu.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
  await page.waitForURL('**/contact/');
  report.interactions.push('Mobile navigation reaches the contact page');
  await page.goto(base + '/faq/');
  const faq = page.locator('details').filter({ hasText: 'Does AKMICS guarantee a cruise job?' });
  await faq.locator('summary').focus();
  await page.keyboard.press('Enter');
  assert(await faq.getAttribute('open') !== null);
  report.interactions.push('FAQ opens with the keyboard');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + '/');
  const track = page.locator('.story-track');
  await track.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Next story' }).click();
  await page.waitForTimeout(400);
  assert((await track.evaluate((el) => el.scrollLeft)) > 0);
  report.interactions.push('Success-story carousel controls scroll the gallery');

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const basic = await noJs.newPage();
  await basic.goto(base + '/');
  assert(await basic.locator('h1').isVisible());
  assert(await basic.getByRole('navigation', { name: 'Main navigation' }).isVisible());
  await basic.goto(base + '/contact/');
  assert(await basic.getByRole('button', { name: 'Send Enquiry' }).isEnabled());
  report.interactions.push('Without JavaScript, content, navigation and the enquiry form all work');
  await noJs.close();

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/');
  await page.screenshot({ path: `${output}/home-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base + '/');
  await page.screenshot({ path: `${output}/home-mobile.png`, fullPage: true });
  await page.goto(base + '/contact/');
  await page.screenshot({ path: `${output}/contact-mobile.png`, fullPage: true });

  const missing = await context.request.get(base + '/missing-page-qa/');
  assert.equal(missing.status(), 404);
  assert.ok((await missing.text()).includes('back on course'), 'custom 404 page served');
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/missing-page-qa/');
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    report.accessibility.push({ route: '/404/', width, violations: result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')) })) });
  }
  report.interactions.push('Unknown route returns HTTP 404 with the branded page (axe-scanned)');
  assert.equal(errors.length, 0, `Console errors: ${errors.join('\n')}`);
} finally {
  await writeFile(`${output}/verification.json`, JSON.stringify(report, null, 2));
  await browser.close();
}

const violations = report.accessibility.flatMap((r) => r.violations.map((v) => ({ route: r.route, width: r.width, ...v })));
console.log(JSON.stringify({ routes: report.routes, responsiveChecks: report.responsive, axeScans: report.accessibility.length, violations: violations.length, smallTargets: report.smallTargets.length, interactions: report.interactions.length, consoleErrors: errors.length }, null, 2));
if (violations.length) console.error(JSON.stringify(violations, null, 1));
if (report.smallTargets.length) console.error(JSON.stringify(report.smallTargets, null, 1));
if (violations.length || report.smallTargets.length) process.exitCode = 1;
