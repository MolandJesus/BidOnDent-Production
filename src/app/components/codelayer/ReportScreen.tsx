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
import StepServiceLocation from "./report/StepServiceLocation";
import { DAMAGE_AREAS } from "./report/damageAreas";
import {
  clearReportDraft,
  DEFAULT_VEHICLE_DRAFT,
  loadReportDraft,
  saveReportDraft,
} from "./report/reportDraftStorage";
import { uploadReportPhoto, isBase64Photo, retryUploadBase64 } from "./report/reportPhotoUpload";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport, Vehicle } from "../../types";

type ReportScreenProps = {
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  onReportSubmit?: (report: DamageReport) => void | Promise<void>;
  onViewReports?: () => void;
  onViewShops?: () => void;
  onBackToDashboard?: () => void;
  hasSeenPhotoGuide?: boolean;
  onPhotoGuideComplete?: () => void;
  vehicles?: Vehicle[];
  onSaveVehicle?: (vehicle: Vehicle) => void;
};

export default function ReportScreen({
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
  onReportSubmit,
  onViewReports,
  onViewShops,
  onBackToDashboard,
  hasSeenPhotoGuide = false,
  onPhotoGuideComplete,
  vehicles = [],
  onSaveVehicle,
}: ReportScreenProps) {
  const isLightAppearance = appearanceMode === "light";
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [vehicle, setVehicle] = useState({ ...DEFAULT_VEHICLE_DRAFT });
  const [damageArea, setDamageArea] = useState("front");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [incident, setIncident] = useState("");
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [hasSeenGuideThisSession, setHasSeenGuideThisSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const saveIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = loadReportDraft();
    if (!draft) return;

    setStep(draft.step || 1);
    setVehicle(draft.vehicle || { ...DEFAULT_VEHICLE_DRAFT });
    setDamageArea(draft.damageArea || "front");
    setZipCode(draft.zipCode || "");
    setAddress(draft.address || "");
    setDescription(draft.description || "");
    setIncident(draft.incident || "");
  }, []);

  // Save draft to localStorage whenever any field changes (except on completion)
  useEffect(() => {
    // Don't save if we're on the completion step
    if (step === 6) {
      return;
    }

    // Don't include photos in draft - they're too large for localStorage
    saveReportDraft({
      step,
      vehicle,
      damageArea,
      zipCode,
      address,
      description,
      incident,
    });
  }, [step, vehicle, damageArea, zipCode, address, description, incident]);

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
      let cloudCount = 0;
      let fallbackCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        const uploadedPhoto = await uploadReportPhoto(file);
        setPhotos((prev) => [...prev, uploadedPhoto]);
        if (isBase64Photo(uploadedPhoto)) {
          fallbackCount++;
        } else {
          cloudCount++;
        }
      }

      if (fallbackCount > 0 && cloudCount === 0) {
        setUploadProgress("Photos saved locally — will retry on submit");
      } else if (fallbackCount > 0) {
        setUploadProgress(`${cloudCount} uploaded, ${fallbackCount} saved locally`);
      } else {
        setUploadProgress("Upload complete!");
      }
      setTimeout(() => {
        setUploadingPhoto(false);
        setUploadProgress("");
      }, 2500);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error uploading photos:", error);
      setUploadProgress("Upload failed — please try again");
      setTimeout(() => {
        setUploadingPhoto(false);
        setUploadProgress("");
      }, 2500);
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
      const next = Math.min(previousStep + 1, 6);

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
    setZipCode("");
    setAddress("");
    setDescription("");
    setIncident("");
    setHasSeenGuideThisSession(false);
    clearDraft();
  };

  const handleVehicleContinue = () => {
    if (onSaveVehicle && vehicle.make && vehicle.model && vehicle.year) {
      const isNewVehicle = !vehicles.some(
        (v) => v.make === vehicle.make && v.model === vehicle.model && v.year === vehicle.year
      );
      if (isNewVehicle) {
        onSaveVehicle({
          id: String(Date.now()),
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
    nextStep(); // proceeds to location step
  };

  const handleLocationContinue = () => {
    if (!hasSeenPhotoGuide && !hasSeenGuideThisSession) {
      setShowPhotoGuide(true);
    } else {
      nextStep();
    }
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Retry uploading any photos that fell back to base64
      let finalPhotos = photos;
      const pendingBase64 = photos.filter(isBase64Photo);
      if (pendingBase64.length > 0) {
        if (import.meta.env.DEV)
          console.log(`Retrying upload for ${pendingBase64.length} base64 photo(s)...`);
        const retried = await Promise.all(
          photos.map((p) => (isBase64Photo(p) ? retryUploadBase64(p) : Promise.resolve(p)))
        );
        finalPhotos = retried;
        setPhotos(retried);
      }

      // Strip any remaining base64 photos from the payload — they're too large for the DB
      const uploadedPhotos = finalPhotos.filter((p) => !isBase64Photo(p));
      const failedCount = finalPhotos.length - uploadedPhotos.length;
      if (failedCount > 0 && import.meta.env.DEV) {
        console.warn(`${failedCount} photo(s) could not be uploaded and will be excluded`);
      }

      if (onReportSubmit) {
        const submittedAt = new Date().toISOString();
        const report: DamageReport = {
          id: Date.now().toString(),
          vehicleId: vehicle.vin || `vehicle-${Date.now()}`,
          vehicleInfo: {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
          },
          damageAreas: [damageArea],
          vehicle: {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
          },
          damageArea,
          zipCode,
          address,
          photos: uploadedPhotos,
          description,
          status: "pending" as const,
          createdAt: submittedAt,
          submittedAt,
          bidsCount: 0,
        };
        await onReportSubmit(report);
      }
      clearDraft();
      nextStep();
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error submitting report:", error);
      const msg = error instanceof Error ? error.message : "";
      const message =
        msg.includes("sign in") || msg.includes("Please")
          ? msg
          : "Something went wrong while submitting. Please check your connection and try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReports = () => {
    if (onViewReports) {
      onViewReports();
    } else {
      setStep(1);
    }
  };

  const handleViewShops = () => {
    if (onViewShops) {
      onViewShops();
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
              appearanceMode={appearanceMode}
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
              appearanceMode={appearanceMode}
              damageAreas={[...DAMAGE_AREAS]}
              damageArea={damageArea}
              onSelectDamageArea={setDamageArea}
              onBack={prevStep}
              onContinue={handleDamageContinue}
            />
          );

        case 3:
          return (
            <StepServiceLocation
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              zipCode={zipCode}
              address={address}
              onZipChange={setZipCode}
              onAddressChange={setAddress}
              onBack={prevStep}
              onContinue={handleLocationContinue}
            />
          );

        case 4:
          return (
            <StepPhotos
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
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

        case 5:
          return (
            <StepDescription
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              description={description}
              incident={incident}
              onDescriptionChange={setDescription}
              onIncidentChange={setIncident}
              onBack={prevStep}
              onContinue={handleSubmitReport}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          );

        case 6:
          return (
            <StepComplete
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              onViewReports={handleViewReports}
              onBackToDashboard={handleBackToDashboard}
              onFindShops={onViewShops ? handleViewShops : undefined}
            />
          );

        default:
          return null;
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error rendering step:", error);
      return (
        <div className="px-4 py-5">
          <div className="text-center">
            <p className="text-slate-300/80">Error: Invalid step {step}</p>
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

  // Progress bar (6 total steps)
  const progress = Math.min(Math.round((step / 6) * 100), 100);

  return (
    <div className="min-h-[calc(100dvh-10rem)]" style={{ touchAction: "pan-x pan-y" }}>
      <ReportHeader
        step={step}
        appearanceMode={appearanceMode}
        onCancel={resetForm}
        showCancel={step < 6}
      />

      <ReportProgress
        progress={progress}
        primaryColor={primaryColor}
        appearanceMode={appearanceMode}
      />

      <div
        className="pb-24 md:pb-8 px-4 md:px-6 py-3 md:py-4 min-h-[calc(100vh-8rem)] relative"
        style={{
          background: isLightAppearance
            ? "linear-gradient(180deg, rgba(240, 248, 255, 0.5) 0%, rgba(226, 238, 250, 0.4) 100%)"
            : "linear-gradient(180deg, rgba(8, 18, 38, 0.44) 0%, rgba(5, 12, 26, 0.36) 100%)",
        }}
      >
        {/* Atmospheric orbs */}
        {!isLightAppearance && (
          <>
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-24 -left-20 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
              }}
            />
          </>
        )}
        <div className="max-w-4xl mx-auto relative">
          <div className={`bd-glass-card${isLightAppearance ? " bd-light-surface" : ""}`}>
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
                      <p className="text-slate-300/80">Error: Invalid step {step}</p>
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
          appearanceMode={appearanceMode}
        />
      )}

      {/* Save Indicator */}
      {showSaveIndicator && <ReportAutoSaveIndicator />}
    </div>
  );
}
