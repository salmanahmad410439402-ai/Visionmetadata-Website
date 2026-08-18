import { Download, Shield, Zap, Cpu, Globe, Check, Clock, Star, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";

const HeroSection = () => {
  const ref = useReveal();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden"
    >
      {/* ─── MODERN ANIMATED GLOW BACKGROUND ─── */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-60 orb-1 pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[100px] opacity-50 orb-2 pointer-events-none mix-blend-screen" />
      
      <div className="max-w-5xl mx-auto relative z-10 w-full flex flex-col items-center text-center">

        {/* Badge */}
        <div className="reveal relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-primary text-xs font-bold tracking-wide uppercase mb-8 border-primary/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          VisionMetadata Pro — v1.3.6 Now Available
        </div>

        {/* Headline */}
        <h1 className="reveal reveal-delay-1 text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-foreground mb-8 leading-[1.05]">
          <span className="block opacity-90">Supercharge your</span>
          <span className="text-gradient-flow">Adobe Stock</span> workflow
        </h1>

        <p className="reveal reveal-delay-2 text-lg md:text-xl lg:text-2xl text-secondary leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
          Generate, optimize, and embed titles, descriptions, and keywords directly into your images, videos, and vector files — in bulk, in seconds.
        </p>

        {/* CTA */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center gap-4 justify-center mb-8">
          <a href="/tool">
            <Button size="lg" className="w-full sm:w-auto h-16 px-8 text-base font-bold rounded-2xl btn-shimmer bg-gradient-flow text-white shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] hover:scale-[1.02] transition-all duration-300 border-0">
              <Sparkles className="w-5 h-5 mr-2" />
              Try Free Online Tool
            </Button>
          </a>
          <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.3.6/Tagyfy_Pro_1.3.6_x64-setup.exe" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-8 text-base font-bold rounded-2xl border-white/10 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] glass-panel text-foreground">
              <Download className="w-5 h-5 mr-2" />
              Download for Windows
            </Button>
          </a>
          <a href="/pricing">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto h-16 px-6 text-sm font-semibold rounded-2xl text-muted-foreground hover:text-foreground">
              Pricing
            </Button>
          </a>
        </div>

        {/* Friction removers */}
        <div className="reveal reveal-delay-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mb-12">
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary" />
            No credit card needed
          </span>
          <span className="text-xs text-muted-foreground/30">·</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Works with free AI keys
          </span>
          <span className="text-xs text-muted-foreground/30">·</span>
          <span className="text-xs font-semibold text-muted-foreground">
            Windows 10 / 11
          </span>
        </div>

        {/* AI mode pills */}
        <div className="reveal reveal-delay-4 flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: Globe, label: "Cloud AI — Gemini, GPT-4o, Groq, Mistral" },
            { icon: Cpu,   label: "Smart API Rotation System" },
            { icon: Zap,   label: "Auto-Fallback Mode" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary">
              <Icon className="w-3 h-3" />
              {label}
            </div>
          ))}
        </div>

        {/* BOGO Banner */}
        <div className="reveal reveal-delay-5 mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-5 glass-panel rounded-3xl p-5 sm:px-8 max-w-xl mx-auto transform hover:scale-[1.02] transition-transform cursor-default relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm z-10">
            Only 50 Spots Left!
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-inner z-10 relative mt-2 sm:mt-0">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center sm:text-left mt-2 sm:mt-0 z-10 relative">
            <p className="text-base font-black text-foreground tracking-tight">Buy One, Get One FREE!</p>
            <p className="text-sm text-secondary mt-1 leading-relaxed">Purchase the software today and get the Adobe Stock Chrome Extension completely free.</p>
            <p className="text-xs font-bold text-primary mt-2 flex items-center justify-center sm:justify-start gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Limited Time Offer — First 50 lucky users only!
            </p>
          </div>
        </div>

        {/* Social proof strip */}
        <div className="reveal reveal-delay-6 mt-14 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current text-primary" />
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Trusted by 200+ Stock Contributors Worldwide
          </p>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;


