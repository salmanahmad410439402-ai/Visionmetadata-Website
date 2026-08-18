import { FileCheck, ShieldCheck, HelpCircle, AlertCircle } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const TermsOfService = () => {
  const ref = useReveal();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto" ref={ref as React.RefObject<HTMLDivElement>}>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6 accent-indigo-light accent-indigo-border-soft text-accent">
            <FileCheck className="w-4 h-4" />
            Terms of Use
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="reveal reveal-delay-2 text-sm text-tertiary">
            Last Updated: August 17, 2026 · Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="reveal reveal-delay-3 space-y-10 text-secondary leading-relaxed bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-12 shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By downloading, installing, accessing, or using <strong>Tagyfy Pro</strong> or visiting <a href="https://tagyfy.com" className="text-primary hover:underline">tagyfy.com</a>, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our software or website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              2. Software License & Free Trial
            </h2>
            <p>
              We grant you a revocable, non-exclusive, non-transferable, limited license to download, install, and run Tagyfy Pro on your personal computer strictly in accordance with the purchased license tier (1 Month, 3 Months, 6 Months, or 1 Year).
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Free Trial:</strong> New users are eligible for a 3-day full-access trial period without credit card requirement.</li>
              <li><strong>License Activation:</strong> Paid licenses are tied to your hardware machine ID. Transferring a license to a new machine can be requested through our customer support.</li>
              <li><strong>No Reverse Engineering:</strong> You agree not to decompile, reverse engineer, disassemble, or tamper with the software protection mechanisms.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              3. AI API Usage & Third-Party Services
            </h2>
            <p>
              Tagyfy Pro provides direct client-side integration with third-party Artificial Intelligence providers (including Google Gemini, OpenAI, Groq, Mistral, and OpenRouter). You are responsible for providing valid API keys and complying with the respective terms of service of each AI provider.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              4. User Content & Intellectual Property
            </h2>
            <p>
              You retain 100% full intellectual property ownership of all images, vector files, videos, and generated metadata processed with our application. We claim zero rights or ownership over your creative works.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              5. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p className="text-sm">
              Tagyfy Pro and all website materials are provided on an "as is" and "as available" basis without warranties of any kind. While we rigorously test our metadata embedding pipelines against official Adobe Stock, Shutterstock, and Freepik specifications, we do not guarantee specific review approvals or sales earnings on third-party stock agency marketplaces.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              6. Contact Information
            </h2>
            <p>
              For legal questions, licensing inquiries, or enterprise permissions:
            </p>
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 text-sm space-y-1">
              <p><strong>Email:</strong> <a href="mailto:salmangraphics839@gmail.com" className="text-primary hover:underline">salmangraphics839@gmail.com</a></p>
              <p><strong>WhatsApp:</strong> +92 329 7090888</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
