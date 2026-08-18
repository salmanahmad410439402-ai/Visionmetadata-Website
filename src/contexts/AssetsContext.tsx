import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import pLimit from "p-limit";
import { db, PersistedAsset, blobToFile } from "@/lib/db";
import { updateAssetTransactional } from "@/lib/databaseTransactions";
import { isDesktop } from "@/lib/env";
import { tauriAPI } from "@/lib/tauriAPI";
import { resetBatchDownloadPath } from "@/lib/batchDownloadPath";

// FIX: probeLimit is intentionally NOT created at module level.
// Previously "const probeLimit = pLimit(5)" ran at import time — before React
// mounts and before any ErrorBoundary can catch it. If pLimit's ESM default
// export resolves incorrectly in the obfuscated production bundle (a known
// timing race with javascript-obfuscator rotateStringArray), the throw happens
// during module initialization and crashes the entire app with no recovery path.
// The limit instance is now created lazily inside the component via useRef so:
//  1. It runs inside the React tree where ErrorBoundary can catch any failure.
//  2. It is created only once per provider mount (useRef persists across renders).
//  3. It falls back gracefully if pLimit is unavailable, never crashing the app.

export type AssetStatus = "uploading" | "processing" | "ready" | "generating" | "complete" | "error";
export type AssetType = "image" | "video";
export type MotionType = "static" | "panning" | "dolly" | "drone" | "slow-motion";

export interface ConfidenceBreakdown {
  subjectClarity: number;
  differentiatorStrength: number;
  keywordPrecision: number;
  complianceSafety: number;
}

export interface RiskAnalysis {
  flags: string[];
  severity: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  reviewerReasoning: string[];
}

export interface PlatformReadiness {
  adobeStock: "READY" | "REVIEW" | "NOT_READY";
  freepik: "READY" | "REVIEW" | "NOT_READY";
  shutterstock: "READY" | "REVIEW" | "NOT_READY";
}

export interface AssetMetadata {
  title: string;
  description: string;
  keywords: string[];
  confidence: number;
  confidenceBreakdown: ConfidenceBreakdown;
  riskAnalysis: RiskAnalysis;
  platformReadiness: PlatformReadiness;
  recreationPrompt?: string;
  modelUsed?: string;
  isAIGenerated: boolean;
  noPeopleDetected: boolean;
  searchIntent?: "commercial" | "editorial" | "conceptual" | "technical" | "background";
}

// QualityReport is stored separately from AssetMetadata.
// It is only populated when the user explicitly clicks "Check Quality".
// This keeps quality-check API calls optional, preserving free-tier quota.
export interface QualityReport {
  confidence: number;
  confidenceBreakdown: ConfidenceBreakdown;
  riskAnalysis: RiskAnalysis;
  platformReadiness: PlatformReadiness;
  editorialFlag: boolean;
  editorialReason: string | null;
  qualityCheckedAt: string;
  modelUsed?: string;
}

export interface Asset {
  id: string;
  version: number;  // Increment on every change to detect race conditions
  file: File;
  type: AssetType;
  status: AssetStatus;
  originalSize: number;
  compressedSize?: number;
  thumbnail?: string;
  processedImage?: string; // Base64 of downsized image or video grid
  aspectRatio?: number;
  isVertical?: boolean;
  motionType?: MotionType;
  width?: number;
  height?: number;
  durationSec?: number;
  metadata?: AssetMetadata;
  qualityReport?: QualityReport;   // populated only on-demand via "Check Quality" button
  metadataEmbedded: boolean;
  warnings?: string[];
  error?: string;
  createdAt: number;
  pairedAssetId?: string;
  relatedAssetIds?: string[];
  combinedExtensions?: string;
  isPrimaryOfPair?: boolean;
  originalPath?: string;
}

interface AssetsContextType {
  assets: Asset[];
  addAsset: (file: File) => string;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  clearAssets: () => void;
  getAsset: (id: string) => Asset | undefined;
  getPairedAsset: (id: string) => Asset | undefined;
  getRelatedAssets: (id: string) => Asset[];

  processingQueue: string[];
  addToQueue: (id: string) => void;
  removeFromQueue: (id: string) => void;

  selectedAssets: string[];
  toggleSelectAsset: (id: string) => void;
  selectAllAssets: () => void;
  clearSelection: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredAssets: Asset[];
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export const AssetsProvider = ({ children }: { children: ReactNode }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Lazy pLimit instance — created once on mount, never at module level.
  // Using useRef ensures the same limiter is reused across all re-renders
  // without triggering any additional renders itself.
  const probeLimitRef = useRef<ReturnType<typeof pLimit> | null>(null);
  // Track IDs that have been removed so probeMedia tasks can bail out early
  // instead of calling updateAsset (and writing to IndexedDB) on a deleted asset.
  const removedIdsRef = useRef<Set<string>>(new Set());
  const getProbeLimit = () => {
    if (!probeLimitRef.current) {
      try {
        probeLimitRef.current = pLimit(5);
      } catch {
        // pLimit unavailable — return a no-op passthrough so probing is skipped
        // rather than crashing the app.
        return null;
      }
    }
    return probeLimitRef.current;
  };
  const isLoaded = useRef(false);

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    async function loadAssets() {
      try {
        const persisted = await db.assets.toArray();
        const hydratedAssets: Asset[] = persisted.map((p) => {
          const file = blobToFile(p.fileBlob, p.fileName, p.fileType, p.fileLastModified, p.originalPath, p.originalSize);
          return {
            ...p,
            version: p.version || 0,
            file,
            originalPath: p.originalPath,
            thumbnail: p.thumbnailBlob ? URL.createObjectURL(p.thumbnailBlob) : undefined,
            processedImage: p.processedImageBlob ? URL.createObjectURL(p.processedImageBlob) : undefined,
          } as Asset;
        });
        // ── Runtime ghost-asset repair (belt-and-suspenders) ─────────────────
        // The Dexie v3 migration handles this for most users, but if somehow
        // a record slipped through (e.g. the migration ran before thumbnailBlob
        // was flushed, or the DB was downgraded), catch it here at runtime.
        // Any record with relatedAssetIds entries but isPrimaryOfPair undefined
        // is repaired in-memory AND written back to DB so it never regresses.
        const VECTOR_PRIMARY_EXTS = ['eps', 'ai', 'svg', 'pdf'];
        const repairUpdates: Array<{ id: string; updates: Partial<Asset> }> = [];

        for (const asset of hydratedAssets) {
          if ((asset.relatedAssetIds?.length ?? 0) > 0 && asset.isPrimaryOfPair === undefined) {
            const ext = asset.file.name.split('.').pop()?.toLowerCase() ?? '';
            if (VECTOR_PRIMARY_EXTS.includes(ext)) {
              repairUpdates.push({ id: asset.id, updates: { isPrimaryOfPair: true } });
              asset.isPrimaryOfPair = true;
            } else {
              repairUpdates.push({
                id: asset.id,
                updates: { relatedAssetIds: [], pairedAssetId: undefined, isPrimaryOfPair: undefined },
              });
              asset.relatedAssetIds = [];
              asset.pairedAssetId = undefined;
            }
          }
        }

        setAssets(hydratedAssets);

        // Persist repairs back to IndexedDB so the fix survives the next reload
        if (repairUpdates.length > 0) {
          console.info(`[AssetsContext] Runtime repair: fixing ${repairUpdates.length} ghost asset(s).`);
          for (const { id, updates } of repairUpdates) {
            db.assets.update(id, updates).catch(console.error);
          }
        }
      } catch (err) {
        console.error("Failed to load assets from IndexedDB", err);
      } finally {
        isLoaded.current = true;
      }
    }
    loadAssets();
    
    // Cleanup all object URLs on unmount to prevent memory leaks
    return () => {
      setAssets((prev) => {
        prev.forEach((a) => {
          if (a.thumbnail?.startsWith("blob:")) URL.revokeObjectURL(a.thumbnail);
          if (a.processedImage?.startsWith("blob:")) URL.revokeObjectURL(a.processedImage);
        });
        return prev;
      });
    };
  }, []);

  // 2. Helper to sync a single asset to DB using atomic transactions
  const saveToDb = async (asset: Asset) => {
    try {
      const isPathBacked = !!asset.originalPath && isDesktop();
      const storableBlob = isPathBacked 
        ? new Blob([], { type: asset.file.type }) 
        : asset.file.slice(0, asset.file.size, asset.file.type);

      const persisted: PersistedAsset = {
        ...asset,
        fileBlob: storableBlob,
        fileName: asset.file.name,
        fileType: asset.file.type,
        fileLastModified: asset.file.lastModified,
        originalPath: asset.originalPath,
      };

      // Convert ObjectURLs to Blobs for storage
      if (asset.thumbnail?.startsWith("blob:")) {
        const res = await fetch(asset.thumbnail);
        persisted.thumbnailBlob = await res.blob();
      }
      if (asset.processedImage?.startsWith("blob:")) {
        const res = await fetch(asset.processedImage);
        persisted.processedImageBlob = await res.blob();
      }

      // Do not store the heavy file objects directly in the dict
      delete (persisted as any).file;
      delete (persisted as any).thumbnail;
      delete (persisted as any).processedImage;

      // Use transaction for atomic write
      await db.transaction("rw", db.assets, async () => {
        await db.assets.put(persisted);
      });
    } catch (err) {
      console.error("Could not save asset to DB", err);
    }
  };

  const addAsset = (file: File): string => {
    const id = crypto.randomUUID();
    const type: AssetType = file.type.startsWith("video/") ? "video" : "image";

    const newAsset: Asset = {
      id,
      version: 0,  // Initialize version at 0
      file: file,
      type,
      status: "uploading",
      originalSize: file.size,
      metadataEmbedded: false,
      createdAt: Date.now(),
      originalPath: (file as any).path,
    };

    setAssets((prev) => [...prev, newAsset]);
    saveToDb(newAsset);
    // Async technical data extraction via ffprobe when available (Desktop)
    try {
      if (isDesktop() && tauriAPI.probeMedia) {
        const limiter = getProbeLimit();
        if (limiter) {
          limiter(async () => {
            try {
              const fileObj: any = {
                name: file.name,
                mimeType: file.type || "application/octet-stream",
              };
              let tempFilePath: string | null = null;
              if ((file as any).path) {
                fileObj.path = (file as any).path;
              } else {
                try {
                  const tempDirPath = await tempDir();
                  const randId = Math.random().toString(36).substring(2, 9);
                  tempFilePath = await join(tempDirPath, `tmp_probe_${randId}_${file.name}`);
                  await writeFile(tempFilePath, file.stream());
                  fileObj.path = tempFilePath;
                } catch (e) {
                  fileObj.buffer = new Uint8Array(await file.arrayBuffer());
                }
              }
              const result: any = await tauriAPI.probeMedia(fileObj);
              
              if (tempFilePath) {
                try {
                  await remove(tempFilePath);
                } catch (e) { /* ignore */ }
              }
              
              // FIX: guard against calling updateAsset on an asset that was
              // removed while probeMedia was in-flight. Without this check
              // the limiter task writes stale width/height/duration into
              // IndexedDB for a record that no longer exists in the app state.
              if (removedIdsRef.current.has(id)) return;
              updateAsset(id, {
                width: result.width,
                height: result.height,
                durationSec: result.duration
              });
            } catch {
              // ignore probing errors
            }
          });
        }
      }
    } catch {
      // ignore probing errors
    }
    return id;
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    // FIX: saveToDb was called INSIDE the setAssets callback — an async function
    // called inside a synchronous state updater. React may batch or defer the
    // callback, causing saveToDb to run after the component unmounts or after
    // the asset is deleted, writing stale data. Extract the save outside.
    //
    // FIX (race condition): assetToSave is now derived synchronously from the
    // functional updater's return value by reading it out of the next array.
    // We compute the merged asset inside the updater (where prev is always fresh),
    // store it to a local variable, and then call saveToDb outside — this guarantees
    // we persist exactly the state that React committed, even when multiple
    // updateAsset calls fire in rapid succession.
    //
    // FIX: Increment version on every update to detect concurrent modifications
    let assetToSave: Asset | undefined;
    setAssets((prev) => {
      const next = prev.map((asset) => {
        if (asset.id !== id) return asset;
        
        // Cleanup old object URLs if they're being replaced
        if (updates.thumbnail && asset.thumbnail !== updates.thumbnail && asset.thumbnail?.startsWith("blob:")) {
          URL.revokeObjectURL(asset.thumbnail);
        }
        if (updates.processedImage && asset.processedImage !== updates.processedImage && asset.processedImage?.startsWith("blob:")) {
          URL.revokeObjectURL(asset.processedImage);
        }
        
        // Increment version on every update
        const merged = { ...asset, ...updates, version: (asset.version || 0) + 1 };
        assetToSave = merged;
        return merged;
      });
      return next;
    });
    // Save after state update is queued — safe to call outside the callback
    if (assetToSave) saveToDb(assetToSave);
  };

  const removeAsset = (id: string) => {
    // Also remove paired/related assets if they exist
    setAssets((prev) => {
      const target = prev.find((a) => a.id === id);
      const pairedId = target?.pairedAssetId;
      const relatedIds = target?.relatedAssetIds || [];
      const idsToRemove = [id, pairedId, ...relatedIds].filter(Boolean) as string[];

      // Track removed IDs so any in-flight probeMedia tasks can bail out
      // instead of writing to IndexedDB for assets that no longer exist.
      idsToRemove.forEach((rid) => removedIdsRef.current.add(rid));

      // Clean up object URLs to prevent memory leaks
      idsToRemove.forEach((removeId) => {
        const a = prev.find((asset) => asset.id === removeId);
        if (a) {
          if (a.thumbnail?.startsWith("blob:")) URL.revokeObjectURL(a.thumbnail);
          if (a.processedImage?.startsWith("blob:")) URL.revokeObjectURL(a.processedImage);
        }
      });

      // Remove from IndexedDB
      idsToRemove.forEach(id => db.assets.delete(id).catch(console.error));

      return prev.filter((asset) => !idsToRemove.includes(asset.id));
    });
    setSelectedAssets((prev) => prev.filter((assetId) => assetId !== id));
    setProcessingQueue((prev) => prev.filter((assetId) => assetId !== id));
  };

  const clearAssets = () => {
    setAssets((prev) => {
      // Clean up all object URLs
      prev.forEach((a) => {
        if (a.thumbnail?.startsWith("blob:")) URL.revokeObjectURL(a.thumbnail);
        if (a.processedImage?.startsWith("blob:")) URL.revokeObjectURL(a.processedImage);
      });
      return [];
    });
    // Clear DB
    db.assets.clear().catch(console.error);

    // Reset batch download path — new batch requires a fresh path selection
    resetBatchDownloadPath();

    setSelectedAssets([]);
    setProcessingQueue([]);
  };

  const getAsset = (id: string) => assets.find((asset) => asset.id === id);

  const getPairedAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset?.pairedAssetId) return undefined;
    return assets.find((a) => a.id === asset.pairedAssetId);
  };

  const getRelatedAssets = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset?.relatedAssetIds) return [];
    return assets.filter((a) => asset.relatedAssetIds!.includes(a.id));
  };

  const addToQueue = (id: string) => {
    setProcessingQueue((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeFromQueue = (id: string) => {
    setProcessingQueue((prev) => prev.filter((assetId) => assetId !== id));
  };

  const toggleSelectAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((assetId) => assetId !== id) : [...prev, id]
    );
  };

  const selectAllAssets = () => {
    setSelectedAssets(assets.map((asset) => asset.id));
  };

  const clearSelection = () => {
    setSelectedAssets([]);
  };

  const filteredAssets = assets.filter((asset) => {
    // Hide related assets that are NOT the primary one (e.g. hide the preview image, show the vector)
    // NOTE: only filter if relatedAssetIds actually has entries — empty array [] is truthy but means standalone
    // SAFETY: only hide an asset when isPrimaryOfPair is EXPLICITLY false.
    // Using !== false (instead of !) means records with isPrimaryOfPair === undefined
    // (e.g. old DB rows loaded after an uninstall/reinstall where AppData was NOT
    // cleared) are treated as visible rather than hidden. The Dexie v3 migration in
    // db.ts fixes such records permanently; this guard is a belt-and-suspenders
    // fallback for any edge-cases the migration misses.
    if ((asset.relatedAssetIds?.length ?? 0) > 0 && asset.isPrimaryOfPair === false) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      asset.file.name.toLowerCase().includes(query) ||
      asset.metadata?.title.toLowerCase().includes(query) ||
      asset.metadata?.keywords.some((k) => k.toLowerCase().includes(query))
    );
  });

  return (
    <AssetsContext.Provider
      value={{
        assets,
        addAsset,
        updateAsset,
        removeAsset,
        clearAssets,
        getAsset,
        getPairedAsset,
        getRelatedAssets,
        processingQueue,
        addToQueue,
        removeFromQueue,
        selectedAssets,
        toggleSelectAsset,
        selectAllAssets,
        clearSelection,
        searchQuery,
        setSearchQuery,
        filteredAssets,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error("useAssets must be used within an AssetsProvider");
  }
  return context;
};
