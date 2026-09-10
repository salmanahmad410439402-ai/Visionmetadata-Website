import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from './src/data/blogPosts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');

// Define standard pages
const PAGES = [
  { path: '/', title: 'Tagyfy Pro | AI-Powered Metadata Generator for Adobe Stock', desc: 'Generate, optimize, and embed titles, descriptions, and keywords into your stock images, vectors, and videos in bulk using AI. Free online tool and Windows desktop app.' },
  { path: '/about', title: 'About Us — Our Mission & Story | Tagyfy Pro', desc: 'Learn about Tagyfy Pro, the AI-powered metadata generator built to help stock media contributors automate titles, keywords, and IPTC embedding for Adobe Stock, Shutterstock, and Freepik.' },
  { path: '/features', title: 'Features — Batch Processing, Trademark Filter & More | Tagyfy Pro', desc: 'Explore Tagyfy Pro features: multi-AI vision analysis, batch metadata generation, direct IPTC/XMP embedding, trademark sniffer, confidence scoring, and platform-specific CSV exports.' },
  { path: '/pricing', title: 'Pricing & License Plans | Tagyfy Pro', desc: 'Transparent pricing for Tagyfy Pro with lifetime and monthly license options. No hidden fees, free 3-day trial, and a 100% free Chrome extension for all contributors.' },
  { path: '/download', title: 'Download Tagyfy Pro for Windows | Free Trial', desc: 'Download the Tagyfy Pro desktop application for Windows 10 and 11. Full-access 3-day free trial with AI-powered metadata generation and direct file embedding.' },
  { path: '/contact', title: 'Contact & Support | Tagyfy Pro', desc: 'Get help with Tagyfy Pro license keys, bulk processing, or technical support. Reach our team directly for fast assistance with your stock metadata workflow.' },
  { path: '/faq', title: 'Frequently Asked Questions | Tagyfy Pro', desc: 'Answers to common questions about Tagyfy Pro: supported AI providers, file formats, trademark detection, batch processing, CSV exports, API key safety, and licensing.' },
  { path: '/tutorials', title: 'Tutorials & Video Guides | Tagyfy Pro', desc: 'Step-by-step video tutorials showing how to generate high-converting metadata, embed IPTC data into files, and use the Tagyfy Pro desktop app and Chrome extension.' },
  { path: '/blogs', title: 'Blog — Stock Contributor Knowledge Base | Tagyfy Pro', desc: 'In-depth guides, marketplace compliance rules, and advanced metadata SEO strategies to help stock media contributors scale their passive earnings on Adobe Stock and beyond.' },
  { path: '/chrome-extension', title: 'Free Adobe Stock Chrome Extension | Tagyfy Pro', desc: '100% free Chrome extension for Adobe Stock contributors. Update approved assets and generate fresh metadata directly inside the contributor dashboard using Gemini, ChatGPT, Groq, and Mistral.' },
  { path: '/tool', title: 'Free Online Metadata Generator Tool | Tagyfy Pro', desc: 'Generate optimized titles and keywords for your stock photos, vectors, and videos directly in your browser. Free AI-powered metadata tool with no signup required.' },
  { path: '/privacy-policy', title: 'Privacy Policy | Tagyfy Pro', desc: 'Tagyfy Pro privacy policy. Learn how we handle your data, API keys, and media files. All processing happens locally on your device — your files never touch our servers.' },
  { path: '/terms', title: 'Terms of Service | Tagyfy Pro', desc: 'Terms and conditions for using Tagyfy Pro desktop application, web tool, and Chrome extension. Read our service agreement, license terms, and usage policies.' },
  { path: '/refund-policy', title: 'Refund Policy | Tagyfy Pro', desc: 'Tagyfy Pro refund policy. Understand our refund process, eligibility criteria, and how to request a refund for your license purchase.' }
];

// Add blogs dynamically
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

    // Inject Content into root for AdSense crawler to read text
    const injection = page.content ? page.content : `<h1>${page.title}</h1><p>${page.desc}</p>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${injection}</div>`);

    // Write File
    const outPath = page.path === '/'
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, ...page.path.split('/'), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`✅ Prerendered (Lightweight API): ${page.path}`);
  });

  console.log(`\n🎉 Ultra-fast Prerendering complete! ${PAGES.length} pages rendered.`);
}

prerender();
