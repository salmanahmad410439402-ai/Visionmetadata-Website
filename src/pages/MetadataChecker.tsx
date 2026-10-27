import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  Copy,
  Check,
  Wand2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { findTrademarks, replaceTrademark, cleanKeywords } from "@/lib/trademarkSniffer";
import { JsonLd, breadcrumbSchema } from "@/lib/structuredData";
import { toast } from "sonner";

const SUBJECTIVE_WORDS = [
  "beautiful",
  "stunning",
  "amazing",
  "gorgeous",
  "breathtaking",
  "perfect",
  "awesome",
  "epic",
  "incredible",
  "fantastic",
  "wonderful",
];

const GENERIC_FORMAT_WORDS = new Set([
  "photo",
  "image",
  "picture",
  "vector",
  "illustration",
  "background",
  "wallpaper",
  "design",
  "graphic",
  "template",
  "icon",
  "set",
  "collection",
  "stock",
]);

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

type CheckStatus = "PASS" | "WARN" | "FAIL";

interface MarketplaceVerdict {
  name: string;
  status: CheckStatus;
  titleChars: string;
  keywordRange: string;
  notes: string[];
  csvKey: "adobe" | "shutterstock" | "freepik" | "vecteezy" | "dreamstime" | "123rf";
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const MetadataChecker = () => {
  const [filename, setFilename] = useState(PRESETS[0].filename);
  const [title, setTitle] = useState(PRESETS[0].title);
  const [description, setDescription] = useState(PRESETS[0].description);
  const [rawKeywords, setRawKeywords] = useState(PRESETS[0].keywords);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const parsedKeywords = useMemo(
    () =>
      rawKeywords
        .split(/[,\n;]+/)
        .map((k) => k.trim())
        .filter(Boolean),
    [rawKeywords]
  );

  const analysis = useMemo(() => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const titleLen = trimmedTitle.length;
    const kwCount = parsedKeywords.length;

    // Duplicate detection (case-insensitive)
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const kw of parsedKeywords) {
      const lower = kw.toLowerCase();
      if (seen.has(lower) && !duplicates.includes(lower)) {
        duplicates.push(lower);
      }
      seen.add(lower);
    }

    // Trademark detection across title, description & keywords
    const trademarks = findTrademarks(`${trimmedTitle} ${trimmedDesc} ${parsedKeywords.join(" ")}`);

    // Subjective words in title or keywords
    const combinedLower = `${trimmedTitle} ${parsedKeywords.join(" ")}`.toLowerCase();
    const subjectiveFound = SUBJECTIVE_WORDS.filter((word) =>
      new RegExp(`\\b${word}\\b`, "i").test(combinedLower)
    );

    // Generic format words in Top 10
    const top10 = parsedKeywords.slice(0, 10);
    const genericInTop10 = top10.filter((kw) => GENERIC_FORMAT_WORDS.has(kw.toLowerCase()));

    // Overly long compound phrases (> 3 words)
    const longPhrases = parsedKeywords.filter((kw) => kw.split(/\s+/).length > 3);

    // "no people" / "nobody" misplaced in top 10
    const noPeopleEarly = top10.some((kw) => /^(no people|nobody)$/i.test(kw));

    // Comma-stuffed title check
    const titleCommaCount = (trimmedTitle.match(/,/g) || []).length;

    // Per-marketplace verdicts
    const marketplaces: MarketplaceVerdict[] = [
      {
        name: "Adobe Stock",
        csvKey: "adobe",
        titleChars: `${titleLen} / 200 chars`,
        keywordRange: `${kwCount} / 49 max (5 min)`,
        status:
          titleLen === 0 || titleLen > 200 || kwCount < 5 || kwCount > 49 || trademarks.length > 0
            ? "FAIL"
            : titleCommaCount > 0 || duplicates.length > 0 || genericInTop10.length > 0
              ? "WARN"
              : "PASS",
        notes: [
          ...(titleLen > 200 ? ["Title exceeds Adobe Stock's 200-character limit."] : []),
          ...(titleLen > 0 && titleLen < 50 ? ["Title is very short; 70–190 characters gives stronger search context."] : []),
          ...(titleCommaCount > 0 ? ["Title contains commas — Adobe Stock treats comma-heavy titles as keyword lists and can break unquoted CSV columns."] : []),
          ...(kwCount < 5 ? ["Fewer than 5 keywords (Adobe Stock minimum)."] : []),
          ...(kwCount > 49 ? [`${kwCount} keywords exceeds Adobe Stock's 49-keyword ceiling.`] : []),
          ...(trademarks.length > 0 ? [`Flagged brand terms: ${trademarks.join(", ")}.`] : []),
        ],
      },
      {
        name: "Shutterstock",
        csvKey: "shutterstock",
        titleChars: `${(trimmedDesc || trimmedTitle).length} / 200 chars`,
        keywordRange: `${kwCount} / 50 max (7 min)`,
        status:
          (trimmedDesc || trimmedTitle).length === 0 ||
          (trimmedDesc || trimmedTitle).length > 200 ||
          kwCount < 7 ||
          kwCount > 50 ||
          trademarks.length > 0
            ? "FAIL"
            : duplicates.length > 0
              ? "WARN"
              : "PASS",
        notes: [
          ...((trimmedDesc || trimmedTitle).length > 200 ? ["Description exceeds Shutterstock's 200-character limit."] : []),
          ...(kwCount < 7 ? ["Shutterstock requires at least 7 keywords."] : []),
          ...(kwCount > 50 ? ["Exceeds Shutterstock's 50-keyword maximum."] : []),
          ...(trademarks.length > 0 ? [`Remove trademarks for commercial submission: ${trademarks.join(", ")}.`] : []),
        ],
      },
      {
        name: "Freepik",
        csvKey: "freepik",
        titleChars: `${titleLen} / 100 chars`,
        keywordRange: `${kwCount} / 50 max (5 min)`,
        status:
          titleLen === 0 || titleLen > 100 || kwCount < 5 || kwCount > 50 || trademarks.length > 0
            ? titleLen > 100 && trademarks.length === 0 && kwCount >= 5 && kwCount <= 50
              ? "WARN"
              : "FAIL"
            : "PASS",
        notes: [
          ...(titleLen > 100
            ? [`Title is ${titleLen} chars; Freepik's CSV importer caps titles at 100 characters (shorten by ${titleLen - 100} chars for Freepik).`]
            : []),
          ...(kwCount < 5 || kwCount > 50 ? ["Freepik requires between 5 and 50 keywords."] : []),
          ...(trademarks.length > 0 ? [`Flagged brand terms: ${trademarks.join(", ")}.`] : []),
        ],
      },
      {
        name: "Vecteezy",
        csvKey: "vecteezy",
        titleChars: `${titleLen} / 200 chars`,
        keywordRange: `${kwCount} / 50 max (5 min)`,
        status:
          titleLen === 0 ||
          titleLen > 200 ||
          kwCount < 5 ||
          kwCount > 50 ||
          trademarks.length > 0 ||
          /[^\w\s.,'-]/.test(trimmedTitle)
            ? "FAIL"
            : titleLen < 20
              ? "WARN"
              : "PASS",
        notes: [
          ...(titleLen > 0 && titleLen < 32 ? ["Vecteezy prefers descriptive titles (aim for 3+ meaningful words)."] : []),
          ...(titleLen > 200 ? ["Title exceeds 200 characters."] : []),
          ...(/[^\w\s.,'-]/.test(trimmedTitle) ? ["Vecteezy rejects special symbols in titles."] : []),
          ...(kwCount < 5 || kwCount > 50 ? ["Vecteezy accepts 5 to 50 keywords."] : []),
          ...(trademarks.length > 0 ? [`Flagged brand terms: ${trademarks.join(", ")}.`] : []),
        ],
      },
      {
        name: "Dreamstime",
        csvKey: "dreamstime",
        titleChars: `${titleLen} / 130 chars`,
        keywordRange: `${kwCount} / 80 max (10 min)`,
        status:
          titleLen === 0 || kwCount < 10 || kwCount > 80 || trademarks.length > 0
            ? "FAIL"
            : titleLen > 130
              ? "WARN"
              : "PASS",
        notes: [
          ...(titleLen > 130 ? ["Title is over 130 characters; move extra context into the Description field for Dreamstime."] : []),
          ...(kwCount < 10 ? ["Dreamstime requires at least 10 keywords."] : []),
          ...(kwCount > 80 ? ["Dreamstime allows up to 80 keywords."] : []),
          ...(trademarks.length > 0 ? [`Flagged brand terms: ${trademarks.join(", ")}.`] : []),
        ],
      },
      {
        name: "123RF",
        csvKey: "123rf",
        titleChars: `${titleLen} / 255 chars`,
        keywordRange: `${kwCount} / 50 max (7 min)`,
        status:
          titleLen === 0 || titleLen > 255 || kwCount < 7 || kwCount > 50 || trademarks.length > 0
            ? "FAIL"
            : "PASS",
        notes: [
          ...(kwCount < 7 ? ["123RF requires at least 7 keywords."] : []),
          ...(kwCount > 50 ? ["123RF caps keyword lists at 50 terms."] : []),
          ...(trademarks.length > 0 ? [`Flagged brand terms: ${trademarks.join(", ")}.`] : []),
        ],
      },
    ];

    return {
      titleLen,
      kwCount,
      duplicates,
      trademarks,
      subjectiveFound,
      genericInTop10,
      longPhrases,
      noPeopleEarly,
      titleCommaCount,
      marketplaces,
    };
  }, [title, description, parsedKeywords]);

  const handleAutoClean = () => {
    const cleanedTitleRes = replaceTrademark(title.replace(/,\s*/g, " ").replace(/\s+/g, " ").trim());
    const cleanedDescRes = replaceTrademark(description);
    const cleanedKwRes = cleanKeywords(parsedKeywords);

    // Deduplicate case-insensitively and move generic format words to the end
    const seen = new Set<string>();
    const specific: string[] = [];
    const trailing: string[] = [];

    for (const kw of cleanedKwRes.cleaned) {
      const lower = kw.toLowerCase().trim();
      if (!lower || seen.has(lower)) continue;
      seen.add(lower);
      if (GENERIC_FORMAT_WORDS.has(lower) || lower === "no people" || lower === "nobody") {
        trailing.push(kw.trim());
      } else {
        specific.push(kw.trim());
      }
    }

    const merged = [...specific, ...trailing].slice(0, 49);
    setTitle(cleanedTitleRes.cleaned);
    setDescription(cleanedDescRes.cleaned);
    setRawKeywords(merged.join(", "));
    toast.success("Cleaned trademarks, removed title commas, deduplicated tags, and moved generic tags to the end.");
  };

  const handleDownloadCsv = (platform: MarketplaceVerdict["csvKey"]) => {
    const safeFile = filename.trim() || "asset-01.jpg";
    const kwString = parsedKeywords.join(", ");
    let csv = "";

    switch (platform) {
      case "adobe":
        csv =
          `Filename,Title,Keywords,Category,Releases\n` +
          `${escapeCsvCell(safeFile)},${escapeCsvCell(title.replace(/,/g, " ").replace(/\s+/g, " ").trim())},${escapeCsvCell(parsedKeywords.slice(0, 49).join(", "))},1,\n`;
        break;
      case "shutterstock":
        csv =
          `Filename,Description,Keywords,Categories,Editorial,Mature content,Illustration\n` +
          `${escapeCsvCell(safeFile)},${escapeCsvCell((description || title).slice(0, 200))},${escapeCsvCell(parsedKeywords.slice(0, 50).join(", "))},Objects,no,no,no\n`;
        break;
      case "freepik":
        csv =
          `"File name";"Title";"Keywords";"Prompt";"Model"\n` +
          `${escapeCsvCell(safeFile)};${escapeCsvCell(title.slice(0, 100))};${escapeCsvCell(parsedKeywords.slice(0, 50).join(", "))};"";""\n`;
        break;
      case "vecteezy":
        csv =
          `Filename,Title,Description,Keywords,License\n` +
          `${escapeCsvCell(safeFile)},${escapeCsvCell(title.slice(0, 200))},${escapeCsvCell(description || title)},${escapeCsvCell(parsedKeywords.slice(0, 50).join(", "))},Pro\n`;
        break;
      case "dreamstime":
        csv =
          `Filename,Image Name,Description,Category 1,Category 2,Category 3,keywords,Free,W-EL,P-EL,SR-EL,SR-Price\n` +
          `${escapeCsvCell(safeFile)},${escapeCsvCell(title.slice(0, 130))},${escapeCsvCell(description || title)},1,0,0,${escapeCsvCell(kwString)},0,1,1,0,0\n`;
        break;
      case "123rf":
        csv =
          `oldfilename,123rf_filename,description,keywords,country\n` +
          `${escapeCsvCell(safeFile)},,${escapeCsvCell((description || title).slice(0, 255))},${escapeCsvCell(parsedKeywords.slice(0, 50).join(", "))},\n`;
        break;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${platform}-metadata-ready.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${platform.toUpperCase()} CSV template row.`);
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
        <title>Free Stock Metadata & Trademark Checker — 6-Marketplace Validator | Tagyfy Pro</title>
        <meta
          name="description"
          content="Validate stock photo, vector, and video titles and keywords against Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, and 123RF rules. Check character caps, trademarks, and duplicates in your browser with no API key."
        />
        <link rel="canonical" href="https://tagyfy.com/metadata-checker" />
      </Helmet>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Metadata Checker", path: "/metadata-checker" },
        ])}
      />

      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Free Browser Utility · No API Key Required
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            Stock Metadata &amp; <span className="text-gradient-flow">Compliance Checker</span>
          </h1>
          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Paste a draft title, description, and keyword list to test character limits, comma rules,
            duplicate tags, top-10 keyword hygiene, and common brand names across all six supported
            stock marketplaces — 100% locally in your browser with zero login and no API key.
          </p>
        </header>

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

        {/* Main Workspace Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Input Column */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-border/80 space-y-6">
            <div>
              <label htmlFor="mc-filename" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
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
                <label htmlFor="mc-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Title ({analysis.titleLen} chars)
                </label>
                <button
                  type="button"
                  onClick={() => copyText("Title", title)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {copiedField === "Title" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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
              <label htmlFor="mc-desc" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
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
                <label htmlFor="mc-keywords" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Keywords ({analysis.kwCount} tags — comma separated, ordered by importance)
                </label>
                <button
                  type="button"
                  onClick={() => copyText("Keywords", parsedKeywords.join(", "))}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {copiedField === "Keywords" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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

            {parsedKeywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Keyword Priority Preview (Slots 1–10 Highlighted)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedKeywords.map((kw, idx) => {
                    const isTop10 = idx < 10;
                    const isGenericEarly = isTop10 && GENERIC_FORMAT_WORDS.has(kw.toLowerCase());
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
            {/* Quality & Compliance Checks */}
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
                        <Badge
                          variant="outline"
                          className={
                            m.status === "PASS"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]"
                              : m.status === "WARN"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px]"
                                : "border-destructive/40 bg-destructive/10 text-destructive text-[10px]"
                          }
                        >
                          {m.status}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadCsv(m.csvKey)}
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

        {/* Educational Context & Honest Caveats */}
        <section className="glass-panel rounded-3xl p-6 sm:p-10 border border-border/80 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            How this validator works — and what you still must check yourself
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-secondary leading-relaxed">
            <div>
              <h3 className="font-bold text-foreground mb-2">1. Deterministic character &amp; CSV rules</h3>
              <p>
                Every stock portal enforces different column headers, delimiters, and character ceilings.
                Freepik truncates or rejects CSV titles above 100 characters and uses semicolons, whereas
                Adobe Stock allows up to 200 characters and 49 comma-separated keywords. See the{" "}
                <Link to="/metadata-limits" className="text-primary underline">
                  Marketplace Metadata Limits table
                </Link>{" "}
                for linked official specifications.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">2. Dictionary trademark check vs visual IP</h3>
              <p>
                This page runs Tagyfy&apos;s client-side brand dictionary against your text to catch common
                trademark slips (such as smartphone, apparel, automotive, and AI tool names). A text check
                cannot inspect pixels: you must still check your image at 100% zoom for logos, recognizable
                faces, private property, and proprietary industrial designs.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">3. Need batch CSV conversion or AI vision analysis?</h3>
              <p>
                Already have a spreadsheet for one portal? Convert it across all six agencies at once in the{" "}
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
