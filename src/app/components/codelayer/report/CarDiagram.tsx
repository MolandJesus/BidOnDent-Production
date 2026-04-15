type CarDiagramProps = {
  className?: string;
  selectedArea?: string;
};

export default function CarDiagram({ className = "", selectedArea }: CarDiagramProps) {
  const hl = "#3b82f6";
  const scanId = "car-scan";

  return (
    <svg
      viewBox="0 0 440 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vehicle damage area diagram"
    >
      <defs>
        {/* Animated scan‑line gradient */}
        <linearGradient id={`${scanId}-grad`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={hl} stopOpacity="0" />
          <stop offset="0.4" stopColor={hl} stopOpacity="0.6" />
          <stop offset="0.5" stopColor={hl} stopOpacity="0.9" />
          <stop offset="0.6" stopColor={hl} stopOpacity="0.6" />
          <stop offset="1" stopColor={hl} stopOpacity="0" />
        </linearGradient>

        {/* Clip to car body so the scan stays inside */}
        <clipPath id={`${scanId}-clip`}>
          <path d="M52 148 L52 118 C54 108 62 98 74 94 L108 86 L134 68 C146 54 165 44 192 40 L284 40 C306 40 320 48 330 58 L352 80 C356 82 365 86 372 90 C386 96 396 108 396 124 L396 148 Z" />
        </clipPath>

        {/* Soft glow for selected zone */}
        <filter id={`${scanId}-glow`}>
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Highlight zone gradient */}
        <linearGradient id={`${scanId}-zone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hl} stopOpacity="0.25" />
          <stop offset="1" stopColor={hl} stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* ── Car body — modern sedan side profile ── */}
      <path
        d="M52 148 L52 118 C54 108 62 98 74 94 L108 86 L134 68 C146 54 165 44 192 40 L284 40 C306 40 320 48 330 58 L352 80 C356 82 365 86 372 90 C386 96 396 108 396 124 L396 148 Z"
        fill="rgba(30,58,110,0.12)"
        stroke="rgba(148,180,230,0.50)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Lower body trim line */}
      <path
        d="M74 94 L108 86 Q120 108 130 120 L340 120 Q350 108 352 80"
        fill="none"
        stroke="rgba(148,180,230,0.18)"
        strokeWidth="0.8"
      />

      {/* ── Windshield ── */}
      <path
        d="M196 44 L162 44 C155 44 148 50 142 60 L130 78 L196 78 Z"
        fill="rgba(56,100,180,0.08)"
        stroke="rgba(148,180,230,0.35)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ── Rear window ── */}
      <path
        d="M204 44 L282 44 C296 44 306 50 316 60 L328 78 L204 78 Z"
        fill="rgba(56,100,180,0.08)"
        stroke="rgba(148,180,230,0.35)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* B‑pillar */}
      <line x1="200" y1="44" x2="200" y2="78" stroke="rgba(148,180,230,0.35)" strokeWidth="1.2" />

      {/* ── Side character line ── */}
      <path d="M88 100 L370 100" fill="none" stroke="rgba(148,180,230,0.12)" strokeWidth="0.7" />

      {/* Door handle hints */}
      <rect x="170" y="94" width="14" height="3" rx="1.5" fill="rgba(148,180,230,0.22)" />
      <rect x="262" y="94" width="14" height="3" rx="1.5" fill="rgba(148,180,230,0.22)" />

      {/* ── Headlight ── */}
      <path
        d="M372 90 C380 92 388 98 390 106 L372 106 Z"
        fill="rgba(200,225,255,0.18)"
        stroke="rgba(148,180,230,0.4)"
        strokeWidth="0.8"
      />

      {/* ── Taillight ── */}
      <path
        d="M62 98 C56 100 54 108 54 114 L68 114 L68 98 Z"
        fill="rgba(255,100,100,0.15)"
        stroke="rgba(220,140,140,0.35)"
        strokeWidth="0.8"
      />

      {/* ── Front wheel ── */}
      <circle
        cx="326"
        cy="152"
        r="30"
        fill="rgba(8,16,32,0.6)"
        stroke="rgba(148,180,230,0.35)"
        strokeWidth="1.4"
      />
      <circle
        cx="326"
        cy="152"
        r="20"
        fill="rgba(20,30,50,0.5)"
        stroke="rgba(148,180,230,0.22)"
        strokeWidth="0.8"
      />
      <circle cx="326" cy="152" r="4" fill="rgba(148,180,230,0.3)" />
      {/* Spokes */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <line
          key={deg}
          x1="326"
          y1="152"
          x2={326 + 17 * Math.cos((deg * Math.PI) / 180)}
          y2={152 + 17 * Math.sin((deg * Math.PI) / 180)}
          stroke="rgba(148,180,230,0.18)"
          strokeWidth="0.7"
        />
      ))}

      {/* ── Rear wheel ── */}
      <circle
        cx="118"
        cy="152"
        r="30"
        fill="rgba(8,16,32,0.6)"
        stroke="rgba(148,180,230,0.35)"
        strokeWidth="1.4"
      />
      <circle
        cx="118"
        cy="152"
        r="20"
        fill="rgba(20,30,50,0.5)"
        stroke="rgba(148,180,230,0.22)"
        strokeWidth="0.8"
      />
      <circle cx="118" cy="152" r="4" fill="rgba(148,180,230,0.3)" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <line
          key={deg}
          x1="118"
          y1="152"
          x2={118 + 17 * Math.cos((deg * Math.PI) / 180)}
          y2={152 + 17 * Math.sin((deg * Math.PI) / 180)}
          stroke="rgba(148,180,230,0.18)"
          strokeWidth="0.7"
        />
      ))}

      {/* ── Side mirror ── */}
      <ellipse
        cx="134"
        cy="78"
        rx="6"
        ry="4"
        fill="rgba(30,58,110,0.25)"
        stroke="rgba(148,180,230,0.3)"
        strokeWidth="0.8"
      />

      {/* ── Ground shadow ── */}
      <ellipse cx="222" cy="186" rx="180" ry="6" fill="rgba(148,180,230,0.06)" />
      <line x1="40" y1="183" x2="410" y2="183" stroke="rgba(148,180,230,0.12)" strokeWidth="0.6" />

      {/* ══════════ ZONE HIGHLIGHTS ══════════ */}

      {/* Front */}
      {selectedArea === "front" && (
        <g filter={`url(#${scanId}-glow)`}>
          <rect
            x="350"
            y="50"
            width="54"
            height="105"
            rx="10"
            fill={`url(#${scanId}-zone)`}
            stroke={hl}
            strokeWidth="1.4"
          />
        </g>
      )}

      {/* Rear */}
      {selectedArea === "rear" && (
        <g filter={`url(#${scanId}-glow)`}>
          <rect
            x="42"
            y="58"
            width="54"
            height="96"
            rx="10"
            fill={`url(#${scanId}-zone)`}
            stroke={hl}
            strokeWidth="1.4"
          />
        </g>
      )}

      {/* Roof */}
      {selectedArea === "roof" && (
        <g filter={`url(#${scanId}-glow)`}>
          <rect
            x="140"
            y="34"
            width="200"
            height="48"
            rx="8"
            fill={`url(#${scanId}-zone)`}
            stroke={hl}
            strokeWidth="1.4"
          />
        </g>
      )}

      {/* Driver side (lower panels) */}
      {selectedArea === "driver" && (
        <g filter={`url(#${scanId}-glow)`}>
          <rect
            x="100"
            y="82"
            width="260"
            height="68"
            rx="8"
            fill={`url(#${scanId}-zone)`}
            stroke={hl}
            strokeWidth="1.4"
          />
        </g>
      )}

      {/* Passenger side — dashed to hint "other side" */}
      {selectedArea === "passenger" && (
        <g filter={`url(#${scanId}-glow)`}>
          <rect
            x="100"
            y="82"
            width="260"
            height="68"
            rx="8"
            fill={`url(#${scanId}-zone)`}
            stroke={hl}
            strokeWidth="1.4"
            strokeDasharray="8 4"
          />
        </g>
      )}

      {/* Other — full car subtle pulse */}
      {selectedArea === "other" && (
        <path
          d="M52 148 L52 118 C54 108 62 98 74 94 L108 86 L134 68 C146 54 165 44 192 40 L284 40 C306 40 320 48 330 58 L352 80 C356 82 365 86 372 90 C386 96 396 108 396 124 L396 148 Z"
          fill={`url(#${scanId}-zone)`}
          stroke={hl}
          strokeWidth="1.4"
          strokeLinejoin="round"
        >
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </path>
      )}

      {/* ══════════ SCAN ANIMATION ══════════ */}
      <g clipPath={`url(#${scanId}-clip)`}>
        <rect y="20" width="60" height="170" fill={`url(#${scanId}-grad)`}>
          <animate attributeName="x" from="-60" to="440" dur="3s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}
