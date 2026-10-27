import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONTRIBUTOR_TOOLS,
  OPEN_TOOLS_GUIDE_EVENT,
  openToolsGuideModal,
} from "../data/contributorTools";
import { isAdSenseEligiblePath } from "../components/ads/AdSenseLoader";

const ROOT = path.resolve(__dirname, "../..");

describe("Contributor Toolkit Discovery Guide & AdSense Popup Compliance", () => {
  it("defines the 4-step free contributor toolkit with clear scenario guidance", () => {
    expect(CONTRIBUTOR_TOOLS).toHaveLength(4);
    expect(CONTRIBUTOR_TOOLS.map((t) => t.step)).toEqual([1, 2, 3, 4]);
    expect(CONTRIBUTOR_TOOLS.map((t) => t.to)).toEqual([
      "/event-calendar",
      "/tool",
      "/metadata-checker",
      "/stock-csv-converter",
    ]);

    for (const tool of CONTRIBUTOR_TOOLS) {
      expect(tool.whatItDoes.length).toBeGreaterThan(40);
      expect(tool.useWhen.length).toBeGreaterThan(35);
      expect(tool.highlights.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("ensures the homepage (where What's New auto-opens once) and all 4 tool routes are AdSense-free", () => {
    expect(isAdSenseEligiblePath("/")).toBe(false);
    for (const tool of CONTRIBUTOR_TOOLS) {
      expect(isAdSenseEligiblePath(tool.to)).toBe(false);
    }
  });

  it("dispatches openToolsGuideModal custom events with the requested tool filter", () => {
    let receivedDetail: unknown = null;
    const listener = (e: Event) => {
      receivedDetail = (e as CustomEvent).detail;
    };
    window.addEventListener(OPEN_TOOLS_GUIDE_EVENT, listener);
    openToolsGuideModal("csv-converter");
    window.removeEventListener(OPEN_TOOLS_GUIDE_EVENT, listener);

    expect(receivedDetail).toEqual({ toolId: "csv-converter" });
  });

  it("prerenders all 4 free browser tool links onto the static homepage HTML", () => {
    const distHome = path.join(ROOT, "dist/index.html");
    if (!fs.existsSync(distHome)) return;

    const html = fs.readFileSync(distHome, "utf8");
    for (const tool of CONTRIBUTOR_TOOLS) {
      expect(html).toContain(`href="${tool.to}"`);
    }
  });
});
