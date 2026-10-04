import { Brain, FileStack, BarChart3, Shield, Zap, Globe } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

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

/**
 * CoreCapabilities — the "at a glance" 6-card capability summary.
 * Rendered exclusively on /features, directly above the full feature grid,
 * so it never repeats on the homepage.
 */
const CoreCapabilities = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-12 pb-4 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 accent-indigo-light accent-indigo-border-soft text-accent">
            Powerful Features
          </div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Built for Professional Metadata
          </h2>
          <p className="reveal reveal-delay-2 max-w-2xl mx-auto text-lg text-tertiary">
            Everything you need to generate SEO-optimized metadata at scale, from single assets to 500+ file batches.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreCapabilities.map(({ title, desc, icon: Icon }) => (
            <div key={title} className="reveal glass-panel rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors border border-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm text-secondary leading-relaxed font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreCapabilities;
