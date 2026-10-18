import type { APIRoute } from 'astro';

// Allow everything. Utility pages are kept out of search with "noindex" meta, which crawlers must be able to read.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
