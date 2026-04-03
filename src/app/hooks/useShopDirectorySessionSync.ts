import { useEffect, useState } from "react";
import type { ShopSortOption, WebsiteIdentity } from "../services/auth/websiteIdentity";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import type {
  Coordinates,
  MapTheme,
  MapViewMode,
  MapViewportBounds,
  Place,
  RecentSearch,
  SavedPlace,
} from "../types/mapDomain";

/* ── OS dark mode preference listener ── */
export function useOsPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;
    const handler = () => setPrefersDark(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersDark;
}

/* ── Identity sync (re-apply stored session on identity change) ────── */
export type IdentitySyncSetters = {
  setSearchQuery: (v: string) => void;
  setFilterRating: (v: number) => void;
  setSortBy: (v: ShopSortOption) => void;
  setSelectedShopId: (v: number | null) => void;
  setConnectedInsurerIds: (v: number[]) => void;
  setSelectedOrigin: (v: Place | null) => void;
  setSavedPlaces: (v: SavedPlace[]) => void;
  setRecentSearches: (v: RecentSearch[]) => void;
  setCustomerSavedShopIds: (v: number[]) => void;
  setShopWatchlistIds: (v: number[]) => void;
  setInsurerShortlistIds: (v: number[]) => void;
  setMapViewMode: (v: MapViewMode) => void;
  setMapTheme: (v: MapTheme) => void;
  setSelectedRouteId: (v: string) => void;
  setMapCenter: (v: Coordinates | undefined) => void;
  setMapZoom: (v: number | undefined) => void;
  setMapViewportBounds: (v: MapViewportBounds | undefined) => void;
  setSessionIntelligenceOpen: (v: boolean) => void;
};

export function useIdentitySyncEffect(
  identity: WebsiteIdentity | null | undefined,
  s: IdentitySyncSetters
) {
  useEffect(() => {
    const memory = loadWebsiteSessionMemory(identity);
    s.setSearchQuery(memory.shopDirectory.searchQuery);
    s.setFilterRating(memory.shopDirectory.filterRating);
    s.setSortBy(memory.shopDirectory.sortBy);
    s.setSelectedShopId(
      memory.mapSession?.lastViewedShopId ?? memory.shopDirectory.lastViewedShopId
    );
    s.setConnectedInsurerIds(memory.insuranceConnection.connectedInsurerIds);
    s.setSelectedOrigin(memory.mapSession?.lastSearchOrigin || null);
    s.setSavedPlaces(memory.mapSession?.savedPlaces || []);
    s.setRecentSearches(memory.mapSession?.recentSearches || []);
    s.setCustomerSavedShopIds(memory.mapSession?.customerSavedShopIds || []);
    s.setShopWatchlistIds(memory.mapSession?.shopWatchlistIds || []);
    s.setInsurerShortlistIds(memory.mapSession?.insurerShortlistIds || []);
    s.setMapViewMode("hybrid");
    s.setMapTheme(memory.mapSession?.mapTheme || "light");
    s.setSelectedRouteId(memory.mapSession?.selectedRouteId || "fastest");
    s.setMapCenter(memory.mapSession?.lastMapCenter);
    s.setMapZoom(memory.mapSession?.lastMapZoom);
    s.setMapViewportBounds(memory.mapSession?.lastViewportBounds);
    s.setSessionIntelligenceOpen(memory.shopDirectory.sessionIntelligenceOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.websiteUserKey]);
}

/* ── Session persist (save state back to localStorage) ── */
export type SessionPersistState = {
  connectedInsurerIds: number[];
  mapCenter: Coordinates | undefined;
  mapZoom: number | undefined;
  mapViewportBounds: MapViewportBounds | undefined;
  filterRating: number;
  selectedOrigin: Place | null;
  searchQuery: string;
  selectedShopId: number | null;
  mapTheme: MapTheme;
  selectedRouteId: string;
  customerSavedShopIds: number[];
  insurerShortlistIds: number[];
  recentSearches: RecentSearch[];
  savedPlaces: SavedPlace[];
  shopWatchlistIds: number[];
  sessionIntelligenceOpen: boolean;
  sortBy: ShopSortOption;
  mapViewMode: MapViewMode;
};

export function useSessionPersistEffect(
  identity: WebsiteIdentity | null | undefined,
  userType: MarketUserType,
  st: SessionPersistState
) {
  useEffect(() => {
    updateWebsiteSessionMemory(
      identity,
      {
        insuranceConnection: {
          connectedInsurerIds: st.connectedInsurerIds,
        },
        mapSession: {
          lastMapCenter: st.mapCenter,
          lastMapZoom: st.mapZoom,
          lastViewportBounds: st.mapViewportBounds,
          lastSearchFilters: { minRating: st.filterRating },
          lastSearchOrigin: st.selectedOrigin || undefined,
          lastSearchQuery: st.searchQuery,
          lastViewedShopId: st.selectedShopId ?? undefined,
          mapTheme: st.mapTheme,
          selectedRouteId: st.selectedRouteId,
          customerSavedShopIds: st.customerSavedShopIds,
          insurerShortlistIds: st.insurerShortlistIds,
          recentSearches: st.recentSearches,
          savedPlaces: st.savedPlaces,
          shopWatchlistIds: st.shopWatchlistIds,
        },
        shopDirectory: {
          filterRating: st.filterRating,
          lastViewedShopId: st.selectedShopId,
          searchQuery: st.searchQuery,
          sessionIntelligenceOpen: st.sessionIntelligenceOpen,
          sortBy: st.sortBy,
        },
      },
      { accountType: userType }
    );
  }, [
    st.connectedInsurerIds,
    st.customerSavedShopIds,
    st.filterRating,
    identity,
    st.insurerShortlistIds,
    st.mapCenter,
    st.mapTheme,
    st.mapViewMode,
    st.mapZoom,
    st.recentSearches,
    st.savedPlaces,
    st.searchQuery,
    st.selectedOrigin,
    st.selectedRouteId,
    st.selectedShopId,
    st.sessionIntelligenceOpen,
    st.shopWatchlistIds,
    st.sortBy,
    userType,
  ]);
}
