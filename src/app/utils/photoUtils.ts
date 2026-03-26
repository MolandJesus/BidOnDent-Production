/**
 * Photo Upload Utilities for Demo Mode
 * Converts photos to base64 for localStorage storage
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
 * Convert File to base64 data URL
 * For demo mode - stores photos directly in localStorage
 */
export const fileToBase64 = (file: File): Promise<string> => {
  validatePhotoFile(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compress image before converting to base64
 * Reduces localStorage usage
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

/**
 * Upload photo for demo mode
 * Compresses and converts to base64
 */
export const uploadPhotoDemo = async (file: File): Promise<string> => {
  try {
    // Compress image to reduce localStorage usage
    const base64 = await compressImage(file, 1200, 0.8);

    if (import.meta.env.DEV)
      console.log("📸 [DEMO MODE] Photo uploaded:", {
        originalSize: `${(file.size / 1024).toFixed(2)} KB`,
        compressedSize: `${((base64.length * 0.75) / 1024).toFixed(2)} KB`,
        compression: `${((1 - (base64.length * 0.75) / file.size) * 100).toFixed(1)}%`,
      });

    return base64;
  } catch (error) {
    console.error("❌ [DEMO MODE] Photo upload failed:", error);
    throw error;
  }
};

/**
 * Get estimated localStorage usage
 * Helpful for debugging storage quota issues
 */
export const getLocalStorageUsage = (): {
  used: number;
  usedMB: string;
  percentUsed: string;
} => {
  let total = 0;

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }

  // Approximate localStorage limit is 5-10MB (varies by browser)
  const approximateLimit = 5 * 1024 * 1024; // 5MB

  return {
    used: total,
    usedMB: (total / (1024 * 1024)).toFixed(2),
    percentUsed: ((total / approximateLimit) * 100).toFixed(1),
  };
};

/**
 * Check if there's enough space in localStorage
 * Call before uploading multiple photos
 */
export const hasLocalStorageSpace = (requiredBytes: number = 500000): boolean => {
  const usage = getLocalStorageUsage();
  const approximateLimit = 5 * 1024 * 1024; // 5MB
  const available = approximateLimit - usage.used;

  return available > requiredBytes;
};
