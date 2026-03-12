import { Zap, FileVideo, ShieldCheck, Clock, Layers, UserCheck, FileSpreadsheet } from "lucide-react";

const features = [
  { icon: Zap, title: "Generate 1,000+ Keywords in Seconds", desc: "AI-powered keyword engine tuned for stock platform ranking." },
  { icon: FileVideo, title: "1-Click Batch Processing", desc: "Process hundreds of images, videos & vectors in one go." },
  { icon: ShieldCheck, title: "No Rejections from Bad Metadata", desc: "Optimized for Adobe Stock, Shutterstock & Freepik standards." },
  { icon: Clock, title: "Saves Hours of Manual Work", desc: "Automate titles, descriptions, and keyword entry instantly." },
  { icon: Layers, title: "Smart Embedding", desc: "Embed metadata directly into files before upload." },
  { icon: UserCheck, title: "Built for Professionals", desc: "Designed for serious stock contributors worldwide." },
  { icon: FileSpreadsheet, title: "Multi-CSV Export", desc: "Export platform-ready CSV files for Adobe Stock, Shutterstock, Dreamstime, and Freepik." },
];

const WhyVisionMeta = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
          Why VisionMeta PRO
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Everything you need to dominate stock metadata
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-card border border-border p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_25px_hsl(190_95%_50%/0.06)]"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyVisionMeta;