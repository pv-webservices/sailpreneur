// Unit tests for the enquiry function. The mail transport is mocked: nothing is ever sent.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { createEnquiryHandler, MIN_FILL_MS, type EnquiryDeps } from '../../netlify/lib/enquiry.ts';
import { composeEnquiryEmail, formatIndiaTime, headerSafe } from '../../netlify/lib/email.ts';
import { createRateLimiter, memoryStore, withFallback, RATE_LIMIT } from '../../netlify/lib/rate-limit.ts';
import type { MailConfig } from '../../netlify/lib/config.ts';
import type { MailMessage } from '../../netlify/lib/email.ts';
import { departments } from '../../src/data/site.ts';

const NOW = Date.UTC(2026, 9, 18, 9, 30); // 18 Oct 2026, 15:00 IST
const ORIGIN = 'https://cruisejobmentor.com';
const ENV = { SMTP_HOST: 'smtp.zoho.in', SMTP_PORT: '465', SMTP_USER: 'info@cruisejobmentor.com', SMTP_PASS: 'test-only-not-a-password', MAIL_TO: 'info@cruisejobmentor.com', MAIL_FROM: 'info@cruisejobmentor.com' };

const valid = {
  name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43210', profession: 'Hotel management graduate',
  department: 'food-beverage', message: 'I would like to know about F&B roles on cruise ships.', consent: true,
  website: '', form_type: 'Contact page enquiry', page: 'https://cruisejobmentor.com/contact/', started: NOW - 30_000, sentAt: NOW,
};

function setup(overrides: Partial<EnquiryDeps> = {}) {
  const sent: { config: MailConfig; message: MailMessage }[] = [];
  const events: string[] = [];
  const handler = createEnquiryHandler({
    env: ENV,
    send: async (config, message) => { sent.push({ config, message }); },
    rateLimiter: createRateLimiter(memoryStore()),
    departments,
    now: () => NOW,
    log: (event) => events.push(event),
    ...overrides,
  });
  return { handler, sent, events };
}

const jsonRequest = (body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  new Request('https://cruisejobmentor.com/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers }, body: JSON.stringify(body) });

const formRequest = (body: Record<string, string>, headers: Record<string, string> = {}) =>
  new Request('https://cruisejobmentor.com/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: ORIGIN, ...headers }, body: new URLSearchParams(body).toString() });

describe('successful enquiry', () => {
  test('sends from the academy mailbox with the visitor as display name and Reply-To', async () => {
    const { handler, sent } = setup();
    const response = await handler(jsonRequest(valid), { ip: '203.0.113.5' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, redirect: '/thank-you/' });
    assert.equal(sent.length, 1);
    const { message } = sent[0];
    assert.deepEqual(message.from, { name: 'Priya Sharma via AKMICS Website', address: 'info@cruisejobmentor.com' });
    assert.deepEqual(message.replyTo, { name: 'Priya Sharma', address: 'priya@example.com' });
    assert.equal(message.to, 'info@cruisejobmentor.com');
    assert.equal(message.subject, 'New enquiry from Priya Sharma: Food & Beverage');
  });

  test('email body has every field, the source page and India time, with no third-party branding', async () => {
    const { handler, sent } = setup();
    await handler(jsonRequest(valid));
    const { text, html } = sent[0].message;
    for (const value of ['Contact page enquiry', 'Priya Sharma', 'priya@example.com', '+91 98765 43210', 'Hotel management graduate', 'Food & Beverage', 'F&B roles', 'https://cruisejobmentor.com/contact/', 'IST']) {
      assert.ok(text.includes(value), `text missing ${value}`);
    }
    assert.ok(html.includes('<table'));
    assert.ok(html.includes('Food &amp; Beverage'));
    assert.doesNotMatch(text + html, /formsubmit|netlify forms|powered by/i);
  });

  test('formats submission time in Asia/Kolkata', () => {
    assert.match(formatIndiaTime(new Date(NOW)), /18 October 2026.*3:00\s?pm IST/i);
  });
});

describe('validation', () => {
  test('returns field errors for invalid email, short phone, short message and long name', async () => {
    const { handler, sent } = setup();
    const response = await handler(jsonRequest({ ...valid, email: 'not-an-email', phone: '12345', message: 'short', name: 'x'.repeat(101) }));
    assert.equal(response.status, 422);
    const body = await response.json();
    assert.equal(body.error, 'invalid');
    assert.deepEqual(Object.keys(body.errors).sort(), ['email', 'message', 'name', 'phone']);
    assert.equal(sent.length, 0);
  });

  test('requires every mandatory field', async () => {
    const { handler } = setup();
    const response = await handler(jsonRequest({ started: valid.started, sentAt: valid.sentAt }));
    const body = await response.json();
    assert.deepEqual(Object.keys(body.errors).sort(), ['consent', 'email', 'message', 'name', 'phone', 'profession']);
  });

  test('phone must have 10 to 15 digits', async () => {
    const { handler } = setup();
    assert.equal((await handler(jsonRequest({ ...valid, phone: '98765 43210' }), { ip: 'a' })).status, 200, '10 digits');
    assert.equal((await handler(jsonRequest({ ...valid, phone: '+44 7911 123456 789' }), { ip: 'b' })).status, 200, '15 digits');
    assert.equal((await handler(jsonRequest({ ...valid, phone: '9876 54321' }), { ip: 'c' })).status, 422, '9 digits');
    assert.equal((await handler(jsonRequest({ ...valid, phone: '+44 7911 123456 7890' }), { ip: 'd' })).status, 422, '16 digits');
    assert.equal((await handler(jsonRequest({ ...valid, phone: '98765abc43210' }), { ip: 'e' })).status, 422, 'letters');
  });

  test('rejects a department that is not in the list', async () => {
    const { handler } = setup();
    const body = await (await handler(jsonRequest({ ...valid, department: 'captain' }))).json();
    assert.ok(body.errors.department);
  });

  test('consent is required', async () => {
    const { handler, sent } = setup();
    const response = await handler(jsonRequest({ ...valid, consent: false }));
    assert.equal(response.status, 422);
    assert.ok((await response.json()).errors.consent);
    assert.equal(sent.length, 0);
  });

  test('rejects oversized bodies', async () => {
    const { handler } = setup();
    assert.equal((await handler(jsonRequest({ ...valid, message: 'x'.repeat(25_000) }))).status, 413);
  });

  test('rejects non-POST methods', async () => {
    const { handler } = setup();
    assert.equal((await handler(new Request('https://cruisejobmentor.com/api/enquiry', { method: 'GET', headers: { Origin: ORIGIN } }))).status, 405);
  });
});

describe('spam protection', () => {
  test('honeypot submissions are accepted silently and discarded', async () => {
    const { handler, sent } = setup();
    const response = await handler(jsonRequest({ ...valid, website: 'https://spam.example' }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
    assert.equal(sent.length, 0);
  });

  test('submissions faster than 3 seconds are accepted silently and discarded', async () => {
    const { handler, sent } = setup();
    const response = await handler(jsonRequest({ ...valid, started: NOW - (MIN_FILL_MS - 1), sentAt: NOW }));
    assert.equal(response.status, 200);
    assert.equal(sent.length, 0);
  });

  test('JSON submissions without timing are treated as bots', async () => {
    const { handler, sent } = setup();
    const { started, sentAt, ...rest } = valid;
    assert.equal((await handler(jsonRequest(rest))).status, 200);
    assert.equal(sent.length, 0);
  });

  test('origin allow-list: foreign and missing origins are refused; www, previews and localhost are allowed', async () => {
    const { handler, sent } = setup();
    assert.equal((await handler(jsonRequest(valid, { Origin: 'https://evil.example' }))).status, 403);
    const noOrigin = new Request('https://cruisejobmentor.com/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
    assert.equal((await handler(noOrigin)).status, 403);
    for (const origin of ['https://www.cruisejobmentor.com', 'https://deploy-preview-3--sailpreneur.netlify.app', 'http://127.0.0.1:4321', 'http://localhost:8888']) {
      assert.equal((await handler(jsonRequest(valid, { Origin: origin }), { ip: origin })).status, 200, origin);
    }
    assert.equal(sent.length, 4);
    assert.equal((await handler(jsonRequest(valid, { Origin: 'https://sailpreneur.netlify.app.evil.example' }))).status, 403);
  });

  test('strips line breaks from header values (no header injection)', async () => {
    const { handler, sent } = setup();
    const response = await handler(jsonRequest({ ...valid, name: 'Eve\r\nBcc: victim@example.com' }));
    // Line breaks are collapsed to spaces before anything reaches a header.
    assert.equal(response.status, 200);
    assert.equal(sent[0].message.from.name, 'Eve Bcc: victim@example.com via AKMICS Website');
    assert.doesNotMatch(sent[0].message.subject, /[\r\n]/);
    const raw = String((await nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' }).sendMail(sent[0].message)).message);
    assert.doesNotMatch(raw.slice(0, raw.indexOf('\n\n')), /^Bcc:/im);
    assert.equal(headerSafe('Eve\r\nBcc: victim@example.com'), 'Eve Bcc: victim@example.com');
    const message = composeEnquiryEmail({ ...valid, name: 'Eve\r\nBcc: x@example.com', consent: true }, { formType: 'X\r\nY', departmentName: 'Deck\nDepartment', pageUrl: '', submittedAt: new Date(NOW), flagged: false }, { to: ENV.MAIL_TO, from: ENV.MAIL_FROM });
    assert.doesNotMatch(message.subject + message.from.name + message.replyTo.name + Object.values(message.headers).join(''), /[\r\n]/);
  });

  test('HTML-escapes visitor input in the email body', async () => {
    const { handler, sent } = setup();
    await handler(jsonRequest({ ...valid, message: '<script>alert(1)</script> I want to join the galley team.' }));
    assert.ok(sent[0].message.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.ok(!sent[0].message.html.includes('<script>'));
  });

  test('suspicious keywords are flagged in the subject, not dropped', async () => {
    const { handler, sent } = setup();
    await handler(jsonRequest({ ...valid, message: 'We offer cheap backlinks and SEO services for your site.' }));
    assert.equal(sent.length, 1);
    assert.match(sent[0].message.subject, /^\[Possible spam\] New enquiry from Priya Sharma/);
  });

  test('rate limit: the sixth request from one IP within 10 minutes gets 429', async () => {
    const { handler, sent } = setup();
    for (let i = 0; i < RATE_LIMIT.max; i += 1) assert.equal((await handler(jsonRequest(valid), { ip: '198.51.100.7' })).status, 200);
    const blocked = await handler(jsonRequest(valid), { ip: '198.51.100.7' });
    assert.equal(blocked.status, 429);
    assert.equal((await blocked.json()).error, 'rate_limited');
    assert.equal((await handler(jsonRequest(valid), { ip: '198.51.100.8' })).status, 200, 'other IPs unaffected');
    assert.equal(sent.length, RATE_LIMIT.max + 1);
  });

  test('rate limit window expires', async () => {
    const limiter = createRateLimiter(memoryStore(), { max: 1, windowMs: 1000 });
    assert.equal(await limiter.hit('ip', 0), true);
    assert.equal(await limiter.hit('ip', 500), false);
    assert.equal(await limiter.hit('ip', 1500), true);
  });

  test('a rate-store outage falls back to memory instead of failing', async () => {
    const broken = { get: async () => { throw new Error('blobs down'); }, set: async () => { throw new Error('blobs down'); } };
    const errors: unknown[] = [];
    const limiter = createRateLimiter(withFallback(broken, memoryStore(), (error) => errors.push(error)), { max: 1, windowMs: 1000 });
    assert.equal(await limiter.hit('ip', 0), true);
    assert.equal(await limiter.hit('ip', 10), false);
    assert.ok(errors.length >= 2);
  });
});

describe('configuration and delivery failures', () => {
  test('missing SMTP configuration returns 500 without sending', async () => {
    const { handler, sent, events } = setup({ env: { ...ENV, SMTP_PASS: '' } });
    const response = await handler(jsonRequest(valid));
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error, 'not_configured');
    assert.equal(sent.length, 0);
    assert.ok(events.includes('enquiry.not_configured'));
  });

  test('SMTP failure returns 502', async () => {
    const { handler, events } = setup({ send: async () => { throw new Error('535 Authentication Failed'); } });
    const response = await handler(jsonRequest(valid));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).error, 'delivery_failed');
    assert.ok(events.includes('enquiry.delivery_failed'));
  });
});

describe('no-JavaScript form posts', () => {
  const formBody = { name: valid.name, email: valid.email, phone: valid.phone, profession: valid.profession, department: '', message: valid.message, consent: 'yes', website: '', form_type: 'Contact page enquiry', started: '', page: '' };

  test('a valid form post answers 303 → /thank-you/', async () => {
    const { handler, sent } = setup();
    const response = await handler(formRequest(formBody, { Referer: 'https://cruisejobmentor.com/contact/' }));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/thank-you/');
    assert.equal(sent.length, 1);
    assert.equal(sent[0].message.subject, 'New enquiry from Priya Sharma: General cruise career enquiry');
    assert.ok(sent[0].message.text.includes('https://cruisejobmentor.com/contact/'));
  });

  test('an invalid form post answers an HTML page listing the problems and alternatives', async () => {
    const { handler } = setup();
    const response = await handler(formRequest({ ...formBody, email: 'nope', consent: '' }));
    assert.equal(response.status, 422);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);
    const html = await response.text();
    assert.ok(html.includes('Enter a valid email address'));
    assert.ok(html.includes('privacy policy'));
    assert.ok(html.includes('tel:+919185282229'));
    assert.ok(html.includes('noindex'));
  });

  test('a honeypot form post still redirects, silently', async () => {
    const { handler, sent } = setup();
    const response = await handler(formRequest({ ...formBody, website: 'spam' }));
    assert.equal(response.status, 303);
    assert.equal(sent.length, 0);
  });
});

describe('email rendering (nodemailer, not sent)', () => {
  test('renders From, Reply-To, Subject and a text + HTML alternative', async () => {
    const { handler, sent } = setup();
    await handler(jsonRequest(valid));
    const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
    const info = await transport.sendMail(sent[0].message);
    const raw = (info.message as Buffer).toString('utf8');
    const headers = raw.slice(0, raw.indexOf('\n\n'));
    assert.match(headers, /^From: "?Priya Sharma via AKMICS Website"? <info@cruisejobmentor\.com>$/m);
    assert.match(headers, /^Reply-To: Priya Sharma <priya@example\.com>$/m);
    assert.match(headers, /^To: info@cruisejobmentor\.com$/m);
    assert.match(headers, /^Subject: New enquiry from Priya Sharma: Food & Beverage$/m);
    assert.match(headers, /^Content-Type: multipart\/alternative/m);
    assert.doesNotMatch(headers, /^Bcc:/m);
    assert.ok(raw.includes('Content-Type: text/plain'));
    assert.ok(raw.includes('Content-Type: text/html'));
  });
});
