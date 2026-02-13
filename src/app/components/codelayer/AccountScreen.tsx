import { useState, useRef } from "react";
import { motion } from "motion/react";
import { formatPhoneNumber, unformatPhoneNumber } from "../../utils/formatters";
import { compressImage, blobToBase64, formatBytes } from "../../utils/imageCompression";
import { uploadPhoto } from "../../services/supabaseService";
import { LANDING_PAGE_IMAGES } from "../../constants";
import { supabase } from "../../services/supabaseService";
import { projectId } from "../../../../utils/supabase/info";
import AccountHeader from "./account/AccountHeader";
import AccountInfoCard from "./account/AccountInfoCard";
import AccountMenu from "./account/AccountMenu";
import AccountOverlays from "./account/AccountOverlays";
import DeleteAccountModal from "./account/DeleteAccountModal";
import EditProfileModal from "./account/EditProfileModal";
import HelpModal from "./account/HelpModal";
import PaymentModal from "./account/PaymentModal";
import SettingsModal from "./account/SettingsModal";
import ShopProfileModal from "./account/ShopProfileModal";

type AccountScreenProps = {
  userType: string;
  primaryColor?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  profileImage?: string;
  vehicles?: any[];
  reports?: any[];
  onLogout?: () => void;
  onOpenSmokeTest?: () => void;
  onSaveProfile?: (data: {
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  }) => void;
  onViewVehicles?: () => void;
  onViewReport?: (reportId: string) => void;
};

export default function AccountScreen({
  userType = "customer",
  primaryColor = "#0056b3",
  userName = "User",
  userEmail = "user@example.com",
  userPhone = "(555) 123-4567",
  profileImage: initialProfileImage = "",
  vehicles = [],
  onLogout,
  onSaveProfile,
  onViewVehicles,
  onOpenSmokeTest,
}: AccountScreenProps) {
  // Use default profile image if none provided
  const [profileImage, setProfileImage] = useState<string | null>(
    initialProfileImage || LANDING_PAGE_IMAGES.DEFAULT_PROFILE
  );
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showShopProfile, setShowShopProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // REMOVED: Supabase session checking - we now use Clerk for authentication
  // The session check was causing automatic logout when switching to account tab

  // Check if user is using a test account
  const isTestAccount = [
    "customer.test@bidondent.com",
    "shop.test@bidondent.com",
    "insurer.test@bidondent.com",
  ].includes(userEmail);

  // Editable user info
  const [editableName, setEditableName] = useState(userName);
  const [editableEmail, setEditableEmail] = useState(userEmail);
  const [editablePhone, setEditablePhone] = useState(formatPhoneNumber(userPhone));
  const [shopName, setShopName] = useState("Express Auto Body");
  const [companyName, setCompanyName] = useState("SafeDrive Insurance");

  // User info
  const userInfo = {
    name: editableName,
    email: editableEmail,
    phone: editablePhone,
    vehicles: vehicles || [],
    shopName: userType === "shop" ? shopName : "",
    companyName: userType === "insurer" ? companyName : "",
  };

  const handleProfileImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        try {
          // Show loading state
          setIsSaving(true);

          console.log("🔐 Checking authentication status...");

          // Add timeout wrapper for session check (5 seconds max)
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
            setIsSaving(false);
            alert("Authentication error. Please refresh the page and try again.");
            return;
          }

          if (!currentSession) {
            console.error("❌ No active session found");
            setIsSaving(false);
            alert("Session expired. Please refresh the page and sign in again.");
            return;
          }

          console.log("✅ Active session found for:", currentSession.user?.email);

          // Skip session refresh - just use current session to avoid hanging
          console.log("⏭️ Skipping session refresh, using current session");

          // Compress the image more aggressively (400x400 max, 60% quality, JPEG)
          console.log(`📸 Original image: ${formatBytes(file.size)}`);
          const compressedBlob = await compressImage(file, {
            maxWidth: 400,
            maxHeight: 400,
            quality: 0.6,
            outputFormat: "image/jpeg",
          });
          console.log(`✅ Compressed to: ${formatBytes(compressedBlob.size)}`);

          // Upload to Supabase Storage with timeout (30 seconds max)
          console.log("☁️ Uploading to cloud storage...");
          const uploadPromise = uploadPhoto(compressedBlob, "bidondent-profiles");
          const uploadTimeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => {
              console.warn("⏱️ Upload timeout - falling back to base64");
              resolve(null);
            }, 30000)
          );

          const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);

          let finalImageUrl: string;
          if (publicUrl) {
            finalImageUrl = publicUrl;
            console.log("✅ Profile image uploaded to Supabase:", publicUrl);
          } else {
            // Fallback: convert to base64 if upload fails
            console.warn("⚠️ Cloud upload failed, using base64 fallback");
            const base64 = await blobToBase64(compressedBlob);
            finalImageUrl = base64;
            console.log("✅ Using base64 fallback for profile image");
          }

          console.log("💾 Updating profile with new image...");
          setProfileImage(finalImageUrl);

          // Auto-save the profile immediately
          if (onSaveProfile) {
            try {
              await onSaveProfile({
                name: editableName,
                email: editableEmail,
                phone: unformatPhoneNumber(editablePhone),
                profileImage: finalImageUrl,
              });
              console.log("✅ Profile saved successfully");
            } catch (saveError) {
              console.error("❌ Error saving profile:", saveError);
              // Don't throw - image is already set locally
              console.log("⚠️ Image set locally but server save failed");
            }
          }

          // Show success notification
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);

          setIsSaving(false);
          console.log("🎉 Profile photo upload complete!");
        } catch (error) {
          console.error("❌ Error processing image:", error);
          setIsSaving(false);
          // Show user-friendly error without forcing reload
          alert(
            `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
          );
        }
      }
    };
    input.click();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show loading state
        setIsSaving(true);

        console.log("🔐 Checking authentication status...");

        // Add timeout wrapper for session check (5 seconds max)
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
          setIsSaving(false);
          alert("Authentication error. Please refresh the page and try again.");
          return;
        }

        if (!currentSession) {
          console.error("❌ No active session found");
          setIsSaving(false);
          alert("Session expired. Please refresh the page and sign in again.");
          return;
        }

        console.log("✅ Active session found for:", currentSession.user?.email);

        // Skip session refresh - just use current session to avoid hanging
        console.log("⏭️ Skipping session refresh, using current session");

        // Compress the image more aggressively (400x400 max, 60% quality, JPEG)
        console.log(`📸 Original image: ${formatBytes(file.size)}`);
        const compressedBlob = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.6,
          outputFormat: "image/jpeg",
        });
        console.log(`✅ Compressed to: ${formatBytes(compressedBlob.size)}`);

        // Upload to Supabase Storage with timeout (30 seconds max)
        console.log("☁️ Uploading to cloud storage...");
        const uploadPromise = uploadPhoto(compressedBlob, "bidondent-profiles");
        const uploadTimeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn("⏱️ Upload timeout - falling back to base64");
            resolve(null);
          }, 30000)
        );

        const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);

        let finalImageUrl: string;
        if (publicUrl) {
          finalImageUrl = publicUrl;
          console.log("✅ Profile image uploaded to Supabase:", publicUrl);
        } else {
          // Fallback: convert to base64 if upload fails
          console.warn("⚠️ Cloud upload failed, using base64 fallback");
          const base64 = await blobToBase64(compressedBlob);
          finalImageUrl = base64;
          console.log("✅ Using base64 fallback for profile image");
        }

        console.log("💾 Updating profile with new image...");
        setProfileImage(finalImageUrl);

        // Auto-save the profile immediately
        if (onSaveProfile) {
          try {
            await onSaveProfile({
              name: editableName,
              email: editableEmail,
              phone: unformatPhoneNumber(editablePhone),
              profileImage: finalImageUrl,
            });
            console.log("✅ Profile saved successfully");
          } catch (saveError) {
            console.error("❌ Error saving profile:", saveError);
            // Don't throw - image is already set locally
            console.log("⚠️ Image set locally but server save failed");
          }
        }

        // Show success notification
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);

        setIsSaving(false);
        console.log("🎉 Profile photo upload complete!");
      } catch (error) {
        console.error("❌ Error processing image:", error);
        setIsSaving(false);
        // Show user-friendly error without forcing reload
        alert(
          `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
        );
      }
    }
  };

  const handleEditCancel = () => {
    setShowEditProfile(false);
    setEditableName(userName);
    setEditableEmail(userEmail);
    setEditablePhone(formatPhoneNumber(userPhone));
  };

  const handleEditablePhoneChange = (value: string) => {
    setEditablePhone(formatPhoneNumber(value));
  };

  const handleShopPhoneChange = (value: string) => {
    setEditablePhone(value);
  };

  const handleCloseDeleteAccount = () => {
    setShowDeleteAccount(false);
    setDeleteConfirmText("");
  };

  const saveProfileChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    if (onSaveProfile) {
      await onSaveProfile({
        name: editableName,
        email: editableEmail,
        phone: unformatPhoneNumber(editablePhone),
        profileImage: profileImage || undefined,
      });
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setShowEditProfile(false);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleDeleteAccount = async () => {
    // Safety check: Verify confirmation text matches
    if (deleteConfirmText.toLowerCase() !== "delete") {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    // Check if test account
    if (isTestAccount) {
      alert("This account type cannot be deleted through this method");
      setDeleteConfirmText(""); // Reset confirmation text
      return;
    }

    // Note: Admin check happens on the server side - server will reject admin deletion attempts

    setIsDeleting(true);

    try {
      console.log("🔄 Step 1: Getting current session for account deletion...");

      // Step 1: Get current session
      let {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Session check:", {
        hasSession: !!session,
        sessionError: sessionError?.message,
        hasAccessToken: !!session?.access_token,
        userEmail: session?.user?.email,
      });

      // Step 2: If no session or error, try to refresh
      if (sessionError || !session || !session.access_token) {
        console.log("⚠️ No valid session, attempting refresh...");

        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshData.session || !refreshData.session.access_token) {
          console.error("❌ Session refresh failed:", refreshError?.message);
          alert("Session expired. Please sign in again.");
          setIsDeleting(false);
          setDeleteConfirmText("");
          setShowDeleteAccount(false);
          if (onLogout) {
            onLogout();
          }
          return;
        }

        session = refreshData.session;
        console.log("✅ Session refreshed successfully");
      }

      // Step 3: Validate the session one more time
      if (!session || !session.access_token) {
        console.error("❌ Still no valid session after refresh");
        alert("Authentication error. Please sign in again.");
        setIsDeleting(false);
        setDeleteConfirmText("");
        setShowDeleteAccount(false);
        if (onLogout) {
          onLogout();
        }
        return;
      }

      // Step 4: Verify the token is valid by testing it CLIENT-SIDE
      console.log("🔍 Verifying token validity with client-side check...");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(session.access_token);

      if (userError || !user) {
        console.error("❌ Token validation failed:", userError?.message);
        console.error("❌ The JWT token is invalid or expired");

        // Try one more refresh
        console.log("🔄 Final attempt: refreshing session...");
        const { data: finalRefresh, error: finalError } = await supabase.auth.refreshSession();

        if (finalError || !finalRefresh.session?.access_token) {
          console.error("❌ Final refresh failed:", finalError?.message);
          alert("Session expired. Please sign in again.");
          setIsDeleting(false);
          setDeleteConfirmText("");
          setShowDeleteAccount(false);
          if (onLogout) {
            onLogout();
          }
          return;
        }

        session = finalRefresh.session;
        console.log("✅ Final refresh successful");

        // Validate the refreshed token
        const {
          data: { user: validatedUser },
          error: validationError,
        } = await supabase.auth.getUser(session.access_token);

        if (validationError || !validatedUser) {
          console.error("❌ Even after refresh, token is still invalid");
          alert("Authentication error. Please sign in again.");
          setIsDeleting(false);
          setDeleteConfirmText("");
          setShowDeleteAccount(false);
          if (onLogout) {
            onLogout();
          }
          return;
        }

        console.log("✅ Refreshed token validated successfully");
      } else {
        console.log("✅ Token is valid for user:", user.email);
      }

      console.log("✅ All validation checks passed, proceeding with deletion");
      console.log(
        "📅 Token expires at:",
        new Date((session.expires_at || 0) * 1000).toLocaleString()
      );

      // Step 5: Now delete with the validated token
      await performDeletion(session.access_token);
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to delete account"}`);
      setIsDeleting(false);
      setDeleteConfirmText(""); // Reset confirmation text so user can try again
    }
  };

  const performDeletion = async (accessToken: string) => {
    try {
      // Validate prerequisites
      if (!projectId) {
        throw new Error("ProjectId is not defined - cannot construct API URL");
      }

      if (!accessToken || accessToken.length < 20) {
        throw new Error("Invalid access token - too short or empty");
      }

      const deleteUrl = `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/delete-account`;
      console.log("🗑️ Requesting account deletion...");
      console.log("🌐 Full URL:", deleteUrl);
      console.log("🌐 URL length:", deleteUrl.length);
      console.log("🔑 Access token length:", accessToken.length);
      console.log("🔑 Access token preview:", accessToken.substring(0, 20) + "...");
      console.log("🔍 ProjectId value:", projectId);
      console.log("📋 Request method: POST");
      console.log("📋 Headers:", {
        Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
        "Content-Type": "application/json",
      });

      // Call server endpoint to delete account
      console.log("🚀 Initiating fetch request...");
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body to ensure proper POST request
      });
      console.log("✅ Fetch completed, got response");

      const responseText = await response.text();
      console.log("📥 Server response status:", response.status);
      console.log("📥 Server response:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        console.error("❌ Account deletion failed:", errorData);
        alert(
          `Failed to delete account: ${errorData.error || errorData.message || errorData.details || "Unknown error"}`
        );
        setIsDeleting(false);
        setDeleteConfirmText(""); // Reset confirmation text so user can try again
        return;
      }

      console.log("✅ Account deleted successfully");

      // Show success message and logout
      alert(
        "Your account has been permanently deleted. All your data has been removed from our systems."
      );

      // Clear session and logout
      await supabase.auth.signOut();

      setIsDeleting(false);
      setDeleteConfirmText("");
      setShowDeleteAccount(false);

      // Trigger logout to return to login screen
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error("❌ Error in deletion request:", error);
      console.error("❌ Error type:", error?.constructor?.name);
      console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
      console.error(
        "❌ Full error object:",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
      alert(
        `Error: ${error instanceof Error ? error.message : "Failed to delete account"}. Check console for details.`
      );
      setIsDeleting(false);
      setDeleteConfirmText("");
    }
  };

  return (
    <div className="pb-20">
      <AccountOverlays isSaving={isSaving} saveSuccess={saveSuccess} primaryColor={primaryColor} />

      <div className="px-4 md:px-6 py-4 md:py-5 space-y-5 w-full">
        <AccountHeader
          profileImage={profileImage}
          userInfo={userInfo}
          userType={userType}
          primaryColor={primaryColor}
          onProfileImageClick={handleProfileImageClick}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.02 }}
          className="grid gap-5"
        >
          <AccountInfoCard
            userType={userType}
            userInfo={userInfo}
            onEditProfile={() => setShowEditProfile(true)}
          />

          <AccountMenu
            userType={userType}
            onOpenSettings={() => setShowSettings(true)}
            onOpenPayment={() => setShowPayment(true)}
            onOpenShopProfile={() => setShowShopProfile(true)}
            onOpenHelp={() => setShowHelp(true)}
            onOpenSmokeTest={onOpenSmokeTest}
            onOpenDeleteAccount={() => setShowDeleteAccount(true)}
            onLogout={handleLogout}
            onViewVehicles={onViewVehicles}
          />
        </motion.div>
      </div>

      <EditProfileModal
        isOpen={showEditProfile}
        primaryColor={primaryColor}
        isSaving={isSaving}
        profileImage={profileImage}
        defaultProfileImage={LANDING_PAGE_IMAGES.DEFAULT_PROFILE}
        editableName={editableName}
        editableEmail={editableEmail}
        editablePhone={editablePhone}
        onChangeName={setEditableName}
        onChangeEmail={setEditableEmail}
        onChangePhone={handleEditablePhoneChange}
        onCancel={handleEditCancel}
        onSave={saveProfileChanges}
        onImageClick={handleImageClick}
        fileInputRef={fileInputRef}
        onImageChange={handleImageChange}
      />

      <SettingsModal
        isOpen={showSettings}
        primaryColor={primaryColor}
        onClose={() => setShowSettings(false)}
      />

      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

      <ShopProfileModal
        isOpen={showShopProfile}
        primaryColor={primaryColor}
        shopName={shopName}
        editablePhone={editablePhone}
        onShopNameChange={setShopName}
        onPhoneChange={handleShopPhoneChange}
        onClose={() => setShowShopProfile(false)}
      />

      <HelpModal isOpen={showHelp} primaryColor={primaryColor} onClose={() => setShowHelp(false)} />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        isDeleting={isDeleting}
        deleteConfirmText={deleteConfirmText}
        onDeleteConfirmTextChange={setDeleteConfirmText}
        onClose={handleCloseDeleteAccount}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
}
