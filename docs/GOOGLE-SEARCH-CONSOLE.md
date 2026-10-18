# Google Search Console — cruisejobmentor.com

A step-by-step guide to getting the site verified, submitted and indexed. Do these steps only **after** this branch is deployed to production.

## 1. Pre-launch checklist (on the live domain)

Run `npm run build && npm run check:live` from the project folder. Every line must show ✔. The script checks the following:

| Check | Expected |
| --- | --- |
| HTTPS | `https://cruisejobmentor.com/` answers 200 with a valid certificate. The Let's Encrypt certificate covers the apex and `www` and renews automatically. |
| Redirects | `http://…` → `https://cruisejobmentor.com/…` (301); `https://www.cruisejobmentor.com/…` → `https://cruisejobmentor.com/…` (301); `/about` → `/about/`; `/about/index.html` → `/about/` |
| robots.txt | `https://cruisejobmentor.com/robots.txt` shows `Allow: /` and `Sitemap: https://cruisejobmentor.com/sitemap-index.xml` |
| Sitemap | `https://cruisejobmentor.com/sitemap-index.xml` answers 200; `sitemap-0.xml` lists 33 URLs |
| 404 | Any unknown URL answers **HTTP 404** with the branded "back on course" page |
| Indexing | Home page has `<meta name="robots" content="index, follow, max-image-preview:large">` |
| Favicon | `/favicon.ico`, `/favicon.svg`, `/favicon-48x48.png`, `/favicon-96x96.png`, `/apple-touch-icon.png`, `/site.webmanifest` all answer 200 |
| Form | `/api/enquiry` is deployed. Then send **one** real test enquiry yourself from `/contact/` (see the main report) and confirm it reaches the **Inbox** of info@cruisejobmentor.com |

> Before this branch was deployed, the live site was built with `noindex,nofollow` and `robots.txt` said `Disallow: /`. Google could not index anything until this deploy. Don't submit the sitemap until `check:live` passes.

## 2. Add a Domain property and verify it with DNS (GoDaddy)

A **Domain property** covers `https://`, `http://`, `www` and every subdomain in one place.

1. Open https://search.google.com/search-console and sign in with the Google account the academy will keep long term.
2. Click **Add property** → choose **Domain** (left box) → type `cruisejobmentor.com` (no `https://`, no `www`) → **Continue**.
3. Google shows a TXT record such as `google-site-verification=AbC123…`. Click **Copy**.
4. In a new tab, sign in to **GoDaddy** → **My Products** → next to *cruisejobmentor.com* click **DNS** (or **Manage DNS**).
5. Click **Add New Record**:
   - **Type:** `TXT`
   - **Name:** `@`
   - **Value:** paste the whole `google-site-verification=…` string
   - **TTL:** default (1 hour)
6. Click **Save**. Don't edit or delete the existing TXT records: `v=spf1 include:…` (email sending) and `zoho-verification=…` (Zoho Mail) must stay exactly as they are.
7. Back in Search Console, click **Verify**. If it says the record wasn't found, wait 15–60 minutes and click **Verify** again. DNS changes can take up to 48 hours in rare cases.

Leave the TXT record in place permanently: Google re-checks it.

## 3. Submit the sitemap

1. In the new property, open **Indexing → Sitemaps**.
2. In **Add a new sitemap**, type `sitemap-index.xml` (the box already shows `https://cruisejobmentor.com/`) → **Submit**.

What to expect:

- **One sitemap covers every page.** `sitemap-index.xml` points to `sitemap-0.xml`, which lists all 33 indexable pages. Don't submit them one by one.
- **"Couldn't fetch" or "Pending" for up to 24 hours is normal** for a newly submitted sitemap. Check again the next day before worrying.
- **Opening the sitemap in a browser** shows "This XML file does not appear to have any style information associated with it." That is normal: sitemaps are for search engines, not people.

## 4. The 33 indexable URLs

All are `https://cruisejobmentor.com` + the path below.

**Main pages (10)**
1. `/`
2. `/about/`
3. `/mentorship-program/`
4. `/career-pathways/`
5. `/success-stories/`
6. `/our-mentor/`
7. `/expert-panel/`
8. `/cruise-career-journey/`
9. `/faq/`
10. `/contact/`

**Program pages (16)**
11. `/services/cruise-career-roadmap/`
12. `/services/cv-application-guidance/`
13. `/services/interview-preparation/`
14. `/services/visa-guidance/`
15. `/services/documentation-joining-guidance/`
16. `/services/stcw-maritime-knowledge/`
17. `/services/food-beverage/`
18. `/services/front-office/`
19. `/services/housekeeping/`
20. `/services/culinary/`
21. `/services/deck-security/`
22. `/services/spa-wellness/`
23. `/services/usph-shipboard-hygiene/`
24. `/services/life-onboard/`
25. `/services/personal-development/`
26. `/services/career-growth/`

**Expert profiles (5)**
27. `/expert-panel/ashish-sharma/`
28. `/expert-panel/sanjay-mamgain/`
29. `/expert-panel/anirudh-prakash/`
30. `/expert-panel/kalyani/`
31. `/expert-panel/mudita-mittal/`

**Legal (2)**
32. `/privacy-policy/`
33. `/terms-and-conditions/`

### Priority pages for manual "Request indexing"

Google limits manual requests (roughly 10 per day per property). For each URL: paste it into the **search bar at the top** of Search Console → wait for the URL Inspection report → **Request indexing** → wait for the confirmation → next URL.

| Day | URLs |
| --- | --- |
| Day 1 | `/` (also refreshes the favicon), `/mentorship-program/`, `/contact/`, `/our-mentor/`, `/career-pathways/`, `/success-stories/`, `/about/`, `/expert-panel/`, `/cruise-career-journey/`, `/faq/` |
| Day 2 | `/services/interview-preparation/`, `/services/cruise-career-roadmap/`, `/services/cv-application-guidance/`, `/services/documentation-joining-guidance/`, `/services/visa-guidance/`, `/services/stcw-maritime-knowledge/`, `/services/food-beverage/`, `/services/front-office/`, `/services/housekeeping/`, `/services/culinary/` |
| Day 3 | `/services/deck-security/`, `/services/spa-wellness/`, `/services/usph-shipboard-hygiene/`, `/services/life-onboard/`, `/services/personal-development/`, `/services/career-growth/`, `/expert-panel/ashish-sharma/`, `/expert-panel/sanjay-mamgain/`, `/expert-panel/anirudh-prakash/`, `/expert-panel/kalyani/` |
| Day 4 | `/expert-panel/mudita-mittal/` |

The privacy and terms pages don't need manual requests. Google will find them through the sitemap and the footer links.

## 5. Pages that must NOT be submitted

| URL | Why |
| --- | --- |
| `/thank-you/` | Shown only after an enquiry is sent. It is `noindex, follow`, has no canonical and is left out of the sitemap, so it never appears in search results. |
| `/404` / any missing URL | The error page is `noindex` and answers HTTP 404. Submitting it would only produce an error. |
| `/api/enquiry` | The form endpoint, not a page. It only accepts POST requests from the website. |
| `https://sailpreneur.netlify.app/…` and deploy-preview URLs | Netlify's own addresses. Their pages point Google to cruisejobmentor.com with canonical tags, and previews are built `noindex`. |
| `http://`, `www.` or `…/index.html` versions | They redirect (301) to the canonical `https://cruisejobmentor.com/…/` URL. |

If Search Console later lists `/thank-you/` under **Excluded by 'noindex' tag**, that is correct and needs no action.

## 6. Weeks 1–4 follow-up

**Week 1**
- **Indexing → Pages:** "Indexed" should start rising within days. "Discovered – currently not indexed" and "Crawled – currently not indexed" are normal for a new site. Re-check them in week 3.
- Finish the manual "Request indexing" batches (days 1–4 above).
- **Google Business Profile:** at https://business.google.com, create or claim the profile for *AKMICS Sailpreneur Academy*. Use the same name, address (D.A.V. PG College Road, Dehradun, Uttarakhand), phone (+91 9185282229) and website (`https://cruisejobmentor.com/`) as the site. Google verifies the profile by postcard, phone or video, so the client must do this step. Consistent details help local search.
- **Bing Webmaster Tools:** at https://www.bing.com/webmasters choose **Import from Google Search Console**. It copies the verified site and the sitemap in one step. This also covers search engines that use Bing's index.

**Week 2**
- **Enhancements** (left menu, appears once Google has processed pages):
  - **Breadcrumbs:** should show about 32 valid items (every page except the home page).
  - **FAQ:** the `/faq/` page carries FAQPage markup. Google shows FAQ rich results only for a limited set of sites, so a "valid" status without rich results is expected.
  - **Organization / logo:** check with the Rich Results Test (https://search.google.com/test/rich-results) on `https://cruisejobmentor.com/`. Organization, WebSite, Person and Breadcrumb items should all be detected with no errors.
- **Experience → Core Web Vitals:** may say "Not enough usage data" for weeks on a new site. Use PageSpeed Insights (https://pagespeed.web.dev) on `/` and `/mentorship-program/` (mobile) instead.

**Week 3**
- **Indexing → Pages → Why pages aren't indexed:** for any important page still not indexed, open it with URL Inspection → **Test live URL** → if the test passes, **Request indexing** once more.
- **Performance → Search results:** first impressions and queries appear. Note which pages get impressions but few clicks; their titles and descriptions are the first candidates for tuning.

**Week 4**
- Confirm the favicon shows in Google results on mobile. Google can take **days to weeks** to update the icon. Requesting indexing of the home page (day 1) speeds this up.
- Re-run `npm run check:live` after any deploy, and PageSpeed on mobile for `/` and one inner page.
- **Links:** add the website to the academy's Instagram bio and Google Business Profile. These are the first trustworthy links Google will follow.
