import { Download, Monitor, HardDrive, Package, Zap, CheckCircle2, ArrowRight, Rocket, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { Link, useNavigate } from "react-router-dom";

const INSTALLER_URL =
  "https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.3.6/Tagyfy_Pro_1.3.6_x64-setup.exe";

const DownloadSection = () => {
  const ref = useReveal();
  const navigate = useNavigate();

  const highlights = [
    {
      icon: Rocket,
      title: "Batch processing",
      desc: "Queue 100+ assets in one run with parallel workers and live progress.",
    },
    {
      icon: Shield,
      title: "Local embedding",
      desc: "IPTC/XMP data is written into your files on your own machine, not on our servers.",
    },
    {
      icon: Sparkles,
      title: "Five AI providers",
      desc: "Bring a key from Gemini, OpenAI, Groq, Mistral or OpenRouter and rotate between them.",
    },
    {
      icon: Package,
      title: "Built-in exports",
      desc: "Emit Adobe Stock, Shutterstock, Freepik, Dreamstime, 123RF and Vecteezy CSVs.",
    },
  ];

  const steps = [
    { num: "1", title: "Download", desc: "Grab the installer — about 160 MB, usually under a minute." },
    { num: "2", title: "Install", desc: "Run the setup file and follow the prompts (2–3 minutes)." },
    { num: "3", title: "Launch", desc: "Open Settings and paste your own AI provider key." },
    { num: "4", title: "Process", desc: "Drop in files, generate, review the flags, then embed and export." },
  ];

  const systemReqs = [
    { icon: Monitor, label: "OS", value: "Windows 10 / 11 (64-bit)" },
    { icon: HardDrive, label: "Install Size", value: "~500 MB disk space" },
    { icon: Package, label: "Memory", value: "4 GB RAM (8 GB recommended)" },
  ];

  const faqs = [
    {
      q: "How long is the trial?",
      a: "3 days of full access to every feature, with no credit card required. You can also generate metadata in the browser tool first to judge output quality before installing anything.",
    },
    {
      q: "What happens when the trial ends?",
      a: "You pick a 1-month, 3-month, 6-month or 1-year license key. There is no automatic renewal and no recurring charge — see the Pricing page for current prices and the Refund Policy for the refund terms.",
    },
    {
      q: "Do I need an internet connection?",
      a: "Yes, for AI generation. Vision analysis is performed by the provider you configured, so the app needs to reach that provider's API. File tasks that need no AI call, such as embedding metadata you have already reviewed or exporting a CSV, work without a connection.",
    },
    {
      q: "Are my files uploaded anywhere?",
      a: "Your media is not sent to a Tagyfy server — we run no media proxy and keep no copy of your files. To analyse an image the app does send it to the AI provider you chose, under that provider's terms, and the written metadata is embedded locally on your machine. If your files must never leave your device, use the desktop app's local-only steps or review the metadata before you generate.",
    },
    {
      q: "Is the download safe?",
      a: "The installer is published on our GitHub release page together with a signature file you can verify. Windows SmartScreen may still show a warning because publisher reputation builds over time — only bypass it if you downloaded from our Download page or the linked release, and the file size matches. Never install Tagyfy Pro from a mirror or a link sent in a chat.",
    },
    {
      q: "Which file formats are supported?",
      a: "Images: JPG, PNG, WebP, TIFF. Vectors: SVG, EPS, AI. Video: MP4, MOV, WebM. Embedded fields readable by marketplaces vary by format, so confirm the current requirements for each platform you submit to.",
    },
  ];

  return (
    <section id="download" ref={ref as React.RefObject<HTMLElement>} className="pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Hero CTA */}
        <div className="reveal grid lg:grid-cols-2 gap-12 mb-32 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 accent-indigo-light accent-indigo-border">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">Ready to Get Started?</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
              Download Tagyfy Pro for Windows
            </h1>
            
            <p className="text-xl mb-3 text-secondary">
              Get Tagyfy Pro running in under a minute. Full access for 3 days, completely free.
            </p>
            <p className="text-base mb-12 text-quaternary">
              Process 100+ videos, vectors, and images. Extract metadata, generate previews, export anything. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a href={INSTALLER_URL} className="flex-1 sm:flex-none" target="_blank" rel="noopener noreferrer">
                <Button size="lg"
                  className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl btn-shimmer bg-gradient-flow text-white shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] hover:scale-[1.02] transition-all duration-300 border-0">
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
                "✓ Works with a free AI provider key (Gemini, Groq, Mistral)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Product facts — factual capabilities rather than unverified usage claims */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 mt-16 pt-12 border-t border-card-secondary">
              <div>
                <p className="text-2xl font-bold text-primary">3 days</p>
                <p className="text-xs text-quaternary">full-access trial</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">Windows</p>
                <p className="text-xs text-quaternary">10 / 11 desktop app</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">BYOK</p>
                <p className="text-xs text-quaternary">use your own AI key</p>
              </div>
            </div>
          </div>

          {/* Right side - Visual showcase */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20" 
                style={{ background: "linear-gradient(135deg, hsl(243 75% 59%) 0%, hsl(220 90% 50%) 100%)" }} />
              
              <div className="relative rounded-3xl border p-8 overflow-hidden bg-card-primary border-primary/30">
                <div className="grid grid-cols-2 gap-4" aria-hidden="true">
                  {highlights.map(({ icon: Icon, title, desc }) => (
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

        {/* What you get — one canonical list, also visible on mobile where the hero visual is hidden */}
        <div className="reveal mb-32">
          <h2 className="text-3xl font-bold text-center mb-14 text-foreground">What you get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-panel rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors border border-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-quaternary">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Steps */}
        <div className="reveal mb-32">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">Install in four steps</h2>
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
                  <h3 className="font-bold mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-quaternary">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="reveal glass-panel rounded-3xl p-10 mb-32 overflow-hidden">
          <h2 className="text-2xl font-bold mb-8 text-foreground">System requirements</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {systemReqs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 accent-indigo-light text-primary">
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
          <h2 className="text-3xl font-bold text-center mb-14 text-foreground">Download questions</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass-panel rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
                <h3 className="font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{q}</h3>
                <p className="text-sm text-quaternary">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="reveal text-center glass-panel rounded-3xl p-8 sm:p-12 overflow-hidden mt-12 border-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.12)]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Start the 3-day free trial</h2>
          <p className="text-base sm:text-lg mb-8 text-secondary">
            No credit card required. Full access for 3 days, then a one-off license key if you choose to continue.
          </p>
          <a href={INSTALLER_URL} target="_blank" rel="noopener noreferrer" className="block sm:inline-block w-full sm:w-auto">
            <Button size="lg"
              className="h-14 sm:h-16 w-full sm:w-auto px-4 sm:px-12 text-sm sm:text-lg font-bold rounded-2xl btn-shimmer bg-gradient-flow text-white shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] hover:scale-[1.02] transition-all duration-300 whitespace-normal text-center h-auto py-3 border-0">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 shrink-0" />
              Download free trial (~160 MB)
            </Button>
          </a>
          <p className="text-xs text-quaternary mt-6">
            Need help first? Read the{" "}
            <Link to="/tutorials" className="text-primary underline hover:text-primary/80">
              setup guides
            </Link>
            , check the{" "}
            <Link to="/faq" className="text-primary underline hover:text-primary/80">
              FAQ
            </Link>
            , or see{" "}
            <Link to="/refund-policy" className="text-primary underline hover:text-primary/80">
              refund terms
            </Link>
            .
          </p>
        </div>

      </div>
    </section>
  );
};

export default DownloadSection;

