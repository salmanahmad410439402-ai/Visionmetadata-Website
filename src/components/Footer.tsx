import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-10 px-6 border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

          <p className="text-sm font-black tracking-tight text-foreground">
            Vision<span className="text-primary">Metadata</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/12 text-primary border border-primary/20">
              PRO
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-5 text-xs text-minimal">
            {[
              { label: "Features", to: "/features" },
              { label: "Pricing",  to: "/pricing"  },
              { label: "Download", to: "/download" },
              { label: "Extension", to: "/chrome-extension" },
              { label: "FAQ",      to: "/faq"      },
              { label: "Contact",  to: "/contact"  },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="transition-colors duration-200 hover:text-primary">
                {label}
              </Link>
            ))}
          </div>

          <p className="text-xs text-minimal-low">
            © {new Date().getFullYear()} VisionMetadata Pro · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
