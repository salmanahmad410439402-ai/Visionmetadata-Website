/**
 * Commerce configuration — one source of truth for who is selling, how payment
 * works, and what a buyer can expect.
 *
 * WHY THIS FILE EXISTS
 * These details were previously scattered as raw literals across the pricing
 * page, the contact page, the footer and the prerender step. That caused three
 * real problems on the live site:
 *
 *   1. The pricing page published a bank IBAN, a JazzCash number and a personal
 *      e-mail as the primary checkout experience, with no named seller, no order
 *      process and no terms anywhere near them.
 *   2. Delivery promises contradicted each other — the pricing page said keys
 *      are sent "within minutes" while the payment panel said "within 24 hours".
 *   3. Nothing could be corrected once; the same account numbers were duplicated
 *      in the prerendered HTML for crawlers.
 *
 * Import from here. Never paste an account number or a delivery promise directly
 * into a component.
 *
 * ── ACTION REQUIRED BY THE OWNER ──────────────────────────────────────────────
 * Payments are currently collected by manual bank transfer, which means a buyer
 * has no chargeback protection and a reviewer sees a checkout flow with no
 * processor. The clean fix is a card option. `CARD_CHECKOUT` below is wired up
 * and will render automatically once you paste a hosted-checkout URL from a
 * merchant of record that accepts Pakistani sellers (Paddle, Lemon Squeezy or
 * Gumroad all work; Stripe does not operate in Pakistan). Until that is filled
 * in, the site says plainly that card payment is not yet available rather than
 * implying it is.
 */

/** Who the buyer is actually paying. Only state facts that can be evidenced. */
export const SELLER = {
  brand: "Tagyfy Pro",
  operator: "Salman Ahmad",
  /** Registered trading name, if and when one exists. Left null on purpose — do
   *  not invent a company name or registration number. */
  legalEntity: null as string | null,
  country: "Pakistan",
  supportEmail: "alhamdstudio839@gmail.com",
  /** WhatsApp in international format, digits only — used to build links. */
  whatsapp: "923259640429",
  /** The same number as it should be printed for a human to read or dial. */
  whatsappDisplay: "+92 325 9640429",
  /** Kept deliberately modest and honest. Update when support coverage changes. */
  supportHours: "Usually within a few hours, and always within 24 hours, seven days a week.",
  /** Publish a business address only once you have one you are happy to print. */
  businessAddress: null as string | null,
} as const;

/**
 * Hosted card checkout. Paste a URL here to switch card payments on — the
 * pricing page and the order panel will start offering it with no other change.
 * Example: "https://tagyfy.lemonsqueezy.com/checkout/buy/xxxxxxxx"
 */
export const CARD_CHECKOUT: string | null = null;

export interface PaymentRail {
  id: string;
  label: string;
  region: string;
  description: string;
  /** Continue to disclose these, but behind an explicit reveal. */
  fields: { label: string; value: string; copyable: boolean }[];
  /** Shown under the details — rail-specific caveats a buyer should read. */
  note: string;
}

/**
 * Manual payment rails. These remain because they are genuinely how many
 * Pakistani contributors prefer to pay, and they cost the buyer nothing extra.
 * They are presented as a documented process rather than a bare account number.
 *
 * The account holder name is repeated on every rail on purpose: it is the one
 * check a buyer can perform to confirm they are not paying an impersonator.
 */
export const PAYMENT_RAILS: PaymentRail[] = [
  {
    id: "raast",
    label: "RAAST / bank transfer",
    region: "Pakistan",
    description: "Instant interbank transfer, typically free, works from any Pakistani banking app.",
    fields: [
      { label: "Account title", value: "Salman Ahmad", copyable: true },
      { label: "RAAST ID", value: "03297409088", copyable: true },
      { label: "IBAN", value: "PK48JCMA1409923297409088", copyable: true },
    ],
    note: "Send the order reference in the transfer note if your bank allows one.",
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    region: "Pakistan",
    description: "Mobile wallet transfer — the fastest option if you already use JazzCash.",
    fields: [
      { label: "Account title", value: "Salman Ahmad", copyable: true },
      { label: "Account number", value: "0329 7409088", copyable: true },
    ],
    note: "Keep the JazzCash transaction ID — it is the fastest way for us to confirm your payment.",
  },
  {
    id: "meezan",
    label: "Meezan Bank",
    region: "Pakistan",
    description: "Direct bank transfer to a Meezan Bank account.",
    fields: [
      { label: "Account title", value: "Salman Ahmad", copyable: true },
      { label: "Account ID", value: "50010112691566", copyable: true },
    ],
    note: "Please allow one working day for interbank transfers to clear before following up.",
  },
  {
    id: "skrill",
    label: "Skrill",
    region: "International",
    description: "For buyers outside Pakistan who cannot use a local transfer.",
    fields: [{ label: "Skrill account", value: "alhamdstudio839@gmail.com", copyable: true }],
    note: "Send the payment as a personal transfer and include your order reference in the note field.",
  },
];

/**
 * The order process, stated in the order it happens. The order reference is the
 * part that matters most for trust: it gives a buyer something concrete to quote
 * and a record of what they asked for.
 */
export const ORDER_STEPS = [
  {
    title: "Pick your plan",
    body: "Choose a duration on the pricing page. You get an order reference in the form TGY-YYYYMM-XXXX that identifies your order from that point on.",
  },
  {
    title: "Pay by your preferred method",
    body: "Use any rail below, or card payment once it is available. Send the exact amount for your plan and keep your transaction receipt.",
  },
  {
    title: "Send us the reference and your receipt",
    body: "Message the order reference plus a screenshot or transaction ID to the support e-mail or WhatsApp number on this page. Nothing else is needed — we do not ask for ID or card details.",
  },
  {
    title: "Receive your licence key and receipt",
    body: "Your licence key is sent to you, together with a receipt for the payment. A receipt is available for every completed order on request.",
  },
];

/**
 * Anti-impersonation notice. Publishing payment details on a public page is a
 * requirement of the manual-transfer model, so the risk it creates has to be
 * addressed explicitly: the buyer must have a way to tell a real request from a
 * fraudulent one.
 */
export const FRAUD_NOTICE =
  "We only ever publish payment details on this page, and every account is held in the name Salman Ahmad. We will never message you first with new account details, never ask you to pay a different account holder, and never ask for your card number, bank password or one-time code. If any of those happen, it is not us — stop and report it through the support e-mail on this page.";

/** Builds a WhatsApp deep link with a pre-filled message. */
export const waLink = (message: string) =>
  `https://wa.me/${SELLER.whatsapp}?text=${encodeURIComponent(message)}`;

/** Builds a mailto link with a pre-filled subject and body. */
export const mailLink = (subject: string, body: string) =>
  `mailto:${SELLER.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * Generates the human-readable order reference shown to a buyer.
 *
 * Generated client-side because there is no order database yet. When you add
 * real order handling, replace this with the server-issued reference so that a
 * buyer, a support conversation and a payment can all be tied together.
 */
export const makeOrderReference = (now: Date = new Date()) => {
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TGY-${stamp}-${suffix}`;
};
