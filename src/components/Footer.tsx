import { Link } from "react-router-dom";

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
              AI-Powered metadata generator & batch embedder for stock media contributors.
            </p>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-3 text-xs text-secondary font-medium">
            <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/download" className="hover:text-primary transition-colors">Download</Link>
            <Link to="/blogs" className="hover:text-primary transition-colors">Blog</Link>
            <Link to="/tutorials" className="hover:text-primary transition-colors">Tutorials</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors font-semibold text-foreground/80">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors font-semibold text-foreground/80">Terms</Link>
            <Link to="/refund-policy" className="hover:text-primary transition-colors font-semibold text-foreground/80">Refunds</Link>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-minimal-low gap-3">
          <p>© {new Date().getFullYear()} Tagyfy Pro · All rights reserved.</p>
          <p className="text-[11px]">Built for Adobe Stock, Shutterstock, Freepik & Vecteezy Contributors</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
