import StatsBar from "@/components/StatsBar";
import HowItWorks from "@/components/HowItWorks";
import WhyVisionMeta from "@/components/WhyVisionMeta";
import { AdSense } from "@/components/AdSense";

const Features = () => (
  <div className="min-h-screen bg-background">
    <main>
      <StatsBar />
      <HowItWorks />
      
      {/* AdSense Middle Features */}
      <section className="py-8 px-6 max-w-4xl mx-auto w-full">
        <div className="w-full bg-slate-900/10 border border-border/40 rounded-2xl overflow-hidden min-h-[90px] flex items-center justify-center p-2">
          <AdSense format="horizontal" />
        </div>
      </section>

      <WhyVisionMeta />
    </main>
  </div>
);

export default Features;
