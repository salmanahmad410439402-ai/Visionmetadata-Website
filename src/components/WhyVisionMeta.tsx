import { X, Check } from "lucide-react";
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

/**
 * WhyVisionMeta — the "Before vs After" comparison. This is the homepage's
 * exclusive persuasion section; the capability summary that used to live
 * alongside it now has its own home on /features (see CoreCapabilities)
 * so the two pages don't repeat each other.
 */
const WhyVisionMeta = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-12 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 bg-accent-indigo-subtle border-accent-indigo-subtle text-accent-indigo">
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
          <div className="rounded-2xl border p-8 relative overflow-hidden bg-indigo-950/20 border-accent-indigo-dark">
            <div className="absolute inset-0 pointer-events-none glow-indigo-sm" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-accent-indigo-dark">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary">With Tagyfy Pro</h3>
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
