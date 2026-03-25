import { CircleMarker, Popup, Tooltip } from "react-leaflet";
import type { CoveragePartnerShop } from "./serviceCoverageMapTypes";

type MapPartnerShopMarkersProps = {
  partnerShops: CoveragePartnerShop[];
  selectedShopId?: string;
  isNavigationPresentation: boolean;
  onSelectShop?: (shopId: string) => void;
};

export default function MapPartnerShopMarkers({
  partnerShops,
  selectedShopId,
  isNavigationPresentation,
  onSelectShop,
}: MapPartnerShopMarkersProps) {
  return (
    <>
      {partnerShops
        .filter((shop) =>
          isNavigationPresentation ? `${shop.id || shop.name}` === selectedShopId : true
        )
        .map((shop) => {
          const shopKey = `${shop.id || shop.name}`;
          const isSelected = selectedShopId === shopKey;

          return (
            <CircleMarker
              key={shopKey}
              center={[shop.lat, shop.lng]}
              radius={isNavigationPresentation ? 18 : isSelected ? 16 : 14}
              eventHandlers={
                onSelectShop
                  ? {
                      click: () => onSelectShop(shopKey),
                    }
                  : undefined
              }
              pathOptions={{
                color: isNavigationPresentation ? "#fef3c7" : isSelected ? "#dbeafe" : "#0f172a",
                fillColor: isNavigationPresentation
                  ? "#fbbf24"
                  : isSelected
                    ? "#38bdf8"
                    : "#1d4ed8",
                fillOpacity: isSelected ? 1 : 0.9,
                weight: isNavigationPresentation ? 5 : isSelected ? 3 : 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{shop.name}</div>
                  {shop.dataMode === "demo" ? <div>Demo map entry</div> : null}
                  <div>{shop.countyLabel}</div>
                  <div>{shop.label}</div>
                  <div>Rating: {(shop.rating ?? 0).toFixed(1)}</div>
                  {shop.addressLine ? <div>{shop.addressLine}</div> : null}
                  {shop.specialties.length > 0 ? (
                    <div>Focus: {shop.specialties.slice(0, 3).join(" • ")}</div>
                  ) : null}
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -18]}>
                {shop.name}
              </Tooltip>
            </CircleMarker>
          );
        })}
    </>
  );
}
