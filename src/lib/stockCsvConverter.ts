import { findTrademarks, replaceTrademark, cleanKeywords } from "./trademarkSniffer";

export type TargetAgencyId =
  | "adobe"
  | "shutterstock"
  | "freepik"
  | "vecteezy"
  | "dreamstime"
  | "123rf"
  | "general";

export type DetectedSourceId =
  | "adobe"
  | "shutterstock"
  | "freepik"
  | "vecteezy"
  | "dreamstime"
  | "123rf"
  | "general"
  | "custom";

export interface ColumnMapping {
  filenameCol: number;
  titleCol: number;
  descriptionCol: number;
  keywordsCol: number;
  categoryCol: number;
  editorialCol: number;
  promptCol: number;
}

export interface ParsedCsvDocument {
  delimiter: "," | ";" | "\t";
  headers: string[];
  rawRows: string[][];
  detectedSource: DetectedSourceId;
  detectedLabel: string;
  mapping: ColumnMapping;
}

export interface RawEditableRow {
  id: string;
  filename: string;
  title: string;
  description: string;
  keywordsRaw: string;
  categoryRaw: string;
  editorialRaw: string;
  promptRaw: string;
}

export interface NormalizedStockRow {
  id: string;
  filename: string;
  title: string;
  description: string;
  keywords: string[];
  adobeCategoryId: string;
  shutterstockCategory: string;
  dreamstimeCategoryId: string;
  editorial: boolean;
  prompt: string;
  trademarksFound: string[];
  duplicatesRemoved: number;
  hadCommaInTitle: boolean;
  warnings: string[];
}

export interface ConverterOptions {
  deduplicateKeywords: boolean;
  autoReplaceTrademarks: boolean;
  stripAdobeTitleCommas: boolean;
  trimFreepikTitles: boolean;
  keywordCap: "none" | "49" | "50";
  vecteezyLicense: "free" | "pro" | "editorial";
  freepikIsAI: boolean;
  freepikAiModel: string;
  companionVectorExt: "none" | "eps" | "svg" | "ai";
}

export const DEFAULT_CONVERTER_OPTIONS: ConverterOptions = {
  deduplicateKeywords: true,
  autoReplaceTrademarks: false,
  stripAdobeTitleCommas: true,
  trimFreepikTitles: true,
  keywordCap: "none",
  vecteezyLicense: "free",
  freepikIsAI: false,
  freepikAiModel: "",
  companionVectorExt: "none",
};

export interface AgencyExportSpec {
  id: TargetAgencyId;
  name: string;
  shortName: string;
  fileSlug: string;
  delimiterLabel: string;
  bom: boolean;
  lineEndingLabel: "CRLF" | "LF";
  headersPreview: string;
  notes: string;
}

export const TARGET_AGENCY_SPECS: AgencyExportSpec[] = [
  {
    id: "adobe",
    name: "Adobe Stock",
    shortName: "Adobe Stock",
    fileSlug: "adobe-stock",
    delimiterLabel: "Comma (,)",
    bom: true,
    lineEndingLabel: "CRLF",
    headersPreview: "Filename, Title, Keywords, Category, Releases",
    notes: "Commas stripped from Title; numeric Category ID (1–22); UTF-8 BOM.",
  },
  {
    id: "shutterstock",
    name: "Shutterstock",
    shortName: "Shutterstock",
    fileSlug: "shutterstock",
    delimiterLabel: "Comma (,)",
    bom: true,
    lineEndingLabel: "LF",
    headersPreview: 'Filename, Description, Keywords, Categories, Illustration, "Mature Content", Editorial',
    notes: "Maps Title → Description when needed; English Category name; auto-flags vector extensions as Illustration=Yes.",
  },
  {
    id: "freepik",
    name: "Freepik",
    shortName: "Freepik",
    fileSlug: "freepik",
    delimiterLabel: "Semicolon (;)",
    bom: true,
    lineEndingLabel: "CRLF",
    headersPreview: "filename; title; tags (+ Prompt; Model for AI)",
    notes: "Semicolon column delimiter with lowercase headers and comma-separated tags inside quotes.",
  },
  {
    id: "vecteezy",
    name: "Vecteezy",
    shortName: "Vecteezy",
    fileSlug: "vecteezy",
    delimiterLabel: "Comma (,)",
    bom: false,
    lineEndingLabel: "LF",
    headersPreview: "Filename, Title, Description, Keywords, License, Id",
    notes: "No UTF-8 BOM (prevents header parse errors on Vecteezy); lowercase License + blank Id column.",
  },
  {
    id: "dreamstime",
    name: "Dreamstime",
    shortName: "Dreamstime",
    fileSlug: "dreamstime",
    delimiterLabel: "Comma (,)",
    bom: false,
    lineEndingLabel: "CRLF",
    headersPreview: "Filename, Image Name, Description, Category 1..3, keywords, Free, W-EL...",
    notes: "15-column unquoted header format, no UTF-8 BOM, comma-only lowercase keywords.",
  },
  {
    id: "123rf",
    name: "123RF",
    shortName: "123RF",
    fileSlug: "123rf",
    delimiterLabel: "Comma (,)",
    bom: true,
    lineEndingLabel: "CRLF",
    headersPreview: "oldfilename, 123rf_filename, description, keywords, country",
    notes: "Maps Filename → oldfilename and Title/Description → description with space-free comma keywords.",
  },
  {
    id: "general",
    name: "Universal / Backup CSV",
    shortName: "Universal",
    fileSlug: "universal",
    delimiterLabel: "Comma (,)",
    bom: true,
    lineEndingLabel: "CRLF",
    headersPreview: "Filename, Title, Description, Keywords",
    notes: "Clean 4-column master spreadsheet suitable for archiving, Lightroom scripts, or spreadsheet editing.",
  },
];

// ─── Cross-Agency Category Crosswalk ──────────────────────────────────────────

interface CategoryCrosswalkEntry {
  adobeId: string;
  adobeLabel: string;
  shutterstock: string;
  dreamstimeId: string;
  aliases: string[];
}

const CATEGORY_CROSSWALK: CategoryCrosswalkEntry[] = [
  { adobeId: "1", adobeLabel: "Animals", shutterstock: "Animals/Wildlife", dreamstimeId: "14", aliases: ["animals", "wildlife", "animals/wildlife", "pets"] },
  { adobeId: "2", adobeLabel: "Buildings and Architecture", shutterstock: "Buildings/Landmarks", dreamstimeId: "26", aliases: ["architecture", "buildings", "buildings/landmarks", "landmarks", "real estate", "interiors"] },
  { adobeId: "3", adobeLabel: "Business", shutterstock: "Business/Finance", dreamstimeId: "75", aliases: ["business", "finance", "business/finance", "corporate", "office", "commercial"] },
  { adobeId: "4", adobeLabel: "Drinks", shutterstock: "Food and drink", dreamstimeId: "121", aliases: ["drinks", "beverage", "beverages", "coffee"] },
  { adobeId: "5", adobeLabel: "The Environment", shutterstock: "Nature", dreamstimeId: "115", aliases: ["environment", "ecology", "sustainability", "climate"] },
  { adobeId: "6", adobeLabel: "States of Mind", shutterstock: "People", dreamstimeId: "145", aliases: ["states of mind", "emotion", "emotions", "wellness", "mental health"] },
  { adobeId: "7", adobeLabel: "Food", shutterstock: "Food and drink", dreamstimeId: "121", aliases: ["food", "food and drink", "food & drink", "cooking", "cuisine"] },
  { adobeId: "8", adobeLabel: "Graphic Resources", shutterstock: "Backgrounds/Textures", dreamstimeId: "112", aliases: ["graphic resources", "backgrounds", "textures", "backgrounds/textures", "abstract", "pattern", "icons"] },
  { adobeId: "9", adobeLabel: "Hobbies and Leisure", shutterstock: "Parks/Outdoor", dreamstimeId: "136", aliases: ["hobbies", "leisure", "parks/outdoor", "crafts"] },
  { adobeId: "10", adobeLabel: "Industry", shutterstock: "Industrial", dreamstimeId: "93", aliases: ["industry", "industrial", "manufacturing", "construction", "factory"] },
  { adobeId: "11", adobeLabel: "Landscape", shutterstock: "Nature", dreamstimeId: "115", aliases: ["landscape", "landscapes", "nature", "scenic", "mountains"] },
  { adobeId: "12", adobeLabel: "Lifestyle", shutterstock: "People", dreamstimeId: "145", aliases: ["lifestyle", "beauty/fashion", "fashion", "beauty"] },
  { adobeId: "13", adobeLabel: "People", shutterstock: "People", dreamstimeId: "145", aliases: ["people", "portrait", "family", "diversity"] },
  { adobeId: "14", adobeLabel: "Plants and Flowers", shutterstock: "Nature", dreamstimeId: "115", aliases: ["plants", "flowers", "plants and flowers", "botanical"] },
  { adobeId: "15", adobeLabel: "Culture and Religion", shutterstock: "Religion", dreamstimeId: "160", aliases: ["culture", "religion", "holidays", "tradition", "festival"] },
  { adobeId: "16", adobeLabel: "Science", shutterstock: "Science", dreamstimeId: "102", aliases: ["science", "healthcare/medical", "medical", "healthcare", "medicine", "education"] },
  { adobeId: "17", adobeLabel: "Social Issues", shutterstock: "Miscellaneous", dreamstimeId: "179", aliases: ["social issues", "news", "editorial", "politics"] },
  { adobeId: "18", adobeLabel: "Sports", shutterstock: "Sports/Recreation", dreamstimeId: "152", aliases: ["sports", "sports/recreation", "fitness", "recreation", "exercise"] },
  { adobeId: "19", adobeLabel: "Technology", shutterstock: "Technology", dreamstimeId: "105", aliases: ["technology", "tech", "computers", "ai", "digital", "software", "signs/symbols"] },
  { adobeId: "20", adobeLabel: "Transport", shutterstock: "Transportation", dreamstimeId: "169", aliases: ["transport", "transportation", "vehicles", "automotive", "aviation"] },
  { adobeId: "21", adobeLabel: "Travel", shutterstock: "Parks/Outdoor", dreamstimeId: "174", aliases: ["travel", "tourism", "vacation", "destination"] },
];

export function resolveCrosswalkCategories(
  rawCategory: string,
  editorial: boolean
): {
  adobeCategoryId: string;
  shutterstockCategory: string;
  dreamstimeCategoryId: string;
} {
  const cleaned = rawCategory.trim();
  if (cleaned) {
    // Take first category if comma-separated
    const primary = cleaned.split(",")[0].trim().toLowerCase();

    // 1. Exact Adobe numeric match (1..21)
    const byAdobeNum = CATEGORY_CROSSWALK.find((c) => c.adobeId === primary);
    if (byAdobeNum) {
      return {
        adobeCategoryId: byAdobeNum.adobeId,
        shutterstockCategory: byAdobeNum.shutterstock,
        dreamstimeCategoryId: byAdobeNum.dreamstimeId,
      };
    }

    // 2. Exact Dreamstime numeric match
    const byDreamNum = CATEGORY_CROSSWALK.find((c) => c.dreamstimeId === primary);
    if (byDreamNum) {
      return {
        adobeCategoryId: byDreamNum.adobeId,
        shutterstockCategory: byDreamNum.shutterstock,
        dreamstimeCategoryId: byDreamNum.dreamstimeId,
      };
    }

    // 3. Case-insensitive Shutterstock / text alias match
    const byText = CATEGORY_CROSSWALK.find(
      (c) =>
        c.shutterstock.toLowerCase() === primary ||
        c.adobeLabel.toLowerCase() === primary ||
        c.aliases.includes(primary)
    );
    if (byText) {
      return {
        adobeCategoryId: byText.adobeId,
        shutterstockCategory: byText.shutterstock,
        dreamstimeCategoryId: byText.dreamstimeId,
      };
    }
  }

  if (editorial) {
    return {
      adobeCategoryId: "17",
      shutterstockCategory: "Miscellaneous",
      dreamstimeCategoryId: "179",
    };
  }

  return {
    adobeCategoryId: "3",
    shutterstockCategory: "Miscellaneous",
    dreamstimeCategoryId: "75",
  };
}

// ─── Delimiter Detection & RFC-4180 Parser ────────────────────────────────────

function countUnquotedDelimiter(line: string, delim: string): number {
  let inQuotes = false;
  let count = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && ch === delim) {
      count++;
    }
  }
  return count;
}

export function detectDelimiter(raw: string): "," | ";" | "\t" {
  const clean = raw.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
  const semi = countUnquotedDelimiter(firstLine, ";");
  const tab = countUnquotedDelimiter(firstLine, "\t");
  const comma = countUnquotedDelimiter(firstLine, ",");

  if (semi > comma && semi >= tab && semi > 0) return ";";
  if (tab > comma && tab > semi && tab > 0) return "\t";
  return ",";
}

export function parseCsvMatrix(raw: string, delimiter: "," | ";" | "\t"): string[][] {
  const text = raw.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        currentRow.push(currentField);
        currentField = "";
      } else if (ch === "\r") {
        if (text[i + 1] === "\n") i++;
        currentRow.push(currentField);
        if (currentRow.some((cell) => cell.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else if (ch === "\n") {
        currentRow.push(currentField);
        if (currentRow.some((cell) => cell.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += ch;
      }
    }
  }

  currentRow.push(currentField);
  if (currentRow.some((cell) => cell.trim().length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

export function detectSourceSchema(
  headers: string[],
  delimiter: "," | ";" | "\t"
): {
  detectedSource: DetectedSourceId;
  detectedLabel: string;
  mapping: ColumnMapping;
} {
  const norm = headers.map((h) => h.trim().toLowerCase());
  const findExact = (...names: string[]) => norm.findIndex((h) => names.includes(h));
  const findFuzzy = (...subs: string[]) =>
    norm.findIndex((h) => subs.some((s) => h.includes(s)));

  // Exact agency fingerprints
  let detectedSource: DetectedSourceId = "custom";
  let detectedLabel = "Custom / Generic CSV";

  if (norm.includes("oldfilename") && norm.includes("123rf_filename")) {
    detectedSource = "123rf";
    detectedLabel = "123RF CSV";
  } else if (norm.includes("image name") && norm.includes("w-el")) {
    detectedSource = "dreamstime";
    detectedLabel = "Dreamstime CSV";
  } else if (
    norm.includes("filename") &&
    norm.includes("title") &&
    norm.includes("tags") &&
    (delimiter === ";" || norm.includes("prompt") || headers[0] === "filename")
  ) {
    detectedSource = "freepik";
    detectedLabel = "Freepik CSV (Semicolon)";
  } else if (norm.includes("mature content") && norm.includes("illustration")) {
    detectedSource = "shutterstock";
    detectedLabel = "Shutterstock CSV";
  } else if (norm.includes("license") && norm.includes("id") && norm.includes("title")) {
    detectedSource = "vecteezy";
    detectedLabel = "Vecteezy CSV";
  } else if (
    norm.includes("filename") &&
    norm.includes("title") &&
    norm.includes("keywords") &&
    norm.includes("releases")
  ) {
    detectedSource = "adobe";
    detectedLabel = "Adobe Stock CSV";
  } else if (
    norm.length === 4 &&
    norm.includes("filename") &&
    norm.includes("title") &&
    norm.includes("description") &&
    norm.includes("keywords")
  ) {
    detectedSource = "general";
    detectedLabel = "Universal 4-Column CSV";
  }

  let filenameCol = findExact(
    "filename",
    "file name",
    "oldfilename",
    "file",
    "sourcefile",
    "asset"
  );
  if (filenameCol === -1) filenameCol = findFuzzy("file");

  let titleCol = findExact("title", "image name", "headline", "object name", "name");
  if (titleCol === -1 && filenameCol !== findFuzzy("title")) {
    titleCol = findFuzzy("title", "headline");
  }

  let descriptionCol = findExact("description", "caption", "caption-abstract", "summary");
  if (descriptionCol === -1) descriptionCol = findFuzzy("desc", "caption");

  let keywordsCol = findExact("keywords", "tags", "keyword", "tag", "subject");
  if (keywordsCol === -1) keywordsCol = findFuzzy("keyword", "tag");

  let categoryCol = findExact("category", "categories", "category 1");
  if (categoryCol === -1) categoryCol = findFuzzy("categor");

  const editorialCol = findExact("editorial");
  const promptCol = findExact("prompt", "recreationprompt", "ai prompt");

  return {
    detectedSource,
    detectedLabel,
    mapping: {
      filenameCol,
      titleCol,
      descriptionCol,
      keywordsCol,
      categoryCol,
      editorialCol,
      promptCol,
    },
  };
}

export function parseStockCsv(
  raw: string,
  forcedDelimiter?: "," | ";" | "\t"
): ParsedCsvDocument {
  const delimiter = forcedDelimiter ?? detectDelimiter(raw);
  const matrix = parseCsvMatrix(raw, delimiter);
  if (matrix.length === 0) {
    return {
      delimiter,
      headers: [],
      rawRows: [],
      detectedSource: "custom",
      detectedLabel: "Empty CSV",
      mapping: {
        filenameCol: -1,
        titleCol: -1,
        descriptionCol: -1,
        keywordsCol: -1,
        categoryCol: -1,
        editorialCol: -1,
        promptCol: -1,
      },
    };
  }

  const headers = matrix[0].map((h) => h.trim());
  const rawRows = matrix.slice(1);
  const { detectedSource, detectedLabel, mapping } = detectSourceSchema(headers, delimiter);

  return {
    delimiter,
    headers,
    rawRows,
    detectedSource,
    detectedLabel,
    mapping,
  };
}

export function extractEditableRows(
  rawRows: string[][],
  mapping: ColumnMapping
): RawEditableRow[] {
  const pick = (row: string[], idx: number) =>
    idx >= 0 && idx < row.length ? row[idx].trim() : "";

  return rawRows.map((row, idx) => ({
    id: `row-${idx + 1}`,
    filename: pick(row, mapping.filenameCol),
    title: pick(row, mapping.titleCol),
    description: pick(row, mapping.descriptionCol),
    keywordsRaw: pick(row, mapping.keywordsCol),
    categoryRaw: pick(row, mapping.categoryCol),
    editorialRaw: pick(row, mapping.editorialCol),
    promptRaw: pick(row, mapping.promptCol),
  }));
}

// ─── Row Normalization, Hygiene & Trademark Fixer ────────────────────────────

function sanitizeText(value: string): string {
  return value
    .replace(/\p{Cc}+/gu, " ")
    .replace(/  +/g, " ")
    .trim();
}

function smartTrimAtWordBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxChars * 0.6)) {
    return sliced.slice(0, lastSpace).replace(/[.,;:\-\s]+$/, "").trim();
  }
  return sliced.trim();
}

export function normalizeStockRows(
  editableRows: RawEditableRow[],
  options: ConverterOptions
): NormalizedStockRow[] {
  const baseNormalized = editableRows.map((row): NormalizedStockRow => {
    const filename = sanitizeText(row.filename);
    let title = sanitizeText(row.title);
    let description = sanitizeText(row.description);

    // Bridge single-text-column agencies seamlessly:
    // Shutterstock & 123RF only carry Description; Adobe Stock & Freepik only carry Title.
    if (!title && description) title = description;
    if (!description && title) description = title;

    const hadCommaInTitle = title.includes(",");

    // Parse keywords (handles both comma and semicolon lists inside a cell)
    const rawParts = row.keywordsRaw
      .split(/[,;]+/)
      .map((t) => sanitizeText(t).replace(/^#+/, "").replace(/"/g, ""))
      .filter((t) => t.length > 0);

    let duplicatesRemoved = 0;
    let keywords: string[];
    if (options.deduplicateKeywords) {
      const seen = new Set<string>();
      keywords = [];
      for (const kw of rawParts) {
        const lower = kw.toLowerCase();
        if (seen.has(lower)) {
          duplicatesRemoved++;
        } else {
          seen.add(lower);
          keywords.push(kw);
        }
      }
    } else {
      keywords = rawParts;
    }

    // Scan trademarks before optional replacement
    const initialTrademarks = findTrademarks(
      `${title} ${description} ${keywords.join(", ")}`
    );

    if (options.autoReplaceTrademarks && initialTrademarks.length > 0) {
      title = replaceTrademark(title).cleaned;
      description = replaceTrademark(description).cleaned;
      keywords = cleanKeywords(keywords).cleaned;
      // Re-deduplicate in case two trademarks mapped to the same generic replacement
      const seenAfter = new Set<string>();
      keywords = keywords.filter((k) => {
        const l = k.toLowerCase();
        if (seenAfter.has(l)) return false;
        seenAfter.add(l);
        return true;
      });
    }

    if (options.keywordCap === "49" && keywords.length > 49) {
      keywords = keywords.slice(0, 49);
    } else if (options.keywordCap === "50" && keywords.length > 50) {
      keywords = keywords.slice(0, 50);
    }

    const trademarksFound = findTrademarks(
      `${title} ${description} ${keywords.join(", ")}`
    );

    const editorialLower = row.editorialRaw.trim().toLowerCase();
    const editorial =
      editorialLower === "yes" ||
      editorialLower === "1" ||
      editorialLower === "true" ||
      editorialLower === "editorial" ||
      options.vecteezyLicense === "editorial";

    const { adobeCategoryId, shutterstockCategory, dreamstimeCategoryId } =
      resolveCrosswalkCategories(row.categoryRaw, editorial);

    const warnings: string[] = [];
    if (!filename) warnings.push("Missing filename");
    if (!title) warnings.push("Missing title / description");
    if (title.length > 200) warnings.push(`Title is ${title.length} chars (>200 cap on Adobe/Shutterstock)`);
    if (keywords.length < 5) warnings.push(`Only ${keywords.length} keywords (most portals require ≥5–7)`);
    if (trademarksFound.length > 0) {
      warnings.push(`Trademark terms: ${trademarksFound.join(", ")}`);
    }

    return {
      id: row.id,
      filename,
      title,
      description,
      keywords,
      adobeCategoryId,
      shutterstockCategory,
      dreamstimeCategoryId,
      editorial,
      prompt: sanitizeText(row.promptRaw) || description,
      trademarksFound,
      duplicatesRemoved,
      hadCommaInTitle,
      warnings,
    };
  });

  if (options.companionVectorExt === "none") {
    return baseNormalized;
  }

  // Optional paired vector companion row expansion (e.g., design.jpg -> + design.eps)
  const expanded: NormalizedStockRow[] = [];
  for (const r of baseNormalized) {
    expanded.push(r);
    if (r.filename) {
      const dotIdx = r.filename.lastIndexOf(".");
      const stem = dotIdx > 0 ? r.filename.slice(0, dotIdx) : r.filename;
      const currentExt = dotIdx > 0 ? r.filename.slice(dotIdx + 1).toLowerCase() : "";
      if (currentExt !== options.companionVectorExt) {
        expanded.push({
          ...r,
          id: `${r.id}-${options.companionVectorExt}`,
          filename: `${stem}.${options.companionVectorExt}`,
        });
      }
    }
  }
  return expanded;
}

// ─── Agency-Verified CSV Formatters ───────────────────────────────────────────

function quoteAlways(val: string): string {
  return `"${val.replace(/"/g, '""')}"`;
}

function quoteMinimal(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function ensureNonEmptyKeywords(keywords: string[], sep: string): string {
  if (keywords.length > 0) return keywords.join(sep);
  return ["stock", "image", "design", "background", "concept"].join(sep);
}

export function formatAgencyCsv(
  rows: NormalizedStockRow[],
  agency: TargetAgencyId,
  options: ConverterOptions
): { content: string; bom: boolean } {
  const CRLF = "\r\n";
  const LF = "\n";

  switch (agency) {
    case "adobe": {
      const headers = ["Filename", "Title", "Keywords", "Category", "Releases"];
      const headerLine = headers.map(quoteAlways).join(",");
      const dataLines = rows.map((r) => {
        const adobeTitle = options.stripAdobeTitleCommas
          ? r.title.replace(/,/g, " ").replace(/  +/g, " ").trim()
          : r.title;
        return [
          quoteAlways(r.filename),
          quoteAlways(adobeTitle),
          quoteAlways(ensureNonEmptyKeywords(r.keywords, ", ")),
          quoteAlways(r.adobeCategoryId),
          quoteAlways(""),
        ].join(",");
      });
      return { content: [headerLine, ...dataLines].join(CRLF), bom: true };
    }

    case "shutterstock": {
      const headers = [
        "Filename",
        "Description",
        "Keywords",
        "Categories",
        "Illustration",
        '"Mature Content"',
        "Editorial",
      ];
      const headerLine = headers.join(",");
      const dataLines = rows.map((r) => {
        const ext = r.filename.split(".").pop()?.toLowerCase() ?? "";
        const isVector = ["eps", "ai", "svg"].includes(ext);
        return [
          quoteMinimal(r.filename),
          quoteMinimal(r.description || r.title),
          quoteMinimal(ensureNonEmptyKeywords(r.keywords, ", ")),
          quoteMinimal(r.shutterstockCategory),
          isVector ? "Yes" : "No",
          "No",
          r.editorial ? "Yes" : "No",
        ].join(",");
      });
      return { content: [headerLine, ...dataLines].join(LF) + LF, bom: true };
    }

    case "freepik": {
      const headers = options.freepikIsAI
        ? ["filename", "title", "tags", "Prompt", "Model"]
        : ["filename", "title", "tags"];
      const headerLine = headers.map(quoteAlways).join(";");
      const dataLines = rows.map((r) => {
        const fpTitle = options.trimFreepikTitles
          ? smartTrimAtWordBoundary(r.title, 100)
          : r.title;
        const baseCols = [
          quoteAlways(r.filename),
          quoteAlways(fpTitle),
          quoteAlways(ensureNonEmptyKeywords(r.keywords, ", ")),
        ];
        if (options.freepikIsAI) {
          baseCols.push(quoteAlways(r.prompt || r.description || r.title));
          baseCols.push(quoteAlways(sanitizeText(options.freepikAiModel)));
        }
        return baseCols.join(";");
      });
      return { content: [headerLine, ...dataLines].join(CRLF), bom: true };
    }

    case "vecteezy": {
      const headers = ["Filename", "Title", "Description", "Keywords", "License", "Id"];
      const headerLine = headers.map(quoteAlways).join(",");
      const dataLines = rows.map((r) =>
        [
          quoteAlways(r.filename),
          quoteAlways(r.title),
          quoteAlways(r.description || r.title),
          quoteAlways(ensureNonEmptyKeywords(r.keywords, ", ")),
          quoteAlways(r.editorial ? "editorial" : options.vecteezyLicense),
          quoteAlways(""),
        ].join(",")
      );
      return { content: [headerLine, ...dataLines].join(LF), bom: false };
    }

    case "dreamstime": {
      const headers = [
        "Filename",
        "Image Name",
        "Description",
        "Category 1",
        "Category 2",
        "Category 3",
        "keywords",
        "Free",
        "W-EL",
        "P-EL",
        "SR-EL",
        "SR-Price",
        "Editorial",
        "MR doc Ids",
        "Pr Docs",
      ];
      const headerLine = headers.join(",");
      const dataLines = rows.map((r) =>
        [
          quoteMinimal(r.filename),
          quoteMinimal(r.title),
          quoteMinimal(r.description || r.title),
          r.dreamstimeCategoryId,
          "0",
          "0",
          quoteMinimal(ensureNonEmptyKeywords(r.keywords, ",")),
          "1",
          "1",
          "0",
          "0",
          "0",
          r.editorial ? "1" : "0",
          "",
          "",
        ].join(",")
      );
      return { content: [headerLine, ...dataLines].join(CRLF), bom: false };
    }

    case "123rf": {
      const headers = ["oldfilename", "123rf_filename", "description", "keywords", "country"];
      const headerLine = headers.map(quoteAlways).join(",");
      const dataLines = rows.map((r) =>
        [
          quoteAlways(r.filename),
          quoteAlways(""),
          quoteAlways(r.description || r.title),
          quoteAlways(ensureNonEmptyKeywords(r.keywords, ",")),
          quoteAlways(""),
        ].join(",")
      );
      return { content: [headerLine, ...dataLines].join(CRLF), bom: true };
    }

    case "general":
    default: {
      const headers = ["Filename", "Title", "Description", "Keywords"];
      const headerLine = headers.map(quoteAlways).join(",");
      const dataLines = rows.map((r) =>
        [
          quoteAlways(r.filename),
          quoteAlways(r.title),
          quoteAlways(r.description || r.title),
          quoteAlways(ensureNonEmptyKeywords(r.keywords, ", ")),
        ].join(",")
      );
      return { content: [headerLine, ...dataLines].join(CRLF), bom: true };
    }
  }
}

// ─── Sample Presets for Instant Zero-Key / Zero-File Demo ─────────────────────

export const SAMPLE_ADOBE_BATCH_CSV = `"Filename","Title","Keywords","Category","Releases"
"rooftop-solar-installation-01.jpg","Commercial rooftop solar panel array at golden hour, clean renewable energy infrastructure","solar panel, renewable energy, rooftop solar, photovoltaic, clean energy, solar panel, golden hour, sustainability, commercial roof, power grid, green energy, carbon reduction","19",""
"minimalist-fintech-icon-set.eps","Minimalist fintech line icon pack for mobile banking, wallet, and secure payment interfaces","fintech icon, banking icon, vector line icon, payment symbol, digital wallet, secure transfer, finance ui, minimalist icon, outline set, currency, invoice, Fintech Icon","8",""
"barista-pouring-latte-art.jpg","Close-up of barista hands pouring steamed milk into ceramic espresso cup in warm cafe","barista, latte art, espresso cup, coffee shop, pouring milk, specialty coffee, cafe counter, ceramic mug, morning beverage, artisan coffee, warm lighting","4",""
"remote-developer-desk-setup.jpg","Overhead flatlay of developer typing on laptop beside iPhone and notebook on wooden desk","developer desk, remote work, coding laptop, iphone, workspace flatlay, wooden table, software engineer, productivity, wireless mouse, home office, tech setup","3",""
"alpine-glacier-hiking-trail.jpg","Winding rocky hiking trail overlooking turquoise glacial lake and snow-capped mountain peaks","hiking trail, glacial lake, alpine mountains, outdoor adventure, turquoise water, mountain ridge, wilderness landscape, scenic vista, nature travel, trekking path, no people","11",""`;

export const SAMPLE_FREEPIK_SEMICOLON_CSV = `"filename";"title";"tags"
"geometric-abstract-banner.eps";"Seamless geometric Memphis background pattern in warm terracotta and navy tones";"geometric pattern, abstract background, memphis vector, seamless wallpaper, terracotta palette, modern shapes, poster backdrop, graphic resource, Packaging Background, geometric pattern"
"electric-ev-charging-station.jpg";"Modern electric vehicle plugged into fast charging station outside glass office building";"electric vehicle, ev charger, green mobility, charging cable, sustainable transport, clean commute, battery power, parking lot, smart grid, urban transport"`;
