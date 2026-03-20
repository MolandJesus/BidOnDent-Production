import { uploadPhoto } from "../../../services/supabaseService";
import { supabase } from "../../../services/supabaseService";
import { blobToBase64, compressImage, formatBytes } from "../../../utils/imageCompression";

const PROFILE_IMAGE_BUCKET = "bidondent-profiles";

async function requireActiveSession() {
  console.log("🔐 Checking authentication status...");

  const sessionCheckPromise = supabase.auth.getSession();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Session check timeout")), 5000)
  );

  const {
    data: { session: currentSession },
    error: getSessionError,
  } = (await Promise.race([sessionCheckPromise, timeoutPromise])) as any;

  if (getSessionError) {
    console.error("❌ Error getting session:", getSessionError.message);
    throw new Error("Authentication error. Please refresh the page and try again.");
  }

  if (!currentSession) {
    console.error("❌ No active session found");
    throw new Error("Session expired. Please refresh the page and sign in again.");
  }

  console.log("✅ Active session found for:", currentSession.user?.email);
  console.log("⏭️ Skipping session refresh, using current session");
}

export async function uploadAccountProfileImage(file: File): Promise<string> {
  await requireActiveSession();

  console.log(`📸 Original image: ${formatBytes(file.size)}`);
  const compressedBlob = await compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.6,
    outputFormat: "image/jpeg",
  });
  console.log(`✅ Compressed to: ${formatBytes(compressedBlob.size)}`);

  console.log("☁️ Uploading to cloud storage...");
  const uploadPromise = uploadPhoto(compressedBlob, PROFILE_IMAGE_BUCKET);
  const uploadTimeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => {
      console.warn("⏱️ Upload timeout - falling back to base64");
      resolve(null);
    }, 30000)
  );

  const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);

  if (publicUrl) {
    console.log("✅ Profile image uploaded to Supabase:", publicUrl);
    return publicUrl;
  }

  console.warn("⚠️ Cloud upload failed, using base64 fallback");
  const base64 = await blobToBase64(compressedBlob);
  console.log("✅ Using base64 fallback for profile image");
  return base64;
}
