import { Upload, Sparkles, PackageCheck, FileSearch, Brain, Shield, Cpu, Layers, BarChart3, AlertTriangle, Tag, ListFilter, Database, Globe } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Assets",
    desc: "Drag and drop images, videos, vectors, or entire folders. Batch upload 100+ files at once. Supports JPG, PNG, WebP, EPS, AI, SVG, MP4, and more.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analyzes & Generates",
    desc: "Vision AI analyzes every file and generates SEO-optimized titles, rich descriptions, and up to 50 ranked keywords — tailored to each platform's requirements.",
  },
  {
    icon: FileSearch,
    step: "03",
    title: "Review, Refine & Check Quality",
    desc: "Edit metadata inline, use bulk editor for batch changes, check confidence scores and risk flags per asset. Get platform readiness ratings before upload.",
  },
  {
    icon: PackageCheck,
    step: "04",
    title: "Embed & Export Ready",
    desc: "Metadata embeds directly into your files. Export platform-ready CSVs for Adobe Stock, Freepik, Shutterstock, Dreamstime, 123RF, and Vecteezy in seconds.",
  },
];

const features = [
  { icon: Cpu,           title: "Multi-Provider AI",     desc: "Use Gemini, GPT-4o, Groq (Llama 4), OpenRouter, or Mistral. Add unlimited API keys and run multiple AI providers in parallel." },
  { icon: Shield,        title: "Rate Limit Protection",  desc: "Automatically rotates through your API keys and providers when limits are hit. Never stop processing because of a single exhausted key." },
  { icon: Sparkles,      title: "Smart Parallel Queueing", desc: "Intelligent API queueing ensures optimal speed and parallel processing. Maximize your processing throughput with multiple API keys." },
  { icon: BarChart3,     title: "Batch Processing at Scale", desc: "Process 100+ to 500+ assets in a single batch. Parallel workers with live progress, auto-retry on failures, and cancellation support." },
  { icon: AlertTriangle, title: "Trademark & Brand Sniffer", desc: "AI-powered system detects 100+ brand names and trademarked terms. Auto-removes them and replaces with safe generic alternatives." },
  { icon: Tag,           title: "Series & Event Context",  desc: "Mark assets as a series to auto-append Part 01/02/03 sequences. Use event context to theme all metadata around a specific event or collection." },
  { icon: BarChart3,     title: "Confidence & Risk Scores", desc: "Every asset gets a 0–100 confidence score with 4-axis breakdown. Identifies compliance risks before uploading to stock platforms." },
  { icon: AlertTriangle, title: "Platform Readiness Checks", desc: "Instant READY / REVIEW / NOT READY rating for Adobe Stock, Freepik, and Shutterstock. Know exactly which assets to submit where." },
  { icon: Database,      title: "Bulk Metadata Editor",     desc: "Spreadsheet-style view of all assets. Find & replace, append/prepend text, remove words across multiple assets at once." },
  { icon: ListFilter,    title: "Negative Keywords",       desc: "Define words you never want in metadata. They are automatically stripped from every generated output." },
  { icon: Tag,           title: "Keyword Strategy Control", desc: "Choose Single-Word, Multi-Word, or Mixed keyword strategies. Enforce max keyword length. Customize keyword count (5–50)." },
  { icon: Layers,        title: "Native File Metadata",    desc: "Embeds metadata directly into JPEG, PNG, WebP, TIFF, MP4 and vector files. Platforms automatically read it on upload." },
  { icon: Globe,         title: "6-Platform CSV Export",   desc: "Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, Vecteezy. Each CSV is formatted exactly as required by each platform." },
  { icon: Shield,        title: "AI Disclosure Compliance", desc: "Auto-adds 'Generative AI' keywords for AI-created content. Adobe 2026 rule compliant. C2PA transparency metadata included." },
  { icon: Sparkles,      title: "Unattended Mode",         desc: "After batch processing completes, automatically download a ZIP with all metadata-embedded files if idle for 5 minutes." },
  { icon: Brain,         title: "Quality Check on Demand",  desc: "Manual quality pass on any asset for detailed confidence breakdown, risk flags, and platform readiness insights." },
];

const SectionLabel = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 accent-cyan-light accent-cyan-border-soft text-accent">
    {text}
  </div>
);

const FeaturesGrid = () => {
  const stepsRef = useReveal();
  const featRef  = useReveal();

  return (
    <section id="features" className="pt-12 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── How It Works ── */}
        <div ref={stepsRef as React.RefObject<HTMLDivElement>} className="text-center mb-20">
          <div className="reveal"><SectionLabel text="How It Works" /></div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From file to upload-ready in four steps
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto mb-16 text-tertiary">
            Everything happens inside the app — no browser, no manual entry, no extra tools needed.
          </p>
          <div className="grid md:grid-cols-4 gap-5">
            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <div key={step}
                className={`reveal reveal-delay-${i + 1} card-lift card-glow relative rounded-2xl border p-7 text-left bg-card-primary border-card-primary`}>
                <span className="text-5xl font-black select-none absolute top-5 right-5 opacity-10 text-primary">{step}</span>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 accent-cyan-subtle">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-xs leading-relaxed text-tertiary">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider mb-20" />

        {/* ── Features Grid + Formats — all inside featRef so observer sees every .reveal child ── */}
        <div ref={featRef as React.RefObject<HTMLDivElement>}>

          <div className="text-center mb-10">
            <div className="reveal"><SectionLabel text="Everything You Need" /></div>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built specifically for stock contributors
            </h2>
            <p className="reveal reveal-delay-2 max-w-xl mx-auto text-tertiary">
              Every feature is designed around the real workflow of a stock media producer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title}
                className={`reveal reveal-delay-${Math.min(i % 4 + 1, 6)} card-lift card-glow rounded-2xl border p-6 hover:border-primary/50 transition-all duration-300 bg-card-primary border-card-primary`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 accent-cyan-light">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-tertiary">{desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 rounded-2xl border p-6 accent-cyan-ultra-light accent-cyan-border-soft">
            <p className="text-xs font-semibold text-primary text-center uppercase tracking-widest mb-5">
              100+ Supported File Formats
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "JPG / JPEG", cat: "Image"  },
                { label: "PNG",        cat: "Image"  },
                { label: "WebP",       cat: "Image"  },
                { label: "TIFF",       cat: "Image"  },
                { label: "SVG",        cat: "Vector" },
                { label: "EPS",        cat: "Vector" },
                { label: "AI",         cat: "Vector" },
                { label: "MP4",        cat: "Video"  },
                { label: "MOV",        cat: "Video"  },
                { label: "WebM",       cat: "Video"  },
              ].map(({ label, cat }) => (
                <div key={label} className="flex flex-col items-center px-4 py-2.5 rounded-xl border hover:border-primary/50 transition-all bg-card-primary border-card-primary">
                  <span className="text-xs font-bold text-foreground">{label}</span>
                  <span className="text-[10px] text-minimal">{cat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end featRef wrapper */}

      </div>
    </section>
  );
};

export default FeaturesGrid;
