import type { APIRoute } from 'astro';
export const GET: APIRoute = () => {
 const site=import.meta.env.PUBLIC_SITE_URL;
 return new Response(site?`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap-index.xml',site).href}\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
};
