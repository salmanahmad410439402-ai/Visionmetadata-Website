import { X, Check, Zap, Shield, Brain, BarChart3, FileStack, Globe } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const before = [
  "Type titles one by one — 5–10 minutes per file",
  "Copy-paste keywords manually from notes",
  "Get rejected because of trademarked keywords",
  "Re-enter metadata on every stock platform",
  "No way to batch process — one file at a time",
  "Guess what keywords will rank — no data",
];

const after = [
  "AI generates title, description & 50 keywords instantly",
  "Keywords ranked by SEO weight — best ones first",
  "Trademark sniffer auto-removes brand names",
  "Metadata embeds into files — platforms read it automatically",
  "Process hundreds of files in one batch",
  "Confidence scores & risk analysis per asset",
];

const coreCapabilities = [
  {
    icon: Brain,
    title: "Multi-AI Support",
    desc: "Connect Gemini, GPT-4, Groq, OpenRouter, or Mistral. Use multiple providers simultaneously.",
  },
  {
    icon: FileStack,
    title: "100+ File Types",
    desc: "JPEG, PNG, WebP, MP4 videos, AI vectors, EPS, SVG, TIFF. Process anything in one batch.",
  },
  {
    icon: BarChart3,
    title: "SEO Confidence Scoring",
    desc: "Every asset gets a confidence score (0-100) with risk flags to prevent platform rejection.",
  },
  {
    icon: Shield,
    title: "Trademark Protection",
    desc: "AI-powered sniffer automatically removes brand names and replaces them with safe alternatives.",
  },
  {
    icon: Zap,
    title: "Smart Batch Processing",
    desc: "Process 100+ files at once with automatic retry on failure and unattended mode support.",
  },
  {
    icon: Globe,
    title: "Platform Export",
    desc: "Export formatted CSV for Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF, Vecteezy.",
  },
];

const WhyVisionMeta = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-12 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Core Capabilities Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ background: "hsl(190 95% 50% / 0.07)", borderColor: "hsl(190 95% 50% / 0.2)", color: "hsl(190 95% 65%)" }}>
              Powerful Features
            </div>
            <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Built for Professional Metadata
            </h2>
            <p className="reveal reveal-delay-2 max-w-2xl mx-auto text-lg" style={{ color: "hsl(215 20% 65%)" }}>
              Everything you need to generate SEO-optimized metadata at scale, from single assets to 500+ file batches.
            </p>
          </div>

          <div className="reveal reveal-delay-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreCapabilities.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="reveal rounded-2xl border p-6 hover:border-primary/50 transition-all duration-300"
                style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Before vs After */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 bg-accent-cyan-subtle border-accent-cyan-subtle text-accent-cyan">
            Before vs After
          </div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
            See What Changes
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-secondary">
            From manual keyword entry to automated, AI-optimized metadata in minutes
          </p>
        </div>

        <div className="reveal reveal-delay-3 grid md:grid-cols-2 gap-6">

          {/* Before column */}
          <div className="rounded-2xl border p-8 bg-red-950/20 border-red-900/40">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-900/30">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-400">Without Automation</h3>
            </div>
            <ul className="space-y-4">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-secondary">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5 mt-1 text-red-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After column */}
          <div className="rounded-2xl border p-8 relative overflow-hidden bg-cyan-950/20 border-accent-cyan-dark">
            <div className="absolute inset-0 pointer-events-none glow-cyan-sm" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-accent-cyan-dark">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary">With VisionMetadata Pro</h3>
              </div>
              <ul className="space-y-4">
                {after.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-primary/80">
                    <Check className="w-4 h-4 flex-shrink-0 mt-1 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default WhyVisionMeta;
