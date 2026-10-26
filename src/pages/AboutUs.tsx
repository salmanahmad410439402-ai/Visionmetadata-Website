import { Helmet } from "react-helmet-async";
import { Sparkles, User, Award, Target, ShieldCheck, BookOpen } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SELLER } from "@/config/commerce";

const AboutUs = () => {
  const ref = useReveal();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <Helmet>
        <title>About Salman Ahmad &amp; Tagyfy Pro — Independent Stock Contributor Tool</title>
        <meta
          name="description"
          content="Meet Salman Ahmad, the stock contributor and vector designer behind Tagyfy Pro. Learn how our local-first Windows app, free browser tools, and contributor guides are built."
        />
        <meta property="og:title" content="About Salman Ahmad & Tagyfy Pro" />
        <meta property="og:url" content="https://tagyfy.com/about" />
        <link rel="canonical" href="https://tagyfy.com/about" />
      </Helmet>

      <div className="max-w-5xl mx-auto" ref={ref as React.RefObject<HTMLDivElement>}>
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6 accent-indigo-light accent-indigo-border-soft text-accent">
            <Sparkles className="w-4 h-4" />
            Independent Creator Software
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl sm:text-6xl font-black text-foreground mb-6 tracking-tight">
            Built by a Working <span className="text-gradient-flow">Stock Contributor</span>
          </h1>
          <p className="reveal reveal-delay-2 max-w-3xl mx-auto text-lg sm:text-xl text-tertiary leading-relaxed">
            Tagyfy Pro is an independent software project and contributor knowledge base written and
            maintained by <strong>{SELLER.operator}</strong>, a stock media contributor and logo
            designer based in Pakistan.
          </p>
        </div>

        {/* Founder Bio Card */}
        <div className="reveal glass-panel rounded-3xl p-8 sm:p-10 border border-border/80 mb-14 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Who Builds &amp; Supports Tagyfy Pro
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {SELLER.operator} · Stock Media Contributor, Vector Designer &amp; Software Developer
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Tagyfy Pro did not start as a venture-backed SaaS company or a marketing agency project.
            It started inside my own vector and stock illustration workflow after years of preparing
            paired <code>.eps</code> + <code>.jpg</code> files, rewriting repetitive 180-character
            titles, debugging rejected CSV uploads across six different agency schemas, and learning
            firsthand how easily an unnoticed trademark term or generic keyword order can stall a
            batch in moderation.
          </p>
          <p className="text-sm sm:text-base text-secondary leading-relaxed">
            Because this is a solo, founder-operated project, there is no outsourced sales desk:
            every guide on{" "}
            <Link to="/blogs" className="text-primary underline hover:text-primary/80">
              the Contributor Knowledge Base
            </Link>{" "}
            is edited from direct marketplace experience, and every support message sent to{" "}
            <a href={`mailto:${SELLER.supportEmail}`} className="text-primary underline">
              {SELLER.supportEmail}
            </a>{" "}
            or WhatsApp ({SELLER.whatsappDisplay}) goes straight to the developer who maintains the
            code.
          </p>
        </div>

        {/* Problem & Honest Technical Scope */}
        <div className="reveal grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Why Tagyfy Exists
            </h2>
            <p className="text-secondary leading-relaxed text-sm sm:text-base">
              Browser-only keyword generators help with single JPEGs, but vector artists and video
              shooters still hit a wall: browsers cannot write XMP packets directly into{" "}
              <code>.eps</code>, <code>.ai</code>, or <code>.mp4</code> files, and every marketplace
              expects slightly different CSV headers, title limits, and keyword counts. Tagyfy
              combines free browser tools for quick single-file drafting and validation with a
              native Windows workstation app for bulk local embedding.
            </p>
          </div>

          <div className="bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              What Ships in v1.3.6 Today
            </h2>
            <p className="text-secondary leading-relaxed text-sm sm:text-base">
              Tagyfy Pro is built with Rust (Tauri) and React. It connects directly to{" "}
              <strong>four AI providers</strong> using your own API key — Google Gemini, OpenAI
              (GPT-4o), Groq (Qwen Vision), and Mistral AI — and supports{" "}
              <strong>10 core media formats</strong>: JPG/JPEG, PNG, WebP, TIFF, SVG, EPS, AI, MP4,
              MOV, and WebM, plus formatted CSV exports for Adobe Stock, Shutterstock, Freepik,
              Vecteezy, Dreamstime, and 123RF.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="reveal mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">
            How We Approach Software &amp; Documentation
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card-primary border border-card-primary rounded-2xl p-6 space-y-3">
              <ShieldCheck className="w-7 h-7 text-primary" />
              <h3 className="text-lg font-bold text-foreground">No Media Proxy</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Tagyfy runs no server between your files and your AI provider. Desktop embedding
                happens on your machine, and API keys stay in local storage under your control.
              </p>
            </div>

            <div className="bg-card-primary border border-card-primary rounded-2xl p-6 space-y-3">
              <BookOpen className="w-7 h-7 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Verifiable Claims Only</h3>
              <p className="text-sm text-secondary leading-relaxed">
                No tool can guarantee marketplace approval, search rankings, or royalty income. Our{" "}
                <Link to="/editorial-policy" className="text-primary underline">
                  editorial policy
                </Link>{" "}
                separates official agency rules from personal contributor observations.
              </p>
            </div>

            <div className="bg-card-primary border border-card-primary rounded-2xl p-6 space-y-3">
              <Sparkles className="w-7 h-7 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Review-First Workflow</h3>
              <p className="text-sm text-secondary leading-relaxed">
                AI output is a first draft. Contributors remain responsible for checking subject
                accuracy, removing restricted trademarks, attaching releases, and declaring AI media.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="reveal text-center glass-panel rounded-3xl p-10 sm:p-14 border border-primary/20 bg-card-primary">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            Explore Our Free Tools &amp; Guides
          </h2>
          <p className="text-secondary max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Read our contributor guides, validate metadata in the browser with no API key, or test
            the Windows desktop app with a 3-day full-access trial.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/blogs">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 font-bold rounded-xl btn-shimmer bg-gradient-flow text-white border-0">
                Read Contributor Guides
              </Button>
            </Link>
            <Link to="/metadata-checker">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 font-bold rounded-xl">
                Free Metadata Checker
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-6 font-semibold rounded-xl">
                Contact {SELLER.operator}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
