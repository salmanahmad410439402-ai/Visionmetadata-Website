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

        <a href="https://release-assets.githubusercontent.com/github-production-release-asset/1157110009/f12b1c6b-5116-4119-af82-8bed1afc29d7?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-03-13T00%3A40%3A32Z&rscd=attachment%3B+filename%3DVisionMeta-Pro-Setup.exe&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-03-12T23%3A40%3A21Z&ske=2026-03-13T00%3A40%3A32Z&sks=b&skv=2018-11-09&sig=A9VUIfCkmE%2BICU7ZcUcA%2F3okEKpOwcGS42v%2B5a1wIx4%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3MzM2MzE2MCwibmJmIjoxNzczMzU5NTYwLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.-HW3W2dIwldpnLVAPXGkJS222XyNnVI9Fi5Ptmno7Bg&response-content-disposition=attachment%3B%20filename%3DVisionMeta-Pro-Setup.exe&response-content-type=application%2Foctet-stream">
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
