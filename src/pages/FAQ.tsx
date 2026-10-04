import { Helmet } from "react-helmet-async";
import FAQSection from "@/components/FAQSection";

const FAQ = () => (
  <div className="min-h-screen bg-background pt-12">
    <Helmet>
      <title>Frequently Asked Questions | Tagyfy Pro</title>
      <meta
        name="description"
        content="Answers to common questions about Tagyfy Pro: supported AI providers, file formats, trademark detection, batch processing, CSV exports, API key safety, and licensing."
      />
      <link rel="canonical" href="https://tagyfy.com/faq" />
    </Helmet>
    <main>
      <div className="max-w-3xl mx-auto text-center px-6 pt-8">
        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
          The Full FAQ
        </h1>
        <p className="text-tertiary text-sm">
          Every question we've been asked, searchable, in one place.
        </p>
      </div>
      <FAQSection />
    </main>
  </div>
);

export default FAQ;
