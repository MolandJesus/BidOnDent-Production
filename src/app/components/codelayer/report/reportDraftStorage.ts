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
  zipCode?: string;
  address?: string;
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

function isValidTimestampString(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isValidDraft(value: unknown): value is ReportDraft {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const step = v.step;
  if (
    typeof step !== "number" ||
    !Number.isInteger(step) ||
    step < 0 ||
    step > 6 ||
    typeof v.damageArea !== "string" ||
    typeof v.description !== "string" ||
    typeof v.incident !== "string" ||
    !isValidTimestampString(v.savedAt) ||
    ("zipCode" in v && v.zipCode !== undefined && typeof v.zipCode !== "string") ||
    ("address" in v && v.address !== undefined && typeof v.address !== "string") ||
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
  zipCode?: string;
  address?: string;
  description: string;
  incident: string;
}): void {
  const { step, vehicle, damageArea, zipCode, address, description, incident } = params;

  if (step === 6) {
    clearReportDraft();
    return;
  }

  const draft: ReportDraft = {
    step,
    vehicle,
    damageArea,
    zipCode,
    address,
    description,
    incident,
    savedAt: new Date().toISOString(),
  };

  if (!isValidDraft(draft)) {
    clearReportDraft();
    return;
  }

  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    if (import.meta.env.DEV) console.log("💾 Draft auto-saved to local storage (text data only)");
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error saving draft to localStorage:", error);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (removeError) {
      if (import.meta.env.DEV) console.error("Failed to clear draft:", removeError);
    }
  }
}

export function clearReportDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    if (import.meta.env.DEV) console.log("🗑️ Cleared draft from local storage");
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error clearing draft:", error);
  }
}
