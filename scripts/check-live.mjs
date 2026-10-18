// Post-deploy check of the live site: npm run check:live  (LIVE_URL overrides the domain)
// Verifies HTTPS, host/www/index.html redirects, 404 status, robots.txt, sitemap, favicons, security
// headers, that the deployed HTML matches the local build, and that the form endpoint responds.
// The endpoint probe uses a foreign Origin, which the function rejects (403) before any mail logic runs.
import { readFile } from 'node:fs/promises';

const LIVE = (process.env.LIVE_URL || 'https://cruisejobmentor.com').replace(/\/$/, '');
const host = new URL(LIVE).host;
const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

async function get(url, init = {}) {
  try {
    return await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000), ...init });
  } catch (error) {
    return { status: 0, error: error.cause?.code || error.message, headers: new Headers(), text: async () => '' };
  }
}
const location = (res) => res.headers.get('location') ?? '';

const home = await get(`${LIVE}/`);
check('HTTPS home page answers 200', home.status === 200, home.error ?? `status ${home.status}`);
const http = await get(`http://${host}/`);
check('http:// redirects to https://', [301, 308].includes(http.status) && location(http).startsWith(LIVE), `${http.status} → ${location(http) || http.error || ''}`);
const www = await get(`https://www.${host}/about/`);
check('www redirects to the apex domain', [301, 308].includes(www.status) && location(www) === `${LIVE}/about/`, `${www.status} → ${location(www) || www.error || ''}`);
const index = await get(`${LIVE}/about/index.html`);
check('/about/index.html redirects to /about/', [301, 308].includes(index.status) && location(index).replace(LIVE, '') === '/about/', `${index.status} → ${location(index)}`);
const slash = await get(`${LIVE}/about`);
check('/about redirects to /about/', [301, 308].includes(slash.status) && location(slash).replace(LIVE, '') === '/about/', `${slash.status} → ${location(slash)}`);
const missing = await get(`${LIVE}/this-page-does-not-exist-qa/`);
const missingHtml = await missing.text();
check('Unknown URL returns 404 with the branded page', missing.status === 404 && missingHtml.includes('back on course'), `status ${missing.status}`);

const robots = await get(`${LIVE}/robots.txt`);
const robotsText = await robots.text();
check('robots.txt allows crawling and lists the sitemap', robots.status === 200 && /Allow: \//.test(robotsText) && !/Disallow: \//.test(robotsText) && robotsText.includes(`${LIVE}/sitemap-index.xml`), robotsText.split('\n').join(' | '));
const sitemap = await get(`${LIVE}/sitemap-index.xml`);
check('sitemap-index.xml answers 200', sitemap.status === 200, `status ${sitemap.status}`);
const child = await get(`${LIVE}/sitemap-0.xml`);
const urls = [...(await child.text()).matchAll(/<loc>/g)].length;
check('sitemap-0.xml lists the indexable pages', child.status === 200 && urls > 0, `${urls} URLs`);

for (const icon of ['/favicon.ico', '/favicon.svg', '/favicon-48x48.png', '/favicon-96x96.png', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/site.webmanifest', '/images/brand/og-default.jpg']) {
  const res = await get(`${LIVE}${icon}`);
  check(`${icon} answers 200`, res.status === 200, `status ${res.status}`);
}

const homeHtml = home.status === 200 ? await home.text() : '';
check('Home page is indexable', homeHtml.includes('content="index, follow, max-image-preview:large"'), homeHtml.match(/<meta name="robots"[^>]*>/)?.[0] ?? 'no robots meta');
for (const header of ['x-content-type-options', 'referrer-policy', 'x-frame-options', 'strict-transport-security']) {
  check(`Header ${header}`, Boolean(home.headers.get(header)), home.headers.get(header) ?? 'missing');
}
try {
  const normalise = (html) => html.replace(/\/_astro\/[^"' )]+/g, 'ASSET').replace(/\s+/g, ' ');
  const local = await readFile('dist/index.html', 'utf8');
  check('Live home page matches the local build', normalise(local) === normalise(homeHtml), 'run npm run build first; differences mean the latest commit is not deployed');
} catch { check('Live home page matches the local build', false, 'dist/index.html missing: run npm run build'); }

const probe = await get(`${LIVE}/api/enquiry`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://origin-check.invalid' }, body: '{}' });
check('Form endpoint /api/enquiry is deployed (foreign origin refused with 403)', probe.status === 403, `status ${probe.status}`);

for (const r of results) console.log(`${r.pass ? '✔' : '✖'} ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} live checks passed for ${LIVE}`);
if (failed) process.exitCode = 1;
