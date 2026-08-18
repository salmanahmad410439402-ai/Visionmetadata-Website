import { Download, CheckCircle2, Bot, Chrome, RefreshCw, Sparkles, FolderDown, FileCode, Puzzle, Zap, Gift, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";

const ChromeExtension = () => {
  const ref = useReveal();

  const features = [
    { icon: RefreshCw, title: "Update Approved Assets", desc: "Easily update metadata for your already approved Adobe Stock assets.", color: "#4F46E5" }, // Indigo
    { icon: Sparkles, title: "Generate New Metadata", desc: "Automatically generate titles and keywords for newly uploaded assets.", color: "#10B981" }, // Mint
    { icon: Bot, title: "Multi-AI Support", desc: "Choose between Gemini, ChatGPT, Groq, and Mistral APIs for generation.", color: "#818cf8" }, // Light Indigo
    { icon: Zap, title: "Seamless Integration", desc: "Works directly within your Adobe Stock contributor dashboard.", color: "#10b981" }, // Emerald
  ];

  const steps = [
    { num: "1", icon: FolderDown, title: "Download", desc: "Download the extension .zip file below." },
    { num: "2", icon: FileCode, title: "Extract", desc: "Extract the .zip file to a folder on your computer." },
    { num: "3", icon: Chrome, title: "Developer Mode", desc: "Go to chrome://extensions/ and enable 'Developer mode' (top right)." },
    { num: "4", icon: Puzzle, title: "Load Unpacked", desc: "Click 'Load unpacked' and select the extracted folder." },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-6">
      <main className="max-w-6xl mx-auto" ref={ref as React.RefObject<HTMLElement>}>
        
        {/* Hero Section */}
        <div className="text-center mb-24 max-w-4xl mx-auto pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 mb-8 bg-primary/10">
            <Chrome className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Browser Extension</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-8">
            Supercharge your <span className="text-gradient-flow">Adobe Stock</span> workflow
          </h1>
          
          <p className="text-xl mb-12 text-secondary max-w-2xl mx-auto">
            Update metadata for approved assets and generate high-converting titles and keywords for new uploads using your favorite AI models directly in Chrome.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/VisionMetadata Pro chrome Extension v1.3.5.zip" download className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-16 px-10 text-lg font-bold rounded-2xl btn-shimmer bg-gradient-flow text-white shadow-[0_0_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_56px_hsl(var(--primary)/0.5)] hover:scale-[1.03] transition-all duration-300 border-0">
                <Download className="w-6 h-6 mr-3" />
                Download Extension (.zip)
              </Button>
            </a>
            
            <div className="reveal glass-panel rounded-2xl px-6 py-4 flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-black uppercase px-2 py-0.5 rounded-bl shadow-sm z-10">
                50 Spots Left!
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse border border-primary/30 z-10">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left mt-1 z-10">
                <p className="text-sm font-bold text-foreground">🎁 Buy One, Get One FREE!</p>
                <p className="text-xs text-secondary mt-0.5"><a href="/pricing" className="underline font-semibold hover:text-primary transition-colors text-foreground">Buy the desktop app</a> and get the extension key free.</p>
                <p className="text-[10px] font-semibold text-primary mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> First 50 lucky users only!
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-10">
             {[
               "Works with Gemini",
               "Works with ChatGPT",
               "Works with Groq",
               "Works with Mistral",
             ].map((item) => (
               <div key={item} className="flex items-center gap-2 text-sm font-medium text-quaternary bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                 <CheckCircle2 className="w-4 h-4 text-green-500" />
                 {item}
               </div>
             ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{ '--card-color': color } as React.CSSProperties} className="reveal glass-panel rounded-2xl p-6 border-white/5 neon-hover-card group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 neon-icon-wrapper transition-colors border">
                <Icon className="w-6 h-6 neon-icon transition-colors" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground neon-title transition-colors">{title}</h3>
              <p className="text-sm text-secondary leading-relaxed font-medium">{desc}</p>
            </div>
          ))}
        </div>

        {/* Installation Guide */}
        <div className="reveal glass-panel rounded-3xl p-8 md:p-12 mb-24 overflow-hidden relative border-white/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-screen" />
          
          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-foreground">How to Install</h2>
            <p className="text-secondary mb-12 text-lg font-medium">Since this is a custom extension, you'll need to enable Developer Mode in Chrome to install it manually. It only takes a minute.</p>
            
            <div className="space-y-8">
              {steps.map(({ num, icon: Icon, title, desc }) => (
                <div key={num} className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-background/50 border border-primary/30 text-primary flex-shrink-0 group-hover:border-primary transition-colors shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
                    {num}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                      <Icon className="w-5 h-5 text-primary/70" />
                      {title}
                    </h3>
                    <p className="text-secondary font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md">
              <p className="text-yellow-200/90 text-sm flex items-center gap-3 font-semibold">
                <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                Note: Chrome may occasionally ask if you want to disable extensions running in Developer Mode. Simply click "Cancel" to keep using the Tagyfy Pro extension.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChromeExtension;
