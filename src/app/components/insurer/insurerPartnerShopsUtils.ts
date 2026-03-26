export type FilterStatus = "all" | "active" | "pending" | "inactive";

export type CustomProspect = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  specialties: string[];
  certifications: string[];
  status: "pending";
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildProspectPhone(seed: number) {
  return `(555) 010-${String(1300 + seed).slice(-4)}`;
}

export function buildPartnerStatus(
  isShortlisted: boolean,
  compatibilityScore: number
): FilterStatus {
  if (isShortlisted) {
    return "active";
  }

  if (compatibilityScore >= 72) {
    return "pending";
  }

  return "inactive";
}

export function getStatusColor(status: FilterStatus) {
  switch (status) {
    case "active":
      return "bg-green-400/10 text-green-300 border-green-400/30";
    case "pending":
      return "bg-amber-400/10 text-amber-300 border-amber-400/30";
    case "inactive":
      return "bg-white/[0.06] text-slate-300 border-white/[0.10]";
    default:
      return "bg-white/[0.06] text-slate-300 border-white/[0.10]";
  }
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function buildManualProspectCoordinate(prospect: CustomProspect) {
  const hashSeed = hashString(
    `${prospect.name}|${prospect.zip}|${prospect.city}|${prospect.state}`
  );
  const latitudeOffset = ((hashSeed % 1400) - 700) / 10000;
  const longitudeOffset = (((hashSeed >> 8) % 1400) - 700) / 10000;

  return {
    lat: 32.7767 + latitudeOffset,
    lng: -96.797 + longitudeOffset,
  };
}
