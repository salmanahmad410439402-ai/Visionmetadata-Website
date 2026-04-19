import { CreditCard, Banknote, DollarSign, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const PaymentMethods = () => {
  const ref = useReveal();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const methods = [
    {
      icon: Banknote,
      name: "RAAST ID (Pakistan)",
      desc: "Fast bank transfer via RAAST system",
      details: [
        { label: "RAAST ID", value: "03297409088" },
        { label: "RAAST IBAN", value: "PK48JCMA1409923297409088" },
      ],
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: CreditCard,
      name: "JazzCash (Pakistan)",
      desc: "Mobile payment - instant transfer",
      details: [
        { label: "Account Number", value: "0329 7409088" },
        { label: "Account Name", value: "Salman Ahmad" },
      ],
      color: "from-orange-500/20 to-red-500/20",
    },
    {
      icon: DollarSign,
      name: "Meezan Bank (Pakistan)",
      desc: "Direct bank transfer",
      details: [
        { label: "Account ID", value: "50010112691566" },
        { label: "Account Name", value: "Salman Ahmad" },
      ],
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: DollarSign,
      name: "Skrill (International)",
      desc: "Global payment & remittance",
      details: [
        { label: "Email", value: "salmangraphics839@gmail.com" },
      ],
      color: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-8 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ background: "hsl(190 95% 50% / 0.08)", borderColor: "hsl(190 95% 50% / 0.2)" }}>
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Payment Methods</span>
          </div>

          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-bold mb-4">
            Multiple Ways to Pay
          </h2>

          <p className="reveal reveal-delay-2 text-lg max-w-2xl mx-auto text-secondary">
            Choose the payment method that works best for you. All payments are secure and processed promptly.
          </p>
        </div>

        {/* Payment Cards Grid */}
        <div className="reveal reveal-delay-3 grid md:grid-cols-2 gap-6 mb-12">
          {methods.map(({ icon: Icon, name, desc, details, color }, idx) => (
            <div key={name} className={`reveal reveal-delay-${(idx % 4) + 1} rounded-2xl border p-7 overflow-hidden group hover:border-primary/50 transition-all duration-300 bg-card-primary border-card-primary`}
              style={{ background: `linear-gradient(135deg, ${color.split(" ")[1]}, ${color.split(" ")[3]}) hsl(220 40% 8%)` }}>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent-cyan-subtle">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{name}</h3>
                  <p className="text-xs text-secondary">{desc}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                {details.map(({ label, value }) => (
                  <div key={value} className="flex items-center justify-between p-3 rounded-lg bg-card-primary">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-1 text-tertiary">{label}</p>
                      <p className="text-sm font-mono text-foreground truncate">{value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(value, value)}
                      className="ml-3 p-2 rounded-lg hover:bg-primary/10 transition-colors flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      {copiedId === value ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="reveal rounded-2xl border p-6 text-center bg-accent-cyan-subtle border-accent-cyan-subtle">
          <p className="text-sm text-secondary">
            💡 <span className="font-semibold">Tip:</span> All payment details are verified and secure. Please double-check account information before sending payments. Your account will be activated within 24 hours of successful payment.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PaymentMethods;
