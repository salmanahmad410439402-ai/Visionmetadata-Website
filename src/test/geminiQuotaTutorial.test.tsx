import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TutorialsSection, { GEMINI_QUOTA_VIDEO_ID } from "@/components/TutorialsSection";
import ToolGuide from "@/components/tool/ToolGuide";
import { videoTutorialSchema } from "@/lib/structuredData";
import { formatErrorForUser, isQuotaOrRateLimitError } from "@/lib/errorSanitizer";
import {
  OPEN_QUOTA_TUTORIAL_EVENT,
  QuotaTutorialModal,
  openQuotaTutorialModal,
} from "@/components/software-ui/modals/QuotaTutorialModal";

const ROOT = path.resolve(__dirname, "../..");

describe("Gemini API Multi-Project Free Quota Tutorial Integration", () => {
  it("renders a responsive, lazy-loaded, non-autoplaying YouTube embed on /tutorials", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/tutorials"]}>
        <TutorialsSection />
      </MemoryRouter>
    );

    expect(GEMINI_QUOTA_VIDEO_ID).toBe("58nm1hZVvTs");

    expect(
      screen.getByRole("heading", {
        name: /How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects/i,
      })
    ).toBeInTheDocument();

    const iframe = screen.getByTitle(
      "How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects"
    ) as HTMLIFrameElement;

    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("src")).toBe("https://www.youtube.com/embed/58nm1hZVvTs?rel=0");
    expect(iframe.getAttribute("src")).not.toContain("autoplay=1");
    expect(iframe.getAttribute("loading")).toBe("lazy");
    expect(iframe.getAttribute("allow") ?? "").not.toContain("autoplay");
    expect(iframe.hasAttribute("allowfullscreen")).toBe(true);

    // Responsive 16:9 wrapper check
    const wrapper = iframe.parentElement;
    expect(wrapper?.className).toContain("aspect-video");

    // Anchor target exists for contextual deep-links from /tool and SettingsModal
    expect(container.querySelector("#gemini-api-quota-tutorial")).not.toBeNull();

    // Core educational distinction is clearly communicated
    expect(screen.getByText(/Common Mistake · 1 Project, Multiple Keys/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct Setup · Multiple Projects, 1 Key Each/i)).toBeInTheDocument();
  });

  it("integrates contextual lazy-loaded video tutorial and deep-link inside ToolGuide", () => {
    render(
      <MemoryRouter initialEntries={["/tool"]}>
        <ToolGuide />
      </MemoryRouter>
    );

    const iframe = screen.getByTitle(
      "How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects"
    ) as HTMLIFrameElement;

    expect(iframe.getAttribute("src")).toBe("https://www.youtube.com/embed/58nm1hZVvTs?rel=0");
    expect(iframe.getAttribute("src")).not.toContain("autoplay=1");
    expect(iframe.getAttribute("loading")).toBe("lazy");

    const fullBreakdownLink = screen.getByRole("link", {
      name: /Read full breakdown on the Tutorials page/i,
    });
    expect(fullBreakdownLink.getAttribute("href")).toBe("/tutorials#gemini-api-quota-tutorial");
  });

  it("emits accurate VideoObject structured data for video 58nm1hZVvTs", () => {
    const schema = videoTutorialSchema({
      videoId: "58nm1hZVvTs",
      name: "How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects",
      description: "Step-by-step multi-project Gemini quota guide.",
      uploadDate: "2026-10-30",
    });

    expect(schema["@type"]).toBe("VideoObject");
    expect(schema.embedUrl).toBe("https://www.youtube.com/embed/58nm1hZVvTs");
    expect(schema.contentUrl).toBe("https://www.youtube.com/watch?v=58nm1hZVvTs");
    expect(schema.thumbnailUrl).toContain("https://i.ytimg.com/vi/58nm1hZVvTs/hqdefault.jpg");
  });

  it("keeps prerendered /tutorials static HTML synchronized with the Gemini quota video tutorial", () => {
    const distTutorials = path.join(ROOT, "dist/tutorials/index.html");
    if (!fs.existsSync(distTutorials)) return;

    const html = fs.readFileSync(distTutorials, "utf8");
    expect(html).toContain("58nm1hZVvTs");
    expect(html).toContain("How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects");
    expect(html).toContain('"@type":"VideoObject"');
    expect(html).toContain('id="gemini-api-quota-tutorial"');
  });

  it("accurately classifies quota & rate-limit errors without misclassifying auth or file errors", () => {
    expect(isQuotaOrRateLimitError(new Error("Rate limit exceeded (429)"))).toBe(true);
    expect(isQuotaOrRateLimitError(new Error("RESOURCE_EXHAUSTED: Quota exceeded for metric"))).toBe(true);
    expect(
      isQuotaOrRateLimitError(
        new Error("All API keys exhausted.\nLast error: Rate limit exceeded (429)\n\nFix: Add more keys in Settings.")
      )
    ).toBe(true);

    // Non-quota errors must return false
    expect(isQuotaOrRateLimitError(new Error("401 Unauthorized: Invalid API key"))).toBe(false);
    expect(isQuotaOrRateLimitError(new Error("Failed to read corrupted image file"))).toBe(false);

    const formatted = formatErrorForUser(new Error("RESOURCE_EXHAUSTED: Quota exceeded"));
    expect(formatted).toMatch(/Free API quota or rate limit reached/i);
    expect(isQuotaOrRateLimitError(formatted)).toBe(true);
  });

  it("opens the in-app QuotaTutorialModal without losing session state and hands off to Settings", () => {
    const onOpenSettings = vi.fn();
    const onOpenChange = vi.fn();
    const eventSpy = vi.fn();

    window.addEventListener(OPEN_QUOTA_TUTORIAL_EVENT, eventSpy);
    openQuotaTutorialModal();
    expect(eventSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_QUOTA_TUTORIAL_EVENT, eventSpy);

    render(
      <QuotaTutorialModal
        open={true}
        onOpenChange={onOpenChange}
        onOpenSettings={onOpenSettings}
      />
    );

    const iframe = screen.getByTitle(
      "How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects"
    ) as HTMLIFrameElement;

    expect(iframe.getAttribute("src")).toBe("https://www.youtube.com/embed/58nm1hZVvTs?rel=0");
    expect(iframe.getAttribute("src")).not.toContain("autoplay=1");
    expect(iframe.getAttribute("loading")).toBe("lazy");

    fireEvent.click(screen.getByRole("button", { name: /Add New Key in Settings/i }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
