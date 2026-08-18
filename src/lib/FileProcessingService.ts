/**
 * FileProcessingService - Modular service layer for file processing
 * 
 * This service handles two main tasks:
 * 1. generatePreview(file) - Generate preview images for different file types
 * 2. embedMetadata(file, metadata) - Embed metadata into files
 * 
 * The service supports both "Web Mode" (browser-based) and "Native Mode" (Electron/ExifTool)
 * This architecture allows easy switching when porting to a desktop application.
 */

import type { Asset, AssetMetadata } from "@/contexts/AssetsContext";
import { isDesktop as _isDesktop, hasNativeTools as _hasNativeTools } from "./env";
import { embedMetadata as browserEmbedMetadata } from "./metadataEmbedder";
import { tauriAPI } from "./tauriAPI";

// ============================================
// Environment Detection
// ============================================

/**
 * Check if running in Electron environment
 */
// Re-exported from env.ts — zero-dep environment detection (breaks circular dep)
export const isDesktop = _isDesktop;

/**
 * Check if native tools are available (ExifTool, FFmpeg)
 */
// Re-exported from env.ts — zero-dep capability check (breaks circular dep)
export const hasNativeTools = _hasNativeTools;

// ============================================
// Preview Generation
// ============================================

interface PreviewResult {
  thumbnail: string; // Base64 data URL
  gridImage?: string; // For videos - 2x2 grid
  aspectRatio: number;
  isVertical: boolean;
  motionType?: string;
}

/**
 * Generate preview for any supported file type
 */
export const generatePreview = async (file: File): Promise<PreviewResult> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Images
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    return generateImagePreview(file);
  }

  // Videos
  if (["mp4", "mov", "avi", "webm"].includes(extension)) {
    return generateVideoPreview(file);
  }

  // SVG - can render in browser
  if (extension === "svg") {
    return generateSVGPreview(file);
  }

  // Vector formats (AI, EPS) - require native tools
  if (["ai", "eps"].includes(extension)) {
    return generateVectorPreview(file);
  }

  throw new Error(`Unsupported file type: ${extension}`);
};

/**
 * Generate preview for image files
 */
const generateImagePreview = async (file: File): Promise<PreviewResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const isVertical = aspectRatio < 1;

        // Create thumbnail
        const canvas = document.createElement("canvas");
        const maxSize = 400;

        if (img.width > img.height) {
          canvas.width = maxSize;
          canvas.height = maxSize / aspectRatio;
        } else {
          canvas.height = maxSize;
          canvas.width = maxSize * aspectRatio;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Preserve transparency for PNG, WebP, GIF
        const isTransparent = ["png", "webp", "gif"].includes(file.name.split(".").pop()?.toLowerCase() || "");

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
            return;
          }
          resolve({
            thumbnail: URL.createObjectURL(blob),
            aspectRatio,
            isVertical,
          });
        }, isTransparent ? "image/png" : "image/jpeg", 0.8);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate preview for video files
 * Creates a 2x2 grid of frames for AI analysis
 */
const generateVideoPreview = async (file: File): Promise<PreviewResult> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    // FIX: Ensure canvas reads succeed in Tauri/WebView2 with blob: URLs
    video.crossOrigin = "anonymous";
    // FIX: Use "metadata" instead of "auto" — "auto" forces the browser to
    // download the ENTIRE file before onloadedmetadata fires, causing 15MB+
    // videos to hang or timeout. "metadata" only downloads container headers.
    video.preload = "metadata";

    // FIX: Adaptive metadata timeout based on file size
    //   - base: 30s for files up to 50MB
    //   - +10s per additional 100MB, capped at 90s
    const fileSizeMB = file.size / (1024 * 1024);
    const adaptiveTimeout = Math.min(90000, Math.max(30000, 30000 + Math.floor((fileSizeMB - 50) / 100) * 10000));

    const metadataTimeout = setTimeout(() => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      URL.revokeObjectURL(url);
      reject(new Error(`Video metadata load timed out after ${Math.round(adaptiveTimeout / 1000)} seconds`));
    }, adaptiveTimeout);

    video.onloadedmetadata = async () => {
      clearTimeout(metadataTimeout);
      const aspectRatio = video.videoWidth / video.videoHeight;
      const isVertical = aspectRatio < 1;
      const duration = video.duration;

      // FIX: Wait for enough data to be buffered so seeks can complete.
      // With preload="metadata" the browser may not have buffered any
      // actual video frames yet. Wait for "canplay" or timeout after 15s.
      if (video.readyState < 3) {
        await new Promise<void>((res) => {
          const bufferTimeout = setTimeout(() => {
            video.removeEventListener("canplay", onCanPlay);
            res();
          }, 15000);
          const onCanPlay = () => {
            clearTimeout(bufferTimeout);
            res();
          };
          video.addEventListener("canplay", onCanPlay, { once: true });
        });
      }

      // FIX: Extract frames SEQUENTIALLY — a single HTMLVideoElement has
      // only ONE currentTime. Concurrent seeks cause each new currentTime
      // assignment to cancel the previous seek.
      const framePositions = [0.25, 0.5, 0.75, 0.9].map((p) => p * duration);
      const frames: string[] = [];

      for (const pos of framePositions) {
        try {
          const frame = await extractVideoFrame(video, pos);
          frames.push(frame);
        } catch (error) {
          console.warn("Failed to extract frame at", pos);
        }
      }

      if (frames.length === 0) {
        // Fallback - try to get first frame
        try {
          const frame = await extractVideoFrame(video, 0.001);
          frames.push(frame);
        } catch {
          video.pause();
          video.removeAttribute('src');
          video.load();
          video.remove();
          URL.revokeObjectURL(url);
          reject(new Error("Failed to extract any video frames"));
          return;
        }
      }

      // Create 2x2 grid from frames
      const gridImage = await createFrameGrid(frames, video.videoWidth, video.videoHeight);

      // We can revoke the individual frames since gridImage contains everything we need
      // Keep the first frame valid if gridImage failed
      if (gridImage !== frames[0]) {
        frames.forEach(f => URL.revokeObjectURL(f));
      }

      // Purge the video buffer from Chromium hardware RAM immediately to prevent blowout (OOM)
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      URL.revokeObjectURL(url);

      resolve({
        thumbnail: gridImage || frames[0],
        gridImage,
        aspectRatio,
        isVertical,
        motionType: detectMotionType(duration),
      });
    };

    video.onerror = () => {
      clearTimeout(metadataTimeout);
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    };

    video.src = url;
    video.load();
  });
};

/**
 * Extract a single frame from video at specified time
 */
const extractVideoFrame = (video: HTMLVideoElement, time: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    // FIX: 15-second timeout per frame — prevents indefinite hang if
    // the video hasn't buffered enough data for the requested seek position.
    const frameTimeout = setTimeout(() => {
      video.removeEventListener("seeked", onSeeked);
      // Return a blank frame rather than rejecting so processing continues
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(video.videoWidth, 1);
      canvas.height = Math.max(video.videoHeight, 1);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Frame extraction timed out"));
          return;
        }
        console.warn(`Frame extraction timed out at ${time}s — using blank frame`);
        resolve(URL.createObjectURL(blob));
      }, "image/jpeg", 0.8);
    }, 15000);

    const onSeeked = () => {
      clearTimeout(frameTimeout);
      video.removeEventListener("seeked", onSeeked);

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from video frame"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/jpeg", 0.8);
    };

    video.addEventListener("seeked", onSeeked);
    // FIX: Use a tiny offset for time=0 to force the seek event to fire
    // (Chrome may skip 'seeked' if currentTime is already 0)
    video.currentTime = time === 0 ? 0.001 : time;
  });
};

/**
 * Create a 2x2 grid from video frames
 */
const createFrameGrid = async (frames: string[], width: number, height: number): Promise<string> => {
  const canvas = document.createElement("canvas");
  const gridSize = 2;
  canvas.width = width;
  canvas.height = height;

  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return frames[0] || "";

  // Fill with black background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  // Draw frames in grid
  const positions = [
    [0, 0],
    [cellWidth, 0],
    [0, cellHeight],
    [cellWidth, cellHeight],
  ];

  const promises = frames.slice(0, 4).map((frameSrc, i) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, positions[i][0], positions[i][1], cellWidth, cellHeight);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = frameSrc;
    });
  });

  await Promise.all(promises);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(frames[0] || "");
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, "image/jpeg", 0.85);
  });
};

/**
 * Detect motion type from video duration
 */
const detectMotionType = (duration: number): string => {
  if (duration < 5) return "quick-clip";
  if (duration < 15) return "short-form";
  if (duration < 60) return "medium-form";
  return "long-form";
};

/**
 * Generate preview for SVG files
 */
const generateSVGPreview = async (file: File): Promise<PreviewResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;

      // Parse SVG to get dimensions
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (!svgElement) {
        reject(new Error("Invalid SVG file"));
        return;
      }

      // Get dimensions from viewBox or width/height
      let width = 400;
      let height = 400;

      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/\s+/);
        if (parts.length >= 4) {
          width = parseFloat(parts[2]) || 400;
          height = parseFloat(parts[3]) || 400;
        }
      }

      const widthAttr = svgElement.getAttribute("width");
      const heightAttr = svgElement.getAttribute("height");
      if (widthAttr && heightAttr) {
        width = parseFloat(widthAttr) || width;
        height = parseFloat(heightAttr) || height;
      }

      // Render SVG to canvas
      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // White background for transparency
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Uses toDataURL() so resolveImageToBase64() never needs to fetch() it
        try {
          const thumbnail = canvas.toDataURL("image/jpeg", 0.9);
          URL.revokeObjectURL(url);
          resolve({
            thumbnail,
            aspectRatio: width / height,
            isVertical: height > width,
          });
        } catch {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to render SVG to data URI"));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to render SVG"));
      };

      img.src = url;
    };
    reader.onerror = () => reject(new Error("Failed to read SVG file"));
    reader.readAsText(file);
  });
};

const generateVectorPreview = async (file: File, metadata?: { title: string; description: string; keywords: string[] } | null): Promise<PreviewResult> => {
  if (isDesktop()) {
    // Desktop Mode uses backend Tauri endpoint (Ghostscript)
    if (tauriAPI.generateVectorPreview) {
      const fileObj: any = {
        name: file.name,
        metadata: metadata || null
      };

      let tempFilePath: string | null = null;
      let removeTempFile = false;

      if ((file as any).path) {
        fileObj.path = (file as any).path;
      } else {
        try {
          
          const tempDirPath = await tempDir();
          const randId = Math.random().toString(36).substring(2, 9);
          tempFilePath = await join(tempDirPath, `tmp_vec_${randId}_${file.name}`);
          
          await writeFile(tempFilePath, file.stream());
          
          fileObj.path = tempFilePath;
          removeTempFile = true;
        } catch (err) {
          console.warn("Could not write vector to temp file, falling back to slow IPC", err);
          fileObj.buffer = new Uint8Array(await file.arrayBuffer());
        }
      }

      const result = await tauriAPI.generateVectorPreview(fileObj);

      if (removeTempFile && tempFilePath) {
        try {
          await remove(tempFilePath);
        } catch (e) {}
      }

      const blob = new Blob([result.buffer], { type: result.mimeType });

      // Convert the Ghostscript-rendered preview to a base64 data URI
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to convert vector preview to base64"));
        reader.readAsDataURL(blob);
      });

      return {
        thumbnail: dataUri,
        aspectRatio: result.aspectRatio,
        isVertical: result.isVertical
      };
    }
  }

  // Web mode - return placeholder
  // These formats cannot be rendered in browser without server-side processing
  return {
    thumbnail: createPlaceholderImage(file.name, "Vector file - Preview requires desktop app"),
    aspectRatio: 1,
    isVertical: false,
  };
};

/**
 * Create a placeholder image with text
 */
const createPlaceholderImage = (filename: string, message: string): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, 400, 400);

  // Border
  ctx.strokeStyle = "#00d9ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 380, 380);

  // Icon placeholder
  ctx.fillStyle = "#00d9ff";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("📄", 200, 180);

  // Filename
  ctx.font = "16px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(filename.substring(0, 30), 200, 240);

  // Message
  ctx.font = "12px Arial";
  ctx.fillStyle = "#888888";
  const words = message.split(" ");
  let line = "";
  let y = 280;

  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > 360) {
      ctx.fillText(line, 200, y);
      line = word + " ";
      y += 20;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 200, y);

  canvas.toBlob((blob) => {
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }, "image/jpeg", 0.8);

  // As fallback if toBlob not possible returning anything, but createPlaceholderImage is synchronous so we can't easily wait for toBlob if we change the signature.
  // We'll just return dataURL for placeholder since it's very small and rare.
  return canvas.toDataURL("image/jpeg", 0.8);
};

// ============================================
// Metadata Embedding
// ============================================

interface EmbedResult {
  blob: Blob;
  filename: string;
  embedded: boolean;
  method: "browser" | "native" | "none";
}

/**
 * Embed metadata into a file
 * Automatically selects browser or native method based on environment
 */
export const embedFileMetadata = async (
  file: File,
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  }
): Promise<EmbedResult> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Check if we should use native embedding (Tauri with ExifTool)
  if (isDesktop()) {
    const tools = await hasNativeTools();
    if (tools.exiftool) {
      return useNativeEmbedding(file, metadata);
    }
  }

  // Use browser-based embedding for supported formats
  return useBrowserEmbedding(file, metadata);
};

/**
 * Browser-based metadata embedding
 * Supports JPEG, PNG with EXIF/IPTC/XMP
 */
const useBrowserEmbedding = async (
  file: File,
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  }
): Promise<EmbedResult> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Formats supported by browser embedding
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
    const result = await browserEmbedMetadata(file, metadata);
    return {
      blob: result.blob,
      filename: result.filename,
      embedded: true,
      method: "browser",
    };
  }

  // SVG — not embeddable in browser mode; warn the user clearly
  if (extension === "svg") {
    return {
      blob: file,
      filename: file.name,
      embedded: false,
      method: "none",
    };
  }

  // Unsupported formats - return original file
  return {
    blob: file,
    filename: file.name,
    embedded: false,
    method: "none",
  };
};

const useNativeEmbedding = async (
  file: File,
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  }
): Promise<EmbedResult> => {
  if (!tauriAPI.embedMetadata) {
    // Fallback to browser embedding
    return useBrowserEmbedding(file, metadata);
  }

  try {
    const fileObj: any = {
      name: file.name,
      mimeType: file.type || "application/octet-stream",
    };

    let tempFilePath: string | null = null;
    let removeTempFile = false;

    // Use absolute path if available (Electron/Custom drops)
    if ((file as any).path) {
      fileObj.path = (file as any).path;
    } else {
      // Missing absolute path (standard HTML drops) - write to temp via fs plugin.
      // @tauri-apps/plugin-fs is optimized and passes Uint8Array directly over IPC
      // rather than serializing all bytes to JSON integers like standard invoke() does.
      try {
        
        const tempDirPath = await tempDir();
        // Generate a random ID for collision safety
        const randId = Math.random().toString(36).substring(2, 9);
        tempFilePath = await join(tempDirPath, `tmp_${randId}_${file.name}`);
        
        await writeFile(tempFilePath, file.stream());
        
        fileObj.path = tempFilePath;
        removeTempFile = true;
      } catch (err) {
        console.warn("Could not write to temp file, falling back to slow IPC buffer passing", err);
        fileObj.buffer = new Uint8Array(await file.arrayBuffer());
      }
    }

    const result = await tauriAPI.embedMetadata(fileObj, metadata);

    // Clean up frontend-created temp file if we made one
    if (removeTempFile && tempFilePath) {
      try {
        await remove(tempFilePath);
      } catch (e) {
        /* ignore */
      }
    }

    return {
      blob: result.blob,
      filename: result.filename,
      embedded: true,
      method: "native",
    };
  } catch (error) {
    console.error("Native embedding failed, falling back to browser:", error);
    return useBrowserEmbedding(file, metadata);
  }
};

// ============================================
// Export Service Interface
// ============================================

export const FileProcessingService = {
  // Environment
  isDesktop,
  hasNativeTools,

  // Preview generation
  generatePreview,

  // Metadata embedding
  embedMetadata: embedFileMetadata,

  // Utility
  createPlaceholderImage,
};

export default FileProcessingService;
