import { Upload, Sparkles, PackageCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Assets",
    desc: "Upload images, videos, or vector files directly into VisionMeta.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Generate Metadata",
    desc: "Automatically generate SEO-optimized titles, descriptions, and high-ranking keywords tailored for stock platforms.",
  },
  {
    icon: PackageCheck,
    step: "03",
    title: "Embed & Export",
    desc: "Metadata is embedded directly into the files using professional tools, ready for upload with metadata already attached.",
  },
];

const HowItWorks = () => {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Three simple steps to professional metadata
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, step, title, desc }) => (
            <div
              key={step}
              className="group relative rounded-2xl bg-card border border-border p-8 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_hsl(190_95%_50%/0.08)]"
            >
              <span className="text-5xl font-black text-primary/10 absolute top-6 right-6 select-none">
                {step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;