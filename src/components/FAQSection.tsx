import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useReveal } from "@/hooks/useReveal";
import { analytics } from "@/lib/analytics";

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
        answer: "VisionMetadata Pro supports 5 AI providers: Google Gemini (Flash & Pro), OpenAI GPT-4o, Groq (Llama 4 Scout), Mistral AI, and OpenRouter (300+ models including free ones). You can add multiple API keys and the system automatically rotates between them when rate limits are hit.",
    },
    {
        question: "Are there any hard limits on how many files I can process at once?",
        answer: "No, there are no artificial limits. You can drag and drop folders containing hundreds or thousands of files. The speed of processing depends entirely on your API providers and how many API keys you have added. VisionMetadata Pro handles the queueing smoothly.",
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
        answer: "VisionMetadata Pro is available in four plans: 1 Month, 3 Months, 6 Months, and 1 Year. You purchase a license key for your chosen duration — when it expires you can renew at any time. The AI generation uses your own API keys (which have their own free tiers — Gemini offers a generous free quota). You are never billed per generation by VisionMetadata Pro.",
    },
];

/**
 * Highlights matching text in a string
 * Returns JSX with <mark> elements around matches
 */
function HighlightText({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>;

    try {
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, index) =>
                    regex.test(part) ? (
                        <mark key={index} className="bg-accent-cyan-light text-foreground font-semibold">
                            {part}
                        </mark>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </>
        );
    } catch {
        return <>{text}</>;
    }
}

const FAQSection = () => {
    const ref = useReveal();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.trim().length > 0) {
            analytics.trackFeatureUsage('faq-search', {
                searchTerm: query,
                resultCount: filteredFaqs.length,
            });
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        analytics.trackClick('faq-search-clear', 'faq-section');
    };

    // Filter FAQs based on search query
    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return faqs;

        const query = searchQuery.toLowerCase();
        return faqs.filter(
            (faq) =>
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const resultCount = filteredFaqs.length;
    const showResults = searchQuery.trim().length > 0;

    return (
        <section id="faq" ref={ref as React.RefObject<HTMLElement>} className="pt-24 pb-16 px-6">
            <div className="max-w-3xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="reveal reveal-delay-2 max-w-xl mx-auto text-tertiary">
                        Everything you need to know before getting started
                    </p>
                </div>

                {/* Search Input */}
                <div className="reveal reveal-delay-3 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary opacity-50" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-card-primary bg-card-primary text-foreground placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                            aria-label="Search FAQs"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/10 rounded transition-colors"
                                aria-label="Clear search"
                                title="Clear search"
                            >
                                <X className="w-5 h-5 text-secondary" />
                            </button>
                        )}
                    </div>

                    {/* Search Results Info */}
                    {showResults && (
                        <div className="mt-3 text-sm text-secondary">
                            Found <span className="font-semibold text-accent-bright">{resultCount}</span> result{resultCount !== 1 ? 's' : ''}
                            {resultCount === 0 && ` for "${searchQuery}"`}
                        </div>
                    )}
                </div>

                {/* FAQ Accordion */}
                <div className="reveal">
                    {resultCount > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {filteredFaqs.map((faq, index) => (
                                <AccordionItem key={index} value={`faq-${index}`}
                                    className="border-b border-muted">
                                    <AccordionTrigger
                                        className="text-sm sm:text-base font-semibold text-foreground hover:no-underline transition-colors py-5 text-left text-secondary">
                                        <HighlightText text={faq.question} query={searchQuery} />
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm leading-relaxed pb-5 text-tertiary">
                                        <HighlightText text={faq.answer} query={searchQuery} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-secondary mb-2">No matching FAQs found</p>
                            <p className="text-tertiary text-sm">
                                Try a different search term or <button onClick={handleClearSearch} className="text-accent-bright hover:underline">clear the search</button>
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
