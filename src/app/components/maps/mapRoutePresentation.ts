export function formatDistanceMiles(distanceMiles?: number | null) {
  if (!Number.isFinite(distanceMiles)) {
    return null;
  }

  const roundedDistance = Number(distanceMiles);
  return roundedDistance >= 10
    ? `${roundedDistance.toFixed(0)} mi`
    : `${roundedDistance.toFixed(1)} mi`;
}

export function formatApproximateDriveWindow(distanceMiles?: number | null) {
  if (!Number.isFinite(distanceMiles)) {
    return null;
  }

  const roundedDistance = Number(distanceMiles);
  // KI-052 honesty fix: a route with effectively-zero distance (origin == destination
  // within ~0.05 mi / ~260 ft) has no meaningful drive window. The 6-min floor below
  // would otherwise fabricate "6–9 min" for a same-coordinate demo recommendation.
  // Caller fallbacks (e.g. PlannerRoutePreview L208 `||`) handle null safely.
  if (roundedDistance < 0.05) {
    return null;
  }

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

  // KI-052 honesty fix: prior `Math.max(50, ...)` floor returned "50 ft" for
  // genuine zero-distance turns (same-coordinate demo routes). Below 50 ft
  // (15.24 m) the user has effectively arrived; surface null and let callers
  // (NavigationSummarySheet `--` fallback at L48; NavigationActiveManeuverCard
  // null-check at L54) render the arrived state honestly.
  if (distanceFeet < 50) {
    return null;
  }

  if (distanceFeet < 1000) {
    return `${Math.round(distanceFeet / 50) * 50} ft`;
  }

  const distanceMiles = safeDistanceMeters / 1609.34;
  return distanceMiles >= 10 ? `${distanceMiles.toFixed(0)} mi` : `${distanceMiles.toFixed(1)} mi`;
}

export function formatDurationMinutes(durationSeconds?: number | null) {
  if (!Number.isFinite(durationSeconds)) {
    return null;
  }

  const safeDuration = Number(durationSeconds);
  // KI-052 honesty fix: prior `Math.max(1, ...)` floor returned "1 min" for
  // genuine zero-duration routes. Below 30 sec there's no honest minute count
  // to report; surface null and let caller fallbacks render arrived state.
  if (safeDuration < 30) {
    return null;
  }

  return `${Math.round(safeDuration / 60)} min`;
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
