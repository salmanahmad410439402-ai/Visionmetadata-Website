/**
 * Image Processing Utilities
 * Handles client-side image downsizing and thumbnail generation
 */

// 512px is the optimal size for AI metadata generation:
// - Gemini/GPT-4o process images at 512px internally anyway for vision tasks
// - Sending 768px wastes ~40% more image tokens with zero quality benefit
// - At 512px, JPEG at 0.75 quality = ~35-60KB vs 80-120KB at 768px
const MAX_DIMENSION = 512;
const THUMBNAIL_SIZE = 400;

interface ProcessedImage {
  thumbnail: string;
  processedImage: string;
  compressedSize: number;
  aspectRatio: number;
  isVertical: boolean;
  width: number;
  height: number;
}

export async function processImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Use blob URL instead of data URL to avoid 4x memory overhead
    const blobUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const { width, height } = img;
        const aspectRatio = width / height;
        const isVertical = height > width;

        // Calculate new dimensions (max 1000px on long edge)
        let newWidth = width;
        let newHeight = height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            newWidth = MAX_DIMENSION;
            newHeight = Math.round(MAX_DIMENSION / aspectRatio);
          } else {
            newHeight = MAX_DIMENSION;
            newWidth = Math.round(MAX_DIMENSION * aspectRatio);
          }
        }

        // Create processed image canvas
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }
        // Fix: Fill canvas with white before drawing the image so transparent PNGs 
        // don't get a black background when converted to JPEG.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        const processedImage = canvas.toDataURL("image/jpeg", 0.75);

        // Create thumbnail
        let thumbWidth = THUMBNAIL_SIZE;
        let thumbHeight = THUMBNAIL_SIZE;

        if (aspectRatio > 1) {
          thumbHeight = Math.round(THUMBNAIL_SIZE / aspectRatio);
        } else {
          thumbWidth = Math.round(THUMBNAIL_SIZE * aspectRatio);
        }

        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        const thumbCtx = thumbCanvas.getContext("2d");
        if (!thumbCtx) {
          throw new Error("Failed to get thumbnail context");
        }
        // Fix: Fill thumbnail canvas with white as well
        thumbCtx.fillStyle = "#ffffff";
        thumbCtx.fillRect(0, 0, thumbWidth, thumbHeight);
        thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.8);

        // Calculate compressed size (approximate from base64)
        const compressedSize = Math.round((processedImage.length * 3) / 4);

        resolve({
          thumbnail,
          processedImage,
          compressedSize,
          aspectRatio,
          isVertical,
          width,
          height,
        });
      } catch (error) {
        reject(error);
      } finally {
        // Cleanup blob URL immediately after processing
        URL.revokeObjectURL(blobUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = blobUrl;
  });
}
