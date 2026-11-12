/**
 * Marketplace metadata specifications.
 *
 * Single source of truth for the /metadata-limits reference page: the React page
 * imports it for rendering, and prerender.ts imports it to emit crawlable HTML.
 * Keeping one copy is deliberate — when content lived in two places, the
 * crawler-facing HTML silently drifted behind the rendered page.
 *
 * `source` links point at the platform's own documentation. Update `LIMITS_LAST_CHECKED`
 * whenever the figures are re-verified, and record the change on /editorial-policy.
 */

export interface PlatformSpec {
  name: string;
  /** One-line summary used in the prerendered table. */
  titleLimit: string;
  titleNotes: string;
  keywordLimit: string;
  keywordNotes: string;
  csvFormat: string;
  quirks: string[];
  source: { label: string; url: string };
  accent: string;
}

export interface FailureMode {
  symptom: string;
  cause: string;
  fix: string;
}

export const LIMITS_LAST_CHECKED = "October 2026";

export const PLATFORMS: PlatformSpec[] = [
  {
    name: "Adobe Stock",
    titleLimit: "200 characters maximum (no commas)",
    titleNotes:
      "Write a concise, factual descriptive sentence (~70–190 characters is practical) rather than a comma-separated word list. Commas must be removed from titles — Adobe's CSV importer rejects or misaligns comma-containing titles.",
    keywordLimit: "5 to 49 keywords (top 10 weighted strongest)",
    keywordNotes:
      "Ordered strictly by relevance. Put the literal subject, action, and setting in slots 1–10; every keyword must accurately reflect the submitted asset.",
    csvFormat: "Filename,Title,Keywords,Category,Releases",
    quirks: [
      "Comma-delimited (,) UTF-8 CSV; UTF-8 BOM (EF BB BF) is accepted cleanly.",
      "Category expects a numeric ID (1–21) from Adobe Stock's official category list rather than a text label.",
      "The Releases column takes exact release names/IDs when recognizable people or private property appear; leave empty otherwise.",
      "Generative AI assets must still be declared using the portal's 'Created using generative AI tools' checkbox during submission.",
    ],
    source: {
      label: "Adobe Stock — Organize with CSV files",
      url: "https://helpx.adobe.com/stock/contributor/help/organize-with-csv-files.html",
    },
    accent: "#4F46E5",
  },
  {
    name: "Shutterstock",
    titleLimit: "200 characters maximum (Description column)",
    titleNotes:
      "Shutterstock's CSV uses a single Description column in place of a separate Title. Lead with the primary commercial subject and action in clear natural prose.",
    keywordLimit: "7 to 50 keywords",
    keywordNotes:
      "Comma-separated inside a double-quoted field. Minimum 7 keywords required per asset, capped at 50.",
    csvFormat: "Filename,Description,Keywords,Categories,Illustration,Mature Content,Editorial",
    quirks: [
      "Comma-delimited (,) UTF-8 CSV (LF line endings recommended; UTF-8 BOM accepted).",
      "Categories requires exact English category names from Shutterstock's official list (such as Business/Finance, Technology, or Food and drink) — numeric IDs are rejected.",
      "Column order matters: Illustration (5), Mature Content (6), Editorial (7), each set to title-case Yes or No.",
      "Vector submissions (.eps / .svg) should set Illustration to Yes.",
    ],
    source: {
      label: "Shutterstock Contributor Support — Bulk CSV upload",
      url: "https://support.submit.shutterstock.com/s/article/How-can-I-include-metadata-with-my-content",
    },
    accent: "#10B981",
  },
  {
    name: "Freepik",
    titleLimit: "100 characters maximum",
    titleNotes:
      "Freepik enforces a strict 100-character title ceiling in CSV imports — a 180-character Adobe Stock title will fail or truncate mid-word unless shortened cleanly.",
    keywordLimit: "5 to 50 tags",
    keywordNotes:
      "Tags inside the tags column are comma-separated inside double quotes, while columns themselves are separated by semicolons (;).",
    csvFormat: "filename;title;tags  (+ Prompt;Model when declaring AI media)",
    quirks: [
      "Columns are separated by SEMICOLONS (;), not commas, and standard headers are all-lowercase: filename;title;tags.",
      "UTF-8 BOM is accepted; ensure regional spreadsheet saves do not strip quotes around comma-separated tag lists.",
      "AI-generated uploads require the extended 5-column schema (filename;title;tags;Prompt;Model) or explicit AI declaration in the contributor panel.",
    ],
    source: {
      label: "Freepik Contributor Help — CSV metadata upload",
      url: "https://support.freepik.com/s/article/How-to-upload-metadata-with-a-CSV-file",
    },
    accent: "#F59E0B",
  },
  {
    name: "Vecteezy",
    titleLimit: "200 characters maximum (at least 3–5 descriptive words)",
    titleNotes:
      "Vecteezy reads both Title and Description separately. Avoid generic 1–2 word titles or camera filenames.",
    keywordLimit: "5 to 50 keywords",
    keywordNotes:
      "Comma-separated inside quotes. Focus on specific multi-word commercial phrases alongside core nouns.",
    csvFormat: "Filename,Title,Description,Keywords,License,Id",
    quirks: [
      "Save as UTF-8 WITHOUT BOM — a 3-byte UTF-8 BOM (EF BB BF) prepends invisible bytes to Filename and causes header validation to fail.",
      'License must be exact lowercase: free, pro, or editorial ("Free" or "Pro" capitalized is rejected).',
      "Keep the trailing Id column header present and leave its cell value empty on new uploads.",
    ],
    source: {
      label: "Vecteezy Contributor Guidelines — CSV formatting",
      url: "https://support.vecteezy.com/en_us/categories/contributors-Bkz5b2P6",
    },
    accent: "#3B82F6",
  },
  {
    name: "Dreamstime",
    titleLimit: "130 characters recommended (Image Name)",
    titleNotes:
      "Keep Image Name concise (under ~130 characters) and place fuller scene context in the separate Description column.",
    keywordLimit: "10 to 80 keywords",
    keywordNotes:
      "Dreamstime enforces a higher 10-keyword minimum than Adobe Stock or Freepik, and accepts up to 80 comma-separated keywords.",
    csvFormat:
      "Filename,Image Name,Description,Category 1,Category 2,Category 3,keywords,Free,W-EL,P-EL,SR-EL,SR-Price,Editorial,MR doc Ids,Pr Docs",
    quirks: [
      "Save strictly as UTF-8 WITHOUT BOM — Excel's 'CSV UTF-8 (Comma delimited)' adds a BOM that breaks Dreamstime's Filename header check.",
      "Notice exact header casing in the 15-column template: 'keywords' is lowercase while 'Filename' and 'Image Name' are capitalized.",
      "Category 1–3 use Dreamstime's own numeric category legend IDs rather than Adobe Stock IDs.",
    ],
    source: {
      label: "Dreamstime Contributor Help — CSV template & FTP",
      url: "https://www.dreamstime.com/uploadfile",
    },
    accent: "#8B5CF6",
  },
  {
    name: "123RF",
    titleLimit: "255 characters maximum (description column)",
    titleNotes:
      "123RF uses an all-lowercase description column as its primary caption field; keep prose factual and under 200–255 characters.",
    keywordLimit: "7 to 50 keywords",
    keywordNotes:
      "Minimum 7 comma-separated keywords inside double quotes; avoid repeating identical word stems excessively.",
    csvFormat: "oldfilename,123rf_filename,description,keywords,country",
    quirks: [
      'All five header names are strictly lowercase and case-sensitive ("oldfilename", not "OldFileName" or "Filename").',
      "Leave 123rf_filename empty on new submissions — 123RF populates its internal ID after ingestion.",
      "UTF-8 BOM is accepted; populate country (e.g., US or shooting country) when required by your batch workflow.",
    ],
    source: {
      label: "123RF Contributor Help Center",
      url: "https://help.123rf.com/",
    },
    accent: "#EC4899",
  },
];

export const FAILURES: FailureMode[] = [
  {
    symptom: "Dreamstime or Vecteezy rejects a seemingly valid CSV header",
    cause:
      "Invisible 3-byte UTF-8 Byte Order Mark (EF BB BF) written by Microsoft Excel's 'CSV UTF-8' save option, which turns 'Filename' into '\\uFEFFFilename'.",
    fix: "Export as UTF-8 without BOM (handled automatically for Dreamstime and Vecteezy in our Multi-Agency Stock CSV Converter and Metadata Checker).",
  },
  {
    symptom: "Adobe Stock rejects the CSV or shifts columns right",
    cause:
      "Either an unquoted comma inside Keywords/Title or a comma inside the Title string itself, which Adobe's batch parser flags.",
    fix: "Strip commas from Adobe Stock titles and wrap all comma-containing keyword strings in standard RFC 4180 double quotes.",
  },
  {
    symptom: "Freepik reports 'Invalid header' or merges columns",
    cause:
      "Uploading a comma-delimited Adobe CSV to Freepik instead of Freepik's semicolon-delimited lowercase schema (filename;title;tags), or exceeding Freepik's 100-character title cap.",
    fix: "Use semicolons (;) between columns, exact lowercase filename;title;tags headers, and trim Freepik titles cleanly at or under 100 characters.",
  },
  {
    symptom: "Shutterstock rejects the Categories or boolean columns",
    cause:
      "Passing numeric Adobe category IDs instead of Shutterstock's English category names (such as Business/Finance), or reversing Illustration / Mature Content / Editorial column order.",
    fix: "Use exact English Shutterstock category labels and title-case Yes / No values in the verified 7-column order.",
  },
  {
    symptom: "0 files matched after uploading a valid CSV",
    cause:
      "Case-sensitive filename mismatch (IMG_01.JPG vs IMG_01.jpg), folder paths left inside Filename (batch/img.jpg), or importing the CSV before FTP media transcoding finishes.",
    fix: "Keep bare filenames with exact uppercase/lowercase extension matching, and wait until all thumbnails appear in your portal queue before importing the CSV.",
  },
];
