import { Play, Download, Settings, Key, Zap, Upload, X, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Tutorials page.
 *
 * Previously this page presented four separate "video tutorials" that all
 * pointed at the same YouTube video, and its FAQ claimed a transcript feature
 * and a "Help Center" that do not exist. That reads to a visitor (and to a
 * reviewer) as duplicated, recycled content. It is now built around four
 * genuinely written step-by-step guides, with the single walkthrough video used
 * once as an optional visual aid.
 */

const WALKTHROUGH_VIDEO_ID = "MoeprdBnpes";

const guides = [
  {
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
    num: "02",
    icon: Key,
    title: "Add an AI provider key (and why you bring your own)",
    summary:
      "Tagyfy Pro does not resell AI access. Connect a free or paid key from Google, OpenAI, Groq, Mistral, or OpenRouter, and understand where that key lives.",
    steps: [
      "Open Settings and go to the AI provider section. Keys are stored in local storage on your own machine, not on a Tagyfy server.",
      "Create a key with your chosen provider. Google AI Studio issues a free Gemini API key in about a minute; Groq also has a free tier. Paste it into the matching provider field.",
      "Add more than one key if you have them. The app rotates through your keys automatically and parks a key in a short cooldown when it hits a rate limit, so a big batch keeps moving instead of failing.",
      "Choose the model you want for vision analysis. Gemini Flash is the usual starting point on the free tier; heavier models cost more per image but can describe more complex scenes.",
      "Run a single test image before a large batch. Confirm the title, description and keywords come back in your chosen language and style before you commit hundreds of files.",
    ],
    note: "Provider keys have their own quotas and billing terms. Tagyfy Pro never charges per generation — your only cost is whatever your AI provider charges you directly.",
  },
  {
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
    q: "Do I have to read every guide?",
    a: "No. Guide 1 is only needed once, when you install the app. Guide 2 is needed once per provider key. Guides 3 and 4 cover the settings and the batch workflow you will run repeatedly, so those are the two worth reading closely.",
  },
  {
    q: "Is there a video version?",
    a: "Yes — one walkthrough video on this page covers install, generation, review and upload end to end. It is a single recording rather than one video per step, so anything you want to re-check later is faster to find in the written guides above.",
  },
  {
    q: "Can I use this on Mac or Linux?",
    a: "The desktop application currently ships for Windows 10 and 11 (64-bit) only. On Mac or Linux you can still use the browser tool on our Tool page, which generates metadata but cannot write it into vector or video files.",
  },
  {
    q: "Where do I get help if I get stuck?",
    a: "Send us the details through the Contact page. Include your app version, the file type involved, the provider you selected, and the exact error text. That is usually enough for us to reproduce the problem without a back-and-forth.",
  },
];

const VideoPlayerModal = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
    role="dialog"
    aria-label="Tagyfy Pro walkthrough video"
  >
    <div
      className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <iframe
        src={`https://www.youtube.com/embed/${WALKTHROUGH_VIDEO_ID}?autoplay=1&mute=0&rel=0`}
        title="Tagyfy Pro walkthrough"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="w-full h-full"
      />
      <button
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
      >
        <X className="w-6 h-6 text-white" />
      </button>
    </div>
  </div>
);

const TutorialsSection = () => {
  const ref = useReveal();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-20">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 bg-accent-indigo-subtle border-accent-indigo-subtle">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Setup Guides</span>
          </div>

          <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Set up and run your first batch
          </h1>

          <p className="reveal reveal-delay-2 text-lg sm:text-xl max-w-2xl mx-auto mb-6 text-primary/80">
            Four written guides that take you from a fresh install to a reviewed,
            metadata-embedded batch — with a full video walkthrough if you prefer to watch.
          </p>

          <p className="reveal reveal-delay-2 text-sm max-w-2xl mx-auto text-secondary">
            Written for Tagyfy Pro v1.3.6 on Windows 10 / 11. If a screenshot or label in your
            build differs from what is described here, tell us through the Contact page and we
            will correct the guide.
          </p>
        </div>

        {/* Single walkthrough video */}
        <div className="reveal reveal-delay-3 mb-24">
          <div className="relative w-full rounded-2xl overflow-hidden max-w-3xl mx-auto border border-accent-indigo bg-card-primary"
            style={{ aspectRatio: "16 / 9" }}>
            {isPlayingDemo ? (
              <iframe
                className="absolute inset-0 w-full h-full bg-black"
                src={`https://www.youtube.com/embed/${WALKTHROUGH_VIDEO_ID}?autoplay=1&mute=0&rel=0`}
                title="Tagyfy Pro walkthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setIsPlayingDemo(true)}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all duration-300 bg-black"
                aria-label="Play the Tagyfy Pro walkthrough video"
              >
                <img
                  src="/thumbnail.jpg"
                  alt="Preview frame of the Tagyfy Pro walkthrough video"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="relative w-20 h-20 rounded-full border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-accent-indigo-subtle border-accent-indigo shadow-lg shadow-black/50 z-10">
                  <Play className="w-8 h-8 text-white ml-1 drop-shadow-md" />
                </div>
                <span className="relative z-10 text-xs sm:text-sm uppercase tracking-widest font-semibold text-white drop-shadow-md">
                  Watch the full workflow walkthrough
                </span>
              </button>
            )}
          </div>
          <p className="text-center text-xs mt-5 text-quaternary">
            One recording covering install, generation, review and upload · about 8 minutes
          </p>
        </div>

        {/* Written guides */}
        <div className="space-y-16 mb-24">
          {guides.map(({ num, icon: Icon, title, summary, steps, note }, idx) => (
            <article
              key={num}
              className={`reveal reveal-delay-${(idx % 4) + 1} rounded-3xl border p-6 sm:p-10 bg-card-primary border-card-primary`}
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
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{title}</h2>
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

        {/* FAQ */}
        <div className="reveal mb-24">
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
        <div className="reveal mb-16 rounded-3xl border p-6 sm:p-8 bg-card-primary border-card-primary">
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
        <div className="reveal text-center rounded-3xl border p-8 sm:p-12 bg-card-primary border-card-primary">
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

      {isPlayingDemo && <VideoPlayerModal onClose={() => setIsPlayingDemo(false)} />}
    </section>
  );
};

export default TutorialsSection;
