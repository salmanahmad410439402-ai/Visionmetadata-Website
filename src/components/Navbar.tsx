import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Download, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme.tsx";
import { analytics } from "@/lib/analytics";

const navLinks = [
  { label: "Features", to: "/features" },
  { label: "Pricing",  to: "/pricing"  },
  { label: "Download", to: "/download" },
  { label: "Tutorials", to: "/tutorials" },
  { label: "FAQ",      to: "/faq"      },
  { label: "Contact",  to: "/contact"  },
];

const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme }      = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-lg shadow-primary/5"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="text-xl font-black tracking-tight text-foreground select-none">
          Vision<span className="text-primary">Metadata</span>
          <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">PRO</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to}
              className="text-sm font-medium transition-colors duration-200 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1"
              style={({ isActive }) => ({ color: isActive ? "hsl(190 95% 60%)" : "hsl(215 20% 65%)" })}>
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </NavLink>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              analytics.trackFeatureUsage('theme-toggle', { newTheme: theme === 'dark' ? 'light' : 'dark' });
            }}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Current: ${theme} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Download CTA */}
          <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.2.0/VisionMetadata.Pro_1.2.0.zip" target="_blank" rel="noopener noreferrer"
            onClick={() => analytics.trackCTAClick('download', 'navbar')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 hover:scale-[1.03] transition-all duration-200 shadow-[0_0_16px_hsl(190_95%_50%/0.25)]">
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground p-1" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

        {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 pb-4 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className="block py-3 px-2 text-sm font-medium transition-colors rounded hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={({ isActive }) => ({ color: isActive ? "hsl(190 95% 60%)" : "hsl(215 20% 65%)" })}>
              {link.label}
            </NavLink>
          ))}
          
          {/* Mobile Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                analytics.trackFeatureUsage('theme-toggle', { newTheme: theme === 'dark' ? 'light' : 'dark' });
              }}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Current: ${theme} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Download CTA */}
            <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.2.0/VisionMetadata.Pro_1.2.0.zip" target="_blank" rel="noopener noreferrer"
              onClick={() => analytics.trackCTAClick('download', 'navbar-mobile')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
