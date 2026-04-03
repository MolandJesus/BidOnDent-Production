import { Car } from "lucide-react";

type BrandLogoProps = {
  primaryColor: string;
  secondaryColor: string;
  tone?: "light" | "dark";
  size?: "header" | "footer";
  className?: string;
};

const sizeClasses = {
  header: {
    wrap: "gap-2",
    icon: "h-8 w-8 rounded-[0.95rem]",
    car: "h-4 w-4",
    wordmark: "text-[1.12rem] sm:text-[1.18rem]",
  },
  footer: {
    wrap: "gap-3",
    icon: "h-11 w-11 rounded-[1.15rem]",
    car: "h-5 w-5",
    wordmark: "text-[1.7rem] sm:text-[1.85rem]",
  },
} as const;

export default function BrandLogo({
  primaryColor,
  secondaryColor,
  tone = "dark",
  size = "header",
  className = "",
}: BrandLogoProps) {
  const config = sizeClasses[size];
  const isLight = tone === "light";

  const bidStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <span
      role="img"
      aria-label="BidOnDent"
      className={`inline-flex shrink-0 select-none items-center ${config.wrap} ${className}`.trim()}
    >
      <span
        className={`flex shrink-0 items-center justify-center ${config.icon}`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          boxShadow: isLight
            ? "0 6px 16px rgba(37, 99, 235, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.28)"
            : "0 8px 18px rgba(2, 8, 24, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
        }}
      >
        <Car className={config.car} color="#ffffff" strokeWidth={2.2} />
      </span>

      <span
        className={`inline-flex shrink-0 items-baseline font-black leading-none ${config.wordmark}`}
        style={{
          fontFamily: '"SF Pro Display", "Segoe UI", sans-serif',
          letterSpacing: "-0.055em",
        }}
      >
        <span style={bidStyle}>Bid</span>
        <span style={{ color: isLight ? "#2563eb" : "#60a5fa" }}>On</span>
        <span style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>Dent</span>
      </span>
    </span>
  );
}
