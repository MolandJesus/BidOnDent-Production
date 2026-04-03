import { Popup } from "react-map-gl/maplibre";

type SavedPlacePopupData = {
  lat: number;
  lng: number;
  label: string;
  address?: string;
};

type RoutePopupData = {
  lat: number;
  lng: number;
  label: string;
  distance: string;
  duration: number;
  traffic?: string;
};

type MapPaneInfoPopupsProps = {
  isDark: boolean;
  savedPlacePopup: SavedPlacePopupData | null;
  onCloseSavedPlace: () => void;
  routePopup: RoutePopupData | null;
  onCloseRoute: () => void;
};

export default function MapPaneInfoPopups({
  isDark,
  savedPlacePopup,
  onCloseSavedPlace,
  routePopup,
  onCloseRoute,
}: MapPaneInfoPopupsProps) {
  return (
    <>
      {savedPlacePopup && (
        <Popup
          longitude={savedPlacePopup.lng}
          latitude={savedPlacePopup.lat}
          anchor="bottom"
          offset={12}
          closeOnClick={false}
          onClose={onCloseSavedPlace}
        >
          <div className="min-w-[120px] space-y-0.5 p-1">
            <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {savedPlacePopup.label}
            </p>
            {savedPlacePopup.address && (
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {savedPlacePopup.address}
              </p>
            )}
          </div>
        </Popup>
      )}

      {routePopup && (
        <Popup
          longitude={routePopup.lng}
          latitude={routePopup.lat}
          anchor="bottom"
          offset={16}
          closeOnClick={false}
          onClose={onCloseRoute}
        >
          <div className="min-w-[140px] space-y-0.5 p-1">
            <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {routePopup.label}
            </p>
            <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {routePopup.distance}
              {routePopup.duration > 0 && ` · ${routePopup.duration} min`}
            </p>
            {routePopup.traffic && (
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {routePopup.traffic}
              </p>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}
