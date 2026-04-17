import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "../ui/utils";
import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import type { NavigationProvider } from "../../services/navigation/externalNavigation";
import { X } from "lucide-react";
import { getMapSurfaceTheme, resolveMapSurfaceTone } from "../maps/mapSurfaceTheme";
import { primeVoiceEngine } from "../../services/navigation/voiceSupport";
import type { ExternalNavigationSession } from "../../types/navigation";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import { useNotifications } from "../../features/notifications";
import type {
  CoverageCountyMarker,
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import CoverageActiveNavigationLayout from "./CoverageActiveNavigationLayout";
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
  coverageFetchError?: string | null;
  usingDemoFallback?: boolean;
  selectedShopId?: string;
  initialDiscoveryRole?: NavigationDiscoveryRole;
  preferredNavigationProvider: NavigationProvider;
  selectedShop: CoveragePartnerShop | null;
  navigationSession: ExternalNavigationSession | null;
  navigation: CoverageNavigationExperience;
  onTileModeChange: (mode: MapTileMode) => void;
  onSearchSubmit?: () => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop: (shop: CoveragePartnerShop) => void;
  onPreferredNavigationProviderChange: (provider: NavigationProvider) => void;
  onOpenBidOnDentNavigation: (shop: CoveragePartnerShop) => void;
  onExportDirections: (shop: CoveragePartnerShop) => void;
  onVoiceGuidanceEnabledChange?: (enabled: boolean) => void;
  startNavigationRequestId?: number;
  onRetryPartnerShops?: () => void;
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
  coverageFetchError,
  usingDemoFallback = false,
  selectedShopId,
  initialDiscoveryRole,
  preferredNavigationProvider,
  selectedShop,
  navigationSession,
  navigation,
  onTileModeChange,
  onSearchSubmit,
  onCenterActive,
  onResetView,
  onSelectShop,
  onPreferredNavigationProviderChange,
  onOpenBidOnDentNavigation,
  onExportDirections,
  onVoiceGuidanceEnabledChange,
  startNavigationRequestId = 0,
  onRetryPartnerShops,
}: CoverageMapDialogProps) {
  const tone = resolveMapSurfaceTone(tileMode);
  const theme = getMapSurfaceTheme(tone, true);
  const notifications = useNotifications();
  const [presentationMode, setPresentationMode] =
    useState<CoverageMapDialogPresentationMode>("browse");
  const [followCurrentPositionRevision, setFollowCurrentPositionRevision] = useState(0);
  const [navigationTransition, setNavigationTransition] = useState(false);
  const [arrivalTransition, setArrivalTransition] = useState(false);
  const [lastHandledStartRequestId, setLastHandledStartRequestId] = useState(0);
  const lastArrivalToastKeyRef = useRef<string | null>(null);
  const isNavigationActive =
    presentationMode === "navigating" && Boolean(selectedShop && navigation.routePreview);

  useEffect(() => {
    if (!open) {
      setPresentationMode("browse");
      setArrivalTransition(false);
    }
  }, [open]);

  useEffect(() => {
    if (startNavigationRequestId <= lastHandledStartRequestId) {
      return;
    }

    if (!open || !selectedShop || !navigation.routePreview) {
      return;
    }

    setPresentationMode("navigating");
    setFollowCurrentPositionRevision((current) => current + 1);
    setLastHandledStartRequestId(startNavigationRequestId);
  }, [
    lastHandledStartRequestId,
    navigation.routePreview,
    open,
    selectedShop,
    startNavigationRequestId,
  ]);

  useEffect(() => {
    if (presentationMode === "navigating" && (!selectedShop || !navigation.routePreview)) {
      setPresentationMode("browse");
    }
  }, [navigation.routePreview, presentationMode, selectedShop]);

  useEffect(() => {
    onVoiceGuidanceEnabledChange?.(isNavigationActive && !navigation.hasArrived);
  }, [isNavigationActive, navigation.hasArrived, onVoiceGuidanceEnabledChange]);

  useEffect(() => {
    if (!isNavigationActive || !navigation.hasArrived || !selectedShop) {
      return;
    }

    const arrivalKey = `${selectedShop.id || selectedShop.name}:${navigation.routePreview?.fetchedAt || "route"}`;
    if (lastArrivalToastKeyRef.current === arrivalKey) {
      return;
    }

    notifications.showToast({
      message: `Arrived at ${selectedShop.name}.`,
      variant: "success",
      durationMs: 3200,
      deepLink: null,
    });
    lastArrivalToastKeyRef.current = arrivalKey;
  }, [
    isNavigationActive,
    navigation.hasArrived,
    navigation.routePreview?.fetchedAt,
    notifications,
    selectedShop,
  ]);

  useEffect(() => {
    if (!isNavigationActive || !navigation.hasArrived) {
      return;
    }

    setArrivalTransition(true);
    const id = window.setTimeout(() => {
      setArrivalTransition(false);
      setPresentationMode("browse");
    }, 2800);
    return () => window.clearTimeout(id);
  }, [isNavigationActive, navigation.hasArrived]);

  useEffect(() => {
    if (!navigationTransition) return;
    const id = window.setTimeout(() => setNavigationTransition(false), 2200);
    return () => window.clearTimeout(id);
  }, [navigationTransition]);

  function handleStartNavigation() {
    if (!selectedShop || !navigation.routePreview) {
      return;
    }

    if (navigation.settings.voiceMode !== "muted") {
      primeVoiceEngine();
    }

    if (!navigation.settings.gpsTrackingEnabled) {
      navigation.setGpsTrackingEnabled(true);
    }

    setNavigationTransition(true);
    setPresentationMode("navigating");
    setFollowCurrentPositionRevision((current) => current + 1);
  }

  function handleRecenterNavigation() {
    setFollowCurrentPositionRevision((current) => current + 1);
  }

  const handleExitNavigation = useCallback(() => {
    setPresentationMode("browse");
    setArrivalTransition(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "left-0 top-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 p-0 sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-full sm:max-w-[calc(100vw-2rem)] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border lg:max-w-[min(1360px,calc(100vw-2rem))] [&>button:last-child]:hidden",
          theme.shellClassName,
          tone === "light" ? "text-slate-950" : "text-white"
        )}
      >
        <DialogClose
          className={cn(
            "absolute right-3 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-[590] inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-105 active:scale-95 sm:right-4 sm:top-4 sm:h-11 sm:w-11",
            tone === "light"
              ? "border-white/80 bg-white/90 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
              : "border-white/15 bg-slate-950/85 text-white shadow-[0_8px_24px_rgba(2,6,23,0.38)]"
          )}
          aria-label="Close map"
        >
          <X className="h-5 w-5" strokeWidth={2.4} />
        </DialogClose>
        <DialogHeader className="sr-only">
          <DialogTitle>Coverage command center</DialogTitle>
          <DialogDescription>
            Inspect live partner coverage and launch real directions from the fullscreen map.
          </DialogDescription>
        </DialogHeader>

        {isNavigationActive && selectedShop ? (
          <CoverageActiveNavigationLayout
            tone={tone}
            navigation={navigation}
            selectedShop={selectedShop}
            selectedShopId={selectedShopId}
            center={center}
            zoom={zoom}
            revision={revision}
            tileMode={tileMode}
            counties={counties}
            partnerShops={partnerShops}
            radiusMeters={radiusMeters}
            radiusMiles={radiusMiles}
            regionCount={regionCount}
            followCurrentPositionRevision={followCurrentPositionRevision}
            navigationTransition={navigationTransition}
            arrivalTransition={arrivalTransition}
            preferredNavigationProvider={preferredNavigationProvider}
            onPreferredNavigationProviderChange={onPreferredNavigationProviderChange}
            onTileModeChange={onTileModeChange}
            onCenterActive={onCenterActive}
            onResetView={onResetView}
            onSelectShop={onSelectShop}
            onExportDirections={onExportDirections}
            onExitNavigation={handleExitNavigation}
            onRecenter={handleRecenterNavigation}
          />
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
            coverageFetchError={coverageFetchError}
            usingDemoFallback={usingDemoFallback}
            selectedShopId={selectedShopId}
            initialDiscoveryRole={initialDiscoveryRole}
            selectedShop={selectedShop}
            navigationSession={navigationSession}
            navigation={navigation}
            onTileModeChange={onTileModeChange}
            onSearchSubmit={onSearchSubmit}
            onCenterActive={onCenterActive}
            onResetView={onResetView}
            onSelectShop={onSelectShop}
            onOpenBidOnDentNavigation={onOpenBidOnDentNavigation}
            onExportDirections={onExportDirections}
            onStartNavigation={handleStartNavigation}
            onRetryPartnerShops={onRetryPartnerShops}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
