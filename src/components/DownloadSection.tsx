import { Download, Monitor, HardDrive, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";

const DownloadSection = () => {
  const ref = useReveal();
  return (
    <section id="download" ref={ref as React.RefObject<HTMLElement>} className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">

        {/* Glow card */}
        <div className="reveal rounded-3xl border p-10 relative overflow-hidden"
          style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(190 95% 50% / 0.2)", boxShadow: "0 0 60px hsl(190 95% 50% / 0.06)" }}>

          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(190 95% 50% / 0.07) 0%, transparent 65%)" }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ background: "hsl(190 95% 50% / 0.07)", borderColor: "hsl(190 95% 50% / 0.2)", color: "hsl(190 95% 65%)" }}>
              Free Download
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Try It Free — Right Now
            </h2>
            <p className="mb-2 text-base font-medium" style={{ color: "hsl(215 20% 75%)" }}>
              Download takes 30 seconds. Works with free AI keys — no payment needed to test.
            </p>
            <p className="mb-8 text-sm" style={{ color: "hsl(215 20% 52%)" }}>
              You only need a license key to unlock continued use after the trial.
            </p>

            <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/v1.0.0/VisionMetadata.Pro.Setup.1.0.1.exe">
              <Button size="lg"
                className="btn-shimmer h-16 px-14 text-lg font-bold rounded-2xl shadow-[0_0_40px_hsl(190_95%_50%/0.35)] hover:shadow-[0_0_56px_hsl(190_95%_50%/0.5)] hover:scale-[1.03] transition-all duration-300">
                <Download className="w-6 h-6 mr-3" />
                Download VisionMetadata Pro
              </Button>
            </a>

            {/* Fast reassurances */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-5">
              {[
                "No credit card",
                "Works with Gemini free tier",
                "Windows 10 / 11",
                "All features included",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1 text-xs" style={{ color: "hsl(215 20% 50%)" }}>
                  <Zap className="w-2.5 h-2.5 text-primary/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* System requirements */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {[
            { icon: Monitor,   label: "OS",       value: "Windows 10 / 11 (64-bit)" },
            { icon: HardDrive, label: "Storage",   value: "~200 MB disk space"       },
            { icon: Package,   label: "Bundled",   value: "All components included"  },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="reveal rounded-xl border p-4 flex items-start gap-3 text-left"
              style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
              <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 60%)" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default DownloadSection;
