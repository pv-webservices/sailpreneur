// End-to-end tests for the enquiry form against the production build (npm run preview).
// /api/enquiry is intercepted in the browser for every test: no request reaches a real mail server.
// Run: npm run preview -- --port 4321 (second terminal) then npm run test:e2e
import { test, before, after, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE = process.env.QA_URL || 'http://127.0.0.1:4321';
const API = '**/api/enquiry';
let browser;
let context;
let page;
let consoleErrors;

const VALID = { name: 'Synthetic QA', phone: '+91 90000 00000', email: 'qa@example.invalid', profession: 'Hotel management graduate', message: 'Synthetic enquiry for automated testing only.' };

async function fillValid(target = page, values = VALID) {
  // Consent first: blur validation of earlier fields can shift the layout under a pending click.
  await target.locator('#consent').check();
  await target.getByLabel('Full name').fill(values.name);
  await target.getByLabel('Phone / WhatsApp number').fill(values.phone);
  await target.getByLabel('Email').fill(values.email);
  await target.getByLabel('Education / profession').fill(values.profession);
  await target.getByLabel('How can we help?').fill(values.message);
}

const submit = () => page.getByRole('button', { name: 'Send Enquiry' }).click();
const statusText = () => page.locator('#form-status').innerText();
const respondWith = (status, body) => page.route(API, (route) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }));

async function expectDataKept() {
  assert.equal(await page.getByLabel('Full name').inputValue(), VALID.name);
  assert.equal(await page.getByLabel('How can we help?').inputValue(), VALID.message);
  assert.equal(await page.getByRole('button', { name: 'Send Enquiry' }).isEnabled(), true, 'button re-enabled after failure');
}

before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });
beforeEach(async () => {
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route('https://wa.me/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }));
  page = await context.newPage();
  consoleErrors = [];
  page.on('pageerror', (error) => consoleErrors.push(String(error)));
  page.on('console', (msg) => { if (msg.type() === 'error' && !/Failed to load resource/.test(msg.text())) consoleErrors.push(msg.text()); });
  await page.goto(`${BASE}/contact/`);
});
afterEach(async () => {
  await context.close();
  assert.deepEqual(consoleErrors, [], 'no JavaScript errors');
});

describe('with JavaScript', () => {
  test('success sends JSON with timing fields and lands on /thank-you/', async () => {
    let body;
    await page.route(API, async (route) => { body = route.request().postDataJSON(); await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"redirect":"/thank-you/"}' }); });
    await fillValid();
    await submit();
    await page.waitForURL('**/thank-you/');
    assert.match(await page.locator('h1').innerText(), /Thank you/);
    assert.equal(body.name, VALID.name);
    assert.equal(body.consent, true);
    assert.equal(body.website, '');
    assert.ok(Number(body.sentAt) >= Number(body.started), 'timer fields present');
    assert.match(body.page, /\/contact\/$/);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('akmics-enquiry-draft')), null, 'draft cleared after success');
  });

  test('empty submit shows a summary, field messages linked by aria, and focuses the first invalid field', async () => {
    let requests = 0;
    await page.route(API, (route) => { requests += 1; return route.abort(); });
    await submit();
    const summary = page.locator('#form-summary');
    assert.equal(await summary.isVisible(), true);
    assert.match(await summary.innerText(), /6 fields need your attention/);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'name');
    for (const id of ['name', 'phone', 'email', 'profession', 'message', 'consent']) {
      const field = page.locator(`#${id}`);
      assert.equal(await field.getAttribute('aria-invalid'), 'true', id);
      assert.equal(await field.getAttribute('aria-describedby'), `${id}-error`, id);
      assert.ok((await page.locator(`#${id}-error`).innerText()).length > 10, `${id} message`);
    }
    assert.equal(requests, 0, 'nothing sent');
  });

  test('checks formats and minimum lengths on programmatic values', async () => {
    await fillValid(page, { ...VALID, name: 'A', email: 'nope@', phone: '98765 4321', message: 'Too short' });
    await submit(); // the message box is still focused: the click must not be lost to a layout shift
    assert.equal(await page.locator('#form-summary').isVisible(), true, 'submit registered on first click');
    assert.match(await page.locator('#name-error').innerText(), /at least 2 characters/);
    assert.match(await page.locator('#email-error').innerText(), /valid email/);
    assert.match(await page.locator('#phone-error').innerText(), /10 to 15 digits/);
    assert.match(await page.locator('#message-error').innerText(), /at least 10 characters/);
    await page.getByLabel('Full name').fill('Anita');
    assert.equal(await page.locator('#name-error').isHidden(), true, 'error clears as the visitor fixes it');
  });

  test('server-side field errors are shown on the fields', async () => {
    await respondWith(422, { ok: false, error: 'invalid', errors: { email: 'Enter a valid email address, like name@example.com.' } });
    await fillValid();
    await submit();
    await page.locator('#email-error').waitFor();
    assert.match(await page.locator('#email-error').innerText(), /valid email/);
    await expectDataKept();
  });

  for (const [status, error, pattern] of [[429, 'rate_limited', /several enquiries/], [500, 'not_configured', /temporarily unavailable/], [502, 'delivery_failed', /could not be delivered/]]) {
    test(`${status} ${error} shows its message with phone, WhatsApp and email alternatives and keeps the data`, async () => {
      await respondWith(status, { ok: false, error });
      await fillValid();
      await submit();
      await page.waitForFunction(() => document.querySelector('#form-status')?.classList.contains('is-error'));
      const text = await statusText();
      assert.match(text, pattern);
      assert.match(text, /\+91 9185282229/);
      assert.match(text, /info@cruisejobmentor\.com/);
      assert.match(await page.locator('#form-status a.js-whatsapp').getAttribute('href'), /^https:\/\/wa\.me\/919185282229\?text=/);
      await expectDataKept();
    });
  }

  test('network failure shows a connection message and keeps the data', async () => {
    await page.route(API, (route) => route.abort('failed'));
    await fillValid();
    await submit();
    await page.waitForFunction(() => document.querySelector('#form-status')?.classList.contains('is-error'));
    assert.match(await statusText(), /couldn’t reach the server/);
    await expectDataKept();
  });

  test('offline shows the offline message without sending', async () => {
    let requests = 0;
    await page.route(API, (route) => { requests += 1; return route.abort(); });
    await fillValid();
    await context.setOffline(true);
    await submit();
    assert.match(await statusText(), /appear to be offline/);
    await context.setOffline(false);
    assert.equal(requests, 0);
    await expectDataKept();
  });

  test('a request that hangs for 20 seconds times out with a timeout message', async () => {
    await page.clock.install();
    await page.reload();
    await page.route(API, () => { /* never answer */ });
    await fillValid();
    await submit();
    await page.waitForFunction(() => document.querySelector('#form-status')?.textContent?.includes('Sending'));
    assert.equal(await page.getByRole('button', { name: 'Send Enquiry' }).isDisabled(), true, 'disabled while sending');
    await page.clock.runFor(20_100);
    await page.waitForFunction(() => document.querySelector('#form-status')?.classList.contains('is-error'));
    assert.match(await statusText(), /took too long/);
    await expectDataKept();
  });

  test('Back-button return (pageshow persisted) re-enables the button', async () => {
    await page.route(API, () => { /* hang */ });
    await fillValid();
    await submit();
    assert.equal(await page.getByRole('button', { name: 'Send Enquiry' }).isDisabled(), true);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    assert.equal(await page.getByRole('button', { name: 'Send Enquiry' }).isEnabled(), true);
  });

  test('a draft survives a reload', async () => {
    await fillValid();
    await page.reload();
    assert.equal(await page.getByLabel('Full name').inputValue(), VALID.name);
    assert.equal(await page.getByLabel('How can we help?').inputValue(), VALID.message);
  });

  test('Send via WhatsApp opens WhatsApp with the message pre-filled (no form validation, no timer)', async () => {
    let requests = 0;
    await page.route(API, (route) => { requests += 1; return route.abort(); });
    await page.getByLabel('Full name').fill('Synthetic QA');
    await page.getByLabel('How can we help?').fill('Interested in galley roles.');
    const [popup] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: 'Send via WhatsApp' }).click()]);
    const url = decodeURIComponent(popup.url());
    assert.match(url, /^https:\/\/wa\.me\/919185282229\?text=/);
    assert.ok(url.includes('Name: Synthetic QA') && url.includes('Interested in galley roles.'));
    assert.equal(requests, 0);
  });

  test('department links pre-select the department', async () => {
    await page.goto(`${BASE}/contact/?department=food-beverage`);
    assert.equal(await page.locator('#department').inputValue(), 'food-beverage');
  });
});

describe('without JavaScript', () => {
  test('the form posts natively and a 303 lands on /thank-you/', async () => {
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const basic = await noJs.newPage();
    let posted;
    await basic.route(API, async (route) => {
      posted = { method: route.request().method(), type: route.request().headers()['content-type'], body: new URLSearchParams(route.request().postData()) };
      await route.fulfill({ status: 303, headers: { Location: `${BASE}/thank-you/` } });
    });
    await basic.goto(`${BASE}/contact/`);
    assert.equal(await basic.getByRole('button', { name: 'Send Enquiry' }).isEnabled(), true);
    assert.equal(await basic.getByRole('button', { name: 'Send via WhatsApp' }).isVisible(), false, 'WhatsApp button needs JS');
    await fillValid(basic);
    await basic.getByRole('button', { name: 'Send Enquiry' }).click();
    await basic.waitForURL('**/thank-you/');
    assert.equal(posted.method, 'POST');
    assert.match(posted.type, /application\/x-www-form-urlencoded/);
    assert.equal(posted.body.get('name'), VALID.name);
    assert.equal(posted.body.get('consent'), 'yes');
    await noJs.close();
  });
});
