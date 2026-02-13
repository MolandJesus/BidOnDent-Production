import { type RefObject } from "react";
import { Camera, Cloud, ImagePlus, Info, Trash2, Upload } from "lucide-react";

type StepPhotosProps = {
  primaryColor: string;
  photos: string[];
  uploadingPhoto: boolean;
  uploadProgress: string;
  fileInputRef: RefObject<HTMLInputElement>;
  cameraInputRef: RefObject<HTMLInputElement>;
  onPhotoUpload: (files: FileList | null) => void;
  onRemovePhoto: (index: number) => void;
  onOpenCamera: () => void;
  onOpenFilePicker: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepPhotos({
  primaryColor,
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
  return (
    <div className="px-4 md:px-6 py-4 md:py-4">
      <h2 className="text-2xl font-semibold text-slate-900 mb-1">Add damage photos</h2>
      <p className="text-slate-600 mb-6">
        Add at least one clear photo. Three photos from different angles works best.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start">
        <div className="mr-3 mt-0.5">
          <Info className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-sm text-blue-900">
          Good lighting and close-up shots around dents or scratches help shops estimate faster.
        </div>
      </div>

      {uploadingPhoto && (
        <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="animate-spin">
            <Cloud className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">{uploadProgress}</p>
            <p className="text-xs text-blue-700">Photos are being saved securely...</p>
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="mb-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <ImagePlus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-700 font-medium">No photos added yet</p>
          <p className="text-slate-500 text-sm mt-1">Tap camera or upload to continue</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {photos.map((photo, index) => {
          const isBase64 = photo.startsWith("data:");
          return (
            <div
              key={`photo-${index}`}
              className="relative bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm"
            >
              <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden mb-2">
                <img
                  src={photo}
                  alt={`Damage photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-medium text-slate-700">Photo {index + 1}</p>
                  <p className="text-xs text-slate-500">
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
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={onOpenCamera}
            className="py-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Camera className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-sm text-slate-700 font-medium">Take Photo</span>
          </button>
          <button
            onClick={onOpenFilePicker}
            className="py-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-sm text-slate-700 font-medium">Upload Photo</span>
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

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
          disabled={photos.length < 1}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
