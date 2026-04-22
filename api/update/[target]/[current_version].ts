import { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Tauri Auto-Updater API Endpoint
 * 
 * Called by the Tauri updater plugin to check for new versions.
 * URL pattern: /api/update/{target}/{current_version}
 * 
 * Returns:
 *   - 200 + JSON manifest if an update is available
 *   - 204 No Content if the app is already up to date
 * 
 * To release a new version:
 *   1. Build with TAURI_SIGNING_PRIVATE_KEY set
 *   2. Upload the .nsis.zip to GitHub Releases
 *   3. Update LATEST_VERSION and the signature + url below
 */

// ── Current latest release ───────────────────────────────────────
const LATEST_VERSION = "1.2.0";

const PLATFORMS: Record<string, { url: string; signature: string }> = {
  "windows-x86_64": {
    // The installer from `tauri build`
    // IMPORTANT: Make sure you upload the setup.exe file to GitHub Releases exactly with this name
    url: "https://github.com/salmangraphics839-hue/visionmeta-releases/releases/download/1.2.0/VisionMetadata.Pro_1.2.0_x64-setup.exe",
    // This signature matches VisionMetadata Pro_1.2.0_x64-setup.exe from build
    signature: "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUUXg3Ni90UkhlaTF0MWZWbG5SQXJrV1phekdlekdQZHM3dklQYWkvdGhOc05md2pWRFBzNEdIVklsU21aVWZDdlZEN2JsQzZXUFJoSkZHaC9kcUdCemtrMWpnNTVRVEFVPQp0cnVzdGVkIGNvbW1lbnQ6IHRpbWVzdGFtcDoxNzc2ODIxNjY4CWZpbGU6VmlzaW9uTWV0YWRhdGEgUHJvXzEuMi4wX3g2NC1zZXR1cC5leGUKL3lzUmh5TFR1c2NMd29sU1FpaU94WkVlMDlNZXBCc0xRZjVqQ0pyM1FEWTArT2dyK1BFUFFQeWhOQVlZVzVhU1JKbFVTYnd0aTVMSEl2biszbm5vQkE9PQo=",
  },
};

const RELEASE_NOTES = "Bug fixes and performance improvements";
const PUB_DATE = "2026-04-21T00:00:00Z";
// ─────────────────────────────────────────────────────────────────

/**
 * Simple semver comparison: returns true if `a` is greater than `b`
 * Supports versions like "1.2.0", "1.10.3", etc.
 */
function isNewerVersion(latest: string, current: string): boolean {
  const latestParts = latest.split(".").map(Number);
  const currentParts = current.split(".").map(Number);
  
  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers (Tauri may need these)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { target, current_version } = req.query;

  // Validate parameters
  if (
    typeof target !== "string" || 
    typeof current_version !== "string"
  ) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  console.log(
    `[Updater] Check from ${target} running v${current_version} (latest: v${LATEST_VERSION})`
  );

  // If the user already has the latest version (or newer), no update needed
  if (!isNewerVersion(LATEST_VERSION, current_version)) {
    return res.status(204).end();
  }

  // Check if we have a build for this platform
  const platform = PLATFORMS[target];
  if (!platform) {
    console.log(`[Updater] No build available for platform: ${target}`);
    return res.status(204).end();
  }

  // Return the update manifest in Tauri's expected format
  return res.status(200).json({
    version: LATEST_VERSION,
    notes: RELEASE_NOTES,
    pub_date: PUB_DATE,
    platforms: {
      [target]: {
        signature: platform.signature,
        url: platform.url,
      },
    },
  });
}
