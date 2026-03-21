import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "../ui/utils";
import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import type { NavigationProvider } from "../../services/navigation/externalNavigation";
import { shareNavigationEta } from "../../services/navigation/shareEta";
import ServiceCoverageMap from "../maps/ServiceCoverageMap";
import NavigationActionRail from "../maps/navigation/NavigationActionRail";
import NavigationActiveManeuverCard from "../maps/navigation/NavigationActiveManeuverCard";
import NavigationActiveSpeedPanel from "../maps/navigation/NavigationActiveSpeedPanel";
import NavigationSummarySheet from "../maps/navigation/NavigationSummarySheet";
import NavigationTurnListSheet from "../maps/navigation/NavigationTurnListSheet";
import NavigationVoiceControlsSheet from "../maps/navigation/NavigationVoiceControlsSheet";
import { getMapSurfaceTheme, resolveMapSurfaceTone } from "../maps/mapSurfaceTheme";
import type { ExternalNavigationSession } from "../../types/navigation";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import type {
  CoverageCountyMarker,
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import CoverageBrowseExperience from "./CoverageBrowseExperience";

type CoverageMapDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
  mapSearchTarget: CoverageSearchTarget | null;
  listSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  radiusMeters: number;
  regionCount: number;
  isLoadingShops: boolean;
  selectedShopId?: string;
  initialDiscoveryRole?: NavigationDiscoveryRole;
  preferredNavigationProvider: NavigationProvider;
  selectedShop: CoveragePartnerShop | null;
  navigationSession: ExternalNavigationSession | null;
  navigation: CoverageNavigationExperience;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop: (shop: CoveragePartnerShop) => void;
  onPreferredNavigationProviderChange: (provider: NavigationProvider) => void;
  onOpenDirections: (shop: CoveragePartnerShop) => void;
};

type CoverageMapDialogPresentationMode = "browse" | "navigating";

export default function CoverageMapDialog({
  open,
  onOpenChange,
  center,
  zoom,
  revision,
  tileMode,
  counties,
  partnerShops,
  mapSearchTarget,
  listSearchTarget,
  nearbyShops,
  radiusMiles,
  radiusMeters,
  regionCount,
  isLoadingShops,
  selectedShopId,
  initialDiscoveryRole,
  preferredNavigationProvider,
  selectedShop,
  navigationSession,
  navigation,
  onTileModeChange,
  onCenterActive,
  onResetView,
  onSelectShop,
  onPreferredNavigationProviderChange,
  onOpenDirections,
}: CoverageMapDialogProps) {
  const tone = resolveMapSurfaceTone(tileMode);
  const theme = getMapSurfaceTheme(tone, true);
  const [presentationMode, setPresentationMode] =
    useState<CoverageMapDialogPresentationMode>("browse");
  const [turnListOpen, setTurnListOpen] = useState(false);
  const [voiceControlsOpen, setVoiceControlsOpen] = useState(false);
  const [followCurrentPositionRevision, setFollowCurrentPositionRevision] = useState(0);
  const [shareFeedback, setShareFeedback] = useState("");
  const routeGeometry =
    navigation.routePreview?.geometry.map(({ lat, lng }) => [lat, lng] as [number, number]) ||
    undefined;
  const currentPosition = navigation.currentPosition
    ? ([navigation.currentPosition.lat, navigation.currentPosition.lng] as [number, number])
    : null;
  const isNavigationActive =
    presentationMode === "navigating" && Boolean(selectedShop && navigation.routePreview);
  const followingStep = navigation.routePreview?.steps[navigation.currentStepIndex + 1] || null;
  const remainingDurationSeconds = useMemo(() => {
    if (!navigation.routePreview) {
      return 0;
    }

    const remaining = navigation.routePreview.steps
      .slice(navigation.currentStepIndex)
      .reduce((total, step) => total + step.durationSeconds, 0);

    return remaining || navigation.routePreview.durationSeconds;
  }, [navigation.currentStepIndex, navigation.routePreview]);
  const remainingDistanceMeters = useMemo(() => {
    if (!navigation.routePreview) {
      return 0;
    }

    const remaining = navigation.routePreview.steps
      .slice(navigation.currentStepIndex)
      .reduce((total, step) => total + step.distanceMeters, 0);

    return remaining || navigation.routePreview.distanceMeters;
  }, [navigation.currentStepIndex, navigation.routePreview]);

  useEffect(() => {
    if (!open) {
      setPresentationMode("browse");
      setTurnListOpen(false);
      setVoiceControlsOpen(false);
      setShareFeedback("");
    }
  }, [open]);

  useEffect(() => {
    if (presentationMode === "navigating" && (!selectedShop || !navigation.routePreview)) {
      setPresentationMode("browse");
      setTurnListOpen(false);
      setVoiceControlsOpen(false);
    }
  }, [navigation.routePreview, presentationMode, selectedShop]);

  useEffect(() => {
    if (!shareFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShareFeedback(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [shareFeedback]);

  function handleStartNavigation() {
    if (!selectedShop || !navigation.routePreview) {
      return;
    }

    setPresentationMode("navigating");
    setTurnListOpen(false);
    setVoiceControlsOpen(false);
    setFollowCurrentPositionRevision((current) => current + 1);
  }

  async function handleShareEta() {
    if (!selectedShop || !navigation.routePreview) {
      return;
    }

    try {
      const result = await shareNavigationEta({
        destinationName: selectedShop.name,
        arrivalLabel: new Date(Date.now() + remainingDurationSeconds * 1000).toLocaleTimeString(
          [],
          {
            hour: "numeric",
            minute: "2-digit",
          }
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
      console.error("Unable to share ETA:", error);
      setShareFeedback("ETA share failed.");
    }
  }

  function handleRecenterNavigation() {
    setFollowCurrentPositionRevision((current) => current + 1);
  }

  function renderActiveNavigationLayout() {
    if (!selectedShop || !navigation.routePreview) {
      return null;
    }

    return (
      <div className="p-3 sm:p-4">
        <div className="relative">
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
            mapHeightClassName="h-[82vh] min-h-[680px]"
            immersiveFullscreen
            presentationMode="navigation"
            showSurfaceChrome={false}
            showNavigationHud={false}
            followCurrentPosition
            followCurrentPositionRevision={followCurrentPositionRevision}
            selectedShopId={selectedShopId}
            routeGeometry={routeGeometry}
            routeFitKey={navigation.routePreview.fetchedAt}
            currentPosition={currentPosition}
            gpsAccuracyMeters={navigation.gpsAccuracyMeters}
            currentSpeedMph={navigation.currentSpeedMph}
            postedSpeedLimitMph={navigation.speedLimitSnapshot?.speedLimitMph ?? null}
            postedSpeedLimitConfidence={navigation.speedLimitSnapshot?.confidence ?? null}
            speedLimitMatchDistanceMeters={
              navigation.speedLimitSnapshot?.matchDistanceMeters ?? null
            }
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
          />
          <NavigationActionRail
            tone={tone}
            turnListOpen={turnListOpen}
            voiceControlsOpen={voiceControlsOpen}
            onToggleTurnList={() => {
              setTurnListOpen((current) => !current);
              setVoiceControlsOpen(false);
            }}
            onToggleVoiceControls={() => {
              setVoiceControlsOpen((current) => !current);
              setTurnListOpen(false);
            }}
            onRecenter={handleRecenterNavigation}
          />
          <NavigationActiveSpeedPanel
            tone={tone}
            currentSpeedMph={navigation.currentSpeedMph}
            postedSpeedLimitMph={navigation.speedLimitSnapshot?.speedLimitMph ?? null}
            postedSpeedLimitConfidence={navigation.speedLimitSnapshot?.confidence ?? null}
            roadName={navigation.speedLimitSnapshot?.roadName ?? null}
            gpsAccuracyMeters={navigation.gpsAccuracyMeters}
            speedLimitMatchDistanceMeters={
              navigation.speedLimitSnapshot?.matchDistanceMeters ?? null
            }
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
          <NavigationSummarySheet
            tone={tone}
            selectedShop={selectedShop}
            remainingDurationSeconds={remainingDurationSeconds}
            remainingDistanceMeters={remainingDistanceMeters}
            shareFeedback={shareFeedback}
            onShareEta={() => {
              void handleShareEta();
            }}
            onOpenDirections={() => onOpenDirections(selectedShop)}
            onEndRoute={() => {
              setPresentationMode("browse");
              setTurnListOpen(false);
              setVoiceControlsOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[min(1380px,calc(100vw-2rem))] overflow-hidden p-0 sm:max-w-[min(1380px,calc(100vw-2rem))]",
          theme.shellClassName,
          tone === "light"
            ? "text-slate-950 [&>button]:text-slate-500"
            : "text-white [&>button]:text-white"
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Coverage command center</DialogTitle>
          <DialogDescription>
            Inspect live partner coverage and launch real directions from the fullscreen map.
          </DialogDescription>
        </DialogHeader>

        {isNavigationActive ? (
          renderActiveNavigationLayout()
        ) : (
          <CoverageBrowseExperience
            tone={tone}
            center={center}
            zoom={zoom}
            revision={revision}
            tileMode={tileMode}
            counties={counties}
            partnerShops={partnerShops}
            mapSearchTarget={mapSearchTarget}
            listSearchTarget={listSearchTarget}
            nearbyShops={nearbyShops}
            radiusMiles={radiusMiles}
            radiusMeters={radiusMeters}
            regionCount={regionCount}
            isLoadingShops={isLoadingShops}
            selectedShopId={selectedShopId}
            initialDiscoveryRole={initialDiscoveryRole}
            preferredNavigationProvider={preferredNavigationProvider}
            selectedShop={selectedShop}
            navigationSession={navigationSession}
            navigation={navigation}
            onTileModeChange={onTileModeChange}
            onCenterActive={onCenterActive}
            onResetView={onResetView}
            onSelectShop={onSelectShop}
            onPreferredNavigationProviderChange={onPreferredNavigationProviderChange}
            onOpenDirections={onOpenDirections}
            onStartNavigation={handleStartNavigation}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
