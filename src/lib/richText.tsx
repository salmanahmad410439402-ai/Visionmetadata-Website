import React from "react";
import { Link } from "react-router-dom";
import { tokenizeInline, type InlineToken } from "./inlineMarkdown";

/**
 * React renderer for the small subset of inline markdown used inside blog
 * content. The parser itself lives in ./inlineMarkdown so that this renderer and
 * the prerendered HTML serializer consume the same tokens — see that file for
 * why the two were previously drifting.
 *
 * History worth keeping: this replaced two near-identical (and buggy) copies in
 * pages/BlogPost.tsx and pages/Blogs.tsx. Those read the wrong regex capture
 * groups, so every `**bold**` span was silently DELETED from the rendered page
 * and every `[text](url)` link lost its URL. Keeping one implementation prevents
 * that class of content loss from coming back, and the parser guarantees text is
 * never dropped: anything it does not understand is emitted verbatim.
 */

const linkClass =
  "text-primary underline font-bold hover:text-primary/80 transition-colors";

export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return "";

  const tokens = tokenizeInline(text);

  // Fast path: a single text token means the string had no markers at all.
  if (tokens.length === 1 && tokens[0].type === "text") {
    return tokens[0].value;
  }

  return tokens.map((token: InlineToken, index: number) => {
    switch (token.type) {
      case "image":
        // The blog content ships no real images, so this renders as a link to
        // the asset rather than a broken <img>.
        return (
          <a
            key={`img-${index}`}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {token.alt || token.url}
          </a>
        );

      case "link": {
        const isInternal = token.url.startsWith("/") || token.url.startsWith("#");
        return isInternal ? (
          <Link key={`l-${index}`} to={token.url} className={linkClass}>
            {token.text}
          </Link>
        ) : (
          <a
            key={`l-${index}`}
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {token.text}
          </a>
        );
      }

      case "bold":
        return (
          <strong key={`b-${index}`} className="font-bold text-foreground">
            {token.value}
          </strong>
        );

      case "italic":
        return (
          <em key={`i-${index}`} className="italic font-medium text-foreground/90">
            {token.value}
          </em>
        );

      case "text":
      default:
        return token.value;
    }
  });
}

export default renderFormattedText;
