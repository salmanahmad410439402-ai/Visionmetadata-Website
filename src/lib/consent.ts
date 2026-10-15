/**
 * Consent state for analytics and advertising cookies.
 *
 * WHY THIS EXISTS
 * The site loads GA4 and AdSense unconditionally, which means both set cookies
 * before a visitor has agreed to anything. That is the thing privacy law and
 * Google's own EU user consent policy actually target, and it was the missing
 * half of the cookie section in the privacy policy — the policy described
 * cookies while the page had no way to decline them.
 *
 * HOW IT WORKS
 * `index.html` pushes Google Consent Mode v2 defaults with every storage signal
 * denied, before any tag loads. That means the tags can load and AdSense can
 * still verify the site, but no analytics or advertising storage is written
 * until a visitor opts in here. Accepting calls `consentUpdate('granted')`,
 * which flips the signals and lets GA4 and AdSense set their cookies. Declining
 * leaves them denied.
 *
 * Note on the EEA/UK: Google also requires a *Google-certified* consent
 * management platform for personalised ads there. This module is not one. The
 * certified route is AdSense → Privacy & messaging → GDPR message, which is free
 * and takes over for EEA/UK visitors; this banner covers everywhere else and
 * gives every visitor a working decline.
 */

export type ConsentChoice = "granted" | "denied";

/** Bump the suffix to re-ask everyone after a meaningful change. */
const STORAGE_KEY = "tagyfy.consent.v1";

/** Signals Google Consent Mode v2 understands. */
const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

type Gtag = (...args: unknown[]) => void;

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: Gtag };
  return typeof w.gtag === "function" ? w.gtag : null;
}

/** The stored choice, or null when the visitor has not decided yet. */
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "granted" || raw === "denied" ? raw : null;
  } catch {
    // Storage blocked (private mode, strict settings) — treat as undecided and
    // fall back to the denied defaults already in place.
    return null;
  }
}

/** True once the visitor has made a choice, either way. */
export function hasDecidedConsent(): boolean {
  return getStoredConsent() !== null;
}

/**
 * Push a consent decision to Google tags and remember it.
 *
 * Passing "denied" is a real revocation: Consent Mode clears the storage it
 * would otherwise use, so declining after accepting still takes effect.
 */
export function setConsent(choice: ConsentChoice): void {
  const g = gtag();
  if (g) {
    g("consent", "update", choice === "granted" ? GRANTED : DENIED);
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Non-fatal: the signal was still sent for this page view.
    }
  }

  window.dispatchEvent(new CustomEvent("tagyfy:consent", { detail: choice }));
}

/**
 * Re-apply a stored decision on startup.
 *
 * The default is denied either way, so this only ever *grants*; a stored denial
 * needs no action because the default already matches it.
 */
export function applyStoredConsent(): void {
  if (getStoredConsent() === "granted") {
    const g = gtag();
    if (g) g("consent", "update", GRANTED);
  }
}

/** Convenience for a footer "Cookie settings" control. */
export function clearConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — the banner will simply not reappear until storage is available.
  }
  window.dispatchEvent(new CustomEvent("tagyfy:consent", { detail: null }));
}
