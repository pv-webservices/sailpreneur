// Netlify Function: POST /api/enquiry. Logic lives in ../lib/enquiry.ts (unit-tested with a mocked transport).
import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { departments } from '../../src/data/site.ts';
import { createEnquiryHandler } from '../lib/enquiry.ts';
import { sendWithSmtp } from '../lib/mailer.ts';
import { createRateLimiter, memoryStore, withFallback, type RateLimitStore } from '../lib/rate-limit.ts';

const log = (event: string, detail: Record<string, unknown> = {}) => console.warn(JSON.stringify({ event, ...detail }));

// Opened lazily: outside Netlify (or during a Blobs outage) getStore throws, and withFallback absorbs it.
function blobStore(): RateLimitStore {
  const store = () => getStore('enquiry-rate-limit');
  return {
    get: async (key) => ((await store().get(key, { type: 'json' })) as number[] | null) ?? undefined,
    set: async (key, hits) => { await store().setJSON(key, hits); },
  };
}

const fallback = memoryStore();
const handler = createEnquiryHandler({
  env: process.env,
  send: sendWithSmtp,
  rateLimiter: createRateLimiter(withFallback(blobStore(), fallback, (error) => log('enquiry.rate_store_unavailable', { reason: String(error) }))),
  departments,
  log,
});

export default (request: Request, context: Context) => handler(request, { ip: context.ip });

export const config: Config = { path: '/api/enquiry', method: ['POST'] };
