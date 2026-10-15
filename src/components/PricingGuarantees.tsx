import { Banknote, ShieldAlert, Mail } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import {
  CARD_CHECKOUT,
  FRAUD_NOTICE,
  SELLER,
  mailLink,
  waLink,
} from "@/config/commerce";

/**
 * PricingGuarantees — pricing-page trust content.
 *
 * The previous version of this block promised keys "within minutes" while the
 * payment panel further down the same page said licence activation took "within
 * 24 hours". Two different delivery promises on one page is the kind of detail a
 * reviewer notices, so each claim here now matches the one in commerce config.
 */
const guarantees = [
  {
    title: "Try it before you pay",
    desc: "The desktop build runs a full-access 3-day trial with no card on file. Judge the output on your own files first.",
  },
  {
    title: "One-time payment",
    desc: "A licence covers a fixed period. Nothing renews automatically and there is no subscription to cancel.",
  },
  {
    title: "One licence, one device",
    desc: "Stated up front rather than buried in the terms. Moving to a new computer? Ask support and we will sort it out.",
  },
  {
    title: "A receipt for every order",
    desc: "Each payment gets an order reference and a receipt you can keep for your records, available on request.",
  },
];

const PricingGuarantees = () => {
  const ref = useReveal();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="reveal reveal-delay-1 text-2xl sm:text-3xl font-bold text-foreground mb-3">
            What you are agreeing to
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-tertiary">
            The terms in plain language, before you send any money.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map(({ title, desc }, i) => (
            <div
              key={title}
              className={`reveal reveal-delay-${i + 1} glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.2)]`}
            >
              <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-tertiary">{desc}</p>
            </div>
          ))}
        </div>

        {/* Who you are buying from. This was previously missing entirely: a buyer
            saw account numbers and nothing identifying the seller. */}
        <div className="reveal mt-10 rounded-2xl border border-card-primary bg-card-primary p-6 sm:p-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Who you are buying from</h3>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="text-secondary leading-relaxed">
                {SELLER.brand} is an independent software project written and maintained by{" "}
                <strong className="text-foreground">{SELLER.operator}</strong>, a stock contributor
                and designer based in {SELLER.country}. It is not a company with a sales team —
                support is handled by the same person who builds the app.
              </p>
              <p className="text-secondary leading-relaxed">
                Support hours: {SELLER.supportHours}
              </p>
            </div>
            <div className="space-y-3">
              <a
                href={mailLink(
                  "Tagyfy Pro — question before purchase",
                  "Hi,\n\nI have a question about Tagyfy Pro before buying:\n\n\n"
                )}
                className="flex items-center gap-3 p-3 rounded-xl border border-card-secondary hover:border-primary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-secondary">
                  E-mail: <strong className="text-foreground break-all">{SELLER.supportEmail}</strong>
                </span>
              </a>
              <a
                href={waLink("Hi, I have a question about Tagyfy Pro before buying.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-card-secondary hover:border-primary transition-colors"
              >
                <Banknote className="w-4 h-4 text-primary shrink-0" />
                <span className="text-secondary">
                  WhatsApp: <strong className="text-foreground">{SELLER.whatsappDisplay}</strong>
                </span>
              </a>
              {!CARD_CHECKOUT && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Card payment is not available yet. Payments are currently by bank transfer or
                  mobile wallet, which means you get no chargeback protection — so use the free
                  trial first, and only buy once you are satisfied.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-amber-500">{FRAUD_NOTICE}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingGuarantees;
