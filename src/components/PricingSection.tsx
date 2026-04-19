import { useState, useEffect } from "react";
import { Check, Clock } from "lucide-react";

const TRIAL_END = new Date("2026-03-22T15:40:21.162Z");

const plans = [
  {
    name: "Starter",
    duration: "1 Month",
    originalPkr: 499,
    originalUsd: 1.75,
    eidPkr: 499,
    eidUsd: 1.75,
    postEidPkr: 499,
    postEidUsd: 1.75,
    eidDiscount: null,
    postEidDiscount: null,
    highlighted: false,
  },
  {
    name: "Creator",
    duration: "3 Months",
    originalPkr: 1497,
    originalUsd: 5.25,
    eidPkr: 1272,
    eidUsd: 4.46,
    postEidPkr: 1347,
    postEidUsd: 4.73,
    eidDiscount: 15,
    postEidDiscount: 10,
    highlighted: false,
  },
  {
    name: "Pro",
    duration: "6 Months",
    originalPkr: 2995,
    originalUsd: 10.51,
    eidPkr: 2246,
    eidUsd: 7.88,
    postEidPkr: 2546,
    postEidUsd: 8.93,
    eidDiscount: 25,
    postEidDiscount: 15,
    highlighted: false,
  },
  {
    name: "Studio",
    duration: "1 Year",
    originalPkr: 5988,
    originalUsd: 21.02,
    eidPkr: 3892,
    eidUsd: 13.66,
    postEidPkr: 4790,
    postEidUsd: 16.82,
    eidDiscount: 35,
    postEidDiscount: 20,
    highlighted: true,
  },
];

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

const getTimeLeft = (): TimeLeft => {
  const diff = TRIAL_END.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

const PricingSection = () => {
  const [currency, setCurrency] = useState<"PKR" | "USD">("PKR");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isExpired = timeLeft.expired;

  const getWhatsAppMessage = (planName: string, cur: "PKR" | "USD") => {
    const plan = plans.find((p) => p.name === planName)!;
    const price = cur === "PKR"
      ? `Rs ${(isExpired ? plan.postEidPkr : plan.eidPkr).toLocaleString()}`
      : `$${isExpired ? plan.postEidUsd : plan.eidUsd}`;
    return encodeURIComponent(
      `Hi, I want to subscribe to the ${planName} plan for ${price}.`
    );
  };

  return (
    <section id="pricing" className="pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-6">
          Simple Pricing
        </h2>
        <p className="text-center text-tertiary mb-12 max-w-xl mx-auto">
          Choose a plan that fits your workflow
        </p>

        {/* Platform logos */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-12">
          {["Adobe Stock", "Shutterstock", "Dreamstime", "Freepik"].map((name) => (
            <span
              key={name}
              className="text-xs uppercase tracking-wider font-semibold text-minimal"
            >
              {name}
            </span>
          ))}
        </div>

        {/* ─── EID COUNTDOWN / EXPIRED BANNER ─── */}
        {/* Discount banners removed */}
        {/* ─── END BANNER ─── */}

        {/* Currency toggle */}
        <div className="flex justify-center mb-20">
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
        </div>

        {/* ─── PLAN CARDS ─── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const currentDiscount = isExpired ? plan.postEidDiscount : plan.eidDiscount;
            const currentPkr      = isExpired ? plan.postEidPkr      : plan.eidPkr;
            const currentUsd      = isExpired ? plan.postEidUsd      : plan.eidUsd;

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  plan.highlighted
                    ? "bg-card-primary border-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                    : "bg-card-primary border-card-primary hover:border-primary/40 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap">
                    Best Value
                  </div>
                )}

                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-quaternary mb-4">{plan.duration}</p>

                {/* Discount badges */}
                {currentDiscount && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-info-light text-info">
                      Save {currentDiscount}%
                    </span>
                    {!isExpired && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        🎉 Eid Price
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-6">
                  {currentDiscount ? (
                    <>
                      <span className="block text-lg font-semibold line-through mb-1 text-minimal-low">
                        {currency === "PKR"
                          ? `₨${plan.originalPkr.toLocaleString()}`
                          : `$${plan.originalUsd}`}
                      </span>
                      <span className="text-4xl font-black text-info">
                        {currency === "PKR"
                          ? `₨${currentPkr.toLocaleString()}`
                          : `$${currentUsd}`}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-black text-foreground">
                      {currency === "PKR"
                        ? `₨${currentPkr.toLocaleString()}`
                        : `$${currentUsd}`}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {[
                    "Platform-ready CSVs for Adobe, SS, DT & Freepik",
                    "Full metadata generation",
                    "Bulk processing",
                    "Embed into files",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-tertiary">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex gap-2">
                  <a
                    href="#contact"
                    className={`flex-1 block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    Get {plan.name}
                  </a>
                  <a
                    href={`https://wa.me/9203297409088?text=${getWhatsAppMessage(plan.name, currency)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all duration-200"
                    title={`Ask about ${plan.name} on WhatsApp`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-14">
          Early adopter pricing — prices will increase as features expand.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
