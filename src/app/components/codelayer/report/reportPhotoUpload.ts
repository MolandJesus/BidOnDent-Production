import { uploadImageToSupabase } from "../../../services/supabaseService";

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

export async function retryUploadBase64(base64: string): Promise<string> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const imagePath = `damage-reports/${timestamp}-${random}.jpg`;

  const uploadedUrl = await uploadImageToSupabase(base64, imagePath);
  return uploadedUrl || base64;
}

export async function uploadReportPhoto(file: File): Promise<string> {
  const compressedBase64 = await compressImageToBase64(file);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const imagePath = `damage-reports/${timestamp}-${random}.jpg`;

  if (import.meta.env.DEV) console.log("Attempting Supabase upload...");
  const uploadedUrl = await uploadImageToSupabase(compressedBase64, imagePath);

  if (uploadedUrl) {
    if (import.meta.env.DEV) console.log("Photo uploaded to Supabase:", uploadedUrl);
    return uploadedUrl;
  }

  if (import.meta.env.DEV) console.warn("Supabase upload failed, using base64 fallback");
  return compressedBase64;
}
