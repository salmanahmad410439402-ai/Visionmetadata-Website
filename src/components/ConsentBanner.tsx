import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { hasDecidedConsent, setConsent } from "@/lib/consent";

/**
 * Cookie consent prompt.
 *
 * Both buttons are equally available and equally legible — a "Decline" that is
 * greyed out, smaller, or hidden one click deeper is the pattern regulators
 * object to, and it is also just dishonest. Nothing is pre-selected and the
 * banner takes no action until the visitor chooses: analytics and advertising
 * storage stay denied from page load (see src/lib/consent.ts for how).
 *
 * The banner is deliberately dismissible by keyboard and screen reader, and it
 * never blocks scrolling or the page content underneath.
 */
const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Defer a tick so the banner does not compete with first paint.
    const t = window.setTimeout(() => setVisible(!hasDecidedConsent()), 600);

    const onConsentChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setVisible(detail === null);
    };
    window.addEventListener("tagyfy:consent", onConsentChange);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("tagyfy:consent", onConsentChange);
    };
  }, []);

  const choose = (choice: "granted" | "denied") => {
    setConsent(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-card-primary bg-card-primary/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Cookie className="w-4 h-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground mb-1">Cookies for analytics and ads</p>
            <p className="text-sm leading-relaxed text-secondary">
              We use Google Analytics to see which pages are read, and Google AdSense to show ads.
              Both stay switched off until you say otherwise — declining is just as easy as
              accepting, and you can change your mind later from the footer. See the{" "}
              <Link to="/privacy-policy" className="text-primary underline hover:text-primary/80">
                privacy policy
              </Link>
              .
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => choose("granted")}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Allow analytics and ads
              </button>
              <button
                type="button"
                onClick={() => choose("denied")}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-card-primary text-foreground hover:bg-background/60 transition-colors"
              >
                Essential cookies only
              </button>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close without choosing"
            onClick={() => setVisible(false)}
            className="shrink-0 p-1.5 rounded-lg text-tertiary hover:text-foreground hover:bg-background/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-tertiary mt-3 sm:pl-12">
          Closing this leaves both switched off. Essential cookies are only what the site needs to
          function.
        </p>
      </div>
    </div>
  );
};

export default ConsentBanner;
