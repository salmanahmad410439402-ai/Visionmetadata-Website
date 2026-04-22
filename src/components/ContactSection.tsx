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
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-8 accent-cyan-light accent-cyan-border-soft text-accent">
            <MessageCircle className="w-4 h-4" />
            Get in Touch
          </div>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Contact & Support
          </h2>
          <p className="reveal reveal-delay-2 max-w-2xl mx-auto text-lg text-tertiary">
            Have questions about VisionMeta? Need a license key? Our team responds quickly on WhatsApp & email.
          </p>
        </div>

        {/* Quick contact buttons */}
        <div className="reveal reveal-delay-3 grid sm:grid-cols-2 gap-4 mb-20">
          {/* WhatsApp */}
          <a href="https://wa.me/923297409088" target="_blank" rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] bg-green-500/10 border-green-500/20">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-sm font-bold text-green-600 dark:text-green-400 mb-1">WhatsApp (Fastest)</h3>
                <p className="text-lg font-semibold text-foreground">+92 329 7090888</p>
                <p className="text-xs mt-2 text-minimal">Instant responses · License keys delivered in minutes</p>
              </div>
              <Phone className="w-8 h-8 text-green-500/60 group-hover:text-green-500 transition-colors" />
            </div>
          </a>

          {/* Email */}
          <a href="mailto:salmangraphics839@gmail.com"
            className="group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(190_95%_50%/0.1)] bg-card-primary border-card-primary">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">Email Support</h3>
                <p className="text-lg font-semibold text-foreground">salmangraphics839@gmail.com</p>
                <p className="text-xs mt-2 text-minimal">General inquiries · Technical support · Partnerships</p>
              </div>
              <Mail className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
            </div>
          </a>
        </div>

        {/* Main grid - Contact form + Steps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">

          {/* Contact Form - Left side */}
          <div className="reveal reveal-delay-2 rounded-2xl border p-8 relative overflow-hidden bg-card-primary border-card-primary">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-[radial-gradient(circle,_hsl(190_95%_50%),_transparent)]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center accent-cyan-light">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Send us a Message</h3>
                  <p className="text-xs mt-0.5 text-minimal">We'll respond within 2 hours</p>
                </div>
              </div>
              <ContactForm />
            </div>
          </div>

          {/* How to Get License - Right side */}
          <div className="reveal reveal-delay-3 space-y-4">
            <div className="rounded-2xl border p-8 accent-cyan-ultra-light border-primary/15">
              <h3 className="text-xl font-bold text-foreground mb-1">Quick License Process</h3>
              <p className="text-sm mb-6 text-quaternary">No hidden steps. No setup fees. Get going in minutes.</p>

              <div className="space-y-4">
                {[
                  { step: "1", icon: Send, title: "Send Payment", desc: "Via JazzCash, Meezan Bank, or Skrill" },
                  { step: "2", icon: Camera, title: "Share Screenshot", desc: "Send payment proof via WhatsApp" },
                  { step: "3", icon: KeyRound, title: "Get License Key", desc: "Personal key delivered instantly" },
                ].map(({ step, icon: Icon, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold border-primary text-primary">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{title}</p>
                      <p className="text-xs mt-0.5 text-minimal">{desc}</p>
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
                <div key={label} className="rounded-xl border p-4 text-center transition-all duration-300 hover:border-primary/50 bg-card-primary border-card-primary">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${color === "green" ? "text-green-500" : "text-primary"}`} />
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="reveal reveal-delay-4 rounded-2xl border p-10 text-center mt-8 accent-cyan-ultra-light accent-cyan-border-soft">
          <p className="text-sm font-semibold text-primary mb-4">✓ Security & Privacy</p>
          <p className="text-sm text-quaternary">
            All communication is encrypted. One license key per device. No recurring charges. <br />
            License delivered within minutes on WhatsApp after payment confirmation.
          </p>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;
