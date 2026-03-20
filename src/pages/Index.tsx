import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import HowItWorks from "@/components/HowItWorks";
import VideoDemoSection from "@/components/VideoDemoSection";
import WhyVisionMeta from "@/components/WhyVisionMeta";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import DownloadSection from "@/components/DownloadSection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <VideoDemoSection />
        <WhyVisionMeta />
        <Testimonials />
        <PricingSection />
        <DownloadSection />
        <ContactSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
