import { uploadPhoto } from "../../../services/supabaseService";
import { blobToBase64, compressImage, formatBytes } from "../../../utils/imageCompression";

const PROFILE_IMAGE_BUCKET = "bidondent-profiles";

export async function uploadAccountProfileImage(file: File): Promise<string> {
  if (import.meta.env.DEV) console.log(`📸 Original image: ${formatBytes(file.size)}`);
  const compressedBlob = await compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.6,
    outputFormat: "image/jpeg",
  });
  if (import.meta.env.DEV) console.log(`✅ Compressed to: ${formatBytes(compressedBlob.size)}`);

  if (import.meta.env.DEV) console.log("☁️ Uploading to cloud storage...");
  const uploadPromise = uploadPhoto(compressedBlob, PROFILE_IMAGE_BUCKET);
  const uploadTimeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => {
      console.warn("⏱️ Upload timeout - falling back to base64");
      resolve(null);
    }, 30000)
  );

  const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);

  if (publicUrl) {
    if (import.meta.env.DEV) console.log("✅ Profile image uploaded to Supabase:", publicUrl);
    return publicUrl;
  }

  console.warn("⚠️ Cloud upload failed, using base64 fallback");
  const base64 = await blobToBase64(compressedBlob);
  if (import.meta.env.DEV) console.log("✅ Using base64 fallback for profile image");
  return base64;
}
