import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Clock, Gift, Sparkles } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

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
  const [currency, setCurrency] = useState<"PKR" | "USD">("USD");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const ref = useReveal();

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
    <section id="pricing" className="pt-24 pb-16 px-6" ref={ref as React.RefObject<HTMLElement>}>
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

        {/* ─── CHROME EXTENSION 100% FREE BANNER ─── */}
        <Link to="/chrome-extension" className="reveal mt-8 mb-16 flex flex-col sm:flex-row items-center sm:items-start gap-5 glass-panel rounded-3xl p-5 sm:px-8 max-w-2xl mx-auto transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group border-primary/20 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 bg-green-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm z-10">
            100% FREE EXTENSION
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-inner z-10 relative mt-2 sm:mt-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center sm:text-left mt-2 sm:mt-0 z-10 relative">
            <p className="text-xl font-black text-foreground tracking-tight flex items-center justify-center sm:justify-start gap-2">
              Looking for Browser Automation?
              <span className="text-sm text-primary font-bold hidden sm:inline-block group-hover:translate-x-1 transition-transform">→</span>
            </p>
            <p className="text-sm text-secondary mt-1.5 leading-relaxed">The Tagyfy Pro Chrome Extension for Adobe Stock is completely <strong>100% FREE</strong> for all contributors. No license key needed!</p>
            <p className="text-xs font-bold text-green-400 mt-2.5 flex items-center justify-center sm:justify-start gap-1.5">
              <Check className="w-3.5 h-3.5" /> Direct In-Browser Tagging • Update Approved Assets • Free Forever
            </p>
          </div>
        </Link>
        {/* ─── END FREE EXTENSION BANNER ─── */}

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

            // Give each plan its own neon color
            const planColors: Record<string, string> = {
              Starter: "#94a3b8",   // slate
              Creator: "#4F46E5",   // indigo
              Pro:     "#10B981",   // mint
              Studio:  "hsl(var(--primary))", // brand purple (highlighted)
            };
            const planColor = planColors[plan.name] ?? "hsl(var(--primary))";

            return (
              <div
                key={plan.name}
                style={{ '--card-color': planColor } as React.CSSProperties}
                className={`reveal relative rounded-3xl p-6 sm:p-8 transition-all duration-300 overflow-hidden neon-hover-card ${
                  plan.highlighted
                    ? "glass-panel transform md:-translate-y-4"
                    : "glass-panel"
                }`}
              >
                {plan.highlighted && (
                  <>
                    {/* Top gradient accent line — sits inside overflow-hidden so it respects rounded corners */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-400 via-indigo-500 to-emerald-400 animate-pulse" />
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-black uppercase px-4 py-1.5 rounded-bl-xl shadow-sm z-10">
                      Most Popular
                    </div>
                  </>
                )}

                <h3 className={`text-xl font-bold mb-1 neon-title transition-colors ${plan.highlighted ? 'text-gradient text-2xl' : 'text-foreground'}`}>{plan.name}</h3>
                <p className="text-sm text-secondary font-medium mb-4">{plan.duration}</p>

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
                <ul className="space-y-4 mb-6 mt-4">
                  <li className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-3 py-2 rounded-lg mb-4 border border-primary/20">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    Native File Metadata Embedding
                  </li>
                  {[
                    "Platform-ready CSVs for Adobe, SS, DT & Freepik",
                    "Full metadata generation",
                    "Bulk processing",
                    "Embed into files",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-secondary font-medium">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/9203297409088?text=${getWhatsAppMessage(plan.name, currency)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      plan.highlighted
                        ? "btn-shimmer shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] border border-primary/50"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
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
