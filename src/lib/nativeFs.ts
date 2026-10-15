/**
 * Native filesystem helpers for the desktop build.
 *
 * WHY THIS MODULE EXISTS
 * Four files — contexts/AssetsContext, lib/FileProcessingService, lib/videoProcessor
 * and lib/zipExporter — called `tempDir()`, `join()`, `writeFile()` and `remove()`
 * without ever importing or defining them. That is 20 TypeScript "cannot find
 * name" errors, and at runtime every one of those calls threw a ReferenceError.
 *
 * The calls sit inside try/catch blocks whose fallback path sends the file
 * through IPC as a byte buffer instead of handing the native side a path, so the
 * app did not crash — it silently took the slow route every single time, for
 * every vector preview, video probe and streaming ZIP export. It also meant the
 * desktop app was never once exercising its fast path in production.
 *
 * The design mirrors lib/tauriAPI.ts deliberately: no static `@tauri-apps`
 * imports, so the module is safe to load in a plain browser. In a browser there
 * is no filesystem to write to, so each function throws a clear error and the
 * caller's existing catch block falls back to the buffer path — which is exactly
 * the behaviour those catch blocks were written to expect.
 */

interface TauriFs {
  tempDir?: () => Promise<string>;
  join?: (...parts: string[]) => Promise<string>;
  writeFile?: (path: string, data: unknown) => Promise<void>;
  remove?: (path: string) => Promise<void>;
}

/**
 * Locates the Tauri filesystem API.
 *
 * Tauri v2 exposes plugin APIs under `__TAURI__`, but the global shape differs
 * between the `withGlobalTauri` and module builds, so both are probed. Returns
 * an empty object when running in a browser.
 */
const getFs = (): TauriFs => {
  if (typeof window === "undefined") return {};

  const tauri = (window as any).__TAURI__;
  if (!tauri) return {};

  // Tauri v2 with `.plugin()` registered, and the legacy v1 `fs` namespace.
  const plugin = tauri.fs ?? tauri.plugin?.fs ?? {};

  // `path` may live in its own namespace.
  const pathApi = tauri.path ?? tauri.plugin?.path ?? {};

  return {
    tempDir: plugin.tempDir?.bind(plugin),
    // path.join is async in Tauri v2, sync in v1 — normalise to async.
    join: pathApi.join ? async (...parts: string[]) => String(pathApi.join(...parts)) : undefined,
    writeFile: plugin.writeFile?.bind(plugin),
    remove: plugin.remove?.bind(plugin),
  };
};

const NOT_AVAILABLE =
  "Native filesystem API is unavailable — this build is running outside the desktop shell.";

/** Absolute path to the OS temp directory. */
export const tempDir = async (): Promise<string> => {
  const fs = getFs();
  if (!fs.tempDir) throw new Error(NOT_AVAILABLE);
  return fs.tempDir();
};

/** Joins path segments using the platform separator. */
export const join = async (...parts: string[]): Promise<string> => {
  const fs = getFs();
  if (!fs.join) throw new Error(NOT_AVAILABLE);
  return fs.join(...parts);
};

/** Writes a stream or buffer to a path. */
export const writeFile = async (path: string, data: unknown): Promise<void> => {
  const fs = getFs();
  if (!fs.writeFile) throw new Error(NOT_AVAILABLE);
  await fs.writeFile(path, data);
};

/** Removes a temp file. Callers treat failure as non-fatal. */
export const remove = async (path: string): Promise<void> => {
  const fs = getFs();
  if (!fs.remove) throw new Error(NOT_AVAILABLE);
  await fs.remove(path);
};

/** True when the native filesystem path can actually be used. */
export const hasNativeFileSystem = (): boolean => {
  const fs = getFs();
  return Boolean(fs.tempDir && fs.join && fs.writeFile);
};
