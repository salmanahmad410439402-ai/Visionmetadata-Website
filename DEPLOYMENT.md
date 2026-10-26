# Deployment, Search Console & AdSense Readiness Guide — Tagyfy Pro (`tagyfy.com`)

This repository builds **Tagyfy Pro** (`https://tagyfy.com`) on **Vercel** using static prerendering (`vite build && npx tsx prerender.ts`) plus serverless `/api/*` endpoints.

---

## 1. Local Build, Prerender & Compliance Verification

Run the automated test suite and prerender build before deploying:

```bash
npm ci
npx tsc --noEmit
npm run build:prerender
npm test
```

### What `npm run build:prerender` Produces
- **31 prerendered canonical HTML routes** (`dist/index.html` + `dist/<route>/index.html`), each with its own `<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:url`, JSON-LD schema, and crawler-readable `<div id="root">` content.
- **`dist/404.html`** with `<meta name="robots" content="noindex, nofollow" />` and zero AdSense tags or scripts. Because `vercel.json` has no catch-all SPA rewrite to `/index.html`, Vercel serves `dist/404.html` with a **true HTTP `404 Not Found`** status code for any unknown URL.
- **Synchronized `public/sitemap.xml` & `dist/sitemap.xml`** covering all 31 canonical URLs (17 site/tool/reference pages including `/metadata-checker` + 14 `/blog/<slug>` practitioner guides) with ISO `YYYY-MM-DD` `<lastmod>` dates.
- **Scoped AdSense script loading**: `adsbygoogle.js` is injected strictly on editorial & reference routes (`/blogs`, `/blog/:slug`, `/metadata-limits`, `/tutorials`, `/faq`) and never on checkout, legal, download, contact, tool, or error screens.

---

## 2. Post-Deploy Live Verification on `tagyfy.com`

Immediately after Vercel deploys to `https://tagyfy.com`, verify HTTP headers and output:

```bash
# 1. Confirm unknown routes return real HTTP 404 (not 200 soft-404)
curl -I https://tagyfy.com/nonexistent-404-verification-check

# 2. Confirm /blog (singular) permanently redirects to /blogs
curl -I https://tagyfy.com/blog

# 3. Confirm subpages emit self-referencing canonicals
curl -s https://tagyfy.com/metadata-checker | grep -E 'rel="canonical"|og:url'
curl -s https://tagyfy.com/blogs | grep -o 'href="/blog/[^"]*"' | head -n 15

# 4. Confirm ads.txt and sitemap.xml are reachable with HTTP 200
curl -I https://tagyfy.com/ads.txt
curl -I https://tagyfy.com/sitemap.xml
```

---

## 3. Google Search Console & Domain Consolidation Checklist

Google AdSense requires an **established web presence** and **clean canonical indexation** on the domain under review (`tagyfy.com`). Complete every step below after deployment:

1. **Verify Both Properties in Google Search Console**:
   - Add and verify the Domain property `tagyfy.com` (or `https://tagyfy.com/`).
   - Keep `https://visionmeta.vercel.app/` verified so Search Console recognizes your ownership of the legacy Vercel subdomain.
2. **Submit Change of Address (`visionmeta.vercel.app` → `tagyfy.com`)**:
   - Ensure `https://visionmeta.vercel.app/*` returns a `301` or `308` permanent redirect to `https://tagyfy.com/*` in Vercel Domains settings.
   - In Search Console for `visionmeta.vercel.app`, open **Settings → Change of address** and select `tagyfy.com` so Google transfers indexation signals cleanly.
3. **Submit Sitemap**:
   - In Search Console for `tagyfy.com`, open **Sitemaps** and submit:
     `https://tagyfy.com/sitemap.xml` (31 canonical URLs).
4. **Request Priority Indexing via URL Inspection**:
   - Inspect and click **Request Indexing** on key hubs first:
     - `https://tagyfy.com/`
     - `https://tagyfy.com/blogs`
     - `https://tagyfy.com/metadata-checker`
     - `https://tagyfy.com/metadata-limits`
     - `https://tagyfy.com/tool`
     - `https://tagyfy.com/about`
     - Top 4–5 `/blog/<slug>` guides.
5. **Update External Repository & Channel Links**:
   - On GitHub (`Visionmetadata-Website` repository **About** sidebar), replace `https://visionmeta.vercel.app` with `https://tagyfy.com`.
   - Ensure any YouTube video descriptions (`MoeprdBnpes`) and social profiles link directly to `https://tagyfy.com`.

---

## 4. When to Click "Request Review" in Google AdSense

Do **not** click **Request review** the same minute you deploy. Wait until all four readiness checks pass in Google Search Console:

- [ ] `site:tagyfy.com` in Google Search returns **20–30+ indexed canonical pages** (including `/blogs`, `/metadata-checker`, `/metadata-limits`, and individual `/blog/*` guides).
- [ ] Search Console **Pages → Not indexed** shows **0 Soft 404** issues and **0 Duplicate without user-selected canonical** errors on `tagyfy.com`.
- [ ] Search Console **Performance → Search results** shows active impressions and organic clicks to `tagyfy.com` over **2–4 weeks**.
- [ ] If placing manual `<AdUnit slotId="..." />` blocks on editorial pages later, pass real numeric AdSense ad-unit slot IDs from your AdSense dashboard (never placeholder strings).
