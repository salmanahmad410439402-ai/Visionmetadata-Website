import { Helmet } from "react-helmet-async";
import { Shield, Lock, Eye, Cookie, FileText, CheckCircle2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { SELLER } from "@/config/commerce";

const PrivacyPolicy = () => {
  const ref = useReveal();

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <Helmet>
        <title>Privacy Policy | Tagyfy Pro</title>
        <meta
          name="description"
          content="Tagyfy Pro privacy policy. Learn how the Windows app and browser tools handle your media files, API keys, cookies, web beacons, analytics, and Google AdSense."
        />
        <meta property="og:title" content="Privacy Policy | Tagyfy Pro" />
        <meta property="og:url" content="https://tagyfy.com/privacy-policy" />
        <link rel="canonical" href="https://tagyfy.com/privacy-policy" />
      </Helmet>
      <div className="max-w-4xl mx-auto" ref={ref as React.RefObject<HTMLDivElement>}>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest mb-6 accent-indigo-light accent-indigo-border-soft text-accent">
            <Shield className="w-4 h-4" />
            Legal &amp; Compliance
          </div>
          <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl font-black text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="reveal reveal-delay-2 text-sm text-tertiary">
            Last Updated: October 26, 2026 · Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="reveal reveal-delay-3 space-y-10 text-secondary leading-relaxed bg-card-primary border border-card-primary rounded-3xl p-8 sm:p-12 shadow-xl">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              1. Overview &amp; Operator Identity
            </h2>
            <p>
              Welcome to <strong>Tagyfy Pro</strong> (formerly VisionMetadata Pro), operated by{" "}
              <strong>{SELLER.operator}</strong> and accessible at{" "}
              <a href="https://tagyfy.com" className="text-primary hover:underline">
                tagyfy.com
              </a>
              . This Privacy Policy explains what information is collected when you visit the website
              or use the desktop application, browser tools, or Chrome extension, and how your data
              and privacy choices are respected.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              2. How Media Files and API Keys Are Handled
            </h2>
            <p>
              Tagyfy has distinct local and browser processing modes. We do not operate a central
              server that proxies, inspects, or stores your creative assets, though any external AI
              provider you configure receives the image or video frame payload required to analyze it:
            </p>
            <ul className="space-y-2 list-none pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Windows desktop app:</strong> Files are read and embedded locally on your
                  computer. When you request AI analysis, the selected file or sampled video frames
                  are sent directly from your computer to the AI provider associated with your API
                  key (Google Gemini, OpenAI, Groq, or Mistral AI). Tagyfy never receives or stores
                  that media.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Browser generator (/tool) &amp; Metadata Checker (/metadata-checker):</strong>{" "}
                  The Metadata Checker runs 100% locally in your browser with no outbound requests.
                  In the AI generator, your selected file is read in browser memory and sent directly
                  to the AI provider you chose. Do not upload confidential media unless you accept
                  that provider&apos;s API terms and privacy policy.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>
                  <strong>API keys:</strong> The Windows app stores keys in local encrypted storage
                  on your machine. The browser tool keeps keys in memory or in your own browser&apos;s
                  local storage if you opt in. Tagyfy never transmits your API keys to a Tagyfy
                  server.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <Cookie className="w-6 h-6 text-primary" />
              3. Cookies, Web Beacons &amp; Analytics
            </h2>
            <p>
              <code>tagyfy.com</code> initializes Google Consent Mode v2 with all analytics and
              advertising storage signals set to <code>denied</code> by default. On your first visit,
              a consent banner lets you accept or decline optional cookies in a single click.
            </p>
            <div className="bg-background/50 rounded-2xl p-6 border border-border space-y-3 text-sm">
              <p>
                <strong>Google Analytics (GA4):</strong> If you accept, Google Analytics (Measurement
                ID: <code>G-VDFCFCECNL</code>) collects aggregated usage statistics such as pages
                visited, approximate session duration, and browser/device category. You can also opt
                out globally via the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </p>
              <p>
                <strong>Withdrawing consent at any time:</strong> Click <em>Cookie settings</em> in
                the footer of any page to reset or withdraw your consent. Declining optional cookies
                does not restrict access to any guide, reference table, or free tool on this site.
              </p>
            </div>
          </section>

          {/* Section 4 - Google AdSense & Partner Disclosure */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              4. Google AdSense, Third-Party Cookies &amp; Partner Data Use
            </h2>
            <p>
              We display advertising via Google AdSense strictly on editorial guides and reference
              pages (never on legal, checkout, contact, or error screens). Please note how data is
              processed when ads are served:
            </p>
            <ul className="list-disc pl-6 space-y-2.5 text-sm">
              <li>
                Third-party vendors, including Google, use cookies, web beacons, and IP addresses to
                serve and measure ads based on a user&apos;s prior visits to this website or other
                websites on the Internet.
              </li>
              <li>
                Third parties may be placing and reading cookies on your browser, or using web
                beacons to collect information as a result of ad serving on <code>tagyfy.com</code>.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to
                visitors based on their visit to our pages and/or other sites on the Internet.
              </li>
              <li>
                To learn specifically how Google collects and processes data when you visit websites
                that use Google services, please read{" "}
                <a
                  href="https://www.google.com/policies/privacy/partners/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline"
                >
                  How Google uses information from sites or apps that use our services
                </a>
                .
              </li>
              <li>
                You may opt out of personalized advertising at any time by visiting{" "}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Ads Settings
                </a>{" "}
                or opt out of participating third-party vendors&apos; cookies for personalized
                advertising at{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.aboutads.info/choices
                </a>
                . Visitors in the EEA, the UK, and Switzerland are only served personalized ads when
                valid consent has been granted under Google&apos;s EU User Consent Policy.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              5. Information You Voluntarily Provide
            </h2>
            <p>
              When you contact us through the website contact form, email, or WhatsApp regarding
              technical support, corrections, or license purchases, we receive your name, email
              address or phone number, and message contents. We use this information solely to reply
              to your inquiry, issue receipts and license keys, and provide support. We never sell,
              rent, or trade customer contact details.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              6. Data Protection Rights (GDPR, UK GDPR &amp; CCPA)
            </h2>
            <p>
              Depending on your jurisdiction, you have the right to request access to personal data
              we hold about you (such as support emails or order records), request correction or
              deletion, withdraw cookie consent, and object to processing. Because Tagyfy Pro does
              not upload your media library or API keys to central servers, your creative files
              remain under your direct local control on your own device.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              7. Contact the Developer &amp; Privacy Inquiries
            </h2>
            <p>
              If you have questions regarding this Privacy Policy or wish to exercise your privacy
              rights, contact the operator directly:
            </p>
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 text-sm space-y-1">
              <p>
                <strong>Operator:</strong> {SELLER.operator}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${SELLER.supportEmail}`}
                  className="text-primary hover:underline"
                >
                  {SELLER.supportEmail}
                </a>
              </p>
              <p>
                <strong>WhatsApp Support:</strong> {SELLER.whatsappDisplay}
              </p>
              <p>
                <strong>Website:</strong> https://tagyfy.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
