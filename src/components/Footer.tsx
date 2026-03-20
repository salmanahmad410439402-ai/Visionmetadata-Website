const Footer = () => {
  return (
    <footer className="border-t py-10 px-6" style={{ borderColor: "hsl(220 30% 14%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

          <p className="text-sm font-black tracking-tight text-foreground">
            Vision<span className="text-primary">Metadata</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "hsl(190 95% 50% / 0.12)", color: "hsl(190 95% 65%)", border: "1px solid hsl(190 95% 50% / 0.2)" }}>
              PRO
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-5 text-xs" style={{ color: "hsl(215 20% 50%)" }}>
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing",  href: "#pricing"  },
              { label: "Download", href: "#download" },
              { label: "FAQ",      href: "#faq"      },
              { label: "Contact",  href: "#contact"  },
            ].map(({ label, href }) => (
              <a key={href} href={href}
                className="transition-colors duration-200 hover:text-primary">
                {label}
              </a>
            ))}
          </div>

          <p className="text-xs" style={{ color: "hsl(215 20% 40%)" }}>
            © {new Date().getFullYear()} VisionMetadata Pro · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
