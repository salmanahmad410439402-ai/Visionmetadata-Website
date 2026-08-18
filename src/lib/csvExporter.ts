import { Asset } from "@/contexts/AssetsContext";
import { isDesktop } from "./env";
import { toast } from "sonner";

interface CSVRow {
  [key: string]: string;
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

function sanitizeField(value: string | undefined | null): string {
  if (value == null) return "";
  return String(value)
    .replace(/[\r\n\t\x00-\x1F\x7F]/g, " ")
    .replace(/  +/g, " ")
    .trim();
}

function sanitizeFilename(value: string | undefined | null): string {
  if (value == null) return "";
  return String(value)
    .replace(/[\r\n\t\x00-\x1F\x7F]/g, " ")
    .trim();
}

function quoteField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeCSV(value: string | undefined | null, isFilename: boolean = false): string {
  return quoteField(isFilename ? sanitizeFilename(value) : sanitizeField(value));
}

/**
 * buildKeywordString — join all keywords into a comma-separated string.
 *
 * NO COUNT CAP IS APPLIED — ever. The full keyword list is exported regardless
 * of how many keywords the AI generated. Platform guidelines like "up to 50
 * keywords" are display-side hints; the CSV importer accepts more and simply
 * displays the first N. Capping here would silently discard keywords the user
 * explicitly asked for via the Settings → Keyword Count slider.
 *
 * Comma-expansion: AI-hallucinated multi-keyword strings like "finance, business"
 * are split into separate entries before joining so the output is clean.
 *
 * Empty-list guard: if ALL keywords were removed by trademark cleaning, inject
 * safe generic fallbacks so platforms that require ≥5 keywords never receive a
 * blank field (blank fields cause silent upload rejection on Adobe Stock and
 * Shutterstock).
 */
function buildKeywordString(
  keywords: string[],
  searchIntent?: string,
  separator: string = ", "
): string {
  // Step 1: expand any keyword that contains a comma into multiple keywords
  const expanded: string[] = [];
  for (const k of keywords) {
    const sanitized = sanitizeField(k).replace(/"/g, "");
    if (sanitized.includes(",")) {
      sanitized.split(",").forEach(part => {
        const trimmed = part.trim();
        if (trimmed.length > 0) expanded.push(trimmed);
      });
    } else if (sanitized.length > 0) {
      expanded.push(sanitized);
    }
  }

  // Step 2: deduplicate (case-insensitive)
  const seen = new Set<string>();
  const deduped = expanded.filter(k => {
    const lower = k.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  // Step 3: empty-list guard — only fires if trademark cleaning wiped everything
  if (deduped.length === 0) {
    return getFallbackKeywords(searchIntent).join(separator);
  }

  // Return the full list — no count cap applied
  return deduped.join(separator);
}

/** Safe generic fallback keywords used ONLY when the keyword list is completely empty. */
function getFallbackKeywords(intent?: string): string[] {
  switch (intent) {
    case "commercial":  return ["business", "professional", "corporate", "modern", "concept"];
    case "editorial":   return ["editorial", "news", "event", "documentary", "reportage"];
    case "conceptual":  return ["concept", "abstract", "creative", "idea", "design"];
    case "technical":   return ["technology", "digital", "technical", "software", "icon"];
    case "background":  return ["background", "texture", "pattern", "wallpaper", "abstract"];
    default:            return ["stock", "photography", "image", "professional", "concept"];
  }
}

function generateCSV(headers: string[], rows: CSVRow[]): string {
  const CRLF = "\r\n";
  const headerLine = headers.map(h => quoteField(h)).join(",");
  const dataLines = rows.map(row => headers.map(h => {
    const isFn = ["Filename", "filename", "oldfilename"].includes(h);
    return escapeCSV(row[h], isFn);
  }).join(","));
  return [headerLine, ...dataLines].join(CRLF);
}


// ─── General (Universal) ──────────────────────────────────────────────────────────────
// A simple, universal CSV with just the essentials:
//   Filename, Title, Description, Keywords
// No platform-specific columns, categories, or flags.

export function exportGeneralCSV(assets: Asset[]): string {
  const headers = ["Filename", "Title", "Description", "Keywords"];

  const rows: CSVRow[] = assets
    .filter(a => a.metadata)
    .map(a => ({
      Filename:    sanitizeFilename(a.file.name),
      Title:       sanitizeField(a.metadata!.title),
      Description: sanitizeField(a.metadata!.description),
      Keywords:    buildKeywordString(a.metadata!.keywords, a.metadata!.searchIntent),
    }));

  return generateCSV(headers, rows);
}

// ─── Adobe Stock ──────────────────────────────────────────────────────────────
// Columns:  Filename, Title, Keywords, Category, Releases
// Title:    NO commas allowed (platform spec). Full title exported — no character limit.
// Keywords: Full list exported — no count cap whatsoever.
// Category: numeric ID from Adobe's official category list.
// Source: https://helpx.adobe.com/stock/contributor/help/organize-with-csv-files.html

const ADOBE_CATEGORY_IDS: Record<string, number> = {
  commercial:  5,  // Business
  editorial:   22, // Unclassified
  conceptual:  3,  // Art
  technical:   20, // Technology
  background:  13, // Nature
};
const ADOBE_DEFAULT_CATEGORY = 22;

function mapToAdobeCategoryId(intent?: string): string {
  return String(ADOBE_CATEGORY_IDS[intent ?? ""] ?? ADOBE_DEFAULT_CATEGORY);
}

/**
 * buildAdobeTitle — strip commas from the title (Adobe spec requirement).
 * NO length cap applied — full title is returned after comma removal.
 *
 * Adobe's official spec says "Don't include commas" in titles because commas
 * are the CSV delimiter and confuse their batch importer. Commas are replaced
 * with a space and double-spaces are collapsed. Everything else is kept intact.
 */
function buildAdobeTitle(title: string): string {
  return sanitizeField(title)
    .replace(/,/g, " ")    // commas → space (Adobe CSV spec: no commas in title)
    .replace(/  +/g, " ")  // collapse double-spaces created by the above
    .trim();
}

export function exportAdobeStockCSV(assets: Asset[]): string {
  const headers = ["Filename", "Title", "Keywords", "Category", "Releases"];

  const rows: CSVRow[] = assets
    .filter(a => a.metadata)
    .map(a => ({
      Filename: sanitizeFilename(a.file.name),
      Title:    buildAdobeTitle(a.metadata!.title),         // full title, no character limit
      Keywords: buildKeywordString(a.metadata!.keywords, a.metadata!.searchIntent), // full list, no count cap
      Category: mapToAdobeCategoryId(a.metadata!.searchIntent),
      Releases: "",
    }));

  return generateCSV(headers, rows);
}

// ─── Shutterstock ─────────────────────────────────────────────────────────────
// Source: verified working CSV (csvplanet_batch_23899_shutterstock_2026-03-18-063639.csv)
//         + official Shutterstock contributor guide screenshots
//
// EXACT column names and order verified from working CSV:
//   1. Filename         — original filename including extension
//   2. Description      — full AI-generated description; no character limit
//   3. Keywords         — comma + space separated; full list, no count cap
//   4. Categories       — 1 or 2 English text category names, comma-separated in one field
//                         NOT numeric IDs. e.g. "Business/Finance,People"
//   5. Illustration     — "Yes" / "No"  (capital I in header; title-case values)
//   6. "Mature Content" — "Yes" / "No"  (capital M and C; quoted because of space)
//   7. Editorial        — "Yes" / "No"  (title-case values)
//
// CRITICAL FIXES vs previous version (all verified against working CSV):
//   1. Column ORDER was wrong — previous code had Editorial(5)/Mature content(6)/illustration(7)
//      Correct order from working CSV:    Illustration(5) / Mature Content(6) / Editorial(7)
//   2. "illustration"   → "Illustration"  (capital I — exact match to working CSV header)
//   3. "Mature content" → "Mature Content" (capital M AND C — exact match to working CSV header)
//   4. "yes"/"no"       → "Yes"/"No"      (title-case — exact match to working CSV values)
//   5. Line ending: CRLF → LF            (working CSV uses LF only)
//
// Official Image Category names (verified from contributor guide screenshots):
//   Abstract, Animals/Wildlife, Arts, Backgrounds/Textures, Beauty/Fashion,
//   Buildings/Landmarks, Business/Finance, Celebrities, Education, Food and drink,
//   Healthcare/Medical, Holidays, Industrial, Interiors, Miscellaneous, Nature,
//   Objects, Parks/Outdoor, People, Religion, Science, Signs/Symbols,
//   Sports/Recreation, Technology, Transportation, Vintage

// Image category text names — exact strings accepted by Shutterstock.
const SHUTTERSTOCK_IMAGE_CATEGORIES: Record<string, string> = {
  commercial:  "Business/Finance",
  editorial:   "Miscellaneous",
  conceptual:  "Abstract",
  technical:   "Technology",
  background:  "Backgrounds/Textures",
};

const SHUTTERSTOCK_IMAGE_SECONDARY: Record<string, string> = {
  commercial:  "People",
  editorial:   "People",
  conceptual:  "Arts",
  technical:   "Objects",
  background:  "Nature",
};

const SHUTTERSTOCK_DEFAULT_CATEGORY  = "Miscellaneous";
const SHUTTERSTOCK_DEFAULT_SECONDARY = "Objects";

/**
 * Returns a single valid English text category name from Shutterstock's official list.
 * Text names are required — numeric IDs are silently ignored by Shutterstock.
 *
 * IMPORTANT: Shutterstock accepts only ONE category per asset in the CSV.
 * Some category names contain a slash as part of the name (e.g. "Business/Finance",
 * "Animals/Wildlife") — these are single categories, NOT two categories.
 * Previously this function was joining primary + secondary with "/", which produced
 * invalid strings like "Business/Finance/People" → ERROR_MEDIA_CATEGORIES_INVALID.
 */
function mapToShutterstockCategories(intent?: string): string {
  return SHUTTERSTOCK_IMAGE_CATEGORIES[intent ?? ""] ?? SHUTTERSTOCK_DEFAULT_CATEGORY;
}

/**
 * Quote a single CSV field only if it contains a comma or double-quote character.
 */
function shutterstockField(value: string | undefined | null, isFilename: boolean = false): string {
  const s = isFilename ? sanitizeFilename(value) : sanitizeField(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Shutterstock-specific generator — LF line endings (verified from working CSV). */
function generateShutterstockCSV(headers: string[], rows: CSVRow[]): string {
  const LF = "\n";
  const headerLine = headers.map(h => h === "Mature Content" ? `"${h}"` : h).join(",");
  const dataLines  = rows.map(row => headers.map(h => {
    const isFn = ["Filename", "filename", "oldfilename"].includes(h);
    return shutterstockField(row[h], isFn);
  }).join(","));
  return [headerLine, ...dataLines].join(LF) + LF;
}

export function exportShutterstockCSV(assets: Asset[]): string {
  // Column names and ORDER exactly match the verified working Shutterstock CSV.
  // CRITICAL: Illustration(5), "Mature Content"(6), Editorial(7) — NOT the reverse.
  const headers = [
    "Filename", "Description", "Keywords",
    "Categories", "Illustration", "Mature Content", "Editorial"
  ];

  const rows: CSVRow[] = assets
    .filter(a => a.metadata)
    .map(a => {
      const ext = a.file.name.split(".").pop()?.toLowerCase() ?? "";
      const isVector = ["eps", "ai", "svg"].includes(ext);
      return {
        Filename:           sanitizeFilename(a.file.name),
        // Full AI description — no character limit. "A unique and detailed description."
        Description:        sanitizeField(a.metadata!.description),
        // Full keyword list — no count cap. Comma + space separated.
        Keywords:           buildKeywordString(a.metadata!.keywords, a.metadata!.searchIntent),
        // 1 or 2 English text category names slash-separated.
        Categories:         mapToShutterstockCategories(a.metadata!.searchIntent),
        // "Yes"/"No" — title-case per verified working CSV (NOT lowercase "yes"/"no").
        "Illustration":     isVector ? "Yes" : "No",
        "Mature Content":   "No",
        "Editorial":        a.metadata!.searchIntent === "editorial" ? "Yes" : "No",
      };
    });

  // Use LF line endings — verified from working Shutterstock CSV.
  return generateShutterstockCSV(headers, rows);
}

// ─── Freepik ──────────────────────────────────────────────────────────────────
// Source: https://support.freepik.com/s/article/How-to-create-a-csv-file
//         Official Freepik sample spreadsheet (CSV VECTOR, verified March 2026)
//
// CRITICAL FORMAT RULES (from official Freepik documentation + sample spreadsheet):
//
//   1. Column delimiter: SEMICOLON (;)  — NOT comma. Freepik rejects comma-delimited CSV.
//
//   2. Exact column headers (case-sensitive, all lowercase, from official sample):
//        filename  |  title  |  tags
//      The keyword column is called "tags" — NOT "Keywords", NOT "keywords".
//      This was confirmed in the official Freepik sample spreadsheet screenshot.
//
//   3. Tag/keyword delimiter: COMMA (,) — tags within the "tags" field are comma-separated.
//
//   4. Column set:
//        Non-AI content:  filename ; title ; tags
//        AI content:      filename ; title ; tags ; Prompt ; Model
//          - "Prompt" = per-image AI generation prompt (auto-filled from recreationPrompt)
//          - "Model"  = AI tool name entered once by the user in the export modal
//                       (e.g. "Midjourney 5", "DALL-E 3") — written exactly as it appears
//                       in Freepik's contributor panel dropdown.
//
//   5. All text fields exported in full — no character limits, no tag count caps.
//
// Official example row (non-AI):
//   'beautiful-sunset.jpg';'Beautiful sunset';'sunset,sun,summer,beach,mountain'
//
// Official example row (AI):
//   'beautiful-sunset.jpg';'Beautiful sunset';'sunset,sun,summer,beach,mountain';'Beautiful sunset on the beach in summer';'Midjourney 5'
//
// v1.2.0 FIX:
//   - "File name" → "filename"   (all lowercase, no space — per official sample)
//   - "Title"     → "title"      (all lowercase — per official sample)
//   - "Keywords"  → "tags"       (CRITICAL: official column is "tags", not "keywords")
//   Row mapping keys updated to match new header names throughout.

/** Freepik-specific CSV generator — uses semicolons as column delimiter per official spec. */
function generateFreepikCSV(headers: string[], rows: CSVRow[]): string {
  const CRLF = "\r\n";
  // Freepik uses semicolons (;) to separate columns, per official documentation.
  // Fields are still double-quoted to safely contain semicolons, commas, or quotes in values.
  const headerLine = headers.map(h => quoteField(h)).join(";");
  const dataLines  = rows.map(row =>
    headers.map(h => {
      const isFn = ["Filename", "filename", "oldfilename"].includes(h);
      return escapeCSV(row[h], isFn);
    }).join(";")
  );
  return [headerLine, ...dataLines].join(CRLF);
}

export function exportFreepikCSV(
  assets: Asset[],
  options?: { isAI?: boolean; aiTool?: string }
): string {
  const isAI   = options?.isAI   ?? false;
  const aiTool = options?.aiTool ?? "";

  // Column headers exactly match the official Freepik sample spreadsheet (all lowercase).
  // Non-AI: 3 columns. AI content: 5 columns (adds Prompt and Model per Freepik spec).
  const headers = isAI
    ? ["filename", "title", "tags", "Prompt", "Model"]
    : ["filename", "title", "tags"];

  const rows: CSVRow[] = assets
    .filter(a => a.metadata)
    .map(a => {
      const row: CSVRow = {
        // "filename" — exact column name from official Freepik sample (all lowercase, no space)
        "filename": sanitizeFilename(a.file.name),
        // "title" — exact column name from official Freepik sample (all lowercase)
        // Full title exported — no character limit.
        "title":    sanitizeField(a.metadata!.title),
        // "tags" — exact column name from official Freepik sample (NOT "keywords" or "Keywords")
        // Tags are comma-separated within the field. Full list exported — no count cap.
        "tags":     buildKeywordString(a.metadata!.keywords, a.metadata!.searchIntent),
      };
      if (isAI) {
        // Prompt: per-image recreation prompt auto-generated by AI during metadata generation.
        // Fallback: if recreationPrompt is empty or was not returned by the AI model,
        // use the asset's description instead — it is the most accurate textual
        // representation of the image and serves as a valid recreation prompt for Freepik.
        const prompt = (a.metadata!.recreationPrompt ?? "").trim();
        row["Prompt"] = sanitizeField(prompt.length > 0 ? prompt : a.metadata!.description);
        // Model: the AI tool name entered once by the user in the export modal.
        // Must be written exactly as it appears in Freepik's contributor panel dropdown.
        row["Model"]  = sanitizeField(aiTool);
      }
      return row;
    });

  // Use the Freepik-specific semicolon generator — NOT the standard comma generateCSV.
  return generateFreepikCSV(headers, rows);
}

// ─── Dreamstime ───────────────────────────────────────────────────────────────
// Source: official Dreamstime Image_spreadsheet_template.xls
//         + verified working CSV (Image_spreadsheet_template_-_Enter_data_here__3_.csv)
//
// All 15 column names exactly match the verified working CSV (case-sensitive):
//   Filename, Image Name, Description, Category 1, Category 2, Category 3,
//   keywords, Free, W-EL, P-EL, SR-EL, SR-Price, Editorial, MR doc Ids, Pr Docs
//
// BYTE-LEVEL VERIFIED against working CSV that processed successfully on Dreamstime:
//
//   1. BOM:            NONE — Dreamstime rejects files with UTF-8 BOM (same as Vecteezy)
//   2. Line endings:   CRLF (\r\n) — official CSV uses CRLF
//   3. Header quoting: UNQUOTED — headers are plain text with no surrounding quotes
//                      e.g.  Filename,Image Name,...   NOT  "Filename","Image Name",...
//   4. Data quoting:   MINIMAL — only quote a field if it contains a comma or double-quote
//                      e.g.  keywords field is quoted; numeric fields are not
//   5. keywords:       lowercase 'k' — column header is "keywords" not "Keywords"
//   6. Keyword sep:    COMMA ONLY — "corporate,governance,icon" NOT "corporate, governance"
//   7. Free:           1 — verified from working CSV data row (was wrongly set to 0)
//   8. W-EL:           1 — verified from working CSV data row (was wrongly set to 0)
//   9. Pr Docs:        empty string — verified from working CSV (was wrongly set to "0")
//
// Category IDs verified against official Dreamstime Image Legend sheet:
//   commercial:  75  = Business → People
//   editorial:   179 = Editorial → Events
//   conceptual:  164 = Abstract → Colors
//   technical:   105 = Technology → Computers
//   background:  112 = Abstract → Backgrounds

const DREAMSTIME_CATEGORY_IDS: Record<string, number> = {
  commercial:  75,  // Business → People
  editorial:   179, // Editorial → Events
  conceptual:  164, // Abstract → Colors
  technical:   105, // Technology → Computers
  background:  112, // Abstract → Backgrounds
};
const DREAMSTIME_DEFAULT_CATEGORY = 75; // Business → People

function mapToDreamstimeCategoryId(intent?: string): string {
  return String(DREAMSTIME_CATEGORY_IDS[intent ?? ""] ?? DREAMSTIME_DEFAULT_CATEGORY);
}

/**
 * Quote a single CSV field only if it contains a comma or double-quote character.
 * Dreamstime's importer expects minimal quoting — quoting fields unnecessarily
 * (especially headers) causes parsing errors.
 */
function dreamstimeField(value: string, isFilename: boolean = false): string {
  const s = isFilename ? sanitizeFilename(value) : sanitizeField(value);
  // Only wrap in quotes if the field contains a comma or a double-quote
  if (s.includes(",") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Dreamstime-specific CSV generator.
 * - CRLF line endings (verified from working CSV)
 * - Unquoted headers (verified from working CSV)
 * - Minimal field quoting — only when field contains comma or double-quote
 * - No BOM (handled by passing noBOM=true in exportAssets)
 */
function generateDreamstimeCSV(headers: string[], rows: CSVRow[]): string {
  const CRLF = "\r\n";
  // Headers are plain unquoted text — exactly as the working CSV shows
  const headerLine = headers.join(",");
  // Data fields: quote only when the value contains a comma or double-quote
  const dataLines  = rows.map(row => headers.map(h => {
    const isFn = ["Filename", "filename", "oldfilename"].includes(h);
    return dreamstimeField(row[h] ?? "", isFn);
  }).join(","));
  return [headerLine, ...dataLines].join(CRLF);
}

export function exportDreamstimeCSV(assets: Asset[]): string {
  // Column names and order exactly match the verified working Dreamstime CSV.
  // CRITICAL: "keywords" with lowercase k — NOT "Keywords".
  const headers = [
    "Filename", "Image Name", "Description",
    "Category 1", "Category 2", "Category 3",
    "keywords", "Free", "W-EL", "P-EL", "SR-EL", "SR-Price",
    "Editorial", "MR doc Ids", "Pr Docs"
  ];

  const rows: CSVRow[] = assets
    .filter(a => a.metadata)
    .map(a => {
      const catId      = mapToDreamstimeCategoryId(a.metadata!.searchIntent);
      const isEditorial = a.metadata!.searchIntent === "editorial" ? "1" : "0";
      return {
        Filename:      sanitizeFilename(a.file.name),
        "Image Name":  sanitizeField(a.metadata!.title),        // full title, no character limit
        Description:   sanitizeField(a.metadata!.description),  // full description, no character limit
        "Category 1":  catId,   // numeric ID from official Dreamstime Image Legend
        "Category 2":  "0",     // 0 = not used
        "Category 3":  "0",     // 0 = not used
        // keywords: comma-only separator (no space) — verified from working CSV
        keywords:      buildKeywordString(a.metadata!.keywords, a.metadata!.searchIntent, ","),
        Free:          "1",     // 1 = allow free-section fallback — verified from working CSV
        "W-EL":        "1",     // 1 = Web Extended License enabled — verified from working CSV
        "P-EL":        "0",     // Print EL disabled
        "SR-EL":       "0",     // Sensitive Use EL disabled
        "SR-Price":    "0",
        Editorial:     isEditorial,
        "MR doc Ids":  "",      // blank — fill in manually if model release applies
        "Pr Docs":     "",      // blank — verified from working CSV (was wrongly "0")
      };
    });

  return generateDreamstimeCSV(headers, rows);
}

// ─── Vecteezy ─────────────────────────────────────────────────────────────────
// Source: official Vecteezy CSV Metadata Upload Example File (verified March 2026)
//         + verified working CSV (csvplanet_batch_23899_vecteezy_2026-03-18-063638.csv)
//
// EXACT column names and order from verified working CSV:
//   Filename, Title, Description, Keywords, License, Id
//   (Filename is required; all others optional; Id is always left blank)
//
// CRITICAL FIXES vs previous version (verified against working CSV):
//   1. "Id" column ADDED at end — present in working CSV, was missing from previous code.
//      Value is always blank (empty string) — Vecteezy assigns the Id after upload.
//   2. Line ending: CRLF → LF (working CSV uses LF only)
//
// License values — MUST be one of these exact lowercase strings per official spec:
//   "free" / "pro" / "editorial" — or left blank
//
// Keywords: comma + space separated within quoted field. Full list, no count cap.
// All text fields exported in full — no character limits applied.

/** Vecteezy-specific generator — LF line endings (verified from working CSV). */
function generateVecteezyCSV(headers: string[], rows: CSVRow[]): string {
  const LF = "\n";
  const headerLine = headers.map(h => quoteField(h)).join(",");
  const dataLines  = rows.map(row => headers.map(h => {
    const isFn = ["Filename", "filename", "oldfilename"].includes(h);
    return escapeCSV(row[h], isFn);
  }).join(","));
  return [headerLine, ...dataLines].join(LF);
}

export function exportVecteezyCSV(
  assets: Asset[],
  license: "free" | "pro" | "editorial" = "free"
): string {
  // Column names and order exactly match the verified working Vecteezy CSV.
  // CRITICAL: "Id" column at the end — present in working CSV, value always blank.
  const headers = ["Filename", "Title", "Description", "Keywords", "License", "Id"];

  const rows: CSVRow[] = assets
    .filter(a => a.metadata)
    .map(a => ({
      Filename:    sanitizeFilename(a.file.name),
      Title:       sanitizeField(a.metadata!.title),        // full title, no character limit
      Description: sanitizeField(a.metadata!.description),  // full description, no character limit
      Keywords:    buildKeywordString(a.metadata!.keywords, a.metadata!.searchIntent), // full list, no cap
      // License must be all-lowercase: "free", "pro", or "editorial"
      License:     license,
      // Id is always blank — Vecteezy assigns this after upload
      Id:          "",
    }));

  // Use LF line endings — verified from working Vecteezy CSV.
  return generateVecteezyCSV(headers, rows);
}

// ─── 123RF ────────────────────────────────────────────────────────────────────
// Source: official 123RF sample CSV (sample_image.csv) + contributor guidelines
//
// EXACT column names from official sample (case-sensitive, all lowercase):
//   "oldfilename","123rf_filename","description","keywords","country"
//
// Column definitions per official 123RF guidelines:
//   1. oldfilename    — REQUIRED. The original name of the uploaded file.
//   2. 123rf_filename — OPTIONAL. New filename assigned by 123RF after upload.
//                       Left blank — 123RF assigns this; not known in advance.
//   3. description    — OPTIONAL. A short description of the image. Full AI
//                       description exported — no character limit applied.
//   4. keywords       — OPTIONAL. Keywords describing the image, comma-separated.
//                       Full list exported — no count cap. Per official sample,
//                       keywords use comma-ONLY separator with NO spaces:
//                       e.g. "some,test,keywords" NOT "some, test, keywords"
//   5. country        — OPTIONAL. A 2-character country code most relevant to
//                       the photo (e.g. "US"). Left blank — set per account.
//
// Official sample row:
//   "testimage","testing150200001","this is a sample image description","some,test,keywords,you,can,try,again","US"
//
// v1.2.0 FIX:
//   - Keyword separator changed from ", " (comma+space) to "," (comma only).
//     Official sample CSV shows no spaces between keywords:
//     "some,test,keywords,you,can,try,again" — strictly matched here.
//
// Previously fixed (retained from v1.1.0):
//   - "Filename"     → "oldfilename"    (lowercase, per official sample)
//   - "Title"        → "123rf_filename" (was wrong column; now blank as per flow)
//   - "Description"  → "description"    (lowercase, per official sample)
//   - "Keywords"     → "keywords"       (lowercase, per official sample)
//   - "Category"  REMOVED — not in official sample; was silently ignored
//   - "Editorial" REMOVED — not in official sample; was silently ignored
//   - "country"   ADDED   — present in official sample; left blank (optional)

export function export123RFCSV(assets: Asset[]): string {
  // Column names exactly match the official 123RF sample CSV — all lowercase, all quoted.
  const headers = [
    "oldfilename", "123rf_filename", "description", "keywords", "country"
  ];

  const rows: CSVRow[] = assets
    .filter(a => a.metadata)
    .map(a => ({
      oldfilename:      sanitizeFilename(a.file.name),
      "123rf_filename": "",   // assigned by 123RF after upload — leave blank
      description:      sanitizeField(a.metadata!.description),  // full description, no character limit
      // Keywords use comma-only separator (no spaces) per official 123RF sample:
      // "some,test,keywords,you,can,try,again" — not "some, test, keywords"
      keywords:         buildKeywordString(a.metadata!.keywords, a.metadata!.searchIntent, ","),
      country:          "",   // 2-char country code; left blank — set in 123RF account settings
    }));

  return generateCSV(headers, rows);
}

// ─── Category mappers ─────────────────────────────────────────────────────────

// Note: mapSearchIntentToFreepikCategory is defined but Freepik's CSV format
// does not include a Category column — categories are set via the web UI after upload.
// Retained here for potential future use if Freepik adds a Category column to their spec.
function mapSearchIntentToFreepikCategory(intent?: string): string {
  switch (intent) {
    case "commercial":  return "Business/Finance";
    case "editorial":   return "News/Editorial";
    case "conceptual":  return "Abstract";
    case "technical":   return "Technology";
    case "background":  return "Backgrounds/Textures";
    default:            return "Miscellaneous";
  }
}

// ─── Download helper ──────────────────────────────────────────────────────────

export async function downloadCSV(content: string, filename: string, noBOM = false): Promise<void> {
  const BOM = "\uFEFF";
  const finalContent = noBOM ? content : BOM + content;

  // Browser download
  const blob = new Blob([finalContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Exported ${filename}`);
}

// ─── Main export entry point ──────────────────────────────────────────────────

export async function exportAssets(
  assets: Asset[],
  market: "general" | "adobe" | "freepik" | "shutterstock" | "dreamstime" | "vecteezy" | "123rf" | "all",
  options?: {
    vecteezyLicense?: "free" | "pro" | "editorial";
    freepikIsAI?: boolean;
    freepikAiTool?: string;
  }
): Promise<void> {
  const timestamp = new Date().toISOString().split("T")[0];
  const assetsWithMeta = assets.filter(a => a.metadata);

  if (assetsWithMeta.length === 0) {
    throw new Error("No assets with generated metadata to export");
  }

  // Individual platform exports (each shows its own Save As dialog on desktop)
  if (market === "general" || market === "all") {
    await downloadCSV(exportGeneralCSV(assetsWithMeta), `tagyfy-general-${timestamp}.csv`);
  }
  if (market === "adobe" || market === "all") {
    await downloadCSV(exportAdobeStockCSV(assetsWithMeta), `tagyfy-adobe-stock-${timestamp}.csv`);
  }
  if (market === "freepik" || market === "all") {
    await downloadCSV(
      exportFreepikCSV(assetsWithMeta, {
        isAI:    options?.freepikIsAI,
        aiTool:  options?.freepikAiTool,
      }),
      `tagyfy-freepik-${timestamp}.csv`
    );
  }
  if (market === "shutterstock" || market === "all") {
    await downloadCSV(exportShutterstockCSV(assetsWithMeta), `tagyfy-shutterstock-${timestamp}.csv`);
  }
  if (market === "dreamstime" || market === "all") {
    // noBOM=true — Dreamstime's importer rejects files with a UTF-8 BOM,
    // reading the BOM bytes as part of the "Filename" header value.
    await downloadCSV(exportDreamstimeCSV(assetsWithMeta), `tagyfy-dreamstime-${timestamp}.csv`, true);
  }
  if (market === "vecteezy" || market === "all") {
    // noBOM=true — Vecteezy's importer reads the BOM as part of the "Filename" header value,
    // causing "incorrect header line" or "illegal quoting" errors. Working CSV has no BOM.
    await downloadCSV(
      exportVecteezyCSV(assetsWithMeta, options?.vecteezyLicense ?? "free"),
      `tagyfy-vecteezy-${timestamp}.csv`,
      true
    );
  }
  if (market === "123rf" || market === "all") {
    await downloadCSV(export123RFCSV(assetsWithMeta), `tagyfy-123rf-${timestamp}.csv`);
  }
}
