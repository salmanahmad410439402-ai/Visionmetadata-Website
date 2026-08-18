/**
 * Video Processing Utilities
 * Handles frame extraction and 2x2 grid generation
 */

import { MotionType } from "@/contexts/AssetsContext";
import { tauriAPI } from "@/lib/tauriAPI";
import { isDesktop } from "./env";

const FRAME_TIMESTAMPS = [0, 0.33, 0.66, 1]; // 0%, 33%, 66%, 100%
const GRID_SIZE = 640; // 2x2 grid will be 640x640 (320px per frame)

interface ProcessedVideo {
  thumbnail: string;
  gridImage: string;
  gridSize: number;
  aspectRatio: number;
  isVertical: boolean;
  motionType: MotionType;
}

async function handleFallback(file: File, skipGridGeneration: boolean = false): Promise<ProcessedVideo> {
  const fileData: any = {
    name: file.name,
    mimeType: file.type,
  };

  let tempFilePath: string | null = null;
  let removeTempFile = false;

  if ((file as any).path) {
    fileData.path = (file as any).path;
  } else {
    try {
      
      const tempDirPath = await tempDir();
      const randId = Math.random().toString(36).substring(2, 9);
      tempFilePath = await join(tempDirPath, `tmp_vid_${randId}_${file.name}`);
      
      await writeFile(tempFilePath, file.stream());
      
      fileData.path = tempFilePath;
      removeTempFile = true;
    } catch (err) {
      console.warn("Could not write video to temp file, falling back to slow IPC", err);
      fileData.buffer = new Uint8Array(await file.arrayBuffer());
    }
  }

  let result;
  try {
    if (skipGridGeneration) {
      // Create a blank 400x400 placeholder instead of calling expensive Rust FFmpeg
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = 400;
      thumbCanvas.height = 400;
      const thumbCtx = thumbCanvas.getContext("2d")!;
      thumbCtx.fillStyle = "#1e1e1e"; // Dark placeholder
      thumbCtx.fillRect(0, 0, 400, 400);
      thumbCtx.fillStyle = "#ffffff";
      thumbCtx.font = "20px sans-serif";
      thumbCtx.textAlign = "center";
      thumbCtx.fillText("Green Screen", 200, 200);
      
      const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.8);
      
      return {
        thumbnail,
        gridImage: thumbnail,
        gridSize: 0,
        aspectRatio: 1,
        isVertical: false,
        motionType: "static",
      };
    }

    result = await tauriAPI.generateVideoGridFallback(fileData);
  } finally {
    if (removeTempFile && tempFilePath) {
      try {
        await remove(tempFilePath);
      } catch (e) {}
    }
  }

  const blob = new Blob([result.buffer], { type: result.mimeType });
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const thumbCanvas = document.createElement("canvas");
  const thumbSize = 400;
  let thumbWidth = thumbSize;
  let thumbHeight = thumbSize;

  if (result.aspectRatio > 1) {
    thumbHeight = Math.round(thumbSize / result.aspectRatio);
  } else {
    thumbWidth = Math.round(thumbSize * result.aspectRatio);
  }

  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  const thumbCtx = thumbCanvas.getContext("2d")!;
  thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
  const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.8);

  return {
    thumbnail,
    gridImage: dataUrl,
    gridSize: result.buffer.byteLength,
    aspectRatio: result.aspectRatio,
    isVertical: result.isVertical,
    motionType: "static", // Default to static for FFmpeg fallback
  };
}



async function extractFrame(video: HTMLVideoElement, time: number): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    // FIX: Adaptive timeout based on video metadata
    // - 500MB HD video on slow network may need 20+ seconds to seek
    // - 8s is minimum for fast local files, 30s is maximum for slow files
    // - Use file size estimate: 8s + (estimated_size / 50MB) seconds
    // - Alternative: use duration to estimate size (duration * bitrate)
    const durationSec = video.duration || 10;
    const estimatedFileSize = durationSec * 500; // Assume ~500KB per second average
    const adaptiveTimeout = Math.min(30000, Math.max(8000, 8000 + (estimatedFileSize / 50000)));

    const timeoutId = setTimeout(() => {
      video.removeEventListener("seeked", onSeeked);
      // Return a blank frame rather than rejecting so processing continues
      // with remaining frames instead of failing the entire video.
      console.warn(`Frame extraction timeout at ${time}s (timeout: ${adaptiveTimeout}ms)`);
      resolve(ctx.getImageData(0, 0, canvas.width || 1, canvas.height || 1));
    }, adaptiveTimeout);

    const onSeeked = () => {
      clearTimeout(timeoutId);
      video.removeEventListener("seeked", onSeeked);
      try {
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      } catch (error) {
        reject(error);
      }
    };

    video.addEventListener("seeked", onSeeked);
    // FIX: currentTime=0 may not fire 'seeked' in Chrome if video is already at 0.
    // Use a tiny offset to force the seek event to fire reliably.
    video.currentTime = time === 0 ? 0.001 : time;
  });
}

function analyzeMotion(frames: ImageData[]): MotionType {
  // Simple motion detection by comparing pixel differences between frames
  // This is a basic heuristic - in production, you might use more sophisticated analysis

  if (frames.length < 2) return "static";

  let totalDiff = 0;
  const sampleSize = Math.min(frames[0].data.length, 10000);
  const step = Math.floor(frames[0].data.length / sampleSize);

  for (let f = 1; f < frames.length; f++) {
    let frameDiff = 0;
    for (let i = 0; i < frames[0].data.length; i += step * 4) {
      const r1 = frames[f - 1].data[i];
      const g1 = frames[f - 1].data[i + 1];
      const b1 = frames[f - 1].data[i + 2];
      const r2 = frames[f].data[i];
      const g2 = frames[f].data[i + 1];
      const b2 = frames[f].data[i + 2];
      frameDiff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    }
    totalDiff += frameDiff / sampleSize;
  }

  const avgDiff = totalDiff / (frames.length - 1);

  // Classify based on motion intensity.
  //
  // Threshold calibration notes (pixel-diff per sampled channel value, 0-255 scale):
  //   avgDiff < 5   → nearly identical frames = static shot or very slow movement
  //   avgDiff < 20  → subtle frame change = slow-motion / in-camera slow shutter
  //   avgDiff < 50  → moderate motion = horizontal/vertical panning
  //   avgDiff < 100 → significant motion = dolly / tracking shot
  //   avgDiff ≥ 100 → high motion across all axes = drone / handheld aerial
  //
  // These thresholds are heuristics derived from typical stock footage samples.
  // They work reliably for the static/slow-motion split but the panning/dolly/drone
  // distinctions are approximate — a fast pan and a slow dolly can produce similar
  // pixel-diff values. If motion classification accuracy is critical, consider
  // optical-flow analysis (e.g. FFmpeg's mpdecimate filter via the Electron backend).
  if (avgDiff < 5) return "static";
  if (avgDiff < 20) return "slow-motion";
  if (avgDiff < 50) return "panning";
  if (avgDiff < 100) return "dolly";
  return "drone";
}

export async function processVideo(file: File, skipGridGeneration: boolean = false): Promise<ProcessedVideo> {
  if (isDesktop() && !skipGridGeneration) {
    console.info(`Desktop mode detected: Using native FFmpeg for ${file.name}`);
    try {
      return await handleFallback(file);
    } catch (e) {
      console.error("Native FFmpeg failed.", e);
      throw e;
    }
  }

  return new Promise((resolve, reject) => {
    const fallback = async (originalError: Error) => {
      try {
        console.warn(`HTML5 Video failed. Falling back to FFmpeg native extraction for ${file.name}`);
        const result = await handleFallback(file, skipGridGeneration);
        resolve(result);
      } catch (fallbackError) {
        console.error("FFmpeg fallback also failed:", fallbackError);
        reject(originalError);
      }
    };

    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    // FIX: Ensure canvas reads succeed in Tauri/WebView2 with blob: URLs
    video.crossOrigin = "anonymous";
    // FIX: Use "metadata" instead of "auto" — "auto" forces the browser to
    // download the ENTIRE file into memory before onloadedmetadata fires,
    // which causes 15MB+ videos to hang or timeout. With "metadata" the
    // browser only downloads container headers (a few KB), then seeks
    // on-demand from the blob URL when we set currentTime.
    video.preload = "metadata";

    // FIX: Adaptive timeout based on file size — large files need more time
    // for the browser to parse container headers (especially MOV/AVI).
    //   - base: 30s for files up to 50MB
    //   - +10s per additional 100MB, capped at 90s
    const fileSizeMB = file.size / (1024 * 1024);
    const adaptiveMetadataTimeout = Math.min(90000, Math.max(30000, 30000 + Math.floor((fileSizeMB - 50) / 100) * 10000));

    const metadataTimeout = setTimeout(() => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      URL.revokeObjectURL(url);
      fallback(new Error(`Video metadata load timed out after ${Math.round(adaptiveMetadataTimeout / 1000)} seconds`));
    }, adaptiveMetadataTimeout);

    video.onloadedmetadata = async () => {
      clearTimeout(metadataTimeout);
      try {
        const { videoWidth, videoHeight, duration } = video;
        const aspectRatio = videoWidth / videoHeight;
        const isVertical = videoHeight > videoWidth;

        // FIX: Wait for enough data to be buffered so seeks can complete.
        // With preload="metadata" the browser may not have buffered any
        // actual video frames yet. Wait for "canplay" (enough data for at
        // least a few frames) or timeout after 15s and proceed anyway —
        // the per-frame timeout in extractFrame will handle partial loads.
        if (video.readyState < 3) { // HAVE_FUTURE_DATA
          await new Promise<void>((res) => {
            const bufferTimeout = setTimeout(() => {
              video.removeEventListener("canplay", onCanPlay);
              res(); // proceed anyway, per-frame timeout will handle it
            }, 15000);
            const onCanPlay = () => {
              clearTimeout(bufferTimeout);
              res();
            };
            video.addEventListener("canplay", onCanPlay, { once: true });
          });
        }

        // FIX: Extract frames SEQUENTIALLY — a single HTMLVideoElement has
        // only ONE currentTime. Concurrent seeks (Promise.allSettled with
        // all timestamps) cause each new currentTime assignment to cancel
        // the previous seek, resulting in blank/missing frames.
        // Sequential iteration guarantees each seek completes before the
        // next one starts.
        const fallbackImageData = new ImageData(Math.max(videoWidth, 1), Math.max(videoHeight, 1));
        const frames: ImageData[] = [];
        
        const timestampsToExtract = skipGridGeneration ? [FRAME_TIMESTAMPS[1]] : FRAME_TIMESTAMPS;
        
        for (const timestamp of timestampsToExtract) {
          const time = duration * timestamp * 0.99;
          try {
            const frame = await extractFrame(video, time);
            frames.push(frame);
          } catch {
            // Failed frame — use blank fallback so grid always has 4 cells
            frames.push(fallbackImageData);
          }
        }

        // Analyze motion
        const motionType = skipGridGeneration ? "static" : analyzeMotion(frames);

        let gridImage = "";
        let gridSize = 0;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = videoWidth;
        tempCanvas.height = videoHeight;
        const tempCtx = tempCanvas.getContext("2d")!;

        if (!skipGridGeneration) {
          // Create 2x2 grid
          const frameSize = GRID_SIZE / 2;
          const gridCanvas = document.createElement("canvas");
          gridCanvas.width = GRID_SIZE;
          gridCanvas.height = GRID_SIZE;
          const gridCtx = gridCanvas.getContext("2d")!;

          const positions = [
            { x: 0, y: 0 },
            { x: frameSize, y: 0 },
            { x: 0, y: frameSize },
            { x: frameSize, y: frameSize },
          ];

          for (let i = 0; i < frames.length; i++) {
            tempCtx.putImageData(frames[i], 0, 0);

            // Calculate crop to fit square
            let sx = 0, sy = 0, sw = videoWidth, sh = videoHeight;
            if (videoWidth > videoHeight) {
              sx = (videoWidth - videoHeight) / 2;
              sw = videoHeight;
            } else {
              sy = (videoHeight - videoWidth) / 2;
              sh = videoWidth;
            }

            gridCtx.drawImage(
              tempCanvas,
              sx, sy, sw, sh,
              positions[i].x, positions[i].y, frameSize, frameSize
            );
          }

          gridImage = gridCanvas.toDataURL("image/jpeg", 0.75);
          gridSize = Math.round((gridImage.length * 3) / 4);
        }

        // Create thumbnail from a middle frame to avoid black starting frames
        const thumbCanvas = document.createElement("canvas");
        const thumbSize = 400;
        let thumbWidth = thumbSize;
        let thumbHeight = thumbSize;

        if (aspectRatio > 1) {
          thumbHeight = Math.round(thumbSize / aspectRatio);
        } else {
          thumbWidth = Math.round(thumbSize * aspectRatio);
        }

        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        const thumbCtx = thumbCanvas.getContext("2d")!;
        
        // Use the extracted frame (which is frames[0] if skipped, or frames[1] if full extract)
        const frameForThumb = skipGridGeneration ? frames[0] : (frames.length > 1 ? frames[1] : frames[0]);
        tempCtx.putImageData(frameForThumb, 0, 0);
        
        thumbCtx.drawImage(tempCanvas, 0, 0, videoWidth, videoHeight, 0, 0, thumbWidth, thumbHeight);
        const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.8);

        // Clean up video element to free hardware decoder resources
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.remove();
        URL.revokeObjectURL(url);

        resolve({
          thumbnail,
          gridImage,
          gridSize,
          aspectRatio,
          isVertical,
          motionType,
        });
      } catch (error) {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.remove();
        URL.revokeObjectURL(url);
        fallback(error instanceof Error ? error : new Error(String(error)));
      }
    };

    video.onerror = (e) => {
      clearTimeout(metadataTimeout);
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      URL.revokeObjectURL(url);
      fallback(new Error("Failed to load video"));
    };

    video.src = url;
    video.load();
  });
}
