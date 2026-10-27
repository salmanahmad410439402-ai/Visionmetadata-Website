import { describe, expect, it } from "vitest";
import {
  STOCK_CALENDAR_EVENTS,
  findEventsNearDate,
  resolveAllEvents,
} from "../data/stockEvents";
import { findTrademarks } from "../lib/trademarkSniffer";

describe("Stock Contributor Event Calendar Dataset & Timing Engine", () => {
  it("covers all 12 calendar months with unique IDs and complete briefs", () => {
    expect(STOCK_CALENDAR_EVENTS.length).toBeGreaterThanOrEqual(45);

    const ids = new Set<string>();
    const monthsCovered = new Set<number>();

    for (const ev of STOCK_CALENDAR_EVENTS) {
      expect(ids.has(ev.id), `duplicate event id: ${ev.id}`).toBe(false);
      ids.add(ev.id);
      expect(ev.month).toBeGreaterThanOrEqual(1);
      expect(ev.month).toBeLessThanOrEqual(12);
      monthsCovered.add(ev.month);

      expect(ev.intro.length, `${ev.id} intro`).toBeGreaterThan(40);
      expect(ev.photoIdea.length, `${ev.id} photoIdea`).toBeGreaterThan(20);
      expect(ev.vectorIdea.length, `${ev.id} vectorIdea`).toBeGreaterThan(20);
      expect(ev.videoIdea.length, `${ev.id} videoIdea`).toBeGreaterThan(20);
      expect(ev.safeKeywords.length, `${ev.id} safeKeywords`).toBeGreaterThanOrEqual(8);
    }

    expect(monthsCovered.size).toBe(12);
  });

  it("ensures every recommended safe keyword passes the trademark sniffer with zero restricted brands", () => {
    for (const ev of STOCK_CALENDAR_EVENTS) {
      const hits = findTrademarks(ev.safeKeywords.join(", "));
      expect(
        hits,
        `Event "${ev.id}" contains restricted trademark(s) in safeKeywords: ${hits.join(", ")}`
      ).toEqual([]);
    }
  });

  it("resolves upcoming countdowns, movable dates, and upload-window-now flags from a reference date", () => {
    const refDate = new Date(2026, 9, 26); // October 26, 2026
    const resolved = resolveAllEvents(refDate);

    // Sorted by daysUntil ascending
    expect(resolved[0].id).toBe("halloween-spooky-season");
    expect(resolved[0].daysUntil).toBe(5);

    // Movable date check: Black Friday 2026 is Nov 27, 2026 (32 days after Oct 26, 2026)
    const blackFriday = resolved.find((e) => e.id === "black-friday-sale");
    expect(blackFriday).toBeDefined();
    expect(blackFriday!.nextDate.getFullYear()).toBe(2026);
    expect(blackFriday!.nextDate.getMonth()).toBe(10); // November (0-indexed)
    expect(blackFriday!.nextDate.getDate()).toBe(27);
    expect(blackFriday!.daysUntil).toBe(32);

    // Past 2026 movable holiday rolls into 2027 override: Ramadan 2027 starts Feb 8, 2027
    const ramadan = resolved.find((e) => e.id === "ramadan-season");
    expect(ramadan).toBeDefined();
    expect(ramadan!.nextDate.getFullYear()).toBe(2027);
    expect(ramadan!.nextDate.getMonth()).toBe(1); // February (0-indexed)
    expect(ramadan!.nextDate.getDate()).toBe(8);

    // Upload window open right now in late October includes December/January peak events (Christmas, New Year)
    const christmas = resolved.find((e) => e.id === "christmas-holiday-season");
    expect(christmas).toBeDefined();
    expect(christmas!.inUploadWindowNow).toBe(true);
  });

  it("searches events by exact date and ±14 day proximity", () => {
    const resolved = resolveAllEvents(new Date(2026, 9, 26));

    // Exact match for Feb 14 (Valentine's Day sorted first by Peak demand)
    const nearFeb14 = findEventsNearDate(resolved, 2, 14, 14);
    expect(nearFeb14.length).toBeGreaterThanOrEqual(2);
    expect(nearFeb14[0].id).toBe("valentines-day");
    expect(nearFeb14[0].dayDistance).toBe(0);

    // Year-boundary wraparound check (Dec 31 finds both New Year's Eve and Jan 1 New Year's Day)
    const nearNewYear = findEventsNearDate(resolved, 12, 31, 5);
    const ids = nearNewYear.map((e) => e.id);
    expect(ids).toContain("new-years-eve-year-in-review");
    expect(ids).toContain("new-years-day");
  });
});
