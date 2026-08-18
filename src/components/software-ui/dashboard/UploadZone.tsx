import { useCallback, useRef, useState, useEffect } from "react";
import { Upload, X, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssets } from "@/contexts/AssetsContext";
import { motion } from "framer-motion";
import { processImage } from "@/lib/imageProcessor";
import { processVideo } from "@/lib/videoProcessor";
import { FileProcessingService } from "@/lib/FileProcessingService";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import pLimit from "p-limit";

interface UploadZoneProps {
  onClose: () => void;
}

// ─── FILE SIZE VALIDATION ────────────────────────────────────
// Configuration with sensible defaults
const FILE_SIZE_LIMITS = {
  image: 200 * 1024 * 1024,      // 200MB
  video: 1024 * 1024 * 1024,     // 1GB
  vector: 100 * 1024 * 1024,     // 100MB
  default: 500 * 1024 * 1024,    // 500MB
};

const BATCH_SIZE_LIMIT = 5 * 1024 * 1024 * 1024;  // 5GB total

const validateFileSize = (file: File): { valid: boolean; message?: string } => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isVector = ["ai", "eps", "svg"].includes(ext);
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");

  let limit: number;
  if (isVector) limit = FILE_SIZE_LIMITS.vector;
  else if (isVideo) limit = FILE_SIZE_LIMITS.video;
  else if (isImage) limit = FILE_SIZE_LIMITS.image;
  else limit = FILE_SIZE_LIMITS.default;

  if (file.size > limit) {
    return {
      valid: false,
      message: `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB, max is ${(limit / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  return { valid: true };
};

const validateBatchSize = (files: FileList | File[]): { valid: boolean; message?: string } => {
  let total = 0;
  const fileArray = Array.from(files);
  for (let i = 0; i < fileArray.length; i++) {
    total += fileArray[i].size;
  }

  if (total > BATCH_SIZE_LIMIT) {
    const used = (total / 1024 / 1024 / 1024).toFixed(1);
    const max = (BATCH_SIZE_LIMIT / 1024 / 1024 / 1024).toFixed(0);
    return {
      valid: false,
      message: `Total size ${used}GB exceeds ${max}GB limit. Split into smaller batches.`,
    };
  }

  return { valid: true };
};

export const UploadZone = ({ onClose }: UploadZoneProps) => {
  const { addAsset, updateAsset } = useAssets();
  const { metadataSettings } = useSettings();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track ongoing operations so they can be cancelled when modal closes
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingJobsRef = useRef<Set<string>>(new Set());

  // Cleanup: abort all operations when modal closes
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [onClose]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      let fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      // ✅ Auto-correct Fake PNGs (JPEGs disguised as PNGs)
      fileArray = await Promise.all(
        fileArray.map(async (file) => {
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (ext === "png") {
            try {
              const buffer = await file.slice(0, 4).arrayBuffer();
              const bytes = new Uint8Array(buffer);
              // JPEG Magic Bytes: FF D8 FF
              if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
                const newName = file.name.substring(0, file.name.lastIndexOf(".")) + ".jpg";
                const newFile = new File([file], newName, { type: "image/jpeg", lastModified: file.lastModified });
                if ((file as any).path) (newFile as any).path = (file as any).path;
                return newFile;
              }
            } catch (e) {
              console.error("Magic byte check failed", e);
            }
          }
          return file;
        })
      );

      // ✅ Validate batch size first
      const batchCheck = validateBatchSize(fileArray);
      if (!batchCheck.valid) {
        toast.error(batchCheck.message);
        return;
      }

      // ✅ Validate individual file sizes
      const invalidFiles: string[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const check = validateFileSize(file);
        if (!check.valid) {
          invalidFiles.push(check.message!);
        }
      }

      if (invalidFiles.length > 0) {
        // Show all errors if 10 or fewer, otherwise summarize
        if (invalidFiles.length <= 10) {
          toast.error(invalidFiles.join("\n"));
        } else {
          toast.error(`${invalidFiles.length} files exceed size limits. Please split into smaller batches.`);
        }
        return;
      }

      // ─── PRE-SCAN: Identify image+vector pairs ───────────────
      const groups: Record<
        string,
        { vectors: File[]; image?: File }
      > = {};
      const standalone: File[] = [];

      fileArray.forEach((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        const lastDot = file.name.lastIndexOf(".");
        const baseName =
          lastDot > 0
            ? file.name.substring(0, lastDot).toLowerCase()
            : file.name.toLowerCase();

        if (["ai", "eps", "svg"].includes(ext)) {
          if (!groups[baseName]) groups[baseName] = { vectors: [] };
          groups[baseName].vectors.push(file);
        } else if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
          if (!groups[baseName]) groups[baseName] = { vectors: [] };
          groups[baseName].image = file;
        } else if (file.type.startsWith("video/")) {
          standalone.push(file);
        } else {
          // unknown — skip silently (zip, txt, etc.)
        }
      });

      // Resolve groups → pairs or standalone
      const pairs: { vectors: File[]; image: File; baseName: string }[] = [];
      Object.entries(groups).forEach(([baseName, group]) => {
        if (group.vectors.length > 0 && group.image) {
          pairs.push({ vectors: group.vectors, image: group.image, baseName });
        } else {
          // No matching partner → standalone
          if (group.image) standalone.push(group.image);
          standalone.push(...group.vectors);
        }
      });

      // ─── Create type-aware concurrency limiters ──────────────
      // Different file types have different CPU/IO requirements
      // Use hardware detection for dynamic limits
      const cores = navigator.hardwareConcurrency || 4;
      const imageLimiter = pLimit(Math.max(2, Math.floor(cores / 2)));      // 2-8
      const videoLimiter = pLimit(Math.max(1, Math.floor(cores / 8)));      // 1-2
      const vectorLimiter = pLimit(Math.max(1, Math.floor(cores / 4)));     // 1-2

      // ─── Helper: Get appropriate limiter for file type ──────
      const getLimiter = (file: File): ReturnType<typeof pLimit> => {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        const isVector = ["ai", "eps", "svg"].includes(ext);
        const isVideo = file.type.startsWith("video/");

        // Validate that limiters were created successfully
        if (!imageLimiter || !videoLimiter || !vectorLimiter) {
          throw new Error("Concurrency limiters not initialized");
        }

        if (isVector) return vectorLimiter;
        if (isVideo) return videoLimiter;
        return imageLimiter;
      };

      const limit = pLimit(5);

      // ─── Process Standalone Files ────────────────────────────
      const standaloneJobs = standalone.map(async (file) => {
          // Check if operation was aborted before starting job
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          let limiter: ReturnType<typeof pLimit>;
          try {
            limiter = getLimiter(file);
          } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to initialize processor";
            toast.error(`${file.name}: ${msg}`);
            return;
          }

          return limiter(async () => {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
          // IMPORTANT: isVector must be checked BEFORE isImage.
          // SVG has MIME type "image/svg+xml" so file.type.startsWith("image/") is TRUE.
          // Without this guard, SVG files fall into the isImage branch and get processed
          // by processImage() (canvas rasterisation) instead of the dedicated SVG
          // parser in FileProcessingService.generatePreview(), which preserves
          // viewBox dimensions, transparency, and aspect ratio correctly.
          const isVector = ["ai", "eps", "svg"].includes(ext);
          const isImage = !isVector && file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          if (!isImage && !isVideo && !isVector) return;

          const assetId = addAsset(file);
          processingJobsRef.current.add(assetId);

          try {
            updateAsset(assetId, { status: "processing" });

            // Check abort before each async operation
            if (abortControllerRef.current?.signal.aborted) {
              updateAsset(assetId, { status: "error", error: "Upload cancelled" });
              return;
            }

            if (isImage) {
              const result = await processImage(file);
              const isLowRes = result.width * result.height < 4000000;
              updateAsset(assetId, {
                status: "ready",
                thumbnail: result.thumbnail,
                processedImage: result.processedImage,
                compressedSize: result.compressedSize,
                aspectRatio: result.aspectRatio,
                isVertical: result.isVertical,
                width: result.width,
                height: result.height,
                warnings: isLowRes ? ["low_resolution"] : [],
              });
            } else if (isVideo) {
              const result = await processVideo(file, metadataSettings.greenScreenVideos);
              updateAsset(assetId, {
                status: "ready",
                thumbnail: result.thumbnail,
                processedImage: result.gridImage,
                compressedSize: result.gridSize,
                aspectRatio: result.aspectRatio,
                isVertical: result.isVertical,
                motionType: result.motionType,
              });
            } else if (isVector) {
              try {
                const preview =
                  await FileProcessingService.generatePreview(file);
                updateAsset(assetId, {
                  status: "ready",
                  thumbnail: preview.thumbnail,
                  processedImage: preview.thumbnail,
                  aspectRatio: preview.aspectRatio,
                  isVertical: preview.isVertical,
                });
              } catch (e) {
                throw e instanceof Error ? e : new Error("Vector preview failed");
              }
            }
          } catch (error) {
            console.error("Error processing file:", error);
            const errMsg = error instanceof Error ? error.message : "Processing failed";
            updateAsset(assetId, {
              status: "error",
              error: errMsg === "Failed to load image" ? "Corrupted File" : errMsg,
            });
          }
        });
      });

      // ─── Process Pair Groups ─────────────────────────────────
      // For pairs, use the most restrictive limiter (vector) since at least one file is a vector
      const pairJobs = pairs.map(({ vectors, image }) =>
        vectorLimiter(async () => {
          const imageId = addAsset(image);
          const vectorIds = vectors.map((v) => addAsset(v));
          const allIds = [imageId, ...vectorIds];

          try {
            updateAsset(imageId, { status: "processing" });
            vectorIds.forEach((id) => updateAsset(id, { status: "processing" }));

            const imageResult = await processImage(image);
            const isLowRes = imageResult.width * imageResult.height < 4000000;
            const extList = [...vectors, image]
              .map((f) => f.name.split(".").pop()?.toUpperCase())
              .join(" + ");

            updateAsset(imageId, {
              status: "ready",
              thumbnail: imageResult.thumbnail,
              processedImage: imageResult.processedImage,
              compressedSize: imageResult.compressedSize,
              aspectRatio: imageResult.aspectRatio,
              isVertical: imageResult.isVertical,
              width: imageResult.width,
              height: imageResult.height,
              warnings: isLowRes ? ["low_resolution"] : [],
              relatedAssetIds: vectorIds,
              isPrimaryOfPair: false,
              combinedExtensions: extList,
            });

            let primaryVectorId = vectorIds[0];
            const epsIndex = vectors.findIndex((v) =>
              v.name.toLowerCase().endsWith(".eps")
            );
            const aiIndex = vectors.findIndex((v) =>
              v.name.toLowerCase().endsWith(".ai")
            );
            if (epsIndex >= 0) primaryVectorId = vectorIds[epsIndex];
            else if (aiIndex >= 0) primaryVectorId = vectorIds[aiIndex];

            vectors.forEach((vector, idx) => {
              const vId = vectorIds[idx];
              const otherRelatedIds = allIds.filter((id) => id !== vId);
              updateAsset(vId, {
                status: "ready",
                thumbnail: imageResult.thumbnail,
                processedImage: imageResult.processedImage,
                aspectRatio: imageResult.aspectRatio,
                isVertical: imageResult.isVertical,
                width: imageResult.width,
                height: imageResult.height,
                warnings: isLowRes ? ["low_resolution"] : [],
                relatedAssetIds: otherRelatedIds,
                isPrimaryOfPair: vId === primaryVectorId,
                combinedExtensions: extList,
              });
            });
          } catch (error) {
            console.error("Error processing pair:", error);
            updateAsset(imageId, {
              status: "error",
              error: "Pair processing failed",
            });
            vectorIds.forEach((id) =>
              updateAsset(id, { status: "error", error: "Pair processing failed" })
            );
          }
        })
      );

      await Promise.all([...standaloneJobs, ...pairJobs]);

      const totalAdded = standalone.length + pairs.reduce((n, p) => n + 1 + p.vectors.length, 0);
      if (totalAdded > 0) {
        toast.success(`${totalAdded} file${totalAdded > 1 ? "s" : ""} loaded successfully`);
      }
    },
    [addAsset, updateAsset]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        // Reset so same file can be re-selected
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  /** Directly trigger the OS file picker via ref */
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Hidden native file input — controlled via ref */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/mov,video/avi,video/webm,.ai,.eps,.svg"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFilePicker}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed p-14
          transition-all duration-300 cursor-pointer
          ${isDragging
            ? "border-primary bg-primary/8 badge-glow upload-border-active"
            : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
          }
        `}
      >
        <div className="flex flex-col items-center justify-center text-center gap-5">
          <div
            className={`
              w-18 h-18 rounded-2xl flex items-center justify-center
              ${isDragging ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted/80 text-muted-foreground ring-1 ring-border/50"}
              transition-all duration-300
            `}
            style={{ width: '4.5rem', height: '4.5rem' }}
          >
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1.5">
              {isDragging ? "Drop files here" : "Drag & drop your assets"}
            </h3>
            <p className="text-sm text-muted-foreground/80">
              or click anywhere to browse files
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground/70 mt-1">
            <div className="flex items-center gap-1.5">
              <Image className="w-4 h-4 text-primary/60" />
              <span>JPEG · PNG · WebP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Video className="w-4 h-4 text-primary/60" />
              <span>MP4 · MOV · AVI · WebM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary/60" />
              <span>AI · EPS · SVG</span>
              <span className="text-[10px] text-amber-400/70 font-medium ml-0.5">(SVG: no embed)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
