type ShareNavigationEtaArgs = {
  destinationName: string;
  arrivalLabel?: string | null;
  durationMinutes?: number | null;
  distanceMiles?: number | null;
};

export type ShareNavigationEtaResult = "shared" | "copied" | "unsupported";

function buildEtaMessage({
  destinationName,
  arrivalLabel,
  durationMinutes,
  distanceMiles,
}: ShareNavigationEtaArgs) {
  const parts = [`Driving to ${destinationName}.`];

  if (arrivalLabel) {
    parts.push(`ETA ${arrivalLabel}.`);
  }

  if (Number.isFinite(durationMinutes)) {
    parts.push(`${Math.max(1, Math.round(Number(durationMinutes)))} min remaining.`);
  }

  if (Number.isFinite(distanceMiles)) {
    const miles = Number(distanceMiles);
    parts.push(`${miles >= 10 ? miles.toFixed(0) : miles.toFixed(1)} mi left.`);
  }

  return parts.join(" ");
}

export async function shareNavigationEta(
  args: ShareNavigationEtaArgs
): Promise<ShareNavigationEtaResult> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "unsupported";
  }

  const message = buildEtaMessage(args);

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: `ETA to ${args.destinationName}`,
        text: message,
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "unsupported";
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(message);
    return "copied";
  }

  return "unsupported";
}
