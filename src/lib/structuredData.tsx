import { Helmet } from "react-helmet-async";
import { SELLER } from "@/config/commerce";

/**
 * Structured data (JSON-LD).
 *
 * The site previously shipped none, which meant Google had only prose to work
 * out what each URL was: no product, no organisation, no article authorship, no
 * FAQ structure. Search Console reported nothing it could build rich results
 * from, and every page competed on body text alone.
 *
 * These components emit schema.org markup for the things this site actually is.
 * A deliberate rule applies throughout: only assert facts that are true and
 * checkable. So there is no aggregateRating (we have no collected ratings), no
 * review markup (we publish none), no invented price ranges, and the offer
 * price is the live price from the pricing page.
 */

const SITE = "https://tagyfy.com";

interface JsonLdProps {
  /** The schema object(s) to emit. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Renders one or more JSON-LD blocks into the document head. */
export const JsonLd = ({ data }: JsonLdProps) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

/**
 * Site-wide organisation and website markup. Rendered once, from App, so every
 * page carries it.
 */
export const organisationSchema = () => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tagyfy Pro",
    url: SITE,
    logo: `${SITE}/icon.jpg`,
    description:
      "AI-assisted metadata generation and embedding software for stock media contributors.",
    email: SELLER.supportEmail,
    founder: {
      "@type": "Person",
      name: SELLER.operator,
      jobTitle: "Stock contributor and software developer",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SELLER.supportEmail,
        availableLanguage: ["en", "ur"],
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tagyfy Pro",
    url: SITE,
  },
];

/**
 * The desktop application. Prices mirror the pricing page; there is no
 * aggregateRating or review block because we do not collect either.
 */
export const softwareSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Tagyfy Pro",
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Stock media metadata tool",
  operatingSystem: "Windows 10, Windows 11 (64-bit)",
  softwareVersion: "1.3.6",
  fileSize: "160MB",
  url: SITE,
  downloadUrl: `${SITE}/download`,
  description:
    "Desktop application that generates titles, descriptions and keywords for stock media using AI vision models, and writes IPTC/XMP metadata directly into image, vector and video files.",
  featureList: [
    "AI vision analysis for titles, descriptions and keywords",
    "Direct IPTC/XMP embedding into supported image, vector and video files",
    "Batch processing with parallel workers",
    "CSV exports for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF and Vecteezy",
    "Bring-your-own-key support for Google Gemini, OpenAI, Groq and Mistral AI",
  ],
  offers: [
    { name: "Starter — 1 month", price: "1.75", priceCurrency: "USD", "@type": "Offer" },
    { name: "Creator — 3 months", price: "4.73", priceCurrency: "USD", "@type": "Offer" },
    { name: "Pro — 6 months", price: "8.93", priceCurrency: "USD", "@type": "Offer" },
    { name: "Studio — 12 months", price: "16.82", priceCurrency: "USD", "@type": "Offer" },
  ],
});

/** A blog article, attributed to its named author. */
export const articleSchema = (post: {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  publishDate: string;
  updatedDate?: string;
  category: string;
  tags: string[];
  author: { name: string; role: string };
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.subtitle || post.summary,
  url: `${SITE}/blog/${post.slug}`,
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${post.slug}` },
  articleSection: post.category,
  keywords: post.tags.join(", "),
  datePublished: post.publishDate,
  dateModified: post.updatedDate || post.publishDate,
  author: {
    "@type": "Person",
    name: post.author.name,
    jobTitle: post.author.role,
  },
  publisher: {
    "@type": "Organization",
    name: "Tagyfy Pro",
    url: SITE,
  },
});

/** FAQ markup, generated from the same data the page renders. */
export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

/** Generic breadcrumb trail. */
export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${SITE}${item.path}`,
  })),
});

/** A free web tool, distinct from the paid desktop application. */
export const webAppSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tagyfy Pro free online metadata generator",
  url: `${SITE}/tool`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any modern browser",
  description:
    "Browser-based stock metadata generator. Produces draft titles, descriptions and keywords for images, vectors and video using your own AI provider key, with no account and nothing to install.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  browserRequirements: "Requires JavaScript. Requires a Google, OpenAI, Groq or Mistral API key.",
});

/**
 * VideoObject structured data for an embedded instructional tutorial video.
 * Only factual, verifiable properties are emitted (no invented ratings or counts).
 */
export const videoTutorialSchema = (video: {
  videoId: string;
  name: string;
  description: string;
  uploadDate: string;
  inLanguage?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: video.name,
  description: video.description,
  thumbnailUrl: [
    `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
  ],
  embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
  contentUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
  uploadDate: video.uploadDate,
  ...(video.inLanguage ? { inLanguage: video.inLanguage } : {}),
  publisher: {
    "@type": "Organization",
    name: "Tagyfy Pro",
    url: SITE,
    logo: {
      "@type": "ImageObject",
      url: `${SITE}/icon.jpg`,
    },
  },
});

/**
 * The editorial standards page, expressed as a publisher policy the crawler can
 * read. This is also the page that documents corrections, which the AdSense
 * help text asks for as evidence of ongoing curation.
 */
export const editorialPolicySchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Editorial standards and corrections",
  url: `${SITE}/editorial-policy`,
  about: {
    "@type": "Thing",
    name: "Editorial policy, accuracy standards and corrections process",
  },
  publisher: { "@type": "Organization", name: "Tagyfy Pro", url: SITE },
});
