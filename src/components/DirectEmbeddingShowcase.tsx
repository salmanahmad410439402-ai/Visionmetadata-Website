import { Sparkles, FileCode2, Video, CheckCircle2, Zap, ArrowRight, Download, ShieldCheck, Layers, FileSpreadsheet, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { Link } from "react-router-dom";

export const DirectEmbeddingShowcase = () => {
  const ref = useReveal();

  const comparisonRows = [
    {
      feature: "AI Title, Description & 50 Keywords",
      web: "Instant Online",
      desktop: "Blazing Fast Multi-Core",
      highlight: false,
    },
    {
      feature: "Multi-AI (Gemini, ChatGPT, Groq, Mistral)",
      web: "Yes (BYOK Free)",
      desktop: "Yes + Smart Auto-Rotation",
      highlight: false,
    },
    {
      feature: "Trademark & Brand Protection Sniffer",
      web: "Included",
      desktop: "Included",
      highlight: false,
    },
    {
      feature: "JPEG, PNG & WebP File Embedding",
      web: "Browser Native",
      desktop: "Tagyfy Native Binary Engine",
      highlight: false,
    },
    {
      feature: "Direct .AI & .EPS Vector Embedding",
      web: "Supported via CSV",
      desktop: "⚡ Direct Native In-File Embedding",
      highlight: true,
    },
    {
      feature: "Direct .MP4 & .MOV Video Embedding",
      web: "Supported via CSV",
      desktop: "⚡ Direct Native Video Engine",
      highlight: true,
    },
    {
      feature: "Stock Marketplace Auto-Populate (No CSV Needed)",
      web: "Available for Images",
      desktop: "🔥 100% Automatic for ALL File Types",
      highlight: true,
    },
    {
      feature: "Batch Size & Processing Scale",
      web: "Browser Queue",
      desktop: "500+ Assets in Parallel",
      highlight: false,
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-24 px-6 relative overflow-hidden bg-background">
      {/* Background glow ornaments */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3.5 h-3.5" />
            The Game-Changing Advantage
          </div>
          
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Direct <span className="text-gradient-flow">Vector & Video</span> Metadata Embedding
          </h2>
          
          <p className="reveal reveal-delay-2 text-base sm:text-lg text-secondary leading-relaxed font-medium">
            Forget about tedious CSV spreadsheets. Tagyfy Pro writes IPTC, XMP, and Dublin Core metadata <strong className="text-foreground">directly into the binary code</strong> of your <span className="font-semibold text-primary">.AI, .EPS, .SVG, .MP4, and .MOV</span> files.
          </p>
        </div>

        {/* 3 Core Advantage Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          
          {/* Card 1: Vector Files */}
          <div className="reveal reveal-delay-1 glass-panel rounded-3xl p-7 flex flex-col justify-between border border-border/80 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_35px_hsl(var(--primary)/0.2)]">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-inner">
                <FileCode2 className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-foreground">Vector Formats</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">.AI · .EPS · .SVG</span>
              </div>
              <p className="text-sm text-secondary leading-relaxed font-medium mb-4">
                Native XMP & Dublin Core packet injection for Adobe Illustrator and EPS vector files. Adobe Stock and Freepik review engines read title and tags instantly on upload.
              </p>
            </div>
            <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-semibold text-primary">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Zero manual copy-pasting required</span>
            </div>
          </div>

          {/* Card 2: Video Files */}
          <div className="reveal reveal-delay-2 glass-panel rounded-3xl p-7 flex flex-col justify-between border border-border/80 hover:border-emerald-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                <Video className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-foreground">Video Footage</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">.MP4 · .MOV · .WebM</span>
              </div>
              <p className="text-sm text-secondary leading-relaxed font-medium mb-4">
                High-performance proprietary video metadata encoding engine. Embeds rich titles, descriptions, and 50 ranked tags directly into video atom containers.
              </p>
            </div>
            <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Full video scene & object understanding</span>
            </div>
          </div>

          {/* Card 3: Zero CSV Workflow */}
          <div className="reveal reveal-delay-3 glass-panel rounded-3xl p-7 flex flex-col justify-between border border-border/80 hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(168,85,247,0.2)]">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all shadow-inner">
                <Globe className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-foreground">Auto-Populate Everywhere</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">No CSV Needed</span>
              </div>
              <p className="text-sm text-secondary leading-relaxed font-medium mb-4">
                Drag and drop your exported files onto Adobe Stock, Shutterstock, Freepik, or Vecteezy. Watch titles and keywords populate automatically in 1 second.
              </p>
            </div>
            <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-semibold text-purple-400">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Saves 10+ hours every week</span>
            </div>
          </div>

        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="reveal glass-panel rounded-3xl p-6 sm:p-10 border border-border/80 shadow-2xl overflow-hidden mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              Choose the Power That Fits Your Workflow
            </h3>
            <p className="text-sm text-muted-foreground">
              Use our 100% Free Online Web Tool right now, or download the Desktop Software for heavy batch native embedding.
            </p>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Feature / Capability</th>
                  <th className="py-3 px-4 text-center">🌐 Free Online Web Tool</th>
                  <th className="py-3 px-4 text-center text-primary font-black bg-primary/5 rounded-t-xl">⚡ Tagyfy Pro Desktop App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className={row.highlight ? "bg-primary/5 font-semibold" : "hover:bg-muted/20"}>
                    <td className="py-3.5 px-4 text-foreground flex items-center gap-2">
                      {row.highlight && <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />}
                      <span>{row.feature}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-muted-foreground">
                      {row.web}
                    </td>
                    <td className={`py-3.5 px-4 text-center ${row.highlight ? "text-primary font-bold" : "text-foreground font-medium"}`}>
                      {row.desktop}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Row below table */}
          <div className="mt-8 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/tool" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-sm sm:text-base font-bold rounded-2xl bg-gradient-flow text-white shadow-[0_0_30px_hsl(var(--primary)/0.35)] hover:scale-[1.02] transition-all border-0">
                <Sparkles className="w-4 h-4 mr-2" />
                Launch Free Online Web Tool
              </Button>
            </Link>

            <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.3.6/Tagyfy_Pro_1.3.6_x64-setup.exe" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-sm sm:text-base font-bold rounded-2xl border-primary/30 hover:bg-primary/10 hover:scale-[1.02] transition-all glass-panel text-foreground">
                <Download className="w-4 h-4 mr-2 text-primary" />
                Download Windows App (159MB)
              </Button>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
