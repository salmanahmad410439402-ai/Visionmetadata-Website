import { useCallback, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Check,
  Wand2,
  RotateCcw,
  Upload,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GENERIC_FORMAT_WORDS,
  SAMPLE_BROKEN_CSV_FOR_VERIFY,
  SAMPLE_CLEAN_CSV_FOR_VERIFY,
  VERIFY_AGENCIES,
  auditCsvFile,
  autoCleanSingleAssetFields,
  buildCleanedVerifiedCsv,
  evaluateSingleAsset,
  type CheckStatus,
  type VerifyAgencyId,
} from "@/lib/metadataValidator";
import {
  DEFAULT_CONVERTER_OPTIONS,
  TARGET_AGENCY_SPECS,
  formatAgencyCsv,
  normalizeStockRows,
} from "@/lib/stockCsvConverter";
import { JsonLd, breadcrumbSchema } from "@/lib/structuredData";
import { toast } from "sonner";

interface Preset {
  label: string;
  filename: string;
  title: string;
  description: string;
  keywords: string;
}

const PRESETS: Preset[] = [
  {
    label: "Load Clean Sample",
    filename: "agritech-vineyard-drone-01.jpg",
    title:
      "Agronomist piloting multispectral survey drone over terraced organic vineyard at sunrise with tablet telemetry for precision agriculture",
    description:
      "Wide-angle documentary photograph of an agricultural engineer operating an inspection drone above green grapevines at dawn, illustrating crop health monitoring and sustainable farming technology.",
    keywords:
      "precision agriculture, multispectral drone, vineyard inspection, agronomist, crop monitoring, organic vineyard, sunrise, agricultural technology, smart farming, aerial survey, viticulture, telemetry tablet, sustainable agriculture, field technician, grapevine rows, harvest planning, rural innovation, drone pilot, environmental data, farm management, morning light, copy space, outdoors",
  },
  {
    label: "Load Flawed Draft (Trademarks & Spam)",
    filename: "office_photo.jpg",
    title:
      "Beautiful amazing businesswoman, office, MacBook laptop, iPhone smartphone, coffee cup, corporate success, teamwork",
    description:
      "Stunning businesswoman using Apple MacBook and iPhone at Starbucks style desk.",
    keywords:
      "photo, background, design, iphone, macbook, starbucks, businesswoman, businesswoman, laptop, office, corporate, young woman working on laptop computer in modern sunlit office, Nike, workspace",
  },
  {
    label: "Load Vector Icon Pack Sample",
    filename: "cybersecurity-line-icons.eps",
    title:
      "Cybersecurity and network data protection outline icon set with firewall shield encrypted padlock biometric login and cloud backup symbols",
    description:
      "Editable stroke vector icon collection covering enterprise security, two-factor authentication, phishing defense, and cloud encryption for UI dashboards and presentations.",
    keywords:
      "cybersecurity, data protection, network security, firewall shield, encrypted padlock, biometric authentication, two factor login, cloud backup, threat detection, privacy compliance, digital safety, infosec, server security, malware defense, secure payment, presentation graphics, ui kit, editable stroke, outline icons, vector, illustration, no people",
  },
];

const CHECKER_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tagyfy Pro Stock Metadata & CSV Compliance Checker",
  url: "https://tagyfy.com/metadata-checker",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any modern browser",
  description:
    "Verify single stock assets or upload full CSV spreadsheets to audit column headers, delimiters, UTF-8 BOM encoding, duplicate filenames, character limits, Top-10 keyword hygiene, and restricted trademarks across six stock marketplaces.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

function StatusBadge({ status }: { status: CheckStatus }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "PASS"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold"
          : status === "WARN"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-500 text-[10px] font-bold"
            : "border-destructive/40 bg-destructive/10 text-destructive text-[10px] font-bold"
      }
    >
      {status}
    </Badge>
  );
}

const MetadataChecker = () => {
  const [mode, setMode] = useState<"single" | "csv">("single");

  // Single-asset state
  const [filename, setFilename] = useState(PRESETS[0].filename);
  const [title, setTitle] = useState(PRESETS[0].title);
  const [description, setDescription] = useState(PRESETS[0].description);
  const [rawKeywords, setRawKeywords] = useState(PRESETS[0].keywords);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // CSV verification state
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const [csvFilename, setCsvFilename] = useState("sample-clean-adobe.csv");
  const [csvRawText, setCsvRawText] = useState(SAMPLE_CLEAN_CSV_FOR_VERIFY);
  const [csvHasBom, setCsvHasBom] = useState(false);
  const [csvTargetAgency, setCsvTargetAgency] = useState<VerifyAgencyId | "auto">("auto");
  const [csvRowFilter, setCsvRowFilter] = useState<"all" | "FAIL" | "WARN" | "PASS">("all");
  const [csvSearch, setCsvSearch] = useState("");
  const [showCsvPaste, setShowCsvPaste] = useState(false);
  const [isDraggingCsv, setIsDraggingCsv] = useState(false);

  // Single-asset analysis
  const analysis = useMemo(
    () =>
      evaluateSingleAsset({
        title,
        description,
        keywordsRaw: rawKeywords,
      }),
    [title, description, rawKeywords]
  );

  // CSV audit report
  const csvReport = useMemo(
    () =>
      auditCsvFile(csvRawText, {
        hasUtf8Bom: csvHasBom,
        targetAgency: csvTargetAgency,
      }),
    [csvRawText, csvHasBom, csvTargetAgency]
  );

  const filteredCsvRows = useMemo(() => {
    const q = csvSearch.trim().toLowerCase();
    return csvReport.rowAudits.filter((row) => {
      if (csvRowFilter !== "all" && row.targetStatus !== csvRowFilter) {
        return false;
      }
      if (!q) return true;
      return (
        row.filename.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.keywords.some((k) => k.toLowerCase().includes(q)) ||
        row.issues.some((i) => i.toLowerCase().includes(q))
      );
    });
  }, [csvReport.rowAudits, csvRowFilter, csvSearch]);

  const handleCsvFileUpload = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const detectedBom =
        bytes.length >= 3 &&
        bytes[0] === 0xef &&
        bytes[1] === 0xbb &&
        bytes[2] === 0xbf;
      const decoded = new TextDecoder("utf-8").decode(buffer);
      if (!decoded.trim()) {
        toast.error("The uploaded CSV file is empty.");
        return;
      }
      setCsvFilename(file.name);
      setCsvHasBom(detectedBom);
      setCsvRawText(decoded);
      setCsvTargetAgency("auto");
      setCsvRowFilter("all");
      toast.success(`Verified ${file.name}`);
    } catch {
      toast.error("Could not read the selected CSV file.");
    }
  }, []);

  const handleAutoClean = () => {
    const cleaned = autoCleanSingleAssetFields({
      title,
      description,
      keywordsRaw: rawKeywords,
    });
    setTitle(cleaned.title);
    setDescription(cleaned.description);
    setRawKeywords(cleaned.keywordsRaw);
    toast.success(
      "Cleaned trademarks, removed title commas, deduplicated tags, and moved generic tags to the end."
    );
  };

  const handleDownloadSingleCsv = (platform: VerifyAgencyId) => {
    const safeFile = filename.trim() || "asset-01.jpg";
    const normalized = normalizeStockRows(
      [
        {
          id: "single-1",
          filename: safeFile,
          title,
          description: description || title,
          keywordsRaw: analysis.parsedKeywords.join(", "),
          categoryRaw: "3",
          editorialRaw: "",
          promptRaw: "",
        },
      ],
      {
        ...DEFAULT_CONVERTER_OPTIONS,
        keywordCap: platform === "adobe" ? "49" : "50",
      }
    );

    const spec = TARGET_AGENCY_SPECS.find((s) => s.id === platform)!;
    const { content, bom } = formatAgencyCsv(normalized, platform, {
      ...DEFAULT_CONVERTER_OPTIONS,
      keywordCap: platform === "adobe" ? "49" : "50",
    });

    const payload = bom ? "\uFEFF" + content : content;
    const blob = new Blob([payload], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.fileSlug}-metadata-ready.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded verified ${spec.name} CSV row.`);
  };

  const handleDownloadAutoFixedBatchCsv = () => {
    if (csvReport.totalRows === 0) {
      toast.error("Upload or paste at least one CSV row first.");
      return;
    }
    const target = csvReport.effectiveAgency;
    const spec = TARGET_AGENCY_SPECS.find((s) => s.id === target)!;
    const { content, bom, rowCount } = buildCleanedVerifiedCsv(csvRawText, target);
    const payload = bom ? "\uFEFF" + content : content;
    const blob = new Blob([payload], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verified-${spec.fileSlug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      `Downloaded auto-fixed ${spec.name} CSV (${rowCount} rows — headers, BOM, commas & trademarks repaired).`
    );
  };

  const handleLoadRowIntoSingleEditor = (row: (typeof csvReport.rowAudits)[number]) => {
    setFilename(row.filename || "asset-01.jpg");
    setTitle(row.editableRow.title || row.editableRow.description);
    setDescription(row.editableRow.description || row.editableRow.title);
    setRawKeywords(row.keywords.join(", "));
    setMode("single");
    toast.info(`Loaded "${row.filename || `Row #${row.rowNumber}`}" into Single Asset Check`);
  };

  const copyText = (label: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard.`);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6">
      <Helmet>
        <title>
          Free Stock Metadata &amp; CSV Compliance Checker — 6-Marketplace Validator | Tagyfy Pro
        </title>
        <meta
          name="description"
          content="Verify single stock metadata drafts or upload full CSV spreadsheets to audit headers, delimiters, UTF-8 BOM bytes, duplicate filenames, character caps, Top-10 slots, and restricted trademarks across 6 agencies."
        />
        <link rel="canonical" href="https://tagyfy.com/metadata-checker" />
      </Helmet>

      <JsonLd
        data={[
          CHECKER_SCHEMA,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Metadata Checker", path: "/metadata-checker" },
          ]),
        ]}
      />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Free Browser Utility · Single Asset &amp; Full CSV Verifier
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            Stock Metadata &amp; <span className="text-gradient-flow">CSV Compliance Checker</span>
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Audit a single draft title and keyword list <strong>or upload a full <code>.csv</code> batch file</strong>{" "}
            to verify column headers, delimiters, UTF-8 BOM encoding, duplicate filenames, Top-10 keyword hygiene, and
            90+ restricted trademarks across Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF — 100%
            locally in your browser.
          </p>

          {/* Mode Switcher */}
          <div className="pt-2 flex justify-center">
            <div
              role="tablist"
              aria-label="Validation mode"
              className="inline-flex rounded-2xl border border-border bg-card/80 p-1.5 shadow-sm gap-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "single"}
                onClick={() => setMode("single")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mode === "single"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                Single Asset Check
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "csv"}
                onClick={() => setMode("csv")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mode === "csv"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Verify CSV File
              </button>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MODE 1: SINGLE ASSET CHECK                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {mode === "single" && (
          <>
            {/* Preset Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilename(preset.filename);
                    setTitle(preset.title);
                    setDescription(preset.description);
                    setRawKeywords(preset.keywords);
                  }}
                  className="rounded-xl text-xs font-semibold border-border/80"
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilename("my-asset-01.jpg");
                  setTitle("");
                  setDescription("");
                  setRawKeywords("");
                }}
                className="rounded-xl text-xs text-muted-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Clear Fields
              </Button>
            </div>

            {/* Main Single-Asset Grid */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Input Column */}
              <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-border/80 space-y-6">
                <div>
                  <label
                    htmlFor="mc-filename"
                    className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
                  >
                    Exact Asset Filename (for CSV export)
                  </label>
                  <Input
                    id="mc-filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="e.g. solar-panel-rooftop-01.jpg"
                    className="rounded-xl bg-background/70 font-mono text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="mc-title"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Title ({analysis.titleLen} chars)
                    </label>
                    <button
                      type="button"
                      onClick={() => copyText("Title", title)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {copiedField === "Title" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy Title
                    </button>
                  </div>
                  <textarea
                    id="mc-title"
                    rows={3}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Write a natural sentence starting with the primary visible subject..."
                    className="w-full rounded-xl border border-border/80 bg-background/70 p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mc-desc"
                    className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2"
                  >
                    Description ({description.trim().length} chars — used by Shutterstock, Dreamstime, Vecteezy, 123RF)
                  </label>
                  <textarea
                    id="mc-desc"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional expanded context for agencies with a separate Description column..."
                    className="w-full rounded-xl border border-border/80 bg-background/70 p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="mc-keywords"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Keywords ({analysis.kwCount} tags — comma separated, ordered by importance)
                    </label>
                    <button
                      type="button"
                      onClick={() => copyText("Keywords", analysis.parsedKeywords.join(", "))}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {copiedField === "Keywords" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy Keywords
                    </button>
                  </div>
                  <textarea
                    id="mc-keywords"
                    rows={5}
                    value={rawKeywords}
                    onChange={(e) => setRawKeywords(e.target.value)}
                    placeholder="solar panel, renewable energy, rooftop installation..."
                    className="w-full rounded-xl border border-border/80 bg-background/70 p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Auto-clean & Top-10 Preview */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    onClick={handleAutoClean}
                    className="rounded-xl bg-primary text-primary-foreground font-bold gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Auto-Clean Trademarks, Commas &amp; Duplicates
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Top 10 tags carry the strongest weight on Adobe Stock.
                  </span>
                </div>

                {analysis.parsedKeywords.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Keyword Priority Preview (Slots 1–10 Highlighted)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.parsedKeywords.map((kw, idx) => {
                        const isTop10 = idx < 10;
                        const isGenericEarly =
                          isTop10 && GENERIC_FORMAT_WORDS.has(kw.toLowerCase());
                        return (
                          <span
                            key={`${kw}-${idx}`}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                              isGenericEarly
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                : isTop10
                                  ? "bg-primary/15 border-primary/35 text-primary font-semibold"
                                  : "bg-muted/40 border-border/60 text-secondary"
                            }`}
                          >
                            <span className="opacity-60 mr-1 text-[10px]">#{idx + 1}</span>
                            {kw}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Diagnostics Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass-panel rounded-3xl p-6 border border-border/80 space-y-4">
                  <h2 className="text-lg font-bold text-foreground">Quality &amp; Risk Signals</h2>

                  <ul className="space-y-3 text-xs sm:text-sm">
                    <li className="flex items-start gap-2.5">
                      {analysis.trademarks.length === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <span className="text-secondary">
                        <strong className="text-foreground">Trademark scan:</strong>{" "}
                        {analysis.trademarks.length === 0
                          ? "No listed brand names detected (still verify visual logos and product shapes manually)."
                          : `Detected restricted brand terms: ${analysis.trademarks.join(", ")}.`}
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      {analysis.duplicates.length === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-secondary">
                        <strong className="text-foreground">Duplicate keywords:</strong>{" "}
                        {analysis.duplicates.length === 0
                          ? "All keywords are unique."
                          : `Repeated tags wasting slots: ${analysis.duplicates.join(", ")}.`}
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      {analysis.genericInTop10.length === 0 && !analysis.noPeopleEarly ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-secondary">
                        <strong className="text-foreground">Top-10 slot discipline:</strong>{" "}
                        {analysis.genericInTop10.length === 0 && !analysis.noPeopleEarly
                          ? "Slots 1–10 focus on specific subject terms."
                          : `Move broad format/filter words out of slots 1–10: ${[
                              ...analysis.genericInTop10,
                              ...(analysis.noPeopleEarly ? ["no people"] : []),
                            ].join(", ")}.`}
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      {analysis.subjectiveFound.length === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-secondary">
                        <strong className="text-foreground">Subjective adjectives:</strong>{" "}
                        {analysis.subjectiveFound.length === 0
                          ? "No filler adjectives ('beautiful', 'stunning', 'amazing') found."
                          : `Consider replacing subjective words (${analysis.subjectiveFound.join(", ")}) with concrete lighting or setting terms.`}
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      {analysis.longPhrases.length === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-secondary">
                        <strong className="text-foreground">Tag length check:</strong>{" "}
                        {analysis.longPhrases.length === 0
                          ? "Every tag is 1–3 words."
                          : `${analysis.longPhrases.length} tag(s) exceed 3 words (${analysis.longPhrases.join("; ")}); split long sentences into concise 1–2 word concepts.`}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 6-Marketplace Readiness Matrix + CSV Export */}
                <div className="glass-panel rounded-3xl p-6 border border-border/80 space-y-4">
                  <h2 className="text-lg font-bold text-foreground">
                    6-Marketplace Readiness &amp; CSV Export
                  </h2>
                  <div className="space-y-3">
                    {analysis.marketplaces.map((m) => (
                      <div
                        key={m.name}
                        className="rounded-2xl border border-border/70 bg-background/50 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{m.name}</span>
                            <StatusBadge status={m.status} />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleCsv(m.csvKey)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <Download className="w-3.5 h-3.5" />
                            CSV
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Title: {m.titleChars} · Keywords: {m.keywordRange}
                        </p>
                        {m.notes.length > 0 && (
                          <ul className="space-y-1 text-xs text-secondary pt-1">
                            {m.notes.map((n) => (
                              <li key={n}>• {n}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MODE 2: VERIFY CSV FILE                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {mode === "csv" && (
          <div className="space-y-8">
            {/* Upload Bar + Sample CSV Presets */}
            <section
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingCsv(true);
              }}
              onDragLeave={() => setIsDraggingCsv(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingCsv(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleCsvFileUpload(f);
              }}
              className={`glass-panel rounded-3xl p-6 border-2 border-dashed transition-colors space-y-4 ${
                isDraggingCsv
                  ? "border-primary bg-primary/10"
                  : "border-border/80 hover:border-primary/40"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{csvFilename}</span>
                    <StatusBadge status={csvReport.overallStatus} />
                    <Badge variant="secondary" className="text-[11px]">
                      Detected: {csvReport.detectedSourceLabel}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] font-mono">
                      {csvReport.hasBom ? "UTF-8 BOM Present" : "No BOM"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Drag &amp; drop any <code>.csv</code> file here or click Upload CSV to audit raw file bytes,
                    headers, delimiters, duplicate filenames, and every row&apos;s compliance.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => csvInputRef.current?.click()}
                    className="gap-1.5 font-bold rounded-xl"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload CSV to Verify
                  </Button>
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt,text/csv,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCsvFileUpload(f);
                      e.target.value = "";
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCsvFilename("sample-clean-adobe.csv");
                      setCsvHasBom(false);
                      setCsvRawText(SAMPLE_CLEAN_CSV_FOR_VERIFY);
                      setCsvTargetAgency("auto");
                      setCsvRowFilter("all");
                      toast.info("Loaded clean 3-row Adobe Stock CSV");
                    }}
                    className="rounded-xl text-xs gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Clean CSV Sample
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCsvFilename("flawed-batch-with-bom.csv");
                      setCsvHasBom(true);
                      setCsvRawText(SAMPLE_BROKEN_CSV_FOR_VERIFY);
                      setCsvTargetAgency("vecteezy");
                      setCsvRowFilter("all");
                      toast.info("Loaded flawed CSV sample (BOM + trademarks + duplicates)");
                    }}
                    className="rounded-xl text-xs gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Flawed CSV Sample
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCsvPaste((v) => !v)}
                    className="rounded-xl text-xs"
                  >
                    {showCsvPaste ? "Hide Paste Box" : "Paste Raw CSV"}
                  </Button>
                </div>
              </div>

              {/* Target Marketplace Selector + Auto-Fix Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/60">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="verify-target-agency"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Verify rules against:
                  </label>
                  <select
                    id="verify-target-agency"
                    value={csvTargetAgency}
                    onChange={(e) =>
                      setCsvTargetAgency(e.target.value as VerifyAgencyId | "auto")
                    }
                    className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    <option value="auto">
                      Auto-detect ({csvReport.effectiveAgencyLabel})
                    </option>
                    {VERIFY_AGENCIES.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleDownloadAutoFixedBatchCsv}
                    disabled={csvReport.totalRows === 0}
                    className="rounded-xl gap-1.5 font-bold"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-Fix &amp; Download Clean {csvReport.effectiveAgencyLabel} CSV
                  </Button>
                  <Link
                    to="/stock-csv-converter"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2 py-1"
                  >
                    Convert to all 6 portals
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {showCsvPaste && (
                <div className="pt-3 border-t border-border/60 space-y-2">
                  <label
                    htmlFor="verify-csv-paste"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Paste raw CSV content (including header line):
                  </label>
                  <textarea
                    id="verify-csv-paste"
                    rows={5}
                    value={csvRawText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCsvRawText(val);
                      setCsvHasBom(val.startsWith("\uFEFF"));
                      setCsvFilename("pasted-batch.csv");
                    }}
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </section>

            {/* File-Level Structural Checks + Summary Counters */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Summary Score Cards */}
              <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-border/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground">
                    Batch Verdict ({csvReport.effectiveAgencyLabel})
                  </h2>
                  <StatusBadge status={csvReport.overallStatus} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-3.5">
                    <span className="text-muted-foreground block text-[11px]">Total Data Rows</span>
                    <span className="text-2xl font-black text-foreground">
                      {csvReport.totalRows}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
                    <span className="text-muted-foreground block text-[11px]">Passed Rows</span>
                    <span className="text-2xl font-black text-emerald-500">
                      {csvReport.passRows}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                    <span className="text-muted-foreground block text-[11px]">Warning Rows</span>
                    <span className="text-2xl font-black text-amber-500">
                      {csvReport.warnRows}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3.5">
                    <span className="text-muted-foreground block text-[11px]">Failed Rows</span>
                    <span className="text-2xl font-black text-destructive">
                      {csvReport.failRows}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Tip:</strong> Switch the <em>Verify rules against</em> dropdown above to test whether this
                  same CSV would pass or fail on another marketplace.
                </p>
              </div>

              {/* 5 File-Level Structural Checks */}
              <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-border/80 space-y-4">
                <h2 className="text-base font-bold text-foreground">
                  File Structure, Encoding &amp; Header Audit
                </h2>
                <ul className="space-y-3">
                  {csvReport.fileChecks.map((fc) => (
                    <li
                      key={fc.id}
                      className="rounded-2xl border border-border/70 bg-background/50 p-3.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        {fc.status === "PASS" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : fc.status === "WARN" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">{fc.label}</p>
                          <p className="text-xs text-secondary leading-relaxed">{fc.detail}</p>
                        </div>
                      </div>
                      <StatusBadge status={fc.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Row-by-Row Compliance Audit Table */}
            <section className="glass-panel rounded-3xl p-6 border border-border/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Row-by-Row Metadata Audit ({filteredCsvRows.length} shown)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click <strong>Edit in Single Check</strong> on any row to inspect its Top-10 keyword slots and
                    6-portal breakdown.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={csvSearch}
                    onChange={(e) => setCsvSearch(e.target.value)}
                    placeholder="Filter by filename, tag, or issue..."
                    className="h-8 w-52 text-xs rounded-xl"
                  />
                  <div className="inline-flex rounded-xl border border-border p-0.5 bg-background text-xs">
                    {(
                      [
                        ["all", `All (${csvReport.totalRows})`],
                        ["FAIL", `Failed (${csvReport.failRows})`],
                        ["WARN", `Warn (${csvReport.warnRows})`],
                        ["PASS", `Pass (${csvReport.passRows})`],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCsvRowFilter(key)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                          csvRowFilter === key
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredCsvRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No rows match the selected filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="py-2.5 pr-3 w-14">Row</th>
                        <th className="py-2.5 px-3 w-52">Filename &amp; Status</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Title / Description Summary</th>
                        <th className="py-2.5 px-3 min-w-[240px]">Detected Issues &amp; Warnings</th>
                        <th className="py-2.5 pl-3 w-36 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 align-top">
                      {filteredCsvRows.map((row) => (
                        <tr key={row.rowNumber} className="hover:bg-primary/[0.02]">
                          <td className="py-3.5 pr-3 font-mono text-muted-foreground">
                            #{row.rowNumber}
                          </td>
                          <td className="py-3.5 px-3 space-y-1.5">
                            <div className="font-mono font-semibold text-foreground break-all">
                              {row.filename || "(missing)"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <StatusBadge status={row.targetStatus} />
                              <span className="text-[10px] text-muted-foreground">
                                {row.keywords.length} tags
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 space-y-1">
                            <p className="text-foreground leading-snug line-clamp-2">
                              {row.title || "(empty title / description)"}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {row.title.length} chars · Top 3:{" "}
                              {row.keywords.slice(0, 3).join(", ") || "none"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            {row.issues.length === 0 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                Passes all {csvReport.effectiveAgencyLabel} checks
                              </span>
                            ) : (
                              <ul className="space-y-1">
                                {row.issues.map((issue, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1.5 text-secondary leading-snug"
                                  >
                                    {row.targetStatus === "FAIL" ? (
                                      <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                                    ) : (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    )}
                                    <span>{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                          <td className="py-3.5 pl-3 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleLoadRowIntoSingleEditor(row)}
                              className="h-7 rounded-lg text-[11px]"
                            >
                              Edit in Single Check
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Educational Context & Honest Caveats */}
        <section className="glass-panel rounded-3xl p-6 sm:p-10 border border-border/80 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            How this validator works — and what you still must check yourself
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-secondary leading-relaxed">
            <div>
              <h3 className="font-bold text-foreground mb-2">
                1. File-level &amp; row-level CSV verification
              </h3>
              <p>
                In <strong>Verify CSV File</strong> mode, your browser inspects the raw file bytes for UTF-8 BOM
                headers (rejected by Dreamstime and Vecteezy), checks semicolon vs. comma column delimiters, verifies
                case-sensitive column names, and audits every row against your target agency. See the{" "}
                <Link to="/metadata-limits" className="text-primary underline">
                  Marketplace Metadata Limits table
                </Link>{" "}
                for linked official specifications.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">
                2. Dictionary trademark check vs visual IP
              </h3>
              <p>
                This page runs Tagyfy&apos;s client-side brand dictionary against your text to catch common trademark
                slips (such as smartphone, apparel, automotive, and AI tool names). A text check cannot inspect pixels:
                you must still check your image at 100% zoom for logos, recognizable faces, private property, and
                proprietary industrial designs.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">
                3. Need 6-agency batch conversion or AI vision analysis?
              </h3>
              <p>
                Once your CSV passes verification, convert it across all six agencies in one ZIP bundle with the{" "}
                <Link to="/stock-csv-converter" className="text-primary underline">
                  Multi-Agency Stock CSV Converter
                </Link>
                . To draft titles and keywords directly from pixels, open the{" "}
                <Link to="/tool" className="text-primary underline">
                  Free Online Metadata Generator
                </Link>{" "}
                or read our{" "}
                <Link to="/blogs" className="text-primary underline">
                  Contributor Knowledge Base
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MetadataChecker;
