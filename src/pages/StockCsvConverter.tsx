import { useCallback, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import JSZip from "jszip";
import {
  FileSpreadsheet,
  Upload,
  Download,
  Archive,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  SlidersHorizontal,
  Trash2,
  Plus,
  RotateCcw,
  FileCode2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JsonLd, breadcrumbSchema } from "@/lib/structuredData";
import {
  type ColumnMapping,
  type ConverterOptions,
  type DetectedSourceId,
  type RawEditableRow,
  type TargetAgencyId,
  DEFAULT_CONVERTER_OPTIONS,
  SAMPLE_ADOBE_BATCH_CSV,
  SAMPLE_FREEPIK_SEMICOLON_CSV,
  TARGET_AGENCY_SPECS,
  extractEditableRows,
  formatAgencyCsv,
  normalizeStockRows,
  parseStockCsv,
} from "@/lib/stockCsvConverter";
import { toast } from "sonner";

const CONVERTER_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tagyfy Pro Multi-Agency Stock CSV Converter & Fixer",
  url: "https://tagyfy.com/stock-csv-converter",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any modern browser",
  description:
    "Convert one stock metadata CSV spreadsheet into upload-ready CSV files for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF locally in your browser with automatic delimiter, BOM, category, and trademark fixing.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const StockCsvConverter = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sourceFilename, setSourceFilename] = useState<string>("sample-adobe-batch.csv");
  const [rawText, setRawText] = useState<string>(SAMPLE_ADOBE_BATCH_CSV);
  const [forcedDelimiter, setForcedDelimiter] = useState<"auto" | "," | ";" | "\t">("auto");
  const [detectedSource, setDetectedSource] = useState<DetectedSourceId>("adobe");
  const [detectedLabel, setDetectedLabel] = useState<string>("Adobe Stock CSV");
  const [activeDelimiter, setActiveDelimiter] = useState<"," | ";" | "\t">(",");
  const [headers, setHeaders] = useState<string[]>([
    "Filename",
    "Title",
    "Keywords",
    "Category",
    "Releases",
  ]);
  const [rawMatrixRows, setRawMatrixRows] = useState<string[][]>(() => {
    const initial = parseStockCsv(SAMPLE_ADOBE_BATCH_CSV);
    return initial.rawRows;
  });
  const [mapping, setMapping] = useState<ColumnMapping>(() => {
    const initial = parseStockCsv(SAMPLE_ADOBE_BATCH_CSV);
    return initial.mapping;
  });
  const [editableRows, setEditableRows] = useState<RawEditableRow[]>(() => {
    const initial = parseStockCsv(SAMPLE_ADOBE_BATCH_CSV);
    return extractEditableRows(initial.rawRows, initial.mapping);
  });

  const [options, setOptions] = useState<ConverterOptions>(DEFAULT_CONVERTER_OPTIONS);
  const [selectedPreviewAgency, setSelectedPreviewAgency] = useState<TargetAgencyId>("shutterstock");
  const [showMappingPanel, setShowMappingPanel] = useState<boolean>(false);
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<"all" | "warnings">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedPreview, setCopiedPreview] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const loadRawCsv = useCallback(
    (
      csvContent: string,
      labelFilename: string,
      delimOverride: "auto" | "," | ";" | "\t" = "auto"
    ) => {
      const parsed = parseStockCsv(
        csvContent,
        delimOverride === "auto" ? undefined : delimOverride
      );
      setRawText(csvContent);
      setSourceFilename(labelFilename);
      setActiveDelimiter(parsed.delimiter);
      setHeaders(parsed.headers);
      setRawMatrixRows(parsed.rawRows);
      setDetectedSource(parsed.detectedSource);
      setDetectedLabel(parsed.detectedLabel);
      setMapping(parsed.mapping);
      setEditableRows(extractEditableRows(parsed.rawRows, parsed.mapping));
    },
    []
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        if (!text.trim()) {
          toast.error("The selected file appears to be empty.");
          return;
        }
        setForcedDelimiter("auto");
        loadRawCsv(text, file.name, "auto");
        toast.success(`Loaded ${file.name}`);
      } catch {
        toast.error("Could not read CSV file in browser.");
      }
    },
    [loadRawCsv]
  );

  const handleDelimiterChange = (next: "auto" | "," | ";" | "\t") => {
    setForcedDelimiter(next);
    loadRawCsv(rawText, sourceFilename, next);
  };

  const handleMappingChange = (field: keyof ColumnMapping, colIndex: number) => {
    const updated: ColumnMapping = { ...mapping, [field]: colIndex };
    setMapping(updated);
    setEditableRows(extractEditableRows(rawMatrixRows, updated));
  };

  const normalizedRows = useMemo(
    () => normalizeStockRows(editableRows, options),
    [editableRows, options]
  );

  const stats = useMemo(() => {
    let duplicatesRemoved = 0;
    let commaTitles = 0;
    let trademarkRows = 0;
    let warningRows = 0;

    for (const r of normalizedRows) {
      duplicatesRemoved += r.duplicatesRemoved;
      if (r.hadCommaInTitle) commaTitles++;
      if (r.trademarksFound.length > 0) trademarkRows++;
      if (r.warnings.length > 0) warningRows++;
    }

    return {
      totalRows: normalizedRows.length,
      duplicatesRemoved,
      commaTitles,
      trademarkRows,
      warningRows,
    };
  }, [normalizedRows]);

  const filteredTableRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return editableRows.filter((row, idx) => {
      const norm = normalizedRows[idx];
      if (filterMode === "warnings" && (!norm || norm.warnings.length === 0)) {
        return false;
      }
      if (!q) return true;
      return (
        row.filename.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.keywordsRaw.toLowerCase().includes(q)
      );
    });
  }, [editableRows, normalizedRows, filterMode, searchQuery]);

  const activeAgencySpec = useMemo(
    () =>
      TARGET_AGENCY_SPECS.find((s) => s.id === selectedPreviewAgency) ??
      TARGET_AGENCY_SPECS[0],
    [selectedPreviewAgency]
  );

  const previewFormatted = useMemo(
    () => formatAgencyCsv(normalizedRows, selectedPreviewAgency, options),
    [normalizedRows, selectedPreviewAgency, options]
  );

  const handleRowEdit = (
    rowId: string,
    field: keyof Omit<RawEditableRow, "id">,
    value: string
  ) => {
    setEditableRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteRow = (rowId: string) => {
    setEditableRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleAddBlankRow = () => {
    const nextNum = editableRows.length + 1;
    setEditableRows((prev) => [
      ...prev,
      {
        id: `row-custom-${Date.now()}`,
        filename: `new-asset-${String(nextNum).padStart(2, "0")}.jpg`,
        title: "",
        description: "",
        keywordsRaw: "",
        categoryRaw: "3",
        editorialRaw: "",
        promptRaw: "",
      },
    ]);
  };

  const handleDownloadSingle = (agencyId: TargetAgencyId) => {
    if (normalizedRows.length === 0) {
      toast.error("Add or upload at least one row before exporting.");
      return;
    }
    const spec = TARGET_AGENCY_SPECS.find((s) => s.id === agencyId)!;
    const { content, bom } = formatAgencyCsv(normalizedRows, agencyId, options);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const payload = bom ? "\uFEFF" + content : content;
    const blob = new Blob([payload], { type: "text/csv;charset=utf-8;" });
    const outName = `tagyfy-${spec.fileSlug}-${dateStamp}.csv`;
    triggerBrowserDownload(blob, outName);
    toast.success(`Downloaded ${spec.name} CSV (${normalizedRows.length} rows)`);
  };

  const handleDownloadAllZip = async () => {
    if (normalizedRows.length === 0) {
      toast.error("Add or upload at least one row before exporting.");
      return;
    }
    try {
      const zip = new JSZip();
      const dateStamp = new Date().toISOString().slice(0, 10);
      const sixAgencies: TargetAgencyId[] = [
        "adobe",
        "shutterstock",
        "freepik",
        "vecteezy",
        "dreamstime",
        "123rf",
      ];

      for (const agencyId of sixAgencies) {
        const spec = TARGET_AGENCY_SPECS.find((s) => s.id === agencyId)!;
        const { content, bom } = formatAgencyCsv(normalizedRows, agencyId, options);
        const payload = bom ? "\uFEFF" + content : content;
        zip.file(`tagyfy-${spec.fileSlug}-${dateStamp}.csv`, payload);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      triggerBrowserDownload(zipBlob, `tagyfy-all-6-agencies-${dateStamp}.zip`);
      toast.success(
        `Downloaded ZIP bundle with all 6 agency CSVs (${normalizedRows.length} rows each)`
      );
    } catch {
      toast.error("Failed to package ZIP archive in browser.");
    }
  };

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewFormatted.content);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 1800);
      toast.success(`Copied ${activeAgencySpec.name} CSV to clipboard`);
    } catch {
      toast.error("Clipboard copy blocked by browser.");
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      <Helmet>
        <title>
          Free Multi-Agency Stock CSV Converter &amp; Fixer — Adobe Stock, Shutterstock &amp; Freepik | Tagyfy Pro
        </title>
        <meta
          name="description"
          content="Convert one stock metadata CSV into upload-ready spreadsheets for Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF in your browser. Fixes delimiters, UTF-8 BOM, categories, duplicates, and trademarks with no API key."
        />
        <link rel="canonical" href="https://tagyfy.com/stock-csv-converter" />
      </Helmet>

      <JsonLd
        data={[
          CONVERTER_SCHEMA,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Stock CSV Converter", path: "/stock-csv-converter" },
          ]),
        ]}
      />

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          100% Client-Side Utility · Zero API Key · Instant 6-Agency Batch Export
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Multi-Agency Stock CSV Converter &amp; Fixer
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
          Upload one CSV spreadsheet — from <strong>Adobe Stock</strong>, <strong>Shutterstock</strong>,{" "}
          <strong>Freepik</strong>, <strong>Vecteezy</strong>, <strong>Dreamstime</strong>, <strong>123RF</strong>,
          Lightroom, or Excel — and convert the entire batch into verified upload files for all six stock portals at
          once. Automatically handles Freepik semicolons (<code>;</code>), BOM/no-BOM encoding rules, category
          crosswalk mapping, duplicate keywords, and restricted trademark checks locally in your browser.
        </p>

        {/* Preset & Upload Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 font-semibold"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload CSV / TSV File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
              e.target.value = "";
            }}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setForcedDelimiter("auto");
              loadRawCsv(SAMPLE_ADOBE_BATCH_CSV, "sample-adobe-batch.csv", "auto");
              toast.info("Loaded 5-row Adobe Stock sample batch");
            }}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Sample: Adobe Stock CSV (5 rows)
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setForcedDelimiter("auto");
              loadRawCsv(SAMPLE_FREEPIK_SEMICOLON_CSV, "sample-freepik-semicolon.csv", "auto");
              toast.info("Loaded semicolon-delimited Freepik sample CSV");
            }}
            className="gap-1.5 text-xs"
          >
            <FileCode2 className="w-3.5 h-3.5 text-emerald-500" />
            Sample: Freepik Semicolon CSV
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPasteBox((v) => !v)}
            className="text-xs"
          >
            {showPasteBox ? "Hide Raw CSV Paste Box" : "Paste Raw CSV Text"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMappingPanel((v) => !v)}
            className="gap-1.5 text-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showMappingPanel ? "Hide Column Mapping" : "Column Mapping"}
          </Button>
        </div>
      </header>

      {/* Drag-and-Drop Zone + Detection Summary */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFileUpload(f);
        }}
        className={`rounded-2xl border-2 border-dashed p-5 transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border bg-card/50 hover:border-primary/40"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">{sourceFilename}</span>
              <Badge variant="secondary" className="text-[11px]">
                Detected: {detectedLabel}
              </Badge>
              <Badge variant="outline" className="text-[11px] font-mono">
                Delimiter: {activeDelimiter === ";" ? "Semicolon (;)" : activeDelimiter === "\t" ? "Tab" : "Comma (,)"}
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                {stats.totalRows} {stats.totalRows === 1 ? "row" : "rows"} ready
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag &amp; drop any <code>.csv</code> file onto this card to replace the current batch. Nothing is
              uploaded to a server.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground font-medium" htmlFor="delimiter-select">
              Input delimiter:
            </label>
            <select
              id="delimiter-select"
              value={forcedDelimiter}
              onChange={(e) =>
                handleDelimiterChange(e.target.value as "auto" | "," | ";" | "\t")
              }
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
            >
              <option value="auto">Auto-detect</option>
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="&#9;">Tab (\t)</option>
            </select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditableRows([]);
                setSourceFilename("empty-batch.csv");
              }}
              className="text-xs text-muted-foreground gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Rows
            </Button>
          </div>
        </div>

        {/* Optional Paste Raw CSV Box */}
        {showPasteBox && (
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <label htmlFor="raw-csv-paste" className="text-xs font-semibold text-foreground block">
              Paste raw CSV or semicolon-separated rows (including header line):
            </label>
            <textarea
              id="raw-csv-paste"
              rows={5}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                loadRawCsv(e.target.value, "pasted-spreadsheet.csv", forcedDelimiter);
              }}
              placeholder='"Filename","Title","Keywords","Category","Releases"'
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        )}

        {/* Optional Column Mapping Override */}
        {showMappingPanel && headers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Source Column Mapping ({detectedSource.toUpperCase()})
              </p>
              <span className="text-[11px] text-muted-foreground">
                Override if your custom spreadsheet uses non-standard column headers
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {(
                [
                  ["filenameCol", "Filename"],
                  ["titleCol", "Title"],
                  ["descriptionCol", "Description"],
                  ["keywordsCol", "Keywords / Tags"],
                  ["categoryCol", "Category"],
                  ["editorialCol", "Editorial"],
                  ["promptCol", "AI Prompt"],
                ] as Array<[keyof ColumnMapping, string]>
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground block">
                    {label}
                  </label>
                  <select
                    value={mapping[key]}
                    onChange={(e) => handleMappingChange(key, Number(e.target.value))}
                    className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground"
                  >
                    <option value={-1}>— Not mapped —</option>
                    {headers.map((h, idx) => (
                      <option key={`${h}-${idx}`} value={idx}>
                        Col {idx + 1}: {h || "(blank)"}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Fixer Controls + Batch Diagnostics Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Hygiene & Agency Options */}
        <section className="lg:col-span-5 rounded-2xl border border-border bg-card/60 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              1. Hygiene &amp; Compliance Fixer Rules
            </h2>
            <Badge variant="outline" className="text-[10px]">
              Live Transform
            </Badge>
          </div>

          {/* Batch Health Counters */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <span className="text-muted-foreground block text-[11px]">Duplicate Tags Cleaned</span>
              <span className="text-lg font-black text-emerald-500">{stats.duplicatesRemoved}</span>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <span className="text-muted-foreground block text-[11px]">Adobe Title Commas Fixed</span>
              <span className="text-lg font-black text-primary">{stats.commaTitles}</span>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <span className="text-muted-foreground block text-[11px]">Trademark Rows Flagged</span>
              <span
                className={`text-lg font-black ${
                  stats.trademarkRows > 0 ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {stats.trademarkRows}
              </span>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <span className="text-muted-foreground block text-[11px]">Rows Needing Review</span>
              <span
                className={`text-lg font-black ${
                  stats.warningRows > 0 ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {stats.warningRows}
              </span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2.5 pt-1 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.deduplicateKeywords}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, deduplicateKeywords: e.target.checked }))
                }
                className="mt-0.5 rounded border-input"
              />
              <span>
                <strong className="text-foreground">Deduplicate &amp; sanitize keywords</strong>
                <span className="block text-muted-foreground">
                  Removes case-insensitive duplicate tags, stray quotes, and <code>#</code> prefixes while preserving
                  top-10 priority order.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.stripAdobeTitleCommas}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, stripAdobeTitleCommas: e.target.checked }))
                }
                className="mt-0.5 rounded border-input"
              />
              <span>
                <strong className="text-foreground">Strip commas from Adobe Stock titles</strong>
                <span className="block text-muted-foreground">
                  Replaces commas with spaces in Adobe Stock exports as required by Adobe&apos;s CSV importer.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.trimFreepikTitles}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, trimFreepikTitles: e.target.checked }))
                }
                className="mt-0.5 rounded border-input"
              />
              <span>
                <strong className="text-foreground">Smart-trim Freepik titles at 100 chars</strong>
                <span className="block text-muted-foreground">
                  Trims long titles cleanly at a word boundary so Freepik&apos;s 100-character limit never cuts a word
                  in half.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-amber-500/25 bg-amber-500/5 p-2.5">
              <input
                type="checkbox"
                checked={options.autoReplaceTrademarks}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, autoReplaceTrademarks: e.target.checked }))
                }
                className="mt-0.5 rounded border-input"
              />
              <span>
                <strong className="text-foreground inline-flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                  Auto-replace restricted brand &amp; trademark terms
                </strong>
                <span className="block text-muted-foreground">
                  Replaces 90+ common brand names (e.g., <em>iPhone → smartphone</em>) across titles, descriptions, and
                  keywords. Always human-verify visual logos in the artwork itself.
                </span>
              </span>
            </label>
          </div>

          {/* Dropdown Settings */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
            <div className="space-y-1">
              <label htmlFor="kw-cap" className="font-semibold text-foreground block">
                Keyword Count Limit
              </label>
              <select
                id="kw-cap"
                value={options.keywordCap}
                onChange={(e) =>
                  setOptions((o) => ({
                    ...o,
                    keywordCap: e.target.value as "none" | "49" | "50",
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
              >
                <option value="none">Keep all keywords</option>
                <option value="49">Cap at 49 (Adobe Stock max)</option>
                <option value="50">Cap at 50 (Shutterstock / Freepik)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="vecteezy-license" className="font-semibold text-foreground block">
                Vecteezy License Column
              </label>
              <select
                id="vecteezy-license"
                value={options.vecteezyLicense}
                onChange={(e) =>
                  setOptions((o) => ({
                    ...o,
                    vecteezyLicense: e.target.value as "free" | "pro" | "editorial",
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
              >
                <option value="free">free</option>
                <option value="pro">pro</option>
                <option value="editorial">editorial</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="companion-vector" className="font-semibold text-foreground block">
                Paired Vector Companion Rows (Optional)
              </label>
              <select
                id="companion-vector"
                value={options.companionVectorExt}
                onChange={(e) =>
                  setOptions((o) => ({
                    ...o,
                    companionVectorExt: e.target.value as "none" | "eps" | "svg" | "ai",
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
              >
                <option value="none">Keep original filenames only</option>
                <option value="eps">Also generate matching .eps row per file</option>
                <option value="svg">Also generate matching .svg row per file</option>
                <option value="ai">Also generate matching .ai row per file</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.freepikIsAI}
                  onChange={(e) =>
                    setOptions((o) => ({ ...o, freepikIsAI: e.target.checked }))
                  }
                  className="rounded border-input"
                />
                <span className="font-semibold text-foreground">
                  Include Freepik 5-column AI headers (<code>Prompt;Model</code>)
                </span>
              </label>
              {options.freepikIsAI && (
                <Input
                  value={options.freepikAiModel}
                  onChange={(e) =>
                    setOptions((o) => ({ ...o, freepikAiModel: e.target.value }))
                  }
                  placeholder="Exact Freepik AI Model name (e.g., Midjourney 6, DALL-E 3, Flux)"
                  className="h-8 text-xs"
                />
              )}
            </div>
          </div>
        </section>

        {/* Right: 1-Click Export Hub & Live Agency Output Preview */}
        <section className="lg:col-span-7 rounded-2xl border border-border bg-card/60 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                2. Export Converted Agency Spreadsheets
              </h2>
              <p className="text-xs text-muted-foreground">
                Download all six marketplace CSVs in one ZIP or inspect &amp; download individual portals below.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={normalizedRows.length === 0}
              className="gap-2 font-bold shadow-md"
            >
              <Archive className="w-4 h-4" />
              Download All 6 Agencies (.ZIP)
            </Button>
          </div>

          {/* Individual Agency Selector + Download Cards */}
          <div className="grid sm:grid-cols-2 gap-2.5">
            {TARGET_AGENCY_SPECS.map((spec) => {
              const isSelected = spec.id === selectedPreviewAgency;
              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedPreviewAgency(spec.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPreviewAgency(spec.id);
                    }
                  }}
                  className={`rounded-xl border p-3 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                      : "border-border/80 bg-background/50 hover:border-primary/40"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground truncate">
                        {spec.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {spec.id === "freepik" ? ";" : ","} · {spec.bom ? "BOM" : "No BOM"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {spec.headersPreview}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingle(spec.id);
                    }}
                    disabled={normalizedRows.length === 0}
                    className="h-7 px-2.5 text-xs shrink-0 gap-1"
                  >
                    <Download className="w-3 h-3" />
                    CSV
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Live Raw Output Inspector */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">
                  Live Output Preview: {activeAgencySpec.name}
                </span>
                <p className="text-[11px] text-muted-foreground">{activeAgencySpec.notes}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPreview}
                disabled={normalizedRows.length === 0}
                className="h-7 text-xs gap-1.5"
              >
                {copiedPreview ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy Raw CSV
              </Button>
            </div>
            <pre className="rounded-xl border border-border bg-background/90 p-3 text-[11px] font-mono text-foreground/90 overflow-x-auto max-h-56 leading-relaxed">
              {normalizedRows.length > 0
                ? previewFormatted.content
                : "// Upload or add rows to preview formatted marketplace CSV output."}
            </pre>
          </div>
        </section>
      </div>

      {/* Interactive Batch Editor & Diagnostics Table */}
      <section className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              3. Review &amp; Inline-Edit Batch Rows ({filteredTableRows.length} shown)
            </h2>
            <p className="text-xs text-muted-foreground">
              Edit filenames, titles, descriptions, or keywords directly below — every agency export updates in real
              time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter rows by filename or keyword..."
              className="h-8 w-52 text-xs"
            />
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-background">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filterMode === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({editableRows.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("warnings")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  filterMode === "warnings"
                    ? "bg-amber-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Warnings ({stats.warningRows})
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBlankRow}
              className="h-8 text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </Button>
          </div>
        </div>

        {filteredTableRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {editableRows.length === 0
              ? "No rows loaded yet. Upload a CSV file above, click Add Row, or load one of the sample CSV presets."
              : "No rows match your current filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 pr-3 w-48">Filename &amp; Category</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Title / Headline</th>
                  <th className="py-2.5 px-3 min-w-[260px]">Keywords (comma-separated)</th>
                  <th className="py-2.5 pl-3 w-56">Compliance Status</th>
                  <th className="py-2.5 pl-2 w-10" aria-label="Row actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 align-top">
                {filteredTableRows.map((row) => {
                  const fullIdx = editableRows.findIndex((r) => r.id === row.id);
                  const norm = normalizedRows[fullIdx];
                  return (
                    <tr key={row.id} className="hover:bg-primary/[0.02]">
                      <td className="py-3 pr-3 space-y-1.5">
                        <Input
                          value={row.filename}
                          onChange={(e) => handleRowEdit(row.id, "filename", e.target.value)}
                          placeholder="asset-01.jpg"
                          className="h-7 text-xs font-mono"
                        />
                        {norm && (
                          <div className="text-[10px] text-muted-foreground leading-tight">
                            Adobe #{norm.adobeCategoryId} · {norm.shutterstockCategory} · DT #
                            {norm.dreamstimeCategoryId}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 space-y-1">
                        <textarea
                          rows={2}
                          value={row.title || row.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleRowEdit(row.id, "title", val);
                            if (!row.description || row.description === row.title) {
                              handleRowEdit(row.id, "description", val);
                            }
                          }}
                          placeholder="Descriptive commercial stock title..."
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        {norm && (
                          <span className="text-[10px] text-muted-foreground">
                            {norm.title.length} chars
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 space-y-1">
                        <textarea
                          rows={2}
                          value={row.keywordsRaw}
                          onChange={(e) => handleRowEdit(row.id, "keywordsRaw", e.target.value)}
                          placeholder="keyword 1, keyword 2, keyword 3..."
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        {norm && (
                          <span className="text-[10px] text-muted-foreground">
                            {norm.keywords.length} clean tags
                            {norm.duplicatesRemoved > 0 &&
                              ` (${norm.duplicatesRemoved} duplicate removed)`}
                          </span>
                        )}
                      </td>

                      <td className="py-3 pl-3">
                        {norm && norm.warnings.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            Ready across 6 portals
                          </span>
                        ) : (
                          <ul className="space-y-1">
                            {norm?.warnings.map((w, wi) => (
                              <li
                                key={wi}
                                className="flex items-start gap-1 text-[11px] text-amber-600 dark:text-amber-400"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>

                      <td className="py-3 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          aria-label={`Remove ${row.filename || "row"}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Practitioner Reference Section (SEO + Helpful Content Context) */}
      <section className="border-t border-border pt-10 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Why Stock Spreadsheets Fail When Moved Between Agencies
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Every stock marketplace built its CSV importer around different header names, byte-order marks, and column
            delimiters. Uploading an Adobe Stock CSV directly to Freepik, Shutterstock, or Dreamstime almost always
            triggers silent row drops or header errors for five specific technical reasons:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border border-border bg-card/40 p-4 space-y-1.5">
            <h3 className="font-bold text-foreground">1. Semicolons vs. Commas (Freepik)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Freepik requires <strong>semicolons (<code>;</code>)</strong> between columns and lowercase{" "}
              <code>filename;title;tags</code> headers, whereas Adobe Stock and Shutterstock require comma-separated
              columns.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4 space-y-1.5">
            <h3 className="font-bold text-foreground">2. UTF-8 BOM Header Rejections</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Excel saves UTF-8 CSVs with a 3-byte BOM (<code>EF BB BF</code>). <strong>Dreamstime</strong> and{" "}
              <strong>Vecteezy</strong> read those invisible bytes as part of the <code>Filename</code> header and
              reject the entire upload, so this converter strips BOM automatically for both portals.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4 space-y-1.5">
            <h3 className="font-bold text-foreground">3. Title vs. Description Bridging</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adobe Stock and Freepik use a <code>Title</code> column with no Description, while Shutterstock and 123RF
              use a <code>Description</code> column with no Title. Our converter bridges both fields automatically so
              descriptions never arrive blank.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4 space-y-1.5">
            <h3 className="font-bold text-foreground">4. Category ID vs. English Name Crosswalk</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adobe Stock expects numbers (<code>1–21</code>), Dreamstime expects its own numeric legend IDs, and
              Shutterstock rejects numbers in favor of exact English labels like <code>Business/Finance</code> or{" "}
              <code>Technology</code>.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4 space-y-1.5">
            <h3 className="font-bold text-foreground">5. Space-Free Comma Lists (Dreamstime &amp; 123RF)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official Dreamstime (<code>keywords</code>) and 123RF (<code>oldfilename</code> / <code>keywords</code>)
              templates join tags without spaces (<code>solar,energy,roof</code>) and use exact case-sensitive headers.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4 space-y-1.5">
            <h3 className="font-bold text-foreground">Need Metadata From Scratch?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate titles and keywords from pixels in the{" "}
              <Link to="/tool" className="text-primary underline">
                Free Online AI Generator
              </Link>
              , audit single drafts in the{" "}
              <Link to="/metadata-checker" className="text-primary underline">
                Metadata Checker
              </Link>
              , or read our{" "}
              <Link
                to="/blog/stock-csv-upload-formatting-troubleshooting-guide"
                className="text-primary underline"
              >
                CSV Troubleshooting Guide
              </Link>{" "}
              and{" "}
              <Link to="/metadata-limits" className="text-primary underline">
                Marketplace Limits Reference
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StockCsvConverter;
