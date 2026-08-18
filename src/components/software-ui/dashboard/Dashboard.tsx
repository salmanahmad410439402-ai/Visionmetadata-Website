 import { useState, useCallback } from "react";
import { Navbar } from "./Navbar";
import { UploadZone } from "./UploadZone";
import { AssetGrid } from "./AssetGrid";
import { ViewType } from "./ViewToggle";
import { SettingsModal } from "../settings/SettingsModal";
import { ExportModal } from "../export/ExportModal";
import { useSettings } from "@/contexts/SettingsContext";
import { useAssets } from "@/contexts/AssetsContext";
import { generateMetadata } from "@/lib/aiService";
import { resetAllKeyStatuses, resetRoundRobinCounter, resetAllQuotas } from "@/lib/ai/keyRotation";
import { getSystemPrompt, getUserPrompt } from "@/lib/seoPrompts";
import { downloadAllAsZip, downloadMasterUnattendedZip, embedAndSaveToFolder } from "@/lib/zipExporter";
import { isDesktop } from "@/lib/env";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicIsland } from "./DynamicIsland";
import { CommandPalette } from "@/components/ui/command-palette";
import { BatchProgressState } from "./BatchProgress";
import { BulkEditorModal } from "./BulkEditorModal";
import { useRef, useEffect } from "react";
import type { Asset, AssetMetadata } from "@/contexts/AssetsContext";
import { formatErrorForUser, safeConsoleError } from "@/lib/errorSanitizer";
import { OfflineDetection } from "@/lib/offlineDetection";
import { ConfirmDialog, ConfirmDialogPresets } from "@/components/ConfirmDialog";
import { toast } from "sonner";

export const Dashboard = () => {
  const { isSettingsOpen, setIsSettingsOpen, activeApiKeys, metadataSettings, selectedModel, eventEnabled, eventName } = useSettings();
  const { assets, filteredAssets, updateAsset, addToQueue, removeFromQueue, removeAsset, selectedAssets, toggleSelectAsset, selectAllAssets, clearSelection, processingQueue } = useAssets();
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [sortFilter, setSortFilter] = useState<"all" | "generated" | "remaining" | "failed">("all");
  const [showSelection, setShowSelection] = useState(false);
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [batchState, setBatchState] = useState<BatchProgressState>({
    isActive: false,
    total: 0,
    completed: 0,
    failed: 0,
    activeWorkers: 0,
    startTime: null,
  });
  const isGenerating = processingQueue.length > 0;
  const [pendingAutoRetry, setPendingAutoRetry] = useState(false);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });
  const [failedAssetsCount, setFailedAssetsCount] = useState(0);
  const hasFailedAssets = assets.some((a) => a.status === "error");

  // ── Confirmation Dialog State ────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "deleteSelected" | "clearAll" | "clearFailed" | null;
    isLoading: boolean;
  }>({
    open: false,
    type: null,
    isLoading: false,
  });

  // ── Cancellation ref ─────────────────────────────────────────────────────
  // A plain ref so worker closures read the latest value synchronously without
  // triggering re-renders. Set to true → all workers stop at their next checkpoint
  // (before starting a new asset, not mid-asset).
  const isCancelledRef = useRef(false);

  const handleCancelGeneration = useCallback(() => {
    isCancelledRef.current = true;
    setBatchState(prev => ({ ...prev, isActive: false }));
    toast.info("Stopping… current assets will finish, no new ones will start.");
  }, []);

  const unattendedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const assetsRef = useRef(assets);
  // Store the activity handlers so they can be explicitly removed on unmount.
  // { once: true } only auto-removes a listener when it fires — if the component
  // unmounts before the user moves/clicks/types the listeners remain dangling.
  const activityHandlersRef = useRef<Array<{ type: string; fn: EventListener }>>([]);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  // Cleanup: clear timer and remove any dangling activity listeners on unmount.
  useEffect(() => {
    return () => {
      if (unattendedTimerRef.current) {
        clearTimeout(unattendedTimerRef.current);
        unattendedTimerRef.current = null;
      }
      activityHandlersRef.current.forEach(({ type, fn }) => {
        window.removeEventListener(type, fn);
      });
      activityHandlersRef.current = [];
    };
  }, []);

  // ── Offline Detection System ─────────────────────────────────────────────
  // Monitor connection status and show notifications when coming back online
  useEffect(() => {
    // Update failed assets count
    const failedCount = assets.filter((a) => a.status === "error").length;
    setFailedAssetsCount(failedCount);

    // Listen for connection restoration
    const unsubscribeOnline = OfflineDetection.onOnline(() => {
      setIsOnline(true);
      toast.success("🌐 Connection restored! You can now resume processing.");
      
      // Count failed assets after connection restored
      const newFailedCount = assets.filter((a) => a.status === "error").length;
      if (newFailedCount > 0) {
        toast.info(`${newFailedCount} asset(s) failed during offline period.`);
      }
    });

    // Listen for connection loss
    const unsubscribeOffline = OfflineDetection.onOffline(() => {
      setIsOnline(false);
      toast.warning("📡 Connection lost. Processing will pause. Failed assets can be retried when online.");
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [assets]);

  const clearUnattendedTimer = useCallback(() => {
    if (unattendedTimerRef.current) {
      clearTimeout(unattendedTimerRef.current);
      unattendedTimerRef.current = null;
      toast.info("Activity detected - Unattended auto-download cancelled.");
    }
    // Remove any still-pending activity listeners when the timer is cleared
    activityHandlersRef.current.forEach(({ type, fn }) => {
      window.removeEventListener(type, fn);
    });
    activityHandlersRef.current = [];
  }, []);

  const startUnattendedTimer = useCallback((totalAssets: number, failedCount: number) => {
    if (unattendedTimerRef.current) clearTimeout(unattendedTimerRef.current);

    // Remove any previous activity listeners before registering new ones
    activityHandlersRef.current.forEach(({ type, fn }) => {
      window.removeEventListener(type, fn);
    });
    activityHandlersRef.current = [];

    // 5 minutes timer
    unattendedTimerRef.current = setTimeout(async () => {
      try {
        await downloadMasterUnattendedZip(assetsRef.current, totalAssets, failedCount);
        toast.success("Unattended Master Zip exported successfully!");
      } catch (err) {
        console.error("Auto-export failed:", err);
      } finally {
        unattendedTimerRef.current = null;
        activityHandlersRef.current = [];
      }
    }, 5 * 60 * 1000);

    toast.info("Unattended mode active: Master zip will auto-download in 5 minutes if idle.", { duration: 5000 });

    // Cancel on interaction — store handlers so they can be removed on unmount
    const handleActivity = () => clearUnattendedTimer();
    const events = ["mousemove", "keydown", "click"] as const;
    events.forEach((type) => {
      window.addEventListener(type, handleActivity, { once: true });
      activityHandlersRef.current.push({ type, fn: handleActivity as EventListener });
    });
  }, [clearUnattendedTimer]);

  const handleUpload = () => {
    setShowUploadZone(true);
  };


  const handleExportCSV = () => {
    const assetsWithMeta = assets.filter((a) => a.metadata);
    if (assetsWithMeta.length === 0) {
      toast.error("No assets with metadata to export");
      return;
    }
    setShowExportModal(true);
  };

  const handleDownloadZip = async () => {
    const assetsWithMeta = assets.filter((a) => a.metadata);
    if (assetsWithMeta.length === 0) {
      toast.error(isDesktop() ? "No assets with metadata to save" : "No assets with metadata to download");
      return;
    }

    try {
      setIsDownloadingZip(true);
      if (isDesktop()) {
        toast.info(`Preparing to save ${assetsWithMeta.length} assets...`);
        
        // Initialize Dynamic Island for folder saving
        setBatchState({
          isActive: true,
          total: assetsWithMeta.length,
          completed: 0,
          failed: 0,
          activeWorkers: 1,
          startTime: Date.now(),
          label: "Saving Files"
        });

        await embedAndSaveToFolder(assetsWithMeta, (current, total, failedCount) => {
          setBatchState(prev => ({
            ...prev,
            completed: current - failedCount,
            failed: failedCount
          }));
        });

        // Close Dynamic Island progress card after save finishes
        setBatchState(prev => ({ ...prev, isActive: false }));
      } else {
        toast.info(`Preparing zip with ${assetsWithMeta.length} assets...`);
        await downloadAllAsZip(assetsWithMeta, (current, total) => {
          // Could show progress here
        });
        toast.success("Zip download complete!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
      setBatchState(prev => ({ ...prev, isActive: false }));
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleGenerateSingle = useCallback(async (
    assetId: string
  ): Promise<boolean | undefined> => {
    // FIX: use assetsRef.current instead of the `assets` closure value.
    // During batch processing the `assets` snapshot captured at useCallback
    // creation time can be stale — new assets may have been added or existing
    // ones updated since the last render. assetsRef is kept in sync with every
    // assets state change via the useEffect below, so it always reflects the
    // current list without causing the callback to be recreated on every render.
    const asset = assetsRef.current.find((a) => a.id === assetId);
    if (!asset) return;
    const isVector = /\.(ai|eps|svg)$/i.test(asset.file.name);
    const assetImage = asset.processedImage || ((isVector || asset.type === "video") ? asset.thumbnail : undefined);
    if (!assetImage) return;

    try {
      addToQueue(assetId);
      updateAsset(assetId, { status: "generating" });

      let metadata: any;
      const maxAttempts = asset.type === "video" ? 3 : 1;
      let lastErr: Error | null = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          metadata = await generateMetadata(
            assetImage,
            activeApiKeys,
            metadataSettings,
            asset.type === "video",
            asset.isVertical || false,
            false,
            asset.motionType,
            selectedModel,
            eventEnabled,
            eventName,
            asset.file
          );
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e instanceof Error ? e : new Error(String(e));
          // For provider refusal or transient errors, try again up to maxAttempts
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          } else {
            throw lastErr;
          }
        }
      }

      // If auto-embed is enabled, embed metadata immediately after generation
      if (metadataSettings.autoEmbed) {
        updateAsset(assetId, {
          status: "complete",
          metadata,
          metadataEmbedded: true,
          error: undefined,
          errorDetails: undefined
        });
        // Sync to related assets
        if (asset.relatedAssetIds) {
          asset.relatedAssetIds.forEach(id => {
            updateAsset(id, {
              status: "complete",
              metadata,
              metadataEmbedded: true,
              error: undefined,
              errorDetails: undefined
            });
          });
        }
      } else {
        updateAsset(assetId, {
          status: "complete",
          metadata,
          error: undefined,
          errorDetails: undefined
        });
        // Sync to related assets
        if (asset.relatedAssetIds) {
          asset.relatedAssetIds.forEach(id => {
            updateAsset(id, {
              status: "complete",
              metadata,
              error: undefined,
              errorDetails: undefined
            });
          });
        }
      }

      toast.success(`Generated metadata for ${asset.file.name}`);
      return true;
    } catch (error) {
      const sanitizedError = formatErrorForUser(error);
      const errorDetails = error instanceof Error ? error.message : String(error);
      
      // Log detailed error for debugging
      console.error(`[Metadata Generation] Failed for ${asset.file.name}:`, {
        error: errorDetails,
        assetType: asset.type,
        fileName: asset.file.name,
        selectedModel
      });
      
      updateAsset(assetId, {
        status: "error",
        error: sanitizedError
      });
      
      // Show user-friendly error message
      toast.error(`Failed to generate metadata`, {
        description: sanitizedError,
        duration: 6000
      });
      
      return false;
    } finally {
      removeFromQueue(assetId);
    }
  }, [assets, activeApiKeys, metadataSettings, selectedModel, addToQueue, removeFromQueue, updateAsset]);

  /**
   * Process assets using API keys with 5-image-per-key rotation.
   */
  const processApiTrack = useCallback(async (
    apiAssets: Asset[],
    onProgress: (completed: number, failed: number) => void
  ): Promise<{ completed: number; failed: number }> => {
    if (apiAssets.length === 0 || activeApiKeys.length === 0) {
      return { completed: 0, failed: 0 };
    }

    let completed = 0;
    let failed = 0;
    let currentIndex = 0;
    let activeWorkers = 0;

    // Concurrency based on batch mode
    const CONCURRENCY_LIMIT = metadataSettings.batchMode
      ? Math.min(Math.max(activeApiKeys.length * 2, 6), 12)
      : 3;
    const STAGGER_DELAY_MS = metadataSettings.batchMode ? 200 : 1500;

    return new Promise((resolve) => {
      const startNextWorker = async () => {
        if (isCancelledRef.current) {
          if (activeWorkers === 0) resolve({ completed, failed });
          return;
        }

        if (currentIndex >= apiAssets.length) {
          if (activeWorkers === 0) resolve({ completed, failed });
          return;
        }

        const asset = apiAssets[currentIndex++];
        activeWorkers++;

        // Track delta for this single asset (always 1 total, either success or fail)
        let workerDeltaCompleted = 0;
        let workerDeltaFailed = 0;

        try {
          const success = await handleGenerateSingle(asset.id);
          if (success) {
            completed++;
            workerDeltaCompleted = 1;
          } else {
            failed++;
            workerDeltaFailed = 1;
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`[API Worker] Failed to process ${asset.file.name}:`, errorMsg);
          failed++;
          workerDeltaFailed = 1;
        } finally {
          activeWorkers--;
          // Pass DELTA (1 asset just finished), not the running total.
          // onProgress uses += so passing the running total would make
          // completedCount grow as 1+2+3+...+n instead of n.
          onProgress(workerDeltaCompleted, workerDeltaFailed);
          // Continue with next
          startNextWorker();
        }
      };

      // Start initial pool
      const initialWorkers = Math.min(apiAssets.length, CONCURRENCY_LIMIT);
      for (let i = 0; i < initialWorkers; i++) {
        setTimeout(() => startNextWorker(), i * STAGGER_DELAY_MS);
      }
    });
  }, [activeApiKeys.length, metadataSettings.batchMode, handleGenerateSingle]);

  const handleGenerateAll = useCallback(async () => {
    const readyAssets = assets.filter((a) => {
      // Hide related assets that are NOT the primary one
      if (a.relatedAssetIds && !a.isPrimaryOfPair) return false;
      if (a.status !== "ready") return false;
      if (a.processedImage) return true;
      const name = a.file.name.toLowerCase();
      return (/\.(ai|eps|svg)$/.test(name) || a.type === "video") && !!a.thumbnail;
    });

    if (readyAssets.length === 0) {
      toast.error("No assets ready for processing");
      return;
    }

    // Reset cancellation flag and key rotation at the start of every batch.
    isCancelledRef.current = false;
    resetRoundRobinCounter();
    resetAllQuotas(); // NEW: Reset the 5-image-per-key quotas

    const total = readyAssets.length;
    let completedCount = 0;
    let failedCount = 0;

    setBatchState({
      isActive: true,
      total,
      completed: 0,
      failed: 0,
      activeWorkers: 0,
      startTime: Date.now()
    });

    // Progress callback
    const onProgress = (trackCompleted: number, trackFailed: number) => {
      completedCount += trackCompleted;
      failedCount += trackFailed;
      setBatchState(prev => ({
        ...prev,
        completed: completedCount,
        failed: failedCount
      }));
    };

    try {
      const result = await processApiTrack(readyAssets, onProgress);
      completedCount = result.completed;
      failedCount = result.failed;

      // Final state update
      setBatchState(prev => ({
        ...prev,
        completed: completedCount,
        failed: failedCount,
        isActive: false
      }));

      if (failedCount > 0 && metadataSettings.autoRetry) {
        toast.info(`Auto-retry enabled: Retrying ${failedCount} failed assets in 3 seconds...`);
        setTimeout(() => {
          setPendingAutoRetry(true);
        }, 3000);
      } else {
        toast.success(`Batch processing complete! ${completedCount} succeeded, ${failedCount} failed.`);
        startUnattendedTimer(total, failedCount);
      }
    } catch (error) {
      safeConsoleError("Batch processing error:", error);
      const sanitizedError = formatErrorForUser(error);
      toast.error("Batch processing encountered an error: " + sanitizedError);
      setBatchState(prev => ({ ...prev, isActive: false }));
    }
  }, [assets, activeApiKeys, metadataSettings, handleGenerateSingle, processApiTrack]);

  const handleRetryAllFailed = useCallback(async () => {
    const failedAssets = assets.filter((a) => {
      // Hide related assets that are NOT the primary one
      if (a.relatedAssetIds && !a.isPrimaryOfPair) return false;
      return a.status === "error";
    });

    if (failedAssets.length === 0) {
      toast.error("No failed assets to retry");
      return;
    }

    // Reset cancel flag, key exhaustion statuses, quotas, and failed assets
    isCancelledRef.current = false;
    resetAllKeyStatuses();     // Reset exhaustion state on all keys
    resetRoundRobinCounter();  // Restart round-robin distribution from key[0]
    resetAllQuotas();          // Reset 5-image-per-key quotas
    failedAssets.forEach((asset) => {
      updateAsset(asset.id, { status: "ready", error: undefined });
    });

    const total = failedAssets.length;
    let completedCount = 0;
    let failedCount = 0;

    setBatchState({
      isActive: true,
      total,
      completed: 0,
      failed: 0,
      activeWorkers: 0,
      startTime: Date.now()
    });

    // Progress callback
    const onProgress = (trackCompleted: number, trackFailed: number) => {
      completedCount += trackCompleted;
      failedCount += trackFailed;
      setBatchState(prev => ({
        ...prev,
        completed: completedCount,
        failed: failedCount
      }));
    };

    try {
      const result = await processApiTrack(failedAssets, onProgress);
      completedCount = result.completed;
      failedCount = result.failed;

      // Final state update
      setBatchState(prev => ({
        ...prev,
        completed: completedCount,
        failed: failedCount,
        isActive: false
      }));

      if (failedCount > 0 && metadataSettings.autoRetry) {
        toast.info(`Auto-retry enabled: Retrying ${failedCount} failed assets again in 3 seconds...`);
        setTimeout(() => {
          setPendingAutoRetry(true);
        }, 3000);
      } else {
        toast.success(`Retry processing complete! ${completedCount} succeeded, ${failedCount} failed.`);
        startUnattendedTimer(assets.length, failedCount);
      }
    } catch (error) {
      safeConsoleError("Retry processing error:", error);
      const sanitizedError = formatErrorForUser(error);
      toast.error("Retry processing encountered an error: " + sanitizedError);
      setBatchState(prev => ({ ...prev, isActive: false }));
    }
  }, [assets, metadataSettings, updateAsset, processApiTrack, startUnattendedTimer]);

  // Use an effect to execute auto-retry so it captures the freshest closure of the assets array
  // (Prevents stale closure bug where timeout sees 0 failed assets)
  useEffect(() => {
    if (pendingAutoRetry) {
      setPendingAutoRetry(false);
      handleRetryAllFailed();
    }
  }, [pendingAutoRetry, handleRetryAllFailed]);



  const handleCloseUpload = () => {
    setShowUploadZone(false);
  };

  const handleToggleSelectionMode = () => {
    if (showSelection) {
      clearSelection();
    }
    setShowSelection(!showSelection);
  };

  const handleDeleteSelected = () => {
    if (selectedAssets.length === 0) return;
    setConfirmDialog({
      open: true,
      type: "deleteSelected",
      isLoading: false,
    });
  };

  const handleConfirmDeleteSelected = async () => {
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      selectedAssets.forEach((id) => removeAsset(id));
      clearSelection();
      setShowSelection(false);
      toast.success(`Deleted ${selectedAssets.length} assets`);
      setConfirmDialog({ open: false, type: null, isLoading: false });
    } catch (error) {
      safeConsoleError("handleConfirmDeleteSelected", error);
      toast.error("Failed to delete assets");
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteAll = () => {
    if (assets.length === 0) return;
    setConfirmDialog({
      open: true,
      type: "clearAll",
      isLoading: false,
    });
  };

  const handleConfirmClearAll = async () => {
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      assets.forEach((a) => removeAsset(a.id));
      clearSelection();
      setShowSelection(false);
      toast.success("Cleared all assets");
      setConfirmDialog({ open: false, type: null, isLoading: false });
    } catch (error) {
      safeConsoleError("handleConfirmClearAll", error);
      toast.error("Failed to clear assets");
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleSelectAll = () => {
    sortedFilteredAssets.forEach((asset) => {
      if (!selectedAssets.includes(asset.id)) {
        toggleSelectAsset(asset.id);
      }
    });
  };

  // Sort assets dynamically
  const sortedFilteredAssets = [...filteredAssets].sort((a, b) => {
    if (sortFilter === "generated") {
      const aComplete = a.status === "complete" ? 1 : 0;
      const bComplete = b.status === "complete" ? 1 : 0;
      return bComplete - aComplete;
    } else if (sortFilter === "failed") {
      const aFailed = a.status === "error" ? 1 : 0;
      const bFailed = b.status === "error" ? 1 : 0;
      return bFailed - aFailed;
    } else if (sortFilter === "remaining") {
      const aRemaining = ["ready", "generating", "uploading", "processing"].includes(a.status) ? 1 : 0;
      const bRemaining = ["ready", "generating", "uploading", "processing"].includes(b.status) ? 1 : 0;
      return bRemaining - aRemaining;
    }
    return 0; // "all" default order
  });

  return (
    <div
      className="min-h-screen bg-background"
      onDragOver={(e) => { e.preventDefault(); if (!showUploadZone) setShowUploadZone(true); }}
      onDrop={(e) => { e.preventDefault(); if (!showUploadZone) setShowUploadZone(true); }}
    >
      <Navbar
        onUpload={handleUpload}
        onExportCSV={handleExportCSV}
        onBulkEdit={() => setShowBulkEditor(true)}
        onGenerateAll={handleGenerateAll}
        onRetryAllFailed={handleRetryAllFailed}
        onDownloadZip={handleDownloadZip}
        onCancelGeneration={handleCancelGeneration}
        isDownloadingZip={isDownloadingZip}
        isGenerating={isGenerating}
        errorCount={assets.filter((a) => a.status === "error").length}
        isOnline={isOnline}
      />

      <main className="w-full px-4 py-6 md:px-8">
        <AnimatePresence>
          {showUploadZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <UploadZone onClose={handleCloseUpload} />
            </motion.div>
          )}
        </AnimatePresence>

        {filteredAssets.length === 0 && assets.length === 0 && !showUploadZone ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center space-y-5">
              <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-8 ring-1 ring-border/50">
                <svg
                  className="w-12 h-12 text-muted-foreground/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">No Assets Yet</h2>
              <p className="text-muted-foreground/80 max-w-md leading-relaxed">
                Upload your images and videos to generate optimized metadata for Adobe Stock, Freepik, and Shutterstock.
              </p>

              <div className="max-w-md mx-auto p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-secondary text-left space-y-1 mt-2">
                <p className="font-bold text-primary flex items-center gap-1.5 text-xs">
                  <span>💡 Vector Contributor Tip (EPS & AI):</span>
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Always upload your vector file alongside its same-named JPG preview (e.g. <code className="font-mono text-primary font-bold">design.eps</code> + <code className="font-mono text-primary font-bold">design.jpg</code>) so AI vision can analyze the artwork and embed metadata.
                </p>
              </div>

              <button
                onClick={handleUpload}
                className="mt-6 px-8 py-3.5 btn-primary-glow rounded-xl font-semibold"
              >
                Upload Your First Asset
              </button>
            </div>
          </motion.div>
        ) : (
          <AssetGrid
            assets={sortedFilteredAssets}
            onGenerate={handleGenerateSingle}
            viewType={viewType}
            onViewChange={setViewType}
            selectedAssets={selectedAssets}
            onToggleSelect={toggleSelectAsset}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onDeleteSelected={handleDeleteSelected}
            onDeleteAll={handleDeleteAll}
            showSelection={showSelection}
            onToggleSelectionMode={handleToggleSelectionMode}
            sortFilter={sortFilter}
            onSortFilterChange={setSortFilter}
          />
        )}
      </main>

      <BulkEditorModal open={showBulkEditor} onOpenChange={setShowBulkEditor} />
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        assets={assets.filter((a) => a.metadata)}
      />
      
      {/* Confirmation Dialogs for Destructive Actions */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "deleteSelected"}
        title="Delete Selected Assets"
        description={`Are you sure you want to delete ${selectedAssets.length} asset${selectedAssets.length !== 1 ? "s" : ""}? This action cannot be undone.`}
        isDangerous
        onConfirm={handleConfirmDeleteSelected}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        isLoading={confirmDialog.isLoading}
      />
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "clearAll"}
        title="Delete All Assets"
        description="Are you sure you want to clear all uploaded assets? This action cannot be undone."
        isDangerous
        onConfirm={handleConfirmClearAll}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      />
      
      <CommandPalette 
        onUpload={handleUpload}
        onRetryFailed={handleRetryAllFailed}
        onClearAll={handleDeleteAll}
        onExportCsv={handleExportCSV}
        onExportZip={handleDownloadZip}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGenerateAll={handleGenerateAll}
        hasAssets={assets.length > 0}
        hasFailed={hasFailedAssets}
        hasReady={assets.some(a => a.status === "ready")}
      />


      <DynamicIsland batchState={batchState} />
      <TrialBanner />
    </div>
  );
};

const TrialBanner = () => {
  // vm_trial_end is written by LicenseGate after every Supabase check_trial response.
  // It is always the server-confirmed remaining time — never a stale local value.
  // On mount we do a sanity-clean: if vm_trial_end is more than 4 days in the future
  // it must be a stale value from an old version (v1.0.0 stored 8 days). We remove it
  // so LicenseGate's next server response will overwrite it with the real value.
  const [trialEnd, setTrialEnd] = useState<string | null>(() => {
    const raw = localStorage.getItem('vm_trial_end');
    if (!raw) return null;
    // Stale-value guard: Supabase trial is 3 days max. If stored value is > 4 days
    // from now, it is definitely from a previous version — discard it.
    const storedDate = new Date(raw);
    const maxAllowed = new Date(Date.now() + 4 * 24 * 3600 * 1000); // 4 days from now
    if (storedDate > maxAllowed) {
      localStorage.removeItem('vm_trial_end');
      return null;
    }
    return raw;
  });

  // Re-read vm_trial_end whenever LicenseGate updates it (storage event from same tab)
  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem('vm_trial_end');
      setTrialEnd(raw);
    };
    // Listen for both cross-tab (storage) and same-tab (custom) updates
    window.addEventListener('storage', onStorage);
    window.addEventListener('vm_trial_end_updated', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('vm_trial_end_updated', onStorage);
    };
  }, []);

  const isTrial = localStorage.getItem('vm_trial_active') === 'true';

  if (!isTrial || !trialEnd) return null;

  const endDate = new Date(trialEnd);
  const diffTime = endDate.getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffTime <= 0;

  const handleActivate = () => {
    window.dispatchEvent(new CustomEvent('open-activation-modal'));
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${isExpired ? 'bg-destructive/90 border-destructive' : 'bg-primary/90 border-primary'} border-t text-white p-2 z-50 flex items-center justify-center space-x-4 backdrop-blur-sm`}>
      <span className="font-semibold">
        {isExpired
          ? "Trial Expired - Activation Required"
          : `Trial Mode: ${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`}
      </span>
      <button
        onClick={handleActivate}
        className={`${isExpired ? 'bg-destructive hover:bg-destructive/80' : 'bg-primary hover:bg-primary/90'} text-white text-sm font-bold py-1 px-3 rounded transition-colors`}
      >
        Activate
      </button>
    </div>
  );
};
