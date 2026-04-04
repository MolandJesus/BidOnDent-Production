import { useState, useRef } from "react";
import { motion } from "motion/react";
import { formatPhoneNumber, unformatPhoneNumber } from "../../utils/formatters";
import { compressImage, blobToBase64, formatBytes } from "../../utils/imageCompression";
import { uploadPhoto } from "../../services/supabaseService";
import { saveShopBusinessProfile } from "../../services/networkProfiles";
import { SUPABASE_STORAGE_BUCKETS } from "../../services/supabase/runtime";
import { LANDING_PAGE_IMAGES } from "../../constants";
import { hasAdminPrivileges } from "../../config/adminConfig";
import { useNotifications } from "../../features/notifications/NotificationContext";
import AccountAdminOverlay from "./account/AccountAdminOverlay";
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
import type { ShopProfileFormData } from "./account/ShopProfileModal";
import { TEST_ACCOUNT_EMAILS, type AccountScreenProps } from "./accountScreenHelpers";

export default function AccountScreen({
  userType = "customer",
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
  userName = "User",
  userEmail = "user@example.com",
  userPhone = "(555) 123-4567",
  profileImage: initialProfileImage = "",
  vehicles = [],
  websiteIdentity,
  onDeleteAccount,
  onLogout,
  onSaveProfile,
  onViewVehicles,
  onOpenSmokeTest,
  onAppearanceModeChange,
}: AccountScreenProps) {
  // Use default profile image if none provided
  const isLightAppearance = appearanceMode === "light";
  const notifications = useNotifications();
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminUser = hasAdminPrivileges(userEmail);

  // REMOVED: Supabase session checking - we now use Clerk for authentication
  // The session check was causing automatic logout when switching to account tab

  // Check if user is using a test account
  const isTestAccount = TEST_ACCOUNT_EMAILS.includes(
    userEmail as (typeof TEST_ACCOUNT_EMAILS)[number]
  );

  // Editable user info
  const [editableName, setEditableName] = useState(userName);
  const [editableEmail, setEditableEmail] = useState(userEmail);
  const [editablePhone, setEditablePhone] = useState(formatPhoneNumber(userPhone));
  const [shopName, setShopName] = useState("");
  const [companyName, setCompanyName] = useState("");

  // User info
  const userInfo = {
    name: editableName,
    email: editableEmail,
    phone: editablePhone,
    vehicles: vehicles || [],
    shopName: userType === "shop" ? shopName : "",
    companyName: userType === "insurer" ? companyName : "",
  };

  const persistProfileImage = async (file: File | Blob) => {
    try {
      setIsSaving(true);
      setImageError(null);

      if (import.meta.env.DEV) {
        console.log(
          "Preparing profile image for website identity:",
          websiteIdentity?.websiteUserKey
        );
        console.log(`Original image: ${formatBytes(file.size)}`);
      }

      const compressedBlob = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.6,
        outputFormat: "image/jpeg",
      });
      if (import.meta.env.DEV) console.log(`Compressed to: ${formatBytes(compressedBlob.size)}`);

      const uploadPromise = uploadPhoto(compressedBlob, SUPABASE_STORAGE_BUCKETS.accountMedia);
      const uploadTimeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => {
          if (import.meta.env.DEV) console.warn("Upload timeout - falling back to base64");
          resolve(null);
        }, 30000)
      );

      const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);

      const finalImageUrl = publicUrl || (await blobToBase64(compressedBlob));
      setProfileImage(finalImageUrl);

      if (onSaveProfile) {
        await onSaveProfile({
          name: editableName,
          email: editableEmail,
          phone: unformatPhoneNumber(editablePhone),
          profileImage: finalImageUrl,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error processing image:", error);
      setImageError(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      );
    } finally {
      setIsSaving(false);
    }
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
          await persistProfileImage(file);
        } catch {
          // persistProfileImage handles its own error state
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
        await persistProfileImage(file);
      } catch {
        // persistProfileImage handles its own error state
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
    setEditablePhone(formatPhoneNumber(value));
  };

  const handleSaveShopProfile = async (data: ShopProfileFormData) => {
    if (!websiteIdentity) {
      throw new Error("Not signed in");
    }

    const certs = data.certifications
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await saveShopBusinessProfile(websiteIdentity, {
      businessName: data.shopName,
      businessPhone: data.phone,
      businessAddress: data.businessAddress,
      businessHours: data.businessHours || null,
      certifications: certs,
      businessCity: "",
      businessState: "",
      businessZip: "",
      specialties: [],
      acceptsInsuranceClaims: false,
      offersEstimates: false,
      insurerPrograms: [],
      supportedMakes: [],
      isAcceptingBids: true,
      isDirectoryVisible: true,
    });
  };

  const handleCloseDeleteAccount = () => {
    setShowDeleteAccount(false);
    setDeleteConfirmText("");
  };

  const saveProfileChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (onSaveProfile) {
        await onSaveProfile({
          name: editableName,
          email: editableEmail,
          phone: unformatPhoneNumber(editablePhone),
          profileImage: profileImage || undefined,
        });
      }

      setSaveSuccess(true);
      setShowEditProfile(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch {
      notifications.push({
        category: "system",
        title: "Profile Save Failed",
        body: "Your profile changes could not be saved. Please try again.",
        payload: {},
        userId: "",
        deepLink: null,
        priority: "high",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    if (deleteConfirmText.toLowerCase() !== "delete") {
      setDeleteError('Please type "DELETE" to confirm account deletion');
      return;
    }

    // Check if test account
    if (isTestAccount) {
      setDeleteError("This account type cannot be deleted through this method");
      setDeleteConfirmText(""); // Reset confirmation text
      return;
    }

    try {
      if (!onDeleteAccount) {
        throw new Error("Account deletion is not available for this profile.");
      }

      setIsDeleting(true);
      await onDeleteAccount();
      setDeleteConfirmText("");
      setShowDeleteAccount(false);
    } catch (error) {
      if (import.meta.env.DEV) console.error("❌ Error deleting account:", error);
      setDeleteError(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-20 relative overflow-hidden">
      {/* Page-level atmospheric orbs */}
      <div
        className="absolute top-40 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-32 -left-20 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }}
      />

      <AccountOverlays
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        primaryColor={primaryColor}
        appearanceMode={appearanceMode}
      />

      <div className="px-4 md:px-6 py-4 md:py-5 space-y-5 w-full relative">
        <AccountHeader
          profileImage={profileImage}
          userInfo={userInfo}
          userType={userType}
          appearanceMode={appearanceMode}
          onProfileImageClick={handleProfileImageClick}
        />

        {imageError && <p className="text-sm text-rose-500 text-center -mt-3">{imageError}</p>}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.02 }}
          className="grid gap-5"
        >
          <AccountInfoCard
            userType={userType}
            userInfo={userInfo}
            appearanceMode={appearanceMode}
            onEditProfile={() => setShowEditProfile(true)}
          />

          <AccountMenu
            userType={userType}
            isAdmin={isAdminUser}
            appearanceMode={appearanceMode}
            onOpenSettings={() => setShowSettings(true)}
            onOpenPayment={() => setShowPayment(true)}
            onOpenShopProfile={() => setShowShopProfile(true)}
            onOpenHelp={() => setShowHelp(true)}
            onOpenSmokeTest={onOpenSmokeTest}
            onOpenAdminPanel={() => setShowAdminPanel(true)}
            onOpenDeleteAccount={isTestAccount ? undefined : () => setShowDeleteAccount(true)}
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
        appearanceMode={appearanceMode}
      />

      <SettingsModal
        isOpen={showSettings}
        primaryColor={primaryColor}
        appearanceMode={appearanceMode}
        onAppearanceModeChange={(mode) => {
          onAppearanceModeChange?.(mode);
        }}
        onClose={() => setShowSettings(false)}
      />

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        appearanceMode={appearanceMode}
      />

      <ShopProfileModal
        isOpen={showShopProfile}
        primaryColor={primaryColor}
        shopName={shopName}
        editablePhone={editablePhone}
        onShopNameChange={setShopName}
        onPhoneChange={handleShopPhoneChange}
        onSave={handleSaveShopProfile}
        onClose={() => setShowShopProfile(false)}
        appearanceMode={appearanceMode}
      />

      <HelpModal
        isOpen={showHelp}
        primaryColor={primaryColor}
        onClose={() => setShowHelp(false)}
        appearanceMode={appearanceMode}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        isDeleting={isDeleting}
        deleteConfirmText={deleteConfirmText}
        error={deleteError}
        onDeleteConfirmTextChange={setDeleteConfirmText}
        onClose={handleCloseDeleteAccount}
        onDelete={handleDeleteAccount}
        appearanceMode={appearanceMode}
      />

      <AccountAdminOverlay
        isOpen={showAdminPanel}
        isAdmin={isAdminUser}
        primaryColor={primaryColor}
        adminEmail={userEmail}
        onClose={() => setShowAdminPanel(false)}
      />
    </div>
  );
}
