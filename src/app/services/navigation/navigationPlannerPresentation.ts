export type ConfidenceTrendTone = "neutral" | "critical" | "warning" | "positive";

export type ConfidenceTrendState = {
  label: string;
  tone: ConfidenceTrendTone;
};

export function getConfidenceTrendState(delta: number | null): ConfidenceTrendState {
  if (delta === null) {
    return {
      label: "Trend --",
      tone: "neutral",
    };
  }

  if (delta <= -10) {
    return {
      label: `Significant drop ${delta}`,
      tone: "critical",
    };
  }

  if (delta >= 10) {
    return {
      label: `Strong gain +${delta}`,
      tone: "positive",
    };
  }

  if (delta >= 2) {
    return {
      label: `Trend up +${delta}`,
      tone: "positive",
    };
  }

  if (delta <= -2) {
    return {
      label: `Trend down ${delta}`,
      tone: "warning",
    };
  }

  return {
    label: "Trend flat",
    tone: "neutral",
  };
}

export function formatRouteAlternativeDeltaLabel(comparedToFastestSeconds: number): string {
  if (!Number.isFinite(comparedToFastestSeconds)) {
    return "Delta --";
  }

  const roundedMinutes = Math.max(1, Math.round(Math.abs(comparedToFastestSeconds) / 60));

  if (Math.abs(comparedToFastestSeconds) < 45) {
    return "Similar ETA";
  }

  if (comparedToFastestSeconds > 0) {
    return `+${roundedMinutes} min vs fastest`;
  }

  return `${roundedMinutes} min faster than first`;
}
