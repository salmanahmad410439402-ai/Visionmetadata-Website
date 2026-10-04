import { Upload, Brain, FileSearch, PackageCheck } from "lucide-react";
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

const SectionLabel = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 accent-indigo-light accent-indigo-border-soft text-accent">
    {text}
  </div>
);

/**
 * HowItWorks — the 4-step workflow explanation.
 * Lives exclusively on the homepage as the primary onboarding narrative.
 * The full 16-item feature catalogue lives on /features (see FeatureGridFull)
 * so the two pages never repeat the same body content.
 */
const HowItWorks = () => {
  const stepsRef = useReveal();

  return (
    <section id="how-it-works" className="pt-12 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
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
                className={`reveal reveal-delay-${i + 1} card-lift relative rounded-2xl p-7 text-left glass-panel group hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]`}>
                <span className="text-5xl font-black select-none absolute top-5 right-5 opacity-10 text-primary group-hover:text-primary transition-colors">{step}</span>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-xs leading-relaxed text-tertiary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
