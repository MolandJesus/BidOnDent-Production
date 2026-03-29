import { useCallback, useRef, useEffect, type FormEvent } from "react";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import { toggleRoleCollectionShopId } from "../services/intelligence/shopMapExperience";
import { openDirections } from "../services/navigation/externalNavigation";
import { loadNavigationSession } from "../services/navigation/navigationSession";
import type {
  Coordinates,
  MapTheme,
  MapViewportBounds,
  Place,
  RecentSearch,
  SavedPlace,
} from "../types/mapDomain";
import { buildRecentSearches, buildSavedPlace, slugify } from "./shopDirectorySessionUtils";

type RoleCollectionKey = "customerSavedShopIds" | "shopWatchlistIds" | "insurerShortlistIds";

interface UseShopDirectoryHandlersArgs {
  // State
  searchQuery: string;
  selectedOrigin: Place | null;
  mapListingsLength: number;
  roleCollectionKey: RoleCollectionKey;

  // Setters
  setSelectedShopId: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedOrigin: React.Dispatch<React.SetStateAction<Place | null>>;
  setSavedPlaces: React.Dispatch<React.SetStateAction<SavedPlace[]>>;
  setRecentSearches: React.Dispatch<React.SetStateAction<RecentSearch[]>>;
  setCustomerSavedShopIds: React.Dispatch<React.SetStateAction<number[]>>;
  setShopWatchlistIds: React.Dispatch<React.SetStateAction<number[]>>;
  setInsurerShortlistIds: React.Dispatch<React.SetStateAction<number[]>>;
  setMapTheme: React.Dispatch<React.SetStateAction<MapTheme>>;
  setMapCenter: React.Dispatch<React.SetStateAction<Coordinates | undefined>>;
  setSearchWithinViewport: React.Dispatch<React.SetStateAction<boolean>>;

  // External
  geolocation: {
    coords: Coordinates | null;
    requestLocation: () => void;
  };
}

export function useShopDirectoryHandlers({
  searchQuery,
  selectedOrigin,
  mapListingsLength,
  roleCollectionKey,
  setSelectedShopId,
  setSelectedOrigin,
  setSavedPlaces,
  setRecentSearches,
  setCustomerSavedShopIds,
  setShopWatchlistIds,
  setInsurerShortlistIds,
  setMapTheme,
  setMapCenter,
  setSearchWithinViewport,
  geolocation,
}: UseShopDirectoryHandlersArgs) {
  const pendingMyLocationRef = useRef(false);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecentSearches((currentSearches) =>
      buildRecentSearches(currentSearches, searchQuery, selectedOrigin, mapListingsLength)
    );
  };

  const handleSelectOrigin = (origin: Place) => {
    setSelectedOrigin(origin);
    setSavedPlaces((currentPlaces) =>
      currentPlaces.map((place) =>
        place.id === `saved-place-${origin.placeId || slugify(origin.name)}`
          ? { ...place, lastUsedAt: new Date().toISOString() }
          : place
      )
    );
  };

  const handleSaveOrigin = () => {
    if (!selectedOrigin) return;

    const nextPlace = buildSavedPlace(selectedOrigin);
    setSavedPlaces((currentPlaces) => {
      const existingPlace = currentPlaces.find((place) => place.id === nextPlace.id);
      if (existingPlace) {
        return currentPlaces.map((place) =>
          place.id === nextPlace.id
            ? { ...place, lastUsedAt: new Date().toISOString(), isFavorite: true }
            : place
        );
      }
      return [nextPlace, ...currentPlaces].slice(0, 6);
    });
  };

  const handleToggleRoleCollection = (shopId: number) => {
    setSelectedShopId(shopId);

    if (roleCollectionKey === "shopWatchlistIds") {
      setShopWatchlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
      return;
    }

    if (roleCollectionKey === "insurerShortlistIds") {
      setInsurerShortlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
      return;
    }

    setCustomerSavedShopIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
  };

  const handleOpenShopDirections = (shop: ShopMapListing) => {
    const provider = loadNavigationSession()?.provider || "google";

    openDirections({
      provider,
      destination: {
        id: String(shop.id),
        name: shop.name,
        lat: shop.mapResult.coordinates.latitude,
        lng: shop.mapResult.coordinates.longitude,
        addressLine: `${shop.mapResult.address}, ${shop.mapResult.city}, ${shop.mapResult.state} ${shop.mapResult.zipCode}`,
      },
      origin: selectedOrigin
        ? {
            label: selectedOrigin.name,
            lat: selectedOrigin.latitude,
            lng: selectedOrigin.longitude,
            source: "address",
          }
        : undefined,
    });
  };

  const handleToggleTheme = () => {
    setMapTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const handleSearchInArea = () => {
    setSearchWithinViewport(true);
  };

  const handleClearAreaSearch = () => {
    setSearchWithinViewport(false);
  };

  const handleUseMyLocation = useCallback(() => {
    if (geolocation.coords) {
      const myPlace: Place = {
        name: "My Location",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        latitude: geolocation.coords.latitude,
        longitude: geolocation.coords.longitude,
        placeId: "user-geolocation",
      };
      setSelectedOrigin(myPlace);
      setMapCenter(geolocation.coords);
      pendingMyLocationRef.current = false;
      return;
    }
    pendingMyLocationRef.current = true;
    geolocation.requestLocation();
  }, [geolocation, setSelectedOrigin, setMapCenter]);

  // Resolve pending "My Location" request when coords arrive
  useEffect(() => {
    if (!pendingMyLocationRef.current || !geolocation.coords) return;
    pendingMyLocationRef.current = false;

    const myPlace: Place = {
      name: "My Location",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      latitude: geolocation.coords.latitude,
      longitude: geolocation.coords.longitude,
      placeId: "user-geolocation",
    };
    setSelectedOrigin(myPlace);
    setMapCenter(geolocation.coords);
  }, [geolocation.coords, setSelectedOrigin, setMapCenter]);

  return {
    handleSearchSubmit,
    handleSelectOrigin,
    handleSaveOrigin,
    handleToggleRoleCollection,
    handleOpenShopDirections,
    handleToggleTheme,
    handleSearchInArea,
    handleClearAreaSearch,
    handleUseMyLocation,
  };
}
