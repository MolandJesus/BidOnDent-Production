import { useState, useRef } from "react";
import { motion } from "motion/react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import { formatPhoneNumber, unformatPhoneNumber } from "../../utils/formatters";
import { compressImage, blobToBase64, formatBytes } from "../../utils/imageCompression";
import { uploadPhoto } from "../../services/supabaseService";
import { SUPABASE_STORAGE_BUCKETS } from "../../services/supabase/runtime";
import { LANDING_PAGE_IMAGES } from "../../constants";
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
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type AccountScreenProps = {
  userType: string;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  profileImage?: string;
  vehicles?: any[];
  reports?: any[];
  websiteIdentity?: WebsiteIdentity | null;
  onDeleteAccount?: () => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
  onOpenSmokeTest?: () => void;
  onAppearanceModeChange?: (mode: DashboardAppearanceMode) => void;
  onSaveProfile?: (data: {
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  }) => Promise<void> | void;
  onViewVehicles?: () => void;
  onViewReport?: (reportId: string) => void;
};

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

  const persistProfileImage = async (file: File | Blob) => {
    try {
      setIsSaving(true);

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
      alert(
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
        await persistProfileImage(file);
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
      await persistProfileImage(file);
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

    try {
      if (!onDeleteAccount) {
        throw new Error("Account deletion is not available for this profile.");
      }

      setIsDeleting(true);
      await onDeleteAccount();
      setDeleteConfirmText("");
      setShowDeleteAccount(false);
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to delete account"}`);
    } finally {
      setIsDeleting(false);
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
        appearanceMode={appearanceMode}
        onAppearanceModeChange={(mode) => {
          onAppearanceModeChange?.(mode);
        }}
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
