import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { get } from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Configurable download URL (set DOWNLOAD_URL env var in production)
const DOWNLOAD_URL = process.env.DOWNLOAD_URL || "https://github.com/salmangraphics839-hue/visionmeta-releases/releases/latest/download/VisionMetadata-Pro-Setup.exe";

// Simple server-side logging (JSON lines) for analytics and debugging.
const LOG_DIR = path.join(__dirname, "../logs");
try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
} catch (err) {
  console.warn("Could not create log directory:", err);
}

const appendLog = (filename: string, obj: any) => {
  try {
    fs.appendFileSync(path.join(LOG_DIR, filename), JSON.stringify(obj) + "\n");
  } catch (err) {
    console.error("Failed to write log:", err);
  }
};

const getClientIp = (req: any) => (req.headers["x-forwarded-for"] || req.ip || req.socket?.remoteAddress || "");

app.get("/api/download/latest", (req, res) => {
  // Stream the remote file through the server to preserve a single-origin download
  // This keeps the release URL hidden and enables later analytics or CDN changes.

  const clientIp = getClientIp(req);
  const ua = (req.headers["user-agent"] || "").toString();
  const referer = (req.headers.referer || req.headers.referrer || "").toString();
  const baseEntry = { ts: new Date().toISOString(), ip: clientIp, ua, referer, url: DOWNLOAD_URL };
  appendLog("downloads.log", { ...baseEntry, event: "start" });

  const reqStream = get(DOWNLOAD_URL, (remoteRes: any) => {
    res.setHeader("content-disposition", remoteRes.headers["content-disposition"] || "attachment; filename=VisionMetadata-Pro-Setup.exe");
    res.setHeader("content-type", remoteRes.headers["content-type"] || "application/octet-stream");

    remoteRes.pipe(res);

    remoteRes.on("end", () => {
      appendLog("downloads.log", { ...baseEntry, event: "complete", statusCode: remoteRes.statusCode });
    });

    remoteRes.on("close", () => {
      appendLog("downloads.log", { ...baseEntry, event: "closed" });
    });
  });

  reqStream.on("error", (err: any) => {
    appendLog("downloads.log", { ...baseEntry, event: "error", error: String(err) });
    console.error("Download proxy error:", err);
    // Fallback to redirect if streaming fails
    res.redirect(DOWNLOAD_URL);
  });
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!message || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const clientIp = getClientIp(req);
  const entry = {
    ts: new Date().toISOString(),
    ip: clientIp,
    name: name || null,
    email: email || null,
    // Limit stored message length to avoid huge logs
    message: typeof message === "string" ? message.slice(0, 2000) : null,
  };
  appendLog("contacts.log", entry);

  console.log("Contact form submission:", { name, email });
  // TODO: forward to email provider or CRM in production
  res.json({ success: true });
});

// Serve frontend in production if built
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../../dist");

if (process.env.NODE_ENV === "production") {
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.warn("Dist folder not found at", distPath);
  }
}

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`VisionMeta server listening on http://localhost:${port}`);
});
