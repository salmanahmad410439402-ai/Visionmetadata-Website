import { RotateCcw, ShieldCheck, HelpCircle, CheckCircle2, Clock } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
  const ref = useReveal();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto" ref={ref as React.RefObject<HTMLDivElement>}>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6 accent-indigo-light accent-indigo-border-soft text-accent">
            <RotateCcw className="w-4 h-4" />
            Customer Protection
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black text-foreground mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="reveal reveal-delay-2 text-sm text-tertiary">
            Last Updated: August 17, 2026 · Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="reveal reveal-delay-3 space-y-10 text-secondary leading-relaxed bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-12 shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              1. 3-Day Free Trial (Try Before You Buy)
            </h2>
            <p>
              We want you to be 100% satisfied with Tagyfy Pro before spending any money. That is why we provide an unrestricted <strong>3-Day Full-Access Free Trial</strong> for all new users. During your trial, you can test every feature — including AI keywording, video tagging, and direct IPTC/XMP file embedding — with no credit card required.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              2. Digital License Key Refund Terms
            </h2>
            <p>
              Because Tagyfy Pro is a downloadable digital software with license keys activated immediately upon delivery:
            </p>
            <ul className="space-y-3 list-none pl-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>Technical Incompatibility:</strong> If the software experiences a technical issue on your machine that our engineering support team is unable to resolve within 7 days of purchase, you are eligible for a 100% full refund.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>Accidental Duplicate Purchases:</strong> If you accidentally placed duplicate orders for the same duration, we will immediately refund the duplicate payment.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              3. Non-Refundable Conditions
            </h2>
            <p className="text-sm">
              Refunds cannot be issued under the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Changing your mind after actively using the license key beyond the 7-day post-purchase window.</li>
              <li>Exhaustion or rate-limiting of third-party AI provider quotas (e.g. Gemini, OpenAI) as AI API costs are managed directly between you and your chosen AI provider.</li>
              <li>Rejections on stock marketplaces resulting from unrelated stock agency policy guidelines (e.g., photo quality, intellectual property rights, non-metadata review reasons).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              4. How to Request a Refund or Support
            </h2>
            <p>
              To request assistance or submit a refund request, please contact our support desk with your license key or order transaction ID:
            </p>
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 text-sm space-y-1">
              <p><strong>WhatsApp Support (Fastest):</strong> +92 329 7090888</p>
              <p><strong>Email Support:</strong> <a href="mailto:salmangraphics839@gmail.com" className="text-primary hover:underline">salmangraphics839@gmail.com</a></p>
              <p><strong>Response Time:</strong> Typically within 2 to 6 hours.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
