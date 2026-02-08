import { projectId, publicAnonKey } from "../../../../utils/supabase/info";
import { supabase } from "./client";

export async function uploadPhoto(
  file: File | Blob,
  bucket: "bidondent-profiles" | "bidondent-vehicles" | "bidondent-damage-photos",
  fileName?: string
): Promise<string | null> {
  try {
    console.log("📤 Uploading photo to Supabase Storage (using public anon key)...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    if (fileName) {
      formData.append("fileName", fileName);
    }

    console.log(`📤 Uploading to bucket: ${bucket}`);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/upload-photo`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Server error uploading photo:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return null;
    }

    const { publicUrl } = await response.json();
    console.log("✅ Photo uploaded successfully:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("❌ Exception in uploadPhoto:", error);
    return null;
  }
}

export async function deletePhoto(
  url: string,
  bucket: "bidondent-profiles" | "bidondent-vehicles" | "bidondent-damage-photos"
): Promise<boolean> {
  try {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting photo:", error);
      return false;
    }

    console.log("✅ Photo deleted from Supabase Storage");
    return true;
  } catch (error) {
    console.error("Error in deletePhoto:", error);
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
    console.log(`📊 Image blob size: ${sizeInMB.toFixed(2)}MB (${blob.size} bytes)`);

    if (blob.size > 2 * 1024 * 1024) {
      console.error(
        `❌ Image too large for upload: ${sizeInMB.toFixed(2)}MB (max 2MB)`
      );
      console.error(`   File will be stored locally instead of cloud storage`);
      return null;
    }

    console.log("✅ Image size acceptable, proceeding with upload...");

    return await uploadPhoto(blob, "bidondent-damage-photos", fileName);
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    return null;
  }
}
