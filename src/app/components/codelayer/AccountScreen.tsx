import { useState, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import { formatPhoneNumber, unformatPhoneNumber } from "../../utils/formatters";
import { compressImage, blobToBase64, formatBytes } from "../../utils/imageCompression";
import { uploadPhoto } from "../../services/supabaseService";
import { SUPABASE_STORAGE_BUCKETS } from "../../services/supabase/runtime";
import { LANDING_PAGE_IMAGES } from "../../constants";
import { hasAdminPrivileges } from "../../config/adminConfig";
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

const AdminDashboard = lazy(() => import("../admin/AdminDashboard"));

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
  const isLightAppearance = appearanceMode === "light";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminUser = hasAdminPrivileges(userEmail);

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
      if (import.meta.env.DEV) console.error("❌ Error deleting account:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to delete account"}`);
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

      <AccountOverlays isSaving={isSaving} saveSuccess={saveSuccess} primaryColor={primaryColor} />

      <div className="px-4 md:px-6 py-4 md:py-5 space-y-5 w-full relative">
        <AccountHeader
          profileImage={profileImage}
          userInfo={userInfo}
          userType={userType}
          appearanceMode={appearanceMode}
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

      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} appearanceMode={appearanceMode} />

      <ShopProfileModal
        isOpen={showShopProfile}
        primaryColor={primaryColor}
        shopName={shopName}
        editablePhone={editablePhone}
        onShopNameChange={setShopName}
        onPhoneChange={handleShopPhoneChange}
        onClose={() => setShowShopProfile(false)}
        appearanceMode={appearanceMode}
      />

      <HelpModal isOpen={showHelp} primaryColor={primaryColor} onClose={() => setShowHelp(false)} />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        isDeleting={isDeleting}
        deleteConfirmText={deleteConfirmText}
        onDeleteConfirmTextChange={setDeleteConfirmText}
        onClose={handleCloseDeleteAccount}
        onDelete={handleDeleteAccount}
        appearanceMode={appearanceMode}
      />

      {/* Admin Panel Full-Screen Overlay */}
      <AnimatePresence>
        {showAdminPanel && isAdminUser && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{
              background: "linear-gradient(180deg, #0b1220 0%, #0a1328 50%, #091020 100%)",
            }}
          >
            <div
              className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-blue-400/15 backdrop-blur-xl"
              style={{ background: "rgba(11, 18, 32, 0.92)" }}
            >
              <button
                onClick={() => setShowAdminPanel(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-400/10 hover:bg-blue-400/20 transition-colors border border-blue-300/15"
              >
                <ArrowLeft className="w-5 h-5 text-blue-100" />
              </button>
              <h2 className="text-lg font-semibold text-slate-100">Admin Panel</h2>
            </div>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
                </div>
              }
            >
              <AdminDashboard primaryColor={primaryColor} adminEmail={userEmail} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
