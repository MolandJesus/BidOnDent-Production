/**
 * PhotoGuide Component - Step Definitions & Constants
 * Configuration for all tutorial steps and styling
 */

export const photoGuideTips = {
  cameraBasics: [
    {
      icon: "🎯",
      title: "Hold Steady",
      desc: "Keep your phone still when taking photos",
    },
    {
      icon: "🔍",
      title: "Focus First",
      desc: "Tap the damaged area to focus before shooting",
    },
    {
      icon: "🌅",
      title: "Check Lighting",
      desc: "Make sure the area is well-lit and visible",
    },
  ],
  lightingDo: [
    {
      title: "Shoot in daylight",
      detail: "Natural light shows true colors",
    },
    {
      title: "Avoid shadows",
      detail: "Position yourself properly",
    },
    {
      title: "Use overcast days",
      detail: "Clouds = even lighting!",
    },
  ],
  lightingAvoid: [
    {
      title: "Camera flash",
      detail: "Creates glare and washes out details",
    },
    {
      title: "Dark garages",
      detail: "Poor lighting hides damage",
    },
    {
      title: "Direct harsh sun",
      detail: "Creates strong shadows",
    },
  ],
  angleShots: [
    {
      number: 1,
      title: "Wide Shot",
      desc: "Full side of car showing damage location",
      emoji: "🚗",
    },
    {
      number: 2,
      title: "Medium Shot",
      desc: "Damaged panel with surroundings",
      emoji: "📷",
    },
    {
      number: 3,
      title: "Close-Up",
      desc: "Details of dents, scratches, paint",
      emoji: "🔍",
    },
    {
      number: 4,
      title: "Different Angle",
      desc: "Another perspective of damage",
      emoji: "📐",
    },
  ],
  readyChecklist: [
    { text: "Clean dirt/debris from damaged area", emoji: "🧹" },
    { text: "Find good natural lighting", emoji: "☀️" },
    { text: "Have phone camera ready", emoji: "📱" },
    { text: "Plan to take 4+ different angles", emoji: "📸" },
    { text: "Make sure battery is charged", emoji: "🔋" },
  ],
};

export const photoGuideContent = {
  welcomeNeeds: [
    {
      item: "Your phone camera or device",
      icon: "📱",
    },
    {
      item: "Good natural lighting (daylight)",
      icon: "☀️",
    },
    {
      item: "3-5 minutes to capture photos",
      icon: "🚗",
    },
  ],
  welcomeTips: [
    "Clean visible dirt from damaged area",
    "Take photos outdoors if possible",
    "Capture multiple angles",
  ],
};
