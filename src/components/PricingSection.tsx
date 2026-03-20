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
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
          Simple Pricing
        </h2>
        <p className="text-center text-muted-foreground mb-4 max-w-xl mx-auto">
          Choose a plan that fits your workflow
        </p>

        {/* Platform logos */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
          {["Adobe Stock", "Shutterstock", "Dreamstime", "Freepik"].map((name) => (
            <span
              key={name}
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {name}
            </span>
          ))}
        </div>

        {/* Scarcity banner */}
        <p className="text-center text-sm font-semibold mb-6" style={{ color: "#1ba6dd" }}>
          🔥 Limited Time: This discount is only for the first 300 lucky users!
        </p>

        {/* ─── EID COUNTDOWN / EXPIRED BANNER ─── */}
        {!isExpired ? (
          <div
            className="relative mx-auto max-w-2xl mb-10 rounded-2xl overflow-hidden border"
            style={{
              borderColor: "rgba(27,166,221,0.4)",
              background: "linear-gradient(135deg, rgba(27,166,221,0.08) 0%, rgba(10,70,123,0.18) 100%)",
            }}
          >
            <div className="flex justify-center pt-4">
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                style={{ backgroundColor: "rgba(27,166,221,0.18)", color: "#1ba6dd", border: "1px solid rgba(27,166,221,0.35)" }}
              >
                🎉 Eid Special Discount — Limited Time Only
              </span>
            </div>

            <div className="px-6 py-5 text-center">
              <p className="text-sm text-white/70 mb-4 font-medium">
                These discounted prices{" "}
                <span className="text-white font-bold">expire when the timer hits zero.</span>{" "}
                After that, prices go back to standard rates.
              </p>

              {/* Countdown timer */}
              <div className="flex justify-center items-center gap-2 sm:gap-4">
                {[
                  { label: "Days",  value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Mins",  value: timeLeft.minutes },
                  { label: "Secs",  value: timeLeft.seconds },
                ].map(({ label, value }, i) => (
                  <div key={label} className="flex items-center gap-2 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black"
                        style={{
                          background: "rgba(27,166,221,0.15)",
                          border: "1px solid rgba(27,166,221,0.3)",
                          color: "#1ba6dd",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {pad(value)}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-semibold">
                        {label}
                      </span>
                    </div>
                    {i < 3 && (
                      <span className="text-2xl font-black mb-4" style={{ color: "rgba(27,166,221,0.5)" }}>
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <Clock className="w-3.5 h-3.5" style={{ color: "#1ba6dd" }} />
                <p className="text-xs font-semibold" style={{ color: "#1ba6dd" }}>
                  Lock in your Eid price before the timer runs out!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ─── EXPIRED: post-Eid notice ─── */
          <div
            className="relative mx-auto max-w-2xl mb-10 rounded-2xl border px-6 py-5 text-center"
            style={{
              borderColor: "rgba(255,160,0,0.3)",
              background: "rgba(255,160,0,0.06)",
            }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: "#ffaa00" }}>
              ⏰ The Eid special discount has ended.
            </p>
            <p className="text-xs text-white/50">
              Standard discounted pricing is still available — but Eid rates are no longer active.
            </p>
          </div>
        )}
        {/* ─── END BANNER ─── */}

        {/* Currency toggle */}
        <div className="flex justify-center mb-14">
          <div className="inline-flex rounded-xl bg-card border border-border p-1">
            {(["PKR", "USD"] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currency === cur
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
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
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_hsl(190_95%_50%/0.15)] ${
                  plan.highlighted
                    ? "bg-card border-primary shadow-[0_0_40px_hsl(190_95%_50%/0.12)]"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap">
                    Best Value
                  </div>
                )}

                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.duration}</p>

                {/* Discount badges */}
                {currentDiscount && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: "rgba(27,166,221,0.15)", color: "#1ba6dd" }}
                    >
                      Save {currentDiscount}%
                    </span>
                    {!isExpired && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse"
                        style={{ backgroundColor: "rgba(255,160,0,0.15)", color: "#ffaa00", border: "1px solid rgba(255,160,0,0.3)" }}
                      >
                        🎉 Eid Price
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-6">
                  {currentDiscount ? (
                    <>
                      <span
                        className="block text-lg font-semibold line-through mb-1"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {currency === "PKR"
                          ? `₨${plan.originalPkr.toLocaleString()}`
                          : `$${plan.originalUsd}`}
                      </span>
                      <span className="text-4xl font-black" style={{ color: "#1ba6dd" }}>
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
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex gap-2">
                  <a
                    href="#contact"
                    className={`flex-1 block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(190_95%_50%/0.3)] hover:shadow-[0_0_30px_hsl(190_95%_50%/0.45)]"
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

        <p className="text-center text-xs text-muted-foreground mt-10">
          Early adopter pricing — prices will increase as features expand.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
