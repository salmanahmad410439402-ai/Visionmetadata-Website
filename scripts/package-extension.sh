#!/usr/bin/env bash
#
# Package the Tagyfy Pro Chrome extension for release.
#
# WHY THIS SCRIPT EXISTS
# The shipped archive previously contained the raw build directory, which meant
# every visitor who unzipped it got:
#
#   • a folder literally named "dis obfuscated"
#   • package.json, package-lock.json and build.js — build tooling with no
#     purpose inside a distributed extension
#   • no indication anywhere of what the extension does with their data
#
# The extension itself is behaviourally sound — an audit of the bundled code
# found six network calls, all to the AI providers declared in the manifest,
# and no eval/atob/cookie/webRequest access. The problem was purely packaging,
# and packaging is what made it look like malware. This script produces a clean
# archive every time rather than relying on someone rebuilding it by hand.
#
# USAGE
#   ./scripts/package-extension.sh <path-to-unpacked-extension-dir> <version>
#
# EXAMPLE
#   ./scripts/package-extension.sh ~/build/tagyfy-ext 1.3.6
#
# The output lands in public/ under the filename the website links to, so
# publishing a new build is: run this, commit, deploy.

set -euo pipefail

SRC_DIR="${1:-}"
VERSION="${2:-}"

if [[ -z "$SRC_DIR" || -z "$VERSION" ]]; then
  echo "Usage: $0 <path-to-unpacked-extension-dir> <version>" >&2
  echo "Example: $0 ~/build/tagyfy-ext 1.3.6" >&2
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: '$SRC_DIR' is not a directory." >&2
  exit 1
fi

if [[ ! -f "$SRC_DIR/manifest.json" ]]; then
  echo "Error: no manifest.json in '$SRC_DIR' — is that the unpacked extension root?" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_NAME="Tagyfy_Pro_Chrome_Extension_V${VERSION}.zip"
OUT_PATH="${REPO_ROOT}/public/${OUT_NAME}"
STAGE_DIR="$(mktemp -d)"
PKG_DIR="${STAGE_DIR}/tagyfy-pro"

# ── Stage a clean copy ────────────────────────────────────────────────────────
# The folder name matters: Chrome's "Load unpacked" dialog shows it to the user.
mkdir -p "$PKG_DIR"
cp -R "$SRC_DIR/." "$PKG_DIR/"

# ── Strip anything that should never ship to a user ───────────────────────────
REMOVE=(
  "package.json"
  "package-lock.json"
  "yarn.lock"
  "build.js"
  "build.mjs"
  "webpack.config.js"
  "rollup.config.js"
  "vite.config.js"
  "src"
  ".git"
  ".gitignore"
  "node_modules"
  "README.md"
  "CHANGELOG.md"
  "*.map"
  ".DS_Store"
)

for item in "${REMOVE[@]}"; do
  # shellcheck disable=SC2086
  rm -rf "${PKG_DIR:?}/${item}" 2>/dev/null || true
done

# ── Verify the manifest matches the version being published ───────────────────
MANIFEST_VERSION="$(node -e "console.log(require('${PKG_DIR}/manifest.json').version)" 2>/dev/null || echo "")"
if [[ "$MANIFEST_VERSION" != "$VERSION" ]]; then
  echo "Error: manifest.json says version '${MANIFEST_VERSION}' but you asked for '${VERSION}'." >&2
  echo "Fix the manifest before publishing, so the site, the ZIP name and the" >&2
  echo "installed extension all agree." >&2
  rm -rf "$STAGE_DIR"
  exit 1
fi

# ── Ship a plain-text note describing what the extension does ─────────────────
cat > "${PKG_DIR}/READ-ME-FIRST.txt" <<'NOTICE'
Tagyfy Pro — Adobe Stock metadata assistant
===========================================

WHAT THIS IS
  A Chrome extension that fills in the Title and Keywords fields on Adobe Stock's
  contributor upload and portfolio pages, using an AI provider key that you
  supply. It does not submit anything on your behalf — you review and save every
  change yourself.

HOW TO INSTALL
  This is an unsigned developer build, so Chrome will warn you. That warning is
  Chrome telling you the truth: it did not come from the Web Store and nobody has
  verified it for you. To install it anyway:

    1. Unzip this file to a permanent folder (for example Documents/tagyfy-pro).
    2. Open chrome://extensions/ in Chrome.
    3. Turn on "Developer mode" (top right).
    4. Click "Load unpacked" and select the unzipped folder.

  To remove it, go back to chrome://extensions/ and click Remove. Nothing is
  left behind apart from the stored settings described below.

WHAT IT CAN ACCESS
  • Web pages: only contributor.stock.adobe.com. It cannot read any other site.
  • Network: only the AI provider you configure — Google (generativelanguage.
    googleapis.com), OpenAI (api.openai.com), Groq (api.groq.com) or Mistral
    (api.mistral.ai). No Tagyfy server is contacted, because there isn't one.
  • Storage: your API keys and your title/keyword preferences, saved in Chrome's
    extension storage on this device only.
  • It does not collect analytics, does not use cookies, does not read your
    browsing history, and does not load remote code.

WHAT IT DOES NOT DO
  • It does not send your images anywhere except to the AI provider you chose,
    which is required for the AI to describe them.
  • It does not submit, publish or delete anything on Adobe Stock.
  • It does not transmit your API keys to us, because we have no server to send
    them to.

ABOUT THE CODE
  The JavaScript in this build is minified. That makes the extension harder for
  you to inspect, and we would rather it did not. A build with readable code is
  planned for the Chrome Web Store release. If inspectable code matters to you,
  wait for that release or use the browser tool at https://tagyfy.com/tool,
  which does the same job without installing anything.

QUESTIONS
  alhamdstudio839@gmail.com — or see https://tagyfy.com/chrome-extension
NOTICE

# ── Build the archive ─────────────────────────────────────────────────────────
rm -f "$OUT_PATH"
( cd "$STAGE_DIR" && zip -r -q -X "$OUT_PATH" "tagyfy-pro" )

# ── Report ────────────────────────────────────────────────────────────────────
echo "Packaged: public/${OUT_NAME}"
echo "Size:     $(du -h "$OUT_PATH" | cut -f1)"
echo
echo "Contents:"
unzip -l "$OUT_PATH" | sed 's/^/  /'
echo
echo "Before you upload this archive, confirm it contains no build tooling:"
echo "  unzip -l public/${OUT_NAME} | grep -E 'package.json|build.js|package-lock'"
echo "(no output above means it is clean)"

rm -rf "$STAGE_DIR"
