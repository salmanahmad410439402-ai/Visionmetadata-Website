import { Upload, Sparkles, PackageCheck, FileSearch, Brain, Shield, Cpu, Layers, BarChart3, AlertTriangle, Tag, ListFilter, Database } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Assets",
    desc: "Drag and drop images, videos, vectors, or entire folders. Supports JPG, PNG, EPS, AI, SVG, MP4, and MOV.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analyzes & Generates",
    desc: "Vision AI reads every file and generates SEO-optimized titles, descriptions, and up to 50 ranked keywords — tailored to each platform's requirements.",
  },
  {
    icon: FileSearch,
    step: "03",
    title: "Review & Refine",
    desc: "Edit metadata inline, use the Bulk Editor for batch changes, and check the confidence score and risk analysis for each asset before exporting.",
  },
  {
    icon: PackageCheck,
    step: "04",
    title: "Embed & Export",
    desc: "Metadata is embedded directly into your files — stock platforms read it automatically on upload. Export platform-ready CSVs for 6 stock sites.",
  },
];

const features = [
  { icon: Cpu,           title: "6 AI Providers",        desc: "Gemini, GPT-4o, Groq (Llama 4), Mistral, OpenRouter, and local Ollama. Smart priority waterfall with automatic key rotation." },
  { icon: Shield,        title: "Offline Mode",           desc: "No internet? Use Ollama to run vision models entirely on your PC. Zero data leaves your machine." },
  { icon: Sparkles,      title: "AI Mode Selector",       desc: "Three modes: Cloud Only, Offline Only, or Auto (tries cloud first, falls back to Ollama). Switch with one click." },
  { icon: BarChart3,     title: "Bulk Processing",        desc: "Queue hundreds of assets. Parallel workers with cancellation support, live batch progress, and auto-retry on failures." },
  { icon: AlertTriangle, title: "Trademark Sniffer",      desc: "Automatically detects and removes 100+ brand names. Replaces them with safe generic equivalents." },
  { icon: Tag,           title: "Series Mode",            desc: "Mark assets as a series. The AI appends Part 01/02/03 to titles and unifies keywords across the entire set." },
  { icon: BarChart3,     title: "Confidence Scores",      desc: "Each asset gets a 0–100 score with a 4-axis breakdown: subject clarity, keyword precision, differentiator strength, compliance safety." },
  { icon: AlertTriangle, title: "Risk Analysis",          desc: "Flags potential reviewer rejection reasons — editorial content, brand mentions, compliance issues — before you upload." },
  { icon: Database,      title: "Platform Readiness",     desc: "Each asset rated READY / REVIEW / NOT READY for Adobe Stock, Freepik, and Shutterstock individually." },
  { icon: ListFilter,    title: "Negative Keywords",      desc: "Block words you never want in metadata. The system strips them from every generated output automatically." },
  { icon: Tag,           title: "Multi-Word Limit",       desc: "Enforce a max 2-word keyword length globally. Stock platforms prefer short keywords — enforced at the prompt level." },
  { icon: Layers,        title: "Native File Embedding",  desc: "Writes metadata directly into your files for all image, vector, and video formats. No extra software needed." },
];

const SectionLabel = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4"
    style={{ background: "hsl(190 95% 50% / 0.07)", borderColor: "hsl(190 95% 50% / 0.2)", color: "hsl(190 95% 65%)" }}>
    {text}
  </div>
);

const FeaturesGrid = () => {
  const stepsRef = useReveal();
  const featRef  = useReveal();

  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── How It Works ── */}
        <div ref={stepsRef as React.RefObject<HTMLDivElement>} className="text-center mb-20">
          <div className="reveal"><SectionLabel text="How It Works" /></div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From file to upload-ready in four steps
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto mb-16" style={{ color: "hsl(215 20% 65%)" }}>
            Everything happens inside the app — no browser, no manual entry, no extra tools needed.
          </p>
          <div className="grid md:grid-cols-4 gap-5">
            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <div key={step}
                className={`reveal reveal-delay-${i + 1} card-lift card-glow relative rounded-2xl border p-7 text-left`}
                style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                <span className="text-5xl font-black select-none absolute top-5 right-5"
                  style={{ color: "hsl(190 95% 50% / 0.1)" }}>{step}</span>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "hsl(190 95% 50% / 0.1)" }}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(215 20% 65%)" }}>{desc}</p>
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
            <p className="reveal reveal-delay-2 max-w-xl mx-auto" style={{ color: "hsl(215 20% 65%)" }}>
              Every feature is designed around the real workflow of a stock media producer.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title}
                className={`reveal reveal-delay-${Math.min(i % 3 + 1, 6)} card-lift card-glow rounded-2xl border p-6`}
                style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(190 95% 50% / 0.1)" }}>
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(215 20% 65%)" }}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 rounded-2xl border p-6"
            style={{ background: "hsl(190 95% 50% / 0.04)", borderColor: "hsl(190 95% 50% / 0.15)" }}>
            <p className="text-xs font-semibold text-primary text-center uppercase tracking-widest mb-5">
              Supported File Formats
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "JPG / JPEG", cat: "Image"  },
                { label: "PNG",        cat: "Image"  },
                { label: "WebP",       cat: "Image"  },
                { label: "SVG",        cat: "Vector" },
                { label: "EPS",        cat: "Vector" },
                { label: "AI",         cat: "Vector" },
                { label: "MP4",        cat: "Video"  },
                { label: "MOV",        cat: "Video"  },
              ].map(({ label, cat }) => (
                <div key={label} className="flex flex-col items-center px-4 py-2.5 rounded-xl border"
                  style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                  <span className="text-xs font-bold text-foreground">{label}</span>
                  <span className="text-[10px]" style={{ color: "hsl(215 20% 55%)" }}>{cat}</span>
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
