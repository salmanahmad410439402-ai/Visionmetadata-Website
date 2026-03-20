import { MessageCircle, CreditCard, Send, Camera, KeyRound, Mail } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const ContactSection = () => {
  const ref = useReveal();
  return (
    <section id="contact" ref={ref as React.RefObject<HTMLElement>} className="py-24 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ background: "hsl(190 95% 50% / 0.07)", borderColor: "hsl(190 95% 50% / 0.2)", color: "hsl(190 95% 65%)" }}>
            Contact & Licensing
          </div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Get Your License Key
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto" style={{ color: "hsl(215 20% 65%)" }}>
            Purchase a plan and receive your personal license key within minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Contact card */}
          <div className="reveal card-lift card-glow rounded-2xl border p-8"
            style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Get in Touch
            </h3>
            <div className="space-y-5 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "hsl(215 20% 52%)" }}>WhatsApp</span>
                <a href="https://wa.me/923297409088" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-1 font-medium text-foreground hover:text-primary transition-colors duration-200">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500 flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  +92 329 7090888
                </a>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "hsl(215 20% 52%)" }}>Email</span>
                <a href="mailto:salmangraphics839@gmail.com"
                  className="flex items-center gap-2 mt-1 font-medium text-foreground hover:text-primary transition-colors duration-200">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  salmangraphics839@gmail.com
                </a>
              </div>
              <p className="text-xs pt-3 border-t" style={{ color: "hsl(215 20% 52%)", borderColor: "hsl(220 30% 16%)" }}>
                License keys delivered within minutes on WhatsApp after payment confirmation.
              </p>
            </div>
          </div>

          {/* Payment card */}
          <div className="reveal reveal-delay-1 card-lift card-glow rounded-2xl border p-8"
            style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Methods
            </h3>
            <div className="space-y-5 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "hsl(215 20% 52%)" }}>JazzCash (Pakistan)</span>
                <p className="font-medium font-mono text-foreground mt-1">0329 7409088</p>
                <p className="text-xs" style={{ color: "hsl(215 20% 58%)" }}>Salman Ahmad</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "hsl(215 20% 52%)" }}>Meezan Bank (Pakistan)</span>
                <p className="font-medium font-mono text-foreground mt-1">50010112691566</p>
                <p className="text-xs" style={{ color: "hsl(215 20% 58%)" }}>Salman Ahmad</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "hsl(215 20% 52%)" }}>Skrill (International)</span>
                <p className="font-medium text-foreground mt-1">salmangraphics839@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="reveal reveal-delay-2 rounded-2xl border p-6"
          style={{ background: "hsl(190 95% 50% / 0.04)", borderColor: "hsl(190 95% 50% / 0.15)" }}>
          <p className="text-xs font-semibold text-primary text-center uppercase tracking-widest mb-6">
            How to Get Your License
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { step: "1", icon: Send,     label: "Send payment via JazzCash, Meezan Bank, or Skrill" },
              { step: "2", icon: Camera,   label: "Share your payment screenshot on WhatsApp" },
              { step: "3", icon: KeyRound, label: "Receive your personal license key" },
            ].map(({ step, icon: Icon, label }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "hsl(190 95% 50% / 0.1)" }}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wide">Step {step}</span>
                <p className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-6" style={{ color: "hsl(215 20% 48%)" }}>
            License key delivered within minutes on WhatsApp · One key per device · No recurring charges
          </p>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;
