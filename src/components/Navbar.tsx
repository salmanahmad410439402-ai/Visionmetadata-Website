import { useState, useEffect } from "react";
import { Download } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
  { label: "Download", href: "#download" },
  { label: "FAQ",      href: "#faq"      },
  { label: "Contact",  href: "#contact"  },
];

const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <a key={link.href} href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "hsl(215 20% 65%)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "hsl(190 95% 60%)")}
              onMouseLeave={e => (e.currentTarget.style.color = "hsl(215 20% 65%)")}>
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/latest/download/VisionMetadata-Pro-Setup.exe"
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 hover:scale-[1.03] transition-all duration-200 shadow-[0_0_16px_hsl(190_95%_50%/0.25)]">
          <Download className="w-3.5 h-3.5" />
          Download
        </a>

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
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 pb-5 pt-2">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm font-medium transition-colors"
              style={{ color: "hsl(215 20% 65%)" }}>
              {link.label}
            </a>
          ))}
          <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/latest/download/VisionMetadata-Pro-Setup.exe"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            <Download className="w-4 h-4" /> Download
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
