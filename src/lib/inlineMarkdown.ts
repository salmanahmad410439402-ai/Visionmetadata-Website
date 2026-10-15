/**
 * Inline markdown, parsed once and rendered twice.
 *
 * WHY THIS EXISTS
 * Article bodies contain a small subset of markdown: `**bold**`, `*italic*`,
 * `[text](url)` and the occasional `![alt](url)`.
 *
 * The React pages render them through src/lib/richText.tsx. The prerendered HTML
 * — the version a non-JavaScript crawler reads — was built by interpolating the
 * raw strings, so it shipped the markers themselves: `**Creative
 * Differentiation**` and `[Adobe's guidelines](https://...)` appeared as literal
 * punctuation in the crawler-facing HTML of five articles. The same content was
 * clean for a human and mostly unreadable for a reviewer.
 *
 * So the parser lives here, once, and both renderers consume its tokens. Adding
 * a construct means adding it in one place; the two outputs cannot drift.
 *
 * Anything the parser does not recognise is emitted verbatim as text — a copy
 * edit must never be able to erase published words.
 */

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "image"; alt: string; url: string }
  | { type: "link"; text: string; url: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string };

/**
 * Capture-group map:
 *   1 = whole image token   2 = image alt   3 = image url
 *   4 = link text           5 = link url
 *   6 = bold text           7 = italic text
 */
const INLINE_PATTERN =
  /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

export function tokenizeInline(text: string): InlineToken[] {
  if (!text) return [];

  const hasFormatting =
    text.includes("![") ||
    text.includes("[") ||
    text.includes("**") ||
    text.includes("*");

  if (!hasFormatting) return [{ type: "text", value: text }];

  // A fresh regex per call: a shared /g pattern keeps lastIndex between calls
  // and silently skips matches on the next render.
  const regex = new RegExp(INLINE_PATTERN.source, "g");

  const tokens: InlineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.substring(lastIndex, match.index) });
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      tokens.push({ type: "image", alt: match[2], url: match[3] });
    } else if (match[4] !== undefined && match[5] !== undefined) {
      tokens.push({ type: "link", text: match[4], url: match[5] });
    } else if (match[6] !== undefined) {
      tokens.push({ type: "bold", value: match[6] });
    } else if (match[7] !== undefined) {
      tokens.push({ type: "italic", value: match[7] });
    } else {
      // Unknown shape — keep the original characters rather than dropping them.
      tokens.push({ type: "text", value: match[0] });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.substring(lastIndex) });
  }

  return tokens;
}

/** Escapes the five characters that matter inside an HTML text node/attribute. */
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const externalLink = (url: string, label: string) =>
  `<a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`;

/**
 * Serialises inline markdown to HTML for the prerendered pages.
 *
 * Mirrors the React renderer's decisions exactly, including rendering an image
 * as a labelled link rather than an <img>: the crawler then sees the same words
 * the reader sees, and neither can show a broken image.
 */
export function inlineToHtml(text: string): string {
  return tokenizeInline(text)
    .map((token) => {
      switch (token.type) {
        case "image":
          return externalLink(token.url, token.alt || token.url);
        case "link":
          return externalLink(token.url, token.text);
        case "bold":
          return `<strong>${escapeHtml(token.value)}</strong>`;
        case "italic":
          return `<em>${escapeHtml(token.value)}</em>`;
        case "text":
        default:
          return escapeHtml(token.value);
      }
    })
    .join("");
}
