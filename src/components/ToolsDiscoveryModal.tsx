import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Chrome,
  Compass,
  HelpCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasDecidedConsent } from "@/lib/consent";
import {
  CONTRIBUTOR_TOOLS,
  CONTRIBUTOR_TOOLS_STORAGE_KEY,
  OPEN_TOOLS_GUIDE_EVENT,
  type ContributorToolId,
  type ContributorToolSpec,
} from "@/data/contributorTools";

export function ToolIcon({
  id,
  className = "w-5 h-5",
}: {
  id: ContributorToolId;
  className?: string;
}) {
  switch (id) {
    case "event-calendar":
      return <CalendarIcon className={className} />;
    case "ai-generator":
      return <Sparkles className={className} />;
    case "metadata-checker":
      return <ShieldCheck className={className} />;
    case "csv-converter":
      return <FileSpreadsheet className={className} />;
  }
}

export function ToolStatusBadge({ badge }: { badge: ContributorToolSpec["badge"] }) {
  if (badge === "NEW") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/35 hover:bg-emerald-500/20 text-[10px] font-black px-2 py-0">
        NEW
      </Badge>
    );
  }
  if (badge === "UPDATED") {
    return (
      <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/35 hover:bg-amber-500/20 text-[10px] font-black px-2 py-0">
        UPDATED
      </Badge>
    );
  }
  return (
    <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 text-[10px] font-black px-2 py-0">
      POPULAR
    </Badge>
  );
}

const ACCENT_ICON_CLASSES: Record<ContributorToolSpec["accentColor"], string> = {
  emerald: "bg-emerald-500/12 text-emerald-500 border-emerald-500/25",
  primary: "bg-primary/12 text-primary border-primary/25",
  amber: "bg-amber-500/12 text-amber-500 border-amber-500/25",
  sky: "bg-sky-500/12 text-sky-500 border-sky-500/25",
};

const ToolsDiscoveryModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<ContributorToolId | "all">("all");

  const markSeen = () => {
    try {
      localStorage.setItem(CONTRIBUTOR_TOOLS_STORAGE_KEY, "1");
      window.dispatchEvent(new Event("tagyfy:tools-guide-seen"));
    } catch {
      // ignore restricted storage environments
    }
  };

  // Show a non-blocking corner announcement once on "/" after cookie consent is decided
  useEffect(() => {
    if (location.pathname !== "/") {
      setNudgeVisible(false);
      return;
    }

    const maybeShowNudge = () => {
      let seen = false;
      try {
        seen = Boolean(localStorage.getItem(CONTRIBUTOR_TOOLS_STORAGE_KEY));
      } catch {
        seen = false;
      }
      if (!seen && hasDecidedConsent()) {
        setNudgeVisible(true);
      }
    };

    const timer = window.setTimeout(maybeShowNudge, 700);
    window.addEventListener("tagyfy:consent", maybeShowNudge);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("tagyfy:consent", maybeShowNudge);
    };
  }, [location.pathname]);

  // Listen for manual "Open Tools Guide" clicks from Navbar / Homepage / anywhere
  useEffect(() => {
    const onOpenGuide = (ev: Event) => {
      const custom = ev as CustomEvent<{ toolId?: ContributorToolId | "all" }>;
      setSelectedGoal(custom.detail?.toolId ?? "all");
      setNudgeVisible(false);
      setOpen(true);
      markSeen();
    };
    window.addEventListener(OPEN_TOOLS_GUIDE_EVENT, onOpenGuide);
    return () => window.removeEventListener(OPEN_TOOLS_GUIDE_EVENT, onOpenGuide);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      markSeen();
    }
  };

  const handleDismissNudge = () => {
    setNudgeVisible(false);
    markSeen();
  };

  const handleLaunchTool = (to: string) => {
    markSeen();
    setNudgeVisible(false);
    setOpen(false);
    navigate(to);
  };

  const displayedTools =
    selectedGoal === "all"
      ? CONTRIBUTOR_TOOLS
      : CONTRIBUTOR_TOOLS.filter((t) => t.id === selectedGoal);

  return (
    <>
      {nudgeVisible && !open && (
        <aside
          aria-label="New contributor tools announcement"
          className="fixed bottom-4 right-4 z-40 max-w-sm rounded-2xl border border-primary/35 bg-card/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                <Sparkles className="w-3.5 h-3.5" />
                What&apos;s New · 4 Free Browser Tools
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Event Calendar, CSV Verifier, 6-Agency CSV Converter &amp; AI Generator — see which tool fits your
                stock workflow.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setNudgeVisible(false);
                    setSelectedGoal("all");
                    setOpen(true);
                    markSeen();
                  }}
                  className="h-8 rounded-xl text-xs font-bold gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Open Tool Guide
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissNudge}
                  className="h-8 rounded-xl text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissNudge}
              aria-label="Dismiss announcement"
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            What&apos;s New · Free Contributor Browser Toolkit
          </div>
          <DialogTitle className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
            4 Free Stock Tools — Which One Do You Need?
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We added new browser utilities for stock photo, vector, and video contributors. Every tool runs free in your
            browser with no login required — pick your goal below or explore the full 4-step workflow.
          </DialogDescription>
        </DialogHeader>

        {/* Interactive "What do you want to do?" Goal Matcher */}
        <div className="space-y-2 pt-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            Quick Matcher — What do you want to do right now?
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedGoal("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGoal === "all"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              Show All 4 Tools
            </button>
            {CONTRIBUTOR_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedGoal(tool.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedGoal === tool.id
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <ToolIcon id={tool.id} className="w-3.5 h-3.5" />
                {tool.goalQuestion}
              </button>
            ))}
          </div>
        </div>

        {/* Tool Cards Grid */}
        <div
          className={`grid gap-3.5 pt-2 ${
            displayedTools.length === 1 ? "grid-cols-1" : "md:grid-cols-2"
          }`}
        >
          {displayedTools.map((tool) => {
            const isCurrentRoute = location.pathname === tool.to;
            return (
              <div
                key={tool.id}
                className="rounded-2xl border border-border/80 bg-background/70 p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-primary/45 transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                          ACCENT_ICON_CLASSES[tool.accentColor]
                        }`}
                      >
                        <ToolIcon id={tool.id} className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {tool.stepLabel}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-foreground leading-snug">
                          {tool.name}
                        </h3>
                      </div>
                    </div>
                    <ToolStatusBadge badge={tool.badge} />
                  </div>

                  {/* What It Does */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tool.whatItDoes}
                  </p>

                  {/* "Use This When" Box */}
                  <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-3 py-2 text-xs">
                    <span className="font-bold text-foreground">Best used when: </span>
                    <span className="text-secondary">{tool.useWhen}</span>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5">
                    {tool.highlights.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-secondary/60 text-foreground/85 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Row */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {tool.to}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={isCurrentRoute ? "outline" : "default"}
                    onClick={() => handleLaunchTool(tool.to)}
                    className="rounded-xl text-xs font-bold gap-1.5 h-8"
                  >
                    {isCurrentRoute ? "Currently Viewing" : tool.ctaLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful Tip + Chrome Extension Bonus + Close */}
        <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 text-muted-foreground">
            <Chrome className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong className="text-foreground">Also 100% Free:</strong> Tag files directly inside the Adobe Stock
              portal with our{" "}
              <Link
                to="/chrome-extension"
                onClick={() => handleOpenChange(false)}
                className="text-primary font-semibold underline"
              >
                Chrome Extension
              </Link>
              , or embed IPTC/XMP into `.eps` &amp; `.mp4` with the{" "}
              <Link
                to="/download"
                onClick={() => handleOpenChange(false)}
                className="text-primary font-semibold underline"
              >
                Windows App
              </Link>
              .
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl text-xs font-bold shrink-0"
          >
            Got It, Close Guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ToolsDiscoveryModal;
