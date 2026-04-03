import type { GpsStatus } from "../../hooks/useNavigationGpsTracking";

export function formatActiveDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatSpeedLimitDetail(
  currentSpeedMph: number | null | undefined,
  speedLimitMph: number | null | undefined
) {
  if (!Number.isFinite(speedLimitMph)) {
    return null;
  }

  const roundedLimit = Math.round(Number(speedLimitMph));

  if (!Number.isFinite(currentSpeedMph) || Number(currentSpeedMph) < 1) {
    return `Limit ${roundedLimit}`;
  }

  const roundedCurrentSpeed = Math.round(Number(currentSpeedMph));
  const overageMph = roundedCurrentSpeed - roundedLimit;

  if (overageMph > 0) {
    return `+${overageMph} over ${roundedLimit}`;
  }

  if (overageMph >= -2) {
    return `At limit ${roundedLimit}`;
  }

  return `${Math.abs(overageMph)} below ${roundedLimit}`;
}

export function getGpsRecoveryMessage(gpsStatus: GpsStatus, gpsError: string | undefined) {
  if (gpsError?.trim()) {
    return gpsError;
  }

  if (gpsStatus === "denied") {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return isIos
      ? "Location permission denied. Open Settings → Privacy → Location Services to allow access, then retry."
      : "Location permission denied. Check your browser or device location settings, then retry.";
  }

  if (gpsStatus === "lost") {
    return "GPS signal lost — turn-by-turn position may be outdated.";
  }

  return "GPS signal stale — no fresh location update in the last 10 seconds.";
}

export function formatEtaComparison(actualSeconds: number, estimatedMinutes: number) {
  const actualMinutes = Math.round(actualSeconds / 60);
  const diff = actualMinutes - estimatedMinutes;
  if (Math.abs(diff) <= 1) return "On time";
  if (diff > 0) return `${diff}m slower`;
  return `${Math.abs(diff)}m faster`;
}
