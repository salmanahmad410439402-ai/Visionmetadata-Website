import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONVERTER_OPTIONS,
  SAMPLE_ADOBE_BATCH_CSV,
  SAMPLE_FREEPIK_SEMICOLON_CSV,
  extractEditableRows,
  formatAgencyCsv,
  normalizeStockRows,
  parseStockCsv,
  resolveCrosswalkCategories,
} from "../lib/stockCsvConverter";

describe("Multi-Agency Stock CSV Converter & Fixer", () => {
  it("auto-detects Adobe Stock CSV and parses quoted fields with commas cleanly", () => {
    const parsed = parseStockCsv(SAMPLE_ADOBE_BATCH_CSV);
    expect(parsed.delimiter).toBe(",");
    expect(parsed.detectedSource).toBe("adobe");
    expect(parsed.rawRows.length).toBe(5);
    expect(parsed.mapping.filenameCol).toBe(0);
    expect(parsed.mapping.titleCol).toBe(1);
    expect(parsed.mapping.keywordsCol).toBe(2);
    expect(parsed.mapping.categoryCol).toBe(3);
  });

  it("auto-detects Freepik semicolon-delimited CSV and strips leading UTF-8 BOM", () => {
    const withBom = "\uFEFF" + SAMPLE_FREEPIK_SEMICOLON_CSV;
    const parsed = parseStockCsv(withBom);
    expect(parsed.delimiter).toBe(";");
    expect(parsed.detectedSource).toBe("freepik");
    expect(parsed.rawRows.length).toBe(2);

    const editable = extractEditableRows(parsed.rawRows, parsed.mapping);
    const normalized = normalizeStockRows(editable, DEFAULT_CONVERTER_OPTIONS);
    expect(normalized[0].filename).toBe("geometric-abstract-banner.eps");
    // Bridges Freepik Title -> Description automatically for Shutterstock / 123RF
    expect(normalized[0].description).toContain("Seamless geometric Memphis");
  });

  it("deduplicates keywords case-insensitively and flags/replaces restricted trademarks", () => {
    const parsed = parseStockCsv(SAMPLE_ADOBE_BATCH_CSV);
    const editable = extractEditableRows(parsed.rawRows, parsed.mapping);

    // Without auto-replace: flags 'iphone' in row 4 and removes duplicate 'solar panel' in row 1
    const flaggedRows = normalizeStockRows(editable, {
      ...DEFAULT_CONVERTER_OPTIONS,
      autoReplaceTrademarks: false,
    });
    expect(flaggedRows[0].duplicatesRemoved).toBeGreaterThanOrEqual(1);
    expect(flaggedRows[3].trademarksFound.map((t) => t.toLowerCase())).toContain("iphone");

    // With auto-replace enabled: replaces 'iphone' with generic term across title & keywords
    const cleanedRows = normalizeStockRows(editable, {
      ...DEFAULT_CONVERTER_OPTIONS,
      autoReplaceTrademarks: true,
    });
    expect(cleanedRows[3].trademarksFound.length).toBe(0);
    expect(cleanedRows[3].title.toLowerCase()).not.toContain("iphone");
    expect(cleanedRows[3].keywords.map((k) => k.toLowerCase())).not.toContain("iphone");
  });

  it("maps categories across Adobe Stock numeric IDs, Shutterstock labels, and Dreamstime IDs", () => {
    // Adobe 19 = Technology -> Shutterstock 'Technology' & Dreamstime '105'
    const fromAdobe = resolveCrosswalkCategories("19", false);
    expect(fromAdobe.adobeCategoryId).toBe("19");
    expect(fromAdobe.shutterstockCategory).toBe("Technology");
    expect(fromAdobe.dreamstimeCategoryId).toBe("105");

    // Shutterstock 'Food and drink' -> Adobe '7' & Dreamstime '121'
    const fromShutterstock = resolveCrosswalkCategories("Food and drink", false);
    expect(fromShutterstock.adobeCategoryId).toBe("4");
    expect(fromShutterstock.shutterstockCategory).toBe("Food and drink");
    expect(fromShutterstock.dreamstimeCategoryId).toBe("121");
  });

  it("emits byte-verified agency formats (Freepik ;, no-BOM for Vecteezy/Dreamstime, Illustration=Yes for .eps)", () => {
    const parsed = parseStockCsv(SAMPLE_ADOBE_BATCH_CSV);
    const editable = extractEditableRows(parsed.rawRows, parsed.mapping);
    const normalized = normalizeStockRows(editable, DEFAULT_CONVERTER_OPTIONS);

    // 1. Adobe Stock: strips commas inside titles, includes BOM
    const adobeOut = formatAgencyCsv(normalized, "adobe", DEFAULT_CONVERTER_OPTIONS);
    expect(adobeOut.bom).toBe(true);
    const adobeRow1 = adobeOut.content.split("\r\n")[1];
    expect(adobeRow1).toContain(
      '"Commercial rooftop solar panel array at golden hour clean renewable energy infrastructure"'
    );

    // 2. Shutterstock: LF line endings, Illustration=Yes on .eps vector row (row 2)
    const ssOut = formatAgencyCsv(normalized, "shutterstock", DEFAULT_CONVERTER_OPTIONS);
    expect(ssOut.bom).toBe(true);
    const ssLines = ssOut.content.trim().split("\n");
    expect(ssLines[0]).toBe(
      'Filename,Description,Keywords,Categories,Illustration,"Mature Content",Editorial'
    );
    expect(ssLines[2]).toContain("minimalist-fintech-icon-set.eps");
    expect(ssLines[2]).toContain(",Yes,No,No");

    // 3. Freepik: semicolon column delimiter + optional 5-column AI mode
    const fpOut = formatAgencyCsv(normalized, "freepik", {
      ...DEFAULT_CONVERTER_OPTIONS,
      freepikIsAI: true,
      freepikAiModel: "Midjourney 6",
    });
    expect(fpOut.bom).toBe(true);
    expect(fpOut.content.split("\r\n")[0]).toBe(
      '"filename";"title";"tags";"Prompt";"Model"'
    );
    expect(fpOut.content).toContain(';"Midjourney 6"');

    // 4. Vecteezy & Dreamstime: MUST omit UTF-8 BOM
    const vzOut = formatAgencyCsv(normalized, "vecteezy", DEFAULT_CONVERTER_OPTIONS);
    expect(vzOut.bom).toBe(false);
    expect(vzOut.content.split("\n")[0]).toBe(
      '"Filename","Title","Description","Keywords","License","Id"'
    );

    const dtOut = formatAgencyCsv(normalized, "dreamstime", DEFAULT_CONVERTER_OPTIONS);
    expect(dtOut.bom).toBe(false);
    expect(dtOut.content.split("\r\n")[0]).toBe(
      "Filename,Image Name,Description,Category 1,Category 2,Category 3,keywords,Free,W-EL,P-EL,SR-EL,SR-Price,Editorial,MR doc Ids,Pr Docs"
    );

    // 5. 123RF: lowercase headers + space-free comma keywords
    const rfOut = formatAgencyCsv(normalized, "123rf", DEFAULT_CONVERTER_OPTIONS);
    expect(rfOut.bom).toBe(true);
    expect(rfOut.content.split("\r\n")[0]).toBe(
      '"oldfilename","123rf_filename","description","keywords","country"'
    );
    expect(rfOut.content).toContain('"solar panel,renewable energy,rooftop solar');
  });

  it("expands companion vector rows when requested", () => {
    const parsed = parseStockCsv(SAMPLE_ADOBE_BATCH_CSV);
    const editable = extractEditableRows(parsed.rawRows, parsed.mapping).slice(0, 1);
    const expanded = normalizeStockRows(editable, {
      ...DEFAULT_CONVERTER_OPTIONS,
      companionVectorExt: "eps",
    });
    expect(expanded.length).toBe(2);
    expect(expanded[0].filename).toBe("rooftop-solar-installation-01.jpg");
    expect(expanded[1].filename).toBe("rooftop-solar-installation-01.eps");
  });
});
