import { useEffect, useRef, useState } from "react";
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
import { useReportForm } from "./useReportForm";
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
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [hasSeenGuideThisSession, setHasSeenGuideThisSession] = useState(false);
  const reportStepShellRef = useRef<HTMLDivElement>(null);

  const form = useReportForm({
    onReportSubmit,
    onSaveVehicle,
    vehicles,
    hasSeenPhotoGuide,
    hasSeenGuideThisSession,
    setHasSeenGuideThisSession,
    setShowPhotoGuide,
  });

  const handleViewReports = () => {
    if (onViewReports) {
      onViewReports();
    } else {
      form.setStep(1);
    }
  };

  const handleViewShops = () => {
    if (onViewShops) onViewShops();
  };

  const handleBackToDashboard = () => {
    form.resetForm();
    if (onBackToDashboard) onBackToDashboard();
  };

  const renderStep = () => {
    if (import.meta.env.DEV)
      console.log("Rendering step:", form.step, "Photos:", form.photos.length);

    try {
      switch (form.step) {
        case 1:
          return (
            <StepVehicleInfo
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              vehicles={vehicles}
              vehicle={form.vehicle}
              onVehicleChange={form.setVehicle}
              onContinue={form.handleVehicleContinue}
            />
          );

        case 2:
          return (
            <StepDamageArea
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              damageAreas={[...DAMAGE_AREAS]}
              damageArea={form.damageArea}
              onSelectDamageArea={form.setDamageArea}
              onBack={form.prevStep}
              onContinue={form.handleDamageContinue}
            />
          );

        case 3:
          return (
            <StepServiceLocation
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              zipCode={form.zipCode}
              address={form.address}
              onZipChange={form.setZipCode}
              onAddressChange={form.setAddress}
              onCoordsChange={form.setReportCoords}
              onBack={form.prevStep}
              onContinue={form.handleLocationContinue}
            />
          );

        case 4:
          return (
            <StepPhotos
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              photos={form.photos}
              uploadingPhoto={form.uploadingPhoto}
              uploadProgress={form.uploadProgress}
              fileInputRef={form.fileInputRef}
              cameraInputRef={form.cameraInputRef}
              onPhotoUpload={form.handlePhotoUpload}
              onRemovePhoto={form.removePhoto}
              onOpenCamera={form.openCamera}
              onOpenFilePicker={form.openFilePicker}
              onBack={form.prevStep}
              onContinue={form.nextStep}
            />
          );

        case 5:
          return (
            <StepDescription
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              description={form.description}
              incident={form.incident}
              onDescriptionChange={form.setDescription}
              onIncidentChange={form.setIncident}
              onBack={form.prevStep}
              onContinue={form.handleSubmitReport}
              isSubmitting={form.isSubmitting}
              submitError={form.submitError}
            />
          );

        case 6:
          return (
            <StepComplete
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              photoUploadWarning={form.photoUploadWarning}
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
            <p className="text-slate-300/80">Error: Invalid step {form.step}</p>
            <button
              onClick={() => form.setStep(1)}
              className="bd-dashboard-primary-button mt-4 py-2 px-4 text-white font-medium"
              style={{ background: primaryColor }}
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
  };

  const reportStep = Math.min(form.step, 5);

  useEffect(() => {
    if (form.stepAdvanceCount === 0) return;

    const shell = reportStepShellRef.current;
    if (!shell) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let animationFrameId = 0;

    animationFrameId = window.requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        shell.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 60);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [form.step, form.stepAdvanceCount]);

  return (
    <div
      className="bd-report-flow min-h-[calc(100dvh-9rem)]"
      style={{ touchAction: "pan-x pan-y" }}
    >
      <div
        className="relative min-h-[calc(100dvh-9rem)] px-3 py-4 pb-14 sm:px-4 md:px-6 md:py-6"
        style={{
          background: isLightAppearance
            ? "linear-gradient(180deg, rgba(217, 228, 245, 0.86) 0%, rgba(205, 219, 238, 0.78) 46%, rgba(190, 205, 225, 0.74) 100%)"
            : "linear-gradient(180deg, rgba(8, 18, 38, 0.44) 0%, rgba(5, 12, 26, 0.36) 100%)",
        }}
      >
        {/* Atmospheric orbs */}
        {isLightAppearance ? (
          <>
            <div
              className="pointer-events-none absolute -top-20 right-12 h-48 w-48 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.42) 0%, rgba(191,219,254,0.14) 46%, transparent 74%)",
              }}
            />
            <div
              className="pointer-events-none absolute bottom-10 left-0 h-56 w-56 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(191,219,254,0.18) 0%, rgba(125,211,252,0.10) 44%, transparent 76%)",
              }}
            />
          </>
        ) : (
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

        <div className="relative mx-auto max-w-[62rem]">
          <ReportHeader
            step={form.step}
            appearanceMode={appearanceMode}
            onCancel={handleBackToDashboard}
            showCancel={form.step < 6}
          />

          <ReportProgress
            step={reportStep}
            primaryColor={primaryColor}
            appearanceMode={appearanceMode}
          />

          <div ref={reportStepShellRef} className="bd-report-shell mt-3 rounded-[2rem] sm:mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={form.step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {renderStep() || (
                  <div className="px-4 py-5">
                    <div className="text-center">
                      <p className="text-slate-300/80">Error: Invalid step {form.step}</p>
                      <button
                        onClick={() => form.setStep(1)}
                        className="bd-dashboard-primary-button mt-4 py-2 px-4 text-white font-medium"
                        style={{ background: primaryColor }}
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {form.showSaveIndicator && (
            <div className="mt-3 flex justify-center md:mt-4">
              <ReportAutoSaveIndicator />
            </div>
          )}
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
            form.nextStep();
          }}
          primaryColor={primaryColor}
          appearanceMode={appearanceMode}
        />
      )}
    </div>
  );
}
