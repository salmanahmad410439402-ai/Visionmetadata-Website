/**
 * Post-build prerender script for Tagyfy Pro.
 *
 * After `vite build` produces the SPA bundle in dist/,
 * this script launches a local server, visits each route with Puppeteer,
 * waits for React to render, and saves the fully-rendered HTML
 * so that crawlers (Google AdSense, Googlebot) see real content
 * instead of an empty <div id="root"></div>.
 *
 * Usage: node prerender.mjs
 */

import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "dist");
const PORT = 45678; // Use an unusual port to avoid conflicts

// All routes to pre-render
const ROUTES = [
  "/",
  "/features",
  "/pricing",
  "/download",
  "/tool",
  "/tutorials",
  "/blogs",
  "/blog",
  "/about",
  "/contact",
  "/faq",
  "/chrome-extension",
  "/privacy-policy",
  "/terms",
  "/refund-policy",
  // Individual blog posts
  "/blog/i-wasted-200-generations-how-ai-actually-sees-prompts",
  "/blog/why-does-your-best-photo-keep-getting-rejected-adobe-stock-secret",
  "/blog/common-mistakes-account-suspension-adobe-stock",
  "/blog/mastering-stock-metadata-title-seo-keyword-guide",
  "/blog/why-approved-photos-not-selling-update-metadata",
  "/blog/free-adobe-stock-metadata-generator",
  "/blog/adobe-stock-title-keyword-strategy",
  "/blog/adobe-stock-icon-pack-strategy",
];

// Simple MIME type lookup
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mimes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".mp4": "video/mp4",
    ".txt": "text/plain",
    ".xml": "application/xml",
    ".zip": "application/zip",
  };
  return mimes[ext] || "application/octet-stream";
}

// Create a simple static file server for the dist directory
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === "/" ? "index.html" : req.url);

      // If the path doesn't have an extension, serve index.html (SPA fallback)
      if (!extname(filePath)) {
        filePath = join(DIST_DIR, "index.html");
      }

      // If the file doesn't exist, serve index.html (SPA fallback)
      if (!existsSync(filePath)) {
        filePath = join(DIST_DIR, "index.html");
      }

      try {
        const content = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": getMimeType(filePath) });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(PORT, () => {
      console.log(`📦 Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  // Check if dist exists
  if (!existsSync(DIST_DIR)) {
    console.error("❌ dist/ directory not found. Run `vite build` first.");
    process.exit(1);
  }

  // Try to import puppeteer
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.error("❌ puppeteer not found. Install it with: npm install --save-dev puppeteer");
    process.exit(1);
  }

  const server = await startServer();

  console.log("🚀 Launching headless browser...\n");
  const browser = await puppeteer.default.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let successCount = 0;
  let failCount = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      const url = `http://localhost:${PORT}${route}`;

      // Navigate to the page and wait for React to fully render
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Wait a bit more for React helmet to update the head
      await page.waitForFunction(
        () => document.querySelector("#root")?.innerHTML?.length > 100,
        { timeout: 10000 }
      ).catch(() => {
        // Some pages (like tool) might take longer, continue anyway
      });

      // Small extra delay for helmet meta tag updates
      await new Promise((r) => setTimeout(r, 500));

      // Get the fully rendered HTML
      const html = await page.content();

      // Determine the output path
      const outputDir =
        route === "/"
          ? DIST_DIR
          : join(DIST_DIR, ...route.split("/").filter(Boolean));

      // Create directory if it doesn't exist
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const outputFile = join(outputDir, "index.html");
      writeFileSync(outputFile, html, "utf-8");

      // Quick check: does the rendered HTML have content?
      const hasContent = html.includes("<h1") || html.includes("<h2") || html.includes("<main");
      const status = hasContent ? "✅" : "⚠️ ";

      console.log(`${status} ${route} → ${outputFile.replace(DIST_DIR, "dist")}`);
      successCount++;

      await page.close();
    } catch (err) {
      console.error(`❌ Failed to prerender ${route}:`, err.message);
      failCount++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\n🎉 Pre-rendering complete! ${successCount} pages rendered, ${failCount} failed.`);

  if (failCount > 0) {
    process.exit(1);
  }
}

prerender().catch((err) => {
  console.error("Fatal prerender error:", err);
  process.exit(1);
});
