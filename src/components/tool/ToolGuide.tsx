import { Link } from "react-router-dom";
import {
  Upload,
  Sparkles,
  ClipboardCheck,
  Download,
  FileImage,
  Layers,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { GEMINI_QUOTA_VIDEO_ID } from "@/components/TutorialsSection";

/**
 * Supporting content for /tool.
 *
 * The Tool page is the primary call to action on the homepage, but on its own
 * the page is an app shell: before a visitor uploads anything, the only text on
 * the page is an empty-state message. An app screen with no surrounding
 * explanation reads as thin content, and it also fails the "provide the
 * information and service promised" test if a visitor cannot tell what the
 * tool does, what it needs, or where its limits are. This component supplies
 * that context, plus the honest limitations.
 */

const workflow = [
  {
    icon: KeyRound,
    title: "1. Add your own AI key (or try Sample Demo)",
    body: "Click 'Try Sample Demo (No API Key)' to explore a completed asset and CSV export immediately, or open the key panel and paste a key from Google Gemini, OpenAI, Groq, or Mistral AI. Keys stay in your browser and are sent only to the provider they belong to. Google AI Studio and Groq both offer free API tiers.",
  },
  {
    icon: Upload,
    title: "2. Add images, vectors or video",
    body: "Drag files onto the dashboard. JPG, PNG and WebP are analysed directly in the browser. SVG, EPS and AI files are read through their preview, so upload the vector alongside its same-named JPG preview (for example design.eps plus design.jpg) and the model will describe the actual artwork. MP4 and MOV files are supported too.",
  },
  {
    icon: Sparkles,
    title: "3. Generate and edit",
    body: "The chosen vision model analyses each file and returns a descriptive title, a longer description and a ranked keyword list. Edit anything inline, reorder keywords, set title length and keyword count in the settings panel, and lock the wording you are happy with so a regeneration does not overwrite it.",
  },
  {
    icon: ClipboardCheck,
    title: "4. Audit, then export",
    body: "Run the quality audit to see topic clarity, keyword spread and any flagged terms per asset. When an asset looks right, export a CSV built for the specific portal you are uploading to — Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime or 123RF — and import it there.",
  },
];

const capabilities = [
  "Titles, descriptions and up to 50 ranked keywords per asset",
  "Platform-specific CSV export: Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, 123RF",
  "Inline editing, bulk edits and keyword reordering before export",
  "Trademark and restricted-term flagging on generated output",
  "Series and event context so a themed batch keeps consistent phrasing",
  "Runs entirely in the browser — nothing to install, no Tagyfy account",
];

const limitations = [
  {
    title: "It cannot write metadata into vector or video files",
    body: "A browser cannot modify the internal structure of an EPS, AI, SVG, MP4 or MOV file. The browser tool generates the text and exports it as CSV, which you then import through the marketplace portal. In-file embedding for those formats is a desktop-app feature.",
  },
  {
    title: "You bring the AI key, and you answer for the output",
    body: "There is no Tagyfy-hosted model and no per-generation fee. That also means provider rate limits apply to your key, and that the accuracy of every generated term is your responsibility. Treat the output as a strong first draft, not a finished submission.",
  },
  {
    title: "Analysis happens at your AI provider, not on our servers",
    body: "To describe an image, the tool sends that image to the model provider you selected, under that provider's terms. Tagyfy runs no media proxy and keeps no copy. If your files must never leave your machine, use the desktop app so the analysis and the embedding happen locally.",
  },
  {
    title: "It does not guarantee approval, ranking or sales",
    body: "Better metadata makes an asset easier to understand. It does not make a marketplace accept it, and it does not promise a position in search. Marketplace review outcomes depend on rules and criteria that are outside any tool's control.",
  },
];

const troubleshooting = [
  {
    q: "Nothing happens when I upload a file",
    a: "Check three things in order: that you have added a working API key for a provider your key is actually enabled for, that the file is one of the supported types, and that the provider has not returned a rate-limit or quota error. The status line under the key panel shows the provider response when a request fails.",
  },
  {
    q: "The output does not mention my actual subject",
    a: "This usually means the model saw a preview rather than the artwork. For EPS, AI and SVG files, upload the same-named JPG preview in the same batch. For video, make sure the first seconds of the clip show the main subject, because that is the frame most likely to be sampled.",
  },
  {
    q: "The keywords are too generic",
    a: "Raise the keyword count and switch the strategy from single-word to mixed or multi-word phrases. Generic single words match broad queries, but the specific two- and three-word phrases are what buyers of a niche asset actually type.",
  },
  {
    q: "My export looks right but the portal rejects it",
    a: "Confirm you selected the export format for the portal you are importing into — each of the six has different headers, delimiters and category requirements. Adobe Stock, for example, requires comma-free titles, which the Adobe export handles for you.",
  },
];

const ToolGuide = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-16 space-y-20">

    {/* What this page is */}
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 text-center">
        What the free browser tool does
      </h2>
      <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-3xl mx-auto text-center mb-10">
        This page is a working stock-metadata generator that runs in your browser. You supply the
        AI key, it produces a draft title, description and keyword set for each asset, and you
        review and export the result. It exists so you can judge the output quality on your own
        files before deciding whether the desktop application is worth installing.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {workflow.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-card-primary bg-card-primary p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm leading-relaxed text-secondary">{body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Video Tutorial: Scaling Free Gemini API Quota Across Separate Projects */}
    <section
      aria-labelledby="tool-gemini-quota-heading"
      className="rounded-3xl border border-accent-indigo/40 bg-card-primary p-6 sm:p-8"
    >
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-indigo-subtle border border-accent-indigo text-primary">
            <KeyRound className="w-3.5 h-3.5" />
            Video Guide · Google Gemini API
          </div>

          <h2
            id="tool-gemini-quota-heading"
            className="text-xl sm:text-2xl font-bold text-foreground leading-snug"
          >
            How to Get More Free Gemini API Quota Using Multiple Google Cloud Projects
          </h2>

          <p className="text-sm leading-relaxed text-secondary">
            Creating multiple Gemini API keys inside a{" "}
            <strong className="text-foreground">single Google Cloud project</strong> does not
            multiply your free quota — all keys in that project draw from the same limit. Watch how
            to create separate Google Cloud projects with{" "}
            <strong className="text-foreground">one dedicated Gemini key per project</strong> so
            automatic key rotation switches across independent project quotas.
          </p>

          <ul className="space-y-2 pt-1">
            {[
              "Why multiple keys inside 1 project share the same 429 quota wall",
              "Step-by-step setup for separate Google Cloud projects (1 key each)",
              "How to organize project-separated keys cleanly for batch workflows",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-secondary">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-1">
            <Link
              to="/tutorials#gemini-api-quota-tutorial"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Read full breakdown on the Tutorials page
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-accent-indigo/40 bg-black shadow-xl shadow-black/30">
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
        </div>
      </div>
    </section>

    {/* Capabilities + limits side by side */}
    <section className="grid md:grid-cols-2 gap-8">
      <div className="rounded-3xl border border-card-primary bg-card-primary p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-foreground">What it includes</h2>
        </div>
        <ul className="space-y-3">
          {capabilities.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-secondary leading-relaxed">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-foreground">Limitations to know first</h2>
        </div>
        <div className="space-y-5">
          {limitations.map(({ title, body }) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
              <p className="text-sm leading-relaxed text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Format support */}
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 text-center">
        File formats and what happens to each
      </h2>
      <p className="text-sm text-secondary max-w-3xl mx-auto text-center mb-8">
        Support for embedded fields varies by format and by marketplace, so treat this as a guide to
        what the tool can read and produce, then confirm the current requirements for each platform
        you submit to.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-card-primary">
        <table className="w-full text-sm">
          <thead className="bg-card-primary">
            <tr className="text-left">
              <th className="px-4 py-3 font-bold text-foreground">Format</th>
              <th className="px-4 py-3 font-bold text-foreground">Analysis</th>
              <th className="px-4 py-3 font-bold text-foreground">Browser tool</th>
              <th className="px-4 py-3 font-bold text-foreground">Desktop app</th>
            </tr>
          </thead>
          <tbody className="text-secondary">
            {[
              ["JPG / JPEG, PNG, WebP", "Direct vision analysis", "Generate + CSV export", "Generate + in-file embed + CSV"],
              ["TIFF", "Direct vision analysis", "Not supported", "Generate + in-file embed + CSV"],
              ["SVG, EPS, AI", "Via same-named JPG preview", "Generate + CSV export", "Generate + native XMP embed"],
              ["MP4, MOV, WebM", "Sampled video frame", "Generate + CSV export", "Generate + native container embed"],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-card-primary">
                {row.map((cell, i) => (
                  <td key={i} className={`px-4 py-3 ${i === 0 ? "font-semibold text-foreground" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* Troubleshooting */}
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
        When something does not work
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {troubleshooting.map(({ q, a }) => (
          <div key={q} className="rounded-2xl border border-card-primary bg-card-primary p-6">
            <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">{q}</h3>
            <p className="text-sm leading-relaxed text-secondary">{a}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Next steps */}
    <section className="rounded-3xl border border-card-primary bg-card-primary p-6 sm:p-10">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
        Browser tool or desktop app?
      </h2>
      <p className="text-sm sm:text-base text-secondary leading-relaxed mb-8">
        Use this browser tool when you want to check output quality, work on a handful of images, or
        avoid installing anything. Move to the desktop application when you are processing in bulk,
        need metadata written directly into EPS, AI, SVG, MP4 or MOV files, or need your media to
        stay on your own machine.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <Link
          to="/download"
          className="group rounded-2xl border border-card-primary p-5 hover:border-primary transition-colors"
        >
          <FileImage className="w-5 h-5 text-primary mb-3" />
          <p className="font-bold text-foreground mb-1">Desktop app</p>
          <p className="text-secondary">
            In-file embedding, batch queue, 3-day full-access trial. See what ships in v1.3.6.
          </p>
        </Link>
        <Link
          to="/tutorials"
          className="group rounded-2xl border border-card-primary p-5 hover:border-primary transition-colors"
        >
          <Layers className="w-5 h-5 text-primary mb-3" />
          <p className="font-bold text-foreground mb-1">Tutorials &amp; setup guides</p>
          <p className="text-secondary">
            Gemini multi-project free quota video tutorial plus four written guides for install, key rotation and batching.
          </p>
        </Link>
        <Link
          to="/metadata-checker"
          className="group rounded-2xl border border-card-primary p-5 hover:border-primary transition-colors"
        >
          <ClipboardCheck className="w-5 h-5 text-primary mb-3" />
          <p className="font-bold text-foreground mb-1">Free compliance checker</p>
          <p className="text-secondary">
            Validate title length, keyword priority and trademarks across 6 agencies with no API key.
          </p>
        </Link>
        <Link
          to="/blogs"
          className="group rounded-2xl border border-card-primary p-5 hover:border-primary transition-colors"
        >
          <Download className="w-5 h-5 text-primary mb-3" />
          <p className="font-bold text-foreground mb-1">Contributor guides</p>
          <p className="text-secondary">
            How marketplaces weigh titles and keywords, and the rejection causes worth designing around.
          </p>
        </Link>
      </div>
    </section>

  </div>
);

export default ToolGuide;
