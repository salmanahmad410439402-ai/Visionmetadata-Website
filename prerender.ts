import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from './src/data/blogPosts.js';
import { FAQS } from './src/data/faqs.js';
import { PLATFORMS, FAILURES, LIMITS_LAST_CHECKED } from './src/data/platformLimits.js';
import { STOCK_CALENDAR_EVENTS, MONTH_NAMES } from './src/data/stockEvents.js';
import { CONTRIBUTOR_TOOLS } from './src/data/contributorTools.js';
import { SELLER, PAYMENT_RAILS, ORDER_STEPS, FRAUD_NOTICE, CARD_CHECKOUT } from './src/config/commerce.js';
import { inlineToHtml, escapeHtml } from './src/lib/inlineMarkdown.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

const SITE_URL = 'https://tagyfy.com';
const ADSENSE_SCRIPT_TAG =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3078074422458018" crossorigin="anonymous"></script>';

// ─── Generated from src/config/commerce.ts ─────────────────────────────────
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

<h2>Product Facts</h2>
<ul>
<li>Up to 50 configurable keywords per asset</li>
<li>500+ file desktop batch queue target</li>
<li>Four clear steps: upload, generate, review, and export</li>
<li>Four AI provider options (Google Gemini, OpenAI, Groq, Mistral AI) with bring-your-own-key access</li>
<li>Local-first desktop file handling, with direct AI-provider requests when analysis is requested</li>
</ul>

<h2>4 Free Stock Browser Tools — Which One Do You Need?</h2>
<p>Every browser utility runs free with no account required — use a single tool or follow the complete 4-step stock contributor workflow:</p>
<ul>
${CONTRIBUTOR_TOOLS.map(
  (t) =>
    `<li><strong><a href="${escapeHtml(t.to)}">${escapeHtml(t.name)}</a> (${escapeHtml(t.stepLabel)}):</strong> ${escapeHtml(t.whatItDoes)} <em>Best used when: ${escapeHtml(t.useWhen)}</em></li>`
).join('\n')}
</ul>

<h2>Direct Vector &amp; Video Metadata Embedding</h2>
<p>Tagyfy Pro writes IPTC, XMP, and Dublin Core metadata directly into compatible JPG, PNG, WebP, TIFF, AI, EPS, SVG, MP4, MOV, and WebM files, or exports formatted CSV spreadsheets for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, and Vecteezy.</p>

<h2>How It Works — From File to Upload-Ready in Four Steps</h2>
<h3>Step 1: Upload Your Assets</h3>
<p>Drag and drop images, videos, vectors, or entire folders. Supports JPG, JPEG, PNG, WebP, TIFF, EPS, AI, SVG, MP4, MOV, and WebM.</p>
<h3>Step 2: AI Analyzes and Generates</h3>
<p>Vision AI analyzes every file and generates descriptive titles, rich descriptions, and up to 50 ranked keywords tailored to each marketplace.</p>
<h3>Step 3: Review, Refine and Check Quality</h3>
<p>Edit metadata inline, use the bulk editor for batch changes, and inspect confidence scores and trademark risk flags per asset before upload.</p>
<h3>Step 4: Embed and Export Ready</h3>
<p>Write IPTC/XMP metadata into supported files or export platform-ready CSVs for Adobe Stock, Freepik, Shutterstock, Dreamstime, 123RF, and Vecteezy.</p>

<h2>A Quick Look at What's Inside</h2>
<p>A small sample of the 16 production features — see the full catalogue and supported file formats on the <a href="/features">Features page</a>.</p>
<ul>
<li><strong>Multi-Provider AI Engine:</strong> Run Google Gemini, OpenAI GPT-4o, Groq, and Mistral AI side by side with automatic key rotation.</li>
<li><strong>Trademark and Brand Sniffer:</strong> Flags 90+ common brand names and product patterns before upload to reduce avoidable IP rejections.</li>
<li><strong>Confidence and Risk Scoring:</strong> Every asset gets a 0-100 readiness score across four compliance dimensions before you submit it.</li>
<li><strong>6-Platform CSV Export:</strong> One click produces formatted CSVs for Adobe Stock, Shutterstock, Freepik, and more.</li>
</ul>

<h2>Designed for a Review-First Workflow</h2>
<p>Tagyfy generates a starting point; contributors remain responsible for checking accuracy, removing irrelevant terms, confirming trademarks and releases, and following each marketplace's current submission rules.</p>

<h2>A Few Quick Questions</h2>
<p>Everything you need before you start — what to prepare, what runs where, and how the trial ends. Read the complete list on the <a href="/faq">FAQ page</a>.</p>
<h3>What do I need before I can generate metadata?</h3>
<p>Two things: the media files you want to describe, and an API key from one AI provider. Google AI Studio issues a free Gemini key, and Groq also has a free tier, so a paid account is not required to start. You can also test our <a href="/metadata-checker">Free Metadata &amp; Compliance Checker</a> or the 1-click Sample Demo in the <a href="/tool">online tool</a> with no API key.</p>
<h3>Which parts work in the browser and which need the desktop app?</h3>
<p>The browser tool handles images and CSV exports: upload a JPG, PNG, WebP, vector preview, or video clip, get a draft title, description and keyword set back, then copy or export it. Writing metadata natively into vector files such as EPS and AI, or into video containers such as MP4 and MOV, requires the Windows desktop app.</p>
<h3>What happens at the end of the 3-day trial?</h3>
<p>Nothing charges automatically. You evaluate the app for 3 days with every feature enabled and no card on file, and if it earns a place in your workflow you buy a licence key for 1, 3, 6 or 12 months. Nothing renews by itself.</p>
<h3>Can I see real output before I trust it with a batch?</h3>
<p>Yes. Load the instant Sample Demo or generate metadata for one image in the <a href="/tool">browser tool</a>, and read the result critically before extending to a full batch.</p>

<h2>Adobe Stock Chrome Extension — 100% Free</h2>
<p>Update approved assets and generate fresh metadata drafts inside the Adobe Stock contributor dashboard using Gemini, OpenAI, Groq, and Mistral. Learn more on the <a href="/chrome-extension">Chrome Extension page</a>.</p>

<h2>Ready to automate your stock metadata?</h2>
<p>Try the <a href="/tool">Free Online Web Tool</a>, validate existing drafts in the <a href="/metadata-checker">Metadata Checker</a>, read our <a href="/blogs">Contributor Knowledge Base</a>, or review installer details on the <a href="/download">Windows Download page</a>.</p>
`;

const CONTENT_ABOUT = `
<h1>Built by a Working Stock Contributor — About Salman Ahmad &amp; Tagyfy Pro</h1>
<p>Tagyfy Pro is an independent software project and contributor knowledge base written and maintained by <strong>${SELLER.operator}</strong>, a stock media contributor and logo designer based in Pakistan.</p>

<h2>Who Builds and Supports Tagyfy Pro</h2>
<p>Tagyfy Pro started inside my own vector and stock illustration workflow after years of preparing paired .eps + .jpg files, rewriting repetitive 180-character titles, debugging rejected CSV uploads across six agency schemas, and learning firsthand how easily an unnoticed trademark term or generic keyword order can stall a batch in moderation.</p>
<p>Because this is a solo, founder-operated project, there is no outsourced sales desk: every guide in our <a href="/blogs">Contributor Knowledge Base</a> is edited from direct marketplace experience, and every support message sent to <a href="mailto:${SELLER.supportEmail}">${SELLER.supportEmail}</a> or WhatsApp (${SELLER.whatsappDisplay}) goes directly to the developer who maintains the code.</p>

<h2>Why Tagyfy Exists</h2>
<p>Browser-only keyword generators help with single JPEGs, but vector artists and video shooters still hit a wall: browsers cannot write XMP packets directly into .eps, .ai, or .mp4 files, and every marketplace expects different CSV headers, title limits, and keyword counts. Tagyfy combines free browser utilities with a native Windows workstation app for bulk local embedding.</p>

<h2>What Ships in v1.3.6 Today</h2>
<p>Tagyfy Pro is built with Rust (Tauri) and React. It connects directly to four AI providers using your own API key — Google Gemini, OpenAI (GPT-4o), Groq (Qwen Vision), and Mistral AI — and supports 10 core media formats: JPG/JPEG, PNG, WebP, TIFF, SVG, EPS, AI, MP4, MOV, and WebM, plus formatted CSV exports for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF.</p>

<h2>How We Approach Software and Documentation</h2>
<ul>
<li><strong>No Media Proxy:</strong> Tagyfy runs no server between your files and your AI provider. Desktop embedding happens on your machine, and API keys stay in local storage under your control.</li>
<li><strong>Verifiable Claims Only:</strong> No tool can guarantee marketplace approval, search rankings, or royalty income. Our <a href="/editorial-policy">editorial policy</a> separates official agency rules from personal contributor observations.</li>
<li><strong>Review-First Workflow:</strong> AI output is a first draft. Contributors remain responsible for checking subject accuracy, removing restricted trademarks, attaching releases, and declaring AI media.</li>
</ul>
`;

const CONTENT_FEATURES = `
<h1>Every Feature, In Full Detail — Tagyfy Pro</h1>
<p>This page is the complete, up-to-date reference for everything Tagyfy Pro ships with today — the core capabilities, the full 16-feature catalogue, and every supported file format.</p>

<h2>Built for Professional Metadata</h2>
<ul>
<li><strong>Multi-AI Support:</strong> Connect Google Gemini, OpenAI GPT-4o, Groq, or Mistral AI. Use multiple keys simultaneously.</li>
<li><strong>10 Core Media Formats:</strong> JPEG, PNG, WebP, TIFF images, AI, EPS, SVG vectors, and MP4, MOV, WebM video in one batch.</li>
<li><strong>SEO Confidence Scoring:</strong> Every asset gets a confidence score (0-100) with risk flags to prevent avoidable platform rejections.</li>
<li><strong>Trademark Protection:</strong> Dictionary and regex sniffer flags 90+ common brand names and replaces them with generic alternatives.</li>
<li><strong>Smart Batch Processing:</strong> Process 100+ files at once with automatic retry on failure and unattended mode support.</li>
<li><strong>Platform Export:</strong> Export formatted CSV for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, Vecteezy.</li>
</ul>

<h2>16 Features Built for Stock Contributors</h2>
<ul>
<li><strong>Multi-Provider AI:</strong> Use Google Gemini, OpenAI GPT-4o, Groq (Qwen Vision), or Mistral AI. Add multiple API keys and run providers in parallel.</li>
<li><strong>Rate Limit Protection:</strong> Automatically rotates through your API keys and providers when limits are hit.</li>
<li><strong>Smart Parallel Queueing:</strong> Intelligent API queueing ensures steady batch throughput across keys.</li>
<li><strong>Batch Processing at Scale:</strong> Process 100+ to 500+ assets in a single batch with auto-retry on failures.</li>
<li><strong>Trademark and Brand Sniffer:</strong> Flags 90+ common brand names and trademark patterns, replacing them with generic alternatives.</li>
<li><strong>Series and Event Context:</strong> Mark assets as a series to auto-append Part 01/02/03 sequences.</li>
<li><strong>Confidence and Risk Scores:</strong> Every asset gets a 0-100 confidence score with a 4-axis breakdown.</li>
<li><strong>Platform Readiness Checks:</strong> READY / REVIEW / NOT READY rating for Adobe Stock, Freepik, and Shutterstock.</li>
<li><strong>Bulk Metadata Editor:</strong> Spreadsheet-style view to find and replace, append/prepend text, or remove words across assets.</li>
<li><strong>Negative Keywords:</strong> Define prohibited words that are automatically stripped from every output.</li>
<li><strong>Keyword Strategy Control:</strong> Choose Single-Word, Multi-Word, or Mixed keyword strategies and customize keyword count (5-50).</li>
<li><strong>Native File Metadata:</strong> Writes IPTC/XMP fields into supported JPEG, PNG, WebP, TIFF, MP4 and vector files.</li>
<li><strong>6-Platform CSV Export:</strong> Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, Vecteezy — each formatted with that portal's expected headers.</li>
<li><strong>AI Disclosure Helper:</strong> Optionally appends Generative AI disclosure keywords in XMP and CSV exports; you still check the AI toggle inside each marketplace portal.</li>
<li><strong>Unattended Mode:</strong> Automatically downloads a ZIP with metadata-embedded files if idle for 5 minutes after batch completion.</li>
<li><strong>Quality Check on Demand:</strong> Manual quality pass on any asset for detailed confidence breakdown and risk flags.</li>
</ul>

<h2>10 Supported Image, Vector &amp; Video Formats</h2>
<p>JPG / JPEG, PNG, WebP, TIFF, SVG, EPS, AI, MP4, MOV, and WebM.</p>
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
<li>Metadata generation using AI vision analysis, with your own provider key (Gemini, OpenAI, Groq, Mistral)</li>
<li>Batch processing of hundreds of files in one run</li>
<li>Direct embedding into JPG, PNG, WebP, TIFF, SVG, EPS, AI, MP4, MOV and WebM files</li>
</ul>

<h2>Free Chrome extension &amp; browser utilities</h2>
<p>The <a href="/chrome-extension">Tagyfy Pro Chrome extension</a> for Adobe Stock, the <a href="/tool">online metadata generator</a>, and the <a href="/metadata-checker">6-marketplace metadata checker</a> are free and need no licence key.</p>

<h2>What you are agreeing to</h2>
<ul>
<li><strong>Try it before you pay:</strong> the desktop build runs a full-access 3-day trial with no card on file.</li>
<li><strong>One-time payment:</strong> a licence covers a fixed period. Nothing renews automatically and there is no subscription to cancel.</li>
<li><strong>One licence, one device:</strong> stated up front rather than buried in the terms.</li>
<li><strong>A receipt for every order:</strong> each payment carries an order reference and a receipt available on request.</li>
<li><strong>Refunds:</strong> if a technical problem cannot be resolved within 7 days of purchase you receive a full refund. Accidental duplicate payments are refunded immediately. Full terms are on the <a href="/refund-policy">Refund Policy</a> page.</li>
</ul>

${SELLER_HTML}
${ORDER_HTML}

<h2>About these prices</h2>
<p>Prices are listed in USD and PKR as two independent prices, not a currency conversion. Current pricing applies to new orders; existing licences are unaffected by later price changes.</p>
`;

const CONTENT_DOWNLOAD = `
<h1>Download Tagyfy Pro for Windows</h1>
<p>Download the Tagyfy Pro desktop application for Windows 10 and 11. Full-access 3-day free trial with AI-assisted metadata generation and local IPTC/XMP file embedding.</p>

<h2>System Requirements</h2>
<ul>
<li>Operating System: Windows 10 or Windows 11 (64-bit)</li>
<li>RAM: 4 GB minimum, 8 GB recommended</li>
<li>Disk Space: about 500 MB after installation (installer is about 160.7 MB)</li>
<li>Internet: Required for AI API calls (Google Gemini, OpenAI, Groq, Mistral AI)</li>
</ul>

<h2>What You Get</h2>
<ul>
<li>Full-access 3-day free trial — no credit card required</li>
<li>AI-assisted metadata generation for images, vectors, and videos</li>
<li>Local IPTC/XMP metadata embedding into supported files</li>
<li>Platform-specific CSV exports for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, and Vecteezy</li>
<li>Dictionary and regex trademark sniffer for compliance safety</li>
<li>Batch processing with parallel workers and live progress</li>
</ul>

<h2>Installer Details, Verification &amp; How to Uninstall</h2>
<h3>Release &amp; Publisher Facts</h3>
<ul>
<li><strong>Publisher:</strong> ${SELLER.operator} (Tagyfy Pro independent software)</li>
<li><strong>Current build:</strong> Version 1.3.6 (Windows 10 / 11 64-bit)</li>
<li><strong>File:</strong> <code>Tagyfy_Pro_1.3.6_x64-setup.exe</code> (~160.7 MB)</li>
<li><strong>Release &amp; signature:</strong> Published on the official GitHub release v1.3.6 page alongside a <code>.sig</code> verification file.</li>
<li><strong>SmartScreen notice:</strong> This installer is not yet EV code-signed, so Windows Defender SmartScreen may display an Unknown publisher prompt. Only proceed if you downloaded directly from this page and verified the file size.</li>
<li><strong>Legal terms:</strong> Governed by our <a href="/terms">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a>.</li>
</ul>

<h3>How to Uninstall Tagyfy Pro Completely</h3>
<ol>
<li>Close Tagyfy Pro if it is open.</li>
<li>Open Windows <strong>Settings → Apps → Installed apps</strong> (or <em>Apps &amp; features</em> on Windows 10).</li>
<li>Search for <strong>Tagyfy Pro</strong>, open the menu, and click <strong>Uninstall</strong>. Follow the standard Windows uninstaller prompt.</li>
<li>Optional local settings cleanup: delete the local app folder inside <code>%LOCALAPPDATA%</code> / <code>%APPDATA%</code> if you also want stored keys and preferences removed.</li>
</ol>
<p>Tagyfy Pro installs per-user, registers no background system drivers, modifies no browser search or homepage settings, and bundles zero third-party offers.</p>
`;

const CONTENT_CONTACT = `
<h1>Contact and support — Tagyfy Pro</h1>
<p>Questions about Tagyfy Pro, an existing licence, a refund, or bulk processing? Support is handled directly by ${SELLER.operator}, the developer who maintains the app.</p>

<h2>How to reach us</h2>
<h3>WhatsApp</h3>
<p>Message us on WhatsApp at ${SELLER.whatsappDisplay}. This is the usual channel for licence keys, order questions and refunds.</p>

<h3>E-mail</h3>
<p>Send an e-mail to <a href="mailto:${SELLER.supportEmail}">${SELLER.supportEmail}</a>. Use this for anything that needs a written record, such as a refund request, a correction report, or a technical bug report.</p>

<h2>What we can help with</h2>
<ul>
<li>Licence key delivery, activation and device transfer</li>
<li>Refund requests and payment confirmation</li>
<li>Technical issues and troubleshooting</li>
<li>Bulk processing and batch workflow questions</li>
<li>AI provider key setup (Google Gemini, OpenAI, Groq, Mistral AI)</li>
<li>CSV export format questions for any supported marketplace</li>
<li>Corrections to our contributor guides and documentation</li>
</ul>

<h2>Response time</h2>
<p>We aim to reply within a few hours, and always within 24 hours, seven days a week. Support is provided by one person rather than a call centre, so if you do not hear back within a day, please send a follow-up rather than assuming the message was ignored.</p>

<h2>Before you write</h2>
<p>Including these details lets us answer without a round trip: your app version, your Windows version, the file type involved, the AI provider you selected, your order reference if the question is about a purchase, and the exact text of any error message.</p>

<h2>Reporting a security or payment problem</h2>
<p>${FRAUD_NOTICE}</p>
`;

const CONTENT_FAQ =
  `\n<h1>Frequently Asked Questions — Tagyfy Pro</h1>\n` +
  `<p>Answers on providers, file formats, licensing, privacy and limits. ` +
  `Use the search box on this page to filter them, or ask a question through the <a href="/contact">Contact form</a>.</p>\n` +
  FAQS.map(
    (faq) => `<h2>${escapeHtml(faq.question)}</h2>\n<p>${escapeHtml(faq.answer)}</p>`
  ).join('\n') +
  `\n`;

const CONTENT_TUTORIALS = `
<h1>Setup Guides — Tagyfy Pro</h1>
<p>Four written English guides that take you from a fresh install to a reviewed, metadata-embedded batch on Windows 10 and 11. An optional walkthrough video (audio language: Urdu / Hindi) demonstrates the browser metadata generator screen flow.</p>

<h2>Guide 1: Install the app and confirm Windows trusts it</h2>
<ol>
<li>Download the installer from the <a href="/download">Download page</a>. The current build is Tagyfy_Pro_1.3.6_x64-setup.exe (about 160.7 MB).</li>
<li>Optionally verify the download against the .sig signature file published alongside the installer on the official release page.</li>
<li>Run the installer and follow the prompts. The default install is per-user, so no administrator password is normally required.</li>
<li>Windows Defender SmartScreen may warn that the publisher is not yet widely recognised, because code-signing reputation builds over time. Only continue if the file came from the official Download page and the size and signature match.</li>
<li>Launch Tagyfy Pro. You should land on the empty dashboard with the upload drop zone visible.</li>
</ol>

<h2>Guide 2: Add an AI provider key</h2>
<ol>
<li>Open Settings and go to the AI provider section. Keys are stored locally on your own machine, not on a Tagyfy server.</li>
<li>Create a key with your chosen provider: Google Gemini, OpenAI, Groq, or Mistral AI. Google AI Studio and Groq both offer free API tiers.</li>
<li>Add more than one key if you have them. The app rotates through keys automatically and parks a key in a short cooldown when it hits a rate limit.</li>
<li>Choose the model used for vision analysis (such as Gemini 3.5 Flash-Lite or Groq Qwen 3.8 Vision).</li>
<li>Run a single test image before committing to a large batch.</li>
</ol>

<h2>Guide 3: Configure metadata rules before you generate</h2>
<ol>
<li>Set your title length. Adobe Stock caps titles at 200 characters, with roughly 100 to 190 characters being the practical range for descriptive search context.</li>
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
<li>Embed or export. Write IPTC/XMP metadata into supported files, or export a CSV formatted for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF or Vecteezy.</li>
<li>Upload to the marketplace and spot-check one file in the contributor dashboard to confirm the title and keywords arrived as expected.</li>
</ol>

<h2>Common questions</h2>
<h3>Do I have to read every guide?</h3>
<p>No. Guide 1 is needed once at install time and Guide 2 once per provider key. Guides 3 and 4 cover the settings and batch workflow you will run repeatedly.</p>
<h3>Is there a video version?</h3>
<p>Yes — the embedded video on this page demonstrates the browser metadata generator workflow in Urdu / Hindi audio (~9 minutes). For step-by-step English instructions covering Windows desktop installation, API key rotation, and batch file embedding, follow the four written guides above.</p>
<h3>Can I use this on Mac or Linux?</h3>
<p>The desktop application currently ships for Windows 10 and 11 (64-bit) only. On Mac or Linux you can use the <a href="/tool">browser tool</a> and <a href="/metadata-checker">metadata checker</a>.</p>
`;

const CONTENT_BLOGS = `
<h1>Blog — Stock Contributor Knowledge Base</h1>
<p>Practitioner-written guides on stock metadata standards, IPTC/XMP file embedding, model and property releases, vector preparation, and marketplace compliance rules. Every article is written and reviewed by ${SELLER.operator} — see our <a href="/editorial-policy">editorial standards</a>.</p>

<h2>All contributor guides (${BLOG_POSTS.length})</h2>
${BLOG_POSTS.map((post) => `
<article>
<h3><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h3>
<p><strong>${escapeHtml(post.category)}</strong> · <time datetime="${escapeHtml(post.publishDate)}">${escapeHtml(post.publishDate)}</time> · ${escapeHtml(post.readTime)}</p>
<p>${escapeHtml(post.summary)}</p>
<p>Topics: ${escapeHtml(post.tags.join(', '))}.</p>
</article>
`).join('\n')}

<h2>Reference tables &amp; free browser utilities</h2>
<ul>
<li><a href="/metadata-limits">6-Marketplace Metadata Limits Reference</a> — title caps, keyword counts, and CSV column headers with official agency links.</li>
<li><a href="/metadata-checker">Free Metadata &amp; Trademark Compliance Checker</a> — validate titles, keyword priority, and restricted brands locally with no API key.</li>
<li><a href="/tool">Free Online Metadata Generator</a> — analyze images with your own AI key or test the 1-click Sample Demo.</li>
</ul>
`;

const CONTENT_CHROME_EXTENSION = `
<h1>Free Adobe Stock Chrome Extension — Tagyfy Pro</h1>
<p>100% free Chrome extension for Adobe Stock contributors. Pre-fill updated titles and keywords inside the contributor dashboard using Gemini, OpenAI, Groq, and Mistral AI. No license key required.</p>

<h2>Key Features</h2>
<ul>
<li><strong>Revive Approved Assets:</strong> Generate refreshed draft titles and keywords on existing portfolio items for your review.</li>
<li><strong>Auto-Tag New Uploads:</strong> Populate descriptive titles and up to 49 prioritized keywords in your upload queue.</li>
<li><strong>Multi-AI Vision Support:</strong> Bring your own key from Google Gemini, OpenAI, Groq, or Mistral AI with automatic key rotation.</li>
<li><strong>Direct Side-Panel Integration:</strong> Runs only on <code>contributor.stock.adobe.com</code> with zero telemetry and no Tagyfy server.</li>
</ul>

<h2>Installation Guide (Unpacked ZIP Archive, ~197 KB)</h2>
<ol>
<li>Download <code>Tagyfy_Pro_Chrome_Extension_V1.3.6.zip</code> (~197 KB) from the download section on this page.</li>
<li>Extract the ZIP archive to a permanent folder on your computer.</li>
<li>Open Google Chrome, navigate to <code>chrome://extensions/</code>, and toggle <strong>Developer mode</strong> on.</li>
<li>Click <strong>Load unpacked</strong>, select the extracted folder, and review every generated field before saving on Adobe Stock.</li>
</ol>

<h2>Permissions &amp; How to Uninstall</h2>
<p>The manifest (v1.3.6) runs exclusively on <code>contributor.stock.adobe.com</code> and connects only to the AI provider API whose key you entered. It does not submit, publish, or delete assets automatically.</p>
<p><strong>How to disable or uninstall:</strong> Open <code>chrome://extensions/</code> in Google Chrome, locate <strong>Tagyfy Pro</strong>, and click <strong>Remove</strong> (or toggle it off). Removing the extension automatically deletes its local <code>vmp_</code> storage from Chrome; you can then delete the extracted folder from disk.</p>
`;

const CONTENT_TOOL = `
<h1>Free Online Metadata Generator Tool — Tagyfy Pro</h1>
<p>Generate draft titles, descriptions, and keywords for supported stock images and videos directly in your browser. Click <strong>Try Sample Demo (No API Key)</strong> to inspect a completed asset and export CSVs immediately, or connect your own free Google Gemini, OpenAI, Groq, or Mistral AI key.</p>

<h2>How to Use the Free Online Tool</h2>
<ol>
<li>Click <strong>Try Sample Demo (No API Key)</strong> to test the editor and 6-marketplace CSV exports immediately, or paste an API key from Google Gemini, OpenAI, Groq, or Mistral AI.</li>
<li>Drag and drop your image, paired vector preview, or video file directly into the browser workspace.</li>
<li>Click Generate to produce a draft title, description, and ranked keyword list.</li>
<li>Review confidence scores, trademark flags, and keyword order inline before exporting CSV or embedded JPEG ZIP files.</li>
</ol>

<h2>Supported Formats &amp; Honest Limitations</h2>
<ul>
<li>JPG, PNG, and WebP are analyzed directly in the browser; SVG, EPS, and AI vectors are analyzed via their same-named JPG preview; MP4 and MOV clips sample video frames.</li>
<li>A browser cannot write metadata natively into EPS, AI, SVG, MP4, or MOV files — the browser tool exports formatted CSVs for those formats, while in-file binary embedding ships in the <a href="/download">Windows desktop app</a>.</li>
<li>Selected files are sent directly from your browser to the AI provider you chose under that provider's terms; Tagyfy runs no media proxy and stores no copy.</li>
<li>Need to check an existing title and keyword list with zero API key? Use the <a href="/metadata-checker">Free Metadata &amp; Compliance Checker</a>.</li>
</ul>
`;

const CONTENT_METADATA_CHECKER = `
<h1>Free Stock Metadata &amp; CSV Compliance Checker — 6-Marketplace Validator</h1>
<p>Audit a single draft title, description, and keyword list or upload a full <code>.csv</code> batch spreadsheet to verify column headers, semicolon vs. comma delimiters, UTF-8 BOM encoding, duplicate filenames, top-10 keyword slot hygiene, and 90+ restricted brand names across Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF. Runs 100% locally in your browser with no login and no API key.</p>

<h2>What This Free Validator Checks</h2>
<ul>
<li><strong>Full CSV File Structure &amp; Byte Audit:</strong> Verifies raw UTF-8 BOM bytes (flagging BOM errors for Dreamstime and Vecteezy), semicolon vs. comma column delimiters, case-sensitive portal headers, ragged column counts, and duplicate batch filenames.</li>
<li><strong>Per-Marketplace Character &amp; Keyword Limits:</strong> Checks Adobe Stock (200 chars, comma-free title, 5–49 keywords), Shutterstock (200 chars, 7–50 keywords), Freepik (100 chars, semicolon CSV, 5–50 keywords), Vecteezy (200 chars, 5–50 keywords), Dreamstime (130-char title, 10–80 keywords), and 123RF (255 chars, 7–50 keywords).</li>
<li><strong>Client-Side Trademark &amp; Brand Scan:</strong> Flags common technology, apparel, automotive, food, entertainment, and AI generator brand names with one-click semantic replacement.</li>
<li><strong>Top-10 Slot &amp; Spam Diagnostics:</strong> Identifies duplicate tags, overly long multi-word sentences, subjective hype adjectives ("beautiful", "stunning", "amazing"), and generic format words ("photo", "vector", "background") wasted in slots 1–10.</li>
<li><strong>1-Click Auto-Fix &amp; Clean CSV Download:</strong> Repairs headers, BOM encoding, title commas, duplicate tags, and trademarks and downloads a verified CSV file.</li>
</ul>

<h2>Related Resources</h2>
<ul>
<li><a href="/stock-csv-converter">Multi-Agency Stock CSV Converter &amp; Fixer</a> — convert a full CSV batch across all six agency formats in one click.</li>
<li><a href="/metadata-limits">Stock Metadata Limits by Marketplace</a> — full specification table with links to each agency's official documentation.</li>
<li><a href="/tool">Free Online AI Metadata Generator</a> — generate draft titles and keywords directly from image pixels.</li>
<li><a href="/blogs">Stock Contributor Knowledge Base</a> — in-depth guides on IPTC/XMP standards, releases, vector pre-flight checks, and CSV troubleshooting.</li>
</ul>
`;

const CONTENT_CSV_CONVERTER = `
<h1>Free Multi-Agency Stock CSV Converter &amp; Fixer — Adobe Stock, Shutterstock &amp; Freepik</h1>
<p>Upload one stock metadata CSV spreadsheet — from Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, 123RF, Lightroom, or Excel — and convert the entire batch into verified upload files for all six stock marketplaces at once. Runs 100% locally in your browser with no API key and no server upload.</p>

<h2>What This Free Batch CSV Converter Solves</h2>
<ul>
<li><strong>Delimiter &amp; Header Mapping:</strong> Automatically converts comma-delimited spreadsheets into Freepik semicolon-delimited CSVs (<code>filename;title;tags</code>) and vice versa, plus supports custom column mapping.</li>
<li><strong>UTF-8 BOM Byte Hygiene:</strong> Includes UTF-8 BOM where Excel/portals expect it (Adobe Stock, Shutterstock, Freepik, 123RF) and strips BOM automatically for <strong>Dreamstime</strong> and <strong>Vecteezy</strong> so header validation never fails.</li>
<li><strong>Title &amp; Description Bridging:</strong> Automatically maps Adobe Stock / Freepik <code>Title</code> values into Shutterstock / 123RF <code>Description</code> columns (and the reverse) so single-column agencies never receive blank fields.</li>
<li><strong>Cross-Agency Category Crosswalk:</strong> Translates Adobe Stock numeric category IDs (1–21) to Shutterstock English category names (such as <code>Technology</code> or <code>Business/Finance</code>) and Dreamstime numeric category IDs.</li>
<li><strong>Keyword Deduplication &amp; Trademark Cleaning:</strong> Removes duplicate tags while preserving top-10 keyword order, strips commas from Adobe Stock titles, smart-trims Freepik titles at 100 characters, flags restricted brand names, and packages all six portals into one <code>.zip</code> archive.</li>
</ul>

<h2>Related Contributor Tools &amp; Guides</h2>
<ul>
<li><a href="/metadata-checker">Free Stock Metadata &amp; Trademark Checker</a> — audit single titles and keyword priority across six agencies.</li>
<li><a href="/tool">Free Online AI Metadata Generator</a> — generate titles, descriptions, and ranked keywords from image or video files.</li>
<li><a href="/metadata-limits">Stock Metadata Limits by Marketplace</a> — verified column headers, character caps, and official documentation links.</li>
<li><a href="/blog/stock-csv-upload-formatting-troubleshooting-guide">CSV Upload Formatting &amp; Troubleshooting Guide</a> — deep dive into RFC 4180 escaping, UTF-8 BOM, and filename matching.</li>
</ul>
`;

const CONTENT_PRIVACY = `
<h1>Privacy Policy — Tagyfy Pro</h1>
<p>Last Updated: October 26, 2026. Effective Date: January 1, 2026.</p>

<h2>1. Overview and Operator Identity</h2>
<p>Welcome to Tagyfy Pro (formerly VisionMetadata Pro), operated by ${SELLER.operator} and accessible at tagyfy.com. This Privacy Policy explains what information is collected when you visit the website or use the desktop application, browser tools, or Chrome extension, and how your privacy choices are respected.</p>

<h2>2. How Media Files and API Keys Are Handled</h2>
<p>Tagyfy has distinct local and browser processing modes. We do not operate a central server that proxies, inspects, or stores your creative assets, though any external AI provider you configure receives the image or video frame payload required to analyze it:</p>
<ul>
<li><strong>Windows desktop app:</strong> Files are read and embedded locally on your computer. When you request AI analysis, the selected file or sampled video frames are sent directly from your computer to the AI provider associated with your API key (Google Gemini, OpenAI, Groq, or Mistral AI). Tagyfy never receives or stores that media.</li>
<li><strong>Browser generator (/tool) &amp; Metadata Checker (/metadata-checker):</strong> The Metadata Checker runs 100% locally in your browser with no outbound requests. In the AI generator, your selected file is read in browser memory and sent directly to the AI provider you chose.</li>
<li><strong>API keys:</strong> The Windows app stores keys in local encrypted storage on your machine. The browser tool keeps keys in memory or in your own browser's local storage if you opt in. Tagyfy never transmits your API keys to a Tagyfy server.</li>
</ul>

<h2>3. Cookies, Web Beacons and Analytics</h2>
<p>tagyfy.com initializes Google Consent Mode v2 with all analytics and advertising storage signals set to denied by default. On your first visit, a consent banner lets you accept or decline optional cookies in a single click. If you accept, Google Analytics (GA4, Measurement ID: G-VDFCFCECNL) collects aggregated usage statistics. You can withdraw consent at any time using the Cookie settings button in the footer or install the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>

<h2>4. Google AdSense, Third-Party Cookies and Partner Data Use</h2>
<p>We display advertising via Google AdSense strictly on editorial guides and reference pages (never on legal, checkout, contact, or error screens):</p>
<ul>
<li>Third-party vendors, including Google, use cookies, web beacons, and IP addresses to serve and measure ads based on a user's prior visits to this website or other websites on the Internet.</li>
<li>Third parties may be placing and reading cookies on your browser, or using web beacons to collect information as a result of ad serving on tagyfy.com.</li>
<li>Google's use of advertising cookies enables it and its partners to serve ads to visitors based on their visit to our pages and/or other sites on the Internet.</li>
<li>To learn specifically how Google collects and processes data when you visit websites that use Google services, please read <a href="https://www.google.com/policies/privacy/partners/" rel="noopener noreferrer">How Google uses information from sites or apps that use our services</a>.</li>
<li>You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com/" rel="noopener noreferrer">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer">www.aboutads.info/choices</a>.</li>
</ul>

<h2>5. Information You Voluntarily Provide</h2>
<p>When you contact us via our contact form, email, or WhatsApp regarding support, corrections, or license purchases, we receive your name, email address or phone number, and message contents solely to respond, issue receipts and license keys, and provide support. We never sell, rent, or trade customer contact details.</p>

<h2>6. Data Protection Rights (GDPR, UK GDPR and CCPA)</h2>
<p>Depending on your jurisdiction, you have the right to request access to personal data we hold about you, request correction or deletion, withdraw cookie consent, and object to processing.</p>

<h2>7. Contact the Developer and Privacy Inquiries</h2>
<p>Operator: ${SELLER.operator}. Email: <a href="mailto:${SELLER.supportEmail}">${SELLER.supportEmail}</a>. WhatsApp: ${SELLER.whatsappDisplay}. Website: https://tagyfy.com.</p>
`;

const CONTENT_TERMS = `
<h1>Terms of Service — Tagyfy Pro</h1>
<p>Last Updated: October 26, 2026. Effective Date: January 1, 2026.</p>

<h2>1. Acceptance of Terms</h2>
<p>By downloading, installing, accessing, or using Tagyfy Pro or visiting tagyfy.com, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our software or website.</p>

<h2>2. Software License and Free Trial</h2>
<p>We grant you a revocable, non-exclusive, non-transferable, limited license to download, install, and run Tagyfy Pro on your personal computer strictly in accordance with the purchased license tier (1 Month, 3 Months, 6 Months, or 1 Year).</p>
<ul>
<li><strong>Free Trial:</strong> New users are eligible for a 3-day full-access trial period without credit card requirement.</li>
<li><strong>License Activation:</strong> Paid licenses are tied to your hardware machine ID. Transferring a license to a new machine can be requested through customer support.</li>
<li><strong>No Reverse Engineering:</strong> You agree not to decompile, reverse engineer, disassemble, or tamper with the software protection mechanisms.</li>
</ul>

<h2>3. AI API Usage and Third-Party Services</h2>
<p>Tagyfy Pro provides direct client-side integration with third-party Artificial Intelligence providers (Google Gemini, OpenAI, Groq, and Mistral AI). You are responsible for providing valid API keys and complying with the respective terms of service of each AI provider.</p>

<h2>4. User Content and Intellectual Property</h2>
<p>You retain 100% full intellectual property ownership of all images, vector files, videos, and generated metadata processed with our application. We claim zero rights or ownership over your creative works.</p>

<h2>5. Disclaimer of Warranties and Limitation of Liability</h2>
<p>Tagyfy Pro and all website materials are provided on an "as is" and "as available" basis without warranties of any kind. While we test our metadata embedding and CSV pipelines against published Adobe Stock, Shutterstock, and Freepik specifications, we do not guarantee specific review approvals, search rankings, or sales earnings on third-party stock marketplaces.</p>

<h2>6. Contact Information</h2>
<p>For legal questions or licensing inquiries, contact ${SELLER.operator}: email <a href="mailto:${SELLER.supportEmail}">${SELLER.supportEmail}</a>, or WhatsApp ${SELLER.whatsappDisplay}.</p>
`;

const CONTENT_REFUND = `
<h1>Refund and Cancellation Policy — Tagyfy Pro</h1>
<p>Last Updated: August 17, 2026. Effective Date: January 1, 2026.</p>

<h2>1. 3-Day Free Trial (Try Before You Buy)</h2>
<p>We want you to evaluate Tagyfy Pro on your own files before spending money. That is why we provide an unrestricted 3-Day Full-Access Free Trial for all new users — including AI keywording, video tagging, and direct IPTC/XMP file embedding — with no credit card required.</p>

<h2>2. Digital License Key Refund Terms</h2>
<ul>
<li><strong>Technical Incompatibility:</strong> If the software experiences a technical issue on your machine that support is unable to resolve within 7 days of purchase, you are eligible for a 100% full refund.</li>
<li><strong>Accidental Duplicate Purchases:</strong> Duplicate orders for the same duration are refunded immediately.</li>
</ul>

<h2>3. Non-Refundable Conditions</h2>
<ul>
<li>Changing your mind after actively using the license key beyond the 7-day post-purchase window.</li>
<li>Exhaustion or rate-limiting of third-party AI provider quotas (Gemini, OpenAI, Groq, Mistral), as AI API usage is managed directly between you and your chosen provider.</li>
<li>Rejections on stock marketplaces resulting from stock agency policy guidelines (photo quality, intellectual property rights, missing releases, or editorial rules).</li>
</ul>

<h2>4. How to Request a Refund or Support</h2>
<ul>
<li>WhatsApp Support: ${SELLER.whatsappDisplay}</li>
<li>Email support: <a href="mailto:${SELLER.supportEmail}">${SELLER.supportEmail}</a></li>
<li>Response Time: Within 24 hours, seven days a week.</li>
</ul>
`;

const CONTENT_EDITORIAL = `
<h1>Editorial Standards and Corrections — Tagyfy Pro</h1>
<p>A statement of what you can expect from the guides, documentation and product copy published at tagyfy.com. Last reviewed: October 2026.</p>

<h2>Written by a practitioner, not a content farm</h2>
<p>The guides on this site are written by ${SELLER.operator}, a stock contributor and logo designer who works with these marketplaces directly. Content is produced around real contributor workflow problems, not mass-generated to fill keyword gaps.</p>

<h2>Claims are limited to what can be supported</h2>
<p>Where a marketplace publishes a rule — a title length limit, a keyword cap, a category requirement — we state it and link to the source. Where the basis is our own experience, we say so. We do not promise approval, search position or income, because no tool controls those outcomes.</p>

<h2>No invented screenshots, stats or reviews</h2>
<p>We do not publish fabricated testimonials, invented download counts, or screenshots of results we did not obtain. Product capability claims describe features that exist in the released build; if a feature is removed, the claim is removed with it.</p>

<h2>Content is revisited, not abandoned</h2>
<p>Marketplace rules change. When a rule we have written about changes, the affected article is revised and its revision date updated.</p>

<h2>How AI is used, and how it is not</h2>
<p>Drafting, spelling and structural editing may involve AI tools. The subject matter, the examples and the judgements in each guide come from the author's own work with these marketplaces, and every published piece is read and edited by a person before it goes live.</p>

<h2>Corrections</h2>
<p>If something on this site is wrong, out of date, or stated with more confidence than the evidence supports, tell us through the <a href="/contact">Contact page</a> and include the page address. Factual errors in guides and documentation are corrected, and the page's revision date is updated at the same time.</p>
`;

const CONTENT_METADATA_LIMITS = `
<h1>Stock Metadata Limits by Marketplace — Titles, Keywords and CSV Columns</h1>
<p>Title lengths, keyword counts, CSV column names and the errors that actually stop an upload, for every marketplace Tagyfy Pro supports. Figures were compiled from each platform's own documentation and last checked in ${LIMITS_LAST_CHECKED}. Marketplaces change their specifications without notice — when an upload is rejected, the platform's current specification governs, not this page.</p>

${PLATFORMS.map((p) => `
<h2>${escapeHtml(p.name)}</h2>
<ul>
<li><strong>Title limit:</strong> ${escapeHtml(p.titleLimit)}. ${escapeHtml(p.titleNotes)}</li>
<li><strong>Keywords:</strong> ${escapeHtml(p.keywordLimit)}. ${escapeHtml(p.keywordNotes)}</li>
<li><strong>CSV columns:</strong> <code>${escapeHtml(p.csvFormat)}</code></li>
</ul>
<ul>
${p.quirks.map((q) => `<li>${escapeHtml(q)}</li>`).join('\n')}
</ul>
<p>Source: <a href="${escapeHtml(p.source.url)}" rel="noopener">${escapeHtml(p.source.label)}</a></p>
`).join('\n')}

<h2>When an upload fails, it is usually one of these five things</h2>
<ol>
${FAILURES.map((f) => `<li><strong>${escapeHtml(f.symptom)}</strong> — Cause: ${escapeHtml(f.cause)} Fix: ${escapeHtml(f.fix)}</li>`).join('\n')}
</ol>

<h2>Related reading</h2>
<ul>
<li><a href="/metadata-checker">Free Metadata &amp; Compliance Checker</a> — paste a title and keyword list to test every marketplace rule above with no API key.</li>
<li><a href="/blogs">Contributor guides</a> — how each marketplace weighs titles and keywords, and the rejection causes worth designing around.</li>
<li><a href="/tool">Free browser tool</a> — generate a title and keyword set for one image, then export it in the right format for the platform above.</li>
<li><a href="/faq">FAQ</a> — why embedded metadata is sometimes ignored, and what the trademark check does and does not cover.</li>
<li><a href="/editorial-policy">Editorial standards</a> — how these figures were checked, and how to report one that is out of date.</li>
</ul>
`;

const CONTENT_EVENT_CALENDAR = `
<h1>Stock Contributor Event Calendar &amp; Upload Planner — Adobe Stock &amp; Shutterstock</h1>
<p>Search ${STOCK_CALENDAR_EVENTS.length} seasonal holidays, commercial retail events, and global awareness days by exact date, month, or theme. Includes ideal Adobe Stock upload lead-time windows (6 to 10 weeks ahead), photo/vector/video buyer briefs, trademark cautions, and copy-ready safe keywords.</p>

<h2>Why Stock Contributors Upload 6 to 10 Weeks Early</h2>
<p>Marketing teams, graphic designers, and editorial buyers source holiday stock photos, vectors, and footage months before the calendar date arrives. Uploading early clears moderation queues and lets your seasonal assets accumulate initial downloads ahead of peak search volume.</p>

${MONTH_NAMES.map((mName, idx) => {
  const mEvents = STOCK_CALENDAR_EVENTS.filter((e) => e.month === idx + 1);
  return `
<h2>${escapeHtml(mName)} Stock Events</h2>
${mEvents
  .map(
    (ev) => `
<h3>${escapeHtml(ev.name)} (${escapeHtml(ev.dateLabel)} · Upload ~${ev.leadWeeks} weeks ahead)</h3>
<p>${escapeHtml(ev.intro)}</p>
<ul>
<li><strong>Photo brief:</strong> ${escapeHtml(ev.photoIdea)}</li>
<li><strong>Vector brief:</strong> ${escapeHtml(ev.vectorIdea)}</li>
<li><strong>Video brief:</strong> ${escapeHtml(ev.videoIdea)}</li>
<li><strong>Safe keywords:</strong> ${escapeHtml(ev.safeKeywords.join(', '))}</li>
${ev.trademarkNote ? `<li><strong>Trademark caution:</strong> ${escapeHtml(ev.trademarkNote)}</li>` : ''}
</ul>`
  )
  .join('\n')}`;
}).join('\n')}

<h2>Related Stock Contributor Tools</h2>
<ul>
<li><a href="/tool">Free AI Metadata Generator</a> — activate Dual-Strategy Event Targeting directly from any event card.</li>
<li><a href="/metadata-checker">Stock Metadata &amp; CSV Checker</a> — verify title lengths, commas, keyword limits, and restricted brand names.</li>
<li><a href="/stock-csv-converter">Multi-Agency Stock CSV Converter</a> — convert one CSV into Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF formats.</li>
</ul>
`;

// ─── Structured data ──────────────────────────────────────────────────────────

const ORGANISATION_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tagyfy Pro',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.jpg`,
    description:
      'AI-assisted metadata generation, validation, and embedding software for stock media contributors.',
    email: SELLER.supportEmail,
    founder: {
      '@type': 'Person',
      name: SELLER.operator,
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
    'Desktop application that generates titles, descriptions and keywords for stock media using AI vision models, and writes IPTC/XMP metadata directly into supported image, vector and video files.',
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
    'Browser-based stock metadata generator. Produces draft titles, descriptions and keywords for images, vectors and video using your own AI provider key or built-in sample demo, with no account and nothing to install.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const CHECKER_WEBAPP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tagyfy Pro Stock Metadata & Trademark Compliance Checker',
  url: `${SITE_URL}/metadata-checker`,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any modern browser',
  description:
    'Client-side stock metadata validator checking title character limits, comma rules, keyword counts, duplicates, and restricted brand names across six marketplaces with no API key.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const CSV_CONVERTER_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tagyfy Pro Multi-Agency Stock CSV Converter & Fixer',
  url: `${SITE_URL}/stock-csv-converter`,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any modern browser',
  description:
    'Convert one stock metadata CSV spreadsheet into upload-ready CSV files for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF locally in your browser with automatic delimiter, BOM, category, and trademark fixing.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const EVENT_CALENDAR_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tagyfy Pro Stock Contributor Event & Upload Lead-Time Calendar',
  url: `${SITE_URL}/event-calendar`,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any modern browser',
  description:
    'Year-round event calendar and upload lead-time planner for Adobe Stock, Shutterstock, and Freepik contributors. Search by date or month for commercial briefs, photo/vector/video concepts, and trademark-safe keywords.',
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
  dateModified: post.updatedDate || post.publishDate,
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

const renderJsonLd = (schemas: unknown[]) => {
  const flat = schemas.flat().filter(Boolean);
  if (!flat.length) return '';
  const payload = JSON.stringify(flat.length === 1 ? flat[0] : flat).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${payload}</script>`;
};

interface PageSpec {
  path: string;
  title: string;
  desc: string;
  content: string;
  ogType?: 'website' | 'article';
  adsense?: boolean;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  schema?: unknown[];
}

const PAGES: PageSpec[] = [
  { path: '/', title: 'Tagyfy Pro | AI-Powered Metadata Generator for Adobe Stock', desc: 'Generate, validate, and embed titles, descriptions, and keywords into your stock images, vectors, and videos using AI. Free online tools and Windows desktop app.', content: CONTENT_HOME, adsense: false, lastmod: '2026-10-26', changefreq: 'weekly', priority: '1.0', schema: [ORGANISATION_SCHEMA, SOFTWARE_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }])] },
  { path: '/about', title: 'About Salman Ahmad & Tagyfy Pro — Independent Stock Contributor Tool', desc: 'Meet Salman Ahmad, the stock contributor and vector designer behind Tagyfy Pro. Learn how our local-first Windows app, free browser tools, and contributor guides are built.', content: CONTENT_ABOUT, adsense: false, lastmod: '2026-10-26', changefreq: 'monthly', priority: '0.7', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])] },
  { path: '/features', title: 'Features — Batch Processing, Trademark Filter & Embedding | Tagyfy Pro', desc: 'Explore Tagyfy Pro features: 4-provider AI vision analysis, batch metadata generation, local IPTC/XMP embedding across 10 formats, trademark sniffer, and 6-marketplace CSV exports.', content: CONTENT_FEATURES, adsense: false, lastmod: '2026-10-26', changefreq: 'monthly', priority: '0.8', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Features', path: '/features' }])] },
  { path: '/pricing', title: 'Pricing & License Plans | Tagyfy Pro', desc: 'Transparent one-off pricing for Tagyfy Pro with fixed-term license options. No auto-renewal, a free 3-day Windows trial, and free browser tools for stock contributors.', content: CONTENT_PRICING, adsense: false, lastmod: '2026-10-26', changefreq: 'weekly', priority: '0.8', schema: [SOFTWARE_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }])] },
  { path: '/download', title: 'Download Tagyfy Pro for Windows | Trial, Verification & Uninstall Info', desc: 'Download Tagyfy Pro v1.3.6 for Windows 10 and 11. Includes 3-day free trial, publisher verification details, system requirements, and complete uninstallation steps.', content: CONTENT_DOWNLOAD, adsense: false, lastmod: '2026-10-26', changefreq: 'weekly', priority: '0.8', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Download', path: '/download' }])] },
  { path: '/contact', title: 'Contact & Support | Tagyfy Pro', desc: 'Get direct help from developer Salman Ahmad for Tagyfy Pro license keys, refunds, technical troubleshooting, or editorial corrections.', content: CONTENT_CONTACT, adsense: false, lastmod: '2026-10-26', changefreq: 'monthly', priority: '0.7', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])] },
  { path: '/faq', title: 'Frequently Asked Questions | Tagyfy Pro', desc: 'Answers to common questions about Tagyfy Pro: supported AI providers, 10 media formats, trademark detection, batch processing, CSV exports, API key safety, and licensing.', content: CONTENT_FAQ, adsense: true, lastmod: '2026-10-26', changefreq: 'monthly', priority: '0.8', schema: [FAQ_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }])] },
  { path: '/tutorials', title: 'Setup Guides & Walkthrough | Tagyfy Pro', desc: 'Four step-by-step English written setup guides covering Windows installation, API key rotation, metadata rules, and batch IPTC/XMP embedding.', content: CONTENT_TUTORIALS, adsense: true, lastmod: '2026-10-26', changefreq: 'monthly', priority: '0.8', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Tutorials', path: '/tutorials' }])] },
  { path: '/blogs', title: 'Blog — Stock Contributor Knowledge Base | Tagyfy Pro', desc: 'Practitioner-written guides for stock media contributors: IPTC/XMP metadata standards, marketplace title and keyword rules, model and property releases, vector pre-flight checks, and CSV workflows.', content: CONTENT_BLOGS, adsense: true, lastmod: '2026-10-26', changefreq: 'weekly', priority: '0.9', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/blogs' }])] },
  { path: '/chrome-extension', title: 'Free Adobe Stock Chrome Extension | Tagyfy Pro', desc: 'Free Chrome extension for Adobe Stock contributors. Generate and review metadata drafts inside the contributor dashboard using Gemini, OpenAI, Groq, and Mistral AI.', content: CONTENT_CHROME_EXTENSION, adsense: false, lastmod: '2026-10-26', changefreq: 'monthly', priority: '0.7', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Chrome extension', path: '/chrome-extension' }])] },
  { path: '/tool', title: 'Free Online Metadata Generator Tool | Tagyfy Pro', desc: 'Generate draft titles, descriptions, and keywords for stock images and videos in your browser. Try the instant Sample Demo with no API key or connect Gemini, OpenAI, Groq, or Mistral.', content: CONTENT_TOOL, adsense: false, lastmod: '2026-10-26', changefreq: 'weekly', priority: '0.9', schema: [WEBAPP_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Free tool', path: '/tool' }])] },
  { path: '/metadata-checker', title: 'Free Stock Metadata & Trademark Checker — 6-Marketplace Validator | Tagyfy Pro', desc: 'Validate stock photo, vector, and video titles and keywords against Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF rules in your browser with no API key.', content: CONTENT_METADATA_CHECKER, adsense: false, lastmod: '2026-10-26', changefreq: 'weekly', priority: '0.9', schema: [CHECKER_WEBAPP_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Metadata Checker', path: '/metadata-checker' }])] },
  { path: '/stock-csv-converter', title: 'Free Multi-Agency Stock CSV Converter & Fixer — Adobe Stock, Shutterstock & Freepik | Tagyfy Pro', desc: 'Convert one stock metadata CSV into upload-ready spreadsheets for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF in your browser with automatic delimiter, BOM, category, and trademark fixing.', content: CONTENT_CSV_CONVERTER, adsense: false, lastmod: '2026-10-26', changefreq: 'weekly', priority: '0.9', schema: [CSV_CONVERTER_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Stock CSV Converter', path: '/stock-csv-converter' }])] },
  { path: '/event-calendar', title: 'Stock Contributor Event Calendar & Upload Planner — Adobe Stock & Shutterstock | Tagyfy Pro', desc: 'Search seasonal holidays, commercial sales, and global awareness days by date or month. Includes Adobe Stock upload lead times, photo/vector/video concepts, trademark warnings, and copy-ready safe keywords.', content: CONTENT_EVENT_CALENDAR, adsense: false, lastmod: '2026-10-26', changefreq: 'weekly', priority: '0.9', schema: [EVENT_CALENDAR_SCHEMA, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Stock Event Calendar', path: '/event-calendar' }])] },
  { path: '/metadata-limits', title: 'Stock Metadata Limits by Marketplace — Titles & Keywords Reference | Tagyfy Pro', desc: 'Title length limits, keyword counts, CSV column names and common upload errors for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime and 123RF — each with its official source linked.', content: CONTENT_METADATA_LIMITS, adsense: true, lastmod: '2026-10-26', changefreq: 'monthly', priority: '0.9', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Metadata limits', path: '/metadata-limits' }])] },
  { path: '/privacy-policy', title: 'Privacy Policy | Tagyfy Pro', desc: 'Tagyfy Pro privacy policy. Learn how the Windows app and browser tools handle your media files, API keys, cookies, web beacons, analytics, and Google AdSense.', content: CONTENT_PRIVACY, adsense: false, lastmod: '2026-10-26', changefreq: 'yearly', priority: '0.5', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy-policy' }])] },
  { path: '/terms', title: 'Terms of Service | Tagyfy Pro', desc: 'Terms and conditions for using Tagyfy Pro desktop application, browser utilities, and Chrome extension.', content: CONTENT_TERMS, adsense: false, lastmod: '2026-10-26', changefreq: 'yearly', priority: '0.5', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Terms', path: '/terms' }])] },
  { path: '/refund-policy', title: 'Refund Policy | Tagyfy Pro', desc: 'Tagyfy Pro refund policy. Understand our 3-day free trial, refund eligibility criteria, and how to request a refund.', content: CONTENT_REFUND, adsense: false, lastmod: '2026-10-26', changefreq: 'yearly', priority: '0.5', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Refund Policy', path: '/refund-policy' }])] },
  { path: '/editorial-policy', title: 'Editorial Standards & Corrections | Tagyfy Pro', desc: 'How the guides and documentation on tagyfy.com are researched, written, reviewed and corrected by Salman Ahmad.', content: CONTENT_EDITORIAL, adsense: false, lastmod: '2026-10-26', changefreq: 'yearly', priority: '0.6', schema: [breadcrumb([{ name: 'Home', path: '/' }, { name: 'Editorial standards', path: '/editorial-policy' }])] },
];

// ─── Add individual blog posts dynamically ─────────────────────────────────
BLOG_POSTS.forEach((post) => {
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  let contentHtml =
    `<article>` +
    `<h1>${escapeHtml(post.title)}</h1><h2>${escapeHtml(post.subtitle)}</h2>` +
    `<p><em>${escapeHtml(post.category)} · <time datetime="${escapeHtml(post.publishDate)}">${escapeHtml(post.publishDate)}</time> · ${escapeHtml(post.readTime)} · by ${escapeHtml(post.author.name)}</em></p>` +
    `<p>${escapeHtml(post.summary)}</p>`;

  post.content.intro.split('\n\n').forEach((para) => {
    contentHtml += `<p>${inlineToHtml(para)}</p>`;
  });

  post.content.sections.forEach((sec) => {
    contentHtml += `<h2>${escapeHtml(sec.heading)}</h2>`;
    if (sec.subheading) contentHtml += `<h3>${inlineToHtml(sec.subheading)}</h3>`;

    sec.body.forEach((para) => {
      contentHtml += `<p>${inlineToHtml(para)}</p>`;
    });

    if (sec.tip) contentHtml += `<p><strong>Practitioner Tip:</strong> ${inlineToHtml(sec.tip)}</p>`;
    if (sec.warning) contentHtml += `<p><strong>Compliance Note:</strong> ${inlineToHtml(sec.warning)}</p>`;

    if (sec.keyTakeaways && sec.keyTakeaways.length) {
      contentHtml += `<h3>Key takeaways</h3><ul>${sec.keyTakeaways
        .map((item) => `<li>${inlineToHtml(item)}</li>`)
        .join('')}</ul>`;
    }

    if (sec.example) {
      const ex = sec.example;
      contentHtml += `<h3>Worked example</h3>`;
      if (ex.badTitle) contentHtml += `<p><strong>Weak or risky title:</strong> ${inlineToHtml(ex.badTitle)}</p>`;
      if (ex.goodTitle) contentHtml += `<p><strong>Clear descriptive title:</strong> ${inlineToHtml(ex.goodTitle)}</p>`;
      if (ex.badKeywords && ex.badKeywords.length) {
        contentHtml += `<p><strong>Weak keywords:</strong> ${inlineToHtml(ex.badKeywords.join(', '))}</p>`;
      }
      if (ex.goodKeywords && ex.goodKeywords.length) {
        contentHtml += `<p><strong>Prioritized keywords:</strong> ${inlineToHtml(ex.goodKeywords.join(', '))}</p>`;
      }
      if (ex.explanation) contentHtml += `<p>${inlineToHtml(ex.explanation)}</p>`;
    }
  });

  if (post.content.conclusion) {
    contentHtml += `<h2>Summary</h2>`;
    post.content.conclusion.split('\n\n').forEach((para) => {
      contentHtml += `<p>${inlineToHtml(para)}</p>`;
    });
  }

  if (post.content.checklist && post.content.checklist.length) {
    contentHtml += `<h2>Pre-Submission Review Checklist</h2><ul>${post.content.checklist
      .map((item) => `<li>${inlineToHtml(item)}</li>`)
      .join('')}</ul>`;
  }

  contentHtml += `<h2>Related contributor guides</h2><ul>${related
    .map((r) => `<li><a href="/blog/${r.slug}">${escapeHtml(r.title)}</a></li>`)
    .join('')}</ul>`;

  contentHtml += `<p>Tags: ${escapeHtml(post.tags.join(', '))}. Written and reviewed by ${escapeHtml(post.author.name)} — see our <a href="/editorial-policy">editorial standards</a>.</p>`;
  contentHtml += `<p>More resources: <a href="/metadata-limits">metadata limits by marketplace</a>, <a href="/metadata-checker">free metadata checker</a>, <a href="/tool">free browser tool</a>, <a href="/blogs">all guides</a>.</p>`;
  contentHtml += `</article>`;

  PAGES.push({
    path: `/blog/${post.slug}`,
    title: `${post.title} | Tagyfy Pro Blog`,
    desc: post.summary,
    content: contentHtml,
    ogType: 'article',
    adsense: true,
    lastmod: post.updatedDate || post.publishDate,
    changefreq: 'monthly',
    priority: '0.8',
    schema: [
      articleSchema(post),
      breadcrumb([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/blogs' },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  });
});

function wrapPrerenderShell(bodyHtml: string): string {
  return `<div class="prerender-shell">
  <header class="prerender-header">
    <div class="prerender-header-inner">
      <a href="/" class="prerender-logo">Tagyfy<span> Pro</span> <small>AI</small></a>
      <nav class="prerender-nav" aria-label="Primary navigation">
        <a href="/tool">Free Tool</a>
        <a href="/metadata-checker">Checker</a>
        <a href="/stock-csv-converter">CSV Converter</a>
        <a href="/event-calendar">Events</a>
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
        <a href="/blogs">Blog</a>
        <a href="/tutorials">Tutorials</a>
        <a href="/faq">FAQ</a>
        <a href="/download" class="prerender-cta">Download</a>
      </nav>
    </div>
  </header>
  <main class="prerender-main">
    <div class="prerender-card">
${bodyHtml}
    </div>
  </main>
  <footer class="prerender-footer">
    <p>&copy; ${new Date().getFullYear()} Tagyfy Pro &middot; Operated by ${escapeHtml(SELLER.operator)} &middot; <a href="/privacy-policy">Privacy Policy</a> &middot; <a href="/terms">Terms</a> &middot; <a href="/refund-policy">Refunds</a> &middot; <a href="/editorial-policy">Editorial Standards</a> &middot; <a href="/contact">Contact</a></p>
  </footer>
</div>`;
}

function buildPageHtml(template: string, page: PageSpec): string {
  const canonicalUrl = `${SITE_URL}${page.path === '/' ? '/' : page.path}`;
  const safeTitle = escapeHtml(page.title);
  const safeDesc = escapeHtml(page.desc);
  const ogType = page.ogType || 'website';

  let html = template;

  // Title & meta description
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${safeTitle}</title>`);
  html = html.replace(
    /<meta name="description"[\s\S]*?\/>/,
    () => `<meta name="description" content="${safeDesc}" />`
  );

  // OpenGraph & Twitter per-page synchronization
  html = html.replace(
    /<meta property="og:title" content=".*?"\s*\/>/,
    () => `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta property="og:description"[\s\S]*?\/>/,
    () => `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta property="og:type" content=".*?"\s*\/>/,
    () => `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?"\s*\/>/,
    () => `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?"\s*\/>/,
    () => `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta name="twitter:description"[\s\S]*?\/>/,
    () => `<meta name="twitter:description" content="${safeDesc}" />`
  );

  // Inject canonical link, optional JSON-LD, and strictly scoped AdSense script before </head>
  const headExtras = [
    `  <link rel="canonical" href="${canonicalUrl}" />`,
    page.schema?.length ? `  ${renderJsonLd(page.schema)}` : '',
    page.adsense ? `  ${ADSENSE_SCRIPT_TAG}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  html = html.replace('</head>', () => `${headExtras}\n</head>`);

  // Inject styled static crawler-readable shell into #root
  const shellHtml = wrapPrerenderShell(page.content);
  html = html.replace('<div id="root"></div>', () => `<div id="root">${shellHtml}</div>`);

  return html;
}

function buildNotFoundHtml(template: string): string {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>404 — Page Not Found | Tagyfy Pro</title>`);
  html = html.replace(
    /<meta name="description"[\s\S]*?\/>/,
    () => `<meta name="description" content="The page you requested does not exist or has moved." />`
  );
  // Remove AdSense account meta tag on error screens and enforce noindex
  html = html.replace(/<meta name="google-adsense-account"[^>]*>\s*/g, '');
  html = html.replace(
    '</head>',
    () => `  <meta name="robots" content="noindex, nofollow" />\n</head>`
  );
  const notFoundBody = `
  <h1>404 — Page not found</h1>
  <p>The page you requested does not exist or has moved.</p>
  <ul>
    <li><a href="/">Back to Home</a></li>
    <li><a href="/blogs">Stock Contributor Knowledge Base</a></li>
    <li><a href="/metadata-checker">Free Metadata &amp; Compliance Checker</a></li>
    <li><a href="/metadata-limits">Marketplace Metadata Limits</a></li>
    <li><a href="/tool">Free Online Metadata Generator</a></li>
  </ul>`;
  const shellHtml = wrapPrerenderShell(notFoundBody);
  html = html.replace('<div id="root"></div>', () => `<div id="root">${shellHtml}</div>`);
  return html;
}

function buildSitemapXml(pages: PageSpec[]): string {
  const entries = pages
    .map((p) => {
      const loc = `${SITE_URL}${p.path === '/' ? '/' : p.path}`;
      const lastmod = p.lastmod || '2026-10-26';
      const changefreq = p.changefreq || 'monthly';
      const priority = p.priority || '0.7';
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

async function prerender() {
  const indexTemplatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexTemplatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const template = fs.readFileSync(indexTemplatePath, 'utf-8');

  PAGES.forEach((page) => {
    const html = buildPageHtml(template, page);
    const outPath =
      page.path === '/'
        ? path.join(DIST_DIR, 'index.html')
        : path.join(DIST_DIR, ...page.path.split('/'), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`✅ Prerendered: ${page.path}${page.adsense ? ' [AdSense editorial]' : ''}`);
  });

  // Emit real static 404.html (served by Vercel with HTTP 404 Not Found for unknown paths)
  const notFoundHtml = buildNotFoundHtml(template);
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf-8');
  console.log('✅ Prerendered: /404.html [noindex, zero ads]');

  // Sync sitemap.xml in both public/ and dist/ so repository and build never drift
  const sitemapXml = buildSitemapXml(PAGES);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`✅ Synced sitemap.xml (${PAGES.length} canonical URLs)`);

  console.log(`\n🎉 Prerendering complete! ${PAGES.length} pages + 404.html rendered.`);
}

prerender();
