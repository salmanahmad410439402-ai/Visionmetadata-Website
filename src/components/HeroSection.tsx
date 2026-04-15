import { Download, Shield, Zap, Cpu, Globe, Check, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";

const HeroSection = () => {
  const ref = useReveal();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden grid-bg"
    >
      {/* Ambient orbs */}
      <div className="orb-1 absolute top-1/2 left-1/2 w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(190 95% 50% / 0.07) 0%, transparent 70%)" }} />
      <div className="orb-2 absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(190 95% 50% / 0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="reveal relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-8">
          <span className="relative flex h-1.5 w-1.5">
            <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          VisionMetadata Pro — v1.1.3 Now Available
        </div>

        {/* Headline */}
        <h1 className="reveal reveal-delay-1 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-4 leading-[1.05]">
          Stop Wasting Hours<br className="hidden sm:block" /> on{" "}
          <span className="text-gradient">Stock Metadata</span>
        </h1>

        <p className="reveal reveal-delay-2 text-lg sm:text-xl font-semibold mb-5"
          style={{ color: "hsl(210 40% 88%)" }}>
          AI-powered metadata generation for Adobe Stock, Shutterstock, Freepik & more.
        </p>

        <p className="reveal reveal-delay-2 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-8"
          style={{ color: "hsl(215 20% 72%)" }}>
          Generate, optimize, and embed titles, descriptions, and keywords directly into your images, videos, and vector files — in bulk, in seconds, ready for upload.
        </p>

        {/* AI mode pills */}
        <div className="reveal reveal-delay-3 flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: Globe, label: "Cloud AI — Gemini, GPT-4o, Groq, Mistral…" },
            { icon: Cpu,   label: "100% Offline via Ollama" },
            { icon: Zap,   label: "Auto-Fallback Mode" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
              style={{ background: "hsl(190 95% 50% / 0.08)", borderColor: "hsl(190 95% 50% / 0.25)", color: "hsl(190 95% 72%)" }}>
              <Icon className="w-3 h-3" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="reveal reveal-delay-4 flex flex-col items-center gap-3">
          <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.2.0/VisionMetadata.Pro_1.2.0.zip">
            <Button size="lg" className="btn-shimmer h-14 px-10 text-base font-bold rounded-xl shadow-[0_0_30px_hsl(190_95%_50%/0.35)] hover:shadow-[0_0_48px_hsl(190_95%_50%/0.5)] hover:scale-[1.03] transition-all duration-300">
              <Download className="w-5 h-5 mr-2" />
              Download Free — Windows
            </Button>
          </a>

          {/* Friction removers */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(215 20% 58%)" }}>
              <Shield className="w-3 h-3 text-primary/60" />
              No credit card needed
            </span>
            <span className="text-xs" style={{ color: "hsl(215 20% 38%)" }}>·</span>
            <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(215 20% 58%)" }}>
              <Clock className="w-3 h-3 text-primary/60" />
              Works with free AI keys
            </span>
            <span className="text-xs" style={{ color: "hsl(215 20% 38%)" }}>·</span>
            <span className="text-xs" style={{ color: "hsl(215 20% 58%)" }}>
              Windows 10 / 11
            </span>
          </div>
        </div>

        {/* Social proof strip */}
        <div className="reveal reveal-delay-5 mt-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" style={{ color: "hsl(190 95% 55%)" }} />
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(215 20% 60%)" }}>
            Trusted by 200+ Stock Contributors Worldwide
          </p>
        </div>

        {/* Feature checklist */}
        <div className="reveal reveal-delay-5 mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-w-3xl mx-auto text-left">
          {[
            "Bulk batch processing — all assets at once",
            "6 AI providers: Gemini, GPT-4o, Groq, Mistral, OpenRouter, Ollama",
            "Works 100% offline with local Ollama models",
            "Embeds metadata directly into your files automatically",
            "Platform-ready CSV export for 6 stock sites",
            "Trademark sniffer removes brand names automatically",
            "AI-mode selector: Cloud · Offline · Auto-fallback",
            "Supports JPG · PNG · EPS · AI · SVG · MP4 · MOV",
            "Confidence scores + risk analysis per asset",
          ].map((feat) => (
            <div key={feat} className="flex items-start gap-2 text-xs" style={{ color: "hsl(215 20% 68%)" }}>
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Platform strip */}
        <div className="reveal reveal-delay-6 mt-10 flex flex-wrap justify-center items-center gap-5">
          <span className="text-xs uppercase tracking-widest" style={{ color: "hsl(215 20% 35%)" }}>Works with</span>
          {["Adobe Stock", "Shutterstock", "Freepik", "Dreamstime", "123RF", "Vecteezy"].map((name) => (
            <span key={name} className="text-xs uppercase tracking-wider font-semibold transition-colors duration-200 hover:text-primary cursor-default"
              style={{ color: "hsl(215 20% 42%)" }}>
              {name}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
