import { Download, Shield, Keyboard, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          VISIONMETA PRO
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-4">
          Stop Wasting Hours on Stock Metadata
        </h1>

        <p className="text-lg sm:text-xl font-medium text-primary/80 mb-6">
          Generate platform-ready keywords, titles, and CSVs in seconds.
        </p>

        <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
          Generate, optimize, and embed titles, descriptions, and keywords directly into your images, videos, and vector files — before uploading to Adobe Stock, Shutterstock, and Freepik.
        </p>

        <div className="flex flex-col items-center gap-4">
          <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/latest/download/VisionMeta-Pro-Setup.exe">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-bold rounded-xl shadow-[0_0_30px_hsl(190_95%_50%/0.3)] hover:shadow-[0_0_40px_hsl(190_95%_50%/0.45)] transition-all duration-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Download VisionMeta PRO
            </Button>
          </a>
          <span className="text-xs text-muted-foreground">Desktop software • Windows</span>

          {/* Trust badge */}
          <div className="flex items-center gap-1.5 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#1ba6dd" }} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            Trusted by 200+ Stock Contributors
          </span>

          {/* Security line */}
          <div className="flex items-center gap-1.5 mt-1">
            <Shield className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-xs text-muted-foreground">
              100% Secure Windows Installer – No Cloud Uploads Required
            </span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          {[
            { icon: Shield, text: "No browser extensions" },
            { icon: Keyboard, text: "No manual entry" },
            { icon: Award, text: "Industry-grade embedding" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary/60" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;