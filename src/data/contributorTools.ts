export type ContributorToolId =
  | "event-calendar"
  | "ai-generator"
  | "metadata-checker"
  | "csv-converter";

export interface ContributorToolSpec {
  id: ContributorToolId;
  step: number;
  stepLabel: string;
  name: string;
  shortName: string;
  to: string;
  badge: "NEW" | "UPDATED" | "POPULAR";
  requiresApiKey: boolean;
  goalQuestion: string;
  tagline: string;
  whatItDoes: string;
  useWhen: string;
  highlights: string[];
  ctaLabel: string;
  accentColor: "emerald" | "primary" | "amber" | "sky";
}

export const CONTRIBUTOR_TOOLS_STORAGE_KEY = "tagyfy_toolkit_guide_seen_v1";
export const OPEN_TOOLS_GUIDE_EVENT = "tagyfy:open-tools-guide";

export function openToolsGuideModal(preselectToolId?: ContributorToolId | "all"): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_TOOLS_GUIDE_EVENT, {
      detail: { toolId: preselectToolId ?? "all" },
    })
  );
}

export const CONTRIBUTOR_TOOLS: ContributorToolSpec[] = [
  {
    id: "event-calendar",
    step: 1,
    stepLabel: "Step 1 · Plan What to Create",
    name: "Stock Event Calendar & Upload Radar",
    shortName: "Event Calendar",
    to: "/event-calendar",
    badge: "NEW",
    requiresApiKey: false,
    goalQuestion: "Find upcoming seasonal events to shoot",
    tagline: "Discover what Adobe Stock & Shutterstock buyers search 6–10 weeks ahead.",
    whatItDoes:
      "Tracks 51 year-round holidays, retail sales, and awareness days with automatic countdowns, Photo/Vector/Video concepts, trademark cautions, and copy-ready safe keywords.",
    useWhen:
      "You want to know what seasonal themes to shoot, illustrate, or generate right now before peak buyer demand hits.",
    highlights: [
      "Auto Upcoming Radar",
      "Search by Date or Month",
      "1-Click Safe Keywords",
    ],
    ctaLabel: "Open Event Calendar",
    accentColor: "emerald",
  },
  {
    id: "ai-generator",
    step: 2,
    stepLabel: "Step 2 · Generate Draft Metadata",
    name: "Free AI Metadata Generator",
    shortName: "AI Web Generator",
    to: "/tool",
    badge: "POPULAR",
    requiresApiKey: false,
    goalQuestion: "Generate AI titles & ranked keywords",
    tagline: "Create SEO titles, descriptions, and up to 50 ranked keywords in your browser.",
    whatItDoes:
      "Analyzes your photos, vector previews, or video clips using Gemini, OpenAI, Groq, or Mistral (plus a zero-key Sample Demo) with optional Event Targeting.",
    useWhen:
      "You have raw images, vectors, or clips and need accurate commercial titles and prioritized Top-10 keywords fast.",
    highlights: [
      "Instant Sample Demo",
      "4 AI Vision Providers",
      "Dual Event Targeting",
    ],
    ctaLabel: "Open AI Generator",
    accentColor: "primary",
  },
  {
    id: "metadata-checker",
    step: 3,
    stepLabel: "Step 3 · Audit & Auto-Repair",
    name: "Metadata & CSV File Checker",
    shortName: "Metadata & CSV Checker",
    to: "/metadata-checker",
    badge: "UPDATED",
    requiresApiKey: false,
    goalQuestion: "Check metadata or verify a CSV file",
    tagline: "Catch rejection triggers in a single title/tag list or audit an entire .csv file.",
    whatItDoes:
      "Checks restricted brand names, title character caps, Adobe Stock title commas, duplicate tags, UTF-8 BOM rules, CSV headers, and row formatting — with 1-click CSV repair.",
    useWhen:
      "You already wrote metadata or exported a CSV and want to verify it has zero policy or formatting errors before uploading.",
    highlights: [
      "Single Asset + Full CSV",
      "90+ Brand IP Sniffer",
      "1-Click Repaired CSV",
    ],
    ctaLabel: "Verify Metadata / CSV",
    accentColor: "amber",
  },
  {
    id: "csv-converter",
    step: 4,
    stepLabel: "Step 4 · Multi-Agency Export",
    name: "Multi-Agency Stock CSV Converter",
    shortName: "6-Agency CSV Converter",
    to: "/stock-csv-converter",
    badge: "NEW",
    requiresApiKey: false,
    goalQuestion: "Convert 1 CSV for 6 stock agencies",
    tagline: "Turn one master CSV into ready-to-upload files for 6 stock marketplaces at once.",
    whatItDoes:
      "Converts any metadata spreadsheet into exact schemas for Adobe Stock, Shutterstock, Freepik (;), Vecteezy, Dreamstime, and 123RF with automatic delimiter, BOM, and category mapping.",
    useWhen:
      "You tagged your batch once and want compliant CSV spreadsheets for five other stock agencies without manual Excel editing.",
    highlights: [
      "6 Agency Schemas",
      "Auto BOM & Delimiter",
      "100% Local in Browser",
    ],
    ctaLabel: "Convert Stock CSV",
    accentColor: "sky",
  },
];
