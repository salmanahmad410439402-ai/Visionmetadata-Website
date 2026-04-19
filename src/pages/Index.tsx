import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import { ArrowRight, Zap, DollarSign, HelpCircle, Mail, Download } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const Index = () => {
  const ref = useReveal();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />

        {/* Teaser CTA cards to other pages */}
        <section ref={ref as React.RefObject<HTMLElement>} className="py-24 px-6 bg-background/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="reveal text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Explore VisionMetadata Pro
              </h2>
              <p className="reveal reveal-delay-1 max-w-2xl mx-auto" style={{ color: "hsl(215 20% 65%)" }}>
                Learn more about features, pricing, and how it works.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {/* Features */}
              <Link to="/features" className="reveal reveal-delay-2 group rounded-xl border p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                  <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Features</h3>
                <p className="text-sm" style={{ color: "hsl(215 20% 60%)" }}>
                  Discover all capabilities — AI modes, batch processing, and platform exports.
                </p>
              </Link>

              {/* Pricing */}
              <Link to="/pricing" className="reveal reveal-delay-3 group rounded-xl border p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Pricing</h3>
                <p className="text-sm" style={{ color: "hsl(215 20% 60%)" }}>
                  Simple pricing plans. No hidden fees. Get your license today.
                </p>
              </Link>

              {/* Download */}
              <Link to="/download" className="reveal reveal-delay-3 group rounded-xl border p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <Download className="w-6 h-6 text-primary" />
                  <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Download</h3>
                <p className="text-sm" style={{ color: "hsl(215 20% 60%)" }}>
                  Get started free. Works with free AI keys. Windows 10 / 11.
                </p>
              </Link>

              {/* Contact & FAQ */}
              <div className="reveal reveal-delay-4 group rounded-xl border p-6 transition-all duration-300"
                style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
                <div className="space-y-4">
                  <Link to="/contact" className="flex items-center justify-between group/link">
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/link:text-primary transition-colors">Contact</h4>
                      <p className="text-xs mt-1" style={{ color: "hsl(215 20% 55%)" }}>Get support & licensing</p>
                    </div>
                    <Mail className="w-5 h-5 text-primary/60" />
                  </Link>
                  <div className="border-t" style={{ borderColor: "hsl(220 30% 16%)" }} />
                  <Link to="/faq" className="flex items-center justify-between group/link">
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/link:text-primary transition-colors">FAQ</h4>
                      <p className="text-xs mt-1" style={{ color: "hsl(215 20% 55%)" }}>Common questions answered</p>
                    </div>
                    <HelpCircle className="w-5 h-5 text-primary/60" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
