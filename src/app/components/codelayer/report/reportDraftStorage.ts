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

function isValidDraft(value: unknown): value is ReportDraft {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.step !== "number" ||
    typeof v.damageArea !== "string" ||
    typeof v.description !== "string" ||
    typeof v.incident !== "string" ||
    typeof v.savedAt !== "string" ||
    typeof v.vehicle !== "object" ||
    v.vehicle === null
  )
    return false;
  const veh = v.vehicle as Record<string, unknown>;
  return (
    typeof veh.make === "string" &&
    typeof veh.model === "string" &&
    typeof veh.year === "string" &&
    typeof veh.vin === "string"
  );
}

export function loadReportDraft(): ReportDraft | null {
  try {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) return null;

    const parsed: unknown = JSON.parse(savedDraft);
    if (!isValidDraft(parsed)) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* noop */
    }
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
