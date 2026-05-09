/**
 * Photo Upload Utilities for Demo Mode
 * Converts photos to base64 for localStorage storage
 *
 * Pass 25 (audit AI) — pruned 4 dead exports per dormant-exports sweep:
 * `fileToBase64`, `uploadPhotoDemo`, `getLocalStorageUsage`, and
 * `hasLocalStorageSpace` had zero source-tree consumers (independently
 * verified vs co-worker AI's earlier finding). `compressImage` survives
 * with 6 consumers across the photo-upload surfaces.
 */

const MAX_PHOTO_SIZE_BYTES = 25 * 1024 * 1024; // 25MB hard cap before processing

function validatePhotoFile(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new Error(`Invalid file type: "${file.type}". Only image files are supported.`);
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(`File too large (${sizeMB}MB). Maximum supported size is 25MB.`);
  }
}

/**
 * Compress image before converting to base64
 * Reduces localStorage usage
 *
 * Retained intentionally — has 6 live consumers across the wizard / report
 * upload paths (Pass 25 dead-code prune verified via grep-by-name; sibling
 * exports `getStorageUsage` / `formatBytes` / `validatePhotoFile` /
 * `convertFileToBase64` were removed in that pass after confirming zero
 * consumers). Do not include in a future janitor sweep without a fresh
 * `grep -rn "compressImage" src/ --include="*.ts*"` to re-verify.
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<string> => {
  validatePhotoFile(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};
