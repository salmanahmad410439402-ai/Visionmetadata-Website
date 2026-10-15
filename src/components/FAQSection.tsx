import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { analytics } from "@/lib/analytics";
import { FAQS } from "@/data/faqs";



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
                        <mark key={index} className="bg-accent-indigo-light text-foreground font-semibold">
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
        if (!searchQuery.trim()) return FAQS;

        const query = searchQuery.toLowerCase();
        return FAQS.filter(
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
                        Answers on providers, file formats, licensing, privacy and limits. Use the search box to filter, or add a question in the Contact form if something is missing.
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

                {/* Q&A list.
                    Answers are always rendered in the DOM rather than inside a
                    collapsed accordion: an accordion that mounts its content
                    only on click means a reader (or a search crawler) sees a
                    page of questions with no answers at all, which makes the
                    page look thin. Each item stays skimmable via the heading
                    hierarchy. */}
                <div className="reveal">
                    {resultCount > 0 ? (
                        <div className="w-full">
                            {filteredFaqs.map((faq, index) => (
                                <div key={index} className="border-b border-muted py-6">
                                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3">
                                        <HighlightText text={faq.question} query={searchQuery} />
                                    </h3>
                                    <p className="text-sm leading-relaxed text-tertiary">
                                        <HighlightText text={faq.answer} query={searchQuery} />
                                    </p>
                                </div>
                            ))}
                        </div>
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
