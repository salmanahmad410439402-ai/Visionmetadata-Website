import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ChevronDown, Compass, Download, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme.tsx";
import { analytics } from "@/lib/analytics";
import {
  CONTRIBUTOR_TOOLS,
  CONTRIBUTOR_TOOLS_STORAGE_KEY,
  openToolsGuideModal,
} from "@/data/contributorTools";
import { ToolIcon, ToolStatusBadge } from "@/components/ToolsDiscoveryModal";

const siteLinks = [
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Extension", to: "/chrome-extension" },
  { label: "Blog", to: "/blogs" },
  { label: "Tutorials", to: "/tutorials" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const isOnToolRoute = CONTRIBUTOR_TOOLS.some((t) => t.to === location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track unread status of What's New / Tools Guide
  useEffect(() => {
    const syncSeen = () => {
      try {
        setHasSeenGuide(Boolean(localStorage.getItem(CONTRIBUTOR_TOOLS_STORAGE_KEY)));
      } catch {
        setHasSeenGuide(true);
      }
    };
    syncSeen();
    window.addEventListener("tagyfy:tools-guide-seen", syncSeen);
    return () => window.removeEventListener("tagyfy:tools-guide-seen", syncSeen);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setToolsMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close desktop dropdown on outside click or Escape
  useEffect(() => {
    if (!toolsMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setToolsMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [toolsMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-panel rounded-b-3xl mx-2 mt-2 sm:mx-6 sm:mt-4 shadow-2xl shadow-primary/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-black tracking-tight text-foreground select-none shrink-0"
        >
          Tagyfy<span className="text-primary"> Pro</span>
          <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">
            AI
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          {/* Free Tools Descriptive Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setToolsMenuOpen(true)}
            onMouseLeave={() => setToolsMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setToolsMenuOpen((v) => !v)}
              aria-expanded={toolsMenuOpen}
              className="inline-flex items-center gap-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg px-2.5 py-1.5 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                color: isOnToolRoute ? "hsl(var(--primary))" : "hsl(var(--foreground))",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Free Tools
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-black">
                4
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  toolsMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {toolsMenuOpen && (
              <div className="absolute left-0 top-full pt-2 w-[380px] z-50">
                <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-3 space-y-1.5">
                  <div className="px-2.5 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Free Browser Utilities (No Account Needed)
                    </span>
                  </div>

                  {CONTRIBUTOR_TOOLS.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.to}
                      onClick={() => setToolsMenuOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-primary/10 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <ToolIcon id={tool.id} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {tool.shortName}
                          </span>
                          <ToolStatusBadge badge={tool.badge} />
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {tool.tagline}
                        </p>
                      </div>
                    </Link>
                  ))}

                  <div className="pt-1.5 mt-1 border-t border-border/70">
                    <button
                      type="button"
                      onClick={() => {
                        setToolsMenuOpen(false);
                        openToolsGuideModal("all");
                      }}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        Which tool should I use? (Quick Guide)
                      </span>
                      <span>Open →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {siteLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-xs xl:text-sm font-medium whitespace-nowrap transition-colors duration-200 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1.5 py-1"
              style={({ isActive }) => ({
                color: isActive ? "hsl(var(--primary))" : "var(--text-tertiary)",
              })}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </NavLink>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {/* What's New / Tool Matcher Modal Trigger */}
          <button
            type="button"
            onClick={() => openToolsGuideModal("all")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="See new tools and find out which tool fits your workflow"
          >
            {!hasSeenGuide && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <Compass className="w-3.5 h-3.5" />
            Tool Guide
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              analytics.trackFeatureUsage("theme-toggle", {
                newTheme: theme === "dark" ? "light" : "dark",
              });
            }}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Current: ${theme} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Download CTA */}
          <Link
            to="/download"
            onClick={() => analytics.trackCTAClick("download", "navbar")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 hover:scale-[1.03] transition-all duration-200 shadow-[0_0_16px_hsl(243_75%_59%/0.25)]"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Link>
        </div>

        {/* Mobile Actions + Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => openToolsGuideModal("all")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold"
          >
            {!hasSeenGuide && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <Compass className="w-3.5 h-3.5" />
            Tools
          </button>

          <button
            className="text-foreground p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-panel rounded-2xl mx-2 mt-2 p-5 max-h-[82vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl space-y-4">
          {/* Quick Tool Guide Banner */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              openToolsGuideModal("all");
            }}
            className="w-full rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-primary"
          >
            <span className="inline-flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              What&apos;s New: Which Free Tool Do You Need?
            </span>
            <span>View →</span>
          </button>

          {/* 4 Free Browser Tools */}
          <div className="space-y-1.5">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Free Browser Tools
            </span>
            {CONTRIBUTOR_TOOLS.map((tool) => (
              <NavLink
                key={tool.to}
                to={tool.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-start justify-between gap-2 py-2.5 px-2.5 rounded-xl hover:bg-primary/8 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <ToolIcon id={tool.id} className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{tool.shortName}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {tool.tagline}
                    </p>
                  </div>
                </div>
                <ToolStatusBadge badge={tool.badge} />
              </NavLink>
            ))}
          </div>

          {/* Site Pages */}
          <div className="border-t border-border/70 pt-2">
            {siteLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-2 text-sm font-medium transition-colors rounded hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={({ isActive }) => ({
                  color: isActive ? "hsl(var(--primary))" : "var(--text-tertiary)",
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <button
              onClick={() => {
                toggleTheme();
                analytics.trackFeatureUsage("theme-toggle", {
                  newTheme: theme === "dark" ? "light" : "dark",
                });
              }}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Current: ${theme} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            <Link
              to="/download"
              onClick={() => {
                setMobileOpen(false);
                analytics.trackCTAClick("download", "navbar-mobile");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="w-4 h-4" /> Download
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
