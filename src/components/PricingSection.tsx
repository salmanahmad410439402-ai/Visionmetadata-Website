import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Copy, Check as CheckIcon } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { CARD_CHECKOUT, makeOrderReference, mailLink, waLink } from "@/config/commerce";

/**
 * Pricing section.
 *
 * WHAT CHANGED AND WHY
 * The previous version ran a countdown timer against a hard-coded date of
 * 2026-03-22 that had been in the past for months, and drove its displayed
 * prices from that clock. So every visitor saw:
 *
 *   • a price rendered in a "discounted" red with the full price struck through
 *     beside it, and
 *   • nothing anywhere explaining why, because the explanatory "Eid Price" badge
 *     was itself gated behind the expired timer.
 *
 * That is a struck-through reference price with no stated basis, which is a
 * misleading commercial practice and the kind of thing a review flags. The
 * discount machinery and the dead Eid campaign are gone; there is now one price
 * per plan and one honest line about pricing.
 *
 * Ordering is also explicit now: each card carries a stable order reference, so
 * a buyer can quote something specific instead of just "the $4.73 one".
 */

interface Plan {
  name: string;
  duration: string;
  months: number;
  priceUsd: number;
  pricePkr: number;
  highlighted?: boolean;
  color: string;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    duration: "1 month",
    months: 1,
    priceUsd: 1.75,
    pricePkr: 499,
    color: "#94a3b8",
  },
  {
    name: "Creator",
    duration: "3 months",
    months: 3,
    priceUsd: 4.73,
    pricePkr: 1347,
    color: "#4F46E5",
  },
  {
    name: "Pro",
    duration: "6 months",
    months: 6,
    priceUsd: 8.93,
    pricePkr: 2546,
    color: "#10B981",
  },
  {
    name: "Studio",
    duration: "12 months",
    months: 12,
    priceUsd: 16.82,
    pricePkr: 4790,
    highlighted: true,
    color: "hsl(var(--primary))",
  },
];

const FEATURES = [
  "Native file metadata embedding",
  "CSV exports for Adobe, SS, DT & Freepik",
  "Full metadata generation, any file type",
  "Batch processing with parallel workers",
  "Trademark flagging and confidence scores",
];

const PricingSection = () => {
  const [currency, setCurrency] = useState<"PKR" | "USD">("USD");
  const [selected, setSelected] = useState<Plan>(PLANS[3]);

  // One reference per page load, regenerated when the buyer switches plan, so
  // the message they send us matches the plan they are looking at.
  const orderRef = useMemo(() => makeOrderReference(), [selected.name]);

  const ref = useReveal();

  const priceLabel = (plan: Plan) =>
    currency === "PKR" ? `Rs ${plan.pricePkr.toLocaleString()}` : `$${plan.priceUsd.toFixed(2)}`;

  const orderMessage = `Hi, I would like to order Tagyfy Pro.
Order reference: ${orderRef}
Plan: ${selected.name} (${selected.duration})
Price shown: ${priceLabel(selected)} (${currency})

I have read the refund policy. Please send me the payment details.`;

  return (
    <section id="pricing" className="pt-24 pb-16 px-6" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
          Tagyfy Pro pricing
        </h1>
        <p className="text-center text-secondary mb-10 max-w-2xl mx-auto">
          One-off payment for a fixed licence period. No subscription, no auto-renewal, and the
          desktop app is free to evaluate for 3 days before you decide.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 mb-14">
          {["Adobe Stock", "Shutterstock", "Dreamstime", "Freepik"].map((name) => (
            <span
              key={name}
              className="text-xs uppercase tracking-wider font-semibold text-minimal"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Free extension cross-sell */}
        <Link
          to="/chrome-extension"
          className="reveal mb-16 flex flex-col sm:flex-row items-center sm:items-start gap-5 glass-panel rounded-3xl p-5 sm:px-8 max-w-2xl mx-auto transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group border-primary/20 hover:border-primary/50"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 z-10 relative group-hover:scale-110 transition-transform">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center sm:text-left z-10 relative">
            <p className="text-xl font-black text-foreground tracking-tight">
              There is also a free extension
            </p>
            <p className="text-sm text-secondary mt-1.5 leading-relaxed">
              The Adobe Stock browser extension fills titles and keywords inside the contributor
              dashboard. It is free and needs no licence key.
            </p>
          </div>
        </Link>

        {/* Currency toggle — label makes it clear nothing about the price changes */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex rounded-xl bg-card-primary border border-card-primary p-1">
            {(["PKR", "USD"] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  currency === cur
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-quaternary hover:text-secondary"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Display currency only — this is the same price, not a conversion or a discount.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const isSelected = selected.name === plan.name;

            return (
              <div
                key={plan.name}
                style={{ "--card-color": plan.color } as React.CSSProperties}
                className={`reveal relative rounded-3xl p-6 sm:p-8 transition-all duration-300 overflow-hidden neon-hover-card glass-panel ${
                  plan.highlighted ? "transform md:-translate-y-4" : ""
                } ${isSelected ? "ring-2 ring-primary/60" : ""}`}
              >
                {plan.highlighted && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-400 via-indigo-500 to-emerald-400" />
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-black uppercase px-4 py-1.5 rounded-bl-xl shadow-sm z-10">
                      Longest term
                    </div>
                  </>
                )}

                <h2 className="text-xl font-bold mb-1 text-foreground">{plan.name}</h2>
                <p className="text-sm text-secondary font-medium mb-4">{plan.duration}</p>

                <div className="mb-2">
                  <span className="text-4xl font-black text-foreground">{priceLabel(plan)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  about {(plan.priceUsd / plan.months).toFixed(2)} USD per month
                </p>

                <ul className="space-y-4 mb-6">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-secondary font-medium">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    setSelected(plan);
                    document
                      .getElementById("order")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`w-full flex items-center justify-center py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    plan.highlighted
                      ? "btn-shimmer border border-primary/50"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {isSelected ? "Selected — continue below" : `Choose ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Order panel — replaces the bare WhatsApp buttons that sat on every
            card. This is where the reference, the plan and the next step are
            brought together. */}
        <div
          id="order"
          className="reveal mt-14 scroll-mt-24 glass-panel rounded-3xl p-6 sm:p-10 border border-primary/25"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Ready to order {selected.name}?
          </h2>
          <p className="text-sm text-secondary leading-relaxed mb-8 max-w-2xl">
            Send the message below and we will reply with the payment details for your plan. You get
            a licence key and a receipt once the payment is confirmed. Nothing is charged
            automatically and no card details are ever asked for.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl border border-card-primary bg-card-primary p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-tertiary mb-1">
                Your order reference
              </p>
              <div className="flex items-center gap-3">
                <p className="text-lg font-mono font-bold text-foreground">{orderRef}</p>
                <button
                  onClick={() => navigator.clipboard?.writeText(orderRef)}
                  className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                  aria-label="Copy order reference"
                  title="Copy order reference"
                >
                  <Copy className="w-4 h-4 text-primary" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Quote this in your message. It is how we match your payment to your order and issue
                the right licence.
              </p>
            </div>

            <div className="rounded-2xl border border-card-primary bg-card-primary p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-tertiary mb-1">
                Selected plan
              </p>
              <p className="text-lg font-bold text-foreground">
                {selected.name} · {selected.duration}
              </p>
              <p className="text-sm text-secondary mt-1">{priceLabel(selected)} one-off</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Not the right term? Pick a different card above and this updates. You can also ask
                us before paying.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={waLink(orderMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold btn-shimmer border border-primary/50 hover:scale-[1.01] transition-transform"
            >
              Continue on WhatsApp
            </a>
            <a
              href={mailLink(
                `Tagyfy Pro order ${orderRef} — ${selected.name}`,
                orderMessage
              )}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold border border-card-secondary hover:border-primary transition-colors text-foreground"
            >
              Continue by e-mail
            </a>
          </div>

          {CARD_CHECKOUT ? (
            <a
              href={CARD_CHECKOUT}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold border border-primary/40 hover:border-primary transition-colors"
            >
              Or pay by card
            </a>
          ) : (
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Card payment is not available yet, so this order is completed by bank transfer or
              mobile wallet. That means no chargeback protection — if that matters to you, use the
              3-day trial first. Full terms are on the{" "}
              <Link to="/refund-policy" className="text-primary underline hover:text-primary/80">
                refund policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-primary underline hover:text-primary/80">
                terms
              </Link>{" "}
              pages.
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-6 flex items-start gap-2">
            <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>
              Prefer to try before ordering? The desktop app includes a full 3-day trial with no
              card required — see the{" "}
              <Link to="/download" className="text-primary underline hover:text-primary/80">
                download page
              </Link>
              .
            </span>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12 leading-relaxed max-w-2xl mx-auto">
          Prices are shown in USD and PKR as two independent prices, not a currency conversion.
          Current pricing applies to new orders; existing licences are unaffected by later price
          changes.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
