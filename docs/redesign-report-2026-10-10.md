# Redesign report — 10 October 2026

Local implementation only. Nothing has been deployed, committed or pushed.

## What changed

The site was rebuilt around the supplied homepage reference and the client's own materials. It now has a single design system: tokens, buttons, cards, carousels, an image-backed page hero and consistent section rhythm.

- **Homepage** (in order): full-bleed cinematic hero with a five-figure stats bar → marquee → "From Dehradun to the World" route → founder feature (Ankur in uniform) → seven-step journey over an ocean backdrop → bento program grid (11 programs plus a mentor card) → department carousel with photography → expert carousel over a ship-bridge backdrop → success-story carousel → trust grid → FAQ with a contact card → closing CTA.
- **Inner pages**: same image-backed hero and visual language. Mentor page uses portrait and uniform photos plus a timeline. Career pathways uses alternating photo rows. Programs page has an interview feature. Success stories are shown in a grid. Contact page has tiles and the form.
- **Navigation and conversion**: the sticky header turns solid when you scroll, with phone numbers and an Apply Now button. Below 1200px the menu opens as a full-screen drawer; without JavaScript it falls back to a scrollable link row. On mobile, a "Call / Apply" bar appears after scrolling. Department links pre-select the department in the enquiry form.
- **Motion**: staggered hero entrance, slow hero zoom, rotating badge, marquee, scroll reveals, count-up stats, scroll-drawn journey line, card hover lifts and image zooms, and directional-fill buttons (no shimmer or glow). The homepage shows a 0.5s CSS-only loader. `prefers-reduced-motion` turns all of this off.

## Content sources and decisions

Facts come only from the client's files in `/public`:

- **Founder**: 12 years at sea; 50 countries + 65 islands; "From Dehradun to Miami"; "Not a tourist — this was my work" (mentor poster).
- **Academy**: 35+ years expert panel; 20+ careers launched; transparent guidance; no fake promises; lifetime support ("Why Join AKMICS?" and "Parents Trust AKMICS" posters).
- **Success stories**, transcribed from the posters:
  - Sahil (Delhi → Norwegian Cruise Line)
  - Anjali Rawat (Dehradun → Princess Cruises)
  - Amit Kumar (Himachal → MSC Cruises)
  - Rohit (Dehradun → Carnival Cruise Line)

**Deliberately not published**, because they are unverifiable or contradict other materials:

- "Trusted by 5000+ parents" and "10,000+ maritime professionals"
- "Since 1989"
- "Approved Maritime Training Partner", "Accredited", "100% placement"
- The salary figures (90K / 80K)
- The reference mockup's "10,000+ students guided" and "95%+ success"
- Cruise-line logos (the names appear as text only)

**Spelling corrections and identity checks**:

- One typo was corrected in Amit's quote: "around the world" was missing a word on the poster.
- The reference mockup shows the mustached gentleman as Ankur. The client's files identify him as Anirudh Prakash Mishra, and Ankur as the bearded gentleman (consistent across three files). The site follows the client files.

**Instagram handles**: `@akmics.official` and `@ankur.sailpreneur.academy` come from the reference footer. Their links (`instagram.com/<handle>`) were not opened to confirm ownership. The Facebook page is omitted because no URL was available.

## Imagery

| Asset | Model / quality | Placement |
| --- | --- | --- |
| hero-ship | Sunburst / high | Homepage hero, world section, success-stories hero, share image |
| cta-deck | Sunburst / high | Closing CTA (sitewide) |
| dept-hotel, dept-fnb, dept-housekeeping, dept-galley, dept-deck | Sunburst / medium | Department cards and rows, program thumbnails |
| mentorship-session | Sunburst / medium | Interview program, programs hero |
| ship-atrium | Sunburst / medium | About and pathways heroes, life-onboard program |
| dehradun-valley | Flare / medium | World section, about collage, contact hero |
| journey-ocean | Flare / medium | Journey backdrop, roadmap program, legal heroes |
| bridge-dusk | Flare / medium | Expert backdrop, founder side panel, mentor hero |

Flare was used for scenery and backgrounds. Sunburst was used where the brief requires it: the hero, people, interiors and complex scenes.

Client imagery is cropped and reused throughout: Ankur's portrait and uniform photo, all five expert portraits, the logo card, the gold emblem (cut out to a transparent WebP for the header, footer and loader), and three student portraits cropped from the success posters.

All images are responsive WebP with `srcset`. Images below the fold are lazy-loaded; the hero is preloaded. The published media total is 3.4 MB across 50 variants, of which a single page downloads only the sizes it needs.

## Verification

Run against the production build on 10 October 2026:

- `astro check`: 0 errors, 0 warnings.
- `npm run verify`: 28 routes × 6 widths (360–1920px) gave 168 responsive passes with no overflow or broken images. 56 axe WCAG A/AA scans found **0 violations**. 652 internal links and anchors resolved. 12 interaction checks passed (menu with Escape, FAQ keyboard, department pre-select, phone validation, enquiry download, mocked provider success/failure, carousel controls, no-JS fallback, HTTP 404). There were 0 console errors.
- A secrets scan found no API key or `OPENAI` reference in `dist/`, `src/`, `scripts/` or `public/`.

Lighthouse and real-device testing were not run.

## Before launch

1. Confirm the Instagram URLs and supply a Facebook URL if one is wanted.
2. Confirm student consent to publish the stories and portraits.
3. Configure `PUBLIC_FORM_ENDPOINT`. The form currently prepares a download only.
4. Set `PUBLIC_SITE_URL` and rebuild.
5. Review the privacy and terms copy with the business.
