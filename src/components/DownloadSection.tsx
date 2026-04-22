import { Download, Monitor, HardDrive, Package, Zap, CheckCircle2, ArrowRight, Star, Users, Rocket, Shield, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { useNavigate } from "react-router-dom";
import { useTypingEffect } from "@/hooks/useTypingEffect";

const DownloadSection = () => {
  const ref = useReveal();
  const navigate = useNavigate();
  const typedText = useTypingEffect(
    [
      'Download Now, Try Free',
      'Upload Files and Generate Metadata',
      'Metadata Auto-Embeds Instantly',
      'Zero Setup Required',
    ],
    60,
    35,
    2500
  );

  const features = [
    { icon: Rocket, title: "Lightning Fast", desc: "Process 100+ files in minutes" },
    { icon: Shield, title: "Secure", desc: "Local processing, no data uploads" },
    { icon: Sparkles, title: "AI-Powered", desc: "Gemini integration built-in" },
    { icon: Package, title: "All-in-One", desc: "Everything bundled, nothing extra needed" },
  ];

  const steps = [
    { num: "1", title: "Download", desc: "Get the installer (~200MB, 30 seconds)" },
    { num: "2", title: "Install", desc: "Double-click, follow prompts (2-3 minutes)" },
    { num: "3", title: "Launch", desc: "Add your AI key, start processing" },
    { num: "4", title: "Process", desc: "Upload files, watch the magic happen" },
  ];

  const systemReqs = [
    { icon: Monitor, label: "OS", value: "Windows 10 / 11 (64-bit)" },
    { icon: HardDrive, label: "Install Size", value: "~500 MB disk space" },
    { icon: Package, label: "Memory", value: "4GB RAM (8GB recommended)" },
  ];

  const faqs = [
    { q: "How long is the trial?", a: "3 days of full access to all features. No credit card required to start." },
    { q: "What happens after trial?", a: "Choose from 1-month, 3-month, 6-month, or 1-year plans. Cancel anytime." },
    { q: "Do I need internet?", a: "Yes, for AI processing with Gemini. Local file handling is supported." },
    { q: "Will my files be uploaded?", a: "No. All processing is local to your machine. Only API calls to Gemini." },
  ];

  return (
    <section id="download" ref={ref as React.RefObject<HTMLElement>} className="pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Hero CTA */}
        <div className="reveal grid lg:grid-cols-2 gap-12 mb-32 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 accent-cyan-light accent-cyan-border">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">Ready to Get Started?</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-8">
              {typedText}
            </h2>
            
            <p className="text-xl mb-3 text-secondary">
              Get VisionMetadata Pro running in under a minute. Full access for 3 days, completely free.
            </p>
            <p className="text-base mb-12 text-quaternary">
              Process 100+ videos, vectors, and images. Extract metadata, generate previews, export anything. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.2.0/VisionMetadata.Pro_1.2.0_x64-setup.exe" className="flex-1 sm:flex-none" target="_blank" rel="noopener noreferrer">
                <Button size="lg"
                  className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl btn-shimmer shadow-[0_0_40px_hsl(190_95%_50%/0.35)] hover:shadow-[0_0_56px_hsl(190_95%_50%/0.5)] hover:scale-[1.03] transition-all duration-300">
                  <Download className="w-6 h-6 mr-3" />
                  Download Free Trial
                </Button>
              </a>
              <Button size="lg" variant="outline"
                onClick={() => navigate("/pricing")}
                className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl hover:scale-[1.02] transition-all duration-300">
                <ArrowRight className="w-5 h-5 mr-2" />
                View Pricing
              </Button>
            </div>

            {/* Trust signals */}
            <div className="space-y-3">
              {[
                "✓ 3-day free trial, no credit card required",
                "✓ Full access to all features during trial",
                "✓ Affordable monthly, quarterly, yearly plans",
                "✓ Works with free Gemini API keys",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-16 pt-12 border-t border-card-secondary">
              <div>
                <p className="text-2xl font-bold text-primary">50K+</p>
                <p className="text-xs text-quaternary">Active Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">⭐ 4.8</p>
                <p className="text-xs text-quaternary">Average Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">1M+</p>
                <p className="text-xs text-quaternary">Files Processed</p>
              </div>
            </div>
          </div>

          {/* Right side - Visual showcase */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20" 
                style={{ background: "linear-gradient(135deg, hsl(190 95% 50%) 0%, hsl(220 90% 50%) 100%)" }} />
              
              <div className="relative rounded-3xl border p-8 overflow-hidden bg-card-primary border-primary/30">
                <div className="grid grid-cols-2 gap-4">
                  {features.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="p-4 rounded-xl bg-card-secondary">
                      <Icon className="w-8 h-8 text-primary mb-3" />
                      <p className="font-semibold text-sm mb-1">{title}</p>
                      <p className="text-xs text-minimal">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - Mobile optimized */}
        <div className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-32">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="reveal rounded-2xl border p-6 hover:border-primary/50 transition-all duration-300 bg-card-primary border-card-primary">
              <Icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-quaternary">{desc}</p>
            </div>
          ))}
        </div>

        {/* Installation Steps */}
        <div className="reveal mb-32">
          <h3 className="text-3xl font-bold text-center mb-16">Get Started in 4 Simple Steps</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ num, title, desc }, idx) => (
              <div key={num} className="relative">
                {/* Connection line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[calc(100%+1rem)] h-0.5 bg-primary/20" />
                )}
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 bg-primary/15 border-2 border-primary/50 text-primary">
                    {num}
                  </div>
                  <h4 className="font-bold mb-2">{title}</h4>
                  <p className="text-sm text-quaternary">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="reveal rounded-3xl border p-10 mb-32 overflow-hidden bg-card-primary border-card-primary">
          <h3 className="text-2xl font-bold mb-8">System Requirements</h3>
          <div className="grid sm:grid-cols-3 gap-8">
            {systemReqs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 accent-cyan-light text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{label}</p>
                  <p className="text-sm text-quaternary">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="reveal mb-32">
          <h3 className="text-3xl font-bold text-center mb-14">Frequently Asked Questions</h3>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border p-6 bg-card-primary border-card-primary">
                <h4 className="font-bold mb-3 text-foreground">{q}</h4>
                <p className="text-sm text-quaternary">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="reveal text-center rounded-3xl border p-12 overflow-hidden mt-12 accent-cyan-ultra-light accent-cyan-border-soft">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Workflow?</h3>
          <p className="text-lg mb-8 text-secondary">
            Start your 3-day free trial today. No credit card required. Access all features immediately.
          </p>
          <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.2.0/VisionMetadata.Pro_1.2.0_x64-setup.exe" target="_blank" rel="noopener noreferrer">
            <Button size="lg"
              className="h-16 px-12 text-lg font-bold rounded-2xl btn-shimmer shadow-[0_0_40px_hsl(190_95%_50%/0.35)] hover:shadow-[0_0_56px_hsl(190_95%_50%/0.5)] hover:scale-[1.03] transition-all duration-300">
              <Download className="w-6 h-6 mr-3" />
              Download Free Trial (159MB)
            </Button>
          </a>
        </div>

      </div>
    </section>
  );
};

export default DownloadSection;
