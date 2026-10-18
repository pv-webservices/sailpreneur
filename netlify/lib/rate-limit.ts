// Per-IP rate limiting for the enquiry endpoint. Production uses Netlify Blobs so the limit holds
// across function instances; tests and local runs use the in-memory store.
import { createHash } from 'node:crypto';

export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;

export interface RateLimitStore {
  get(key: string): Promise<number[] | undefined>;
  set(key: string, hits: number[]): Promise<void>;
}

export interface RateLimiter {
  /** Records an attempt; returns false once the IP has used up its allowance for the window. */
  hit(ip: string, now: number): Promise<boolean>;
}

export function memoryStore(): RateLimitStore {
  const data = new Map<string, number[]>();
  return {
    get: async (key) => data.get(key),
    set: async (key, hits) => { data.set(key, hits); },
  };
}

// IPs are stored only as a one-way hash.
const keyFor = (ip: string) => createHash('sha256').update(`enquiry:${ip}`).digest('hex').slice(0, 32);

export function createRateLimiter(store: RateLimitStore, limit: { max: number; windowMs: number } = RATE_LIMIT): RateLimiter {
  return {
    async hit(ip, now) {
      const key = keyFor(ip);
      const recent = ((await store.get(key)) ?? []).filter((time) => now - time < limit.windowMs);
      const allowed = recent.length < limit.max;
      await store.set(key, allowed ? [...recent, now] : recent);
      return allowed;
    },
  };
}

/** Wraps a durable store so a storage outage degrades to per-instance limiting instead of failing the enquiry. */
export function withFallback(primary: RateLimitStore, fallback: RateLimitStore, onError: (error: unknown) => void): RateLimitStore {
  return {
    async get(key) {
      try { return await primary.get(key); } catch (error) { onError(error); return fallback.get(key); }
    },
    async set(key, hits) {
      try { await primary.set(key, hits); } catch (error) { onError(error); await fallback.set(key, hits); }
    },
  };
}
