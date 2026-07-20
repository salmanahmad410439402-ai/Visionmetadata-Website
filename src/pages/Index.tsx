import { Link, useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import { ArrowRight, Zap, DollarSign, HelpCircle, Mail, Download, Chrome } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { useEffect } from "react";
import { toast } from "sonner";

const Index = () => {
  const ref = useReveal();
  const navigate = useNavigate();

  useEffect(() => {
    // Show a beautiful toast notification for the new release once per session
    const hasSeenToast = sessionStorage.getItem("hasSeenExtensionToast");
    
    if (!hasSeenToast) {
      const timer = setTimeout(() => {
        toast("🚀 New Update Released!", {
          description: "Our highly anticipated Adobe Stock Chrome Extension is now live. Get it for free with our limited BOGO offer!",
          action: {
            label: "View Offer",
            onClick: () => navigate("/chrome-extension"),
          },
          duration: 10000,
          position: "top-center",
        });
        sessionStorage.setItem("hasSeenExtensionToast", "true");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />

        {/* Chrome Extension Banner */}
        <section className="py-12 px-6 border-b border-border bg-primary/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 mb-4 bg-primary/10 text-primary">
                <Chrome className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">New Release</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Adobe Stock Chrome Extension</h2>
              <p className="text-muted-foreground max-w-xl">
                Update approved assets and generate new metadata directly in your browser using Gemini, ChatGPT, Groq, and Mistral.
              </p>
            </div>
            <Link to="/chrome-extension" className="shrink-0">
              <button className="h-12 px-8 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:scale-[1.02] transition-all shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                Explore Extension
              </button>
            </Link>
          </div>
        </section>

        {/* Teaser CTA cards to other pages */}
        <section ref={ref as React.RefObject<HTMLElement>} className="py-24 px-6 bg-background/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="reveal text-3xl sm:text-4xl font-black text-foreground mb-4">
                Explore <span className="text-gradient-flow">VisionMetadata Pro</span>
              </h2>
              <p className="reveal reveal-delay-1 max-w-2xl mx-auto text-muted-foreground">
                Learn more about features, pricing, and how it works.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {/* Features */}
              <Link to="/features" className="reveal reveal-delay-2 group glass-panel rounded-2xl p-6 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Features</h3>
                <p className="text-sm text-muted-foreground">
                  Discover all capabilities — AI modes, batch processing, and platform exports.
                </p>
              </Link>

              {/* Pricing */}
              <Link to="/pricing" className="reveal reveal-delay-3 group glass-panel rounded-2xl p-6 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Simple pricing plans. No hidden fees. Get your license today.
                </p>
              </Link>

              {/* Download */}
              <Link to="/download" className="reveal reveal-delay-3 group glass-panel rounded-2xl p-6 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Download</h3>
                <p className="text-sm text-muted-foreground">
                  Get started free. Works with free AI keys. Windows 10 / 11.
                </p>
              </Link>

              {/* Contact & FAQ */}
              <div className="reveal reveal-delay-4 group glass-panel rounded-2xl p-6 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                <div className="space-y-4">
                  <Link to="/contact" className="flex items-center justify-between group/link">
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/link:text-primary transition-colors">Contact</h4>
                      <p className="text-xs mt-1 text-muted-foreground">Get support & licensing</p>
                    </div>
                    <Mail className="w-5 h-5 text-primary/60" />
                  </Link>
                  <div className="border-t border-border" />
                  <Link to="/faq" className="flex items-center justify-between group/link">
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover/link:text-primary transition-colors">FAQ</h4>
                      <p className="text-xs mt-1 text-muted-foreground">Common questions answered</p>
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
