import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

/**
 * Homepage preview questions.
 *
 * These are deliberately different questions from the ones on /faq rather than
 * a shortened copy of that page: repeating the same Q&A on two URLs creates
 * duplicate content and gives a visitor no reason to click through. Each answer
 * here is self-contained, and the full list lives at /faq.
 */
const topQuestions = [
  {
    question: "What do I need before I can generate metadata?",
    answer:
      "Two things: the media files you want to describe, and an API key from one AI provider. Google AI Studio issues a free Gemini key in about a minute, and Groq also has a free tier, so a paid account is not required to start. Tagyfy Pro never resells AI access, which is why there is no per-generation charge.",
  },
  {
    question: "Which parts work in the browser and which need the desktop app?",
    answer:
      "The browser tool on the Tool page handles images: upload a JPG, PNG or WebP, get a draft title, description and keyword set back, then copy or export it. Writing metadata into vector files such as EPS and AI, or into video containers such as MP4 and MOV, requires the desktop app because browsers cannot modify those file structures.",
  },
  {
    question: "What happens at the end of the 3-day trial?",
    answer:
      "Nothing charges automatically. You evaluate the app for 3 days with every feature enabled and no card on file, and if it earns a place in your workflow you buy a licence key for 1, 3, 6 or 12 months. Nothing renews by itself, and no card is stored because no card is ever collected for the trial.",
  },
  {
    question: "Can I see real output before I trust it with a batch?",
    answer:
      "Yes. Generate metadata for one image in the browser tool, or run a single file in the desktop app, and read the result critically: check whether the title describes the actual subject, whether the keywords would help a buyer find it, and whether anything reads as invented. Only extend to a full batch once that single result holds up.",
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
            Everything you need before you start — what to prepare, what runs where, and how the trial ends.
          </p>
        </div>

        <div className="reveal space-y-6">
          {topQuestions.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-card-primary bg-card-primary p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 text-left">
                {faq.question}
              </h3>
              <p className="text-sm leading-relaxed text-tertiary">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="reveal text-center mt-10">
          <Link to="/faq" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
            Read the full FAQ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FAQPreview;
