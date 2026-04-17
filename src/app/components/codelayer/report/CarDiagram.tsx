import { useId } from "react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type CarDiagramProps = {
  className?: string;
  selectedArea?: string;
  appearanceMode?: DashboardAppearanceMode;
};

const SPOKE_ANGLES = [0, 60, 120, 180, 240, 300];

const BODY_PATH =
  "M58 150V124C60 112 69 103 84 99L122 92L150 66C166 50 186 43 213 43H286C314 43 334 53 349 69L366 85C371 88 379 92 388 97C398 102 404 112 404 125V150H58Z";
const WINDSHIELD_PATH = "M158 82L169 64C178 53 192 48 210 48H229V82H158Z";
const REAR_GLASS_PATH = "M236 48H283C304 48 321 55 334 71L347 82H236V48Z";
const ROOF_BAND_PATH =
  "M166 82L175 69C184 59 196 54 212 54H281C300 54 315 59 327 71L339 82H327L319 73C309 63 296 59 280 59H213C200 59 189 63 181 72L173 82H166Z";
const PASSENGER_ZONE_PATH = "M114 105L143 97H333L355 112L347 141H149L130 129L114 105Z";
const DRIVER_ZONE_PATH = "M126 95L153 88H321L342 101L336 131H160L142 120L126 95Z";
const FRONT_ZONE_PATH = "M58 123C60 111 70 103 84 99L116 93L132 121L121 150H58V123Z";
const REAR_ZONE_PATH = "M338 82L362 88C383 95 397 109 402 124V150H344L341 118L338 82Z";

const DARK_PALETTE = {
  highlight: "#59a7ff",
  highlightCore: "#8ec5ff",
  zoneFill: "#59a7ff",
  zoneStroke: "#59a7ff",
  zoneOpacityStart: 0.34,
  zoneOpacityMid: 0.14,
  zoneOpacityEnd: 0.08,
  bodyStart: "#132754",
  bodyMid: "#1b3166",
  bodyEnd: "#122248",
  bodySheen: "#9dc5ff",
  roofBandFill: "rgba(128, 165, 232, 0.08)",
  roofBandStroke: "rgba(162, 194, 246, 0.18)",
  glassStart: "#2c4a8a",
  glassEnd: "#162a53",
  aura: "rgba(64, 121, 219, 0.08)",
  groundShadow: "rgba(116, 160, 236, 0.06)",
  groundLine: "rgba(136, 174, 234, 0.10)",
  outline: "rgba(140, 177, 236, 0.56)",
  panelLine: "rgba(148, 180, 230, 0.12)",
  rockerLine: "rgba(148, 180, 230, 0.08)",
  windowStroke: "rgba(162, 194, 246, 0.42)",
  pillarStrong: "rgba(162, 194, 246, 0.38)",
  pillarSoft: "rgba(162, 194, 246, 0.22)",
  archLine: "rgba(148, 180, 230, 0.18)",
  headlightFill: "rgba(205, 231, 255, 0.16)",
  headlightStroke: "rgba(169, 199, 245, 0.40)",
  taillightFill: "rgba(255, 122, 122, 0.15)",
  taillightStroke: "rgba(227, 152, 152, 0.38)",
  mirrorFill: "rgba(27, 49, 102, 0.75)",
  mirrorStroke: "rgba(150, 185, 239, 0.32)",
  handle: "rgba(164, 196, 248, 0.20)",
  seamLine: "rgba(148, 180, 230, 0.14)",
  wheelOuterFill: "rgba(6, 14, 30, 0.72)",
  wheelOuterStroke: "rgba(124, 162, 226, 0.32)",
  wheelInnerFill: "rgba(16, 26, 48, 0.76)",
  wheelInnerStroke: "rgba(150, 185, 239, 0.18)",
  wheelHub: "rgba(168, 202, 255, 0.45)",
  wheelSpoke: "rgba(148, 180, 230, 0.18)",
  indicatorStart: "#2c6fe5",
  indicatorEnd: "#7cc4ff",
  indicatorStroke: "rgba(171, 216, 255, 0.55)",
  indicatorDot: "rgba(239, 248, 255, 0.95)",
};

const LIGHT_PALETTE = {
  highlight: "#2563eb",
  highlightCore: "#93c5fd",
  zoneFill: "#183f7c",
  zoneStroke: "#2563eb",
  zoneOpacityStart: 0.54,
  zoneOpacityMid: 0.28,
  zoneOpacityEnd: 0.14,
  bodyStart: "#35548e",
  bodyMid: "#2d4b82",
  bodyEnd: "#233a67",
  bodySheen: "#d7e8ff",
  roofBandFill: "rgba(226, 238, 255, 0.10)",
  roofBandStroke: "rgba(132, 167, 223, 0.28)",
  glassStart: "#6d94d4",
  glassEnd: "#294a7d",
  aura: "rgba(105, 151, 228, 0.12)",
  groundShadow: "rgba(148, 177, 219, 0.14)",
  groundLine: "rgba(148, 177, 219, 0.22)",
  outline: "rgba(112, 146, 204, 0.76)",
  panelLine: "rgba(112, 146, 204, 0.18)",
  rockerLine: "rgba(112, 146, 204, 0.14)",
  windowStroke: "rgba(215, 230, 255, 0.48)",
  pillarStrong: "rgba(215, 230, 255, 0.48)",
  pillarSoft: "rgba(215, 230, 255, 0.30)",
  archLine: "rgba(112, 146, 204, 0.24)",
  headlightFill: "rgba(240, 247, 255, 0.22)",
  headlightStroke: "rgba(148, 180, 230, 0.48)",
  taillightFill: "rgba(255, 140, 140, 0.18)",
  taillightStroke: "rgba(220, 124, 124, 0.42)",
  mirrorFill: "rgba(39, 65, 112, 0.82)",
  mirrorStroke: "rgba(192, 220, 255, 0.38)",
  handle: "rgba(226, 239, 255, 0.25)",
  seamLine: "rgba(124, 162, 226, 0.18)",
  wheelOuterFill: "rgba(32, 46, 76, 0.84)",
  wheelOuterStroke: "rgba(105, 138, 196, 0.38)",
  wheelInnerFill: "rgba(27, 40, 67, 0.90)",
  wheelInnerStroke: "rgba(196, 221, 255, 0.18)",
  wheelHub: "rgba(196, 221, 255, 0.54)",
  wheelSpoke: "rgba(193, 219, 255, 0.22)",
  indicatorStart: "#2d7be8",
  indicatorEnd: "#75c2ff",
  indicatorStroke: "rgba(152, 205, 255, 0.68)",
  indicatorDot: "rgba(255, 255, 255, 0.96)",
};

type DiagramPalette = typeof DARK_PALETTE;

function Wheel({ cx, palette }: { cx: number; palette: DiagramPalette }) {
  return (
    <g>
      <circle
        cx={cx}
        cy="154"
        r="31"
        fill={palette.wheelOuterFill}
        stroke={palette.wheelOuterStroke}
        strokeWidth="1.4"
      />
      <circle
        cx={cx}
        cy="154"
        r="20"
        fill={palette.wheelInnerFill}
        stroke={palette.wheelInnerStroke}
        strokeWidth="1"
      />
      <circle cx={cx} cy="154" r="4" fill={palette.wheelHub} />
      {SPOKE_ANGLES.map((deg) => (
        <line
          key={`${cx}-${deg}`}
          x1={cx}
          y1="154"
          x2={cx + 17 * Math.cos((deg * Math.PI) / 180)}
          y2={154 + 17 * Math.sin((deg * Math.PI) / 180)}
          stroke={palette.wheelSpoke}
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export default function CarDiagram({
  className = "",
  selectedArea,
  appearanceMode = "map-dark",
}: CarDiagramProps) {
  const uid = useId().replace(/:/g, "");
  const isLightAppearance = appearanceMode === "light";
  const palette = isLightAppearance ? LIGHT_PALETTE : DARK_PALETTE;

  const ids = {
    bodyClip: `${uid}-body-clip`,
    bodyGradient: `${uid}-body-gradient`,
    bodySheen: `${uid}-body-sheen`,
    glassGradient: `${uid}-glass-gradient`,
    zoneGradient: `${uid}-zone-gradient`,
    scanGradient: `${uid}-scan-gradient`,
    indicatorGradient: `${uid}-indicator-gradient`,
    zoneGlow: `${uid}-zone-glow`,
    indicatorGlow: `${uid}-indicator-glow`,
  };

  const renderZone = () => {
    const commonProps = {
      fill: `url(#${ids.zoneGradient})`,
      stroke: palette.zoneStroke,
      strokeWidth: 1.5,
      strokeLinejoin: "round" as const,
    };

    const animatedZone = (path: string, extraProps?: Record<string, string | number>) => (
      <g filter={`url(#${ids.zoneGlow})`}>
        <path d={path} {...commonProps} {...extraProps}>
          <animate
            attributeName="opacity"
            values="0.74;1;0.74"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    );

    switch (selectedArea) {
      case "front":
        return animatedZone(FRONT_ZONE_PATH, { opacity: 0.98, strokeWidth: 1.7 });
      case "rear":
        return animatedZone(REAR_ZONE_PATH, { opacity: 0.98, strokeWidth: 1.7 });
      case "roof":
        return animatedZone(ROOF_BAND_PATH, {
          opacity: 1,
          strokeWidth: 1.8,
        });
      case "driver":
        return animatedZone(PASSENGER_ZONE_PATH, {
          opacity: 0.96,
          strokeWidth: 1.7,
        });
      case "passenger":
        return animatedZone(PASSENGER_ZONE_PATH, {
          opacity: 0.9,
          strokeWidth: 1.6,
          strokeDasharray: "7 5",
        });
      case "other":
        return animatedZone(BODY_PATH, { opacity: 0.84 });
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 440 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vehicle damage area diagram"
    >
      <defs>
        <linearGradient
          id={ids.bodyGradient}
          x1="74"
          y1="46"
          x2="364"
          y2="170"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={palette.bodyStart} stopOpacity="0.96" />
          <stop offset="0.45" stopColor={palette.bodyMid} stopOpacity="0.92" />
          <stop offset="1" stopColor={palette.bodyEnd} stopOpacity="0.96" />
        </linearGradient>

        <linearGradient
          id={ids.bodySheen}
          x1="118"
          y1="58"
          x2="334"
          y2="138"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stopColor={palette.bodySheen}
            stopOpacity={isLightAppearance ? "0.18" : "0.14"}
          />
          <stop offset="0.45" stopColor={palette.bodySheen} stopOpacity="0.03" />
          <stop offset="1" stopColor={palette.bodySheen} stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id={ids.glassGradient}
          x1="156"
          y1="48"
          x2="333"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stopColor={palette.glassStart}
            stopOpacity={isLightAppearance ? "0.42" : "0.34"}
          />
          <stop
            offset="1"
            stopColor={palette.glassEnd}
            stopOpacity={isLightAppearance ? "0.18" : "0.14"}
          />
        </linearGradient>

        <linearGradient
          id={ids.zoneGradient}
          x1="220"
          y1="42"
          x2="220"
          y2="152"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={palette.zoneFill} stopOpacity={palette.zoneOpacityStart} />
          <stop offset="0.7" stopColor={palette.zoneFill} stopOpacity={palette.zoneOpacityMid} />
          <stop offset="1" stopColor={palette.zoneFill} stopOpacity={palette.zoneOpacityEnd} />
        </linearGradient>

        <linearGradient id={ids.scanGradient} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.highlight} stopOpacity="0" />
          <stop offset="0.34" stopColor={palette.highlight} stopOpacity="0.18" />
          <stop offset="0.5" stopColor={palette.highlightCore} stopOpacity="0.92" />
          <stop offset="0.66" stopColor={palette.highlight} stopOpacity="0.18" />
          <stop offset="1" stopColor={palette.highlight} stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id={ids.indicatorGradient}
          x1="112"
          y1="28"
          x2="152"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={palette.indicatorStart} stopOpacity="0.78" />
          <stop offset="1" stopColor={palette.indicatorEnd} stopOpacity="0.94" />
        </linearGradient>

        <clipPath id={ids.bodyClip}>
          <path d={BODY_PATH} />
        </clipPath>

        <filter id={ids.zoneGlow} x="-20%" y="-25%" width="140%" height="150%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={ids.indicatorGlow} x="-50%" y="-120%" width="200%" height="320%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="228" cy="93" rx="182" ry="74" fill={palette.aura} />
      <ellipse cx="230" cy="186" rx="184" ry="7" fill={palette.groundShadow} />
      <line x1="44" y1="183" x2="412" y2="183" stroke={palette.groundLine} strokeWidth="0.7" />

      <g clipPath={`url(#${ids.bodyClip})`}>
        <path d={BODY_PATH} fill={`url(#${ids.bodyGradient})`} />
        <path d={BODY_PATH} fill={`url(#${ids.bodySheen})`} />
        {renderZone()}
        <rect
          x="-72"
          y="30"
          width="78"
          height="130"
          fill={`url(#${ids.scanGradient})`}
          opacity={isLightAppearance ? "0.9" : "0.95"}
        >
          <animate attributeName="x" values="-72;196;408;-72" dur="4.6s" repeatCount="indefinite" />
        </rect>
      </g>

      <path
        d={BODY_PATH}
        fill="none"
        stroke={palette.outline}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path d="M101 104H374" fill="none" stroke={palette.panelLine} strokeWidth="0.8" />
      <path d="M114 120H356" fill="none" stroke={palette.rockerLine} strokeWidth="0.8" />
      <path
        d="M128 108L150 129H339L355 112"
        fill="none"
        stroke={palette.panelLine}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M143 97L155 91H320L333 99"
        fill="none"
        stroke={palette.rockerLine}
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={ROOF_BAND_PATH}
        fill={palette.roofBandFill}
        stroke={palette.roofBandStroke}
        strokeWidth="0.9"
      />
      <path
        d={WINDSHIELD_PATH}
        fill={`url(#${ids.glassGradient})`}
        stroke={palette.windowStroke}
        strokeWidth="1"
      />
      <path
        d={REAR_GLASS_PATH}
        fill={`url(#${ids.glassGradient})`}
        stroke={palette.windowStroke}
        strokeWidth="1"
      />
      <line x1="231" y1="48" x2="231" y2="82" stroke={palette.pillarStrong} strokeWidth="1.2" />
      <line x1="245" y1="48" x2="245" y2="82" stroke={palette.pillarSoft} strokeWidth="0.8" />

      <path
        d="M96 150A30 30 0 0 1 156 150"
        fill="none"
        stroke={palette.archLine}
        strokeWidth="0.9"
      />
      <path
        d="M297 150A30 30 0 0 1 357 150"
        fill="none"
        stroke={palette.archLine}
        strokeWidth="0.9"
      />

      <path
        d="M66 102C61 105 58 112 58 120H72V102Z"
        fill={palette.headlightFill}
        stroke={palette.headlightStroke}
        strokeWidth="0.8"
      />
      <path
        d="M381 101C391 104 398 112 400 122H382Z"
        fill={palette.taillightFill}
        stroke={palette.taillightStroke}
        strokeWidth="0.8"
      />

      <ellipse
        cx="154"
        cy="83"
        rx="6"
        ry="4"
        fill={palette.mirrorFill}
        stroke={palette.mirrorStroke}
        strokeWidth="0.8"
      />

      <rect x="182" y="97" width="14" height="3" rx="1.5" fill={palette.handle} />
      <rect x="286" y="97" width="14" height="3" rx="1.5" fill={palette.handle} />
      <line x1="140" y1="97" x2="140" y2="138" stroke={palette.seamLine} strokeWidth="0.9" />
      <line x1="336" y1="97" x2="336" y2="140" stroke={palette.seamLine} strokeWidth="0.9" />

      <Wheel cx={126} palette={palette} />
      <Wheel cx={327} palette={palette} />

      <g filter={`url(#${ids.indicatorGlow})`} opacity="0.96">
        <rect
          x="112"
          y="28"
          width="40"
          height="14"
          rx="7"
          fill={`url(#${ids.indicatorGradient})`}
          stroke={palette.indicatorStroke}
          strokeWidth="0.8"
        >
          <animate attributeName="x" values="112;326;112" dur="4.6s" repeatCount="indefinite" />
        </rect>
        <circle cx="124" cy="35" r="2.4" fill={palette.indicatorDot}>
          <animate attributeName="cx" values="124;338;124" dur="4.6s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}
