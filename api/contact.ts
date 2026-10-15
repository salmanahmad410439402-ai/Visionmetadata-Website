import { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { SELLER } from "../src/config/commerce";

/**
 * Contact form handler — POST /api/contact
 *
 * SECURITY NOTE, and the reason this file was edited:
 * the Resend API key used to have a hard-coded fallback here —
 * `process.env.RESEND_API_KEY || "re_..."`. This repository is public, so that
 * key was published to the internet, and anyone who found it could send mail
 * from the account. Any key that has ever been committed must be treated as
 * compromised: rotate it in the Resend dashboard rather than deleting the line
 * and moving on. There is no fallback now — a missing key fails loudly.
 *
 * The recipient also used to be a second hard-coded address that disagreed with
 * the address the site publishes. It now defaults to SELLER.supportEmail and can
 * be overridden per-deployment with CONTACT_TO_EMAIL.
 */

const BRAND = SELLER.brand;
const CONTACT_TO = process.env.CONTACT_TO_EMAIL || SELLER.supportEmail;

/** Escapes text for safe interpolation into the HTML email body. */
const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body ?? {};

  // Validate required fields
  if (!message || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Length caps: this endpoint sends mail to a real inbox, so unbounded input is
  // a spam vector as much as a rendering problem.
  if (typeof message === "string" && message.length > 5000) {
    return res.status(413).json({ error: "Message is too long" });
  }

  // Escaped once, used everywhere below. The previous version interpolated the
  // raw name and e-mail into the HTML body and into a mailto: href.
  const safeName = esc(name || "Anonymous").slice(0, 120);
  const safeEmail = esc(email).slice(0, 200);
  const safeMessage = esc(message).slice(0, 5000);

  // Get client IP
  const clientIp =
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "unknown";

  // Log to console (Vercel captures this in serverless logs)
  console.log("📧 Contact form submission:", JSON.stringify({
    ts: new Date().toISOString(),
    ip: clientIp.split(",")[0],
    name,
    email,
    message: typeof message === "string" ? message.slice(0, 200) + "..." : null,
  }));

  // Send email via Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Deliberately explicit. A silent no-op here would look like the form worked
    // while nothing was delivered, which is worse than an honest failure.
    console.error("RESEND_API_KEY is not set — contact form cannot deliver mail.");
    return res.status(503).json({
      error: `Sending is temporarily unavailable. Please e-mail ${SELLER.supportEmail} directly — your message will reach the same inbox.`,
    });
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: `${BRAND} <onboarding@resend.dev>`,
      to: CONTACT_TO,
      subject: `New contact message: ${safeName}`, 
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #ffffff;">📩 New Contact Form Message</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #e0f2fe;">${BRAND} Website</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            
            <!-- Sender Info -->
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px; width: 80px;">Name:</td>
                  <td style="padding: 6px 0; color: #f1f5f9; font-size: 14px; font-weight: 600;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Email:</td>
                  <td style="padding: 6px 0;">
                    <a href="mailto:${safeEmail}" style="color: #22d3ee; text-decoration: none; font-size: 14px; font-weight: 600;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">IP:</td>
                  <td style="padding: 6px 0; color: #64748b; font-size: 12px;">${clientIp.split(",")[0]}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Time:</td>
                  <td style="padding: 6px 0; color: #64748b; font-size: 12px;">${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</td>
                </tr>
              </table>
            </div>

            <!-- Message -->
            <div style="background: #1e293b; border-left: 3px solid #06b6d4; border-radius: 8px; padding: 16px;">
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
              <p style="margin: 0; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${
                safeMessage
              }</p>
            </div>

            <!-- Quick Reply -->
            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`${BRAND} enquiry`)}&body=Hi ${safeName},%0A%0AThank you for reaching out!%0A%0A" 
                style="display: inline-block; background: #06b6d4; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                ↩ Reply to ${safeName}
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="padding: 16px 32px; background: #0c1524; text-align: center;">
            <p style="margin: 0; color: #475569; font-size: 11px;">Sent from the tagyfy.com contact form</p>
          </div>

        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}
