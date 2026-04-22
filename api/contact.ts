import { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

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

  const { name, email, message } = req.body;

  // Validate required fields
  if (!message || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "VisionMetadata Pro <onboarding@resend.dev>",
      to: "salmangraphics839@gmail.com",
      subject: `📩 New Contact: ${name || "Anonymous"} — VisionMetadata Pro`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #ffffff;">📩 New Contact Form Message</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #e0f2fe;">VisionMetadata Pro Website</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            
            <!-- Sender Info -->
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px; width: 80px;">Name:</td>
                  <td style="padding: 6px 0; color: #f1f5f9; font-size: 14px; font-weight: 600;">${name || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Email:</td>
                  <td style="padding: 6px 0;">
                    <a href="mailto:${email}" style="color: #22d3ee; text-decoration: none; font-size: 14px; font-weight: 600;">${email}</a>
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
                typeof message === "string" ? message.slice(0, 2000).replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""
              }</p>
            </div>

            <!-- Quick Reply -->
            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${email}?subject=Re: VisionMetadata Pro Inquiry&body=Hi ${name || "there"},%0A%0AThank you for reaching out!%0A%0A" 
                style="display: inline-block; background: #06b6d4; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                ↩ Reply to ${name || "sender"}
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="padding: 16px 32px; background: #0c1524; text-align: center;">
            <p style="margin: 0; color: #475569; font-size: 11px;">Sent from the VisionMetadata Pro contact form</p>
          </div>

        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
}
