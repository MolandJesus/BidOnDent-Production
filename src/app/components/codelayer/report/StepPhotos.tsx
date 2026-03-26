import { type RefObject } from "react";
import { Camera, Cloud, ImagePlus, Info, Trash2, Upload } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type StepPhotosProps = {
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  photos: string[];
  uploadingPhoto: boolean;
  uploadProgress: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  onPhotoUpload: (files: FileList | null) => void;
  onRemovePhoto: (index: number) => void;
  onOpenCamera: () => void;
  onOpenFilePicker: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepPhotos({
  primaryColor,
  appearanceMode = "map-dark",
  photos,
  uploadingPhoto,
  uploadProgress,
  fileInputRef,
  cameraInputRef,
  onPhotoUpload,
  onRemovePhoto,
  onOpenCamera,
  onOpenFilePicker,
  onBack,
  onContinue,
}: StepPhotosProps) {
  const isLightAppearance = appearanceMode === "light";
  return (
    <div className="px-2 md:px-6 pt-3 pb-24 md:py-4 relative min-h-[80vh] bd-glass-card rounded-2xl">
      {/* Title and instructions - compressed for mobile */}
      <h2
        className={`text-xl sm:text-2xl font-bold mb-1 mt-1 ${isLightAppearance ? "text-slate-100" : "text-white/95"}`}
      >
        Add damage photos
      </h2>
      <p
        className={`mb-3 sm:mb-6 text-sm sm:text-base ${isLightAppearance ? "text-blue-100/70" : "text-blue-100/70"}`}
      >
        Add at least one clear photo. Three photos from different angles works best.
      </p>

      {/* Info block - collapsed on mobile */}
      <div className="bd-glass-card p-2 sm:p-4 mb-4 sm:mb-6 flex items-start text-xs sm:text-sm">
        <div className="mr-2 sm:mr-3 mt-0.5">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
        </div>
        <div className={isLightAppearance ? "text-blue-100/70" : "text-blue-100/80"}>
          Good lighting and close-up shots help shops estimate faster.
        </div>
      </div>

      {uploadingPhoto && (
        <div
          className={`backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3 border ${isLightAppearance ? "bg-blue-900/20 border-blue-400/15" : "bg-blue-900/30 border-blue-400/20"}`}
        >
          <div className="animate-spin">
            <Cloud className={`w-5 h-5 ${isLightAppearance ? "text-blue-400" : "text-blue-400"}`} />
          </div>
          <div className="flex-1">
            <p
              className={`text-xs sm:text-sm font-medium ${isLightAppearance ? "text-blue-200" : "text-blue-200"}`}
            >
              {uploadProgress}
            </p>
            <p className={`text-xs ${isLightAppearance ? "text-blue-300/60" : "text-blue-300/70"}`}>
              Photos are being saved securely...
            </p>
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="mb-4 sm:mb-6 bd-glass-card px-3 py-6 sm:px-4 sm:py-10 text-center">
          <ImagePlus className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400/70 mx-auto mb-2" />
          <p
            className={`font-medium text-sm sm:text-base ${isLightAppearance ? "text-white/75" : "text-white/80"}`}
          >
            No photos added yet
          </p>
          <p
            className={`text-xs sm:text-sm mt-1 ${isLightAppearance ? "text-blue-200/50" : "text-blue-200/60"}`}
          >
            Tap camera or upload to continue
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {photos.map((photo, index) => {
          const isBase64 = photo.startsWith("data:");
          return (
            <div key={`photo-${index}`} className="relative bd-glass-card p-2.5">
              <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden mb-2">
                <img
                  src={photo}
                  alt={`Damage photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <div>
                  <p
                    className={`text-sm font-medium ${isLightAppearance ? "text-white/75" : "text-white/80"}`}
                  >
                    Photo {index + 1}
                  </p>
                  <p
                    className={`text-xs ${isLightAppearance ? "text-blue-200/50" : "text-blue-200/60"}`}
                  >
                    {isBase64 ? "Local photo" : "Cloud photo"}
                  </p>
                </div>
                <button
                  onClick={() => onRemovePhoto(index)}
                  aria-label="Remove photo"
                  type="button"
                  className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {photos.length < 6 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
          <button
            type="button"
            onClick={onOpenCamera}
            className="py-3 sm:py-4 bd-glass-card flex flex-col items-center justify-center hover:shadow-md transition-all duration-200"
          >
            <Camera
              className={`w-6 h-6 mb-1 ${isLightAppearance ? "text-blue-400" : "text-blue-400"}`}
            />
            <span
              className={`text-xs sm:text-sm font-medium ${isLightAppearance ? "text-white/75" : "text-white/80"}`}
            >
              Take Photo
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenFilePicker}
            className="py-3 sm:py-4 bd-glass-card flex flex-col items-center justify-center hover:shadow-md transition-all duration-200"
          >
            <Upload
              className={`w-6 h-6 mb-1 ${isLightAppearance ? "text-blue-400" : "text-blue-400"}`}
            />
            <span
              className={`text-xs sm:text-sm font-medium ${isLightAppearance ? "text-white/75" : "text-white/80"}`}
            >
              Upload Photo
            </span>
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onPhotoUpload(e.target.files)}
        multiple
        accept="image/*"
        className="hidden"
      />

      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => onPhotoUpload(e.target.files)}
        accept="image/*"
        className="hidden"
      />

      {/* Sticky footer for progression controls on mobile */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 px-2 pt-2 pb-[env(safe-area-inset-bottom,0.75rem)] sm:static sm:bg-none sm:p-0 border-t ${isLightAppearance ? "bg-gradient-to-t from-[rgba(14,28,52,0.95)] via-[rgba(14,28,52,0.80)] to-transparent border-white/10" : "bg-gradient-to-t from-[rgba(11,23,47,0.95)] via-[rgba(11,23,47,0.80)] to-transparent border-white/10"}`}
      >
        <div className="flex space-x-2 sm:space-x-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={onBack}
            className={`flex-1 py-3 px-4 min-h-[44px] border rounded-xl font-medium transition-colors ${isLightAppearance ? "border-blue-300/15 hover:bg-blue-500/10 text-slate-300" : "border-white/15 hover:bg-white/5 text-white/90"}`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
              boxShadow: "0 4px 20px rgba(37, 99, 235, 0.25), 0 0 28px rgba(59, 130, 246, 0.08)",
            }}
            disabled={photos.length < 1}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
