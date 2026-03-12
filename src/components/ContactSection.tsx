import { MessageCircle, CreditCard, Send, Camera, KeyRound } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
          Contact & Licensing
        </h2>
        <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
          Get your license key after payment
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact card */}
          <div className="rounded-2xl bg-card border border-border p-8">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Contact Us
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground">WhatsApp:</span>
                <p className="text-foreground font-medium">+92 329 74090888</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="text-foreground font-medium">salmangraphics839@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Payment card */}
          <div className="rounded-2xl bg-card border border-border p-8">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Methods
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground">JazzCash:</span>
                <p className="text-foreground font-medium font-mono">0329 7409088</p>
                <p className="text-foreground font-medium">Account Holder: Salman Ahmad</p>
              </div>
              <div>
                <span className="text-muted-foreground">Meezan Bank:</span>
                <p className="text-foreground font-medium font-mono">50010112691566</p>
                <p className="text-foreground font-medium">Account Holder: Salman Ahmad</p>
              </div>
              <div>
                <span className="text-muted-foreground">Skrill:</span>
                <p className="text-foreground font-medium">salmangraphics839@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment flow steps */}
        <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/20 p-6">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { step: "1", icon: Send, label: "Send payment via JazzCash / Meezan Bank" },
              { step: "2", icon: Camera, label: "Share screenshot on WhatsApp" },
              { step: "3", icon: KeyRound, label: "Receive your license key" },
            ].map(({ step, icon: Icon, label }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wide">Step {step}</span>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            License key delivered within minutes on WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
