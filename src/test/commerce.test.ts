import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  SELLER,
  PAYMENT_RAILS,
  ORDER_STEPS,
  FRAUD_NOTICE,
  waLink,
  mailLink,
  makeOrderReference,
} from "@/config/commerce";

/**
 * Guards for the commerce configuration.
 *
 * These details were previously hard-coded across the pricing page, the contact
 * page and the prerender step, which is how the site ended up publishing two
 * different licence-delivery promises and a struck-through "discount" price that
 * nobody could explain. The tests below keep the commercial facts in one place
 * and make sure a component cannot quietly reintroduce a raw account number.
 */

const SRC_DIR = path.resolve(__dirname, "..");
const COMMERCE_FILE = path.join(SRC_DIR, "config", "commerce.ts");

/**
 * `prerender.ts` and `index.html` are checked alongside `src/` because the
 * crawler-facing HTML is where the drift actually happened: the live pricing page
 * and the prerendered copy disagreed about the same account number, and nothing
 * failed, because the guard only looked at components.
 */
const ROOT_FILES = [path.resolve(__dirname, "..", "..", "prerender.ts"),
                    path.resolve(__dirname, "..", "..", "index.html")];

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

describe("commerce config", () => {
  it("identifies the seller with the account title used on every rail", () => {
    expect(SELLER.operator).toBe("Salman Ahmad");
    for (const rail of PAYMENT_RAILS) {
      const title = rail.fields.find((f) => f.label === "Account title");
      if (title) expect(title.value).toBe(SELLER.operator);
    }
  });

  it("does not invent a legal entity or business address", () => {
    // Only set these once they can actually be evidenced.
    expect(SELLER.legalEntity === null || typeof SELLER.legalEntity === "string").toBe(true);
    expect(SELLER.businessAddress === null || typeof SELLER.businessAddress === "string").toBe(
      true
    );
  });

  it("states the order process in order, ending with delivery", () => {
    expect(ORDER_STEPS).toHaveLength(4);
    expect(ORDER_STEPS[ORDER_STEPS.length - 1].title.toLowerCase()).toContain("licence key");
  });

  it("warns buyers about impersonation, since details are public", () => {
    expect(FRAUD_NOTICE).toMatch(/never message you first/i);
    expect(FRAUD_NOTICE).toMatch(/Salman Ahmad/);
  });

  it("builds a prefilled WhatsApp link on the configured number", () => {
    const link = waLink("Hello there");
    expect(link).toBe(`https://wa.me/${SELLER.whatsapp}?text=Hello%20there`);
  });

  it("builds a prefilled mailto link on the support address", () => {
    const link = mailLink("Subject line", "Body text");
    expect(link.startsWith(`mailto:${SELLER.supportEmail}?subject=`)).toBe(true);
    expect(link).toContain("Subject%20line");
  });

  it("generates a readable, unique order reference", () => {
    const ref = makeOrderReference(new Date("2026-10-15T00:00:00Z"));
    expect(ref).toMatch(/^TGY-202610-[A-Z0-9]{4}$/);
    const many = new Set(Array.from({ length: 50 }, () => makeOrderReference()));
    expect(many.size).toBeGreaterThan(40);
  });
});

describe("payment details stay in one place", () => {
  const sources = [
    ...walk(SRC_DIR).filter(
      (file) => file !== COMMERCE_FILE && !file.includes(`${path.sep}test${path.sep}`)
    ),
    ...ROOT_FILES.filter((file) => fs.existsSync(file)),
  ];

  const identifiers = [
    "PK48JCMA1409923297409088",
    "50010112691566",
    "03297409088",
    "0329 7409088",
  ];

  it.each(identifiers)("does not hard-code %s outside the commerce config", (value) => {
    const offenders = sources.filter((file) => fs.readFileSync(file, "utf-8").includes(value));
    expect(offenders).toEqual([]);
  });

  /** Removes comments so that documenting a past problem in a code comment does
   *  not itself trip the checks below. */
  const withoutComments = (source: string) =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

  it("keeps delivery promises out of components", () => {
    // The old copy promised keys "within minutes" in one place and "within 24
    // hours" in another. Neither belongs in a component.
    const offenders = sources.filter((file) =>
      /within minutes/i.test(withoutComments(fs.readFileSync(file, "utf-8")))
    );
    expect(offenders).toEqual([]);
  });

  it("builds the prerendered payment copy from the commerce config", () => {
    // Every rail and every order step must still reach the crawler-facing HTML by
    // interpolation. If someone pastes a rail back in as a literal, this fails.
    const prerender = fs.readFileSync(
      path.resolve(__dirname, "..", "..", "prerender.ts"),
      "utf-8"
    );
    expect(prerender).toContain("PAYMENT_RAILS.map");
    expect(prerender).toContain("ORDER_STEPS.map");
    expect(prerender).toContain("FRAUD_NOTICE");
    expect(prerender).toContain("SELLER.supportEmail");
  });

  it("keeps the support e-mail address out of components", () => {
    const offenders = sources.filter((file) =>
      withoutComments(fs.readFileSync(file, "utf-8")).includes(SELLER.supportEmail)
    );
    expect(offenders).toEqual([]);
  });
});
