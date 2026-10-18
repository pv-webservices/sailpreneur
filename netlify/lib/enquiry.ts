// Enquiry endpoint (POST /api/enquiry). Two modes:
//  * JavaScript: JSON in, JSON out ({ ok, errors?, error? }); the page then redirects to /thank-you/.
//  * No JavaScript: a normal form POST; success answers 303 → /thank-you/, problems answer a small HTML page.
// Bot signals (honeypot, too-fast submission) are accepted silently and discarded, so bots learn nothing.
import { normaliseEnquiry, validateEnquiry, type FieldErrors, type EnquiryInput } from '../../src/lib/enquiry-validation.ts';
import { readMailConfig, isAllowedOrigin, type Env, type MailConfig } from './config.ts';
import { composeEnquiryEmail, headerSafe, looksSuspicious, escapeHtml, type MailMessage } from './email.ts';
import type { RateLimiter } from './rate-limit.ts';

export const MIN_FILL_MS = 3000;
const MAX_BODY_BYTES = 20_000;
const THANK_YOU = '/thank-you/';
const CONTACT = { phone: '+91 9185282229', email: 'info@cruisejobmentor.com' };

export interface Department { slug: string; name: string }

export interface EnquiryDeps {
  env: Env;
  send: (config: MailConfig, message: MailMessage) => Promise<void>;
  rateLimiter: RateLimiter;
  departments: readonly Department[];
  now?: () => number;
  log?: (event: string, detail?: Record<string, unknown>) => void;
}

type Mode = 'json' | 'form';
type Failure = 'forbidden_origin' | 'rate_limited' | 'invalid' | 'not_configured' | 'delivery_failed' | 'bad_request' | 'too_large' | 'method_not_allowed';

const FAILURE_COPY: Record<Failure, { status: number; title: string; text: string }> = {
  forbidden_origin: { status: 403, title: 'This form can only be sent from our website', text: 'Please open cruisejobmentor.com and send your enquiry from the contact page.' },
  rate_limited: { status: 429, title: 'Too many enquiries in a short time', text: 'Please wait about ten minutes and try again, or contact us directly.' },
  invalid: { status: 422, title: 'Please check your enquiry', text: 'Some answers need a quick fix. Use your browser’s Back button: everything you typed is still in the form.' },
  not_configured: { status: 500, title: 'We could not send your enquiry', text: 'Online enquiries are temporarily unavailable. Your details were not lost: please go back and copy them, then call or email us.' },
  delivery_failed: { status: 502, title: 'We could not deliver your enquiry', text: 'Our mail service did not accept the message. Please go back (your details are still in the form) and try again, or call or email us.' },
  bad_request: { status: 400, title: 'We could not read your enquiry', text: 'Please go back and try again, or contact us directly.' },
  too_large: { status: 413, title: 'Your enquiry is too long', text: 'Please shorten your message and try again.' },
  method_not_allowed: { status: 405, title: 'Method not allowed', text: 'Send enquiries from the contact page.' },
};

function json(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}

function htmlPage(failure: Failure, errors?: FieldErrors): Response {
  const copy = FAILURE_COPY[failure];
  const list = errors ? `<ul>${Object.values(errors).map((message) => `<li>${escapeHtml(message!)}</li>`).join('')}</ul>` : '';
  const body = `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>${escapeHtml(copy.title)} | AKMICS</title>
<style>body{margin:0;font:17px/1.6 system-ui,sans-serif;background:#f6f1e7;color:#0d1b2c}main{max-width:640px;margin:8vh auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e8dfcc}h1{font-family:Georgia,serif;font-weight:600;line-height:1.2}a{color:#071a30;font-weight:700}li{margin:.3em 0}</style></head>
<body><main><h1>${escapeHtml(copy.title)}</h1><p>${escapeHtml(copy.text)}</p>${list}
<p>Call <a href="tel:${CONTACT.phone.replace(/\s/g, '')}">${CONTACT.phone}</a>, message us on <a href="https://wa.me/919185282229">WhatsApp</a> or email <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>.</p>
<p><a href="/contact/">Return to the contact page</a></p></main></body></html>`;
  return new Response(body, { status: copy.status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function fail(mode: Mode, failure: Failure, errors?: FieldErrors): Response {
  if (mode === 'form') return htmlPage(failure, errors);
  return json(FAILURE_COPY[failure].status, { ok: false, error: failure, ...(errors ? { errors } : {}) });
}

const success = (mode: Mode): Response =>
  mode === 'json' ? json(200, { ok: true, redirect: THANK_YOU }) : new Response(null, { status: 303, headers: { Location: THANK_YOU, 'Cache-Control': 'no-store' } });

function requestOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (origin && origin !== 'null') return origin;
  try { return new URL(request.headers.get('referer') ?? '').origin; } catch { return null; }
}

function clientIp(request: Request, contextIp?: string): string {
  return contextIp || request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

async function readBody(request: Request, mode: Mode): Promise<Record<string, unknown> | 'too_large' | 'bad_request'> {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return 'too_large';
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return 'too_large';
  if (mode === 'json') {
    try {
      const parsed: unknown = JSON.parse(text);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : 'bad_request';
    } catch { return 'bad_request'; }
  }
  if (!(request.headers.get('content-type') ?? '').includes('application/x-www-form-urlencoded')) return 'bad_request';
  return Object.fromEntries(new URLSearchParams(text));
}

/** Honeypot filled, or the form was completed faster than a person could. Absent timing (no JavaScript) is allowed. */
function isBot(body: Record<string, unknown>, mode: Mode): boolean {
  if (typeof body.website === 'string' && body.website.trim()) return true;
  const started = Number(body.started);
  const sentAt = Number(body.sentAt);
  if (mode === 'form' && !body.started) return false;
  if (!Number.isFinite(started) || !Number.isFinite(sentAt)) return true;
  return sentAt - started < MIN_FILL_MS;
}

function sourcePage(body: Record<string, unknown>, request: Request, env: Env): string {
  const candidates = [body.page, request.headers.get('referer')];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    try {
      const url = new URL(candidate);
      if (isAllowedOrigin(url.origin, env)) return headerSafe(url.href, 300);
    } catch { /* not a URL */ }
  }
  return '';
}

export function createEnquiryHandler(deps: EnquiryDeps) {
  const now = deps.now ?? Date.now;
  const log = deps.log ?? (() => {});
  const slugs = deps.departments.map((department) => department.slug);

  return async function handle(request: Request, context: { ip?: string } = {}): Promise<Response> {
    const mode: Mode = (request.headers.get('content-type') ?? '').includes('application/json') ? 'json' : 'form';
    if (request.method !== 'POST') return fail(mode, 'method_not_allowed');
    if (!isAllowedOrigin(requestOrigin(request), deps.env)) {
      log('enquiry.forbidden_origin', { origin: requestOrigin(request) });
      return fail(mode, 'forbidden_origin');
    }
    if (!(await deps.rateLimiter.hit(clientIp(request, context.ip), now()))) {
      log('enquiry.rate_limited');
      return fail(mode, 'rate_limited');
    }

    const body = await readBody(request, mode);
    if (body === 'too_large' || body === 'bad_request') return fail(mode, body);
    if (isBot(body, mode)) {
      log('enquiry.discarded_bot');
      return success(mode);
    }

    const input: EnquiryInput = normaliseEnquiry(body);
    const errors = validateEnquiry(input, slugs);
    if (Object.keys(errors).length) return fail(mode, 'invalid', errors);

    const settings = readMailConfig(deps.env);
    if ('missing' in settings) {
      log('enquiry.not_configured', { missing: settings.missing });
      return fail(mode, 'not_configured');
    }

    const department = deps.departments.find((item) => item.slug === input.department);
    const formType = typeof body.form_type === 'string' && body.form_type.trim() ? headerSafe(body.form_type, 60) : 'Contact page enquiry';
    const message = composeEnquiryEmail(input, {
      formType,
      departmentName: department?.name ?? '',
      pageUrl: sourcePage(body, request, deps.env),
      submittedAt: new Date(now()),
      flagged: looksSuspicious(input),
    }, settings.config);

    try {
      await deps.send(settings.config, message);
    } catch (error) {
      log('enquiry.delivery_failed', { reason: error instanceof Error ? error.message : String(error) });
      return fail(mode, 'delivery_failed');
    }
    log('enquiry.sent', { flagged: message.subject.startsWith('[Possible spam]') });
    return success(mode);
  };
}
