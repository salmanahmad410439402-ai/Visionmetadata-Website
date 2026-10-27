import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CONTRIBUTOR_TOOLS,
  openToolsGuideModal,
  type ContributorToolSpec,
} from "@/data/contributorTools";
import { ToolIcon, ToolStatusBadge } from "@/components/ToolsDiscoveryModal";

const ACCENT_BOX_CLASSES: Record<ContributorToolSpec["accentColor"], string> = {
  emerald:
    "bg-emerald-500/12 text-emerald-500 border-emerald-500/25 group-hover:border-emerald-500/50",
  primary:
    "bg-primary/12 text-primary border-primary/25 group-hover:border-primary/50",
  amber:
    "bg-amber-500/12 text-amber-500 border-amber-500/25 group-hover:border-amber-500/50",
  sky: "bg-sky-500/12 text-sky-500 border-sky-500/25 group-hover:border-sky-500/50",
};

const ContributorToolkitSection = () => {
  return (
    <section
      id="free-browser-toolkit"
      className="py-16 sm:py-20 px-6 border-b border-border/60 bg-gradient-to-b from-background via-primary/[0.03] to-background"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              New &amp; Updated · 100% Free Browser Toolkit
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
              4 Free Stock Tools —{" "}
              <span className="text-gradient-flow">Which One Do You Need?</span>
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every browser tool below runs directly in your browser with zero account required. Use a single utility on
              its own, or follow the complete 4-step stock contributor workflow from seasonal research to 6-agency CSV
              uploads.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => openToolsGuideModal("all")}
            className="rounded-2xl font-bold text-xs sm:text-sm gap-2 h-11 px-5 shrink-0 border-primary/30 hover:bg-primary/10"
          >
            <Compass className="w-4 h-4 text-primary" />
            Compare Tools Interactive Guide
          </Button>
        </div>

        {/* 4-Tool Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {CONTRIBUTOR_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="group glass-panel rounded-3xl p-6 border border-border/80 hover:border-primary/45 transition-all duration-300 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors shrink-0 ${
                        ACCENT_BOX_CLASSES[tool.accentColor]
                      }`}
                    >
                      <ToolIcon id={tool.id} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {tool.stepLabel}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                  <ToolStatusBadge badge={tool.badge} />
                </div>

                <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                  {tool.whatItDoes}
                </p>

                <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] px-3.5 py-2.5 text-xs leading-relaxed">
                  <strong className="text-foreground">Use this when: </strong>
                  <span className="text-muted-foreground">{tool.useWhen}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {tool.highlights.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-background/80 border border-border/70 text-foreground/85 font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <span className="text-xs text-muted-foreground font-medium">
                  Free · Runs in browser
                </span>
                <Link
                  to={tool.to}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline"
                >
                  {tool.ctaLabel}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContributorToolkitSection;
