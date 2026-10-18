// Technical SEO audit of the production build (dist/). Run after `npm run build`: npm run audit:seo
// Fails (exit 1) on any issue. Checks every page for titles, descriptions, headings, alt text, canonical,
// robots, Open Graph/Twitter, JSON-LD, favicons and internal links, then robots.txt and the sitemap.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';

const DIST = 'dist';
const SITE = 'https://cruisejobmentor.com';
const NOINDEX = new Set(['/404/', '/thank-you/']);
const ROBOTS_INDEX = 'index, follow, max-image-preview:large';
const ROBOTS_NOINDEX = 'noindex, follow';
const issues = [];
const issue = (page, message) => issues.push(`${page}: ${message}`);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])))).flat();
}
const exists = async (path) => stat(path).then(() => true, () => false);

/** Map a site path ("/about/", "/images/x.webp") to a file in dist. */
function fileFor(path) {
  const clean = decodeURIComponent(path.split(/[?#]/)[0]);
  return clean.endsWith('/') ? join(DIST, clean, 'index.html') : join(DIST, clean);
}

function jpegSize(buffer) {
  for (let i = 2; i < buffer.length;) {
    const marker = buffer[i + 1];
    const length = buffer.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: buffer.readUInt16BE(i + 5), width: buffer.readUInt16BE(i + 7) };
    i += 2 + length;
  }
  return null;
}

const files = (await walk(DIST)).map((f) => relative(DIST, f).replaceAll('\\', '/'));
const pages = files.filter((f) => f.endsWith('.html')).map((f) => (f === '404.html' ? '/404/' : `/${f.replace(/index\.html$/, '')}`)).sort();
const htmlFor = (path) => (path === '/404/' ? join(DIST, '404.html') : fileFor(path));
const titles = new Map();
const descriptions = new Map();
const idsByPage = new Map();
const linksToCheck = [];
let imageCount = 0;

for (const path of pages) {
  const html = await readFile(htmlFor(path), 'utf8');
  const doc = parse(html);
  const indexable = !NOINDEX.has(path);
  idsByPage.set(path, new Set(doc.querySelectorAll('[id]').map((el) => el.id)));

  // URL shape: lowercase, hyphenated, trailing slash
  if (path !== '/404/' && !/^\/([a-z0-9]+(-[a-z0-9]+)*\/)*$/.test(path)) issue(path, 'URL is not lowercase-hyphenated with a trailing slash');

  // Title & description
  const title = doc.querySelector('title')?.text.trim() ?? '';
  if (!title) issue(path, 'missing <title>');
  if (title.length > 65) issue(path, `title is ${title.length} characters (max 65): "${title}"`);
  if (indexable) titles.set(title, [...(titles.get(title) ?? []), path]);
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  if (description.length < 70 || description.length > 170) issue(path, `description is ${description.length} characters (70-170)`);
  if (indexable) descriptions.set(description, [...(descriptions.get(description) ?? []), path]);

  // Robots & canonical
  const robots = doc.querySelectorAll('meta[name="robots"]');
  const canonicals = doc.querySelectorAll('link[rel="canonical"]');
  if (robots.length !== 1) issue(path, `expected 1 robots meta, found ${robots.length}`);
  const robotsValue = robots[0]?.getAttribute('content');
  if (indexable) {
    if (robotsValue !== ROBOTS_INDEX) issue(path, `robots is "${robotsValue}", expected "${ROBOTS_INDEX}"`);
    if (canonicals.length !== 1) issue(path, `expected 1 canonical, found ${canonicals.length}`);
    else if (canonicals[0].getAttribute('href') !== SITE + path) issue(path, `canonical ${canonicals[0].getAttribute('href')} is not self-referencing`);
  } else {
    if (robotsValue !== ROBOTS_NOINDEX) issue(path, `robots is "${robotsValue}", expected "${ROBOTS_NOINDEX}"`);
    if (canonicals.length) issue(path, 'noindex page must not have a canonical');
  }

  // Headings: one H1, no skipped levels
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').map((h) => Number(h.tagName[1]));
  const h1s = headings.filter((level) => level === 1).length;
  if (h1s !== 1) issue(path, `expected exactly one H1, found ${h1s}`);
  headings.forEach((level, i) => {
    const previous = i === 0 ? 0 : headings[i - 1];
    if (level > previous + 1) issue(path, `heading level skips from H${previous || '-'} to H${level}`);
  });

  // Images: alt present, explicit size, files exist
  for (const img of doc.querySelectorAll('img')) {
    imageCount += 1;
    const src = img.getAttribute('src') ?? '';
    if (img.getAttribute('alt') === undefined) issue(path, `image without alt: ${src}`);
    if (!img.getAttribute('width') || !img.getAttribute('height')) issue(path, `image without width/height: ${src}`);
    const candidates = [src, ...[img, ...img.parentNode.querySelectorAll('source')].flatMap((el) => (el.getAttribute('srcset') ?? '').split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean))];
    for (const candidate of new Set(candidates)) if (candidate.startsWith('/') && !(await exists(fileFor(candidate)))) issue(path, `missing image file ${candidate}`);
  }

  // Open Graph & Twitter
  const meta = (key) => doc.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute('content');
  for (const key of ['og:site_name', 'og:locale', 'og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!meta(key)) issue(path, `missing ${key}`);
  }
  if (meta('og:image:width') !== '1200' || meta('og:image:height') !== '630') issue(path, 'og:image must declare 1200x630');
  const ogImage = meta('og:image');
  if (ogImage) {
    const local = fileFor(new URL(ogImage).pathname);
    if (!(await exists(local))) issue(path, `og:image file missing: ${ogImage}`);
    else {
      const size = jpegSize(await readFile(local));
      if (!size || size.width !== 1200 || size.height !== 630) issue(path, `og:image is ${size?.width}x${size?.height}, expected 1200x630`);
    }
  }
  if (indexable && meta('og:url') !== SITE + path) issue(path, 'og:url does not match canonical');

  // Favicons & manifest
  for (const selector of ['link[rel="icon"][href="/favicon.ico"]', 'link[rel="icon"][type="image/svg+xml"]', 'link[rel="icon"][sizes="96x96"]', 'link[rel="apple-touch-icon"]', 'link[rel="manifest"]']) {
    const link = doc.querySelector(selector);
    if (!link) issue(path, `missing ${selector}`);
    else if (!(await exists(fileFor(link.getAttribute('href'))))) issue(path, `favicon file missing: ${link.getAttribute('href')}`);
  }

  // JSON-LD
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  if (indexable) {
    if (scripts.length !== 1) issue(path, `expected 1 JSON-LD block, found ${scripts.length}`);
    for (const script of scripts) {
      const raw = script.rawText;
      if (raw.includes('<')) issue(path, 'JSON-LD contains an unescaped "<"');
      let graph = [];
      try { graph = JSON.parse(raw)['@graph'] ?? []; } catch { issue(path, 'JSON-LD is not valid JSON'); }
      const types = graph.flatMap((node) => [node['@type']].flat());
      const org = graph.find((node) => [node['@type']].flat().includes('EducationalOrganization'));
      if (!org) issue(path, 'JSON-LD missing Organization');
      else for (const key of ['@id', 'name', 'url', 'logo', 'telephone', 'address']) if (!org[key]) issue(path, `Organization missing ${key}`);
      if (!types.includes('WebSite')) issue(path, 'JSON-LD missing WebSite');
      if (path !== '/' && !types.includes('BreadcrumbList')) issue(path, 'JSON-LD missing BreadcrumbList');
      if (path === '/faq/' && !types.includes('FAQPage')) issue(path, 'JSON-LD missing FAQPage');
      if ((path === '/' || path === '/our-mentor/') && !graph.some((node) => node['@type'] === 'Person' && node['@id'] === `${SITE}/our-mentor/#person`)) issue(path, 'JSON-LD missing founder Person');
      if (path.startsWith('/expert-panel/') && path !== '/expert-panel/' && !types.includes('Person')) issue(path, 'JSON-LD missing Person');
      if (path.startsWith('/services/') && !types.includes('Service')) issue(path, 'JSON-LD missing Service');
    }
  } else if (scripts.length) issue(path, 'noindex page should not carry JSON-LD');

  // Internal links (checked after all pages are loaded so anchors can be resolved)
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (href.startsWith('/') || href.startsWith('#')) linksToCheck.push({ from: path, href });
  }
}

let linkCount = 0;
for (const { from, href } of linksToCheck) {
  linkCount += 1;
  const url = new URL(href, SITE + from);
  const target = url.pathname;
  const isPage = target.endsWith('/') || !/\.[a-z0-9]+$/i.test(target);
  if (isPage && !target.endsWith('/')) { issue(from, `internal link without trailing slash: ${href}`); continue; }
  if (target !== target.toLowerCase()) issue(from, `internal link is not lowercase: ${href}`);
  if (!(await exists(pages.includes(target) ? htmlFor(target) : fileFor(target)))) { issue(from, `broken internal link: ${href}`); continue; }
  if (url.hash && isPage) {
    const ids = idsByPage.get(target);
    if (ids && !ids.has(decodeURIComponent(url.hash.slice(1)))) issue(from, `missing anchor: ${href}`);
  }
}

for (const [title, paths] of titles) if (paths.length > 1) issue(paths.join(', '), `duplicate title "${title}"`);
for (const [description, paths] of descriptions) if (paths.length > 1) issue(paths.join(', '), `duplicate description "${description.slice(0, 60)}…"`);

// robots.txt
const robotsTxt = await readFile(join(DIST, 'robots.txt'), 'utf8').catch(() => '');
if (!/^User-agent: \*$/m.test(robotsTxt) || !/^Allow: \/$/m.test(robotsTxt)) issue('/robots.txt', 'must allow all crawlers');
if (/^Disallow:\s*\S/m.test(robotsTxt)) issue('/robots.txt', 'must not disallow any path');
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) issue('/robots.txt', 'missing Sitemap line');

// Sitemap = exactly the indexable pages, each with lastmod
const index = await readFile(join(DIST, 'sitemap-index.xml'), 'utf8').catch(() => '');
const sitemapFiles = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (!sitemapFiles.length) issue('/sitemap-index.xml', 'no child sitemaps');
const sitemapUrls = [];
for (const file of sitemapFiles) {
  const xml = await readFile(join(DIST, file), 'utf8');
  for (const entry of xml.matchAll(/<url>(.*?)<\/url>/gs)) {
    const loc = entry[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!/<lastmod>\d{4}-\d{2}-\d{2}/.test(entry[1])) issue(file, `no lastmod for ${loc}`);
    sitemapUrls.push(new URL(loc).pathname);
  }
}
const indexablePages = pages.filter((p) => !NOINDEX.has(p));
for (const page of indexablePages) if (!sitemapUrls.includes(page)) issue('/sitemap', `indexable page missing from sitemap: ${page}`);
for (const url of sitemapUrls) if (!indexablePages.includes(url)) issue('/sitemap', `sitemap lists a non-indexable or missing page: ${url}`);

// Web manifest
try {
  const manifest = JSON.parse(await readFile(join(DIST, 'site.webmanifest'), 'utf8'));
  for (const key of ['name', 'short_name', 'icons', 'theme_color', 'background_color']) if (!manifest[key]) issue('/site.webmanifest', `missing ${key}`);
  for (const icon of manifest.icons ?? []) if (!(await exists(fileFor(icon.src)))) issue('/site.webmanifest', `icon missing: ${icon.src}`);
} catch { issue('/site.webmanifest', 'missing or invalid JSON'); }

console.log(JSON.stringify({ pages: pages.length, indexable: indexablePages.length, noindex: pages.length - indexablePages.length, sitemapUrls: sitemapUrls.length, images: imageCount, internalLinks: linkCount, issues: issues.length }, null, 2));
if (issues.length) {
  console.error(issues.map((line) => `  ✖ ${line}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('SEO audit passed with no issues.');
}
