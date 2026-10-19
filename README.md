# AKMICS · Sailpreneur Academy — cruisejobmentor.com

Static, multi-page marketing website for AKMICS Sailpreneur Academy (Ankur Kumar Mishra Institute of Cruise Studies Pvt. Ltd., Dehradun), with one serverless function for the enquiry form.

| | |
| --- | --- |
| Framework | [Astro](https://astro.build) 7, TypeScript, static output (`dist/`) |
| Hosting | Netlify, auto-deployed from GitHub (`main` → production, pull requests → deploy previews) |
| Form | Netlify Function `POST /api/enquiry` → Zoho Mail SMTP (`smtp.zoho.in:465`) → `info@cruisejobmentor.com` |
| DNS | GoDaddy (`ns71/ns72.domaincontrol.com`): apex `A 75.2.60.5`, `www` CNAME `sailpreneur.netlify.app` |
| Mail | Zoho Mail (MX `mx.zoho.in`), SPF via GoDaddy include → `zoho.in`, DKIM `zmail._domainkey`, DMARC `p=quarantine` |

## Commands

Use Node.js 24 (Netlify builds with `NODE_VERSION = 24`) and, for image work only, Python 3 with Pillow ≥ 11.2 (AVIF support).

| Command | What it does |
| --- | --- |
| `npm ci` | Install exact dependencies |
| `npm run dev` | Local dev server at http://127.0.0.1:4321 (the form endpoint is not available in `astro dev`) |
| `npm run build` | Production build to `dist/`, then prunes unreferenced images and writes `dist/_redirects` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check` | TypeScript / Astro type check |
| `npm run test:unit` | Unit tests for the enquiry function (mocked mail transport; nothing is sent) |
| `npm run audit:seo` | SEO audit of every built page, robots.txt and the sitemap (run after `build`) |
| `npm run test:e2e` | Browser tests of the enquiry form with the endpoint intercepted (needs `npm run preview -- --port 4321`) |
| `npm run verify` | Every page at 320/375/768/1024/1440 px, axe WCAG 2.1 AA, tap targets, keyboard, reduced motion, links, 404 (needs preview) |
| `npm run check:live` | After a deploy: HTTPS, redirects, 404 status, robots, sitemap, favicons, headers, deployed version, form endpoint |
| `npm run qa` | `check` + `build` + `test:unit` + `audit:seo` |
| `npm run images:optimize` | Rebuild AVIF/WebP variants, the share image, favicons and `src/data/media.json` from `source-files/` |
| `npm run images:generate` | Regenerate AI images (needs `OPENAI_API_KEY` in `.env`) |

## Folder structure

```
├─ netlify.toml               Build settings, domain redirects, security + cache headers, preview noindex
├─ netlify/
│  ├─ functions/enquiry.mts   POST /api/enquiry (thin entry point)
│  └─ lib/                    Handler, validation glue, email composer, SMTP sender, rate limiter, config
├─ public/                    Copied to dist/ as-is
│  ├─ images/
│  │  ├─ brand/               Emblem, logo card, og-default.jpg (1200×630 share image)
│  │  ├─ founder/             Ankur Kumar Mishra
│  │  ├─ experts/             Expert panel portraits
│  │  ├─ students/            Success-story portraits
│  │  ├─ departments/         Department and program photography
│  │  └─ editorial/           Hero and background scenes
│  ├─ favicon.ico/.svg, favicon-48x48.png, favicon-96x96.png, icon-192.png, icon-512.png, apple-touch-icon.png
│  └─ site.webmanifest
├─ source-files/              Full-resolution masters — never deployed
│  ├─ client/                 Client originals: brand/, founder/, experts/, students/, posters/, ships/
│  └─ generated/              AI masters (*.png are git-ignored; manifest.json is tracked)
├─ src/
│  ├─ data/site.ts            All business content (contact details, programs, experts, stories, FAQs)
│  ├─ data/media.json         Image size manifest (generated)
│  ├─ layouts/Layout.astro    <head>: titles, robots, canonical, Open Graph, favicons, JSON-LD
│  ├─ lib/                    seo.ts (structured data), media.ts (srcset), enquiry-validation.ts (shared rules)
│  ├─ pages/                  Routes, including 404.astro, thank-you/, robots.txt.ts
│  ├─ components/, sections/  UI
│  ├─ scripts/                Menu, motion, carousels, enquiry form enhancement
│  └─ styles/                 tokens → base → components → home → pages
├─ scripts/                   Build curation, image pipeline, SEO audit, browser verification, live check
├─ tests/unit/                Enquiry function tests (node:test)
├─ tests/e2e/                 Enquiry form browser tests (Playwright)
└─ docs/                      GOOGLE-SEARCH-CONSOLE.md, previous reports
```

## Deploying

1. Push to `main`. Netlify builds with `npm run build` and publishes `dist/` plus the function in `netlify/functions/` (all set in `netlify.toml`).
2. Pull requests get a deploy preview built with `PUBLIC_NOINDEX=true`, so previews are never indexed.
3. After the production deploy, run `npm run build && npm run check:live`. Every line should be ✔.

## Enquiry email

The form posts to `/api/enquiry`. The function validates every field, applies spam protection (honeypot, 3-second minimum fill time, origin allow-list, 5 enquiries per IP per 10 minutes via Netlify Blobs) and sends the enquiry through the academy's own Zoho mailbox:

- **From:** `"Visitor Name via AKMICS Website" <info@cruisejobmentor.com>`; **Reply-To:** the visitor; **Subject:** `New enquiry from {Name}: {Department}`.
- HTML table + plain-text body with every field, the source page and the time in IST. Suspected spam is flagged with `[Possible spam]` in the subject, never dropped.
- Without JavaScript the form still works: a normal POST answered with `303 → /thank-you/`.

### Environment variables (Netlify)

Netlify → **Site configuration → Environment variables → Add a variable** (one at a time):

| Key | Value | Notes |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.zoho.in` | |
| `SMTP_PORT` | `465` | SSL |
| `SMTP_USER` | `info@cruisejobmentor.com` | |
| `SMTP_PASS` | Zoho **app-specific password** | Tick **Contains secret values**; scope **Functions** (or All scopes); deploy context **Production** only |
| `MAIL_TO` | `info@cruisejobmentor.com` | |
| `MAIL_FROM` | `info@cruisejobmentor.com` | Must match `SMTP_USER` |

Then **Deploys → Trigger deploy → Deploy site**: functions only see new variables after a redeploy. Without the variables the endpoint answers `500 not_configured` and the form tells visitors to call or email instead. `.env.example` lists every variable with secrets left empty.

## Social links

`src/data/site.ts` configures Instagram as `@sailpreneur` (`https://www.instagram.com/sailpreneur/`) and WhatsApp as `919185282229`. The Instagram profile appears in the footer, contact page and organization metadata. `src/components/WhatsAppWidget.astro` provides a floating chat link on every page, positioned above the mobile contact bar. It opens a prefilled WhatsApp draft; the visitor reviews and sends it in WhatsApp. The widget also works without JavaScript.

## Images

`npm run images:optimize` reads the masters in `source-files/` and writes responsive AVIF + WebP variants into `public/images/<category>/`, the share image `public/images/brand/og-default.jpg`, the favicon set and `src/data/media.json`. `<Img name="…">` renders a `<picture>` with AVIF, WebP fallback, `srcset`/`sizes`, explicit `width`/`height`, `loading="lazy"` (or `eager` + `fetchpriority="high"` for the hero). `npm run build` removes any variant no page references.

## SEO

- Canonical origin `https://cruisejobmentor.com` (override with `PUBLIC_SITE_URL` for staging only).
- Indexable pages: `index, follow, max-image-preview:large` + self-referencing canonical. Utility pages (404, `/thank-you/`): `noindex, follow`, no canonical, not in the sitemap.
- `sitemap-index.xml` is generated at build with `lastmod` (date of the last content commit). `robots.txt` allows everything.
- JSON-LD graph: Organization/LocalBusiness, WebSite, founder Person, BreadcrumbList, FAQPage, Service and expert Person.
- Search Console steps: [docs/GOOGLE-SEARCH-CONSOLE.md](docs/GOOGLE-SEARCH-CONSOLE.md).
