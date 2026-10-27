import { findTrademarks, replaceTrademark, cleanKeywords } from "./trademarkSniffer";
import {
  DEFAULT_CONVERTER_OPTIONS,
  extractEditableRows,
  formatAgencyCsv,
  normalizeStockRows,
  parseStockCsv,
  type RawEditableRow,
} from "./stockCsvConverter";

export type CheckStatus = "PASS" | "WARN" | "FAIL";

export type VerifyAgencyId =
  | "adobe"
  | "shutterstock"
  | "freepik"
  | "vecteezy"
  | "dreamstime"
  | "123rf";

export const VERIFY_AGENCIES: Array<{ id: VerifyAgencyId; label: string }> = [
  { id: "adobe", label: "Adobe Stock" },
  { id: "shutterstock", label: "Shutterstock" },
  { id: "freepik", label: "Freepik" },
  { id: "vecteezy", label: "Vecteezy" },
  { id: "dreamstime", label: "Dreamstime" },
  { id: "123rf", label: "123RF" },
];

export const SUBJECTIVE_WORDS = [
  "beautiful",
  "stunning",
  "amazing",
  "gorgeous",
  "breathtaking",
  "perfect",
  "awesome",
  "epic",
  "incredible",
  "fantastic",
  "wonderful",
];

export const GENERIC_FORMAT_WORDS = new Set([
  "photo",
  "image",
  "picture",
  "vector",
  "illustration",
  "background",
  "wallpaper",
  "design",
  "graphic",
  "template",
  "icon",
  "set",
  "collection",
  "stock",
]);

const VALID_STOCK_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "tif",
  "tiff",
  "eps",
  "ai",
  "svg",
  "mp4",
  "mov",
  "webm",
]);

export interface MarketplaceVerdict {
  name: string;
  csvKey: VerifyAgencyId;
  status: CheckStatus;
  titleChars: string;
  keywordRange: string;
  notes: string[];
}

export interface SingleAssetAnalysis {
  parsedKeywords: string[];
  titleLen: number;
  descLen: number;
  kwCount: number;
  duplicates: string[];
  trademarks: string[];
  subjectiveFound: string[];
  genericInTop10: string[];
  longPhrases: string[];
  noPeopleEarly: boolean;
  titleCommaCount: number;
  marketplaces: MarketplaceVerdict[];
}

export function evaluateSingleAsset(input: {
  title: string;
  description: string;
  keywordsRaw: string;
}): SingleAssetAnalysis {
  const parsedKeywords = input.keywordsRaw
    .split(/[,\n;]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  const trimmedTitle = input.title.trim();
  const trimmedDesc = input.description.trim();
  const effectiveText = trimmedTitle || trimmedDesc;
  const titleLen = effectiveText.length;
  const descLen = (trimmedDesc || trimmedTitle).length;
  const kwCount = parsedKeywords.length;

  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const kw of parsedKeywords) {
    const lower = kw.toLowerCase();
    if (seen.has(lower) && !duplicates.includes(lower)) {
      duplicates.push(lower);
    }
    seen.add(lower);
  }

  const trademarks = findTrademarks(
    `${trimmedTitle} ${trimmedDesc} ${parsedKeywords.join(" ")}`
  );

  const combinedLower = `${effectiveText} ${parsedKeywords.join(" ")}`.toLowerCase();
  const subjectiveFound = SUBJECTIVE_WORDS.filter((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(combinedLower)
  );

  const top10 = parsedKeywords.slice(0, 10);
  const genericInTop10 = top10.filter((kw) =>
    GENERIC_FORMAT_WORDS.has(kw.toLowerCase())
  );
  const longPhrases = parsedKeywords.filter((kw) => kw.split(/\s+/).length > 3);
  const noPeopleEarly = top10.some((kw) => /^(no people|nobody)$/i.test(kw));
  const titleCommaCount = (effectiveText.match(/,/g) || []).length;

  const marketplaces: MarketplaceVerdict[] = [
    {
      name: "Adobe Stock",
      csvKey: "adobe",
      titleChars: `${titleLen} / 200 chars`,
      keywordRange: `${kwCount} / 49 max (5 min)`,
      status:
        titleLen === 0 ||
        titleLen > 200 ||
        kwCount < 5 ||
        kwCount > 49 ||
        trademarks.length > 0
          ? "FAIL"
          : titleCommaCount > 0 ||
              duplicates.length > 0 ||
              genericInTop10.length > 0 ||
              noPeopleEarly
            ? "WARN"
            : "PASS",
      notes: [
        ...(titleLen === 0 ? ["Missing title."] : []),
        ...(titleLen > 200 ? ["Title exceeds Adobe Stock's 200-character limit."] : []),
        ...(titleLen > 0 && titleLen < 50
          ? ["Title is very short; 70–190 characters gives stronger search context."]
          : []),
        ...(titleCommaCount > 0
          ? [
              "Title contains commas — Adobe Stock treats comma-heavy titles as keyword lists and strips/rejects commas in CSV imports.",
            ]
          : []),
        ...(kwCount < 5 ? ["Fewer than 5 keywords (Adobe Stock minimum)."] : []),
        ...(kwCount > 49
          ? [`${kwCount} keywords exceeds Adobe Stock's 49-keyword ceiling.`]
          : []),
        ...(genericInTop10.length > 0 || noPeopleEarly
          ? [
              `Move broad tags out of slots 1–10: ${[
                ...genericInTop10,
                ...(noPeopleEarly ? ["no people"] : []),
              ].join(", ")}.`,
            ]
          : []),
        ...(duplicates.length > 0
          ? [`Duplicate keywords: ${duplicates.join(", ")}.`]
          : []),
        ...(trademarks.length > 0
          ? [`Flagged brand terms: ${trademarks.join(", ")}.`]
          : []),
      ],
    },
    {
      name: "Shutterstock",
      csvKey: "shutterstock",
      titleChars: `${descLen} / 200 chars`,
      keywordRange: `${kwCount} / 50 max (7 min)`,
      status:
        descLen === 0 ||
        descLen > 200 ||
        kwCount < 7 ||
        kwCount > 50 ||
        trademarks.length > 0
          ? "FAIL"
          : duplicates.length > 0
            ? "WARN"
            : "PASS",
      notes: [
        ...(descLen === 0 ? ["Missing Description."] : []),
        ...(descLen > 200
          ? ["Description exceeds Shutterstock's 200-character limit."]
          : []),
        ...(kwCount < 7 ? ["Shutterstock requires at least 7 keywords."] : []),
        ...(kwCount > 50 ? ["Exceeds Shutterstock's 50-keyword maximum."] : []),
        ...(duplicates.length > 0
          ? [`Duplicate keywords: ${duplicates.join(", ")}.`]
          : []),
        ...(trademarks.length > 0
          ? [`Remove trademarks for commercial submission: ${trademarks.join(", ")}.`]
          : []),
      ],
    },
    {
      name: "Freepik",
      csvKey: "freepik",
      titleChars: `${titleLen} / 100 chars`,
      keywordRange: `${kwCount} / 50 max (5 min)`,
      status:
        titleLen === 0 || kwCount < 5 || kwCount > 50 || trademarks.length > 0
          ? "FAIL"
          : titleLen > 100 || duplicates.length > 0
            ? "WARN"
            : "PASS",
      notes: [
        ...(titleLen === 0 ? ["Missing title."] : []),
        ...(titleLen > 100
          ? [
              `Title is ${titleLen} chars; Freepik's CSV importer caps titles at 100 characters (shorten by ${
                titleLen - 100
              } chars for Freepik).`,
            ]
          : []),
        ...(kwCount < 5 || kwCount > 50
          ? ["Freepik requires between 5 and 50 keywords."]
          : []),
        ...(duplicates.length > 0
          ? [`Duplicate tags: ${duplicates.join(", ")}.`]
          : []),
        ...(trademarks.length > 0
          ? [`Flagged brand terms: ${trademarks.join(", ")}.`]
          : []),
      ],
    },
    {
      name: "Vecteezy",
      csvKey: "vecteezy",
      titleChars: `${titleLen} / 200 chars`,
      keywordRange: `${kwCount} / 50 max (5 min)`,
      status:
        titleLen === 0 ||
        titleLen > 200 ||
        kwCount < 5 ||
        kwCount > 50 ||
        trademarks.length > 0 ||
        /[^\w\s.,'-]/.test(effectiveText)
          ? "FAIL"
          : titleLen < 20 || duplicates.length > 0
            ? "WARN"
            : "PASS",
      notes: [
        ...(titleLen === 0 ? ["Missing title."] : []),
        ...(titleLen > 0 && titleLen < 32
          ? ["Vecteezy prefers descriptive titles (aim for 3+ meaningful words)."]
          : []),
        ...(titleLen > 200 ? ["Title exceeds 200 characters."] : []),
        ...(/[^\w\s.,'-]/.test(effectiveText)
          ? ["Vecteezy rejects special symbols in titles."]
          : []),
        ...(kwCount < 5 || kwCount > 50
          ? ["Vecteezy accepts 5 to 50 keywords."]
          : []),
        ...(trademarks.length > 0
          ? [`Flagged brand terms: ${trademarks.join(", ")}.`]
          : []),
      ],
    },
    {
      name: "Dreamstime",
      csvKey: "dreamstime",
      titleChars: `${titleLen} / 130 chars`,
      keywordRange: `${kwCount} / 80 max (10 min)`,
      status:
        titleLen === 0 || kwCount < 10 || kwCount > 80 || trademarks.length > 0
          ? "FAIL"
          : titleLen > 130 || duplicates.length > 0
            ? "WARN"
            : "PASS",
      notes: [
        ...(titleLen === 0 ? ["Missing Image Name / title."] : []),
        ...(titleLen > 130
          ? [
              "Image Name is over 130 characters; keep Image Name concise and place longer context in Description.",
            ]
          : []),
        ...(kwCount < 10 ? ["Dreamstime requires at least 10 keywords."] : []),
        ...(kwCount > 80 ? ["Dreamstime allows up to 80 keywords."] : []),
        ...(trademarks.length > 0
          ? [`Flagged brand terms: ${trademarks.join(", ")}.`]
          : []),
      ],
    },
    {
      name: "123RF",
      csvKey: "123rf",
      titleChars: `${descLen} / 255 chars`,
      keywordRange: `${kwCount} / 50 max (7 min)`,
      status:
        descLen === 0 ||
        descLen > 255 ||
        kwCount < 7 ||
        kwCount > 50 ||
        trademarks.length > 0
          ? "FAIL"
          : duplicates.length > 0
            ? "WARN"
            : "PASS",
      notes: [
        ...(descLen === 0 ? ["Missing description."] : []),
        ...(descLen > 255 ? ["Description exceeds 255 characters."] : []),
        ...(kwCount < 7 ? ["123RF requires at least 7 keywords."] : []),
        ...(kwCount > 50 ? ["123RF caps keyword lists at 50 terms."] : []),
        ...(trademarks.length > 0
          ? [`Flagged brand terms: ${trademarks.join(", ")}.`]
          : []),
      ],
    },
  ];

  return {
    parsedKeywords,
    titleLen,
    descLen,
    kwCount,
    duplicates,
    trademarks,
    subjectiveFound,
    genericInTop10,
    longPhrases,
    noPeopleEarly,
    titleCommaCount,
    marketplaces,
  };
}

export function autoCleanSingleAssetFields(input: {
  title: string;
  description: string;
  keywordsRaw: string;
}): {
  title: string;
  description: string;
  keywords: string[];
  keywordsRaw: string;
} {
  const parsed = input.keywordsRaw
    .split(/[,\n;]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  const cleanedTitle = replaceTrademark(
    input.title.replace(/,\s*/g, " ").replace(/\s+/g, " ").trim()
  ).cleaned;
  const cleanedDesc = replaceTrademark(input.description.trim()).cleaned;
  const cleanedKws = cleanKeywords(parsed).cleaned;

  const seen = new Set<string>();
  const specific: string[] = [];
  const trailing: string[] = [];

  for (const kw of cleanedKws) {
    const cleanKw = kw.replace(/^#+/, "").trim();
    const lower = cleanKw.toLowerCase();
    if (!lower || seen.has(lower)) continue;
    seen.add(lower);
    if (
      GENERIC_FORMAT_WORDS.has(lower) ||
      lower === "no people" ||
      lower === "nobody"
    ) {
      trailing.push(cleanKw);
    } else {
      specific.push(cleanKw);
    }
  }

  const merged = [...specific, ...trailing].slice(0, 49);
  return {
    title: cleanedTitle,
    description: cleanedDesc || cleanedTitle,
    keywords: merged,
    keywordsRaw: merged.join(", "),
  };
}

// ─── Full CSV File Structural + Row-by-Row Verification ──────────────────────

export interface CsvFileCheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface CsvRowAudit {
  rowNumber: number; // 1-based data row index
  editableRow: RawEditableRow;
  filename: string;
  title: string;
  description: string;
  keywords: string[];
  targetStatus: CheckStatus;
  issues: string[];
  singleAnalysis: SingleAssetAnalysis;
}

export interface CsvAuditReport {
  effectiveAgency: VerifyAgencyId;
  effectiveAgencyLabel: string;
  detectedSourceLabel: string;
  delimiter: "," | ";" | "\t";
  hasBom: boolean;
  headers: string[];
  totalRows: number;
  passRows: number;
  warnRows: number;
  failRows: number;
  overallStatus: CheckStatus;
  fileChecks: CsvFileCheckItem[];
  rowAudits: CsvRowAudit[];
}

function mergeStatus(a: CheckStatus, b: CheckStatus): CheckStatus {
  if (a === "FAIL" || b === "FAIL") return "FAIL";
  if (a === "WARN" || b === "WARN") return "WARN";
  return "PASS";
}

function validateHeadersForAgency(
  headers: string[],
  firstRawLine: string,
  agency: VerifyAgencyId
): CsvFileCheckItem {
  const lower = headers.map((h) => h.trim().toLowerCase());
  const exact = headers.map((h) => h.trim());

  switch (agency) {
    case "adobe": {
      const hasCore =
        lower.includes("filename") &&
        lower.includes("title") &&
        lower.includes("keywords");
      if (!hasCore) {
        return {
          id: "headers",
          label: "Adobe Stock Column Headers",
          status: "FAIL",
          detail: `Expected "Filename, Title, Keywords, Category, Releases", found: [${exact.join(", ")}].`,
        };
      }
      const hasOptional = lower.includes("category") && lower.includes("releases");
      return {
        id: "headers",
        label: "Adobe Stock Column Headers",
        status: hasOptional ? "PASS" : "WARN",
        detail: hasOptional
          ? "Matches official 5-column Adobe Stock CSV header schema."
          : `Core columns found, but optional Category/Releases columns are missing ([${exact.join(", ")}]).`,
      };
    }

    case "shutterstock": {
      const expected = [
        "Filename",
        "Description",
        "Keywords",
        "Categories",
        "Illustration",
        "Mature Content",
        "Editorial",
      ];
      const hasCore =
        lower.includes("filename") &&
        lower.includes("description") &&
        lower.includes("keywords");
      if (!hasCore) {
        return {
          id: "headers",
          label: "Shutterstock Column Headers",
          status: "FAIL",
          detail: `Missing required Shutterstock columns (Filename, Description, Keywords). Found: [${exact.join(", ")}]. Note: Shutterstock uses "Description", not "Title".`,
        };
      }
      const exactMatch =
        exact.length === expected.length &&
        expected.every((col, idx) => exact[idx] === col);
      return {
        id: "headers",
        label: "Shutterstock Column Headers",
        status: exactMatch ? "PASS" : "WARN",
        detail: exactMatch
          ? 'Exact 7-column match: Filename, Description, Keywords, Categories, Illustration, "Mature Content", Editorial.'
          : `Columns differ in order or capitalization from verified Shutterstock spec (${expected.join(", ")}). Found: [${exact.join(", ")}].`,
      };
    }

    case "freepik": {
      const exactNonAi =
        exact.length === 3 &&
        exact[0] === "filename" &&
        exact[1] === "title" &&
        exact[2] === "tags";
      const exactAi =
        exact.length === 5 &&
        exact[0] === "filename" &&
        exact[1] === "title" &&
        exact[2] === "tags" &&
        exact[3] === "Prompt" &&
        exact[4] === "Model";

      if (exactNonAi || exactAi) {
        return {
          id: "headers",
          label: "Freepik Column Headers",
          status: "PASS",
          detail: exactAi
            ? "Matches official 5-column Freepik AI CSV schema (filename;title;tags;Prompt;Model)."
            : "Matches official 3-column Freepik CSV schema (filename;title;tags).",
        };
      }
      return {
        id: "headers",
        label: "Freepik Column Headers",
        status: "FAIL",
        detail: `Freepik requires exact case-sensitive lowercase headers "filename;title;tags" (not "File name" or "Keywords"). Found: [${exact.join("; ")}].`,
      };
    }

    case "vecteezy": {
      const expected = ["Filename", "Title", "Description", "Keywords", "License", "Id"];
      const hasCore =
        lower.includes("filename") &&
        lower.includes("title") &&
        lower.includes("keywords");
      if (!hasCore) {
        return {
          id: "headers",
          label: "Vecteezy Column Headers",
          status: "FAIL",
          detail: `Expected "Filename, Title, Description, Keywords, License, Id", found: [${exact.join(", ")}].`,
        };
      }
      const exactMatch =
        exact.length === expected.length &&
        expected.every((c, i) => exact[i] === c);
      return {
        id: "headers",
        label: "Vecteezy Column Headers",
        status: exactMatch ? "PASS" : "WARN",
        detail: exactMatch
          ? "Matches official 6-column Vecteezy CSV header (including trailing Id column)."
          : `Headers work partially but differ from verified 6-column Vecteezy schema (${expected.join(", ")}).`,
      };
    }

    case "dreamstime": {
      const hasCore =
        exact.includes("Filename") &&
        exact.includes("Image Name") &&
        exact.includes("keywords");
      if (!hasCore) {
        return {
          id: "headers",
          label: "Dreamstime Column Headers",
          status: "FAIL",
          detail: `Dreamstime requires exact case-sensitive columns including "Filename", "Image Name", and lowercase "keywords". Found: [${exact.join(", ")}].`,
        };
      }
      const headerIsQuoted = firstRawLine.trim().startsWith('"');
      return {
        id: "headers",
        label: "Dreamstime Column Headers",
        status: headerIsQuoted || exact.length < 15 ? "WARN" : "PASS",
        detail: headerIsQuoted
          ? "Dreamstime prefers unquoted plain-text header names; wrapping headers in quotes can trigger parser errors."
          : exact.length < 15
            ? `Found ${exact.length} columns; official Dreamstime template has 15 columns.`
            : "Matches official 15-column unquoted Dreamstime CSV template.",
      };
    }

    case "123rf": {
      const expected = [
        "oldfilename",
        "123rf_filename",
        "description",
        "keywords",
        "country",
      ];
      const exactMatch =
        exact.length === expected.length &&
        expected.every((c, i) => exact[i] === c);
      if (exactMatch) {
        return {
          id: "headers",
          label: "123RF Column Headers",
          status: "PASS",
          detail:
            'Matches official lowercase 123RF schema ("oldfilename","123rf_filename","description","keywords","country").',
        };
      }
      const hasOldFilename = exact.includes("oldfilename") && exact.includes("keywords");
      return {
        id: "headers",
        label: "123RF Column Headers",
        status: hasOldFilename ? "WARN" : "FAIL",
        detail: `123RF requires lowercase "oldfilename","123rf_filename","description","keywords","country". Found: [${exact.join(", ")}].`,
      };
    }
  }
}

export function auditCsvFile(
  rawText: string,
  options?: {
    hasUtf8Bom?: boolean;
    targetAgency?: VerifyAgencyId | "auto";
  }
): CsvAuditReport {
  const hasBom = options?.hasUtf8Bom ?? rawText.startsWith("\uFEFF");
  const parsed = parseStockCsv(rawText);

  const autoResolved: VerifyAgencyId =
    parsed.detectedSource === "shutterstock" ||
    parsed.detectedSource === "freepik" ||
    parsed.detectedSource === "vecteezy" ||
    parsed.detectedSource === "dreamstime" ||
    parsed.detectedSource === "123rf" ||
    parsed.detectedSource === "adobe"
      ? parsed.detectedSource
      : "adobe";

  const effectiveAgency: VerifyAgencyId =
    !options?.targetAgency || options.targetAgency === "auto"
      ? autoResolved
      : options.targetAgency;

  const effectiveAgencyLabel =
    VERIFY_AGENCIES.find((a) => a.id === effectiveAgency)?.label ?? "Adobe Stock";

  const cleanWithoutBom = rawText.replace(/^\uFEFF/, "");
  const firstRawLine =
    cleanWithoutBom.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";

  const fileChecks: CsvFileCheckItem[] = [];

  // 1. Delimiter check
  const expectedDelimiter = effectiveAgency === "freepik" ? ";" : ",";
  if (parsed.delimiter !== expectedDelimiter) {
    fileChecks.push({
      id: "delimiter",
      label: "Column Delimiter",
      status: "FAIL",
      detail:
        effectiveAgency === "freepik"
          ? `Freepik requires semicolon (;) column delimiters, but this file uses ${
              parsed.delimiter === "," ? "commas (,)" : "tabs"
            }.`
          : `${effectiveAgencyLabel} requires comma (,) column delimiters, but this file uses ${
              parsed.delimiter === ";" ? "semicolons (;)" : "tabs"
            }.`,
    });
  } else {
    fileChecks.push({
      id: "delimiter",
      label: "Column Delimiter",
      status: "PASS",
      detail:
        expectedDelimiter === ";"
          ? "Uses required semicolon (;) column delimiter for Freepik."
          : `Uses standard comma (,) column delimiter for ${effectiveAgencyLabel}.`,
    });
  }

  // 2. UTF-8 BOM check
  if (
    hasBom &&
    (effectiveAgency === "vecteezy" || effectiveAgency === "dreamstime")
  ) {
    fileChecks.push({
      id: "bom",
      label: "UTF-8 Byte Order Mark (BOM)",
      status: "FAIL",
      detail: `UTF-8 BOM bytes (EF BB BF) detected at start of file. ${effectiveAgencyLabel}'s importer reads BOM bytes as part of the Filename header and rejects the CSV.`,
    });
  } else {
    fileChecks.push({
      id: "bom",
      label: "UTF-8 Encoding & BOM",
      status: "PASS",
      detail:
        effectiveAgency === "vecteezy" || effectiveAgency === "dreamstime"
          ? `Clean UTF-8 without BOM (safe for ${effectiveAgencyLabel}).`
          : hasBom
            ? "UTF-8 with BOM (compatible with Excel and this portal)."
            : "Clean UTF-8 text encoding.",
    });
  }

  // 3. Header schema check
  if (parsed.headers.length === 0) {
    fileChecks.push({
      id: "headers",
      label: "Header Row",
      status: "FAIL",
      detail: "CSV file is empty or missing a header line.",
    });
  } else {
    fileChecks.push(
      validateHeadersForAgency(parsed.headers, firstRawLine, effectiveAgency)
    );
  }

  // 4. Ragged column count check
  const raggedRowNumbers: number[] = [];
  parsed.rawRows.forEach((r, idx) => {
    if (r.length !== parsed.headers.length) {
      raggedRowNumbers.push(idx + 1);
    }
  });
  if (raggedRowNumbers.length > 0) {
    fileChecks.push({
      id: "column-count",
      label: "Row Column Alignment",
      status: "FAIL",
      detail: `${raggedRowNumbers.length} data row(s) have a different column count than the header (${
        parsed.headers.length
      } cols): row(s) ${raggedRowNumbers.slice(0, 6).join(", ")}. Usually caused by unquoted commas inside titles.`,
    });
  } else {
    fileChecks.push({
      id: "column-count",
      label: "Row Column Alignment",
      status: "PASS",
      detail: `All ${parsed.rawRows.length} data row(s) align cleanly with ${parsed.headers.length} header columns.`,
    });
  }

  // Extract editable rows
  const editableRows = extractEditableRows(parsed.rawRows, parsed.mapping);

  // 5. Duplicate filename check across batch
  const filenameCounts = new Map<string, number[]>();
  editableRows.forEach((r, idx) => {
    const key = r.filename.trim().toLowerCase();
    if (!key) return;
    const list = filenameCounts.get(key) ?? [];
    list.push(idx + 1);
    filenameCounts.set(key, list);
  });
  const duplicateFiles = [...filenameCounts.entries()].filter(
    ([, rows]) => rows.length > 1
  );
  if (duplicateFiles.length > 0) {
    fileChecks.push({
      id: "duplicate-filenames",
      label: "Unique Batch Filenames",
      status: "FAIL",
      detail: `Duplicate filenames detected: ${duplicateFiles
        .slice(0, 4)
        .map(([fn, rows]) => `"${fn}" (rows ${rows.join(" & ")})`)
        .join(", ")}.`,
    });
  } else {
    fileChecks.push({
      id: "duplicate-filenames",
      label: "Unique Batch Filenames",
      status: "PASS",
      detail: "Every row has a distinct filename.",
    });
  }

  // Row-by-row deep evaluation
  const lowerHeaders = parsed.headers.map((h) => h.trim().toLowerCase());
  const licenseColIdx = lowerHeaders.indexOf("license");
  const illustrationColIdx = lowerHeaders.indexOf("illustration");

  const rowAudits: CsvRowAudit[] = editableRows.map((row, idx) => {
    const singleAnalysis = evaluateSingleAsset({
      title: row.title,
      description: row.description,
      keywordsRaw: row.keywordsRaw,
    });

    const portalVerdict =
      singleAnalysis.marketplaces.find((m) => m.csvKey === effectiveAgency) ??
      singleAnalysis.marketplaces[0];

    let rowStatus: CheckStatus = portalVerdict.status;
    const issues: string[] = [...portalVerdict.notes];

    const fn = row.filename.trim();
    if (!fn) {
      rowStatus = "FAIL";
      issues.unshift("Missing filename.");
    } else {
      const dotIdx = fn.lastIndexOf(".");
      const ext = dotIdx > 0 ? fn.slice(dotIdx + 1).toLowerCase() : "";
      if (!ext || !VALID_STOCK_EXTENSIONS.has(ext)) {
        rowStatus = mergeStatus(rowStatus, "WARN");
        issues.push(
          `Filename "${fn}" does not end with a standard stock extension (.jpg, .eps, .mp4, etc.).`
        );
      }
      if ((filenameCounts.get(fn.toLowerCase())?.length ?? 0) > 1) {
        rowStatus = "FAIL";
        issues.push("Duplicate filename appears multiple times in this CSV.");
      }
    }

    if (parsed.rawRows[idx] && parsed.rawRows[idx].length !== parsed.headers.length) {
      rowStatus = "FAIL";
      issues.unshift(
        `Column mismatch: row has ${parsed.rawRows[idx].length} columns instead of ${parsed.headers.length}.`
      );
    }

    // Agency-specific cell checks
    if (effectiveAgency === "shutterstock") {
      if (row.categoryRaw && /^\d+$/.test(row.categoryRaw.trim())) {
        rowStatus = "FAIL";
        issues.push(
          `Shutterstock Categories "${row.categoryRaw}" uses a numeric ID — Shutterstock requires English names such as "Business/Finance" or "Technology".`
        );
      }
      if (illustrationColIdx >= 0) {
        const illVal = (parsed.rawRows[idx]?.[illustrationColIdx] ?? "").trim();
        if (illVal && illVal !== "Yes" && illVal !== "No") {
          rowStatus = mergeStatus(rowStatus, "WARN");
          issues.push(
            `Shutterstock Illustration value "${illVal}" should be title-case "Yes" or "No".`
          );
        }
      }
    }

    if (effectiveAgency === "vecteezy" && licenseColIdx >= 0) {
      const licVal = (parsed.rawRows[idx]?.[licenseColIdx] ?? "").trim();
      if (licVal && !["free", "pro", "editorial"].includes(licVal)) {
        rowStatus = mergeStatus(rowStatus, "WARN");
        issues.push(
          `Vecteezy License "${licVal}" should be lowercase "free", "pro", or "editorial".`
        );
      }
    }

    if (
      effectiveAgency !== "adobe" &&
      (singleAnalysis.genericInTop10.length > 0 || singleAnalysis.noPeopleEarly)
    ) {
      rowStatus = mergeStatus(rowStatus, "WARN");
      issues.push(
        `Move broad tags out of slots 1–10: ${[
          ...singleAnalysis.genericInTop10,
          ...(singleAnalysis.noPeopleEarly ? ["no people"] : []),
        ].join(", ")}.`
      );
    }

    if (singleAnalysis.subjectiveFound.length > 0) {
      rowStatus = mergeStatus(rowStatus, "WARN");
      issues.push(
        `Subjective hype adjectives: ${singleAnalysis.subjectiveFound.join(", ")}.`
      );
    }

    if (singleAnalysis.longPhrases.length > 0) {
      rowStatus = mergeStatus(rowStatus, "WARN");
      issues.push(
        `${singleAnalysis.longPhrases.length} keyword tag(s) exceed 3 words.`
      );
    }

    return {
      rowNumber: idx + 1,
      editableRow: row,
      filename: fn,
      title: row.title.trim() || row.description.trim(),
      description: row.description.trim() || row.title.trim(),
      keywords: singleAnalysis.parsedKeywords,
      targetStatus: rowStatus,
      issues,
      singleAnalysis,
    };
  });

  let passRows = 0;
  let warnRows = 0;
  let failRows = 0;
  for (const ra of rowAudits) {
    if (ra.targetStatus === "PASS") passRows++;
    else if (ra.targetStatus === "WARN") warnRows++;
    else failRows++;
  }

  let overallStatus: CheckStatus = rowAudits.length === 0 ? "FAIL" : "PASS";
  for (const fc of fileChecks) {
    overallStatus = mergeStatus(overallStatus, fc.status);
  }
  if (failRows > 0) overallStatus = "FAIL";
  else if (warnRows > 0) overallStatus = mergeStatus(overallStatus, "WARN");

  return {
    effectiveAgency,
    effectiveAgencyLabel,
    detectedSourceLabel: parsed.detectedLabel,
    delimiter: parsed.delimiter,
    hasBom,
    headers: parsed.headers,
    totalRows: rowAudits.length,
    passRows,
    warnRows,
    failRows,
    overallStatus,
    fileChecks,
    rowAudits,
  };
}

export function buildCleanedVerifiedCsv(
  rawText: string,
  targetAgency: VerifyAgencyId
): { content: string; bom: boolean; rowCount: number } {
  const parsed = parseStockCsv(rawText);
  const editable = extractEditableRows(parsed.rawRows, parsed.mapping).map((r) => {
    const cleaned = autoCleanSingleAssetFields({
      title: r.title || r.description,
      description: r.description || r.title,
      keywordsRaw: r.keywordsRaw,
    });
    return {
      ...r,
      title: cleaned.title,
      description: cleaned.description,
      keywordsRaw: cleaned.keywordsRaw,
    };
  });

  const normalized = normalizeStockRows(editable, {
    ...DEFAULT_CONVERTER_OPTIONS,
    deduplicateKeywords: true,
    autoReplaceTrademarks: true,
    stripAdobeTitleCommas: true,
    trimFreepikTitles: true,
    keywordCap: targetAgency === "adobe" ? "49" : "50",
  });

  const out = formatAgencyCsv(normalized, targetAgency, {
    ...DEFAULT_CONVERTER_OPTIONS,
    deduplicateKeywords: true,
    autoReplaceTrademarks: true,
    stripAdobeTitleCommas: true,
    trimFreepikTitles: true,
    keywordCap: targetAgency === "adobe" ? "49" : "50",
  });

  return {
    content: out.content,
    bom: out.bom,
    rowCount: normalized.length,
  };
}

export const SAMPLE_CLEAN_CSV_FOR_VERIFY = `"Filename","Title","Keywords","Category","Releases"
"agritech-vineyard-drone-01.jpg","Agronomist piloting multispectral survey drone over terraced organic vineyard at sunrise with tablet telemetry","precision agriculture, multispectral drone, vineyard inspection, agronomist, crop monitoring, organic vineyard, sunrise, agricultural technology, smart farming, aerial survey, viticulture, telemetry tablet","16",""
"cybersecurity-outline-icons.eps","Cybersecurity and network data protection outline icon set with firewall shield encrypted padlock and cloud backup","cybersecurity, data protection, network security, firewall shield, encrypted padlock, biometric login, cloud backup, threat detection, infosec, server security, outline icons, vector","19",""
"ceramic-espresso-latte-art.jpg","Barista hands pouring steamed milk into artisan stoneware espresso cup on warm oak cafe counter","barista, latte art, espresso cup, pouring milk, specialty coffee, cafe counter, stoneware mug, morning beverage, coffee shop, warm lighting, hospitality","4",""`;

export const SAMPLE_BROKEN_CSV_FOR_VERIFY = `"Filename","Title","Keywords","Category","Releases"
"office-desk-01.jpg","Beautiful businesswoman typing on Apple MacBook laptop, holding iPhone, drinking Starbucks coffee","photo, background, iphone, macbook, starbucks, businesswoman, businesswoman, laptop, office, corporate, modern sunlit workspace","3",""
"office-desk-01.jpg","Duplicate filename row with way too few tags","office, desk, work","3",""
"mountain-lake-sunset.png","Serene alpine glacial lake reflecting warm sunset peaks along rocky hiking ridge","no people, mountain lake, glacial water, alpine ridge, sunset reflection, wilderness trail, outdoor trekking, nature scenery, landscape, rocky shore","11",""`;
