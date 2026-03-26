import { supabase } from "./client";
import {
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
  SUPABASE_STORAGE_BUCKETS,
  type SupportedSupabaseBucket,
} from "./runtime";

export async function uploadPhoto(
  file: File | Blob,
  bucket: SupportedSupabaseBucket,
  fileName?: string
): Promise<string | null> {
  try {
    if (import.meta.env.DEV) console.log("📤 Uploading photo to Supabase Storage (using public anon key)...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    if (fileName) {
      formData.append("fileName", fileName);
    }

    if (import.meta.env.DEV) console.log(`📤 Uploading to bucket: ${bucket}`);

    const { publicUrl } = await requestSupabaseEdge<{ publicUrl?: string }>(
      SUPABASE_EDGE_ROUTES.uploadPhoto,
      {
        body: formData,
        method: "POST",
      }
    );
    if (import.meta.env.DEV) console.log("✅ Photo uploaded successfully:", publicUrl);
    return publicUrl || null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("❌ Exception in uploadPhoto:", error);
    return null;
  }
}

export async function deletePhoto(
  url: string,
  bucket: SupportedSupabaseBucket
): Promise<boolean> {
  try {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      if (import.meta.env.DEV) console.error("Error deleting photo:", error);
      return false;
    }

    if (import.meta.env.DEV) console.log("✅ Photo deleted from Supabase Storage");
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in deletePhoto:", error);
    return false;
  }
}

export async function uploadImageToSupabase(base64: string, fileName: string): Promise<string | null> {
  try {
    const base64Data = base64.split(",")[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });

    const sizeInMB = blob.size / 1024 / 1024;
    if (import.meta.env.DEV) console.log(`📊 Image blob size: ${sizeInMB.toFixed(2)}MB (${blob.size} bytes)`);

    if (blob.size > 2 * 1024 * 1024) {
      if (import.meta.env.DEV) {
        console.error(
          `❌ Image too large for upload: ${sizeInMB.toFixed(2)}MB (max 2MB)`
        );
        console.error(`   File will be stored locally instead of cloud storage`);
      }
      return null;
    }

    if (import.meta.env.DEV) console.log("✅ Image size acceptable, proceeding with upload...");

    return await uploadPhoto(blob, SUPABASE_STORAGE_BUCKETS.reportMedia, fileName);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in uploadImageToSupabase:", error);
    return null;
  }
}
