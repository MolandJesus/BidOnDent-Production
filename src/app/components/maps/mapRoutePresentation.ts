export function formatDistanceMiles(distanceMiles?: number | null) {
  if (!Number.isFinite(distanceMiles)) {
    return null;
  }

  const roundedDistance = Number(distanceMiles);
  return roundedDistance >= 10 ? `${roundedDistance.toFixed(0)} mi` : `${roundedDistance.toFixed(1)} mi`;
}

export function formatApproximateDriveWindow(distanceMiles?: number | null) {
  if (!Number.isFinite(distanceMiles)) {
    return null;
  }

  const roundedDistance = Number(distanceMiles);
  const lowerMinutes = Math.max(6, Math.round(roundedDistance * 2.4));
  const upperMinutes = Math.max(lowerMinutes + 3, Math.round(roundedDistance * 3.3));

  return `${lowerMinutes}-${upperMinutes} min`;
}

export function formatTurnDistance(distanceMeters?: number | null) {
  if (!Number.isFinite(distanceMeters)) {
    return null;
  }

  const safeDistanceMeters = Math.max(0, Number(distanceMeters));
  const distanceFeet = safeDistanceMeters * 3.28084;

  if (distanceFeet < 1000) {
    return `${Math.max(50, Math.round(distanceFeet / 50) * 50)} ft`;
  }

  const distanceMiles = safeDistanceMeters / 1609.34;
  return distanceMiles >= 10 ? `${distanceMiles.toFixed(0)} mi` : `${distanceMiles.toFixed(1)} mi`;
}

export function formatDurationMinutes(durationSeconds?: number | null) {
  if (!Number.isFinite(durationSeconds)) {
    return null;
  }

  return `${Math.max(1, Math.round(Number(durationSeconds) / 60))} min`;
}

export function formatArrivalTimeFromNow(durationSeconds?: number | null) {
  if (!Number.isFinite(durationSeconds)) {
    return null;
  }

  const arrival = new Date(Date.now() + Number(durationSeconds) * 1000);
  return arrival.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatLaunchTime(launchedAt?: string | null) {
  if (!launchedAt) {
    return null;
  }

  const parsed = new Date(launchedAt);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
