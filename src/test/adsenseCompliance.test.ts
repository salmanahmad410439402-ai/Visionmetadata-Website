import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BLOG_POSTS } from "../data/blogPosts";
import { isAdSenseEligiblePath } from "../components/ads/AdSenseLoader";
import { createSampleDemoAsset } from "../lib/sampleDemoAsset";
import { findTrademarks } from "../lib/trademarkSniffer";

const ROOT = path.resolve(__dirname, "../..");
const readRepoFile = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("AdSense, Search Spam & Unwanted Software Compliance Guards", () => {
  it("prevents soft-404 SPA catch-all rewrites in vercel.json", () => {
    const vercel = JSON.parse(readRepoFile("vercel.json"));
    const rewrites: Array<{ source: string; destination: string }> = vercel.rewrites ?? [];
    for (const rule of rewrites) {
      expect(rule.destination).not.toBe("/index.html");
    }
    expect(vercel.redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/blog", destination: "/blogs", permanent: true }),
      ])
    );
  });

  it("keeps .reveal visible without JavaScript (no opacity: 0 cloaking/thin-DOM risk)", () => {
    const css = readRepoFile("src/index.css");
    const revealMatch = css.match(/\.reveal\s*\{[^}]*\}/);
    expect(revealMatch).not.toBeNull();
    expect(revealMatch![0]).toContain("opacity: 1");
    expect(revealMatch![0]).not.toMatch(/opacity:\s*0\b/);
  });

  it("does not load adsbygoogle.js globally in index.html", () => {
    const indexHtml = readRepoFile("index.html");
    expect(indexHtml).not.toContain("adsbygoogle.js");
    // Ownership verification meta tag stays on valid templates
    expect(indexHtml).toContain('name="google-adsense-account"');
  });

  it("scopes AdSense eligibility strictly to publisher-rich editorial routes", () => {
    // Eligible editorial & reference routes
    expect(isAdSenseEligiblePath("/blogs")).toBe(true);
    expect(isAdSenseEligiblePath("/blogs/")).toBe(true);
    expect(isAdSenseEligiblePath("/faq")).toBe(true);
    expect(isAdSenseEligiblePath("/tutorials")).toBe(true);
    expect(isAdSenseEligiblePath("/metadata-limits")).toBe(true);
    for (const post of BLOG_POSTS) {
      expect(isAdSenseEligiblePath(`/blog/${post.slug}`)).toBe(true);
    }

    // Ineligible marketing, checkout, tool, legal, and unknown/404 routes
    for (const disallowed of [
      "/",
      "/about",
      "/features",
      "/pricing",
      "/download",
      "/contact",
      "/chrome-extension",
      "/tool",
      "/metadata-checker",
      "/stock-csv-converter",
      "/event-calendar",
      "/privacy-policy",
      "/terms",
      "/refund-policy",
      "/editorial-policy",
      "/nonexistent-404-route",
      "/blog/nonexistent-post-slug",
    ]) {
      expect(isAdSenseEligiblePath(disallowed), `${disallowed} must not load AdSense`).toBe(false);
    }
  });

  it("enforces at least 14 original guides with valid ISO 8601 dates and clean factual claims", () => {
    expect(BLOG_POSTS.length).toBeGreaterThanOrEqual(14);
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    const slugs = new Set<string>();

    for (const post of BLOG_POSTS) {
      expect(slugs.has(post.slug), `duplicate blog slug: ${post.slug}`).toBe(false);
      slugs.add(post.slug);
      expect(post.publishDate, `${post.slug} publishDate`).toMatch(isoDatePattern);
      if (post.updatedDate) {
        expect(post.updatedDate, `${post.slug} updatedDate`).toMatch(isoDatePattern);
      }
      const serialized = JSON.stringify(post);
      expect(serialized).not.toMatch(/C2PA/i);
      expect(serialized).not.toMatch(/\b3 strikes\b/i);
    }
  });

  it("synchronizes public/sitemap.xml with /metadata-checker, /stock-csv-converter, /event-calendar, and every blog slug", () => {
    const sitemap = readRepoFile("public/sitemap.xml");
    expect(sitemap).toContain("<loc>https://tagyfy.com/metadata-checker</loc>");
    expect(sitemap).toContain("<loc>https://tagyfy.com/stock-csv-converter</loc>");
    expect(sitemap).toContain("<loc>https://tagyfy.com/event-calendar</loc>");
    for (const post of BLOG_POSTS) {
      expect(sitemap).toContain(`<loc>https://tagyfy.com/blog/${post.slug}</loc>`);
    }
    // Every <lastmod> must be ISO YYYY-MM-DD
    const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
    expect(lastmods.length).toBeGreaterThanOrEqual(33);
    for (const lm of lastmods) {
      expect(lm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("provides functional zero-API-key sample demo and trademark checker utilities", async () => {
    const sample = await createSampleDemoAsset();
    expect(sample.metadata.title.length).toBeGreaterThan(40);
    expect(sample.metadata.keywords.length).toBeGreaterThanOrEqual(25);

    const flagged = findTrademarks(
      "Person drinking Coca-Cola while holding an iPhone"
    );
    expect(flagged.length).toBeGreaterThanOrEqual(2);
  });

  it("verifies prerendered dist/ HTML output for canonical URLs, 404 noindex, privacy disclosure & AdSense scoping", () => {
    const distDir = path.join(ROOT, "dist");
    if (!fs.existsSync(path.join(distDir, "404.html"))) {
      return; // Skip dist-only assertions if vitest runs before build:prerender
    }

    // 1. 404.html must be noindex and completely free of AdSense scripts/tags
    const html404 = fs.readFileSync(path.join(distDir, "404.html"), "utf8");
    expect(html404).toContain('name="robots" content="noindex, nofollow"');
    expect(html404).not.toContain("adsbygoogle.js");
    expect(html404).not.toContain("google-adsense-account");

    // 2. Subpages must carry self-referencing canonicals and og:url (not homepage canonical)
    const pricingHtml = fs.readFileSync(path.join(distDir, "pricing/index.html"), "utf8");
    expect(pricingHtml).toContain('<link rel="canonical" href="https://tagyfy.com/pricing" />');
    expect(pricingHtml).toContain('<meta property="og:url" content="https://tagyfy.com/pricing" />');
    expect(pricingHtml).not.toContain("adsbygoogle.js");
    expect(pricingHtml).not.toContain("x64-setup.exe");

    // 3. /blogs must expose real crawlable <a href="/blog/..."> links to every article
    const blogsHtml = fs.readFileSync(path.join(distDir, "blogs/index.html"), "utf8");
    expect(blogsHtml).toContain("adsbygoogle.js");
    for (const post of BLOG_POSTS) {
      expect(blogsHtml).toContain(`href="/blog/${post.slug}"`);
    }

    // 4. Privacy policy must link to Google Partner Data disclosure
    const privacyHtml = fs.readFileSync(path.join(distDir, "privacy-policy/index.html"), "utf8");
    expect(privacyHtml).toContain("https://www.google.com/policies/privacy/partners/");
    expect(privacyHtml).not.toContain("adsbygoogle.js");

    // 5. Download landing page must disclose publisher, SmartScreen, and uninstall steps
    const downloadHtml = fs.readFileSync(path.join(distDir, "download/index.html"), "utf8");
    expect(downloadHtml).toContain("Salman Ahmad");
    expect(downloadHtml).toContain("SmartScreen");
    expect(downloadHtml).toContain("How to Uninstall Tagyfy Pro Completely");
    expect(downloadHtml).not.toContain("adsbygoogle.js");

    // 6. Metadata checker & Stock CSV converter prerendered HTML exist and have zero ads
    const checkerHtml = fs.readFileSync(path.join(distDir, "metadata-checker/index.html"), "utf8");
    expect(checkerHtml).toContain('<link rel="canonical" href="https://tagyfy.com/metadata-checker" />');
    expect(checkerHtml).not.toContain("adsbygoogle.js");

    const csvConverterHtml = fs.readFileSync(path.join(distDir, "stock-csv-converter/index.html"), "utf8");
    expect(csvConverterHtml).toContain('<link rel="canonical" href="https://tagyfy.com/stock-csv-converter" />');
    expect(csvConverterHtml).not.toContain("adsbygoogle.js");

    const eventCalendarHtml = fs.readFileSync(path.join(distDir, "event-calendar/index.html"), "utf8");
    expect(eventCalendarHtml).toContain('<link rel="canonical" href="https://tagyfy.com/event-calendar" />');
    expect(eventCalendarHtml).not.toContain("adsbygoogle.js");

    // 7. Every prerendered page must wrap content in the styled .prerender-shell (no unstyled raw text flash)
    const homeHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
    expect(homeHtml).toContain('class="prerender-shell"');
    expect(homeHtml).toContain('class="prerender-header"');
    expect(homeHtml).toContain('class="prerender-card"');
    expect(html404).toContain('class="prerender-shell"');

    const indexCss = readRepoFile("src/index.css");
    expect(indexCss).toContain(".prerender-shell");
    expect(indexCss).toContain(".prerender-card h1");
  });
});
