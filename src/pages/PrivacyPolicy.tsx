import { Shield, Lock, Eye, Cookie, FileText, CheckCircle2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const PrivacyPolicy = () => {
  const ref = useReveal();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto" ref={ref as React.RefObject<HTMLDivElement>}>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6 accent-indigo-light accent-indigo-border-soft text-accent">
            <Shield className="w-4 h-4" />
            Legal & Compliance
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="reveal reveal-delay-2 text-sm text-tertiary">
            Last Updated: August 17, 2026 · Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="reveal reveal-delay-3 space-y-10 text-secondary leading-relaxed bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-12 shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              1. Overview & Commitment to Privacy
            </h2>
            <p>
              Welcome to <strong>Tagyfy Pro</strong> (formerly VisionMetadata Pro), accessible from <a href="https://tagyfy.com" className="text-primary hover:underline">tagyfy.com</a>. We are deeply committed to protecting your personal privacy. This Privacy Policy outlines what information we collect, how we process it, and how we ensure your complete confidentiality when using our website and desktop software.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              2. Zero Server Storage (Local-First Architecture)
            </h2>
            <p>
              Our desktop application is engineered with a strict <strong>Local-First & Client-Side</strong> security paradigm:
            </p>
            <ul className="space-y-2 list-none pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>Your Images & Media Files:</strong> Your stock photos, vector files (.AI, .EPS, .SVG), and video files (.MP4, .MOV) are processed and embedded locally on your device. We never upload, store, or view your original creative assets.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span><strong>Your AI API Keys:</strong> API keys (Google Gemini, OpenAI, Groq, Mistral) are stored in your device's local encrypted storage using Windows DPAPI / safeStorage. They are never sent to or logged on our servers.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 - Google Analytics & Cookies */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <Cookie className="w-6 h-6 text-primary" />
              3. Cookies, Web Beacons & Analytics
            </h2>
            <p>
              Like most professional websites, tagyfy.com uses standard cookies to enhance user navigation and analyze aggregate traffic patterns:
            </p>
            <div className="bg-background/50 rounded-2xl p-6 border border-border space-y-3 text-sm">
              <p>
                <strong>Google Analytics (GA4):</strong> We use Google Analytics (Measurement ID: <code>G-VDFCFCECNL</code>) to collect anonymized website performance statistics (e.g., page views, visit durations, browser types). Google Analytics does not collect personally identifiable information (PII).
              </p>
              <p>
                You can prevent Google Analytics from tracking your visits by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </p>
            </div>
          </section>

          {/* Section 4 - Google AdSense & Third-Party Advertising */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              4. Google AdSense & Third-Party Advertising
            </h2>
            <p>
              Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites on the Internet:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads Settings</a>.
              </li>
              <li>
                Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aboutads.info</a>.
              </li>
            </ul>
          </section>

          {/* Section 5 - Information We Collect on Website */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              5. Information You Voluntarily Provide
            </h2>
            <p>
              When you contact us via our contact form, email, or WhatsApp for technical support or license purchases, we may receive your name, email address, and message contents. We only use this information to respond to your inquiries, deliver license keys, and provide customer support. We never sell, rent, or trade your contact information.
            </p>
          </section>

          {/* Section 6 - User Rights (GDPR & CCPA) */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              6. Data Protection Rights (GDPR & CCPA)
            </h2>
            <p>
              Under applicable data protection laws, you have the right to request access to your data, request data erasure, and object to processing. Because our software does not store user media on central servers, most data is already under your exclusive physical control on your computer.
            </p>
          </section>

          {/* Section 7 - Contact */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              7. Contact Our Privacy Team
            </h2>
            <p>
              If you have questions regarding this Privacy Policy or wish to exercise any data rights, please contact us:
            </p>
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 text-sm space-y-1">
              <p><strong>Email:</strong> <a href="mailto:alhamdstudio839@gmail.com" className="text-primary hover:underline">alhamdstudio839@gmail.com</a></p>
              <p><strong>WhatsApp Support:</strong> +92 325 9640429</p>
              <p><strong>Website:</strong> https://tagyfy.com</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
