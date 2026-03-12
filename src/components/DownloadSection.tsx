import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const DownloadSection = () => {
  return (
    <section id="download" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-muted-foreground mb-10">
          Download VisionMetadata Pro and streamline your stock workflow today.
        </p>

        <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/latest/download/VisionMetadata-Pro-Setup.exe">
          <Button
            size="lg"
            className="h-16 px-14 text-lg font-bold rounded-2xl shadow-[0_0_40px_hsl(190_95%_50%/0.3)] hover:shadow-[0_0_50px_hsl(190_95%_50%/0.5)] transition-all duration-300"
          >
            <Download className="w-6 h-6 mr-3" />
            Download VisionMetadata Pro
          </Button>
        </a>

        <p className="text-xs text-muted-foreground mt-4">
          Latest version • Secure desktop installer
        </p>
      </div>
    </section>
  );
};

export default DownloadSection;