import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import PhotoGuide from "../shop/PhotoGuide";
import ReportAutoSaveIndicator from "./report/ReportAutoSaveIndicator";
import ReportHeader from "./report/ReportHeader";
import ReportProgress from "./report/ReportProgress";
import StepComplete from "./report/StepComplete";
import StepDamageArea from "./report/StepDamageArea";
import StepDescription from "./report/StepDescription";
import StepPhotos from "./report/StepPhotos";
import StepVehicleInfo from "./report/StepVehicleInfo";
import { DAMAGE_AREAS } from "./report/damageAreas";
import {
  clearReportDraft,
  DEFAULT_VEHICLE_DRAFT,
  loadReportDraft,
  saveReportDraft,
} from "./report/reportDraftStorage";
import { uploadReportPhoto } from "./report/reportPhotoUpload";

type ReportScreenProps = {
  primaryColor?: string;
  onReportSubmit?: (report: any) => void | Promise<void>;
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
  const [vehicle, setVehicle] = useState({ ...DEFAULT_VEHICLE_DRAFT });
  const [damageArea, setDamageArea] = useState("front");
  const [description, setDescription] = useState("");
  const [incident, setIncident] = useState("");
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [hasSeenGuideThisSession, setHasSeenGuideThisSession] = useState(false);
  const saveIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = loadReportDraft();

    if (draft) {
      if (import.meta.env.DEV) console.log("Loaded draft report from local storage");
      setStep(draft.step || 1);
      // Don't restore photos - they're too large for localStorage
      setVehicle(draft.vehicle || { ...DEFAULT_VEHICLE_DRAFT });
      setDamageArea(draft.damageArea || "front");
      setDescription(draft.description || "");
      setIncident(draft.incident || "");
    }
  }, []);

  // Save draft to localStorage whenever any field changes (except on completion)
  useEffect(() => {
    // Don't save if we're on the completion step
    if (step === 5) {
      return;
    }

    // Don't include photos in draft - they're too large for localStorage
    saveReportDraft({
      step,
      vehicle,
      damageArea,
      description,
      incident,
    });
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
    clearReportDraft();
  };

  // Handle photo upload with FileList
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setUploadProgress(`Uploading ${files.length} photo(s)...`);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Processing photo ${i + 1} of ${files.length}...`);
        setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        const uploadedPhoto = await uploadReportPhoto(file);
        setPhotos((prev) => [...prev, uploadedPhoto]);
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
    setVehicle({ ...DEFAULT_VEHICLE_DRAFT });
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

  const handleSubmitReport = async () => {
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
      await onReportSubmit(report);
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
    if (import.meta.env.DEV) console.log("Rendering step:", step, "Photos:", photos.length);

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
              damageAreas={DAMAGE_AREAS}
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
