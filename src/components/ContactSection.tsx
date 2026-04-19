import { MessageCircle, Send, Camera, KeyRound, Mail, Phone, Clock, Shield } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import ContactForm from "./ContactForm";

const ContactSection = () => {
  const ref = useReveal();

  return (
    <section id="contact" ref={ref as React.RefObject<HTMLElement>} className="pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-24">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-8"
            style={{ background: "hsl(190 95% 50% / 0.1)", borderColor: "hsl(190 95% 50% / 0.3)", color: "hsl(190 95% 65%)" }}>
            <MessageCircle className="w-4 h-4" />
            Get in Touch
          </div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Contact & Support
          </h2>
          <p className="reveal reveal-delay-2 max-w-2xl mx-auto text-lg" style={{ color: "hsl(215 20% 65%)" }}>
            Have questions about VisionMeta? Need a license key? Our team responds quickly on WhatsApp & email.
          </p>
        </div>

        {/* Quick contact buttons */}
        <div className="reveal reveal-delay-3 grid sm:grid-cols-2 gap-4 mb-20">
          {/* WhatsApp */}
          <a href="https://wa.me/923297409088" target="_blank" rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
            style={{ background: "hsl(140 60% 10%)", borderColor: "hsl(140 40% 25%)" }}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-1">WhatsApp (Fastest)</h3>
                <p className="text-lg font-semibold text-foreground">+92 329 7090888</p>
                <p className="text-xs mt-2" style={{ color: "hsl(215 20% 55%)" }}>Instant responses · License keys delivered in minutes</p>
              </div>
              <Phone className="w-8 h-8 text-green-400/60 group-hover:text-green-400 transition-colors" />
            </div>
          </a>

          {/* Email */}
          <a href="mailto:salmangraphics839@gmail.com"
            className="group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(190_95%_50%/0.1)]"
            style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 18%)" }}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 mb-1">Email Support</h3>
                <p className="text-lg font-semibold text-foreground">salmangraphics839@gmail.com</p>
                <p className="text-xs mt-2" style={{ color: "hsl(215 20% 55%)" }}>General inquiries · Technical support · Partnerships</p>
              </div>
              <Mail className="w-8 h-8 text-cyan-400/60 group-hover:text-cyan-400 transition-colors" />
            </div>
          </a>
        </div>

        {/* Main grid - Contact form + Steps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">

          {/* Contact Form - Left side */}
          <div className="reveal reveal-delay-2 rounded-2xl border p-8 relative overflow-hidden"
            style={{ background: "hsl(220 40% 8%)", borderColor: "hsl(220 30% 16%)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(190 95% 50%), transparent)" }} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "hsl(190 95% 50% / 0.15)" }}>
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Send us a Message</h3>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>We'll respond within 2 hours</p>
                </div>
              </div>
              <ContactForm />
            </div>
          </div>

          {/* How to Get License - Right side */}
          <div className="reveal reveal-delay-3 space-y-4">
            <div className="rounded-2xl border p-8" style={{ background: "hsl(190 95% 50% / 0.05)", borderColor: "hsl(190 95% 50% / 0.15)" }}>
              <h3 className="text-xl font-bold text-foreground mb-1">Quick License Process</h3>
              <p className="text-sm mb-6" style={{ color: "hsl(215 20% 60%)" }}>No hidden steps. No setup fees. Get going in minutes.</p>

              <div className="space-y-4">
                {[
                  { step: "1", icon: Send, title: "Send Payment", desc: "Via JazzCash, Meezan Bank, or Skrill" },
                  { step: "2", icon: Camera, title: "Share Screenshot", desc: "Send payment proof via WhatsApp" },
                  { step: "3", icon: KeyRound, title: "Get License Key", desc: "Personal key delivered instantly" },
                ].map(({ step, icon: Icon, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold"
                      style={{ borderColor: "hsl(190 95% 50%)", color: "hsl(190 95% 60%)" }}>
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Clock, label: "2 Min Setup", color: "cyan" },
                { icon: Shield, label: "One-time Purchase", color: "green" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="rounded-xl border p-4 text-center transition-all duration-300 hover:border-primary/50"
                  style={{ background: "hsl(220 40% 10%)", borderColor: "hsl(220 30% 18%)" }}>
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${color === "green" ? "text-green-400" : "text-cyan-400"}`} />
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="reveal reveal-delay-4 rounded-2xl border p-10 text-center mt-8"
          style={{ background: "hsl(190 95% 50% / 0.08)", borderColor: "hsl(190 95% 50% / 0.2)" }}>
          <p className="text-sm font-semibold text-primary mb-4">✓ Security & Privacy</p>
          <p className="text-sm" style={{ color: "hsl(215 20% 60%)" }}>
            All communication is encrypted. One license key per device. No recurring charges. <br />
            License delivered within minutes on WhatsApp after payment confirmation.
          </p>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;
