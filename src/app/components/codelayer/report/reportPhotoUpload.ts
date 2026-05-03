import { uploadImageToSupabase } from "../../../services/supabaseService";

/**
 * Draft photo carried through the report flow.
 *
 * `previewUrl` is always renderable in an <img> tag (base64 data URL).
 * `storagePointer` is the durable `storage://<bucket>/<path>` reference
 * persisted to the database, or null if upload hasn't succeeded yet.
 *
 * Per the storage law (docs/SUPABASE_SETUP_GUIDE.md §16, skill
 * `supabase-storage-signed-urls`): never persist signed URLs. Pointers
 * are written; signed URLs are minted on every read by the edge function.
 */
export type ReportPhotoDraft = {
  previewUrl: string;
  storagePointer: string | null;
};

export async function compressImageToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = document.createElement("img");

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.5;
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        const maxBase64Size = 500 * 1024;
        while (compressedDataUrl.length > maxBase64Size && quality > 0.2) {
          quality -= 0.05;
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (import.meta.env.DEV) {
          console.log("Compressed:", {
            originalSize: `${(file.size / 1024).toFixed(0)}KB`,
            compressedSize: `${(compressedDataUrl.length / 1024).toFixed(0)}KB`,
            quality: `${Math.round(quality * 100)}%`,
            dimensions: `${Math.round(width)}x${Math.round(height)}`,
            reduction: `${Math.round((1 - compressedDataUrl.length / file.size) * 100)}%`,
          });
        }

        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = event.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function isBase64Photo(photo: string): boolean {
  return photo.startsWith("data:");
}

function buildUploadPath(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `damage-reports/${timestamp}-${random}.jpg`;
}

/**
 * Retry a base64 preview against Supabase Storage. Returns the durable
 * `storage://...` pointer if upload succeeds; otherwise null.
 */
export async function retryUploadBase64(base64: string): Promise<string | null> {
  const uploadedPointer = await uploadImageToSupabase(base64, buildUploadPath());
  if (uploadedPointer && !isBase64Photo(uploadedPointer)) {
    return uploadedPointer;
  }
  return null;
}

/**
 * Compress + upload a single photo. Always returns a renderable base64
 * preview; storagePointer is the durable pointer if upload succeeded,
 * or null if the request failed (caller may retry on submit).
 */
export async function uploadReportPhoto(file: File): Promise<ReportPhotoDraft> {
  const compressedBase64 = await compressImageToBase64(file);

  if (import.meta.env.DEV) console.log("Attempting Supabase upload...");
  const uploadedPointer = await uploadImageToSupabase(compressedBase64, buildUploadPath());

  if (uploadedPointer && !isBase64Photo(uploadedPointer)) {
    if (import.meta.env.DEV) console.log("Photo uploaded to Supabase:", uploadedPointer);
    return { previewUrl: compressedBase64, storagePointer: uploadedPointer };
  }

  if (import.meta.env.DEV) console.warn("Supabase upload failed, holding base64 preview locally");
  return { previewUrl: compressedBase64, storagePointer: null };
}
