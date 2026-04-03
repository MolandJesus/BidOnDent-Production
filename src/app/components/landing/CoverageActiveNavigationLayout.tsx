/**
 * CoverageActiveNavigationLayout — Full-screen turn-by-turn navigation overlay
 * for the coverage map dialog. Extracted from CoverageMapDialog to enforce
 * file-size limits and responsibility boundaries.
 *
 * Owns: sheet state (turn list, voice controls, settings), share ETA feedback,
 * derived route metrics (remaining duration/distance, following step, route geometry).
 */
import { useEffect, useMemo, useState } from "react";
import { cn } from "../ui/utils";
import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import type { NavigationProvider } from "../../services/navigation/externalNavigation";
import { shareNavigationEta } from "../../services/navigation/shareEta";
import { haversineMiles } from "../../services/supabase/map";
import { X } from "lucide-react";
import ServiceCoverageMap from "../maps/MapLibreServiceCoverageMap";
import NavigationActionRail from "../maps/navigation/NavigationActionRail";
import NavigationActiveManeuverCard from "../maps/navigation/NavigationActiveManeuverCard";
import NavigationActiveSpeedPanel from "../maps/navigation/NavigationActiveSpeedPanel";
import NavigationSummarySheet from "../maps/navigation/NavigationSummarySheet";
import NavigationTurnListSheet from "../maps/navigation/NavigationTurnListSheet";
import NavigationSettingsSheet from "../maps/navigation/NavigationSettingsSheet";
import NavigationVoiceControlsSheet from "../maps/navigation/NavigationVoiceControlsSheet";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";

type CoverageActiveNavigationLayoutProps = {
  tone: "light" | "dark";
  navigation: CoverageNavigationExperience;
  selectedShop: CoveragePartnerShop;
  selectedShopId?: string;
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
  radiusMeters: number;
  radiusMiles: string;
  regionCount: number;
  followCurrentPositionRevision: number;
  navigationTransition: boolean;
  arrivalTransition: boolean;
  preferredNavigationProvider: NavigationProvider;
  onPreferredNavigationProviderChange: (provider: NavigationProvider) => void;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop: (shop: CoveragePartnerShop) => void;
  onExportDirections: (shop: CoveragePartnerShop) => void;
  onExitNavigation: () => void;
  onRecenter: () => void;
};

export default function CoverageActiveNavigationLayout({
  tone,
  navigation,
  selectedShop,
  selectedShopId,
  center,
  zoom,
  revision,
  tileMode,
  counties,
  partnerShops,
  radiusMeters,
  radiusMiles,
  regionCount,
  followCurrentPositionRevision,
  navigationTransition,
  arrivalTransition,
  preferredNavigationProvider,
  onPreferredNavigationProviderChange,
  onTileModeChange,
  onCenterActive,
  onResetView,
  onSelectShop,
  onExportDirections,
  onExitNavigation,
  onRecenter,
}: CoverageActiveNavigationLayoutProps) {
  /* ── Local sheet state (resets on unmount) ───────── */
  const [turnListOpen, setTurnListOpen] = useState(false);
  const [voiceControlsOpen, setVoiceControlsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  /* ── Derived navigation geometry & metrics ──────── */
  const routeGeometry =
    navigation.routePreview?.geometry.map(({ lat, lng }) => [lat, lng] as [number, number]) ||
    undefined;
  const currentPosition = navigation.currentPosition
    ? ([navigation.currentPosition.lat, navigation.currentPosition.lng] as [number, number])
    : null;
  const destinationPosition: [number, number] = [selectedShop.lat, selectedShop.lng];
  const followingStep = navigation.hasArrived
    ? null
    : navigation.routePreview?.steps[navigation.currentStepIndex + 1] || null;

  const remainingDurationSeconds = useMemo(() => {
    if (!navigation.routePreview || navigation.hasArrived) return 0;
    const remaining = navigation.routePreview.steps
      .slice(navigation.currentStepIndex)
      .reduce((total, step) => total + step.durationSeconds, 0);
    return remaining || navigation.routePreview.durationSeconds;
  }, [navigation.currentStepIndex, navigation.hasArrived, navigation.routePreview]);

  const remainingDistanceMeters = useMemo(() => {
    if (!navigation.routePreview || navigation.hasArrived) return 0;
    const remaining = navigation.routePreview.steps
      .slice(navigation.currentStepIndex)
      .reduce((total, step) => total + step.distanceMeters, 0);
    return remaining || navigation.routePreview.distanceMeters;
  }, [navigation.currentStepIndex, navigation.hasArrived, navigation.routePreview]);

  /* ── Side effects ───────────────────────────────── */
  useEffect(() => {
    if (!shareFeedback) return;
    const id = window.setTimeout(() => setShareFeedback(""), 2200);
    return () => window.clearTimeout(id);
  }, [shareFeedback]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onExitNavigation();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onExitNavigation]);

  /* ── Handlers ───────────────────────────────────── */
  async function handleShareEta() {
    if (!navigation.routePreview) return;
    try {
      const result = await shareNavigationEta({
        destinationName: selectedShop.name,
        arrivalLabel: new Date(Date.now() + remainingDurationSeconds * 1000).toLocaleTimeString(
          [],
          { hour: "numeric", minute: "2-digit" }
        ),
        durationMinutes: remainingDurationSeconds / 60,
        distanceMiles: remainingDistanceMeters / 1609.34,
      });
      setShareFeedback(
        result === "shared"
          ? "ETA shared."
          : result === "copied"
            ? "ETA copied to clipboard."
            : "Share is not available on this device."
      );
    } catch (error) {
      if (import.meta.env.DEV) console.error("Unable to share ETA:", error);
      setShareFeedback("ETA share failed.");
    }
  }

  if (!navigation.routePreview) return null;

  return (
    <div className="p-3 md:p-3 lg:p-4">
      <div className="relative">
        {/* Transition overlay — brief "entering navigation" feedback */}
        {navigationTransition ? (
          <div className="pointer-events-none absolute inset-0 z-[580] flex items-center justify-center rounded-[2rem]">
            <div className="animate-pulse rounded-full border border-white/20 bg-slate-950/60 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-2xl">
              Starting navigation...
            </div>
          </div>
        ) : null}

        {/* Arrival overlay — celebrates reaching the destination */}
        {arrivalTransition ? (
          <div className="pointer-events-none absolute inset-0 z-[580] flex flex-col items-center justify-center gap-3 rounded-[2rem]">
            <div
              className={cn(
                "rounded-[1.35rem] border px-6 py-4 text-center backdrop-blur-3xl",
                tone === "light"
                  ? "border-emerald-200/80 bg-emerald-50/92 text-emerald-900 shadow-[0_28px_68px_rgba(5,150,105,0.22)]"
                  : "border-emerald-400/25 bg-emerald-500/15 text-emerald-50 shadow-[0_28px_68px_rgba(2,6,23,0.38)]"
              )}
            >
              <div className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                You've arrived
              </div>
              <div
                className={cn(
                  "mt-1.5 text-sm",
                  tone === "light" ? "text-emerald-700" : "text-emerald-200/80"
                )}
              >
                {selectedShop?.name}
              </div>
            </div>
          </div>
        ) : null}

        {/* Exit navigation — always-reachable back button */}
        <button
          type="button"
          onClick={onExitNavigation}
          className={cn(
            "absolute left-3 top-[6.5rem] z-[570] inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-105 active:scale-95 sm:left-4 sm:top-[7rem] sm:h-11 sm:w-11",
            tone === "light"
              ? "border-white/80 bg-white/90 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.16)]"
              : "border-white/15 bg-slate-950/85 text-white shadow-[0_8px_24px_rgba(2,6,23,0.38)]"
          )}
          aria-label="Exit navigation"
        >
          <X className="h-5 w-5" strokeWidth={2.4} />
        </button>

        {/* Rerouting indicator — visible during active route refresh */}
        {navigation.isLoadingRoute && !navigationTransition ? (
          <div
            className={cn(
              "absolute left-1/2 top-[4rem] z-[575] -translate-x-1/2 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-2xl transition-all sm:top-[4.5rem]",
              tone === "light"
                ? "border-blue-200/80 bg-blue-50/90 text-blue-800"
                : "border-blue-400/25 bg-blue-500/15 text-blue-200"
            )}
          >
            <span className="inline-block h-2 w-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Rerouting...
          </div>
        ) : null}

        {/* GPS status banner — visible when signal is not yet active */}
        {navigation.gpsStatus !== "active" ? (
          <div
            className={cn(
              "absolute left-1/2 top-[5.5rem] z-[575] -translate-x-1/2 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-2xl transition-all sm:top-[6rem]",
              navigation.gpsStatus === "denied"
                ? tone === "light"
                  ? "border-rose-200/80 bg-rose-50/90 text-rose-800"
                  : "border-rose-400/25 bg-rose-500/15 text-rose-200"
                : navigation.gpsStatus === "acquiring"
                  ? tone === "light"
                    ? "border-sky-200/80 bg-sky-50/90 text-sky-800"
                    : "border-sky-400/25 bg-sky-500/15 text-sky-200"
                  : tone === "light"
                    ? "border-amber-200/80 bg-amber-50/90 text-amber-800"
                    : "border-amber-400/25 bg-amber-500/15 text-amber-200"
            )}
          >
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full animate-pulse",
                navigation.gpsStatus === "denied"
                  ? "bg-rose-500 animate-none"
                  : navigation.gpsStatus === "acquiring"
                    ? "bg-sky-400"
                    : "bg-amber-400"
              )}
            />
            {navigation.gpsStatus === "acquiring"
              ? "Acquiring GPS position"
              : navigation.gpsStatus === "stale"
                ? "GPS signal weak — reconnecting"
                : navigation.gpsStatus === "denied"
                  ? "Location access denied"
                  : navigation.gpsStatus === "lost"
                    ? "GPS signal lost"
                    : "Searching for GPS"}
            {navigation.gpsStatus !== "denied" && navigation.gpsStatus !== "acquiring" ? (
              <button
                type="button"
                onClick={navigation.retryGps}
                className={cn(
                  "ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all active:scale-95",
                  tone === "light"
                    ? "bg-amber-600/15 text-amber-700 hover:bg-amber-600/25"
                    : "bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                )}
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        <ServiceCoverageMap
          center={currentPosition || center}
          zoom={currentPosition ? Math.max(zoom, 15.5) : zoom}
          revision={revision}
          tileMode={tileMode}
          counties={counties}
          partnerShops={partnerShops}
          activeSearchTarget={navigation.activeOriginTarget}
          radiusMeters={radiusMeters}
          radiusMiles={radiusMiles}
          regionCount={regionCount}
          mapHeightClassName="h-[100dvh] lg:h-[84vh] min-h-[400px] lg:min-h-[660px]"
          immersiveFullscreen
          presentationMode="navigation"
          showSurfaceChrome={false}
          showNavigationHud={false}
          followCurrentPosition
          followCurrentPositionRevision={followCurrentPositionRevision}
          guidanceMode
          currentHeadingDegrees={navigation.currentHeadingDegrees}
          hasArrived={navigation.hasArrived}
          destination={destinationPosition}
          selectedShopId={selectedShopId}
          routeGeometry={routeGeometry}
          routeFitKey={navigation.routePreview.fetchedAt}
          currentPosition={currentPosition}
          gpsAccuracyMeters={navigation.gpsAccuracyMeters}
          currentSpeedMph={navigation.currentSpeedMph}
          postedSpeedLimitMph={navigation.speedLimitSnapshot?.speedLimitMph ?? null}
          postedSpeedLimitConfidence={navigation.speedLimitSnapshot?.confidence ?? null}
          speedLimitMatchDistanceMeters={navigation.speedLimitSnapshot?.matchDistanceMeters ?? null}
          nearestRoadName={navigation.speedLimitSnapshot?.roadName ?? null}
          nextInstruction={navigation.nextStep?.instruction ?? null}
          voiceMode={navigation.settings.voiceMode}
          onTileModeChange={onTileModeChange}
          onCenterActive={onCenterActive}
          onResetView={onResetView}
          onSelectShop={(shopId) => {
            const shop = partnerShops.find((entry) => `${entry.id || entry.name}` === shopId);
            if (shop) {
              onSelectShop(shop);
            }
          }}
        />

        <NavigationActiveManeuverCard
          tone={tone}
          nextStep={navigation.nextStep}
          followingStep={followingStep}
          liveDistanceMeters={
            navigation.currentPosition && navigation.nextStep
              ? haversineMiles(navigation.currentPosition, navigation.nextStep.location) * 1609.34
              : null
          }
        />
        <NavigationActionRail
          tone={tone}
          turnListOpen={turnListOpen}
          voiceControlsOpen={voiceControlsOpen}
          settingsOpen={settingsOpen}
          onToggleTurnList={() => {
            setTurnListOpen((current) => !current);
            setVoiceControlsOpen(false);
            setSettingsOpen(false);
          }}
          onToggleVoiceControls={() => {
            setVoiceControlsOpen((current) => !current);
            setTurnListOpen(false);
            setSettingsOpen(false);
          }}
          onToggleSettings={() => {
            setSettingsOpen((current) => !current);
            setTurnListOpen(false);
            setVoiceControlsOpen(false);
          }}
          onRecenter={onRecenter}
        />
        <NavigationActiveSpeedPanel
          tone={tone}
          currentSpeedMph={navigation.currentSpeedMph}
          postedSpeedLimitMph={navigation.speedLimitSnapshot?.speedLimitMph ?? null}
          postedSpeedLimitConfidence={navigation.speedLimitSnapshot?.confidence ?? null}
          roadName={navigation.speedLimitSnapshot?.roadName ?? null}
          gpsAccuracyMeters={navigation.gpsAccuracyMeters}
          speedLimitMatchDistanceMeters={navigation.speedLimitSnapshot?.matchDistanceMeters ?? null}
        />
        <NavigationTurnListSheet
          tone={tone}
          open={turnListOpen}
          steps={navigation.routePreview.steps}
          currentStepIndex={navigation.currentStepIndex}
          onClose={() => setTurnListOpen(false)}
        />
        <NavigationVoiceControlsSheet
          tone={tone}
          open={voiceControlsOpen}
          voiceMode={navigation.settings.voiceMode}
          voiceVolumePreset={navigation.settings.voiceVolumePreset}
          preferredVoiceLabel={navigation.preferredVoiceLabel}
          voiceGuidanceSupported={navigation.voiceGuidanceSupported}
          onVoiceModeChange={navigation.setVoiceMode}
          onVoiceVolumePresetChange={navigation.setVoiceVolumePreset}
          onClose={() => setVoiceControlsOpen(false)}
        />
        <NavigationSettingsSheet
          tone={tone}
          open={settingsOpen}
          gpsTrackingEnabled={navigation.settings.gpsTrackingEnabled}
          speedLimitMonitorEnabled={navigation.settings.speedLimitMonitorEnabled}
          autoRerouteEnabled={navigation.settings.autoRerouteEnabled}
          onToggleGpsTracking={() =>
            navigation.setGpsTrackingEnabled(!navigation.settings.gpsTrackingEnabled)
          }
          onToggleSpeedLimitMonitor={() =>
            navigation.setSpeedLimitMonitorEnabled(!navigation.settings.speedLimitMonitorEnabled)
          }
          onToggleAutoReroute={() =>
            navigation.setAutoRerouteEnabled(!navigation.settings.autoRerouteEnabled)
          }
          onClose={() => setSettingsOpen(false)}
        />
        <NavigationSummarySheet
          tone={tone}
          selectedShop={selectedShop}
          remainingDurationSeconds={remainingDurationSeconds}
          remainingDistanceMeters={remainingDistanceMeters}
          shareFeedback={shareFeedback}
          preferredNavigationProvider={preferredNavigationProvider}
          onPreferredNavigationProviderChange={onPreferredNavigationProviderChange}
          onShareEta={() => {
            void handleShareEta();
          }}
          onOpenDirections={() => onExportDirections(selectedShop)}
          onEndRoute={onExitNavigation}
        />
      </div>
    </div>
  );
}
