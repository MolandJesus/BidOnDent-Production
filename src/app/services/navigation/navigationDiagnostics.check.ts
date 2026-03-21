import { runMapPerformanceDiagnosticsChecks } from "./mapPerformanceDiagnostics.check";
import { runNavigationPlannerPresentationChecks } from "./navigationPlannerPresentation.check";
import { runNavigationDiagnosticsSignalChecks } from "./navigationDiagnosticsSignal.check";
import { runProviderHealthDiagnosticsChecks } from "./providerHealthDiagnostics.check";

export function runNavigationDiagnosticsChecks() {
  return {
    mapPerformance: runMapPerformanceDiagnosticsChecks(),
    providerHealth: runProviderHealthDiagnosticsChecks(),
    combinedSignal: runNavigationDiagnosticsSignalChecks(),
    plannerPresentation: runNavigationPlannerPresentationChecks(),
  };
}
