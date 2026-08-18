/**
 * Environment Detection Utilities
 * Zero external dependencies — safe to import from anywhere without causing
 * circular dependency chains.
 *
 * This file intentionally has NO imports from other app modules.
 * It is the single source of truth for environment/capability detection.
 */

/**
 * Returns true when the renderer is running inside an Electron BrowserWindow.
 * Checks for the contextBridge-exposed `window.electronAPI` object injected
 * by electron/preload.cjs at launch.
 */
export const isDesktop = (): boolean => {
  return !!(
    typeof window !== "undefined" &&
    ((window as any).__TAURI_INTERNALS__ || (window as any).electronAPI)
  );
};

/**
 * Returns availability of bundled native tools (ExifTool, FFmpeg, Ghostscript).
 * Calls the IPC handler registered in electron/main.cjs.
 * Returns all-false when not running in Electron.
 */
export const hasNativeTools = async (): Promise<{
  exiftool: boolean;
  ffmpeg: boolean;
  ffprobe: boolean;
  ghostscript: boolean;
}> => {
  if (!isDesktop()) {
    return { exiftool: false, ffmpeg: false, ffprobe: false, ghostscript: false };
  }
  try {
    const { tauriAPI } = await import("./tauriAPI");
    if (tauriAPI?.checkNativeTools) {
      return await tauriAPI.checkNativeTools() as any;
    }
  } catch {
    // ignore
  }
  return { exiftool: false, ffmpeg: false, ffprobe: false, ghostscript: false };
};
