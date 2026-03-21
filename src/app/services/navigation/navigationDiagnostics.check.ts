import { runMapPerformanceDiagnosticsChecks } from "./mapPerformanceDiagnostics.check";
import { runNavigationPlannerPresentationChecks } from "./navigationPlannerPresentation.check";
import { runNavigationDiagnosticsSignalChecks } from "./navigationDiagnosticsSignal.check";
import { runPlaceDiscoveryDiagnosticsChecks } from "./placeDiscoveryDiagnostics.check";
import { runProviderHealthDiagnosticsChecks } from "./providerHealthDiagnostics.check";

export function runNavigationDiagnosticsChecks() {
  return {
    mapPerformance: runMapPerformanceDiagnosticsChecks(),
    providerHealth: runProviderHealthDiagnosticsChecks(),
    combinedSignal: runNavigationDiagnosticsSignalChecks(),
    placeDiscovery: runPlaceDiscoveryDiagnosticsChecks(),
    plannerPresentation: runNavigationPlannerPresentationChecks(),
  };
}
