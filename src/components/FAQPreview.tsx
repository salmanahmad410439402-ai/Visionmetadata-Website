import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useReveal } from "@/hooks/useReveal";

const topQuestions = [
  {
    question: "Does Tagyfy Pro embed metadata directly into files?",
    answer: "Yes. Tagyfy Pro writes supported IPTC/XMP fields into compatible files. Many stock workflows can read that metadata on upload, but behavior varies by file format and marketplace, so confirm the current platform requirements.",
  },
  {
    question: "Which AI providers are supported?",
    answer: "Tagyfy Pro supports 5 AI providers: Google Gemini, OpenAI GPT-4o, Groq (Llama 4 Scout), Mistral AI, and OpenRouter. You can add multiple API keys and the system rotates between them automatically.",
  },
  {
    question: "Is my API key safe inside the app?",
    answer: "For the Windows app, keys stay in local encrypted storage and requests go directly to the provider you choose. The browser tool keeps a key locally only when you opt in and sends the selected file directly to that AI provider; Tagyfy does not proxy or store the media.",
  },
  {
    question: "How does the licensing work?",
    answer: "Tagyfy Pro is available in four plans: 1 Month, 3 Months, 6 Months, and 1 Year. You purchase a license key for your chosen duration, and you're never billed per generation.",
  },
];

/**
 * FAQPreview — a compact, homepage-only set of the four most common
 * questions. The complete, searchable list of all FAQs is the canonical
 * resource on /faq (see FAQSection) so the two pages never duplicate
 * the full body of questions.
 */
const FAQPreview = () => {
  const ref = useReveal();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-6">
            A Few Quick Questions
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-tertiary">
            The four questions new visitors ask most. Need more detail? The full FAQ page covers licensing, rate
            limits, trademark detection, and more.
          </p>
        </div>

        <div className="reveal">
          <Accordion type="single" collapsible className="w-full">
            {topQuestions.map((faq, index) => (
              <AccordionItem key={index} value={`home-faq-${index}`} className="border-b border-muted">
                <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground hover:no-underline transition-colors py-5 text-left text-secondary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed pb-5 text-tertiary">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="reveal text-center mt-10">
          <Link to="/faq" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
            View all FAQs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FAQPreview;
