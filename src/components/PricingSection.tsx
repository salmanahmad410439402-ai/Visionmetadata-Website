import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    duration: "1 Month",
    originalPkr: 499,
    newPkr: 499,
    originalUsd: 1.75,
    newUsd: 1.75,
    discount: null,
    highlighted: false,
  },
  {
    name: "Creator",
    duration: "3 Months",
    originalPkr: 1497,
    newPkr: 1272,
    originalUsd: 5.25,
    newUsd: 4.46,
    discount: 15,
    highlighted: false,
  },
  {
    name: "Pro",
    duration: "6 Months",
    originalPkr: 2995,
    newPkr: 2246,
    originalUsd: 10.51,
    newUsd: 7.88,
    discount: 25,
    highlighted: false,
  },
  {
    name: "Studio",
    duration: "1 Year",
    originalPkr: 5988,
    newPkr: 3892,
    originalUsd: 21.02,
    newUsd: 13.66,
    discount: 35,
    highlighted: true,
  },
];

const PricingSection = () => {
  const [currency, setCurrency] = useState<"PKR" | "USD">("PKR");

  const getWhatsAppMessage = (planName: string, cur: "PKR" | "USD") => {
    const plan = plans.find((p) => p.name === planName)!;
    const price = cur === "PKR" ? `Rs ${plan.newPkr.toLocaleString()}` : `$${plan.newUsd}`;
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
        <p className="text-center text-sm font-semibold mb-10" style={{ color: "#1ba6dd" }}>
          🔥 Limited Time: This discount is only for the first 300 lucky users!
        </p>

        {/* Currency toggle */}
        <div className="flex justify-center mb-14">
          <div className="inline-flex rounded-xl bg-card border border-border p-1">
            {(["PKR", "USD"] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${currency === cur
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 border transition-all duration-300 ${plan.highlighted
                ? "bg-card border-primary shadow-[0_0_40px_hsl(190_95%_50%/0.12)]"
                : "bg-card border-border hover:border-primary/30"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Best Value
                </div>
              )}

              <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.duration}</p>

              {/* Discount badge */}
              {plan.discount && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                  style={{ backgroundColor: "rgba(27, 166, 221, 0.15)", color: "#1ba6dd" }}
                >
                  Save {plan.discount}%
                </span>
              )}

              <div className="mb-6">
                {plan.discount ? (
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
                        ? `₨${plan.newPkr.toLocaleString()}`
                        : `$${plan.newUsd}`}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-foreground">
                    {currency === "PKR"
                      ? `₨${plan.newPkr.toLocaleString()}`
                      : `$${plan.newUsd}`}
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {["Platform-ready CSVs for Adobe, SS, DT & Freepik", "Full metadata generation", "Bulk processing", "Embed into files"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <a
                  href="#contact"
                  className={`flex-1 block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 ${plan.highlighted
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
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Early adopter pricing — prices will increase as features expand.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;