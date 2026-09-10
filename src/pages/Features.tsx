import { Helmet } from "react-helmet-async";
import StatsBar from "@/components/StatsBar";
import HowItWorks from "@/components/HowItWorks";
import WhyVisionMeta from "@/components/WhyVisionMeta";

const Features = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Features — Batch Processing, Trademark Filter & More | Tagyfy Pro</title>
      <meta
        name="description"
        content="Explore Tagyfy Pro features: multi-AI vision analysis, batch metadata generation, direct IPTC/XMP embedding, trademark sniffer, confidence scoring, and platform-specific CSV exports."
      />
    </Helmet>
    <main>
      <StatsBar />
      <HowItWorks />
      <WhyVisionMeta />
    </main>
  </div>
);

export default Features;
