import { Link } from "react-router-dom";
import { Cpu, Shield, BarChart3, Globe, ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const highlights = [
  {
    icon: Cpu,
    title: "Multi-Provider AI Engine",
    desc: "Run Gemini, GPT-4o, Groq, Mistral, and OpenRouter side by side with automatic key rotation.",
  },
  {
    icon: Shield,
    title: "Trademark & Brand Sniffer",
    desc: "Flags 100+ brand names before upload so your assets never get rejected for trademarked terms.",
  },
  {
    icon: BarChart3,
    title: "Confidence & Risk Scoring",
    desc: "Every asset gets a 0–100 readiness score across four compliance dimensions before you submit it.",
  },
  {
    icon: Globe,
    title: "6-Platform CSV Export",
    desc: "One click produces correctly formatted CSVs for Adobe Stock, Shutterstock, Freepik, and more.",
  },
];

/**
 * FeatureHighlights — a short, homepage-only teaser of the product's
 * capabilities. The full 16-feature catalogue (with supported formats)
 * lives exclusively on /features, so this component intentionally only
 * surfaces four highlights with unique copy and links out for the rest.
 */
const FeatureHighlights = () => {
  const ref = useReveal();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 accent-indigo-light accent-indigo-border-soft text-accent">
            A Few Favorites
          </div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
            A quick look at what's inside
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-tertiary">
            This is a small sample — Tagyfy Pro ships with 16 production features in total.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {highlights.map(({ icon: Icon, title, desc }, i) => (
            <div key={title}
              className={`reveal reveal-delay-${i + 1} rounded-2xl p-6 glass-panel group hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)] transition-all duration-300`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-xs leading-relaxed text-tertiary">{desc}</p>
            </div>
          ))}
        </div>

        <div className="reveal text-center">
          <Link to="/features" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
            See all 16 features & supported file formats
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
