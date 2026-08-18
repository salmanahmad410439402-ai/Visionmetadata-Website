import { Link, useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import { DirectEmbeddingShowcase } from "@/components/DirectEmbeddingShowcase";
import HowItWorks from "@/components/HowItWorks";
import WhyVisionMeta from "@/components/WhyVisionMeta";
import Testimonials from "@/components/Testimonials";
import FAQSection from "@/components/FAQSection";
import { ArrowRight, Zap, DollarSign, HelpCircle, Mail, Download, Chrome, Sparkles } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const ref = useReveal();
  const navigate = useNavigate();

  useEffect(() => {
    // Show a toast notification for the new extension release once per session
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
      <main className="space-y-0">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Key Stats Strip */}
        <StatsBar />

        {/* 3. Breakthrough Direct Vector & Video Embedding Showcase (Superpower of Desktop App + Web Tool) */}
        <DirectEmbeddingShowcase />

        {/* 4. How It Works (4-Step Workflow & Feature Grid) */}
        <HowItWorks />

        {/* 5. Before vs After Comparison */}
        <WhyVisionMeta />

        {/* 6. Chrome Extension Banner */}
        <section className="py-14 px-6 border-y border-border/80 bg-primary/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 mb-4 bg-primary/10 text-primary">
                <Chrome className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">BOGO Limited Offer</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Adobe Stock Chrome Extension</h2>
              <p className="text-muted-foreground max-w-xl">
                Update approved assets and generate fresh metadata directly inside the Adobe Stock contributor dashboard using Gemini, ChatGPT, Groq, and Mistral.
              </p>
            </div>
            <Link to="/chrome-extension" className="shrink-0">
              <Button size="lg" className="h-13 px-8 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:scale-[1.02] transition-all shadow-[0_0_25px_hsl(var(--primary)/0.4)]">
                Explore Extension & BOGO
              </Button>
            </Link>
          </div>
        </section>

        {/* 7. Real Contributor Testimonials */}
        <Testimonials />

        {/* 8. Frequently Asked Questions */}
        <FAQSection />

        {/* 9. Final High-Converting Dual Action Banner */}
        <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background border-t border-border/60">
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Get Started in 10 Seconds
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              Ready to automate your stock metadata?
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Start generating high-ranking metadata online for free right in your browser, or download the Windows Desktop app for 100% native vector & video embedding.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/tool" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl bg-gradient-flow text-white shadow-[0_0_35px_hsl(var(--primary)/0.4)] hover:scale-[1.02] transition-all border-0">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Free Web Tool Now
                </Button>
              </Link>

              <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.3.6/Tagyfy_Pro_1.3.6_x64-setup.exe" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl border-white/10 hover:bg-primary/5 transition-all hover:scale-[1.02] glass-panel text-foreground">
                  <Download className="w-4 h-4 mr-2 text-primary" />
                  Download for Windows
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* 10. Navigation Teaser Hub */}
        <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-6 bg-background/80 border-t border-border/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="reveal text-2xl font-bold text-foreground mb-2">
                Quick Navigation & Resources
              </h3>
              <p className="reveal reveal-delay-1 text-xs text-muted-foreground">
                Everything you need to maximize your stock portfolio revenue.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Features */}
              <Link to="/features" className="reveal reveal-delay-2 group glass-panel rounded-2xl p-5 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">All Features</h4>
                <p className="text-xs text-muted-foreground">
                  Explore batch modes, trademark filters & platform CSV tools.
                </p>
              </Link>

              {/* Pricing */}
              <Link to="/pricing" className="reveal reveal-delay-3 group glass-panel rounded-2xl p-5 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Pricing & License</h4>
                <p className="text-xs text-muted-foreground">
                  Transparent lifetime and monthly licenses with 0 hidden fees.
                </p>
              </Link>

              {/* Download */}
              <Link to="/download" className="reveal reveal-delay-3 group glass-panel rounded-2xl p-5 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Download App</h4>
                <p className="text-xs text-muted-foreground">
                  Windows 10 / 11 installer with free 3-day full-access trial.
                </p>
              </Link>

              {/* Contact & Support */}
              <Link to="/contact" className="reveal reveal-delay-4 group glass-panel rounded-2xl p-5 transition-all duration-300 border-white/5 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary/0 group-hover:text-primary/100 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">24/7 Support</h4>
                <p className="text-xs text-muted-foreground">
                  Need help with keys or bulk batching? Contact support directly.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
