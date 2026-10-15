import { CreditCard, ChevronDown, Copy, Check, Lock, Building2 } from "lucide-react";
import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import {
  CARD_CHECKOUT,
  ORDER_STEPS,
  PAYMENT_RAILS,
  type PaymentRail,
} from "@/config/commerce";

/**
 * PaymentMethods — the checkout half of the pricing page.
 *
 * Rewritten from a grid of four cards that simply printed account numbers. The
 * problems with that version were not the numbers themselves — a bank transfer
 * is a legitimate way to pay in Pakistan — but everything around them:
 *
 *   • No seller identity, no order process and no receipt, so a buyer had no
 *     record of what they had paid for.
 *   • Account details disclosed in full to every visitor and every crawler,
 *     which is how payment-detail phishing starts.
 *   • Delivery promises that contradicted the rest of the page.
 *
 * The details are still published — they have to be, for a transfer to be
 * possible — but behind a deliberate reveal, alongside the account title on
 * every rail so a buyer can verify who they are paying, and under an explicit
 * warning about impersonation.
 */

const PaymentRailCard = ({ rail }: { rail: PaymentRail }) => {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard can be blocked; the value is visible either way.
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 border-card-primary">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-foreground">{rail.label}</h3>
          <p className="text-xs text-secondary mt-1 leading-relaxed">{rail.description}</p>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
          {rail.region}
        </span>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-card-secondary hover:border-primary transition-colors text-sm font-semibold text-foreground"
      >
        <span className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-primary" />
          {open ? "Hide account details" : "Show account details"}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {rail.fields.map(({ label, value, copyable }) => (
            <div key={label} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-card-primary">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1 text-tertiary">
                  {label}
                </p>
                <p className="text-sm font-mono text-foreground break-all">{value}</p>
              </div>
              {copyable && (
                <button
                  onClick={() => copy(value, `${rail.id}-${label}`)}
                  className="shrink-0 p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  aria-label={`Copy ${label}`}
                  title={`Copy ${label}`}
                >
                  {copiedId === `${rail.id}-${label}` ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary" />
                  )}
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground leading-relaxed">{rail.note}</p>
        </div>
      )}
    </div>
  );
};

const PaymentMethods = () => {
  const ref = useReveal();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-8 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 accent-indigo-light accent-indigo-border-soft">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Ordering &amp; Payment
            </span>
          </div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            How ordering works
          </h2>
          <p className="reveal reveal-delay-2 text-base sm:text-lg max-w-2xl mx-auto text-secondary">
            There is no checkout account to create and nothing is stored on a Tagyfy server. You
            pick a plan, pay through a rail you already use, and we send the licence key.
          </p>
        </div>

        {/* Card checkout, once configured. Rendered ahead of the manual rails so
            the strongest buyer protection is the first thing offered. */}
        {CARD_CHECKOUT ? (
          <div className="reveal glass-panel rounded-2xl border border-primary/30 p-6 sm:p-8 mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <h3 className="font-bold text-foreground mb-1">Pay by card (recommended)</h3>
                <p className="text-sm text-secondary leading-relaxed max-w-xl">
                  Processed by our merchant of record. Card details are handled entirely by the
                  payment provider and never reach us, and you get the dispute protection that comes
                  with a card transaction.
                </p>
              </div>
              <a
                href={CARD_CHECKOUT}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold btn-shimmer border border-primary/50 hover:scale-[1.02] transition-transform"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay by card
              </a>
            </div>
          </div>
        ) : (
          <div className="reveal rounded-2xl border border-card-primary bg-card-primary p-6 mb-12">
            <h3 className="font-bold text-foreground mb-2">Card payment is not available yet</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Bank transfer and mobile wallet are the only options today, which means there is no
              chargeback protection on a purchase. Use the free trial first and only buy when you
              are satisfied with the software — that is the only protection we can offer in the
              meantime. A hosted card checkout is in progress.
            </p>
          </div>
        )}

        {/* The order process, in order. */}
        <div className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {ORDER_STEPS.map(({ title, body }, i) => (
            <div key={title} className="rounded-2xl border border-card-primary bg-card-primary p-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center mb-4">
                {i + 1}
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-secondary">{body}</p>
            </div>
          ))}
        </div>

        <h3 className="reveal text-lg font-bold text-foreground mb-5 text-center">
          Payment rails
        </h3>
        <div className="reveal grid md:grid-cols-2 gap-5 mb-10">
          {PAYMENT_RAILS.map((rail) => (
            <PaymentRailCard key={rail.id} rail={rail} />
          ))}
        </div>

        <div className="reveal glass-panel rounded-2xl p-6 border-card-primary">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-secondary leading-relaxed">
              Every manual payment is recorded against your order reference, and a receipt is issued
              for each completed order. If a payment does not appear to have gone through, send us
              the transaction ID rather than paying again — double payments are refunded immediately
              under our{" "}
              <a href="/refund-policy" className="text-primary underline hover:text-primary/80">
                refund policy
              </a>
              .
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PaymentMethods;
