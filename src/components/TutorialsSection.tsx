import { Play, Download, Settings, Key, Zap, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import { useState } from "react";

const tutorials = [
  {
    num: "01",
    icon: Download,
    title: "Installation & Setup",
    desc: "Download and install VisionMetadata Pro in minutes. Get everything running on your machine.",
    duration: "3:45",
    videoFile: "demo1.mp4",
  },
  {
    num: "02",
    icon: Key,
    title: "Connect Your AI Keys",
    desc: "Get free API keys from Gemini, OpenAI, or other providers. Add them to the software in seconds.",
    duration: "4:20",
    videoFile: "demo2.mp4",
  },
  {
    num: "03",
    icon: Zap,
    title: "Upload & Generate Metadata",
    desc: "Drag and drop your files. Let AI generate titles, descriptions, and 50+ keywords automatically.",
    duration: "6:15",
    videoFile: "demo3.mp4",
  },
  {
    num: "04",
    icon: Settings,
    title: "Bulk Processing & Export",
    desc: "Process 100+ files in one batch. Export ready-to-upload CSVs for all major stock platforms.",
    duration: "5:40",
    videoFile: "demo4.mp4",
  },
];

const faqs = [
  {
    q: "Do I need to watch all videos?",
    a: "No. Watch only what you need. Video 1 is essential for first-time setup, then jump to what interests you.",
  },
  {
    q: "Can I watch these on mobile?",
    a: "Yes. All videos are optimized for desktop, tablet, and mobile viewing.",
  },
  {
    q: "What if I get stuck?",
    a: "Contact our support team or check the FAQ section. We're here to help.",
  },
  {
    q: "Are there written guides too?",
    a: "Yes. Click 'Show Transcript' on any video or visit our Help Center for step-by-step guides.",
  },
];

const VideoCard = ({ num, icon: Icon, title, desc, duration, videoFile }: typeof tutorials[0]) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <div className="reveal rounded-3xl border overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer bg-card-primary border-card-primary"
        onClick={() => setIsPlaying(true)}>
        
        {/* Video Thumbnail Area */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 glow-cyan-sm" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-[0_0_40px_hsl(190_95%_50%/0.5)] transition-shadow bg-accent-cyan-light">
              <Play className="w-8 h-8 text-slate-900 fill-slate-900 ml-1" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900/80 text-primary backdrop-blur-sm">
            {duration}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent-cyan-subtle">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-3xl font-black text-accent-cyan/15">
              {num}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
          <p className="text-sm mb-6 text-secondary">{desc}</p>

          <Button variant="outline" className="w-full rounded-xl hover:border-primary/50" onClick={() => setIsPlaying(true)}>
            <Play className="w-4 h-4 mr-2" />
            Watch Video
          </Button>
        </div>
      </div>

      {/* Video Player Modal */}
      {isPlaying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsPlaying(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <video
              src={`/videos/${videoFile}`}
              autoPlay
              controls
              className="w-full h-full"
            />
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const TutorialsSection = () => {
  const ref = useReveal();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-28">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 bg-accent-cyan-subtle border-accent-cyan-subtle">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Video Tutorials</span>
          </div>

          <h1 className="reveal reveal-delay-1 text-5xl sm:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Learn VisionMetadata Pro in 4 Steps
          </h1>

          <p className="reveal reveal-delay-2 text-xl max-w-2xl mx-auto mb-6 text-primary/80">
            Quick video tutorials that walk you through every step. From installation to uploading on stock platforms.
          </p>

          <p className="reveal reveal-delay-2 text-base max-w-xl mx-auto text-secondary">
            Total time: ~20 minutes. Watch in order or skip to what you need.
          </p>
        </div>

        {/* Live Demo Section */}
        <div className="reveal reveal-delay-3 mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6 bg-accent-cyan-subtle border-accent-cyan-subtle text-accent-cyan">
              Live Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-0">
              See How Stock Metadata Is Done in{" "}
              <span className="text-accent-cyan-light">Minutes</span>
            </h2>
          </div>

          {/* Video container */}
          <div className="relative w-full rounded-2xl overflow-hidden max-w-4xl mx-auto border border-accent-cyan shadow-[0_0_40px_hsl(190_95%_50%/0.15)] bg-card-primary"
            style={{
              aspectRatio: "16 / 9",
            }}
          >
            {isPlayingDemo ? (
              <video className="absolute inset-0 w-full h-full object-cover"
                src="/Demo.mp4" autoPlay controls playsInline
                style={{ backgroundColor: "#000" }} />
            ) : (
              <button onClick={() => setIsPlayingDemo(true)}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all duration-300 bg-card-primary"
                aria-label="Play demo video">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity glow-cyan-md" />
                  <div className="relative w-20 h-20 rounded-full border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-accent-cyan-subtle border-accent-cyan">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-secondary">
                  Watch a Real Metadata Workflow
                </span>
              </button>
            )}
          </div>

          <p className="text-center text-xs mt-5 text-quaternary">
            ✨ Quick workflow guide · Used daily by professional stock contributors
          </p>
        </div>

        {/* Section Divider */}
        <div className="my-28 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(190 95% 50% / 0.2), transparent)" }} />

        {/* Tutorials Section */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
            style={{ background: "hsl(var(--primary) / 0.08)", borderColor: "hsl(var(--primary) / 0.2)" }}>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Step-by-Step Guides</span>
          </div>
          <h2 className="reveal text-3xl sm:text-4xl font-bold text-foreground">
            Detailed Tutorials
          </h2>
        </div>

        <div className="reveal grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {tutorials.map((tutorial, idx) => (
            <div key={tutorial.num} className={`reveal-delay-${idx + 1}`}>
              <VideoCard {...tutorial} />
            </div>
          ))}
        </div>

        {/* Step By Step Breakdown */}
        <div className="reveal mb-32">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">What You'll Learn</h2>
          
          <div className="space-y-6">
            {tutorials.map(({ num, title, desc }, idx) => (
              <div key={num} className="reveal flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-accent-cyan-subtle border-2 border-accent-cyan text-accent-cyan-light">
                    {num}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-secondary">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="reveal mb-32">
          <h2 className="text-3xl font-bold text-center mb-14">Common Questions</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map(({ q, a }) => (
              <div key={q} className="reveal rounded-2xl border p-6 bg-card-primary border-card-primary">
                <h3 className="font-bold mb-3 text-foreground text-sm">{q}</h3>
                <p className="text-xs leading-relaxed text-secondary">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="reveal text-center rounded-3xl border p-12 overflow-hidden mt-12"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(220 90% 50% / 0.08) 100%)", borderColor: "hsl(var(--primary) / 0.2)" }}>
          <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-lg mb-10 text-primary/80">Download VisionMetadata Pro and try the workflow.</p>
          <a href="https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.2.0/VisionMetadata.Pro_1.2.0_x64-setup.exe" target="_blank" rel="noopener noreferrer">
            <Button size="lg"
              className="h-16 px-12 text-lg font-bold rounded-2xl btn-shimmer shadow-[0_0_40px_hsl(190_95%_50%/0.35)] hover:shadow-[0_0_56px_hsl(190_95%_50%/0.5)] hover:scale-[1.03] transition-all duration-300">
              <Download className="w-6 h-6 mr-3" />
              Download VisionMetadata Pro
            </Button>
          </a>
        </div>

      </div>
    </section>
  );
};

export default TutorialsSection;
