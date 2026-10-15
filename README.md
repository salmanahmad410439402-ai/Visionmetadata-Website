# Tagyfy Pro — website and web tool

Source for **https://tagyfy.com**: the marketing site, the stock-contributor
guides, and the free browser metadata generator.

The Windows desktop application is distributed separately — its installer is
published on the [releases page](https://github.com/salmangraphics839-hue/visionmeta-releases/releases),
and an internal feature reference lives in `docs/desktop-app-feature-reference.txt`.

---

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript, built with Vite |
| Routing | react-router-dom (client-side) |
| Styling | Tailwind CSS + shadcn/ui |
| Head/meta | react-helmet-async |
| Tests | Vitest + Testing Library |
| Hosting | Vercel (`vercel.json`), with an Express option in `server/` |

## Getting started

```bash
npm install
npm run dev          # dev server on :8080
npm test             # vitest
npm run build        # vite build only
npm run build:prerender   # vite build + static HTML prerender (use this for production)
```

`npm run build:prerender` is the production build. It runs `prerender.ts`, which
writes a fully rendered HTML file per route into `dist/`. That matters because a
large share of crawlers — including ad-review crawlers — do not execute
JavaScript, and would otherwise see an empty `<div id="root">`.

## Project layout

```
src/
  components/          UI, organised by surface
    software-ui/       the browser tool's dashboard
    tool/              supporting content for /tool
    ads/               AdSense unit wrapper
  config/
    commerce.ts        seller identity, payment rails, order process ← single source of truth
  data/
    blogPosts.ts       article content
    faqs.ts            FAQ content ← shared by the page and the prerender
  lib/
    richText.tsx       inline markdown renderer for article bodies
    structuredData.tsx JSON-LD schemas
    nativeFs.ts        desktop filesystem helpers
  pages/               one component per route
prerender.ts           static HTML generation for every route
scripts/
  package-extension.sh builds the distributable Chrome extension ZIP
```

## Conventions worth knowing before editing

These exist because each one was violated once and caused a real problem.

**Content has one home.** FAQs live in `src/data/faqs.ts` and commercial details
in `src/config/commerce.ts`. Both are read by the React pages *and* by
`prerender.ts`. When these were duplicated, the crawler-facing HTML silently fell
behind the rendered page.

**Never hard-code payment details, contact addresses or delivery promises.** A
test (`src/test/commerce.test.ts`) fails the build if an account number or a
delivery claim appears outside `config/commerce.ts`.

**Article bodies are rendered by `src/lib/richText.tsx`.** Use the shared
renderer rather than regexing markdown inline. A previous local copy read the
wrong capture groups and deleted 326 words and 8 links from published articles.
`src/test/richText.test.tsx` guards against it returning.

**Only assert what can be verified.** No invented testimonials, download counts
or ratings; JSON-LD carries no `aggregateRating` because none is collected. See
the live editorial standards page for the policy this reflects.

**Say what the software does not do.** Every product surface has a matching
limitations note: the browser tool cannot write metadata into vector or video
files, images are sent to the chosen AI provider for analysis, and no marketplace
outcome is guaranteed.

## Adding a page

1. Create the component in `src/pages/`.
2. Register the route in `src/App.tsx`.
3. Add an entry to `PAGES` in `prerender.ts`, with `content` (crawlable HTML) and
   `schema` (JSON-LD where appropriate).
4. Add the URL to `public/sitemap.xml` with today's `lastmod`.
5. Link it from somewhere reachable — the footer or a related-content block.

A page that is missing step 3 renders as an empty shell to any crawler that does
not run JavaScript.

## Chrome extension

The distributable archive is built with:

```bash
./scripts/package-extension.sh <path-to-unpacked-extension> <version>
```

It strips build tooling, renames the folder to `tagyfy-pro`, adds a disclosure
file, and verifies the manifest version matches. The previously shipped archive
contained `package.json`, `package-lock.json` and `build.js` inside a folder
named `dis obfuscated`, which is what the script now prevents.

## Deployment

Push to the default branch; Vercel builds and deploys. See `DEPLOYMENT.md` for
the self-hosted Express/Nginx alternative and `deploy/nginx/` for the config.

## Licence

Proprietary. The desktop application and the extension are commercial products;
this repository is public for transparency about how the website is built.
