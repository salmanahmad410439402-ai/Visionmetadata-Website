/**
 * Single source of truth for the FAQ.
 *
 * Both the React page (components/FAQSection.tsx) and the prerender step
 * (prerender.ts) read this list. They were previously maintained as two
 * separate hard-coded copies, which meant the static HTML served to
 * non-JavaScript crawlers fell behind the live page — a page can look
 * comprehensive in a browser and thin in the crawled source. Import from here
 * instead of copying answers anywhere else.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQS: FaqEntry[] = [
    {
        question: "Does Tagyfy Pro embed metadata directly into files?",
        answer: "Yes. Tagyfy Pro writes supported IPTC/XMP fields into compatible files. Many stock workflows can read that metadata on upload, but behavior varies by file format and marketplace, so confirm the current platform requirements.",
    },
    {
        question: "Will stock platforms automatically detect this metadata?",
        answer: "Many stock workflows can read supported embedded metadata during upload, but behavior varies by file format and marketplace. Confirm the current platform requirements and review the title and keywords before submitting.",
    },
    {
        question: "Which AI providers are supported?",
        answer: "Tagyfy Pro supports 4 AI providers: Google Gemini (Flash-Lite), OpenAI (GPT-4o & GPT-4o Mini), Groq (Qwen 3.8 Vision), and Mistral AI. You can add multiple API keys and the system automatically rotates between them when rate limits are hit.",
    },
    {
        question: "Are there any hard limits on how many files I can process at once?",
        answer: "No, there are no artificial limits. You can drag and drop folders containing hundreds or thousands of files. The speed of processing depends entirely on your API providers and how many API keys you have added. Tagyfy Pro handles the queueing smoothly.",
    },
    {
        question: "What happens when my API key hits a rate limit?",
        answer: "The system has an automatic key rotation engine. When one key hits its rate limit, it's placed in a short cooldown and the next available key is tried immediately — following a priority waterfall across all your configured providers. You never see a failed generation just because one key is temporarily limited.",
    },
    {
        question: "What is the Trademark Sniffer?",
        answer: "It is a built-in compliance check that scans generated titles and keywords against 90+ common brand names and product-line patterns, replacing flagged terms with generic equivalents — for example 'iPhone' becomes 'modern smartphone with touchscreen'. Always perform your own final check as well, since new trademarks appear constantly and text checks do not inspect image pixels.",
    },
    {
        question: "What are Confidence Scores and Risk Analysis?",
        answer: "Every generated metadata set includes a confidence score (0–100) broken down into four dimensions: subject clarity, keyword precision, differentiator strength, and compliance safety. Risk Analysis flags potential reasons a stock reviewer might reject the asset — such as editorial content or brand mentions — with a severity level. Platform Readiness tells you if each asset is READY, NEEDS REVIEW, or NOT READY for Adobe Stock, Freepik, and Shutterstock individually.",
    },
    {
        question: "What is Series Mode?",
        answer: "Series Mode is for assets that belong together — for example, 10 variations of the same icon set. When enabled, the AI appends 'Part 01', 'Part 02', etc. to titles and maintains consistent keywords across the entire series, while slightly varying the visual description for each part.",
    },
    {
        question: "How does the CSV export work?",
        answer: "Tagyfy Pro generates platform-specific CSV files for Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF and Vecteezy, each with that platform's column headers, category IDs and keyword delimiter. The export does not truncate your list — what you see in the editor is what is written to the file. The caps are the marketplaces' own, not the tool's: Adobe Stock accepts 49 keywords per asset and the others accept 50, and a submission over the limit is rejected at upload. Check the keyword count per platform on the metadata limits page before you export, and set the keyword target accordingly in Settings.",
    },
    {
        question: "Is my API key safe inside the app?",
        answer: "For the Windows app, keys stay in local encrypted storage and requests go directly to the provider you choose. The browser tool keeps a key locally only when you opt in and sends the selected file directly to that AI provider; Tagyfy does not proxy or store the media.",
    },
    {
        question: "How does the licensing work?",
        answer: "Tagyfy Pro is available in four plans: 1 Month, 3 Months, 6 Months, and 1 Year. You purchase a license key for your chosen duration — when it expires you can renew at any time. The AI generation uses your own API keys (which have their own free tiers — Gemini offers a generous free quota). You are never billed per generation by Tagyfy Pro.",
    },
    {
        question: "Do I need a Tagyfy account to use the software?",
        answer: "No. There is no Tagyfy login, no dashboard and no cloud library. You install the app, add your own AI provider key, and work with your files locally. Because there is no account, there is nothing for us to store about your assets — but it also means your settings and licence live on your machine, so keep a note of your key.",
    },
    {
        question: "How many devices can one licence cover?",
        answer: "One licence covers one device. That is stated up front rather than buried in the terms, and it is why there is no recurring subscription: you buy a key for a chosen duration, use it on your machine, and there is no auto-renewal to cancel.",
    },
    {
        question: "What is the refund policy?",
        answer: "If a technical problem on your machine cannot be resolved by our support team within 7 days of purchase, you get a full refund. Accidental duplicate orders are refunded immediately. Change of mind after the licence has been actively used beyond that window is not covered. Full details, including how to submit a request, are on the Refund Policy page.",
    },
    {
        question: "Is using AI-generated metadata allowed by the marketplaces?",
        answer: "Marketplaces generally permit AI assistance with metadata preparation, but they hold the contributor responsible for accuracy, for the correctness of the submitted keywords and title, and — for AI-generated artwork — for declaring generative AI content where their rules require it. Tagyfy Pro can add generative-AI disclosure keywords to a batch, but the decision about what to declare always belongs to you, not to the tool.",
    },
    {
        question: "Why did a marketplace not read my embedded metadata?",
        answer: "Support for embedded fields varies by file type and by platform, and some pipelines strip or ignore specific blocks. Troubleshoot in this order: confirm the file type is on the platform's list, confirm the marketplace currently reads that field for that file type, and try the platform's own CSV import as a fallback. Tagyfy Pro never applies truncation to your exported list, so a CSV mismatch is usually a column mapping problem rather than lost data.",
    },
    {
        question: "Does the trademark sniffer replace a manual check?",
        answer: "No, and it is not sold as one. It holds a list of commonly flagged brand names and substitutes generic wording for them. That catches the obvious cases fast, but new trademarks appear constantly and a brand can be problematic in a context the list does not cover, so the last check before submission should still be yours.",
    },
    {
        question: "Can I use the browser tool instead of installing anything?",
        answer: "Yes, for images. The browser tool generates titles, descriptions and keywords and lets you export them, with no installation and no Tagyfy account. It cannot write metadata into vector or video files, and it sends the selected image to the AI provider you choose for analysis, so use the desktop app when files must stay on your machine or when you need in-file embedding for EPS, AI, SVG, MP4 or MOV.",
    },
    {
        question: "How do I report an error or a wrong claim on this website?",
        answer: "Send the page URL and what looks wrong through the Contact form. We correct factual errors in guides and documentation, and the page's revision date is updated when we do. If a claim on this site cannot be supported, we would rather remove it than leave it standing.",
    },
];
