import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";

type PhotoGalleryLightboxProps = {
  photos: string[];
  onClose: () => void;
};

export default function PhotoGalleryLightbox({ photos, onClose }: PhotoGalleryLightboxProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur">
        <div className="text-white">
          <span className="font-medium">
            {currentPhotoIndex + 1} / {photos.length}
          </span>
        </div>
        <button
          className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          onClick={onClose}
          aria-label="Close photo gallery"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Photo Area with Touch Support */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onTouchStart={(e) => {
          setTouchStart(e.targetTouches[0].clientX);
        }}
        onTouchMove={(e) => {
          setTouchEnd(e.targetTouches[0].clientX);
        }}
        onTouchEnd={() => {
          if (touchStart - touchEnd > 75) {
            if (currentPhotoIndex < photos.length - 1) {
              setCurrentPhotoIndex((prev) => prev + 1);
              setZoomLevel(1);
            }
          }
          if (touchStart - touchEnd < -75) {
            if (currentPhotoIndex > 0) {
              setCurrentPhotoIndex((prev) => prev - 1);
              setZoomLevel(1);
            }
          }
        }}
        onDoubleClick={() => {
          setZoomLevel((prev) => (prev === 1 ? 2 : 1));
        }}
        onClick={(e) => {
          if (e.detail === 2) {
            setZoomLevel((prev) => (prev === 1 ? 2 : 1));
          }
        }}
      >
        {/* Phase 3 media trust (2026-05-03 P3): ImageWithFallback prevents
            a leaked storage:// pointer from rendering a broken full-screen
            image — fallback shows the premium glass tile in its place. */}
        <ImageWithFallback
          src={photos[currentPhotoIndex]}
          alt={`Photo ${currentPhotoIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-300"
          style={{
            transform: `scale(${zoomLevel})`,
            cursor: zoomLevel === 1 ? "zoom-in" : "zoom-out",
          }}
        />

        {/* Navigation Arrows (Desktop) */}
        {photos.length > 1 && (
          <>
            {currentPhotoIndex > 0 && (
              <button
                className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur text-white rounded-full p-3 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => prev - 1);
                  setZoomLevel(1);
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {currentPhotoIndex < photos.length - 1 && (
              <button
                className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur text-white rounded-full p-3 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => prev + 1);
                  setZoomLevel(1);
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-black/50 backdrop-blur space-y-3">
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, idx) => (
              <button
                key={idx}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentPhotoIndex
                    ? "border-white scale-105"
                    : "border-white/30 opacity-60 hover:opacity-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(idx);
                  setZoomLevel(1);
                }}
              >
                <ImageWithFallback
                  src={photo}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="text-center text-white/70 text-sm">
          <span className="hidden md:inline">Click photo to zoom • </span>
          <span className="md:hidden">Double-tap to zoom • Swipe to navigate • </span>
          Tap outside to close
        </div>
      </div>
    </div>
  );
}
