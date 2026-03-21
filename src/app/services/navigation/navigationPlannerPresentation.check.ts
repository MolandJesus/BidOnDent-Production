import {
  formatRouteAlternativeDeltaLabel,
  getConfidenceTrendState,
} from "./navigationPlannerPresentation";

export function runNavigationPlannerPresentationChecks() {
  const baselineTrend = getConfidenceTrendState(null);
  console.assert(
    baselineTrend.label === "Trend --" && baselineTrend.tone === "neutral",
    "Null delta should return baseline neutral trend"
  );

  const significantDropTrend = getConfidenceTrendState(-10);
  console.assert(
    significantDropTrend.label === "Significant drop -10" &&
      significantDropTrend.tone === "critical",
    "-10 delta should trigger significant drop threshold"
  );

  const strongGainTrend = getConfidenceTrendState(10);
  console.assert(
    strongGainTrend.label === "Strong gain +10" && strongGainTrend.tone === "positive",
    "+10 delta should trigger strong gain threshold"
  );

  const smallPositiveTrend = getConfidenceTrendState(1);
  console.assert(
    smallPositiveTrend.label === "Trend flat" && smallPositiveTrend.tone === "neutral",
    "Sub-threshold positive deltas should remain flat"
  );

  const watchDropTrend = getConfidenceTrendState(-2);
  console.assert(
    watchDropTrend.label === "Trend down -2" && watchDropTrend.tone === "warning",
    "-2 delta should trigger warning trend"
  );

  const similarEtaLabel = formatRouteAlternativeDeltaLabel(30);
  console.assert(
    similarEtaLabel === "Similar ETA",
    "Under-45-second deltas should report similar ETA"
  );

  const slowerAlternativeLabel = formatRouteAlternativeDeltaLabel(125);
  console.assert(
    slowerAlternativeLabel === "+2 min vs fastest",
    "Positive delta should report slower route label"
  );

  const fasterAlternativeLabel = formatRouteAlternativeDeltaLabel(-125);
  console.assert(
    fasterAlternativeLabel === "2 min faster than first",
    "Negative delta should report faster route label"
  );

  return {
    baselineTrend,
    significantDropTrend,
    strongGainTrend,
    smallPositiveTrend,
    watchDropTrend,
    similarEtaLabel,
    slowerAlternativeLabel,
    fasterAlternativeLabel,
  };
}
