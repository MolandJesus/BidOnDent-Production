import { useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  fallbackClassName?: string;
};

const isRenderableSrc = (src: unknown): src is string => {
  if (typeof src !== "string") return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("storage://")) return false;
  return true;
};

export default function ImageWithFallback(props: ImageWithFallbackProps) {
  const { src, alt, style, className, fallbackClassName, ...rest } = props;
  const initialSafeSrc = useMemo(() => isRenderableSrc(src), [src]);
  const [didError, setDidError] = useState(!initialSafeSrc);

  if (didError) {
    return (
      <div
        className={`relative inline-flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(59,130,246,0.06)_0%,rgba(15,23,42,0.04)_100%)] dark:bg-[linear-gradient(135deg,rgba(59,130,246,0.10)_0%,rgba(2,6,23,0.30)_100%)] ${
          fallbackClassName ?? className ?? ""
        }`}
        style={{
          ...style,
          boxShadow:
            "inset 0 1px 0 rgba(220,165,90,0.14), inset 0 0 0 1px rgba(96,165,250,0.10), inset 0 -1px 0 rgba(2,6,23,0.06)",
        }}
        data-original-url={typeof src === "string" ? src : undefined}
        aria-label={alt}
      >
        <ImageIcon className="h-7 w-7 text-blue-400/55 dark:text-blue-300/45" strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}
