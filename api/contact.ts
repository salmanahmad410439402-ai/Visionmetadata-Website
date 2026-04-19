import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
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

  // Create log entry
  const entry = {
    ts: new Date().toISOString(),
    ip: clientIp.split(",")[0], // Get first IP if multiple
    name: name || null,
    email: email || null,
    message: typeof message === "string" ? message.slice(0, 2000) : null,
  };

  // Log to console (Vercel captures this in serverless logs)
  console.log("📧 Contact form submission:", JSON.stringify(entry, null, 2));

  // TODO: In production, forward to email provider (SendGrid, Mailgun, AWS SES, etc.)
  // Example:
  // await sendEmail({
  //   to: "salmangraphics839@gmail.com",
  //   subject: `New contact from ${name} (${email})`,
  //   message: message
  // });

  return res.status(200).json({ success: true, message: "Message received" });
}
