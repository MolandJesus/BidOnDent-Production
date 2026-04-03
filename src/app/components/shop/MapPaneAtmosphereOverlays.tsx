type MapPaneAtmosphereOverlaysProps = {
  isNight: boolean;
  isSatellite: boolean;
};

export default function MapPaneAtmosphereOverlays({
  isNight,
  isSatellite,
}: MapPaneAtmosphereOverlaysProps) {
  return (
    <>
      {/* Night mode: Blue tint overlay on map tiles */}
      {isNight && (
        <div
          className="pointer-events-none absolute inset-0 z-[245]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,26,56,0.48) 0%, rgba(13,34,68,0.36) 40%, rgba(9,24,50,0.44) 100%)",
          }}
          aria-hidden="true"
        />
      )}
      {/* Satellite mode: subtle dark overlay to deepen imagery */}
      {isSatellite && (
        <div
          className="pointer-events-none absolute inset-0 z-[245]"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,14,30,0.22) 0%, rgba(4,10,22,0.14) 50%, rgba(6,14,30,0.26) 100%)",
          }}
          aria-hidden="true"
        />
      )}
      {/* Night mode: Ambient radial glow overlay */}
      {isNight && (
        <div
          className="pointer-events-none absolute inset-0 z-[248]"
          style={{
            background: [
              "radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 30%)",
              "radial-gradient(circle at 78% 12%, rgba(37,99,235,0.12), transparent 24%)",
              "linear-gradient(180deg, rgba(30,58,138,0.12), rgba(2,6,23,0.22))",
            ].join(", "),
          }}
          aria-hidden="true"
        />
      )}
      {/* Satellite mode: subtle atmosphere glow */}
      {isSatellite && (
        <div
          className="pointer-events-none absolute inset-0 z-[248]"
          style={{
            background: [
              "radial-gradient(circle at top, rgba(59,130,246,0.08), transparent 35%)",
              "radial-gradient(circle at 80% 15%, rgba(37,99,235,0.05), transparent 25%)",
            ].join(", "),
          }}
          aria-hidden="true"
        />
      )}
      {/* Immersive ambient vignette */}
      <div
        className={`pointer-events-none absolute inset-0 z-[490] transition-opacity duration-500 ${
          isNight
            ? "bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.32)_100%)]"
            : isSatellite
              ? "bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(2,6,23,0.40)_100%)]"
              : "bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(15,23,42,0.14)_100%)]"
        }`}
        aria-hidden="true"
      />
    </>
  );
}
