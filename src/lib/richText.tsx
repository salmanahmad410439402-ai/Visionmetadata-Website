import React from "react";
import { Link } from "react-router-dom";

/**
 * Minimal, dependency-free renderer for the small subset of inline markdown
 * used inside blog content: images, links, **bold** and *italic*.
 *
 * IMPORTANT: this replaces two near-identical (and buggy) copies that lived in
 * pages/BlogPost.tsx and pages/Blogs.tsx. Those copies read the wrong regex
 * capture groups, which meant:
 *   - every `**bold**` span was silently DELETED from the rendered page, and
 *   - every `[text](url)` link was rendered as plain bold text with the URL
 *     thrown away (breaking in-article navigation).
 * Keeping a single implementation prevents that class of content loss from
 * coming back, and guarantees text is never dropped: anything the parser does
 * not understand is emitted verbatim.
 *
 * Capture-group map for the pattern below:
 *   1 = whole image token        2 = image alt     3 = image url
 *   4 = link text                5 = link url
 *   6 = bold text
 *   7 = italic text
 */
const INLINE_PATTERN =
  /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

const linkClass =
  "text-primary underline font-bold hover:text-primary/80 transition-colors";

export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return "";

  const hasFormatting =
    text.includes("![") ||
    text.includes("[") ||
    text.includes("**") ||
    text.includes("*");
  if (!hasFormatting) return text;

  // Fresh regex instance per call: a shared /g pattern carries lastIndex state
  // between calls, which silently skips matches on re-render.
  const regex = new RegExp(INLINE_PATTERN.source, "g");

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      // Image ![alt](url) — the blog content never ships real images, so this
      // is rendered as a link to the asset rather than a broken <img>.
      parts.push(
        <a
          key={`img-${key++}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {match[2] || match[3]}
        </a>
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      const linkText = match[4];
      const linkUrl = match[5];
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");

      parts.push(
        isInternal ? (
          <Link key={`l-${key++}`} to={linkUrl} className={linkClass}>
            {linkText}
          </Link>
        ) : (
          <a
            key={`l-${key++}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {linkText}
          </a>
        )
      );
    } else if (match[6] !== undefined) {
      parts.push(
        <strong key={`b-${key++}`} className="font-bold text-foreground">
          {match[6]}
        </strong>
      );
    } else if (match[7] !== undefined) {
      parts.push(
        <em key={`i-${key++}`} className="italic font-medium text-foreground/90">
          {match[7]}
        </em>
      );
    } else {
      // Unknown token shape: keep the original characters instead of dropping
      // them, so a copy edit can never erase published words.
      parts.push(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export default renderFormattedText;
