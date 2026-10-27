import { describe, expect, it } from "vitest";
import {
  SAMPLE_BROKEN_CSV_FOR_VERIFY,
  SAMPLE_CLEAN_CSV_FOR_VERIFY,
  auditCsvFile,
  buildCleanedVerifiedCsv,
} from "../lib/metadataValidator";
import { SAMPLE_FREEPIK_SEMICOLON_CSV } from "../lib/stockCsvConverter";

describe("Metadata Checker — Full CSV File Verification Engine", () => {
  it("passes a clean Adobe Stock CSV across structural and row-level checks", () => {
    const report = auditCsvFile(SAMPLE_CLEAN_CSV_FOR_VERIFY, {
      hasUtf8Bom: true,
      targetAgency: "adobe",
    });
    expect(report.effectiveAgency).toBe("adobe");
    expect(report.totalRows).toBe(3);
    expect(report.failRows).toBe(0);
    expect(report.overallStatus).toBe("PASS");
    expect(report.fileChecks.every((fc) => fc.status === "PASS")).toBe(true);
  });

  it("flags UTF-8 BOM, duplicate filenames, trademarks, and low keyword counts on Vecteezy", () => {
    const report = auditCsvFile(SAMPLE_BROKEN_CSV_FOR_VERIFY, {
      hasUtf8Bom: true,
      targetAgency: "vecteezy",
    });
    expect(report.overallStatus).toBe("FAIL");

    const bomCheck = report.fileChecks.find((c) => c.id === "bom");
    expect(bomCheck?.status).toBe("FAIL");

    const dupFileCheck = report.fileChecks.find((c) => c.id === "duplicate-filenames");
    expect(dupFileCheck?.status).toBe("FAIL");

    expect(report.failRows).toBeGreaterThanOrEqual(2);
    // Row 3 has 'no people' in slot #1 -> triggers warning
    expect(report.rowAudits[2].targetStatus).toBe("WARN");
  });

  it("enforces semicolon delimiter and lowercase headers for Freepik", () => {
    // Comma-delimited Adobe CSV tested against Freepik must fail delimiter + header checks
    const wrongForFreepik = auditCsvFile(SAMPLE_CLEAN_CSV_FOR_VERIFY, {
      targetAgency: "freepik",
    });
    expect(wrongForFreepik.fileChecks.find((c) => c.id === "delimiter")?.status).toBe("FAIL");
    expect(wrongForFreepik.fileChecks.find((c) => c.id === "headers")?.status).toBe("FAIL");

    // Official semicolon Freepik CSV passes delimiter + header checks
    const validFreepik = auditCsvFile(SAMPLE_FREEPIK_SEMICOLON_CSV, {
      targetAgency: "freepik",
    });
    expect(validFreepik.fileChecks.find((c) => c.id === "delimiter")?.status).toBe("PASS");
    expect(validFreepik.fileChecks.find((c) => c.id === "headers")?.status).toBe("PASS");
  });

  it("detects unquoted comma ragged rows", () => {
    const raggedCsv =
      `"Filename","Title","Keywords","Category","Releases"\n` +
      `photo-01.jpg,Unquoted title, with extra comma,"solar, panel, energy, roof, sun, sky",19,\n`;
    const report = auditCsvFile(raggedCsv, { targetAgency: "adobe" });
    expect(report.fileChecks.find((c) => c.id === "column-count")?.status).toBe("FAIL");
    expect(report.overallStatus).toBe("FAIL");
  });

  it("auto-fixes trademarks, commas, BOM, headers, and Top-10 generic tags via buildCleanedVerifiedCsv", () => {
    const singleFlawedCsv =
      `"Filename","Title","Keywords","Category","Releases"\n` +
      `"office-desk.jpg","Businesswoman using Apple MacBook, holding iPhone","photo, background, iphone, macbook, businesswoman, businesswoman, laptop, office, corporate, sunlit workspace, productivity, desk","3",""`;

    const fixed = buildCleanedVerifiedCsv(singleFlawedCsv, "vecteezy");
    expect(fixed.bom).toBe(false); // Vecteezy requires no BOM

    const reAudit = auditCsvFile(fixed.content, {
      hasUtf8Bom: fixed.bom,
      targetAgency: "vecteezy",
    });
    expect(reAudit.failRows).toBe(0);
    expect(reAudit.fileChecks.every((fc) => fc.status === "PASS")).toBe(true);
    expect(fixed.content.toLowerCase()).not.toContain("iphone");
    expect(fixed.content.toLowerCase()).not.toContain("macbook");
  });
});
