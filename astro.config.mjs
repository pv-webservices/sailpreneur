import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';

// Canonical origin. Override only for a staging build (must be HTTPS).
const site = process.env.PUBLIC_SITE_URL || 'https://cruisejobmentor.com';
if (!/^https:\/\/[^/]+$/.test(site.replace(/\/$/, ''))) throw new Error('PUBLIC_SITE_URL must be an HTTPS origin');

// Utility pages carry "noindex, follow" and must stay out of the sitemap.
export const NOINDEX_PATHS = ['/404/', '/thank-you/'];

/** Date of the last commit that touched site content; falls back to the build time outside git. */
function contentLastModified() {
  try {
    return new Date(execSync('git log -1 --format=%cI -- src public', { encoding: 'utf8' }).trim());
  } catch {
    return new Date();
  }
}
const lastmod = contentLastModified();

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (url) => !NOINDEX_PATHS.some((path) => new URL(url).pathname === path),
      serialize: (item) => ({ ...item, lastmod: (Number.isNaN(lastmod.getTime()) ? new Date() : lastmod).toISOString() }),
    }),
  ],
});
