import { useState, useRef, useEffect } from "react";
import {
  clearReportDraft,
  DEFAULT_VEHICLE_DRAFT,
  loadReportDraft,
  saveReportDraft,
} from "./report/reportDraftStorage";
import {
  uploadReportPhoto,
  retryUploadBase64,
  type ReportPhotoDraft,
} from "./report/reportPhotoUpload";
import type { DamageReport, Vehicle } from "../../types";

interface UseReportFormArgs {
  onReportSubmit?: (report: DamageReport) => void | Promise<void>;
  onSaveVehicle?: (vehicle: Vehicle) => void;
  vehicles: Vehicle[];
  hasSeenPhotoGuide: boolean;
  hasSeenGuideThisSession: boolean;
  setHasSeenGuideThisSession: (value: boolean) => void;
  setShowPhotoGuide: (value: boolean) => void;
}

export function useReportForm({
  onReportSubmit,
  onSaveVehicle,
  vehicles,
  hasSeenPhotoGuide,
  hasSeenGuideThisSession,
  setHasSeenGuideThisSession,
  setShowPhotoGuide,
}: UseReportFormArgs) {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<ReportPhotoDraft[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [vehicle, setVehicle] = useState<{
    make: string;
    model: string;
    year: string;
    vin?: string;
  }>({ ...DEFAULT_VEHICLE_DRAFT });
  const [damageArea, setDamageArea] = useState("front");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [incident, setIncident] = useState("");
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoUploadWarning, setPhotoUploadWarning] = useState<string | null>(null);
  const [stepAdvanceCount, setStepAdvanceCount] = useState(0);
  const saveIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

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
    if (step === 6) return;
    saveReportDraft({
      step,
      vehicle: { ...vehicle, vin: vehicle.vin ?? "" },
      damageArea,
      zipCode,
      address,
      description,
      incident,
    });
  }, [step, vehicle, damageArea, zipCode, address, description, incident]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (saveIndicatorTimeoutRef.current) {
        clearTimeout(saveIndicatorTimeoutRef.current);
      }
    };
  }, []);

  const clearDraft = () => {
    clearReportDraft();
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setUploadProgress(`Uploading ${files.length} photo(s)...`);

    try {
      let cloudCount = 0;
      let fallbackCount = 0;

      for (let i = 0; i < files.length; i++) {
        if (!mountedRef.current) return;
        const file = files[i];
        setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        const draft = await uploadReportPhoto(file);
        if (!mountedRef.current) return;
        setPhotos((prev) => [...prev, draft]);
        if (draft.storagePointer) {
          cloudCount++;
        } else {
          fallbackCount++;
        }
      }

      if (!mountedRef.current) return;

      if (fallbackCount > 0 && cloudCount === 0) {
        setUploadProgress("Photos saved locally — will retry on submit");
      } else if (fallbackCount > 0) {
        setUploadProgress(`${cloudCount} uploaded, ${fallbackCount} saved locally`);
      } else {
        setUploadProgress("Upload complete!");
      }
      setTimeout(() => {
        if (!mountedRef.current) return;
        setUploadingPhoto(false);
        setUploadProgress("");
      }, 2500);
    } catch (error) {
      if (!mountedRef.current) return;
      if (import.meta.env.DEV) console.error("Error uploading photos:", error);
      setUploadProgress("Upload failed — please try again");
      setTimeout(() => {
        if (!mountedRef.current) return;
        setUploadingPhoto(false);
        setUploadProgress("");
      }, 2500);
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();
  const openCamera = () => cameraInputRef.current?.click();

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const nextStep = () => {
    setStepAdvanceCount((count) => count + 1);
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

  const prevStep = () => setStep(step - 1);

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
    // Pass 66 (2026-05-07) — KI-129: visual asterisks marked make/model/year
    // as required, but the wizard happily advanced with empty values. Gate
    // the step on those three fields so the asterisks tell the truth.
    if (!vehicle.make.trim() || !vehicle.model.trim() || !vehicle.year.trim()) {
      return;
    }
    if (onSaveVehicle && vehicle.make && vehicle.model && vehicle.year) {
      const isNewVehicle = !vehicles.some(
        (v) =>
          v.make === vehicle.make && v.model === vehicle.model && String(v.year) === vehicle.year
      );
      if (isNewVehicle) {
        onSaveVehicle({
          id: String(Date.now()),
          make: vehicle.make,
          model: vehicle.model,
          year: Number(vehicle.year),
          vin: vehicle.vin || "",
        });
      }
    }
    nextStep();
  };

  const handleDamageContinue = () => nextStep();

  const handleLocationContinue = () => {
    if (!hasSeenPhotoGuide && !hasSeenGuideThisSession) {
      setShowPhotoGuide(true);
    } else {
      nextStep();
    }
  };

  const handleSubmitReport = async () => {
    // Final validation gate — catch any data that slipped through step-level checks
    const trimmedDescription = description.trim();
    const yearStr = String(vehicle.year ?? "").trim();
    if (!vehicle.make?.trim() || !vehicle.model?.trim() || !yearStr) {
      setSubmitError(
        "Vehicle information is incomplete. Please go back and fill in make, model, and year."
      );
      return;
    }
    if (photos.length === 0) {
      setSubmitError("At least one photo is required. Please go back and add a photo.");
      return;
    }
    if (trimmedDescription.length < 10) {
      setSubmitError("Description must be at least 10 characters. Please go back and update it.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setPhotoUploadWarning(null);
    try {
      let finalPhotos = photos;
      const pendingCount = photos.filter((p) => !p.storagePointer).length;
      if (pendingCount > 0) {
        if (import.meta.env.DEV)
          console.log(`Retrying upload for ${pendingCount} pending photo(s)...`);
        const retried = await Promise.all(
          photos.map(async (p): Promise<ReportPhotoDraft> => {
            if (p.storagePointer) return p;
            const pointer = await retryUploadBase64(p.previewUrl);
            return { previewUrl: p.previewUrl, storagePointer: pointer };
          })
        );
        finalPhotos = retried;
        setPhotos(retried);
      }

      const uploadedPointers = finalPhotos
        .map((p) => p.storagePointer)
        .filter((p): p is string => Boolean(p));
      const failedCount = finalPhotos.length - uploadedPointers.length;
      if (failedCount > 0 && import.meta.env.DEV) {
        console.warn(`${failedCount} photo(s) could not be uploaded and will be excluded`);
      }

      if (failedCount > 0 && uploadedPointers.length === 0) {
        setSubmitError(
          `All ${failedCount} photo(s) failed to upload. Please check your connection and try adding photos again.`
        );
        setIsSubmitting(false);
        return;
      }

      if (failedCount > 0) {
        setPhotoUploadWarning(
          `${failedCount} of ${finalPhotos.length} photo(s) could not be uploaded and were excluded from your report.`
        );
      }

      if (onReportSubmit) {
        const submittedAt = new Date().toISOString();
        // Look up the saved vehicle's real UUID; fall back to undefined (→ null in DB)
        const matchedVehicle = vehicles.find(
          (v) =>
            v.make === vehicle.make && v.model === vehicle.model && String(v.year) === vehicle.year
        );
        const report: DamageReport = {
          id: Date.now().toString(),
          vehicleId: matchedVehicle?.id || "",
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
          latitude: reportCoords?.lat ?? null,
          longitude: reportCoords?.lng ?? null,
          photos: uploadedPointers,
          description: trimmedDescription,
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

  return {
    step,
    photos,
    uploadingPhoto,
    uploadProgress,
    vehicle,
    damageArea,
    zipCode,
    address,
    description,
    incident,
    showSaveIndicator,
    isSubmitting,
    submitError,
    photoUploadWarning,
    stepAdvanceCount,
    fileInputRef,
    cameraInputRef,
    setVehicle,
    setDamageArea,
    setZipCode,
    setAddress,
    setDescription,
    setIncident,
    setStep,
    setReportCoords,
    handlePhotoUpload,
    openFilePicker,
    openCamera,
    removePhoto,
    nextStep,
    prevStep,
    resetForm,
    handleVehicleContinue,
    handleDamageContinue,
    handleLocationContinue,
    handleSubmitReport,
  };
}
