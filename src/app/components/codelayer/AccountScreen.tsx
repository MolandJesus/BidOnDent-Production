import { useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { formatPhoneNumber, unformatPhoneNumber } from "../../utils/formatters";
import { LANDING_PAGE_IMAGES } from "../../constants";
import AccountHeader from "./account/AccountHeader";
import AccountInfoCard from "./account/AccountInfoCard";
import AccountMenu from "./account/AccountMenu";
import AccountOverlays from "./account/AccountOverlays";
import DeleteAccountModal from "./account/DeleteAccountModal";
import EditProfileModal from "./account/EditProfileModal";
import HelpModal from "./account/HelpModal";
import PaymentModal from "./account/PaymentModal";
import { uploadAccountProfileImage } from "./account/profileImageUpload";
import SettingsModal from "./account/SettingsModal";
import ShopProfileModal from "./account/ShopProfileModal";
import { runDeleteAccountFlow } from "./account/accountDeletion";

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
  const { getToken } = useAuth();
  const { user } = useUser();

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
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const processSelectedImage = async (file: File) => {
    try {
      setIsSaving(true);

      const finalImageUrl = await uploadAccountProfileImage(file);

      console.log("💾 Updating profile with new image...");
      setProfileImage(finalImageUrl);

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
          console.log("⚠️ Image set locally but server save failed");
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      console.log("🎉 Profile photo upload complete!");
    } catch (error) {
      console.error("❌ Error processing image:", error);
      alert(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedImage(file);
      e.target.value = "";
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
    await runDeleteAccountFlow({
      deleteConfirmText,
      isTestAccount,
      clerkUserId: user?.id,
      userEmail,
      getClerkToken: () => getToken(),
      deleteClerkUser: async () => {
        if (!user) {
          throw new Error("Unable to load your Clerk user account");
        }

        await user.delete();
      },
      onLogout,
      setIsDeleting,
      resetDeleteState: () => setDeleteConfirmText(""),
      closeDeleteModal: () => setShowDeleteAccount(false),
    });
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
