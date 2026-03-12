import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Does VisionMeta PRO embed metadata directly into files?",
        answer:
            "Yes. VisionMeta PRO embeds metadata directly into image, vector, and video files using industry-standard metadata formats such as EXIF, IPTC, and XMP (where supported). The metadata is written into the file after generation.",
    },
    {
        question: "Will stock platforms automatically detect this metadata?",
        answer:
            "Yes. Major stock platforms such as Adobe Stock, Shutterstock, Dreamstime, and Freepik automatically read embedded metadata during upload, allowing titles and keywords to appear without manual entry.",
    },
    {
        question: "What file types are supported?",
        answer:
            "VisionMeta PRO supports JPG, PNG, EPS, AI, SVG, MP4, and MOV files. Metadata is embedded according to each file type's supported standards.",
    },
    {
        question: "Does VisionMeta PRO work online or offline?",
        answer:
            "VisionMeta PRO uses secure AI APIs to generate metadata, so an internet connection is required. To ensure fast performance even on slow connections, the software intelligently processes images, vectors and videos, sending minimal data to the AI while processing everything else locally.",
    },
    {
        question: "Do I still need to enter metadata manually on stock websites?",
        answer:
            "No. Once metadata is generated and embedded using VisionMeta PRO, you can upload files directly to supported stock platforms. Titles and keywords are automatically detected without manual entry.",
    },
];

const FAQSection = () => {
    return (
        <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
                    Frequently Asked Questions
                </h2>
                <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
                    Everything you need to know before getting started
                </p>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`faq-${index}`}
                            className="border-b border-border"
                        >
                            <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-5">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQSection;
