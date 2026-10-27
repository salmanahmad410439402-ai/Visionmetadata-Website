import { Link } from "react-router-dom";
import { clearConsent } from "@/lib/consent";

const Footer = () => {
  return (
    <footer className="border-t py-12 px-6 border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left space-y-2">
            <p className="text-base font-black tracking-tight text-foreground">
              Tagyfy<span className="text-primary"> Pro</span>
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/12 text-primary border border-primary/20">
                v1.3.6
              </span>
            </p>
            <p className="text-xs text-tertiary max-w-xs">
              AI-assisted metadata generator, compliance validator &amp; batch embedder for stock media contributors.
            </p>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-7 gap-y-3 text-xs text-secondary font-medium">
            <Link to="/tool" className="hover:text-primary transition-colors">Free Web Tool</Link>
            <Link to="/metadata-checker" className="hover:text-primary transition-colors">Metadata Checker</Link>
            <Link to="/stock-csv-converter" className="hover:text-primary transition-colors">CSV Converter</Link>
            <Link to="/event-calendar" className="hover:text-primary transition-colors">Event Calendar</Link>
            <Link to="/metadata-limits" className="hover:text-primary transition-colors">Metadata Limits</Link>
            <Link to="/blogs" className="hover:text-primary transition-colors">Blog</Link>
            <Link to="/tutorials" className="hover:text-primary transition-colors">Tutorials</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/download" className="hover:text-primary transition-colors">Download</Link>
            <Link to="/chrome-extension" className="hover:text-primary transition-colors">Extension</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors font-semibold text-foreground/80">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors font-semibold text-foreground/80">Terms</Link>
            <Link to="/refund-policy" className="hover:text-primary transition-colors font-semibold text-foreground/80">Refunds</Link>
            <Link to="/editorial-policy" className="hover:text-primary transition-colors font-semibold text-foreground/80">Editorial Standards</Link>
          </div>
        </div>

        {/* Non-affiliation & Trademark Disclaimer */}
        <p className="text-[11px] leading-relaxed text-muted-foreground/80 border-t border-border/50 pt-6">
          Tagyfy Pro is an independent software project developed by Salman Ahmad and is not affiliated with, endorsed by, or sponsored by Adobe Inc., Shutterstock, Inc., Freepik Company, Vecteezy, Dreamstime, or 123RF. Adobe Stock, Shutterstock, Freepik, Vecteezy, Dreamstime, 123RF, Google Gemini, OpenAI, Groq, and Mistral AI are trademarks or registered trademarks of their respective owners.
        </p>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-minimal-low gap-3">
          <p>© {new Date().getFullYear()} Tagyfy Pro · Operated by Salman Ahmad · All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-[11px]">Independent workflow tools &amp; guides for stock contributors</p>
            <button
              type="button"
              onClick={clearConsent}
              className="text-[11px] underline hover:text-primary transition-colors"
            >
              Cookie settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
