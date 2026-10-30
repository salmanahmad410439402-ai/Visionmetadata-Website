import {
  Play,
  Download,
  Settings,
  Key,
  Zap,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Tutorials & Video Guides page.
 *
 * Combines:
 * 1. Featured educational video tutorial on scaling free Google Gemini API quota
 *    properly across separate Google Cloud projects (1 key per project).
 * 2. Four comprehensive written setup guides covering desktop installation,
 *    BYOK provider key rotation, metadata rules, and batch embedding/export.
 * 3. Optional screen walkthrough of the browser metadata generator.
 */

export const GEMINI_QUOTA_VIDEO_ID = "58nm1hZVvTs";
const WALKTHROUGH_VIDEO_ID = "MoeprdBnpes";

const geminiQuotaTakeaways = [
  "Why multiple Gemini API keys inside a single Google Cloud project share the exact same quota pool",
  "Why separating keys into distinct Google Cloud projects unlocks independent project-level quotas",
  "How to create and label multiple Google Cloud projects step by step without confusion",
  "How to generate one dedicated Gemini API key inside each individual Google Cloud project",
  "How to organize and import project-separated keys cleanly for automatic multi-key rotation",
  "Practical workflow habits to avoid hitting avoidable 429 project-level quota errors",
];

const geminiAudienceTags = [
  "AI Developers & Builders",
  "Gemini API Users",
  "Automation Workflows",
  "Stock Contributors",
  "Beginners",
];

const guides = [
  {
    id: "step-01-install",
    num: "01",
    icon: Download,
    title: "Install the app and confirm Windows trusts it",
    summary:
      "Get the desktop build installed, check the file hash, and clear any SmartScreen prompt without disabling your security settings.",
    steps: [
      "Download the installer from the official link on our Download page. The current build is Tagyfy_Pro_1.3.6_x64-setup.exe (about 160 MB).",
      "Optionally verify the download: every release publishes a matching .sig signature file alongside the installer on the release page. If the bytes do not match, delete the file and download again.",
      "Run the installer and follow the prompts. The default install is per-user, so no administrator password is normally required.",
      "Windows Defender SmartScreen may warn that the publisher is not yet widely recognised, because code-signing reputation builds over time. Click \"More info\" then \"Run anyway\" only if the file came from the official release page and the size and signature match.",
      "Launch Tagyfy Pro. You should land on the empty dashboard with the upload drop zone visible.",
    ],
    note: "Never install Tagyfy Pro from a mirror, a re-hosted ZIP, or a link someone sent you in a chat. Only the tagyfy.com Download page and the linked GitHub release are official.",
  },
  {
    id: "step-02-api-keys",
    num: "02",
    icon: Key,
    title: "Add an AI provider key (and why separate Google Cloud projects matter)",
    summary:
      "Tagyfy Pro does not resell AI access. Connect free or paid keys from Google Gemini, OpenAI, Groq, or Mistral AI, and structure Gemini keys across separate projects so multi-key rotation works properly.",
    steps: [
      "Open Settings and go to the AI provider section. Keys are stored in local storage on your own machine, not on a Tagyfy server.",
      "Create a key with your chosen provider. Google AI Studio issues a free Gemini API key in about a minute; Groq also has a free tier. Paste it into the matching provider field.",
      "If you add multiple Google Gemini keys for automatic key rotation, create each key inside its own separate Google Cloud project (1 key per project). Keys generated inside the same Google Cloud project share one project quota and will hit rate limits together — watch the featured video tutorial above for the full step-by-step setup.",
      "Choose the model you want for vision analysis. Gemini 3.5 Flash-Lite is the usual starting point on the free tier; heavier models cost more per image but can describe more complex scenes.",
      "Run a single test image before a large batch. Confirm the title, description and keywords come back in your chosen language and style before you commit hundreds of files.",
    ],
    note: "Provider keys have their own quotas and billing terms. Tagyfy Pro never charges per generation — your only cost is whatever your AI provider charges you directly.",
  },
  {
    id: "step-03-metadata-rules",
    num: "03",
    icon: Settings,
    title: "Configure the metadata rules before you generate",
    summary:
      "Set title length, keyword count and keyword strategy once, and the whole batch inherits it. This is the step most contributors skip.",
    steps: [
      "Set your title length. Adobe Stock titles are capped at 200 characters, and the practical sweet spot for search relevance is roughly 100–190 characters, so the slider defaults into that range. Shorter titles usually convert worse than descriptive ones.",
      "Choose your keyword count. Tagyfy Pro supports 5 to 50 keywords per asset. Adobe Stock accepts up to 49; other marketplaces differ, so check the current limit for every platform you submit to.",
      "Pick a keyword strategy: single-word, multi-word, or mixed. Single-word keywords are broader and easier to match; multi-word phrases convert better on specific searches. Mixed is the usual compromise.",
      "Add prohibited terms under Negative Keywords. Anything you list there is stripped from every generated output — useful for a brand you never want associated with your portfolio, or a term a marketplace has already flagged for you.",
      "If you are working on a themed collection, turn on Event Context or Series Context so that the collection shares consistent phrasing, and series assets get ordered titles such as \"Part 01\", \"Part 02\".",
    ],
    note: "Metadata settings are a starting point, not a guarantee. Re-read the generated title for accuracy before you submit — you are the named contributor of record on the asset.",
  },
  {
    id: "step-04-batch-workflow",
    num: "04",
    icon: Upload,
    title: "Generate, review, embed, and upload",
    summary:
      "Run the batch, check the flags, write the metadata into the files, then upload and confirm the marketplace read it correctly.",
    steps: [
      "Drag your files or folders onto the dashboard. JPG, PNG, WebP, TIFF, SVG, EPS, AI, MP4, MOV and WebM are all handled. For vector work, upload the EPS or AI file together with its same-named JPG preview so the vision model has something to look at — the AI reads the raster preview, then the metadata is written into the vector file.",
      "Start the batch. Enable Batch Mode to process several files in parallel instead of one at a time. Progress and per-file status are shown live, and failures are retried automatically.",
      "Review before you export. Every asset gets a confidence score and risk flags covering subject clarity, keyword precision, differentiator strength and compliance safety. Clear anything marked as a trademark or brand risk yourself — the sniffer is a safety net, not a substitute for your own check.",
      "Embed or export. Use the embed action to write IPTC/XMP metadata directly into the file, or use the CSV export if you would rather upload metadata through a marketplace spreadsheet. Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF and Vecteezy each get their own correctly formatted CSV.",
      "Upload to the marketplace and spot-check. Open one file in the contributor dashboard and confirm the title and keywords arrived as expected. Uploading a single test file first saves you from re-doing a whole batch.",
    ],
    note: "Embedded metadata support varies by file type and by marketplace. Confirm the current requirements for each platform you submit to rather than assuming every field is read.",
  },
];

const faqs = [
  {
    q: "Why do all my Gemini API keys hit rate limits at the same time?",
    a: "Google enforces Gemini API free-tier quotas per Google Cloud project, not per individual API key. If you generated multiple keys inside a single project, they all draw from the same quota pool. Create separate Google Cloud projects with one Gemini API key per project — as shown in the featured video tutorial above — so key rotation switches between independent project quotas.",
  },
  {
    q: "Do I have to read every guide?",
    a: "No. Guide 1 is only needed once, when you install the app. Guide 2 (and the Gemini multi-project quota video) is needed once when setting up your provider keys. Guides 3 and 4 cover the settings and the batch workflow you will run repeatedly, so those are the two worth reading closely.",
  },
  {
    q: "Which video tutorials are included on this page?",
    a: "This page embeds two tutorials directly: (1) our step-by-step guide on getting more free Google Gemini API quota using multiple Google Cloud projects, and (2) a full screen demonstration of the browser metadata generator workflow (Urdu / Hindi audio, ~9 minutes). For Windows desktop installation and file embedding, follow the four written English guides above.",
  },
  {
    q: "Can I use this on Mac or Linux?",
    a: "The desktop application currently ships for Windows 10 and 11 (64-bit) only. On Mac or Linux you can still use the browser tool on our Tool page, which generates metadata and exports 6-agency CSVs with multi-key rotation.",
  },
  {
    q: "Where do I get help if I get stuck?",
    a: "Send us the details through the Contact page. Include your app version, the file type involved, the provider you selected, and the exact error text. That is usually enough for us to reproduce the problem without a back-and-forth.",
  },
];

const TutorialsSection = () => {
  const ref = useReveal();
  const location = useLocation();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.slice(1);
    const scrollTimer = window.setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
    return () => window.clearTimeout(scrollTimer);
  }, [location.hash]);

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 sm:mb-20 max-w-4xl mx-auto">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 bg-accent-indigo-subtle border-accent-indigo-subtle">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Video Tutorials &amp; Setup Guides
            </span>
          </div>

          <h1 className="reveal reveal-delay-1 text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Tutorials, API Quota Setup &amp; Batch Workflow
          </h1>

          <p className="reveal reveal-delay-2 text-base sm:text-xl max-w-2xl mx-auto mb-5 text-primary/80">
            Learn how to scale free Google Gemini API quota properly across separate projects,
            configure automatic key rotation, and run your first reviewed metadata batch.
          </p>

          <p className="reveal reveal-delay-2 text-xs sm:text-sm max-w-2xl mx-auto text-secondary">
            Written and maintained for Tagyfy Pro v1.3.6 and our free browser tools. If any label
            in your build differs from what is described here, let us know via the Contact page
            so we can update the guide.
          </p>
        </div>

        {/* Featured Tutorial: Gemini API Multi-Project Free Quota */}
        <article
          id="gemini-api-quota-tutorial"
          aria-labelledby="gemini-quota-heading"
          className="reveal reveal-delay-2 scroll-mt-28 mb-20 sm:mb-24 rounded-3xl border border-accent-indigo/50 bg-card-primary p-5 sm:p-8 lg:p-10 shadow-xl"
        >
          {/* Badges + Title + Concise Value Proposition */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-indigo-subtle border border-accent-indigo text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Video Tutorial
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Key className="w-3.5 h-3.5" />
                Google Gemini API · Free Quota Guide
              </span>
            </div>

            <h2
              id="gemini-quota-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-3 leading-tight"
            >
              How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects
            </h2>

            <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-3xl">
              Many developers and contributors generate 5 or 10 Gemini API keys inside a{" "}
              <strong className="text-foreground font-semibold">single Google Cloud project</strong>{" "}
              expecting extra free requests — only to see every key hit{" "}
              <code className="px-1.5 py-0.5 rounded bg-background/80 border border-border/80 text-xs font-mono text-foreground">
                429 Quota Exceeded
              </code>{" "}
              at the exact same moment. Because Google enforces free-tier Gemini limits per project
              rather than per key, creating{" "}
              <strong className="text-foreground font-semibold">
                separate Google Cloud projects with one API key per project
              </strong>{" "}
              gives each key an independent project quota.
            </p>
          </div>

          {/* Responsive 16:9 Direct YouTube Embed (Lazy-loaded, No Autoplay) */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-accent-indigo/40 bg-black shadow-2xl shadow-black/40 mb-8">
            <iframe
              src={`https://www.youtube.com/embed/${GEMINI_QUOTA_VIDEO_ID}?rel=0`}
              title="How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Supporting Educational Breakdown */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Core Rule Comparison + Who It's For */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-background/40 p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Why Project Separation Matters
                  </h3>
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Common Mistake · 1 Project, Multiple Keys
                  </p>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    5 keys inside the same Google Cloud project still pull from{" "}
                    <strong className="text-foreground">one shared project quota</strong>. Rotating
                    keys inside that project will not unlock additional free requests.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Correct Setup · Multiple Projects, 1 Key Each
                  </p>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    Creating separate Google Cloud projects and generating{" "}
                    <strong className="text-foreground">one dedicated Gemini key per project</strong>{" "}
                    gives each key its own project-level quota boundary.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Ideal For
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {geminiAudienceTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-card-primary border border-border/70 text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Step-by-Step Key Takeaways */}
            <div className="lg:col-span-7 rounded-2xl border border-border/70 bg-background/40 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-4">
                  What You&apos;ll Learn in This Tutorial
                </h3>
                <ul className="space-y-3">
                  {geminiQuotaTakeaways.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-xs sm:text-sm text-secondary leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link
                  to="/tool"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Add Project Keys in Browser Tool
                </Link>
                <a
                  href="#step-02-api-keys"
                  className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Read Step 02 Key Rotation Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Written guides */}
        <div className="max-w-4xl mx-auto space-y-16 mb-24">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Written Step-by-Step Setup Guides
            </h2>
            <p className="text-sm sm:text-base text-secondary max-w-2xl mx-auto">
              Follow these four guides in order when installing Tagyfy Pro on Windows 10 or 11, or
              jump directly to Step 02 and Step 03 when configuring the browser tool.
            </p>
          </div>

          {guides.map(({ id, num, icon: Icon, title, summary, steps, note }, idx) => (
            <article
              id={id}
              key={num}
              className={`reveal reveal-delay-${(idx % 4) + 1} scroll-mt-28 rounded-3xl border p-6 sm:p-10 bg-card-primary border-card-primary`}
            >
              <div className="flex items-start gap-4 sm:gap-6 mb-6">
                <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-accent-indigo-subtle border-2 border-accent-indigo text-accent-indigo-light">
                  {num}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Step {num}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{summary}</p>
                </div>
              </div>

              <ol className="space-y-4 pl-1">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-secondary">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {note && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-500">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Additional Video: Browser Tool Screen Walkthrough */}
        <div
          id="browser-tool-walkthrough"
          className="reveal max-w-4xl mx-auto mb-24 rounded-3xl border p-6 sm:p-8 bg-card-primary border-card-primary"
        >
          <div className="mb-5 text-center sm:text-left">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Additional Screen Walkthrough · Audio: Urdu / Hindi
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Browser Metadata Generator Workflow (~9 min)
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              Full screen recording showing image upload, draft title and keyword review, and CSV
              export inside the browser workspace.
            </p>
          </div>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-accent-indigo/40 bg-black">
            {isPlayingDemo ? (
              <iframe
                className="absolute inset-0 w-full h-full bg-black border-0"
                src={`https://www.youtube.com/embed/${WALKTHROUGH_VIDEO_ID}?autoplay=1&mute=0&rel=0`}
                title="Tagyfy Pro browser metadata generator walkthrough (Urdu / Hindi audio)"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlayingDemo(true)}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all duration-300 bg-black"
                aria-label="Play the Tagyfy Pro browser tool walkthrough video (Urdu / Hindi audio)"
              >
                <img
                  src="/thumbnail.jpg"
                  alt="Preview frame of the Tagyfy Pro workspace"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/25 transition-colors duration-300" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-accent-indigo-subtle border-accent-indigo shadow-lg shadow-black/50 z-10">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1 drop-shadow-md" />
                </div>
                <span className="relative z-10 text-xs sm:text-sm uppercase tracking-widest font-semibold text-white drop-shadow-md px-4 text-center">
                  Watch browser tool walkthrough (Audio: Urdu / Hindi)
                </span>
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="reveal max-w-4xl mx-auto mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-foreground">
            Common questions
          </h2>
          <div className="space-y-5 max-w-3xl mx-auto">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border p-6 bg-card-primary border-card-primary">
                <h3 className="font-bold mb-2 text-foreground text-sm sm:text-base">{q}</h3>
                <p className="text-sm leading-relaxed text-secondary">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related reading */}
        <div className="reveal max-w-4xl mx-auto mb-16 rounded-3xl border p-6 sm:p-8 bg-card-primary border-card-primary">
          <h2 className="text-lg font-bold text-foreground mb-4">Related reading</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/faq" className="text-primary underline font-semibold hover:text-primary/80">
                Full FAQ
              </Link>{" "}
              <span className="text-secondary">
                — licensing, rate limits, CSV column formats and API key handling.
              </span>
            </li>
            <li>
              <Link to="/features" className="text-primary underline font-semibold hover:text-primary/80">
                Feature reference
              </Link>{" "}
              <span className="text-secondary">
                — every capability in v1.3.6 and the full list of supported file formats.
              </span>
            </li>
            <li>
              <Link to="/blogs" className="text-primary underline font-semibold hover:text-primary/80">
                Contributor knowledge base
              </Link>{" "}
              <span className="text-secondary">
                — how stock marketplaces review titles and keywords, and how to avoid the common rejection causes.
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="reveal max-w-4xl mx-auto text-center rounded-3xl border p-8 sm:p-12 bg-card-primary border-card-primary">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            Ready to run your first batch?
          </h2>
          <p className="text-base mb-8 text-secondary">
            The desktop build includes a 3-day full-access trial. Alternatively, generate metadata
            in the browser first to see the output quality before installing anything.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/download">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 font-bold rounded-2xl">
                <Download className="w-5 h-5 mr-2" />
                Download for Windows
              </Button>
            </Link>
            <Link to="/tool">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 font-bold rounded-2xl">
                <Zap className="w-5 h-5 mr-2" />
                Try the browser tool
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TutorialsSection;
