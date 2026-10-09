# AKMICS · Sailpreneur Academy

Static, multi-page marketing website for AKMICS — Sailpreneur Academy (Ankur Kumar Mishra Institute of Cruise Studies Pvt. Ltd., Dehradun). Built with Astro and TypeScript, using self-hosted Cormorant Garamond and Manrope and a navy / champagne-gold / ivory palette taken from the Sailpreneur logo card.

## Local development

Use Node.js 24 LTS (tested on 24.19.0) and Python 3 with Pillow for image processing.

```powershell
npm ci
npm run dev
```

Production build and preview:

```powershell
npm run check
npm run build
npm run preview -- --port 4321
```

Deploy the `dist/` folder. `npm run build` removes the raw client JPEG posters and any unreferenced media from `dist/`; the originals stay untouched in `public/`.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/data/site.ts` | All business content: contact details, stats, services, journey steps, departments, experts, success stories, trust points, FAQs. |
| `src/pages/index.astro` | Homepage. |
| `src/pages/[page].astro` | Router for inner pages; each page's body lives in `src/sections/`. |
| `src/pages/services/[slug].astro`, `src/pages/expert-panel/[slug].astro` | Eleven program pages and five expert profiles. |
| `src/components/` | Header, footer, mobile quick-contact bar, page hero, buttons, carousels, cards, journey timeline, FAQ, enquiry form, CTA. |
| `src/styles/` | `tokens.css` (design tokens) → `base.css` → `components.css` → `home.css` → `pages.css`. |
| `src/scripts/` | Menu, scroll reveals, count-ups, carousels, journey progress, enquiry form. |
| `src/lib/media.ts`, `src/components/Img.astro` | Responsive `srcset` images from `src/data/media.json`. |

## Images

Two kinds of imagery are used:

1. **Client imagery** (`public/*.jpeg`): founder and expert portraits, logo card, and student portraits cropped from the success-story posters.
2. **AI imagery**: twelve images generated for specific placements (hero, departments, journey, experts backdrop, CTA, etc.).

### Generating AI images (server-side only)

Image generation runs as a local Node script. The browser never sees it. Set `OPENAI_API_KEY` in `.env` (git-ignored; never prefix it with `PUBLIC_`).

```powershell
npm run images:generate                     # generates only missing images
node --env-file=.env scripts/images/generate.mjs --only=hero-ship --force
node --env-file=.env scripts/images/generate.mjs --upgrade=dept-hotel   # retry on the premium model
npm run images:optimize                     # writes WebP variants + src/data/media.json
```

`scripts/images/config.mjs` holds the image-generation settings in one place: models (`gpt-image-2.5-flare` by default, `gpt-image-2.5-sunburst` for premium), quality tiers, sizes, and each image's prompt, placement and alt text. Environment overrides are listed in `.env.example`. Lossless originals are saved to `assets-src/generated/` (git-ignored) together with a manifest of the model and quality used for each image.

## Enquiry delivery

The form prepares a downloadable enquiry in the visitor's browser. It doesn't send anything until a provider is configured. To enable delivery, set `PUBLIC_FORM_ENDPOINT` to an approved HTTPS endpoint that accepts form-urlencoded POSTs. The endpoint must validate and rate-limit submissions, reject the honeypot `website` field, and return `{ "success": true }`. Then rebuild.

## Public URL and SEO

Set `PUBLIC_SITE_URL` (HTTPS) before the production build to turn on canonical URLs, share images, sitemap and indexing. Without it the build is `noindex` and `robots.txt` disallows crawling.

## Verification

```powershell
npx playwright install chromium --only-shell
npm run preview -- --port 4321
# second terminal
npm run verify
```

The verification run covers every route at 360–1920px, axe WCAG A/AA checks, internal links and anchors, menu, FAQ and enquiry-form behaviour, carousel controls and the no-JavaScript fallback. Results are written to `output/audit/`.
