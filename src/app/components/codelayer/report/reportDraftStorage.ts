type VehicleDraft = {
  make: string;
  model: string;
  year: string;
  vin: string;
};

type ReportDraft = {
  step: number;
  vehicle: VehicleDraft;
  damageArea: string;
  description: string;
  incident: string;
  savedAt: string;
};

export const DRAFT_STORAGE_KEY = "bidondent_damage_report_draft";

export const DEFAULT_VEHICLE_DRAFT: VehicleDraft = {
  make: "",
  model: "",
  year: "",
  vin: "",
};

export function loadReportDraft(): ReportDraft | null {
  try {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) {
      return null;
    }

    return JSON.parse(savedDraft) as ReportDraft;
  } catch (error) {
    console.error("Error loading draft from localStorage:", error);
    return null;
  }
}

export function saveReportDraft(params: {
  step: number;
  vehicle: VehicleDraft;
  damageArea: string;
  description: string;
  incident: string;
}): void {
  const { step, vehicle, damageArea, description, incident } = params;

  if (step === 5) {
    return;
  }

  const draft: ReportDraft = {
    step,
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
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (removeError) {
      console.error("Failed to clear draft:", removeError);
    }
  }
}

export function clearReportDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    console.log("🗑️ Cleared draft from local storage");
  } catch (error) {
    console.error("Error clearing draft:", error);
  }
}
