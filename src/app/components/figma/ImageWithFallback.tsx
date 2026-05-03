import { useMemo, useState } from "react";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

// `storage://...` is a durable Supabase pointer (skill:
// supabase-storage-signed-urls). Browsers can't render it, so the wrapper
// short-circuits to the error placeholder instead of rendering a blank
// box. Mirrors the guard in src/app/components/codelayer/ImageWithFallback.tsx.
const isRenderableSrc = (src: unknown): src is string => {
  if (typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("storage://")) return false;
  return true;
};

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, style, className, ...rest } = props;
  const initialSafeSrc = useMemo(() => isRenderableSrc(src), [src]);
  const [didError, setDidError] = useState(!initialSafeSrc);
  const [appearanceMode] = useAppearanceModeCtx();
  const isLight = appearanceMode === "light";

  const handleError = () => {
    setDidError(true);
  };

  return didError ? (
    <div
      className={`inline-block ${isLight ? "bg-gray-100" : "bg-white/[0.08]"} text-center align-middle ${className ?? ""}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={typeof src === "string" ? src : undefined}
        />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}
