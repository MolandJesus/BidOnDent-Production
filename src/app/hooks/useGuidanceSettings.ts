import { useCallback, useState } from "react";
import {
  loadNavigationGuidanceSettings,
  saveNavigationGuidanceSettings,
} from "../services/navigation/navigationPreferences";
import { primeVoiceEngine } from "../services/navigation/voiceSupport";

export function useGuidanceSettings() {
  const [guidanceSettings, setGuidanceSettings] = useState(() => loadNavigationGuidanceSettings());

  const updateSetting = useCallback(
    <K extends keyof typeof guidanceSettings>(key: K, value: (typeof guidanceSettings)[K]) => {
      setGuidanceSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveNavigationGuidanceSettings(next);
        return next;
      });
    },
    []
  );

  const handleVoiceModeChange = useCallback(
    (voiceMode: typeof guidanceSettings.voiceMode) => {
      if (voiceMode !== "muted") {
        primeVoiceEngine();
      }
      updateSetting("voiceMode", voiceMode);
    },
    [updateSetting]
  );

  const handleVoiceVolumePresetChange = useCallback(
    (voiceVolumePreset: typeof guidanceSettings.voiceVolumePreset) => {
      updateSetting("voiceVolumePreset", voiceVolumePreset);
    },
    [updateSetting]
  );

  const handleToggleGpsTracking = useCallback(() => {
    setGuidanceSettings((prev) => {
      const next = { ...prev, gpsTrackingEnabled: !prev.gpsTrackingEnabled };
      saveNavigationGuidanceSettings(next);
      return next;
    });
  }, []);

  const handleToggleSpeedLimitMonitor = useCallback(() => {
    setGuidanceSettings((prev) => {
      const next = { ...prev, speedLimitMonitorEnabled: !prev.speedLimitMonitorEnabled };
      saveNavigationGuidanceSettings(next);
      return next;
    });
  }, []);

  const handleToggleAutoReroute = useCallback(() => {
    setGuidanceSettings((prev) => {
      const next = { ...prev, autoRerouteEnabled: !prev.autoRerouteEnabled };
      saveNavigationGuidanceSettings(next);
      return next;
    });
  }, []);

  return {
    guidanceSettings,
    handleVoiceModeChange,
    handleVoiceVolumePresetChange,
    handleToggleGpsTracking,
    handleToggleSpeedLimitMonitor,
    handleToggleAutoReroute,
  };
}
