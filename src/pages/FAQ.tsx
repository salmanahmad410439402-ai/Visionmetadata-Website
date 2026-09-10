import { Helmet } from "react-helmet-async";
import FAQSection from "@/components/FAQSection";

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Frequently Asked Questions | Tagyfy Pro</title>
      <meta
        name="description"
        content="Answers to common questions about Tagyfy Pro: supported AI providers, file formats, trademark detection, batch processing, CSV exports, API key safety, and licensing."
      />
    </Helmet>
    <main>
      <FAQSection />
    </main>
  </div>
);

export default FAQ;
