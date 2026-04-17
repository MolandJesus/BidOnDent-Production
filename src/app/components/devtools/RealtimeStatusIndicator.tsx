/**
 * Real-time Connection Status Indicator
 * Shows live connection status for real-time features
 */

import { useEffect, useState } from "react";
import { WifiOff, Radio } from "lucide-react";

interface RealtimeStatusIndicatorProps {
  isConnected: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function RealtimeStatusIndicator({
  isConnected,
  showLabel = true,
  className = "",
}: RealtimeStatusIndicatorProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // Pulse effect when connection state changes
  useEffect(() => {
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 1000);
    return () => clearTimeout(timer);
  }, [isConnected]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Dot */}
      <div className="relative flex items-center justify-center">
        <div
          className={`w-2 h-2 rounded-full transition-colors ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {isPulsing && isConnected && (
          <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping" />
        )}
      </div>

      {/* Icon */}
      {isConnected ? (
        <Radio className="w-4 h-4 text-green-600 animate-pulse" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-600" />
      )}

      {/* Label */}
      {showLabel && (
        <span className={`text-sm font-medium ${isConnected ? "text-green-600" : "text-red-600"}`}>
          {isConnected ? "Live" : "Offline"}
        </span>
      )}
    </div>
  );
}
