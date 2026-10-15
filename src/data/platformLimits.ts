/**
 * Marketplace metadata specifications.
 *
 * Single source of truth for the /metadata-limits reference page: the React page
 * imports it for rendering, and prerender.ts imports it to emit crawlable HTML.
 * Keeping one copy is deliberate — when content lived in two places, the
 * crawler-facing HTML silently drifted behind the rendered page.
 *
 * `source` links point at the platform's own documentation. Update `LAST_CHECKED`
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
    titleLimit: "200 characters",
    titleNotes:
      "Send a plain descriptive sentence, not a comma-separated word list. Commas must be removed entirely — Adobe rejects titles containing them.",
    keywordLimit: "49 (guide suggests 25–49)",
    keywordNotes:
      "Ordered by relevance. Adobe's own guidance recommends many relevant keywords, but every term must genuinely describe the asset — irrelevant keywords count against you.",
    csvFormat: "Filename, Title, Keywords, Category, Releases",
    quirks: [
      "Category is a numeric ID from Adobe's official list, not a category name.",
      "The Releases column takes release IDs, and is required for recognisable people and for property.",
      "The CSV column order is fixed — Adobe matches by position as well as header.",
    ],
    source: {
      label: "Adobe Stock — organize with CSV files",
      url: "https://helpx.adobe.com/stock/contributor/help/organize-with-csv-files.html",
    },
    accent: "#4F46E5",
  },
  {
    name: "Shutterstock",
    titleLimit: "200 characters recommended",
    titleNotes:
      "Descriptive sentence format. Shutterstock weights the first words most heavily, so put the principal subject first.",
    keywordLimit: "50 (first 10 weighted most)",
    keywordNotes:
      "Shutterstock states the first 7–10 keywords carry the most search weight. Order by importance, not alphabetically or by type.",
    csvFormat:
      "Filename, Description, Keywords, Categories, Editorial, Mature content, Illustration",
    quirks: [
      'Uses a "Description" column where other platforms use "Title" — the same content, different header.',
      "Two numeric category IDs are required.",
      "Editorial and Mature content are explicit boolean flags and must be set accurately.",
    ],
    source: {
      label: "Shutterstock contributor CSV guidelines",
      url: "https://submit.shutterstock.com/",
    },
    accent: "#10B981",
  },
  {
    name: "Freepik",
    titleLimit: "100 characters recommended",
    titleNotes:
      "Kept short and descriptive. Freepik titles display differently from Adobe's, so a 190-character Adobe title is usually too long here.",
    keywordLimit: "50, semicolon-separated",
    keywordNotes:
      "Freepik's CSV uses a semicolon as the keyword delimiter rather than a comma. Sending a comma-separated list collapses the whole keyword set into one entry.",
    csvFormat: "File name, Title, Keywords (semicolon-delimited)",
    quirks: [
      "AI-generated assets must declare the generating tool name — this is a required field, not optional.",
      "Uploading via the web form requires the same declarations as the CSV.",
    ],
    source: {
      label: "Freepik contributor help",
      url: "https://contributor.freepik.com/",
    },
    accent: "#F59E0B",
  },
  {
    name: "Vecteezy",
    titleLimit: "No hard character cap documented",
    titleNotes:
      "Full title is accepted. Keep it descriptive; Vecteezy uses it for search relevance rather than display truncation.",
    keywordLimit: "No documented cap",
    keywordNotes:
      "Full keyword list is accepted. Sending more than 50 has no demonstrated benefit and dilutes relevance.",
    csvFormat: "Filename, Title, Description, Keywords, License, Id",
    quirks: [
      'The License value must be all-lowercase: free, pro, or editorial. Sending "Free" or "Pro" capitalised is rejected.',
      "The trailing Id column must be present and left blank — Vecteezy assigns it after upload.",
      "LF line endings, not CRLF.",
    ],
    source: {
      label: "Vecteezy contributor upload guide",
      url: "https://www.vecteezy.com/contributors",
    },
    accent: "#3B82F6",
  },
  {
    name: "Dreamstime",
    titleLimit: "No hard cap; keep under 200 for clarity",
    titleNotes:
      "Dreamstime expects the image filename to be part of the record, so filename hygiene affects the submission.",
    keywordLimit: "50 maximum, 7 minimum",
    keywordNotes:
      "Dreamstime enforces a minimum as well as a maximum — an asset with too few keywords is rejected at upload.",
    csvFormat: "Image Name, Description, Keywords, Category, plus platform-specific columns",
    quirks: [
      "Requires the original image name in addition to the file being uploaded.",
      "Category is chosen from Dreamstime's own list, which does not map cleanly onto Adobe's.",
      "Extended columns differ between image, vector and video submissions.",
    ],
    source: {
      label: "Dreamstime contributor help",
      url: "https://www.dreamstime.com/help",
    },
    accent: "#8B5CF6",
  },
  {
    name: "123RF",
    titleLimit: "Descriptive sentence, keep under 200",
    titleNotes:
      "123RF sample files use an all-lowercase header row, which the exporter matches exactly.",
    keywordLimit: "50 maximum",
    keywordNotes:
      "Comma-separated within the single keywords field. Avoid repeating the same stem across many keywords.",
    csvFormat: "oldfilename, 123rf_filename, description, keywords, country",
    quirks: [
      'Header names are lowercase and case-sensitive: "oldfilename", not "OldFileName".',
      "123rf_filename is assigned by the platform after upload and should be left blank.",
      "A country value is expected — an empty field can fail validation.",
    ],
    source: {
      label: "123RF contributor resources",
      url: "https://www.123rf.com/contributors/",
    },
    accent: "#EC4899",
  },
];

export const FAILURES: FailureMode[] = [
  {
    symptom: "Adobe Stock rejects the CSV outright",
    cause:
      "Almost always a comma inside the Title field. Adobe treats it as a delimiter, so the row gains a column and shifts out of alignment.",
    fix: "Remove every comma from the title. The Adobe export in Tagyfy Pro strips them for you; if you are editing by hand, search the title for commas before uploading.",
  },
  {
    symptom: "Keywords arrive as one enormous single keyword",
    cause: "Delimiter mismatch. Freepik expects semicolons, the others expect commas.",
    fix: "Check which delimiter the target platform's sample file uses, and make sure you selected that platform's export rather than a general CSV.",
  },
  {
    symptom: "Everything shifts by one column after import",
    cause:
      "A delimiter inside a text field, most often a comma in the description or a semicolon in a keyword phrase.",
    fix: "Quote any field that contains the delimiter. Correct CSV quoting handles this; hand-edited files frequently do not.",
  },
  {
    symptom: "The file uploads but one field is blank",
    cause:
      "A required column was omitted rather than left empty. Some platforms require the column header to be present even when the value is blank for every row — Vecteezy's Id column behaves this way.",
    fix: "Compare your header row against the platform's current sample file, column for column and in order.",
  },
  {
    symptom: "Rejected for trademark or brand terms",
    cause:
      "A brand name reached the keyword list — commonly a device, a vehicle model, a landmark, or a sports team.",
    fix: "Run the trademark check before exporting, then read the flagged keywords yourself. The check catches known names; it cannot catch a name that is trademarked in a context it does not know about.",
  },
];
