import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Download, CheckCircle2, Bot, Chrome, RefreshCw, Sparkles, FolderDown, FileCode, Puzzle, Zap, ArrowDown, ShieldCheck, Key, Cpu, HelpCircle, Layers, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";

const ChromeExtension = () => {
  const ref = useReveal();

  const features = [
    {
      icon: RefreshCw,
      title: "Revive Approved Assets",
      desc: "Review and update titles and keywords on existing approved photos without repeating the same manual form entry.",
      color: "#4F46E5",
    },
    {
      icon: Sparkles,
      title: "Auto-Tag New Uploads",
      desc: "Generate descriptive titles and up to 50 relevant keywords for newly uploaded batches.",
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
    { num: "1", icon: FolderDown, title: "Download Extension Archive", desc: "Scroll to the download section at the bottom of this page and grab the latest Tagyfy_Pro_Chrome_Extension_V1.3.6.zip file." },
    { num: "2", icon: FileCode, title: "Extract the .ZIP File", desc: "Right-click the downloaded .zip file and extract it to a permanent folder on your computer. The archive contains a folder named tagyfy-pro — keep that folder together, Chrome loads it as a unit." },
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
      a: "The extension fills standard form fields such as Title and Keywords. You remain responsible for checking accuracy and following Adobe Stock's current contributor guidelines before saving changes.",
    },
    {
      q: "What is the difference between this extension and the Desktop Software?",
      a: "The Chrome Extension works inside your browser to auto-fill metadata on Adobe Stock. The Tagyfy Pro Desktop App is a dedicated native workstation software that embeds metadata directly into EPS, AI, JPG, PNG, and Video files with zero platform limits.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-6">
      <Helmet>
        <title>Free Adobe Stock Chrome Extension | Tagyfy Pro</title>
        <meta
          name="description"
          content="100% free Chrome extension for Adobe Stock contributors. Update approved assets and generate fresh metadata directly inside the contributor dashboard using Gemini, ChatGPT, Groq, and Mistral."
        />
      <link rel="canonical" href="https://tagyfy.com/chrome-extension" />
    </Helmet>
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
            Generate descriptive titles and up to 50 structured keywords, then review them inside your contributor dashboard — free to install with no Tagyfy license key needed.
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

        {/* ─── FEATURES GRID ─── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Core Automation Features</h2>
            <p className="text-secondary text-sm sm:text-base max-w-xl mx-auto">Tools to reduce repetitive tagging while keeping the contributor in control of the final submission.</p>
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
                <span>
                  Note: extensions loaded this way are unsigned, so Chrome may show an
                  &#34;unsupported extensions&#34; or developer-mode prompt on startup. That warning is
                  Chrome telling you the extension was not installed from the Web Store — read it,
                  and only keep the extension if you are satisfied with what it does. You can review
                  or remove it at any time at chrome://extensions/. A signed Web Store release is on
                  our roadmap.
                </span>
              </p>
            </div>
          </div>
        </div>


            {/* Transparency: what the extension can actually access. Sideloaded
                software has to be described honestly — including permissions and
                the fact that this build is not a signed Web Store release. */}
            <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-border/80 bg-card-primary">
              <h2 className="text-lg font-bold text-foreground mb-4">
                What this extension can access
              </h2>
              <p className="text-sm text-secondary leading-relaxed mb-5">
                Because you are installing this manually rather than from the Chrome Web Store,
                you should know exactly what it asks for before you enable it. The installed
                manifest (v1.3.6) requests the following:
              </p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <p className="font-bold text-foreground mb-1">Runs on</p>
                  <p className="text-secondary leading-relaxed">
                    contributor.stock.adobe.com only. It has no access to your other browsing.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Connects out to</p>
                  <p className="text-secondary leading-relaxed">
                    The AI provider whose key you supplied — Google, OpenAI, Groq or Mistral. No
                    Tagyfy server is contacted.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Stores locally</p>
                  <p className="text-secondary leading-relaxed">
                    Your API keys and your title/keyword preferences, in Chrome extension storage
                    on this device.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Does not do</p>
                  <p className="text-secondary leading-relaxed">
                    No analytics, no tracking, no remote code loading, and no access to files
                    outside the Adobe contributor tab you run it on.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-secondary leading-relaxed">
                <strong className="text-foreground">We audited the build before publishing it.</strong>{" "}
                Every network destination in the shipped code was traced. There are six outbound
                calls in total and they go to the four AI providers listed above — no Tagyfy server,
                no analytics endpoint, no third party of any kind. The code contains no{" "}
                <code className="text-xs">eval</code>, no{" "}
                <code className="text-xs">atob</code>, no cookie access, no{" "}
                <code className="text-xs">webRequest</code> usage and no remote code loading. Your
                API keys are written to Chrome's extension storage under the{" "}
                <code className="text-xs">vmp_</code> prefix and never leave your device except in
                calls to the provider that issued them.
              </p>
              <p className="mt-4 text-sm text-secondary leading-relaxed">
                <strong className="text-foreground">The remaining caveat.</strong>{" "}
                The JavaScript in this build is minified, which makes it harder for you to check our
                work than it should be. Minified code is not hidden code — nothing is packed,
                encrypted or fetched at runtime, and the plain-text list above is the complete set
                of things the extension can reach — but it does mean you cannot skim it. If
                inspectable code matters to you, use the browser tool on the{" "}
                <Link to="/tool" className="text-primary underline hover:text-primary/80">
                  Tool page
                </Link>{" "}
                — it does the same job with nothing to install.
              </p>
              <p className="mt-4 text-sm text-secondary leading-relaxed">
                The extension fills form fields on the Adobe contributor dashboard. It does not
                submit, publish or delete anything on your behalf, and you remain responsible for
                what you save.
              </p>
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
                  href="/Tagyfy_Pro_Chrome_Extension_V1.3.6.zip"
                  download="Tagyfy_Pro_Chrome_Extension_V1.3.6.zip"
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
                  No account, no telemetry, no Tagyfy server
                </span>
                <span>•</span>
                <span>Version: <strong>1.3.6</strong></span>
                <span>•</span>
                <span>Format: <strong>ZIP archive (~70 KB)</strong></span>
                <span>•</span>
                <span className="text-green-400 font-semibold">Free, with no licence key</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ChromeExtension;
