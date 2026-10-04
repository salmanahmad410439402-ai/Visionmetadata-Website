import { ShieldCheck, Timer, KeyRound, RefreshCcw } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const guarantees = [
  {
    icon: Timer,
    title: "3-Day Free Trial",
    desc: "Every plan starts with a full-access trial. No credit card required to test the complete feature set.",
  },
  {
    icon: KeyRound,
    title: "Instant License Delivery",
    desc: "Keys are generated and sent within minutes of payment confirmation — no waiting on business hours.",
  },
  {
    icon: RefreshCcw,
    title: "7-Day Technical Refund",
    desc: "If our team can't resolve a technical incompatibility within 7 days of purchase, you get a full refund.",
  },
  {
    icon: ShieldCheck,
    title: "One License, One Device",
    desc: "Simple, transparent licensing. No recurring charges, no auto-renewal surprises, ever.",
  },
];

/**
 * PricingGuarantees — pricing-page-exclusive trust content. Replaces the
 * old approach of re-rendering the full homepage Testimonials block here,
 * which duplicated body content between / and /pricing.
 */
const PricingGuarantees = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="reveal reveal-delay-1 text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Buy with Confidence
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-tertiary">
            Straightforward terms for every license, with no hidden conditions.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map(({ icon: Icon, title, desc }, i) => (
            <div key={title}
              className={`reveal reveal-delay-${i + 1} glass-panel rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)]`}>
              <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-tertiary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingGuarantees;
