import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
const site = process.env.PUBLIC_SITE_URL;
if (site && !/^https:\/\//.test(site)) throw new Error('PUBLIC_SITE_URL must be an HTTPS URL');
export default defineConfig({ site, output: 'static', integrations: site ? [sitemap({ filter: (url) => !url.endsWith('/404/') })] : [], trailingSlash: 'always' });
