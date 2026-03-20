import { Camera, Mail, Phone, Save, User as UserIcon, X } from "lucide-react";
import type { RefObject } from "react";

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
  fileInputRef: RefObject<HTMLInputElement>;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  onImageChange
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Edit Profile</h2>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <img src={defaultProfileImage} alt="Default Profile" className="w-full h-full object-cover" />
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
            <p className="text-xs text-gray-500 mt-2">Click camera to change photo</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="edit-name"
                  type="text"
                  value={editableName}
                  onChange={(e) => onChangeName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="edit-email"
                  type="email"
                  value={editableEmail}
                  onChange={(e) => onChangeEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex gap-3 z-10">
          <button
            type="button"
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm"
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
