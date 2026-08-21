import { Download, CheckCircle2, Bot, Chrome, RefreshCw, Sparkles, FolderDown, FileCode, Puzzle, Zap, ArrowDown, ShieldCheck, Key, Cpu, HelpCircle, Layers, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { AdSense } from "@/components/AdSense";

const ChromeExtension = () => {
  const ref = useReveal();

  const features = [
    {
      icon: RefreshCw,
      title: "Revive Approved Assets",
      desc: "Update titles and keywords on existing approved photos to boost search ranking and revive stalled sales.",
      color: "#4F46E5",
    },
    {
      icon: Sparkles,
      title: "Auto-Tag New Uploads",
      desc: "Generate commercial titles and 50 high-converting keywords automatically for newly uploaded batches.",
      color: "#10B981",
    },
    {
      icon: Bot,
      title: "Multi-AI Vision Support",
      desc: "Use your choice of Gemini, ChatGPT (OpenAI), Groq, or Mistral AI with automatic key rotation.",
      color: "#818cf8",
    },
    {
      icon: Zap,
      title: "Direct Dashboard Integration",
      desc: "Opens as a sleek Chrome side-panel that interacts directly with your Adobe Stock contributor workflow.",
      color: "#10b981",
    },
  ];

  const workflowSteps = [
    {
      title: "1. Upload Mode (Review Queue)",
      desc: "Open your Adobe Stock upload queue, set your desired title length (180–190 chars) and keyword count, then click 'Start Processing'. The extension generates and fills metadata automatically.",
    },
    {
      title: "2. Portfolio Mode (Approved Files)",
      desc: "Navigate to your portfolio page, select a range of old assets, and let the AI rewrite outdated titles and keywords with modern search-intent terms.",
    },
    {
      title: "3. Smart Key Rotation",
      desc: "Add multiple free Gemini or Groq API keys. The extension automatically balances requests and rotates keys if rate limits are reached.",
    },
  ];

  const steps = [
    { num: "1", icon: FolderDown, title: "Download Extension Archive", desc: "Scroll to the download section at the bottom of this page and grab the latest Tagyfy_Pro_Chrome_Extension.zip file." },
    { num: "2", icon: FileCode, title: "Extract the .ZIP File", desc: "Right-click the downloaded .zip file and extract it to a permanent folder on your computer (e.g. Documents/Tagyfy-Extension)." },
    { num: "3", icon: Chrome, title: "Enable Developer Mode", desc: "Open Google Chrome, navigate to chrome://extensions/ in your URL bar, and toggle 'Developer mode' in the top-right corner." },
    { num: "4", icon: Puzzle, title: "Load Unpacked", desc: "Click 'Load unpacked' at top left, select your extracted folder, and pin Tagyfy Pro to your Chrome extensions toolbar." },
  ];

  const faqs = [
    {
      q: "Is this Chrome Extension really 100% free?",
      a: "Yes! The Tagyfy Pro Chrome Extension is completely 100% free for all stock contributors. There are no subscriptions, paywalls, or activation license keys required.",
    },
    {
      q: "How do I get an AI API key?",
      a: "You can get a free Google Gemini API key in 30 seconds from Google AI Studio (aistudio.google.com/apikey). OpenAI, Groq, and Mistral keys are also supported.",
    },
    {
      q: "Will this get my Adobe Stock account in trouble?",
      a: "No. The extension only fills standard form fields (Title and Keywords) on your dashboard just as if you were typing them manually. It adheres strictly to Adobe Stock metadata compliance guidelines.",
    },
    {
      q: "What is the difference between this extension and the Desktop Software?",
      a: "The Chrome Extension works inside your browser to auto-fill metadata on Adobe Stock. The Tagyfy Pro Desktop App is a dedicated native workstation software that embeds metadata directly into EPS, AI, JPG, PNG, and Video files with zero platform limits.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-6">
      <main className="max-w-6xl mx-auto" ref={ref as React.RefObject<HTMLElement>}>
        
        {/* ─── HERO SECTION ─── */}
        <div className="text-center mb-20 max-w-4xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 mb-8 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-green-400">100% Free Adobe Stock Chrome Extension</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
            Supercharge Your <span className="text-gradient-flow">Adobe Stock</span> Workflow
          </h1>
          
          <p className="text-lg sm:text-xl mb-10 text-secondary max-w-2xl mx-auto leading-relaxed">
            Generate search-first 185-character titles, 50 structured keywords, and revive old approved assets directly inside your contributor dashboard — 100% free with no license keys needed.
          </p>

          {/* Smooth Scroll Button to Bottom */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#download-section" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl btn-shimmer bg-gradient-flow text-white shadow-[0_0_35px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] hover:scale-[1.02] transition-all duration-300 border-0">
                <ArrowDown className="w-5 h-5 mr-2 animate-bounce" />
                Scroll to Free Download (.zip)
              </Button>
            </a>

            <a href="https://contributor.stock.adobe.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-7 text-base font-semibold rounded-2xl glass-panel border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <ExternalLink className="w-4 h-4 mr-2 text-primary" />
                Launch Adobe Contributor
              </Button>
            </a>
          </div>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-10">
             {[
               "100% Free Forever",
               "No License Key Needed",
               "Works with Gemini & OpenAI",
               "Works with Groq & Mistral",
               "185-Char Stock SEO Engine",
             ].map((item) => (
               <div key={item} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/80 bg-card-primary/80 px-3.5 py-1.5 rounded-full border border-border/80 shadow-sm">
                 <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                 {item}
               </div>
             ))}
          </div>
        </div>

        {/* AdSense Top Extension Page */}
        <div className="w-full bg-slate-900/10 border border-border/40 rounded-2xl overflow-hidden min-h-[90px] flex items-center justify-center p-2 mb-16">
          <AdSense format="horizontal" />
        </div>

        {/* ─── FEATURES GRID ─── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Core Automation Features</h2>
            <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto">Everything you need to eliminate manual tagging and rank higher on Adobe Stock.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ '--card-color': color } as React.CSSProperties} className="reveal glass-panel rounded-2xl p-6 border-white/5 neon-hover-card group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 neon-icon-wrapper transition-colors border">
                  <Icon className="w-6 h-6 neon-icon transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2.5 text-foreground neon-title transition-colors">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── HOW IT WORKS IN YOUR DASHBOARD ─── */}
        <div className="reveal glass-panel rounded-3xl p-8 md:p-12 mb-24 border-white/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 mb-4 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> Workflow Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Built Specifically for Adobe Stock Contributors</h2>
            <p className="text-secondary mb-8 text-base font-medium leading-relaxed">
              Tagyfy Pro runs directly alongside your contributor interface as an integrated side panel. It reads the image previews, asks the AI to analyze commercial subjects, and types the metadata directly into the page.
            </p>

            <div className="space-y-6">
              {workflowSteps.map((wf, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-card-primary/50 border border-border/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-sm text-primary flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground mb-1">{wf.title}</h3>
                    <p className="text-sm text-secondary leading-relaxed font-medium">{wf.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── INSTALLATION GUIDE ─── */}
        <div className="reveal glass-panel rounded-3xl p-8 md:p-12 mb-24 overflow-hidden relative border-white/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-screen" />
          
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 mb-4 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Puzzle className="w-3.5 h-3.5" /> 60-Second Setup
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">How to Install in Google Chrome</h2>
            <p className="text-secondary mb-10 text-base font-medium leading-relaxed">
              Installing unpacked extensions in Chrome is fast, completely safe, and only requires enabling Developer Mode once.
            </p>
            
            <div className="space-y-7">
              {steps.map(({ num, icon: Icon, title, desc }) => (
                <div key={num} className="flex items-start gap-5 group">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base bg-background/60 border border-primary/30 text-primary flex-shrink-0 group-hover:border-primary transition-colors shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
                    {num}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2 text-foreground">
                      <Icon className="w-4 h-4 text-primary/80" />
                      {title}
                    </h3>
                    <p className="text-secondary font-medium text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md">
              <p className="text-yellow-200/90 text-xs sm:text-sm flex items-start gap-3 font-semibold">
                <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>Note: Chrome may occasionally display a standard developer mode prompt on startup. Simply click "Cancel" to keep using your free Tagyfy Pro extension seamlessly.</span>
              </p>
            </div>
          </div>
        </div>

        {/* AdSense Middle Extension Page */}
        <div className="w-full bg-slate-900/10 border border-border/40 rounded-2xl overflow-hidden min-h-[90px] flex items-center justify-center p-2 mb-16">
          <AdSense format="horizontal" />
        </div>

        {/* ─── FREQUENTLY ASKED QUESTIONS ─── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
            <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto">Quick answers to common questions about using the free extension.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="reveal glass-panel rounded-2xl p-6 border-white/5">
                <h3 className="font-bold text-base text-foreground mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm text-secondary font-medium leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── BOTTOM DOWNLOAD SECTION (EXCLUSIVELY HERE) ─── */}
        <section id="download-section" className="reveal scroll-mt-28">
          <div className="glass-panel rounded-3xl p-8 sm:p-14 border border-primary/30 relative overflow-hidden text-center bg-gradient-to-b from-primary/10 via-card-primary/90 to-background shadow-[0_0_60px_hsl(var(--primary)/0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                <Chrome className="w-8 h-8 text-primary" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-bold uppercase tracking-wider mb-4 border border-green-500/30">
                Direct .ZIP Download
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                Download Tagyfy Pro Extension
              </h2>

              <p className="text-secondary text-base mb-8 leading-relaxed">
                Click below to download the latest unpacked extension build. 100% free, no credit card, and no licensing activation needed.
              </p>

              {/* The ONLY Download Link on the Entire Website for the Extension */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <a
                  href="/Tagyfy_Pro_Chrome_Extension.zip"
                  download="Tagyfy_Pro_Chrome_Extension.zip"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-2xl btn-shimmer bg-gradient-flow text-white shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] hover:scale-[1.03] transition-all duration-300 border-0"
                  >
                    <Download className="w-6 h-6 mr-3" />
                    Download Free Extension (.zip)
                  </Button>
                </a>
              </div>

              {/* Security & Verification Metadata */}
              <div className="pt-6 border-t border-border/80 flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  Verified Safe & Clean
                </span>
                <span>•</span>
                <span>Version: <strong>1.3.5</strong></span>
                <span>•</span>
                <span>Format: <strong>ZIP Archive (~650 KB)</strong></span>
                <span>•</span>
                <span className="text-green-400 font-semibold">100% Free Forever</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ChromeExtension;
