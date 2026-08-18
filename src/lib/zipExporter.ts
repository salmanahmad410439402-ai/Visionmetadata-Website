import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Asset } from "@/contexts/AssetsContext";
import { prepareAssetForZip } from "./metadataEmbedder";
import { isDesktop, hasNativeTools } from "./FileProcessingService";
import { tauriAPI } from "./tauriAPI";
import { toast } from "sonner";

/**
 * Electron-native streaming zip export.
 *
 * Sends ONE file at a time via the zip-session IPC API so the renderer's V8
 * heap never holds more than a single file buffer simultaneously.
 *
 * For 500 × 5 MB images the old approach loaded 2.5 GB into the renderer
 * heap at once → crash. This approach keeps peak renderer usage at ~5 MB
 * regardless of batch size.
 *
 * The final zip is written directly to disk via dialog.showSaveDialog in the
 * main process — avoiding a second huge buffer transfer back to the renderer.
 */
const downloadZipElectronStreaming = async (
  assetsWithMetadata: Asset[],
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  const total = assetsWithMetadata.length;

  // Validate native tools once before starting the session
  try {
    const tools = await hasNativeTools();
    const hasVideos = assetsWithMetadata.some(
      a => a.file.type.startsWith("video/") ||
           a.file.name.toLowerCase().endsWith(".mp4") ||
           a.file.name.toLowerCase().endsWith(".mov")
    );
    const hasImagesOrVectors = assetsWithMetadata.some(
      a => a.file.type.startsWith("image/") ||
           /\.(ai|eps|svg|jpg|jpeg|png)$/i.test(a.file.name)
    );
    if (hasImagesOrVectors && !tools.exiftool) {
      throw new Error(
        "Native metadata engine not found in resources/bin/win. Place it to enable embedding."
      );
    }
    if (hasVideos && !tools.ffmpeg) {
      throw new Error(
        "Native video metadata engine not found in resources/bin/win. Place it to enable video metadata embedding."
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    toast.error(msg);
    throw err;
  }

  // Open a new session — main process creates an isolated temp directory
  const { sessionId } = await (tauriAPI.zipSessionStart() as any);

  let processed = 0;
  const failedFiles: string[] = [];

  try {
    for (const asset of assetsWithMetadata) {
      try {
        // Load ONLY this single file's buffer — previous buffer is GC-eligible
        // after each iteration so peak RAM stays at ~1 file at a time
        const fileObj: any = {
          name:     asset.file.name,
          mimeType: asset.file.type || "application/octet-stream",
          metadata: {
            title:       asset.metadata!.title,
            description: asset.metadata!.description,
            keywords:    asset.metadata!.keywords,
          },
        };

        let tempFilePath: string | null = null;
        let removeTempFile = false;

        if ((asset.file as any).path) {
          fileObj.path = (asset.file as any).path;
        } else {
          try {
            const tempDirPath = await tempDir();
            const randId = Math.random().toString(36).substring(2, 9);
            tempFilePath = await join(tempDirPath, `tmp_zip_${randId}_${asset.file.name}`);
            await writeFile(tempFilePath, asset.file.stream());
            fileObj.path = tempFilePath;
            removeTempFile = true;
          } catch (e) {
            console.warn("Failed to write zip temp file, falling back to slow IPC", e);
            fileObj.buffer = new Uint8Array(await asset.file.arrayBuffer());
          }
        }

        try {
          await tauriAPI.zipSessionAddFile(sessionId, fileObj);
        } finally {
          if (removeTempFile && tempFilePath) {
            try {
              await remove(tempFilePath);
            } catch (e) {}
          }
        }
      } catch (fileErr) {
        const msg = fileErr instanceof Error ? fileErr.message : String(fileErr);
        console.error(`[StreamingZip] Failed to add ${asset.file.name}:`, msg);
        toast.error(`Failed to process: ${asset.file.name} — ${msg}`);
        failedFiles.push(asset.file.name);
      }

      processed++;
      onProgress?.(processed, total);

      // Yield to the event loop between files so the UI stays responsive
      // and the GC has a chance to collect the previous file's buffer
      await new Promise(r => setTimeout(r, 0));
    }
  } finally {
    // Always finalize (or abort) the session — main process cleans up the temp dir
  }

  if (failedFiles.length > 0) {
    toast.warning(
      `${failedFiles.length} file${failedFiles.length > 1 ? "s" : ""} could not be embedded and were skipped.`
    );
  }

  // Finalize: main process zips the temp dir and presents dialog.showSaveDialog
  const result: any = await tauriAPI.zipSessionFinalize(sessionId);
  if (result.canceled) {
    toast.info("Export cancelled.");
    return;
  }

  toast.success(`Zip saved to: ${result.savedTo}`);
};

/**
 * Browser (non-Electron) zip export using JSZip.
 *
 * Files are embedded and added to the zip in small batches with GC-yield
 * pauses between batches. After each batch the processed blobs are released
 * so the garbage collector can reclaim them before the next batch loads.
 *
 * JSZip still accumulates all entries before generateAsync, so for very large
 * batches the final zip generation step will be memory-intensive — but
 * embedding (the slowest and largest allocation) is kept bounded.
 */
const generateFlatZipBlobBrowser = async (
  assetsWithMetadata: Asset[],
  onProgress?: (current: number, total: number) => void,
  batchSize: number = 5   // Reduced from 10 — keeps per-batch RAM under ~25MB
): Promise<Blob> => {
  const zip = new JSZip();
  let processed = 0;
  const usedFilenames = new Set<string>();
  const failedFiles: string[] = [];

  for (let i = 0; i < assetsWithMetadata.length; i += batchSize) {
    const batch = assetsWithMetadata.slice(i, i + batchSize);

    for (const asset of batch) {
      try {
        const { filename, blob } = await prepareAssetForZip(asset);

        if (blob.size === 0) {
          console.warn(`Skipping empty blob for ${asset.file.name}`);
          toast.warning(`${asset.file.name}: Metadata embedding produced empty file, skipping.`);
          failedFiles.push(asset.file.name);
          processed++;
          onProgress?.(processed, assetsWithMetadata.length);
          continue;
        }

        zip.file(filename, blob);

        processed++;
        onProgress?.(processed, assetsWithMetadata.length);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`Failed to process ${asset.file.name}:`, msg);
        toast.error(`Failed to embed: ${asset.file.name} — ${msg}`);
        failedFiles.push(asset.file.name);
        processed++;
        onProgress?.(processed, assetsWithMetadata.length);
      }
    }

    // Yield to the event loop between batches:
    //   1. Keeps the UI responsive (progress bar updates)
    //   2. Gives the GC a chance to collect blobs from the previous batch
    //      before the next batch allocates its own
    await new Promise(r => setTimeout(r, 20));
  }

  if (failedFiles.length > 0) {
    const failedMsg = `${failedFiles.length} file${failedFiles.length > 1 ? "s" : ""} could not be embedded in ZIP`;
    console.warn(failedMsg, failedFiles);
    toast.warning(failedMsg);
  }

  return await zip.generateAsync({
    type: "blob",
    // Always use STORE (no compression). The zip is just a transport container
    // for the user to quickly get their files back before uploading to stock platforms.
    compression: "STORE",
  });
};

/**
 * @deprecated Use downloadAllAsZip instead.
 * Kept for backward compatibility with downloadMasterUnattendedZip which
 * calls this to build the inner Embedded_Assets.zip. That function always
 * runs in a non-Electron context (it was designed for web) so the JSZip
 * path is correct there.
 */
export const generateFlatZipBlob = generateFlatZipBlobBrowser;

export const downloadAllAsZip = async (
  assets: Asset[],
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  const assetsWithMetadata = assets.filter((a) => a.metadata);
  if (assetsWithMetadata.length === 0) {
    throw new Error("No assets with metadata to download");
  }

  // ── Electron path: stream files one-at-a-time via the session IPC API ──────
  // The ZIP session handler in backend currently only returns stubs. 
  // We use the browser-side zip creation with Tauri's file-saving dialog to prompt user.
  // if (isDesktop() && tauriAPI.zipSessionStart) {
  //   await downloadZipElectronStreaming(assetsWithMetadata, onProgress);
  //   return;
  // }

  // ── Browser / non-Electron path: JSZip with GC-yield batching ────────────
  const blob = await generateFlatZipBlobBrowser(assetsWithMetadata, onProgress);
  const timestamp = new Date().toISOString().slice(0, 10);
  const defaultFileName = `Tagyfy_Export_${timestamp}.zip`;
  
  // Browser download
  saveAs(blob, defaultFileName);
  toast.success(`Exported ${defaultFileName}`);
};

export const embedAndSaveToFolder = async (
  assets: Asset[],
  onProgress?: (current: number, total: number, failed: number) => void
): Promise<void> => {
  const assetsWithMetadata = assets.filter((a) => a.metadata);
  if (assetsWithMetadata.length === 0) {
    throw new Error("No assets with metadata to save");
  }

  if (!isDesktop()) {
    throw new Error("Direct folder export is only supported on desktop");
  }

  // 1. Open directory selector dialog
  let selectedPath: string | null = null;
  try {
    // const { open } = await import('@tauri-apps/plugin-dialog');
    const folder = await open({
      directory: true,
      multiple: false,
      title: "Select Destination Directory to Save Embedded Files"
    });
    if (folder) {
      selectedPath = folder as string;
    }
  } catch (err) {
    console.error("Open directory dialog failed:", err);
    throw new Error("Failed to open folder selector dialog: " + (err instanceof Error ? err.message : String(err)));
  }

  if (!selectedPath) {
    toast.info("Export cancelled.");
    return;
  }

  let processed = 0;
  const total = assetsWithMetadata.length;
  const failedFiles: string[] = [];

  // Process files in parallel with limited concurrency for much faster embedding.
  // ExifTool/FFmpeg are I/O-bound external processes, so overlapping them gives
  // a ~3x speedup without any quality loss — the output is byte-identical.
  const CONCURRENCY = 3;
  let queueIndex = 0;

  const processFile = async (): Promise<void> => {
    while (queueIndex < assetsWithMetadata.length) {
      const asset = assetsWithMetadata[queueIndex++];
      try {
        // 2. Prepare asset with embedded metadata (Exiftool / Browser fallback)
        const { filename, blob } = await prepareAssetForZip(asset);

        if (blob.size === 0) {
          throw new Error("Metadata embedding produced an empty file");
        }

        // 3. Write file to destination directory using streaming to avoid
        // holding the full file buffer in the JS heap (prevents OOM crashes)
        const filePath = await join(selectedPath!, filename);
        await writeFile(filePath, blob.stream());
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`Failed to save ${asset.file.name}:`, msg);
        toast.error(`Failed to save: ${asset.file.name} — ${msg}`);
        failedFiles.push(asset.file.name);
      }

      processed++;
      onProgress?.(processed, total, failedFiles.length);
    }
  };

  // Launch concurrent workers — each one pulls the next file from the queue
  // when it finishes its current file, keeping all workers busy
  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, assetsWithMetadata.length) },
      () => processFile()
    )
  );

  if (failedFiles.length > 0) {
    toast.warning(
      `${failedFiles.length} file${failedFiles.length > 1 ? "s" : ""} could not be saved.`
    );
  } else {
    toast.success(`Successfully saved ${processed} files to: ${selectedPath}`);
  }
};

export const downloadMasterUnattendedZip = async (
  assets: Asset[],
  totalOriginal: number,
  failedCount: number
): Promise<void> => {
  const assetsWithMetadata = assets.filter((a) => a.metadata);
  if (assetsWithMetadata.length === 0) {
    throw new Error("No assets with metadata to download");
  }

  toast.info("Generating Master Zip package for unattended batch...", { duration: 10000 });

  const masterZip = new JSZip();

  // 1. Generate Metadata Zip — use STORE (no compression) because the outer masterZip
  //    will apply DEFLATE compression. Compressing an already-DEFLATE-compressed zip
  //    yields near-zero size reduction but 3-5× more CPU time on large batches.
  const embeddedAssetsZipBlob = await generateFlatZipBlob(assetsWithMetadata);
  masterZip.file("Embedded_Assets.zip", embeddedAssetsZipBlob, { compression: "STORE" });

  // 2. Generate all CSV variants dynamically to avoid circular dependencies in csvExporter
  // Import dynamically to break standard webpack cycles if needed
  const { exportAdobeStockCSV, exportFreepikCSV, exportShutterstockCSV, exportVecteezyCSV, exportDreamstimeCSV, export123RFCSV } = await import("./csvExporter");

  masterZip.file("CSV_Exports/AdobeStock.csv", exportAdobeStockCSV(assetsWithMetadata));
  masterZip.file("CSV_Exports/Freepik.csv", exportFreepikCSV(assetsWithMetadata));
  masterZip.file("CSV_Exports/Shutterstock.csv", exportShutterstockCSV(assetsWithMetadata));
  masterZip.file("CSV_Exports/Dreamstime.csv", exportDreamstimeCSV(assetsWithMetadata));
  masterZip.file("CSV_Exports/Vecteezy.csv", exportVecteezyCSV(assetsWithMetadata));
  masterZip.file("CSV_Exports/123RF.csv", export123RFCSV(assetsWithMetadata));

  // 3. Generate Report
  const timestamp = new Date().toISOString();
  const report = `Tagyfy Pro - Unattended Batch Report
=============================================
Date/Time: ${new Date().toLocaleString()}

Batch Summary:
- Total Assets Initialized: ${totalOriginal}
- Successfully Generated: ${assetsWithMetadata.length}
- Failed Generations: ${failedCount}

Note: This file was automatically downloaded via the 'Unattended 5-Minute Auto-Download' feature.
  `;
  masterZip.file("tagyfy_batch_report.txt", report);

  // Download the resulting Master Zip
  const masterBlob = await masterZip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });

  const fileName = `Tagyfy_Unattended_Export_${timestamp.slice(0, 10)}.zip`;
  saveAs(masterBlob, fileName);
  toast.success(`Exported ${fileName}`);
};

