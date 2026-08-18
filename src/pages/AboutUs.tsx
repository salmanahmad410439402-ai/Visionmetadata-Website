import { Sparkles, Users, Award, Target, Cpu, CheckCircle2, ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const ref = useReveal();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto" ref={ref as React.RefObject<HTMLDivElement>}>
        
        {/* Hero Header */}
        <div className="text-center mb-20">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6 accent-indigo-light accent-indigo-border-soft text-accent">
            <Sparkles className="w-4 h-4" />
            Our Mission & Story
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl sm:text-6xl font-black text-foreground mb-6 tracking-tight">
            Empowering Stock Media Creators with <span className="text-gradient-flow">AI Precision</span>
          </h1>
          <p className="reveal reveal-delay-2 max-w-3xl mx-auto text-lg sm:text-xl text-tertiary leading-relaxed">
            We built Tagyfy Pro to solve the single most frustrating bottleneck in digital asset licensing: spending hours manually tagging, describing, and embedding metadata into thousands of stock media files.
          </p>
        </div>

        {/* Story Section */}
        <div className="reveal reveal-delay-3 grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              The Problem We Solved
            </h2>
            <p className="text-secondary leading-relaxed">
              Stock contributors lose up to 70% of their creative time writing repetitive titles and searching for 50 high-ranking keywords. Even worse, many web tools don't embed IPTC/XMP data directly into binary formats like Adobe Illustrator (.AI), EPS vectors, or MP4 videos, forcing creators to waste more time with clumsy CSV spreadsheets.
            </p>
          </div>

          <div className="bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              The Tagyfy Solution
            </h2>
            <p className="text-secondary leading-relaxed">
              Tagyfy Pro is a desktop-native application engineered with modern Rust and React. It brings together state-of-the-art vision models (Google Gemini 2.5/3.5, OpenAI GPT-4o, Groq, Mistral) and high-speed native binary embedding pipelines to automatically analyze, describe, and directly write metadata into files in bulk.
            </p>
          </div>
        </div>

        {/* Key Values */}
        <div className="reveal mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Creators Trust Us
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card-primary border border-card-primary rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold text-xl">
                🔒
              </div>
              <h3 className="text-lg font-bold text-foreground">100% Privacy-First</h3>
              <p className="text-sm text-secondary">
                Your media files and API keys never touch our servers. Everything is processed locally on your PC.
              </p>
            </div>

            <div className="bg-card-primary border border-card-primary rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-foreground">Blazing Performance</h3>
              <p className="text-sm text-secondary">
                Multi-threaded batch processing handles hundreds of assets in seconds with zero artificial limits.
              </p>
            </div>

            <div className="bg-card-primary border border-card-primary rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold text-xl">
                🎯
              </div>
              <h3 className="text-lg font-bold text-foreground">Marketplace SEO</h3>
              <p className="text-sm text-secondary">
                Built-in algorithms tuned specifically for Adobe Stock, Shutterstock, Freepik, and Vecteezy guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="reveal text-center glass-panel rounded-3xl p-10 sm:p-14 border border-primary/20 bg-card-primary">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            Try Tagyfy Pro Free Today
          </h2>
          <p className="text-secondary max-w-xl mx-auto mb-8">
            Experience the automated workflow with our full-access 3-day free trial.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/download">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 font-bold rounded-xl btn-shimmer bg-gradient-flow text-white border-0">
                Download for Windows
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 font-bold rounded-xl">
                Contact Developer
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
