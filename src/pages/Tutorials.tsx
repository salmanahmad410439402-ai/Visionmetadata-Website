import TutorialsSection from "@/components/TutorialsSection";
import { AdSense } from "@/components/AdSense";

const Tutorials = () => (
  <div className="min-h-screen bg-background">
    <main>
      <TutorialsSection />
      {/* AdSense Tutorials Page */}
      <section className="py-8 px-6 max-w-4xl mx-auto w-full">
        <div className="w-full bg-slate-900/10 border border-border/40 rounded-2xl overflow-hidden min-h-[90px] flex items-center justify-center p-2">
          <AdSense format="horizontal" />
        </div>
      </section>
    </main>
  </div>
);

export default Tutorials;
