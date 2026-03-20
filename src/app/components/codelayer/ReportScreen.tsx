import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import PhotoGuide from "../shop/PhotoGuide";
import { uploadImageToSupabase } from "../../services/supabaseService";
import ReportAutoSaveIndicator from "./report/ReportAutoSaveIndicator";
import ReportHeader from "./report/ReportHeader";
import ReportProgress from "./report/ReportProgress";
import StepComplete from "./report/StepComplete";
import StepDamageArea from "./report/StepDamageArea";
import StepDescription from "./report/StepDescription";
import StepPhotos from "./report/StepPhotos";
import StepVehicleInfo from "./report/StepVehicleInfo";

type ReportScreenProps = {
  primaryColor?: string;
  onReportSubmit?: (report: any) => void;
  onViewReports?: () => void;
  onBackToDashboard?: () => void;
  hasSeenPhotoGuide?: boolean;
  onPhotoGuideComplete?: () => void;
  vehicles?: any[];
  onSaveVehicle?: (vehicle: any) => void;
};

export default function ReportScreen({
  primaryColor = "#0056b3",
  onReportSubmit,
  onViewReports,
  onBackToDashboard,
  hasSeenPhotoGuide = false,
  onPhotoGuideComplete,
  vehicles = [],
  onSaveVehicle,
}: ReportScreenProps) {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
  });
  const [damageArea, setDamageArea] = useState("front");
  const [description, setDescription] = useState("");
  const [incident, setIncident] = useState("");
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [hasSeenGuideThisSession, setHasSeenGuideThisSession] = useState(false);
  const saveIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Local storage key for draft report
  const DRAFT_STORAGE_KEY = "bidondent_damage_report_draft";

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        console.log("📋 Loaded draft report from local storage");
        setStep(draft.step || 1);
        // Don't restore photos - they're too large for localStorage
        setVehicle(draft.vehicle || { make: "", model: "", year: "", vin: "" });
        setDamageArea(draft.damageArea || "front");
        setDescription(draft.description || "");
        setIncident(draft.incident || "");
      }
    } catch (error) {
      console.error("Error loading draft from localStorage:", error);
    }
  }, []);

  // Save draft to localStorage whenever any field changes (except on completion)
  useEffect(() => {
    // Don't save if we're on the completion step
    if (step === 5) {
      return;
    }

    // Don't include photos in draft - they're too large for localStorage
    const draft = {
      step,
      // photos excluded to prevent quota errors
      vehicle,
      damageArea,
      description,
      incident,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      console.log("💾 Draft auto-saved to local storage (text data only)");
    } catch (error) {
      console.error("Error saving draft to localStorage:", error);
      // If still failing, clear the draft to prevent repeated errors
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (clearDraftError) {
        console.error("Failed to clear draft:", clearDraftError);
      }
    }
  }, [step, vehicle, damageArea, description, incident]); // Removed photos from dependencies

  useEffect(() => {
    return () => {
      if (saveIndicatorTimeoutRef.current) {
        clearTimeout(saveIndicatorTimeoutRef.current);
      }
    };
  }, []);

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      console.log("🗑️ Cleared draft from local storage");
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  };

  // Sample damage areas with coordinates for interactive selector
  const damageAreas = [
    { id: "front", label: "Front" },
    { id: "rear", label: "Rear" },
    { id: "driver", label: "Driver Side" },
    { id: "passenger", label: "Passenger Side" },
    { id: "roof", label: "Roof" },
    { id: "other", label: "Other" },
  ];

  // Handle photo upload with FileList
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setUploadProgress(`Uploading ${files.length} photo(s)...`);

    try {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        setUploadProgress(`Processing photo ${fileIndex + 1} of ${files.length}...`);

        // Compress image before upload
        const compressedBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            const img = document.createElement("img");
            img.onload = () => {
              // Create canvas for compression
              const canvas = document.createElement("canvas");
              const canvasContext = canvas.getContext("2d");

              // Calculate new dimensions (max 800px for MUCH smaller files)
              let width = img.width;
              let height = img.height;
              const maxSize = 800; // Reduced from 1200 for smaller files

              if (width > maxSize || height > maxSize) {
                if (width > height) {
                  height = (height / width) * maxSize;
                  width = maxSize;
                } else {
                  width = (width / height) * maxSize;
                  height = maxSize;
                }
              }

              canvas.width = width;
              canvas.height = height;

              // Draw and compress
              canvasContext?.drawImage(img, 0, 0, width, height);

              // Start with 0.5 quality for aggressive compression
              let quality = 0.5;
              let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

              // Target: 500KB max (accounting for base64 overhead and storage limits)
              const maxBase64Size = 500 * 1024; // 500KB in bytes
              while (compressedDataUrl.length > maxBase64Size && quality > 0.2) {
                quality -= 0.05;
                compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
              }

              console.log("🗜️ Compressed:", {
                originalSize: `${(file.size / 1024).toFixed(0)}KB`,
                compressedSize: `${(compressedDataUrl.length / 1024).toFixed(0)}KB`,
                quality: Math.round(quality * 100) + "%",
                dimensions: `${Math.round(width)}x${Math.round(height)}`,
                reduction: `${Math.round((1 - compressedDataUrl.length / file.size) * 100)}%`,
              });

              resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = readerEvent.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        console.log("📸 Photo compressed, size:", compressedBase64.length, "bytes");

        // Try to upload to Supabase Storage
        setUploadProgress(`Uploading photo ${fileIndex + 1} of ${files.length}...`);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const imagePath = `damage-reports/${timestamp}-${random}.jpg`;

        console.log("☁️ Attempting Supabase upload...");
        const url = await uploadImageToSupabase(compressedBase64, imagePath);

        if (url) {
          // Store Supabase URL instead of base64
          console.log("✅ Photo uploaded to Supabase:", url);
          setPhotos((prev) => [...prev, url]);
        } else {
          // Fallback to base64 if upload fails
          console.warn("⚠️ Supabase upload failed, using base64 fallback");
          setPhotos((prev) => [...prev, compressedBase64]);
        }
      }

      setUploadProgress("Upload complete!");
      setTimeout(() => {
        setUploadingPhoto(false);
        setUploadProgress("");
      }, 1500);
    } catch (error) {
      console.error("Error uploading photos:", error);
      setUploadProgress("Upload failed");
      setTimeout(() => {
        setUploadingPhoto(false);
        setUploadProgress("");
      }, 2000);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Open camera
  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const nextStep = () => {
    setStep((previousStep) => {
      const next = Math.min(previousStep + 1, 5);

      if (next <= 5) {
        setShowSaveIndicator(true);
        if (saveIndicatorTimeoutRef.current) {
          clearTimeout(saveIndicatorTimeoutRef.current);
        }
        saveIndicatorTimeoutRef.current = setTimeout(() => {
          setShowSaveIndicator(false);
        }, 1500);
      }

      return next;
    });
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const resetForm = () => {
    setStep(1);
    setPhotos([]);
    setVehicle({ make: "", model: "", year: "", vin: "" });
    setDamageArea("front");
    setDescription("");
    setIncident("");
    setHasSeenGuideThisSession(false); // Reset guide state for new report
    clearDraft();
  };

  const handleVehicleContinue = () => {
    if (onSaveVehicle && vehicle.make && vehicle.model && vehicle.year) {
      const isNewVehicle = !vehicles.some(
        (v: any) => v.make === vehicle.make && v.model === vehicle.model && v.year === vehicle.year
      );
      if (isNewVehicle) {
        onSaveVehicle({
          id: Date.now(),
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin || "",
        });
      }
    }
    nextStep();
  };

  const handleDamageContinue = () => {
    if (!hasSeenPhotoGuide && !hasSeenGuideThisSession) {
      setShowPhotoGuide(true);
    } else {
      nextStep();
    }
  };

  const handleSubmitReport = () => {
    if (onReportSubmit) {
      const report = {
        id: Date.now().toString(),
        vehicle,
        damageArea,
        photos,
        description,
        incident,
        status: "pending" as const,
        submittedAt: new Date().toISOString(),
        bidsCount: 0,
      };
      onReportSubmit(report);
    }
    clearDraft();
    nextStep();
  };

  const handleViewReports = () => {
    if (onViewReports) {
      onViewReports();
    } else {
      setStep(1);
    }
  };

  const handleBackToDashboard = () => {
    resetForm();
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  const renderStep = () => {
    console.log("Rendering step:", step, "Photos:", photos.length);

    try {
      switch (step) {
        case 1:
          return (
            <StepVehicleInfo
              primaryColor={primaryColor}
              vehicles={vehicles}
              vehicle={vehicle}
              onVehicleChange={setVehicle}
              onContinue={handleVehicleContinue}
            />
          );

        case 2:
          return (
            <StepDamageArea
              primaryColor={primaryColor}
              damageAreas={damageAreas}
              damageArea={damageArea}
              onSelectDamageArea={setDamageArea}
              onBack={prevStep}
              onContinue={handleDamageContinue}
            />
          );

        case 3:
          return (
            <StepPhotos
              primaryColor={primaryColor}
              photos={photos}
              uploadingPhoto={uploadingPhoto}
              uploadProgress={uploadProgress}
              fileInputRef={fileInputRef}
              cameraInputRef={cameraInputRef}
              onPhotoUpload={handlePhotoUpload}
              onRemovePhoto={removePhoto}
              onOpenCamera={openCamera}
              onOpenFilePicker={openFilePicker}
              onBack={prevStep}
              onContinue={nextStep}
            />
          );

        case 4:
          return (
            <StepDescription
              primaryColor={primaryColor}
              description={description}
              incident={incident}
              onDescriptionChange={setDescription}
              onIncidentChange={setIncident}
              onBack={prevStep}
              onContinue={handleSubmitReport}
            />
          );

        case 5:
          return (
            <StepComplete
              primaryColor={primaryColor}
              onViewReports={handleViewReports}
              onBackToDashboard={handleBackToDashboard}
            />
          );

        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering step:", error);
      return (
        <div className="px-4 py-5">
          <div className="text-center">
            <p className="text-gray-600">Error: Invalid step {step}</p>
            <button
              onClick={() => setStep(1)}
              className="mt-4 py-2 px-4 rounded-md text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
  };

  // Progress bar
  const progress = Math.min(Math.round((step / 5) * 100), 100);

  return (
    <div className="min-h-[calc(100vh-10rem)]">
      <ReportHeader step={step} onCancel={resetForm} showCancel={step < 5} />

      <ReportProgress progress={progress} primaryColor={primaryColor} />

      <div className="pb-24 md:pb-8 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-b from-slate-50 to-slate-100 min-h-[calc(100vh-8rem)]">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {renderStep() || (
                  <div className="px-4 py-5">
                    <div className="text-center">
                      <p className="text-gray-600">Error: Invalid step {step}</p>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-4 py-2 px-4 rounded-md text-white font-medium"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Photo Guide Modal */}
      {showPhotoGuide && (
        <PhotoGuide
          onClose={() => setShowPhotoGuide(false)}
          onComplete={() => {
            setShowPhotoGuide(false);
            setHasSeenGuideThisSession(true);
            if (onPhotoGuideComplete) {
              onPhotoGuideComplete(); // Mark that user has seen the guide
            }
            nextStep();
          }}
          primaryColor={primaryColor}
        />
      )}

      {/* Save Indicator */}
      {showSaveIndicator && <ReportAutoSaveIndicator />}
    </div>
  );
}
