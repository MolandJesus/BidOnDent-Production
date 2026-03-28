import { Camera, Mail, Phone, Save, User as UserIcon, X } from "lucide-react";
import type { RefObject } from "react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type EditProfileModalProps = {
  isOpen: boolean;
  primaryColor: string;
  isSaving: boolean;
  profileImage: string | null;
  defaultProfileImage: string;
  editableName: string;
  editableEmail: string;
  editablePhone: string;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePhone: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onImageClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function EditProfileModal({
  isOpen,
  primaryColor,
  isSaving,
  profileImage,
  defaultProfileImage,
  editableName,
  editableEmail,
  editablePhone,
  onChangeName,
  onChangeEmail,
  onChangePhone,
  onCancel,
  onSave,
  onImageClick,
  fileInputRef,
  onImageChange,
  appearanceMode = "map-dark",
}: EditProfileModalProps) {
  const isLight = appearanceMode === "light";
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bd-glass-floating rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`sticky top-0 backdrop-blur-sm border-b px-6 py-4 rounded-t-2xl z-10 ${isLight ? "bg-white/95 border-slate-200/60" : "bg-slate-900/80 border-white/[0.08]"}`}
        >
          <div className="flex justify-between items-center">
            <h2 className={`font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Edit Profile
            </h2>
            <button
              className={`transition-colors p-1 rounded-full ${isLight ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"}`}
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={defaultProfileImage}
                    alt="Default Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
                onClick={onImageClick}
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className={`text-xs mt-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Click camera to change photo
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="edit-name"
                className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="edit-name"
                  type="text"
                  value={editableName}
                  onChange={(e) => onChangeName(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.12]"}`}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="edit-email"
                className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="edit-email"
                  type="email"
                  value={editableEmail}
                  onChange={(e) => onChangeEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg transition-all text-sm cursor-not-allowed ${isLight ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/[0.10] bg-white/[0.04] text-slate-400"}`}
                  placeholder="your@email.com"
                  readOnly
                />
              </div>
              <p className={`mt-1 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Email changes are managed through your sign-in account settings.
              </p>
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="edit-phone"
                className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="edit-phone"
                  type="tel"
                  value={editablePhone}
                  onChange={(e) => onChangePhone(e.target.value)}
                  placeholder="Phone number"
                  maxLength={14}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.12]"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`sticky bottom-0 border-t px-6 py-4 rounded-b-2xl flex gap-3 z-10 ${isLight ? "bg-white/95 border-slate-200/60" : "bg-white/[0.04] border-white/[0.10]"}`}
        >
          <button
            type="button"
            className={`flex-1 px-4 py-2.5 border-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm ${isLight ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "border-white/[0.12] text-slate-300 hover:bg-white/[0.06]"}`}
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white flex items-center justify-center disabled:opacity-50 transition-all shadow-md hover:shadow-lg text-sm"
            style={{ backgroundColor: primaryColor }}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
