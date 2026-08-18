/**
 * Batch Download Path Store
 * 
 * Session-scoped store that holds the user's "remembered" save path for the
 * current batch. When the user checks "Remember this path for all downloads
 * in this batch", subsequent file downloads skip the Save As dialog and
 * auto-save to this path.
 *
 * The path resets when:
 *   - The user clears all assets (new batch)
 *   - The user explicitly calls resetBatchPath()
 *   - The app restarts (session-scoped, not persisted)
 */

let _batchPath: string | null = null;

/** Get the currently remembered batch download path (null if not set). */
export function getBatchDownloadPath(): string | null {
  return _batchPath;
}

/** Set the remembered batch download path. */
export function setBatchDownloadPath(path: string): void {
  _batchPath = path;
}

/** Clear the remembered batch download path (called on new batch / clear assets). */
export function resetBatchDownloadPath(): void {
  _batchPath = null;
}
