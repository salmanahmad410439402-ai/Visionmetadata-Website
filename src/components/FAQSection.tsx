import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useReveal } from "@/hooks/useReveal";

const faqs = [
    {
        question: "Does VisionMetadata Pro embed metadata directly into files?",
        answer: "Yes. VisionMetadata Pro embeds metadata directly into your files — no extra software required. This works for JPG, PNG, EPS, AI, SVG, MP4, MOV, and more. Stock platforms read the embedded data automatically on upload.",
    },
    {
        question: "Will stock platforms automatically detect this metadata?",
        answer: "Yes. Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF, and Vecteezy all read embedded metadata during upload. Your title and keywords will auto-populate without any manual entry.",
    },
    {
        question: "Which AI providers are supported?",
        answer: "VisionMetadata Pro supports 6 AI providers: Google Gemini (Flash & Pro), OpenAI GPT-4o, Groq (Llama 4 Scout), Mistral AI, OpenRouter (300+ models including free ones), and local Ollama models. You can add multiple API keys and the system automatically rotates between them when rate limits are hit.",
    },
    {
        question: "Can I use VisionMetadata Pro without an internet connection?",
        answer: "Yes. Switch to 'Ollama Only' mode in Settings to run entirely offline using local vision models on your PC. The software will process files locally without sending any data to the cloud. For best results on most PCs, we recommend llava:7b which requires around 5 GB of RAM.",
    },
    {
        question: "What happens when my API key hits a rate limit?",
        answer: "The system has an automatic key rotation engine. When one key hits its rate limit, it's placed in a short cooldown and the next available key is tried immediately — following a priority waterfall across all your configured providers. You never see a failed generation just because one key is temporarily limited.",
    },
    {
        question: "What is the Trademark Sniffer?",
        answer: "It's a built-in compliance system that automatically detects and removes brand names from generated keywords. It has a list of 100+ trademarks and replaces them with generic equivalents — for example 'iPhone' becomes 'modern smartphone with touchscreen'. This prevents stock platform rejections caused by trademarked terms.",
    },
    {
        question: "What are Confidence Scores and Risk Analysis?",
        answer: "Every generated metadata set includes a confidence score (0–100) broken down into four dimensions: subject clarity, keyword precision, differentiator strength, and compliance safety. Risk Analysis flags potential reasons a stock reviewer might reject the asset — such as editorial content or brand mentions — with a severity level. Platform Readiness tells you if each asset is READY, NEEDS REVIEW, or NOT READY for Adobe Stock, Freepik, and Shutterstock individually.",
    },
    {
        question: "What is Series Mode?",
        answer: "Series Mode is for assets that belong together — for example, 10 variations of the same icon set. When enabled, the AI appends 'Part 01', 'Part 02', etc. to titles and maintains consistent keywords across the entire series, while slightly varying the visual description for each part.",
    },
    {
        question: "How does the CSV export work?",
        answer: "VisionMetadata Pro generates platform-specific CSV files verified against the official upload specs for Adobe Stock, Shutterstock, Dreamstime, Freepik, 123RF, and Vecteezy. Each platform gets the correct column headers, category IDs, and keyword formatting. No truncation is ever applied — your full keyword list and title are always exported.",
    },
    {
        question: "Is my API key safe inside the app?",
        answer: "Yes. Your API keys are stored locally on your own PC using encrypted storage — they are never sent to VisionMetadata Pro servers because there are no VisionMetadata Pro servers. The app calls AI providers (Gemini, OpenAI, etc.) directly from your machine, just like a browser would. VisionMetadata Pro never sees, logs, or transmits your keys.",
    },
    {
        question: "How does the licensing work?",
        answer: "VisionMetadata Pro is available in four plans: 1 Month, 3 Months, 6 Months, and 1 Year. You purchase a license key for your chosen duration — when it expires you can renew at any time. The AI generation uses your own API keys (which have their own free tiers — Gemini offers a generous free quota) or Ollama locally. You are never billed per generation by VisionMetadata Pro.",
    },
];

const FAQSection = () => {
    const ref = useReveal();
    return (
        <section id="faq" ref={ref as React.RefObject<HTMLElement>} className="py-24 px-6">
            <div className="max-w-3xl mx-auto">

                <div className="text-center mb-14">
                    <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4"
                        style={{ background: "hsl(190 95% 50% / 0.07)", borderColor: "hsl(190 95% 50% / 0.2)", color: "hsl(190 95% 65%)" }}>
                        FAQ
                    </div>
                    <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="reveal reveal-delay-2 max-w-xl mx-auto" style={{ color: "hsl(215 20% 65%)" }}>
                        Everything you need to know before getting started
                    </p>
                </div>

                <div className="reveal reveal-delay-3">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`faq-${index}`}
                                className="border-b"
                                style={{ borderColor: "hsl(220 30% 18%)" }}>
                                <AccordionTrigger
                                    className="text-sm sm:text-base font-semibold text-foreground hover:no-underline transition-colors py-5 text-left"
                                    style={{ color: "hsl(210 40% 92%)" }}>
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm leading-relaxed pb-5"
                                    style={{ color: "hsl(215 20% 68%)" }}>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
