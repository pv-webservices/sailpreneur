# AKMICS · Sailpreneur Academy

A static, multi-page cruise-career mentorship website built with Astro, TypeScript and structured CSS. The design uses the supplied brand mark, founder and expert photographs, cruise imagery, self-hosted Cormorant Garamond and Manrope fonts, and a navy, ivory and champagne-gold palette.

## Local development

Use Node.js 24 LTS (the tested runtime is 24.19.0).

```powershell
npm ci
npm run dev
```

Production preview:

```powershell
npm run check
npm run build
npm run preview -- --port 4321
```

The publishable output is `dist/`. `npm run build` preserves all client originals in `public/`, then removes original JPEG promotional materials from `dist/`; only selected WebP derivatives are referenced by the site. Do not deploy the source `public/` directory directly. Raw promotional posters include claims that have not been approved.

## Content and maintenance

- `src/data/site.ts`: brand identity, contact numbers, navigation, departments, all eleven services, seven journey steps, expert profiles and FAQ answers.
- `src/pages/index.astro`: the complete homepage.
- `src/pages/[page].astro`: primary and legal pages.
- `src/pages/services/[slug].astro`: eleven service detail pages.
- `src/pages/expert-panel/[slug].astro`: five expert profiles.
- `src/layouts/Layout.astro`: shared layout, metadata and Organization schema.
- `src/components/`: reusable navigation, footer, buttons, journey, services, experts, FAQ, enquiry form and CTA.
- `src/styles/global.css`: visual and responsive design system, motion and reduced-motion behavior.
- `src/scripts/site.ts`: progressive interactions, enquiry handling and scroll progression.
- `scripts/prepare-assets.py`: selected asset conversion using Pillow; leaves originals intact.

## Public URL and SEO

Copy `.env.example` to `.env` and set `PUBLIC_SITE_URL` to the approved HTTPS origin before the final production build. The build then emits canonical URLs, absolute share-image URLs, an Organization URL, sitemap files and an indexable robots configuration.

Without the public origin, the site deliberately builds with `noindex,nofollow` and robots `Disallow: /`. No domain is invented. A separate test build under `output/seo-build/` uses `https://qa.example.invalid` solely to exercise the SEO configuration; it must not be deployed.

## Enquiry delivery

The default form validates inputs and prepares a text download in the visitor's browser. It does not send data, store it in browser storage, or claim delivery. The visitor is directed to call the team. When JavaScript is unavailable, the submission button is disabled and phone contact remains available.

To enable delivery, configure `PUBLIC_FORM_ENDPOINT` with an approved HTTPS endpoint and rebuild. It must:

1. Accept form-urlencoded POST requests and permit the site's origin through CORS when needed.
2. Validate and sanitise inputs on the server, enforce rate limiting, and reject the honeypot `website` field.
3. Accept `name`, `phone`, optional `email`, `profession`, optional `department`, `message`, and `consent`.
4. Return JSON `{ "success": true }` only after receipt is acknowledged. HTTP errors, invalid JSON or an unacknowledged response show failure and preserve form input.
5. Apply the business-approved privacy, retention and deletion arrangements.

Use a server-side secret if the provider requires one; never place private keys in a `PUBLIC_` variable. No provider, email inbox or WhatsApp destination is configured. Before claiming live delivery, submit an approved real enquiry and verify receipt in the destination. Browser-intercepted QA responses are only simulations.

## Verification

```powershell
npx playwright install chromium --only-shell
npm run preview -- --port 4321
# In a second terminal:
npm run verify
```

The browser script checks every content route at six viewport widths, unique page metadata, local links and fragments, image loading, accessibility, menu keyboard behavior, FAQ behavior, enquiry download and simulated provider responses. It uses synthetic input only. Evidence is written to `output/audit/`.

Read `IMPLEMENTATION-REPORT.md` for the content decisions, verification results and remaining launch requirements.

## Implementation references

Astro's [project structure](https://docs.astro.build/en/basics/project-structure/), [static asset imports](https://docs.astro.build/en/guides/imports/) and [sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/) informed the static routing, asset handling and SEO setup.
