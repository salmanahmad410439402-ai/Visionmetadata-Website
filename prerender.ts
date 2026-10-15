import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from './src/data/blogPosts.js';
import { FAQS } from './src/data/faqs.js';
import { PLATFORMS, FAILURES, LIMITS_LAST_CHECKED } from './src/data/platformLimits.js';
import { SELLER, PAYMENT_RAILS, ORDER_STEPS, FRAUD_NOTICE, CARD_CHECKOUT } from './src/config/commerce.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');

// ─── Rich HTML content for each static page ────────────────────────────────
// This content mirrors the actual React-rendered page content so that
// crawlers (AdSense, Googlebot) that do NOT execute JavaScript can read
// the full page substance.  When React hydrates on the client, it safely
// overwrites this pre-rendered DOM.

// ─── Generated from src/config/commerce.ts ─────────────────────────────────
// The crawler-facing copy for the seller, the order process and the payment
// rails is built from the same config the React pages read. It used to be typed
// out here as literals, which is how the prerendered HTML ended up disagreeing
// with the live page about the same bank account.
const SELLER_HTML = `
<h2>Who you are buying from</h2>
<p>Tagyfy Pro is an independent software project written and maintained by ${SELLER.operator}, a stock contributor and designer based in Pakistan. It is not a company with a sales team — support is handled by the same person who builds the app.</p>
<p>Support: <a href="mailto:${SELLER.supportEmail}">${SELLER.supportEmail}</a> or WhatsApp ${SELLER.whatsappDisplay}. ${SELLER.supportHours}</p>
`;

const ORDER_HTML = `
<h2>How ordering works</h2>
<ol>
${ORDER_STEPS.map((step) => `<li><strong>${step.title}.</strong> ${step.body}</li>`).join('\n')}
</ol>
<p>${CARD_CHECKOUT ? 'Card payment is available through the hosted checkout linked on this page.' : 'Card payment is not available yet. That means the current payment methods carry no chargeback protection, so we recommend using the free trial first and buying only once you are satisfied.'}</p>

<h2>Staying safe when paying</h2>
<p>${FRAUD_NOTICE}</p>

<h2>Payment methods</h2>
${PAYMENT_RAILS.map((rail) => `<h3>${rail.label} (${rail.region})</h3>
<p>${rail.description} ${rail.fields.map((f) => `${f.label}: ${f.value}.`).join(' ')}</p>
<p>${rail.note}</p>`).join('\n')}
`;

const CONTENT_HOME = `
<h1>Tagyfy Pro — AI-Powered Metadata Generator for Adobe Stock</h1>
<p>Supercharge your Adobe Stock workflow. Generate, optimize, and embed titles, descriptions, and keywords directly into your images, videos, and vector files — in bulk, in seconds.</p>

<h2>How It Works — From File to Upload-Ready in Four Steps</h2>
<p>Everything happens inside the app — no browser, no manual entry, no extra tools needed.</p>
<h3>Step 1: Upload Your Assets</h3>
<p>Drag and drop images, videos, vectors, or entire folders. Batch upload 100+ files at once. Supports JPG, PNG, WebP, EPS, AI, SVG, MP4, and more.</p>
<h3>Step 2: AI Analyzes and Generates</h3>
<p>Vision AI analyzes every file and generates SEO-optimized titles, rich descriptions, and up to 50 ranked keywords — tailored to each platform's requirements.</p>
<h3>Step 3: Review, Refine and Check Quality</h3>
<p>Edit metadata inline, use bulk editor for batch changes, check confidence scores and risk flags per asset. Get platform readiness ratings before upload.</p>
<h3>Step 4: Embed and Export Ready</h3>
<p>Metadata embeds directly into your files. Export platform-ready CSVs for Adobe Stock, Freepik, Shutterstock, Dreamstime, 123RF, and Vecteezy in seconds.</p>

<h2>Product Facts</h2>
<ul>
<li>Up to 50 configurable keywords per asset</li>
<li>500+ file desktop batch queue target</li>
<li>Four clear steps: upload, generate, review, and export</li>
<li>Five AI provider options with bring-your-own-key access</li>
<li>Local-first desktop file handling, with direct AI-provider requests when analysis is requested</li>
</ul>

<h2>A Quick Look at What's Inside</h2>
<p>A small sample of the 16 production features — see the full catalogue and supported file formats on the Features page.</p>
<ul>
<li><strong>Multi-Provider AI Engine:</strong> Run Gemini, GPT-4o, Groq, Mistral, and OpenRouter side by side with automatic key rotation.</li>
<li><strong>Trademark and Brand Sniffer:</strong> Flags 100+ brand names before upload so your assets never get rejected for trademarked terms.</li>
<li><strong>Confidence and Risk Scoring:</strong> Every asset gets a 0-100 readiness score across four compliance dimensions before you submit it.</li>
<li><strong>6-Platform CSV Export:</strong> One click produces correctly formatted CSVs for Adobe Stock, Shutterstock, Freepik, and more.</li>
</ul>

<h2>Before vs After — See What Changes</h2>
<p>From manual keyword entry to automated, AI-optimized metadata in minutes.</p>
<h3>Without Automation (Before)</h3>
<ul>
<li>Type titles one by one — 5-10 minutes per file</li>
<li>Copy-paste keywords manually from notes</li>
<li>Get rejected because of trademarked keywords</li>
<li>Re-enter metadata on every stock platform</li>
<li>No way to batch process — one file at a time</li>
<li>Guess what keywords will rank — no data</li>
</ul>
<h3>With Tagyfy Pro (After)</h3>
<ul>
<li>AI generates title, description and 50 keywords instantly</li>
<li>Keywords ranked by SEO weight — best ones first</li>
<li>Trademark sniffer auto-removes brand names</li>
<li>Metadata embeds into files — platforms read it automatically</li>
<li>Process hundreds of files in one batch</li>
<li>Confidence scores and risk analysis per asset</li>
</ul>

<h2>Designed for a Review-First Workflow</h2>
<p>Tagyfy generates a starting point; contributors remain responsible for checking accuracy, removing irrelevant terms, confirming trademarks and releases, and following each marketplace's current submission rules.</p>

<h2>A Few Quick Questions</h2>
<p>The four questions new visitors ask most. See the full, searchable FAQ page for licensing, rate limits, trademark detection, and more.</p>
<h3>Does Tagyfy Pro embed metadata directly into files?</h3>
<p>Yes — natively, with no extra software. Adobe Stock, Shutterstock, and other marketplaces pick up the written IPTC/XMP data the moment you upload.</p>
<h3>Which AI providers are supported?</h3>
<p>Google Gemini, OpenAI GPT-4o, Groq, Mistral AI, and OpenRouter, with automatic key rotation across multiple API keys.</p>
<h3>Is my API key safe inside the app?</h3>
<p>For the Windows app, API keys are kept on your computer and requests go directly to the provider you choose. The browser tool stores a key locally only when you choose that option and sends the selected file directly to the chosen AI provider; Tagyfy does not proxy or store the media.</p>
<h3>How does the licensing work?</h3>
<p>Four plans are available — 1 Month, 3 Months, 6 Months, and 1 Year — and you are never billed per generation.</p>

<h2>Adobe Stock Chrome Extension — 100% Free</h2>
<p>Update approved assets and generate fresh metadata directly inside the Adobe Stock contributor dashboard using Gemini, ChatGPT, Groq, and Mistral. 100% free with no license required.</p>

<h2>Ready to automate your stock metadata?</h2>
<p>Start generating metadata drafts online for free right in your browser, or download the Windows Desktop app for native vector and video embedding.</p>
`;

const CONTENT_ABOUT = `
<h1>About Us — Our Mission and Story</h1>
<p>Empowering Stock Media Creators with AI Precision. We built Tagyfy Pro to solve the single most frustrating bottleneck in digital asset licensing: spending hours manually tagging, describing, and embedding metadata into thousands of stock media files.</p>

<h2>The Problem We Solved</h2>
<p>Stock contributors often spend significant time writing repetitive titles and keywords. Many browser tools also require a separate CSV or manual copy-paste step when a contributor needs to prepare vector or video files, which creates a clear workflow problem.</p>

<h2>The Tagyfy Solution</h2>
<p>Tagyfy Pro is a desktop-native application engineered with modern Rust and React. It brings together state-of-the-art vision models (Google Gemini 2.5/3.5, OpenAI GPT-4o, Groq, Mistral) and high-speed native binary embedding pipelines to automatically analyze, describe, and directly write metadata into files in bulk.</p>

<h2>How the Product Is Designed</h2>
<h3>Privacy-Aware Design</h3>
<p>The Windows app processes and embeds files locally. AI analysis sends the selected file or extracted video frames directly to the provider you choose; Tagyfy does not proxy or store that media.</p>
<h3>Blazing Performance</h3>
<p>Multi-threaded batch processing handles hundreds of assets in seconds with zero artificial limits.</p>
<h3>Marketplace SEO</h3>
<p>Built-in algorithms tuned specifically for Adobe Stock, Shutterstock, Freepik, and Vecteezy guidelines.</p>

<h2>Try Tagyfy Pro Free Today</h2>
<p>Experience the automated workflow with our full-access 3-day free trial. Download for Windows or contact the developer for support.</p>
`;

const CONTENT_FEATURES = `
<h1>Every Feature, In Full Detail</h1>
<p>This page is the complete, up-to-date reference for everything Tagyfy Pro ships with today — the core capabilities, the full 16-feature catalogue, and every supported file format. For the four-step onboarding walkthrough, visit the homepage.</p>

<h2>Built for Professional Metadata</h2>
<p>Everything you need to generate SEO-optimized metadata at scale, from single assets to 500+ file batches.</p>
<ul>
<li><strong>Multi-AI Support:</strong> Connect Gemini, GPT-4, Groq, OpenRouter, or Mistral. Use multiple providers simultaneously.</li>
<li><strong>100+ File Types:</strong> JPEG, PNG, WebP, MP4 videos, AI vectors, EPS, SVG, TIFF. Process anything in one batch.</li>
<li><strong>SEO Confidence Scoring:</strong> Every asset gets a confidence score (0-100) with risk flags to prevent platform rejection.</li>
<li><strong>Trademark Protection:</strong> AI-powered sniffer automatically removes brand names and replaces them with safe alternatives.</li>
<li><strong>Smart Batch Processing:</strong> Process 100+ files at once with automatic retry on failure and unattended mode support.</li>
<li><strong>Platform Export:</strong> Export formatted CSV for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, Vecteezy.</li>
</ul>

<h2>16 Powerful Features Built for Stock Contributors</h2>
<ul>
<li><strong>Multi-Provider AI:</strong> Use Gemini, GPT-4o, Groq (Llama 4), OpenRouter, or Mistral. Add unlimited API keys and run multiple AI providers in parallel.</li>
<li><strong>Rate Limit Protection:</strong> Automatically rotates through your API keys and providers when limits are hit.</li>
<li><strong>Smart Parallel Queueing:</strong> Intelligent API queueing ensures optimal speed and parallel processing.</li>
<li><strong>Batch Processing at Scale:</strong> Process 100+ to 500+ assets in a single batch with auto-retry on failures.</li>
<li><strong>Trademark and Brand Sniffer:</strong> AI-powered system detects 100+ brand names and trademarked terms. Auto-removes them and replaces with safe alternatives.</li>
<li><strong>Series and Event Context:</strong> Mark assets as a series to auto-append Part 01/02/03 sequences.</li>
<li><strong>Confidence and Risk Scores:</strong> Every asset gets a 0-100 confidence score with 4-axis breakdown.</li>
<li><strong>Platform Readiness Checks:</strong> Instant READY / REVIEW / NOT READY rating for Adobe Stock, Freepik, and Shutterstock.</li>
<li><strong>Bulk Metadata Editor:</strong> Spreadsheet-style view. Find and replace, append/prepend text, remove words across multiple assets.</li>
<li><strong>Negative Keywords:</strong> Define words you never want in metadata. They are automatically stripped from every output.</li>
<li><strong>Keyword Strategy Control:</strong> Choose Single-Word, Multi-Word, or Mixed keyword strategies. Customize keyword count (5-50).</li>
<li><strong>Native File Metadata:</strong> Embeds metadata directly into JPEG, PNG, WebP, TIFF, MP4 and vector files.</li>
<li><strong>6-Platform CSV Export:</strong> Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, Vecteezy — each formatted correctly.</li>
<li><strong>AI Disclosure Compliance:</strong> Auto-adds Generative AI keywords for AI-created content.</li>
<li><strong>Unattended Mode:</strong> Automatically downloads a ZIP with all metadata-embedded files after processing.</li>
<li><strong>Quality Check on Demand:</strong> Manual quality pass on any asset for detailed confidence breakdown.</li>
</ul>

<h2>Supported File Formats</h2>
<p>JPG, JPEG, PNG, WebP, TIFF, SVG, EPS, AI, MP4, MOV, WebM — over 100 supported file formats for images, vectors, and video content.</p>
`;

const CONTENT_PRICING = `
<h1>Tagyfy Pro pricing</h1>
<p>One-off payment for a fixed licence period. No subscription and no auto-renewal. The desktop app includes a full-access 3-day trial, so you can evaluate it on your own files before paying.</p>
<p>Compatible with Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF and Vecteezy.</p>

<h2>Licence plans</h2>
<h3>Starter — 1 month — $1.75 / Rs 499</h3>
<p>About $1.75 per month. Includes native file metadata embedding, full metadata generation for any supported file type, batch processing with parallel workers, trademark flagging and confidence scores, and CSV exports for Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF and Vecteezy.</p>

<h3>Creator — 3 months — $4.73 / Rs 1,347</h3>
<p>About $1.58 per month. Every Starter feature for a three-month licence period.</p>

<h3>Pro — 6 months — $8.93 / Rs 2,546</h3>
<p>About $1.49 per month. Every Starter feature for a six-month licence period.</p>

<h3>Studio — 12 months — $16.82 / Rs 4,790</h3>
<p>About $1.40 per month, and the lowest monthly rate of the four terms. Every Starter feature for a twelve-month licence period.</p>

<h2>All plans include</h2>
<ul>
<li>Native file metadata embedding — IPTC/XMP written directly into compatible files</li>
<li>Platform-formatted CSV exports for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF and Vecteezy</li>
<li>Metadata generation using AI vision analysis, with your own provider key</li>
<li>Batch processing of hundreds of files in one run</li>
<li>Direct embedding into JPG, PNG, WebP, TIFF, SVG, EPS, AI, MP4, MOV and WebM files</li>
</ul>

<h2>Free Chrome extension</h2>
<p>The Tagyfy Pro extension for Adobe Stock fills titles and keywords inside the contributor dashboard. It is free and needs no licence key.</p>

<h2>What you are agreeing to</h2>
<ul>
<li><strong>Try it before you pay:</strong> the desktop build runs a full-access 3-day trial with no card on file.</li>
<li><strong>One-time payment:</strong> a licence covers a fixed period. Nothing renews automatically and there is no subscription to cancel.</li>
<li><strong>One licence, one device:</strong> stated up front rather than buried in the terms.</li>
<li><strong>A receipt for every order:</strong> each payment carries an order reference and a receipt available on request.</li>
<li><strong>Refunds:</strong> if a technical problem cannot be resolved within 7 days of purchase you receive a full refund. Accidental duplicate payments are refunded immediately. Full terms are on the Refund Policy page.</li>
</ul>

${SELLER_HTML}
${ORDER_HTML}

<h2>About these prices</h2>
<p>Prices are listed in USD and PKR as two independent prices, not a currency conversion. Current pricing applies to new orders; existing licences are unaffected by later price changes.</p>
`;

const CONTENT_DOWNLOAD = `
<h1>Download Tagyfy Pro for Windows</h1>
<p>Download the Tagyfy Pro desktop application for Windows 10 and 11. Full-access 3-day free trial with AI-powered metadata generation and direct file embedding.</p>

<h2>System Requirements</h2>
<ul>
<li>Operating System: Windows 10 or Windows 11 (64-bit)</li>
<li>RAM: 4 GB minimum, 8 GB recommended</li>
<li>Disk Space: about 500 MB after installation (installer is about 160 MB)</li>
<li>Internet: Required for AI API calls (Gemini, OpenAI, Groq, Mistral)</li>
</ul>

<h2>What You Get</h2>
<ul>
<li>Full-access 3-day free trial — no credit card required</li>
<li>AI-powered metadata generation for images, vectors, and videos</li>
<li>Direct IPTC/XMP metadata embedding into files</li>
<li>Platform-specific CSV exports for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, and Vecteezy</li>
<li>Trademark sniffer for compliance safety</li>
<li>Batch processing of 500+ files at once</li>
<li>Confidence scoring and risk analysis per asset</li>
</ul>

<h2>Installation Steps</h2>
<ol>
<li>Download the Tagyfy Pro installer (.exe) from the download button above</li>
<li>Run the installer and follow the setup wizard</li>
<li>Launch Tagyfy Pro and start your 3-day free trial</li>
<li>Add your AI API key (free keys available from Google AI Studio)</li>
<li>Drag and drop your files and start generating metadata</li>
</ol>

<h2>Free Trial Details</h2>
<p>Your 3-day free trial gives you unrestricted access to every feature in Tagyfy Pro — including AI keywording, video tagging, direct IPTC/XMP file embedding, batch processing, and CSV exports. No credit card is required to start.</p>
`;

const CONTENT_CONTACT = `
<h1>Contact and support — Tagyfy Pro</h1>
<p>Questions about Tagyfy Pro, an existing licence, a refund, or bulk processing? Support is handled by the same person who develops the app.</p>

<h2>How to reach us</h2>
<h3>WhatsApp</h3>
<p>Message us on WhatsApp at +92 325 9640429. This is the usual channel for licence keys, order questions and refunds.</p>

<h3>E-mail</h3>
<p>Send an e-mail to ${SELLER.supportEmail}. Use this for anything that needs a written record, such as a refund request or a bug report.</p>

<h2>What we can help with</h2>
<ul>
<li>Licence key delivery, activation and renewal</li>
<li>Refund requests and payment confirmation</li>
<li>Technical issues and troubleshooting</li>
<li>Bulk processing and batch workflow questions</li>
<li>AI provider key setup (Gemini, OpenAI, Groq, Mistral, OpenRouter)</li>
<li>CSV export format questions for any supported marketplace</li>
<li>Feature requests and corrections to our documentation</li>
</ul>

<h2>Response time</h2>
<p>We aim to reply within a few hours, and always within 24 hours, seven days a week. Support is provided by one person rather than a call centre, so if you do not hear back within a day, please send a follow-up rather than assuming the message was ignored.</p>

<h2>Before you write</h2>
<p>Including these details lets us answer without a round trip: your app version, your Windows version, the file type involved, the AI provider you selected, your order reference if the question is about a purchase, and the exact text of any error message.</p>

<h2>Reporting a security or payment problem</h2>
<p>We will never message you first with new account details, never ask you to pay a different account holder, and never ask for your card number, bank password or one-time code. If you receive anything like that claiming to be from Tagyfy Pro, please forward it to the support e-mail above.</p>
`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Built from src/data/faqs.ts so the crawler-facing HTML can never drift from
 * the live React page. Previously this was a second, hand-maintained copy of
 * the same answers.
 */
const CONTENT_FAQ =
  `\n<h1>Frequently Asked Questions — Tagyfy Pro</h1>\n` +
  `<p>Answers on providers, file formats, licensing, privacy and limits. ` +
  `Use the search box on this page to filter them, or ask a question through the Contact form.</p>\n` +
  FAQS.map(
    (faq) => `<h2>${escapeHtml(faq.question)}</h2>\n<p>${escapeHtml(faq.answer)}</p>`
  ).join('\n') +
  `\n`;

const CONTENT_TUTORIALS = `
<h1>Setup Guides — Tagyfy Pro</h1>
<p>Four written guides that take you from a fresh install to a reviewed, metadata-embedded batch on Windows 10 and 11. A single walkthrough video covers the same workflow end to end.</p>

<h2>Guide 1: Install the app and confirm Windows trusts it</h2>
<ol>
<li>Download the installer from the Download page. The current build is Tagyfy_Pro_1.3.6_x64-setup.exe (about 160 MB).</li>
<li>Optionally verify the download against the .sig signature file published alongside the installer on the release page.</li>
<li>Run the installer and follow the prompts. The default install is per-user, so no administrator password is normally required.</li>
<li>Windows Defender SmartScreen may warn that the publisher is not yet widely recognised, because code-signing reputation builds over time. Only continue if the file came from the official release page and the signature and size match.</li>
<li>Launch Tagyfy Pro. You should land on the empty dashboard with the upload drop zone visible.</li>
</ol>

<h2>Guide 2: Add an AI provider key</h2>
<ol>
<li>Open Settings and go to the AI provider section. Keys are stored locally on your own machine, not on a Tagyfy server.</li>
<li>Create a key with your chosen provider. Google AI Studio issues a free Gemini API key in about a minute; Groq also has a free tier.</li>
<li>Add more than one key if you have them. The app rotates through keys automatically and parks a key in a short cooldown when it hits a rate limit.</li>
<li>Choose the model used for vision analysis. Gemini Flash is the usual starting point on the free tier.</li>
<li>Run a single test image before committing to a large batch.</li>
</ol>

<h2>Guide 3: Configure metadata rules before you generate</h2>
<ol>
<li>Set your title length. Adobe Stock caps titles at 200 characters, with roughly 100 to 190 characters being the practical range for relevance.</li>
<li>Choose your keyword count. Tagyfy Pro supports 5 to 50 keywords per asset; Adobe Stock accepts up to 49, and other marketplaces differ.</li>
<li>Pick a keyword strategy: single-word, multi-word, or mixed.</li>
<li>Add prohibited terms under Negative Keywords so they are stripped from every generated output.</li>
<li>For a themed collection, turn on Event Context or Series Context so phrasing stays consistent and series assets receive ordered titles.</li>
</ol>

<h2>Guide 4: Generate, review, embed and upload</h2>
<ol>
<li>Drag files or folders onto the dashboard. JPG, PNG, WebP, TIFF, SVG, EPS, AI, MP4, MOV and WebM are handled. For vector work, upload the EPS or AI file together with its same-named JPG preview.</li>
<li>Start the batch. Enable Batch Mode to process several files in parallel, with live progress and automatic retry on failure.</li>
<li>Review before exporting. Every asset gets a confidence score and risk flags covering subject clarity, keyword precision, differentiator strength and compliance safety.</li>
<li>Embed or export. Write IPTC/XMP metadata into the files, or export a CSV formatted for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF or Vecteezy.</li>
<li>Upload to the marketplace and spot-check one file in the contributor dashboard to confirm the title and keywords arrived as expected.</li>
</ol>

<h2>Common questions</h2>
<h3>Do I have to read every guide?</h3>
<p>No. Guide 1 is needed once at install time and Guide 2 once per provider key. Guides 3 and 4 cover the settings and batch workflow you will run repeatedly.</p>
<h3>Can I use this on Mac or Linux?</h3>
<p>The desktop application currently ships for Windows 10 and 11 (64-bit) only. On Mac or Linux you can still use the browser tool, which generates metadata but cannot write it into vector or video files.</p>
<h3>Where do I get help if I get stuck?</h3>
<p>Send us the details through the Contact page, including your app version, the file type involved, the provider you selected, and the exact error text.</p>
`;

// The index is an actual hub: it previously carried an intro and an empty
// "Latest Articles" heading, so a crawler that does not run JavaScript saw a page
// with no articles on it and no route to any of them. It is now generated from
// BLOG_POSTS, so a new post appears here the moment it is added to the data file.
const CONTENT_BLOGS = `
<h1>Blog — Stock Contributor Knowledge Base</h1>
<p>Practical guides for stock media contributors: how marketplaces review titles and keywords, how to document a submission properly, and how to avoid the common rejection causes. Every article is written by a working contributor and reviewed before publication — see our <a href="/editorial-policy">editorial standards</a> for how that works.</p>

<h2>All articles (${BLOG_POSTS.length})</h2>
${BLOG_POSTS.map((post) => `
<article>
<h3><a href="/blog/${post.slug}">${post.title}</a></h3>
<p><strong>${post.category}</strong> · ${post.publishDate} · ${post.readTime}</p>
<p>${post.summary}</p>
<p>Topics: ${post.tags.join(', ')}.</p>
</article>
`).join('\n')}

<h2>Where to start</h2>
<ul>
<li>New to stock metadata? Read <a href="/blog/mastering-stock-metadata-title-seo-keyword-guide">the title and keyword guide</a>, then try the <a href="/tool">free browser tool</a> on a single image.</li>
<li>Working at volume? See <a href="/blog/free-adobe-stock-metadata-generator">how uploaders approach batches</a> and check the <a href="/metadata-limits">per-marketplace limits</a> before exporting.</li>
<li>Been rejected? <a href="/blog/common-mistakes-account-suspension-adobe-stock">This one</a> covers the mistakes that escalate beyond a single rejection.</li>
</ul>
`;

const CONTENT_CHROME_EXTENSION = `
<h1>Free Adobe Stock Chrome Extension — Tagyfy Pro</h1>
<p>100% free Chrome extension for Adobe Stock contributors. Update approved assets and generate fresh metadata directly inside the contributor dashboard using Gemini, ChatGPT, Groq, and Mistral. No license key required.</p>

<h2>Key Features</h2>
<h3>Revive Approved Assets</h3>
<p>Review and update titles and keywords on existing approved photos without repeating the same manual form entry.</p>
<h3>Auto-Tag New Uploads</h3>
<p>Generate descriptive titles and up to 50 relevant keywords for newly uploaded batches.</p>
<h3>Multi-AI Vision Support</h3>
<p>Use your choice of Gemini, ChatGPT (OpenAI), Groq, or Mistral AI with automatic key rotation.</p>
<h3>Direct Dashboard Integration</h3>
<p>Opens as a sleek Chrome side-panel that interacts directly with your Adobe Stock contributor workflow.</p>

<h2>How It Works — Three Workflow Modes</h2>
<h3>1. Upload Mode (Review Queue)</h3>
<p>Open your Adobe Stock upload queue, set your desired title length (180-190 chars) and keyword count, then click Start Processing. The extension generates and fills metadata automatically.</p>
<h3>2. Portfolio Mode (Approved Files)</h3>
<p>Navigate to your portfolio page, select a range of old assets, and let the AI rewrite outdated titles and keywords with modern search-intent terms.</p>
<h3>3. Smart Key Rotation</h3>
<p>Add multiple free Gemini or Groq API keys. The extension automatically balances requests and rotates keys if rate limits are reached.</p>

<h2>Installation Guide</h2>
<ol>
<li>Download Extension Archive: Scroll to the download section and grab the latest Tagyfy Pro Chrome Extension ZIP file.</li>
<li>Extract the ZIP File: Right-click the downloaded zip file and extract it to a permanent folder on your computer.</li>
<li>Enable Developer Mode: Open Google Chrome, navigate to chrome://extensions/ and toggle Developer mode in the top-right corner.</li>
<li>Load Unpacked: Click Load unpacked at top left, select your extracted folder, and pin Tagyfy Pro to your Chrome extensions toolbar.</li>
</ol>

<h2>Frequently Asked Questions</h2>
<h3>Is this Chrome Extension really 100% free?</h3>
<p>Yes! The Tagyfy Pro Chrome Extension is completely 100% free for all stock contributors. There are no subscriptions, paywalls, or activation license keys required.</p>
<h3>How do I get an AI API key?</h3>
<p>You can get a free Google Gemini API key in 30 seconds from Google AI Studio (aistudio.google.com/apikey). OpenAI, Groq, and Mistral keys are also supported.</p>
<h3>Will this get my Adobe Stock account in trouble?</h3>
<p>The extension fills standard form fields such as Title and Keywords. You remain responsible for checking accuracy and following Adobe Stock's current contributor guidelines before saving changes.</p>
<h3>What is the difference between this extension and the Desktop Software?</h3>
<p>The Chrome Extension works inside your browser to auto-fill metadata on Adobe Stock. The Tagyfy Pro Desktop App is a dedicated native workstation software that embeds metadata directly into EPS, AI, JPG, PNG, and Video files with zero platform limits.</p>
`;

const CONTENT_TOOL = `
<h1>Free Online Metadata Generator Tool — Tagyfy Pro</h1>
<p>Generate draft titles, descriptions, and keywords for supported stock images and videos directly in your browser. No Tagyfy account is required, but you bring your own AI provider key and should review every result before submission.</p>

<h2>How to Use the Free Online Tool</h2>
<ol>
<li>Upload your image or video file directly in your browser</li>
<li>Enter your free AI API key (Gemini, OpenAI, Groq, or Mistral)</li>
<li>Click Generate to analyze your file with AI vision</li>
<li>Get SEO-optimized title, description, and up to 50 ranked keywords</li>
<li>Copy the metadata or export as CSV for your stock platform</li>
</ol>

<h2>Supported Formats</h2>
<p>The online tool accepts JPG, JPEG, PNG, WebP, SVG, EPS, AI, MP4 and MOV files. JPG, PNG and WebP are analysed directly. SVG, EPS and AI files are read through their preview, so upload the vector alongside its same-named JPG preview and the model will describe the artwork.</p>

<h2>Limitations worth knowing first</h2>
<ul>
<li>A browser cannot write metadata into the internal structure of EPS, AI, SVG, MP4 or MOV files. The browser tool produces the text and exports it as CSV; in-file embedding for those formats is a desktop-app feature.</li>
<li>You bring your own AI provider key, so that provider's rate limits and accuracy apply. There is no Tagyfy-hosted model and no per-generation fee.</li>
<li>To describe an image, the tool sends that image to the model provider you selected, under that provider's terms. Tagyfy runs no media proxy and keeps no copy. Use the desktop app when files must stay on your machine.</li>
<li>Better metadata makes an asset easier to understand; it does not guarantee marketplace approval, search position or sales.</li>
</ul>

<h2>Features of the Free Web Tool</h2>
<ul>
<li>AI-powered image and video analysis</li>
<li>SEO-optimized title generation</li>
<li>Up to 50 ranked keywords per asset</li>
<li>Rich description generation</li>
<li>Confidence scoring and risk analysis</li>
<li>Platform readiness checks for Adobe Stock, Shutterstock, and Freepik</li>
<li>No signup or account required</li>
<li>100% free to use</li>
</ul>

<h2>Why Use This Tool?</h2>
<p>Stock media contributors often spend significant time preparing titles and keywords. This tool uses AI vision to create a draft from your selected file in the browser. The file is sent directly to the AI provider you choose for analysis; Tagyfy does not proxy or store it. AI output is not a guarantee of approval, ranking, or sales, so review it against the current marketplace rules.</p>

<h2>Need More Power?</h2>
<p>For batch processing of 500+ files, direct IPTC/XMP embedding into files, vector format support, trademark sniffer, and platform-specific CSV exports, download the Tagyfy Pro Desktop Application for Windows with a free 3-day trial.</p>
`;

const CONTENT_PRIVACY = `
<h1>Privacy Policy — Tagyfy Pro</h1>
<p>Last Updated: October 4, 2026. Effective Date: January 1, 2026.</p>

<h2>1. Overview and Commitment to Privacy</h2>
<p>Welcome to Tagyfy Pro (formerly VisionMetadata Pro), accessible from tagyfy.com. We are deeply committed to protecting your personal privacy. This Privacy Policy outlines what information we collect, how we process it, and how we ensure your complete confidentiality when using our website and desktop software.</p>

<h2>2. How Media and API Keys Are Handled</h2>
<p>Tagyfy has two processing modes, and the data flow is different for each. We do not operate a server that proxies or stores your media, but the AI provider you choose still receives the file data needed to analyze it.</p>
<ul>
<li><strong>Windows desktop app:</strong> Files are read and embedded locally on your computer. When you request AI analysis, the selected file or extracted video frames are sent directly from the app to the AI provider associated with your API key. Tagyfy does not receive or store that media.</li>
<li><strong>Browser tool:</strong> The selected file is read in your browser and sent directly to the AI provider you choose for the generation request. Do not upload confidential media unless you are comfortable with that provider's terms and privacy policy.</li>
<li><strong>API keys:</strong> The Windows app keeps keys in local encrypted storage. The browser tool keeps a key in browser memory and only uses local storage when you explicitly select “Remember in browser local storage.” Tagyfy does not collect or store keys on its own server.</li>
</ul>

<h2>3. Cookies, Web Beacons and Analytics</h2>
<p>tagyfy.com sets no analytics or advertising cookies unless you allow them. On your first visit a banner asks whether you accept them, both choices are one click, and nothing is recorded either way until you decide. If you accept, Google Analytics (GA4) collects anonymised website performance statistics such as page views, visit durations and browser types; it does not collect personally identifiable information. You can also prevent Google Analytics from tracking your visits by installing the Google Analytics Opt-out Browser Add-on.</p>
<p>You can change your decision at any time using the Cookie settings control in the footer of any page. Declining, or withdrawing an earlier acceptance, switches both Google Analytics and advertising storage off again. The site stores only your choice, in your own browser, and declining restricts nothing on the site itself.</p>

<h2>4. Google AdSense and Third-Party Advertising</h2>
<p>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites on the Internet. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting aboutads.info.</p>

<h2>5. Information You Voluntarily Provide</h2>
<p>When you contact us via our contact form, email, or WhatsApp for technical support or license purchases, we may receive your name, email address, and message contents. We only use this information to respond to your inquiries, deliver license keys, and provide customer support. We never sell, rent, or trade your contact information.</p>

<h2>6. Data Protection Rights (GDPR and CCPA)</h2>
<p>Under applicable data protection laws, you have the right to request access to your data, request data erasure, and object to processing. Because our software does not store user media on central servers, most data is already under your exclusive physical control on your computer.</p>

<h2>7. Contact Our Privacy Team</h2>
<p>If you have questions regarding this Privacy Policy or wish to exercise any data rights, please contact us: Email: ${SELLER.supportEmail}. WhatsApp: ${SELLER.whatsappDisplay}. Website: tagyfy.com.</p>
`;

const CONTENT_TERMS = `
<h1>Terms of Service — Tagyfy Pro</h1>
<p>Last Updated: August 17, 2026. Effective Date: January 1, 2026.</p>

<h2>1. Acceptance of Terms</h2>
<p>By downloading, installing, accessing, or using Tagyfy Pro or visiting tagyfy.com, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our software or website.</p>

<h2>2. Software License and Free Trial</h2>
<p>We grant you a revocable, non-exclusive, non-transferable, limited license to download, install, and run Tagyfy Pro on your personal computer strictly in accordance with the purchased license tier (1 Month, 3 Months, 6 Months, or 1 Year).</p>
<ul>
<li><strong>Free Trial:</strong> New users are eligible for a 3-day full-access trial period without credit card requirement.</li>
<li><strong>License Activation:</strong> Paid licenses are tied to your hardware machine ID. Transferring a license to a new machine can be requested through our customer support.</li>
<li><strong>No Reverse Engineering:</strong> You agree not to decompile, reverse engineer, disassemble, or tamper with the software protection mechanisms.</li>
</ul>

<h2>3. AI API Usage and Third-Party Services</h2>
<p>Tagyfy Pro provides direct client-side integration with third-party Artificial Intelligence providers (including Google Gemini, OpenAI, Groq, Mistral, and OpenRouter). You are responsible for providing valid API keys and complying with the respective terms of service of each AI provider.</p>

<h2>4. User Content and Intellectual Property</h2>
<p>You retain 100% full intellectual property ownership of all images, vector files, videos, and generated metadata processed with our application. We claim zero rights or ownership over your creative works.</p>

<h2>5. Disclaimer of Warranties and Limitation of Liability</h2>
<p>Tagyfy Pro and all website materials are provided on an "as is" and "as available" basis without warranties of any kind. While we rigorously test our metadata embedding pipelines against official Adobe Stock, Shutterstock, and Freepik specifications, we do not guarantee specific review approvals or sales earnings on third-party stock agency marketplaces.</p>

<h2>6. Contact Information</h2>
<p>For legal questions, licensing inquiries, or enterprise permissions, contact us: email ${SELLER.supportEmail}, or WhatsApp ${SELLER.whatsappDisplay}.</p>
`;

const CONTENT_REFUND = `
<h1>Refund and Cancellation Policy — Tagyfy Pro</h1>
<p>Last Updated: August 17, 2026. Effective Date: January 1, 2026.</p>

<h2>1. 3-Day Free Trial (Try Before You Buy)</h2>
<p>We want you to be 100% satisfied with Tagyfy Pro before spending any money. That is why we provide an unrestricted 3-Day Full-Access Free Trial for all new users. During your trial, you can test every feature — including AI keywording, video tagging, and direct IPTC/XMP file embedding — with no credit card required.</p>

<h2>2. Digital License Key Refund Terms</h2>
<p>Because Tagyfy Pro is a downloadable digital software with license keys activated immediately upon delivery:</p>
<ul>
<li><strong>Technical Incompatibility:</strong> If the software experiences a technical issue on your machine that our engineering support team is unable to resolve within 7 days of purchase, you are eligible for a 100% full refund.</li>
<li><strong>Accidental Duplicate Purchases:</strong> If you accidentally placed duplicate orders for the same duration, we will immediately refund the duplicate payment.</li>
</ul>

<h2>3. Non-Refundable Conditions</h2>
<p>Refunds cannot be issued under the following circumstances:</p>
<ul>
<li>Changing your mind after actively using the license key beyond the 7-day post-purchase window.</li>
<li>Exhaustion or rate-limiting of third-party AI provider quotas (e.g. Gemini, OpenAI) as AI API costs are managed directly between you and your chosen AI provider.</li>
<li>Rejections on stock marketplaces resulting from unrelated stock agency policy guidelines (e.g., photo quality, intellectual property rights, non-metadata review reasons).</li>
</ul>

<h2>4. How to Request a Refund or Support</h2>
<p>To request assistance or submit a refund request, please contact our support desk with your license key or order transaction ID:</p>
<ul>
<li>WhatsApp Support (Fastest): +92 325 9640429</li>
<li>Email support: ${SELLER.supportEmail}</li>
<li>Response Time: Typically within 2 to 6 hours.</li>
</ul>
`;


// ─── Page definitions ──────────────────────────────────────────────────────


const CONTENT_EDITORIAL = `
<h1>Editorial Standards and Corrections — Tagyfy Pro</h1>
<p>A statement of what you can expect from the guides, documentation and product copy published at tagyfy.com. Last reviewed: October 2026.</p>

<h2>Written by a practitioner, not a content farm</h2>
<p>The guides on this site are written by Salman Ahmad, a stock contributor and logo designer who works with these marketplaces directly. Content is produced in small batches around real workflow problems, not mass-generated to fill keyword gaps.</p>

<h2>Claims are limited to what can be supported</h2>
<p>Where a marketplace publishes a rule — a title length limit, a keyword cap, a category requirement — we state it and link to the source. Where the basis is our own experience, we say so. We do not promise approval, search position or income, because no tool controls those outcomes.</p>

<h2>No invented screenshots, stats or reviews</h2>
<p>We do not publish fabricated testimonials, invented download counts, or screenshots of results we did not obtain. Product capability claims describe features that exist in the released build; if a feature is removed, the claim is removed with it.</p>

<h2>Content is revisited, not abandoned</h2>
<p>Marketplace rules change. When a rule we have written about changes, the affected article is revised and its revision date updated. Guides that describe an older build of the software are updated alongside the release, or clearly marked as applying to an older version.</p>

<h2>How AI is used, and how it is not</h2>
<p>Drafting, spelling and structural editing may involve AI tools. The subject matter, the examples and the judgements in each guide come from the author's own work with these marketplaces, and every published piece is read and edited by a person before it goes live. We do not generate articles in bulk to capture search terms. If a claim about a marketplace rule cannot be checked against that marketplace's own documentation, it is written as a personal observation or it is left out.</p>
<p>Many marketplaces require generative-AI content to be declared on submission. The software can add the relevant disclosure keywords to a batch, but the decision about what to declare is the contributor's, and our guides say so explicitly.</p>

<h2>Corrections</h2>
<p>If something on this site is wrong, out of date, or stated with more confidence than the evidence supports, tell us through the Contact page and include the page address. Factual errors in guides and documentation are corrected, and the page's revision date is updated at the same time. If a product claim turns out to be unsupportable, the claim is removed rather than softened. We do not run comments or guest posts, so there is no user-generated content on this site to moderate.</p>
`;


// ─── Structured data ──────────────────────────────────────────────────────────
// Emitted into the static HTML as well as from React, because a crawler that
// does not execute JavaScript would otherwise see no structured data at all.
// Only checkable facts are asserted: no aggregateRating and no review markup,
// since the site collects neither.

const SITE_URL = 'https://tagyfy.com';

const ORGANISATION_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tagyfy Pro',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.jpg`,
    description:
      'AI-assisted metadata generation and embedding software for stock media contributors.',
    email: SELLER.supportEmail,
    founder: {
      '@type': 'Person',
      name: 'Salman Ahmad',
      jobTitle: 'Stock contributor and software developer',
    },
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Tagyfy Pro', url: SITE_URL },
];

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tagyfy Pro',
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'Stock media metadata tool',
  operatingSystem: 'Windows 10, Windows 11 (64-bit)',
  softwareVersion: '1.3.6',
  fileSize: '160MB',
  url: SITE_URL,
  description:
    'Desktop application that generates titles, descriptions and keywords for stock media using AI vision models, and writes IPTC/XMP metadata directly into image, vector and video files.',
  offers: [
    { '@type': 'Offer', name: 'Starter — 1 month', price: '1.75', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Creator — 3 months', price: '4.73', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro — 6 months', price: '8.93', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Studio — 12 months', price: '16.82', priceCurrency: 'USD' },
  ],
};

const WEBAPP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tagyfy Pro free online metadata generator',
  url: `${SITE_URL}/tool`,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any modern browser',
  description:
    'Browser-based stock metadata generator. Produces draft titles, descriptions and keywords for images, vectors and video using your own AI provider key, with no account and nothing to install.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

const articleSchema = (post: (typeof BLOG_POSTS)[number]) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.subtitle || post.summary,
  url: `${SITE_URL}/blog/${post.slug}`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  articleSection: post.category,
  keywords: post.tags.join(', '),
  datePublished: post.publishDate,
  author: { '@type': 'Person', name: post.author.name, jobTitle: post.author.role },
  publisher: { '@type': 'Organization', name: 'Tagyfy Pro', url: SITE_URL },
});

const breadcrumb = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

/** Serialises schemas into script tags. `<` is escaped so a stray character in
 *  content can never terminate the script block early. */
const renderJsonLd = (schemas: unknown[]) => {
  const flat = schemas.flat().filter(Boolean);
  if (!flat.length) return '';
  const payload = JSON.stringify(flat.length === 1 ? flat[0] : flat).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${payload}</script>`;
};

// /metadata-limits — generated from src/data/platformLimits.ts so the crawlable
// HTML and the React page cannot drift apart. This page answers the specific,
// frequently-searched question contributors have, so the prerendered version
// carries the full table rather than a summary.
const CONTENT_METADATA_LIMITS = `
<h1>Stock Metadata Limits by Marketplace — Titles, Keywords and CSV Columns</h1>
<p>Title lengths, keyword counts, CSV column names and the errors that actually stop an upload, for every marketplace Tagyfy Pro supports. Figures were compiled from each platform's own documentation and last checked in ${LIMITS_LAST_CHECKED}. Marketplaces change their specifications without notice — when an upload is rejected, the platform's current specification governs, not this page.</p>

${PLATFORMS.map((p) => `
<h2>${p.name}</h2>
<ul>
<li><strong>Title limit:</strong> ${p.titleLimit}. ${p.titleNotes}</li>
<li><strong>Keywords:</strong> ${p.keywordLimit}. ${p.keywordNotes}</li>
<li><strong>CSV columns:</strong> <code>${p.csvFormat}</code></li>
</ul>
<ul>
${p.quirks.map((q) => `<li>${q}</li>`).join('\n')}
</ul>
<p>Source: <a href="${p.source.url}" rel="noopener">${p.source.label}</a></p>
`).join('\n')}

<h2>When an upload fails, it is usually one of these five things</h2>
<ol>
${FAILURES.map((f) => `<li><strong>${f.symptom}</strong> — Cause: ${f.cause} Fix: ${f.fix}</li>`).join('\n')}
</ol>

<h2>Related reading</h2>
<ul>
<li><a href="/blogs">Contributor guides</a> — how each marketplace weighs titles and keywords, and the rejection causes worth designing around.</li>
<li><a href="/tool">Free browser tool</a> — generate a title and keyword set for one image, then export it in the right format for the platform above.</li>
<li><a href="/faq">FAQ</a> — why embedded metadata is sometimes ignored, and what the trademark check does and does not cover.</li>
<li><a href="/editorial-policy">Editorial standards</a> — how these figures were checked, and how to report one that is out of date.</li>
</ul>
`;

const PAGES: { path: string; title: string; desc: string; content?: string; schema?: unknown[] }[] = [
  { path: '/', title: 'Tagyfy Pro | AI-Powered Metadata Generator for Adobe Stock', desc: 'Generate, optimize, and embed titles, descriptions, and keywords into your stock images, vectors, and videos in bulk using AI. Free online tool and Windows desktop app.', content: CONTENT_HOME, schema: [ORGANISATION_SCHEMA, SOFTWARE_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }])] },
  { path: '/about', title: 'About Us — Our Mission & Story | Tagyfy Pro', desc: 'Learn about Tagyfy Pro, the AI-powered metadata generator built to help stock media contributors automate titles, keywords, and IPTC embedding for Adobe Stock, Shutterstock, and Freepik.', content: CONTENT_ABOUT },
  { path: '/features', title: 'Features — Batch Processing, Trademark Filter & More | Tagyfy Pro', desc: 'Explore Tagyfy Pro features: multi-AI vision analysis, batch metadata generation, direct IPTC/XMP embedding, trademark sniffer, confidence scoring, and platform-specific CSV exports.', content: CONTENT_FEATURES },
  { path: '/pricing', title: 'Pricing & License Plans | Tagyfy Pro', desc: 'Transparent pricing for Tagyfy Pro with time-based license options. No hidden fees, a free 3-day trial, and a free Chrome extension for Adobe Stock workflows.', content: CONTENT_PRICING, schema: [SOFTWARE_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }])] },
  { path: '/download', title: 'Download Tagyfy Pro for Windows | Free Trial', desc: 'Download the Tagyfy Pro desktop application for Windows 10 and 11. Full-access 3-day free trial with AI-powered metadata generation and direct file embedding.', content: CONTENT_DOWNLOAD },
  { path: '/contact', title: 'Contact & Support | Tagyfy Pro', desc: 'Get help with Tagyfy Pro license keys, bulk processing, or technical support. Reach our team directly for fast assistance with your stock metadata workflow.', content: CONTENT_CONTACT },
  { path: '/faq', title: 'Frequently Asked Questions | Tagyfy Pro', desc: 'Answers to common questions about Tagyfy Pro: supported AI providers, file formats, trademark detection, batch processing, CSV exports, API key safety, and licensing.', content: CONTENT_FAQ, schema: [FAQ_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }])] },
  { path: '/tutorials', title: 'Tutorials & Video Guides | Tagyfy Pro', desc: 'Step-by-step video tutorials showing how to generate and review metadata drafts, embed IPTC data into files, and use the Tagyfy Pro desktop app and Chrome extension.', content: CONTENT_TUTORIALS },
  { path: '/blogs', title: 'Blog — Stock Contributor Knowledge Base | Tagyfy Pro', desc: 'Practical guides for stock media contributors: how marketplaces review titles and keywords, how to document a submission properly, and how to avoid the common rejection causes.', content: CONTENT_BLOGS },
  { path: '/chrome-extension', title: 'Free Adobe Stock Chrome Extension | Tagyfy Pro', desc: '100% free Chrome extension for Adobe Stock contributors. Update approved assets and generate fresh metadata directly inside the contributor dashboard using Gemini, ChatGPT, Groq, and Mistral.', content: CONTENT_CHROME_EXTENSION, schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Chrome extension', path: '/chrome-extension' }])] },
  { path: '/tool', title: 'Free Online Metadata Generator Tool | Tagyfy Pro', desc: 'Generate draft titles, descriptions, and keywords for supported stock images and videos in your browser. Bring your own AI provider key and review every result before submission.', content: CONTENT_TOOL, schema: [WEBAPP_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Free tool', path: '/tool' }])] },
  { path: '/metadata-limits', title: 'Stock Metadata Limits by Marketplace - Titles, Keywords & CSV Columns | Tagyfy Pro', desc: 'Title length limits, keyword counts, CSV column names and the errors that stop an upload for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime and 123RF - each with its official source linked.', content: CONTENT_METADATA_LIMITS, schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Metadata limits', path: '/metadata-limits' }])] },
  { path: '/privacy-policy', title: 'Privacy Policy | Tagyfy Pro', desc: 'Tagyfy Pro privacy policy. Learn how the Windows app and browser tool handle your media files, API keys, analytics, and third-party AI providers.', content: CONTENT_PRIVACY },
  { path: '/terms', title: 'Terms of Service | Tagyfy Pro', desc: 'Terms and conditions for using Tagyfy Pro desktop application, web tool, and Chrome extension. Read our service agreement, license terms, and usage policies.', content: CONTENT_TERMS },
  { path: '/refund-policy', title: 'Refund Policy | Tagyfy Pro', desc: 'Tagyfy Pro refund policy. Understand our refund process, eligibility criteria, and how to request a refund for your license purchase.', content: CONTENT_REFUND },
  { path: '/editorial-policy', title: 'Editorial Standards & Corrections | Tagyfy Pro', desc: 'How the guides and documentation on tagyfy.com are researched, written, reviewed and corrected — including our policy on accuracy, sources, product claims and AI assistance.', content: CONTENT_EDITORIAL, schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Editorial standards', path: '/editorial-policy' }])] }
];

// ─── /blogs listing page ───────────────────────────────────────────────────
// The listing is built inside CONTENT_BLOGS from BLOG_POSTS. It used to be
// appended here instead, after the intro, which produced an index whose first
// screen was an empty "Latest Articles" heading — a crawler reached /blogs and
// found no route to any article.
const blogsPage = PAGES.find(p => p.path === '/blogs');
if (blogsPage) {
  blogsPage.content = CONTENT_BLOGS;
  blogsPage.schema = [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/blogs' }])];
}

// ─── Add individual blog posts dynamically ─────────────────────────────────
BLOG_POSTS.forEach(post => {
  let contentHtml = `<h1>${post.title}</h1><h2>${post.subtitle}</h2><p>${post.summary}</p>`;
  contentHtml += `<p>${post.content.intro}</p>`;
  post.content.sections.forEach(sec => {
    contentHtml += `<h3>${sec.heading}</h3>`;
    sec.body.forEach(p => { contentHtml += `<p>${p}</p>`; });
  });
  if (post.content.conclusion) {
    contentHtml += `<p>${post.content.conclusion}</p>`;
  }

  PAGES.push({
    path: `/blog/${post.slug}`,
    title: `${post.title} | Tagyfy Pro Blog`,
    desc: post.summary,
    content: contentHtml,
    schema: [
      articleSchema(post),
      breadcrumb([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/blogs' },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ]
  });
});


// ─── Prerender engine ──────────────────────────────────────────────────────

async function prerender() {
  const indexTemplatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexTemplatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const template = fs.readFileSync(indexTemplatePath, 'utf-8');

  PAGES.forEach(page => {
    // Replace Title
    let html = template.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);

    // Replace Description
    html = html.replace(
      /<meta name="description" content=".*?"\s*\/>/,
      `<meta name="description" content="${page.desc.replace(/"/g, '&quot;')}" />`
    );

    // Inject structured data before </head>
    if (page.schema?.length) {
      html = html.replace('</head>', `${renderJsonLd(page.schema)}</head>`);
    }

    // Inject Content into root for AdSense / Googlebot crawler to read text
    const injection = page.content ? page.content : `<h1>${page.title}</h1><p>${page.desc}</p>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${injection}</div>`);

    // Write File
    const outPath = page.path === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, ...page.path.split('/'), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`✅ Prerendered: ${page.path}`);
  });

  console.log(`\n🎉 Prerendering complete! ${PAGES.length} pages rendered with rich content.`);
}

prerender();
