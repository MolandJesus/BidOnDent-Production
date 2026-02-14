import { compressImage, blobToBase64, formatBytes } from "../../../utils/imageCompression";
import { unformatPhoneNumber } from "../../../utils/formatters";
import { uploadPhoto, supabase } from "../../../services/supabaseService";

type ProfileImageUploadParams = {
  file: File;
  editableName: string;
  editableEmail: string;
  editablePhone: string;
  onSaveProfile?: (data: {
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  }) => void;
  setIsSaving: (value: boolean) => void;
  setProfileImage: (value: string) => void;
  setSaveSuccess: (value: boolean) => void;
};

export async function uploadProfileImage({
  file,
  editableName,
  editableEmail,
  editablePhone,
  onSaveProfile,
  setIsSaving,
  setProfileImage,
  setSaveSuccess,
}: ProfileImageUploadParams) {
  try {
    setIsSaving(true);

    const sessionCheckPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Session check timeout")), 5000)
    );

    const {
      data: { session: currentSession },
      error: getSessionError,
    } = (await Promise.race([sessionCheckPromise, timeoutPromise])) as any;

    if (getSessionError) {
      console.error("Error getting session:", getSessionError.message);
      setIsSaving(false);
      alert("Authentication error. Please refresh the page and try again.");
      return;
    }

    if (!currentSession) {
      console.error("No active session found");
      setIsSaving(false);
      alert("Session expired. Please refresh the page and sign in again.");
      return;
    }

    const compressedBlob = await compressImage(file, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.6,
      outputFormat: "image/jpeg",
    });

    console.log(`Compressed to: ${formatBytes(compressedBlob.size)}`);

    const uploadPromise = uploadPhoto(compressedBlob, "bidondent-profiles");
    const uploadTimeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 30000)
    );

    const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);

    let finalImageUrl: string;
    if (publicUrl) {
      finalImageUrl = publicUrl;
      console.log("Profile image uploaded to Supabase:", publicUrl);
    } else {
      console.warn("Cloud upload failed, using base64 fallback");
      const base64 = await blobToBase64(compressedBlob);
      finalImageUrl = base64;
    }

    setProfileImage(finalImageUrl);

    if (onSaveProfile) {
      try {
        await onSaveProfile({
          name: editableName,
          email: editableEmail,
          phone: unformatPhoneNumber(editablePhone),
          profileImage: finalImageUrl,
        });
      } catch (saveError) {
        console.error("Error saving profile:", saveError);
      }
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setIsSaving(false);
  } catch (error) {
    console.error("Error processing image:", error);
    setIsSaving(false);
    alert(
      `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
    );
  }
}
