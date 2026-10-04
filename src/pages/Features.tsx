import { Helmet } from "react-helmet-async";
import CoreCapabilities from "@/components/CoreCapabilities";
import FeatureGridFull from "@/components/FeatureGridFull";

const Features = () => (
  <div className="min-h-screen bg-background pt-12">
    <Helmet>
      <title>Features — Batch Processing, Trademark Filter & More | Tagyfy Pro</title>
      <meta
        name="description"
        content="Explore Tagyfy Pro features: multi-AI vision analysis, batch metadata generation, direct IPTC/XMP embedding, trademark sniffer, confidence scoring, and platform-specific CSV exports."
      />
      <link rel="canonical" href="https://tagyfy.com/features" />
    </Helmet>
    <main>
      <div className="max-w-3xl mx-auto text-center px-6 pt-8">
        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
          Every Feature, In Full Detail
        </h1>
        <p className="text-tertiary">
          This page is the complete, up-to-date reference for everything Tagyfy Pro ships with today — the core
          capabilities, the full 16-feature catalogue, and every supported file format.
        </p>
      </div>
      <CoreCapabilities />
      <FeatureGridFull />
    </main>
  </div>
);

export default Features;
