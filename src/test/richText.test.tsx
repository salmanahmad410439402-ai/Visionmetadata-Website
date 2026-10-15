import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { renderFormattedText } from "@/lib/richText";

/**
 * Regression tests for the inline markdown renderer.
 *
 * The previous implementation read the wrong regex capture groups, so every
 * `**bold**` span was deleted from the published page and every `[text](url)`
 * link silently lost its href. These tests exist so that class of content loss
 * cannot return unnoticed — they assert that no source text is ever dropped.
 */

const render = (text: string) =>
  renderToStaticMarkup(<MemoryRouter>{renderFormattedText(text)}</MemoryRouter>);

describe("renderFormattedText", () => {
  it("keeps bold text instead of deleting it", () => {
    const html = render(
      "your prompts need **Creative Differentiation**: here is why"
    );
    expect(html).toContain("Creative Differentiation");
    expect(html).toContain("<strong");
    // the sentence around the bold span must survive intact
    expect(html).toContain("your prompts need");
    expect(html).toContain("here is why");
  });

  it("preserves list-item labels that use bold markers", () => {
    const html = render(
      "• **Cross-Industry Blending**: Combine unexpected sectors into one concept."
    );
    expect(html).toContain("Cross-Industry Blending");
    expect(html).toContain("Combine unexpected sectors into one concept.");
  });

  it("renders internal links with a working href", () => {
    const html = render("See [our guide](/blogs) for more.");
    expect(html).toContain('href="/blogs"');
    expect(html).toContain("our guide");
    expect(html).toContain("for more.");
  });

  it("renders external links safely", () => {
    const html = render("Read [the docs](https://example.com/spec).");
    expect(html).toContain('href="https://example.com/spec"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("keeps italic text", () => {
    const html = render("This is *emphasis* in a sentence.");
    expect(html).toContain("emphasis");
    expect(html).toContain("<em");
  });

  it("passes plain text through untouched", () => {
    const text = "No markup at all in this sentence.";
    expect(render(text)).toBe(text);
  });

  it("does not drop the tail of a string after a match", () => {
    const html = render("**Bold start** and a plain tail that must survive.");
    expect(html).toContain("and a plain tail that must survive.");
  });

  it("handles multiple formatting types in one paragraph", () => {
    const html = render(
      "**Step 1**: read [the guide](/blogs) then apply *cautiously* to your batch."
    );
    expect(html).toContain("Step 1");
    expect(html).toContain('href="/blogs"');
    expect(html).toContain("cautiously");
    expect(html).toContain("to your batch.");
  });

  it("returns empty string for empty input", () => {
    expect(render("")).toBe("");
  });
});
