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

const WhyVisionMeta = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ background: "hsl(190 95% 50% / 0.07)", borderColor: "hsl(190 95% 50% / 0.2)", color: "hsl(190 95% 65%)" }}>
            Before vs After
          </div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The Old Way vs VisionMetadata Pro
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto" style={{ color: "hsl(215 20% 65%)" }}>
            See exactly what changes when you stop doing metadata manually
          </p>
        </div>

        <div className="reveal reveal-delay-3 grid md:grid-cols-2 gap-5">

          {/* Before column */}
          <div className="rounded-2xl border p-7"
            style={{ background: "hsl(0 30% 6%)", borderColor: "hsl(0 40% 16%)" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(0 60% 15%)" }}>
                <X className="w-4 h-4" style={{ color: "hsl(0 70% 60%)" }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: "hsl(0 60% 70%)" }}>Doing It Manually</h3>
            </div>
            <ul className="space-y-3">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "hsl(215 15% 52%)" }}>
                  <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "hsl(0 60% 45%)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After column */}
          <div className="rounded-2xl border p-7 relative overflow-hidden"
            style={{ background: "hsl(190 40% 5%)", borderColor: "hsl(190 50% 18%)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(190 95% 50% / 0.05) 0%, transparent 65%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(190 60% 12%)" }}>
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-bold text-primary">With VisionMetadata Pro</h3>
              </div>
              <ul className="space-y-3">
                {after.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "hsl(215 20% 72%)" }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                    {item}
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
