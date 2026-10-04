import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from './src/data/blogPosts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');

// ─── Rich HTML content for each static page ────────────────────────────────
// This content mirrors the actual React-rendered page content so that
// crawlers (AdSense, Googlebot) that do NOT execute JavaScript can read
// the full page substance.  When React hydrates on the client, it safely
// overwrites this pre-rendered DOM.

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

<h2>Key Stats</h2>
<ul>
<li>50 keywords — SEO-ranked per asset</li>
<li>500+ files — batch process in one go</li>
<li>Less than 10 seconds per asset, end to end</li>
<li>6 AI models — choose what you use</li>
<li>100% private — no file uploads ever</li>
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

<h2>What Contributors Say — Real Results from Real Stock Creators</h2>
<p>Join hundreds of stock contributors who have stopped doing metadata manually.</p>
<blockquote><p>"I used to spend 2-3 hours manually entering titles and keywords for every batch upload. Tagyfy Pro does the same work in minutes. It is honestly embarrassing how much time I wasted before." — Ahmed K., Adobe Stock Contributor, 1,200+ files</p></blockquote>
<blockquote><p>"The API rate limit protection is a game-changer for me — I process huge folders and other tools would always crash. This handles API rotation perfectly without dropping any assets." — Sara M., Shutterstock and Freepik Contributor</p></blockquote>
<blockquote><p>"The trademark sniffer alone saved me from several rejections. I had no idea how many brand names were slipping into my keywords. Now every upload goes through clean." — Tariq R., Stock Vector Designer, 3,000+ vectors</p></blockquote>

<h2>A Few Quick Questions</h2>
<p>The four questions new visitors ask most. See the full, searchable FAQ page for licensing, rate limits, trademark detection, and more.</p>
<h3>Does Tagyfy Pro embed metadata directly into files?</h3>
<p>Yes — natively, with no extra software. Adobe Stock, Shutterstock, and other marketplaces pick up the written IPTC/XMP data the moment you upload.</p>
<h3>Which AI providers are supported?</h3>
<p>Google Gemini, OpenAI GPT-4o, Groq, Mistral AI, and OpenRouter, with automatic key rotation across multiple API keys.</p>
<h3>Is my API key safe inside the app?</h3>
<p>Yes. API keys are stored locally on your own PC and are never sent to Tagyfy Pro servers.</p>
<h3>How does the licensing work?</h3>
<p>Four plans are available — 1 Month, 3 Months, 6 Months, and 1 Year — and you are never billed per generation.</p>

<h2>Adobe Stock Chrome Extension — 100% Free</h2>
<p>Update approved assets and generate fresh metadata directly inside the Adobe Stock contributor dashboard using Gemini, ChatGPT, Groq, and Mistral. 100% free with no license required.</p>

<h2>Ready to automate your stock metadata?</h2>
<p>Start generating high-ranking metadata online for free right in your browser, or download the Windows Desktop app for 100% native vector and video embedding.</p>
`;

const CONTENT_ABOUT = `
<h1>About Us — Our Mission and Story</h1>
<p>Empowering Stock Media Creators with AI Precision. We built Tagyfy Pro to solve the single most frustrating bottleneck in digital asset licensing: spending hours manually tagging, describing, and embedding metadata into thousands of stock media files.</p>

<h2>The Problem We Solved</h2>
<p>Stock contributors lose up to 70% of their creative time writing repetitive titles and searching for 50 high-ranking keywords. Even worse, many web tools do not embed IPTC/XMP data directly into binary formats like Adobe Illustrator (.AI), EPS vectors, or MP4 videos, forcing creators to waste more time with clumsy CSV spreadsheets.</p>

<h2>The Tagyfy Solution</h2>
<p>Tagyfy Pro is a desktop-native application engineered with modern Rust and React. It brings together state-of-the-art vision models (Google Gemini 2.5/3.5, OpenAI GPT-4o, Groq, Mistral) and high-speed native binary embedding pipelines to automatically analyze, describe, and directly write metadata into files in bulk.</p>

<h2>Why Creators Trust Us</h2>
<h3>100% Privacy-First</h3>
<p>Your media files and API keys never touch our servers. Everything is processed locally on your PC.</p>
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
<h1>Pricing and License Plans — Tagyfy Pro</h1>
<p>Simple pricing. Choose a plan that fits your workflow. Transparent pricing with no hidden fees, free 3-day trial, and a 100% free Chrome extension for all contributors.</p>
<p>Compatible with Adobe Stock, Shutterstock, Dreamstime, and Freepik.</p>

<h2>License Plans</h2>
<h3>Starter — 1 Month</h3>
<p>Price: $1.75 USD / Rs 499 PKR. Full metadata generation, bulk processing, embed into files, and platform-ready CSVs for Adobe Stock, Shutterstock, Dreamstime, and Freepik. Native file metadata embedding included.</p>

<h3>Creator — 3 Months</h3>
<p>Price: $4.73 USD / Rs 1,347 PKR. All Starter features plus extended access. Save 10% compared to monthly billing. Native file metadata embedding included.</p>

<h3>Pro — 6 Months</h3>
<p>Price: $8.93 USD / Rs 2,546 PKR. All Starter features plus extended access. Save 15% compared to monthly billing. Native file metadata embedding included.</p>

<h3>Studio — 1 Year (Most Popular)</h3>
<p>Price: $16.82 USD / Rs 4,790 PKR. All Starter features plus a full year of access. Save 20% compared to monthly billing. Native file metadata embedding included.</p>

<h2>All Plans Include</h2>
<ul>
<li>Native File Metadata Embedding (IPTC/XMP directly into files)</li>
<li>Platform-ready CSVs for Adobe Stock, Shutterstock, Dreamstime, and Freepik</li>
<li>Full metadata generation with AI vision analysis</li>
<li>Bulk processing of hundreds of files at once</li>
<li>Direct embed into JPG, PNG, EPS, AI, SVG, MP4 files</li>
</ul>

<h2>Free Chrome Extension</h2>
<p>Looking for browser automation? The Tagyfy Pro Chrome Extension for Adobe Stock is completely 100% FREE for all contributors. No license key needed! Direct in-browser tagging, update approved assets, free forever.</p>

<h2>Buy with Confidence</h2>
<p>Straightforward terms for every license, with no hidden conditions.</p>
<ul>
<li><strong>3-Day Free Trial:</strong> Every plan starts with a full-access trial. No credit card required to test the complete feature set.</li>
<li><strong>Instant License Delivery:</strong> Keys are generated and sent within minutes of payment confirmation.</li>
<li><strong>7-Day Technical Refund:</strong> If our team can't resolve a technical incompatibility within 7 days of purchase, you get a full refund.</li>
<li><strong>One License, One Device:</strong> Simple, transparent licensing. No recurring charges, no auto-renewal surprises.</li>
</ul>

<p>Early adopter pricing — prices will increase as features expand.</p>
`;

const CONTENT_DOWNLOAD = `
<h1>Download Tagyfy Pro for Windows</h1>
<p>Download the Tagyfy Pro desktop application for Windows 10 and 11. Full-access 3-day free trial with AI-powered metadata generation and direct file embedding.</p>

<h2>System Requirements</h2>
<ul>
<li>Operating System: Windows 10 or Windows 11 (64-bit)</li>
<li>RAM: 4 GB minimum, 8 GB recommended</li>
<li>Disk Space: 200 MB for installation</li>
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
<h1>Contact and Support — Tagyfy Pro</h1>
<p>Get help with Tagyfy Pro license keys, bulk processing, or technical support. Reach our team directly for fast assistance with your stock metadata workflow.</p>

<h2>How to Reach Us</h2>
<h3>WhatsApp Support (Fastest)</h3>
<p>Message us directly on WhatsApp at +92 325 9640429 for the fastest response. Available for license purchases, technical issues, and general questions.</p>

<h3>Email Support</h3>
<p>Send us an email at alhamdstudio839@gmail.com. We typically respond within 2 to 6 hours during business days.</p>

<h2>What We Can Help With</h2>
<ul>
<li>License key activation and renewal</li>
<li>Technical issues and troubleshooting</li>
<li>Bulk processing and batch workflow guidance</li>
<li>AI API key setup (Gemini, OpenAI, Groq, Mistral)</li>
<li>CSV export format questions for Adobe Stock, Shutterstock, Freepik</li>
<li>Feature requests and feedback</li>
<li>Refund requests</li>
</ul>

<h2>Response Time</h2>
<p>WhatsApp messages are typically answered within 1-2 hours. Email inquiries are responded to within 2-6 hours during business days. We are committed to providing fast, helpful support to all our users.</p>
`;

const CONTENT_FAQ = `
<h1>Frequently Asked Questions — Tagyfy Pro</h1>
<p>Everything you need to know before getting started with Tagyfy Pro metadata generator.</p>

<h2>Does Tagyfy Pro embed metadata directly into files?</h2>
<p>Yes. Tagyfy Pro embeds metadata directly into your files — no extra software required. This works for JPG, PNG, EPS, AI, SVG, MP4, MOV, and more. Stock platforms read the embedded data automatically on upload.</p>

<h2>Will stock platforms automatically detect this metadata?</h2>
<p>Yes. Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF, and Vecteezy all read embedded metadata during upload. Your title and keywords will auto-populate without any manual entry.</p>

<h2>Which AI providers are supported?</h2>
<p>Tagyfy Pro supports 5 AI providers: Google Gemini (Flash and Pro), OpenAI GPT-4o, Groq (Llama 4 Scout), Mistral AI, and OpenRouter (300+ models including free ones). You can add multiple API keys and the system automatically rotates between them when rate limits are hit.</p>

<h2>Are there any hard limits on how many files I can process at once?</h2>
<p>No, there are no artificial limits. You can drag and drop folders containing hundreds or thousands of files. The speed of processing depends entirely on your API providers and how many API keys you have added. Tagyfy Pro handles the queueing smoothly.</p>

<h2>What happens when my API key hits a rate limit?</h2>
<p>The system has an automatic key rotation engine. When one key hits its rate limit, it is placed in a short cooldown and the next available key is tried immediately — following a priority waterfall across all your configured providers. You never see a failed generation just because one key is temporarily limited.</p>

<h2>What is the Trademark Sniffer?</h2>
<p>It is a built-in compliance system that automatically detects and removes brand names from generated keywords. It has a list of 100+ trademarks and replaces them with generic equivalents — for example iPhone becomes modern smartphone with touchscreen. This prevents stock platform rejections caused by trademarked terms.</p>

<h2>What are Confidence Scores and Risk Analysis?</h2>
<p>Every generated metadata set includes a confidence score (0-100) broken down into four dimensions: subject clarity, keyword precision, differentiator strength, and compliance safety. Risk Analysis flags potential reasons a stock reviewer might reject the asset — such as editorial content or brand mentions — with a severity level. Platform Readiness tells you if each asset is READY, NEEDS REVIEW, or NOT READY for Adobe Stock, Freepik, and Shutterstock individually.</p>

<h2>What is Series Mode?</h2>
<p>Series Mode is for assets that belong together — for example, 10 variations of the same icon set. When enabled, the AI appends Part 01, Part 02, etc. to titles and maintains consistent keywords across the entire series, while slightly varying the visual description for each part.</p>

<h2>How does the CSV export work?</h2>
<p>Tagyfy Pro generates platform-specific CSV files verified against the official upload specs for Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF, and Vecteezy. Each platform gets the correct column headers, category IDs, and keyword formatting. No truncation is ever applied — your full keyword list and title are always exported.</p>

<h2>Is my API key safe inside the app?</h2>
<p>Yes. Your API keys are stored locally on your own PC using encrypted storage — they are never sent to Tagyfy Pro servers because there are no Tagyfy Pro servers. The app calls AI providers (Gemini, OpenAI, etc.) directly from your machine, just like a browser would. Tagyfy Pro never sees, logs, or transmits your keys.</p>

<h2>How does the licensing work?</h2>
<p>Tagyfy Pro is available in four plans: 1 Month, 3 Months, 6 Months, and 1 Year. You purchase a license key for your chosen duration — when it expires you can renew at any time. The AI generation uses your own API keys (which have their own free tiers — Gemini offers a generous free quota). You are never billed per generation by Tagyfy Pro.</p>
`;

const CONTENT_TUTORIALS = `
<h1>Tutorials and Video Guides — Tagyfy Pro</h1>
<p>Step-by-step video tutorials showing how to generate high-converting metadata, embed IPTC data into files, and use the Tagyfy Pro desktop app and Chrome extension.</p>

<h2>Getting Started</h2>
<p>Learn how to set up Tagyfy Pro, add your AI API keys, and start generating metadata for your stock media files in minutes.</p>

<h3>How to Get a Free Gemini API Key</h3>
<p>Visit Google AI Studio at aistudio.google.com/apikey and generate a free Gemini API key in 30 seconds. This key gives you access to Gemini Flash and Pro models for metadata generation.</p>

<h3>How to Process Your First Batch</h3>
<p>Drag and drop your image or video files into Tagyfy Pro. Select your preferred AI model. Click generate. The AI will analyze each file and produce SEO-optimized titles, descriptions, and up to 50 ranked keywords.</p>

<h3>How to Embed Metadata into Files</h3>
<p>After generating metadata, click the embed button to write IPTC/XMP data directly into your JPG, PNG, EPS, AI, SVG, and MP4 files. When you upload these files to Adobe Stock, Shutterstock, or Freepik, the metadata auto-populates.</p>

<h3>How to Export Platform-Specific CSVs</h3>
<p>Go to the export section and select your target platform. Tagyfy Pro generates correctly formatted CSV files for Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF, and Vecteezy with the exact column headers and formatting each platform requires.</p>

<h3>How to Use the Chrome Extension</h3>
<p>Install the free Tagyfy Pro Chrome Extension, navigate to your Adobe Stock contributor dashboard, and let the extension auto-fill titles and keywords directly in your browser. Works for both new uploads and approved assets.</p>

<h2>Advanced Features</h2>
<p>Explore bulk editing, trademark sniffer, series mode, event context, confidence scoring, and quality checks in our advanced tutorial guides.</p>
`;

const CONTENT_BLOGS = `
<h1>Blog — Stock Contributor Knowledge Base</h1>
<p>In-depth guides, marketplace compliance rules, and advanced metadata SEO strategies to help stock media contributors scale their passive earnings on Adobe Stock and beyond.</p>

<h2>Latest Articles</h2>
`;

const CONTENT_CHROME_EXTENSION = `
<h1>Free Adobe Stock Chrome Extension — Tagyfy Pro</h1>
<p>100% free Chrome extension for Adobe Stock contributors. Update approved assets and generate fresh metadata directly inside the contributor dashboard using Gemini, ChatGPT, Groq, and Mistral. No license key required.</p>

<h2>Key Features</h2>
<h3>Revive Approved Assets</h3>
<p>Update titles and keywords on existing approved photos to boost search ranking and revive stalled sales.</p>
<h3>Auto-Tag New Uploads</h3>
<p>Generate commercial titles and 50 high-converting keywords automatically for newly uploaded batches.</p>
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
<p>No. The extension only fills standard form fields (Title and Keywords) on your dashboard just as if you were typing them manually. It adheres strictly to Adobe Stock metadata compliance guidelines.</p>
<h3>What is the difference between this extension and the Desktop Software?</h3>
<p>The Chrome Extension works inside your browser to auto-fill metadata on Adobe Stock. The Tagyfy Pro Desktop App is a dedicated native workstation software that embeds metadata directly into EPS, AI, JPG, PNG, and Video files with zero platform limits.</p>
`;

const CONTENT_TOOL = `
<h1>Free Online Metadata Generator Tool — Tagyfy Pro</h1>
<p>Generate optimized titles and keywords for your stock photos, vectors, and videos directly in your browser. Free AI-powered metadata tool with no signup required.</p>

<h2>How to Use the Free Online Tool</h2>
<ol>
<li>Upload your image or video file directly in your browser</li>
<li>Enter your free AI API key (Gemini, OpenAI, Groq, or Mistral)</li>
<li>Click Generate to analyze your file with AI vision</li>
<li>Get SEO-optimized title, description, and up to 50 ranked keywords</li>
<li>Copy the metadata or export as CSV for your stock platform</li>
</ol>

<h2>Supported Formats</h2>
<p>The online tool supports JPG, JPEG, PNG, WebP images and MP4 video files. For vector formats (EPS, AI, SVG) and direct IPTC/XMP file embedding, use the Tagyfy Pro Desktop Application.</p>

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
<p>Stock media contributors spend hours manually writing titles and keywords. This free tool uses advanced AI vision models to analyze your images and videos, then generates commercially optimized metadata that ranks higher in stock marketplace search results. All processing happens in your browser — your files are never uploaded to any server.</p>

<h2>Need More Power?</h2>
<p>For batch processing of 500+ files, direct IPTC/XMP embedding into files, vector format support, trademark sniffer, and platform-specific CSV exports, download the Tagyfy Pro Desktop Application for Windows with a free 3-day trial.</p>
`;

const CONTENT_PRIVACY = `
<h1>Privacy Policy — Tagyfy Pro</h1>
<p>Last Updated: August 17, 2026. Effective Date: January 1, 2026.</p>

<h2>1. Overview and Commitment to Privacy</h2>
<p>Welcome to Tagyfy Pro (formerly VisionMetadata Pro), accessible from tagyfy.com. We are deeply committed to protecting your personal privacy. This Privacy Policy outlines what information we collect, how we process it, and how we ensure your complete confidentiality when using our website and desktop software.</p>

<h2>2. Zero Server Storage (Local-First Architecture)</h2>
<p>Our desktop application is engineered with a strict Local-First and Client-Side security paradigm:</p>
<ul>
<li><strong>Your Images and Media Files:</strong> Your stock photos, vector files (.AI, .EPS, .SVG), and video files (.MP4, .MOV) are processed and embedded locally on your device. We never upload, store, or view your original creative assets.</li>
<li><strong>Your AI API Keys:</strong> API keys (Google Gemini, OpenAI, Groq, Mistral) are stored in your device's local encrypted storage using Windows DPAPI / safeStorage. They are never sent to or logged on our servers.</li>
</ul>

<h2>3. Cookies, Web Beacons and Analytics</h2>
<p>Like most professional websites, tagyfy.com uses standard cookies to enhance user navigation and analyze aggregate traffic patterns. We use Google Analytics (GA4) to collect anonymized website performance statistics (e.g., page views, visit durations, browser types). Google Analytics does not collect personally identifiable information (PII). You can prevent Google Analytics from tracking your visits by installing the Google Analytics Opt-out Browser Add-on.</p>

<h2>4. Google AdSense and Third-Party Advertising</h2>
<p>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites on the Internet. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting aboutads.info.</p>

<h2>5. Information You Voluntarily Provide</h2>
<p>When you contact us via our contact form, email, or WhatsApp for technical support or license purchases, we may receive your name, email address, and message contents. We only use this information to respond to your inquiries, deliver license keys, and provide customer support. We never sell, rent, or trade your contact information.</p>

<h2>6. Data Protection Rights (GDPR and CCPA)</h2>
<p>Under applicable data protection laws, you have the right to request access to your data, request data erasure, and object to processing. Because our software does not store user media on central servers, most data is already under your exclusive physical control on your computer.</p>

<h2>7. Contact Our Privacy Team</h2>
<p>If you have questions regarding this Privacy Policy or wish to exercise any data rights, please contact us: Email: alhamdstudio839@gmail.com. WhatsApp Support: +92 325 9640429. Website: tagyfy.com.</p>
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
<p>For legal questions, licensing inquiries, or enterprise permissions, contact us: Email: alhamdstudio839@gmail.com. WhatsApp: +92 325 9640429.</p>
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
<li>Email Support: alhamdstudio839@gmail.com</li>
<li>Response Time: Typically within 2 to 6 hours.</li>
</ul>
`;


// ─── Page definitions ──────────────────────────────────────────────────────

const PAGES: { path: string; title: string; desc: string; content?: string }[] = [
  { path: '/', title: 'Tagyfy Pro | AI-Powered Metadata Generator for Adobe Stock', desc: 'Generate, optimize, and embed titles, descriptions, and keywords into your stock images, vectors, and videos in bulk using AI. Free online tool and Windows desktop app.', content: CONTENT_HOME },
  { path: '/about', title: 'About Us — Our Mission & Story | Tagyfy Pro', desc: 'Learn about Tagyfy Pro, the AI-powered metadata generator built to help stock media contributors automate titles, keywords, and IPTC embedding for Adobe Stock, Shutterstock, and Freepik.', content: CONTENT_ABOUT },
  { path: '/features', title: 'Features — Batch Processing, Trademark Filter & More | Tagyfy Pro', desc: 'Explore Tagyfy Pro features: multi-AI vision analysis, batch metadata generation, direct IPTC/XMP embedding, trademark sniffer, confidence scoring, and platform-specific CSV exports.', content: CONTENT_FEATURES },
  { path: '/pricing', title: 'Pricing & License Plans | Tagyfy Pro', desc: 'Transparent pricing for Tagyfy Pro with lifetime and monthly license options. No hidden fees, free 3-day trial, and a 100% free Chrome extension for all contributors.', content: CONTENT_PRICING },
  { path: '/download', title: 'Download Tagyfy Pro for Windows | Free Trial', desc: 'Download the Tagyfy Pro desktop application for Windows 10 and 11. Full-access 3-day free trial with AI-powered metadata generation and direct file embedding.', content: CONTENT_DOWNLOAD },
  { path: '/contact', title: 'Contact & Support | Tagyfy Pro', desc: 'Get help with Tagyfy Pro license keys, bulk processing, or technical support. Reach our team directly for fast assistance with your stock metadata workflow.', content: CONTENT_CONTACT },
  { path: '/faq', title: 'Frequently Asked Questions | Tagyfy Pro', desc: 'Answers to common questions about Tagyfy Pro: supported AI providers, file formats, trademark detection, batch processing, CSV exports, API key safety, and licensing.', content: CONTENT_FAQ },
  { path: '/tutorials', title: 'Tutorials & Video Guides | Tagyfy Pro', desc: 'Step-by-step video tutorials showing how to generate high-converting metadata, embed IPTC data into files, and use the Tagyfy Pro desktop app and Chrome extension.', content: CONTENT_TUTORIALS },
  { path: '/blogs', title: 'Blog — Stock Contributor Knowledge Base | Tagyfy Pro', desc: 'In-depth guides, marketplace compliance rules, and advanced metadata SEO strategies to help stock media contributors scale their passive earnings on Adobe Stock and beyond.', content: CONTENT_BLOGS },
  { path: '/chrome-extension', title: 'Free Adobe Stock Chrome Extension | Tagyfy Pro', desc: '100% free Chrome extension for Adobe Stock contributors. Update approved assets and generate fresh metadata directly inside the contributor dashboard using Gemini, ChatGPT, Groq, and Mistral.', content: CONTENT_CHROME_EXTENSION },
  { path: '/tool', title: 'Free Online Metadata Generator Tool | Tagyfy Pro', desc: 'Generate optimized titles and keywords for your stock photos, vectors, and videos directly in your browser. Free AI-powered metadata tool with no signup required.', content: CONTENT_TOOL },
  { path: '/privacy-policy', title: 'Privacy Policy | Tagyfy Pro', desc: 'Tagyfy Pro privacy policy. Learn how we handle your data, API keys, and media files. All processing happens locally on your device — your files never touch our servers.', content: CONTENT_PRIVACY },
  { path: '/terms', title: 'Terms of Service | Tagyfy Pro', desc: 'Terms and conditions for using Tagyfy Pro desktop application, web tool, and Chrome extension. Read our service agreement, license terms, and usage policies.', content: CONTENT_TERMS },
  { path: '/refund-policy', title: 'Refund Policy | Tagyfy Pro', desc: 'Tagyfy Pro refund policy. Understand our refund process, eligibility criteria, and how to request a refund for your license purchase.', content: CONTENT_REFUND }
];

// ─── Add blog post summaries to the /blogs listing page ────────────────────
let blogListHtml = CONTENT_BLOGS;
BLOG_POSTS.forEach(post => {
  blogListHtml += `<h3><a href="/blog/${post.slug}">${post.title}</a></h3>`;
  blogListHtml += `<p><em>${post.category} · ${post.readTime} · ${post.publishDate}</em></p>`;
  blogListHtml += `<p>${post.summary}</p>`;
});
const blogsPage = PAGES.find(p => p.path === '/blogs');
if (blogsPage) blogsPage.content = blogListHtml;

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
    content: contentHtml
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
