/**
 * Image compression utility for profile pictures
 * Compresses images to reduce storage usage while maintaining acceptable quality
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";
}

/**
 * Compress an image file or blob
 * @param file - The image file or blob to compress
 * @param options - Compression options
 * @returns Promise resolving to compressed blob
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<Blob> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.8, outputFormat = "image/jpeg" } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const canvasContext = canvas.getContext("2d");
        if (!canvasContext) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use better image smoothing
        canvasContext.imageSmoothingEnabled = true;
        canvasContext.imageSmoothingQuality = "high";

        // Draw image
        canvasContext.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert a compressed blob to base64 string
 * @param blob - The blob to convert
 * @returns Promise resolving to base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error("Failed to convert blob to base64"));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * Compress image and return base64 string
 * Convenience function that combines compression and base64 conversion
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to base64 string
 */
export async function compressImageToBase64(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const compressedBlob = await compressImage(file, options);
  return await blobToBase64(compressedBlob);
}

/**
 * Get the size of a base64 string in bytes
 * @param base64 - Base64 string
 * @returns Size in bytes
 */
export function getBase64Size(base64: string): number {
  // Remove data URL prefix if present
  const base64Data = base64.split(",")[1] || base64;

  // Calculate size: base64 is 4/3 the size of original
  const padding = base64Data.endsWith("==") ? 2 : base64Data.endsWith("=") ? 1 : 0;
  return (base64Data.length * 3) / 4 - padding;
}

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const bytesPerKilobyte = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const sizeUnitIndex = Math.floor(Math.log(bytes) / Math.log(bytesPerKilobyte));

  return (
    Math.round((bytes / Math.pow(bytesPerKilobyte, sizeUnitIndex)) * 100) / 100 +
    " " +
    sizes[sizeUnitIndex]
  );
}
