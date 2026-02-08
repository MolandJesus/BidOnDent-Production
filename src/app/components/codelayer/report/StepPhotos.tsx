import { type RefObject } from "react";
import { Camera, Cloud, Info, Upload, Trash2 } from "lucide-react";

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
  onContinue
}: StepPhotosProps) {
  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold mb-6">Take Photos</h2>
      <p className="text-gray-600 mb-6">
        Please take clear photos of the damaged areas. Add at least 3 photos from different angles.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
        <div className="mr-3 mt-1">
          <Info className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-sm text-blue-800">
          For the best results, take photos in good lighting and make sure the damaged areas are
          clearly visible.
        </div>
      </div>

      {uploadingPhoto && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="animate-spin">
            <Cloud className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">{uploadProgress}</p>
            <p className="text-xs text-blue-600">Photos are being saved to cloud storage...</p>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {photos.map((photo, index) => {
          console.log(`🖼️ Rendering photo ${index + 1}:`, photo.substring(0, 100) + "...");
          const isBase64 = photo.startsWith("data:");
          console.log(`   Type: ${isBase64 ? "Base64" : "URL"}`);
          return (
            <div
              key={`photo-${index}`}
              className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2"
            >
              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={photo}
                  alt={`Damage photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log(`✅ Photo ${index + 1} loaded successfully`)}
                  onError={() => {
                    console.error(`❌ Photo ${index + 1} failed to load`);
                    console.error(`   URL: ${photo.substring(0, 200)}`);
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Photo {index + 1}</p>
                <p className="text-xs text-gray-500">{isBase64 ? "Local photo" : "Cloud photo"}</p>
              </div>
              <button
                onClick={() => onRemovePhoto(index)}
                aria-label="Remove photo"
                type="button"
                className="flex-shrink-0 p-2 rounded-md hover:bg-red-50 transition-colors"
                style={{ color: "#EF4444" }}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {photos.length < 6 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={onOpenCamera}
            className="py-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Camera className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 font-medium">Take Photo</span>
          </button>
          <button
            onClick={onOpenFilePicker}
            className="py-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 font-medium">Upload Photo</span>
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
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-2 px-4 rounded-md text-white font-medium"
          style={{ backgroundColor: primaryColor }}
          disabled={photos.length < 1}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
