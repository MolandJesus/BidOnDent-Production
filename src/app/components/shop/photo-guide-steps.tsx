import {
  Camera,
  Check,
  Lightbulb,
  Move,
  X,
  ChevronRight,
  Smartphone,
  Sun,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import exampleImage from "../../../assets/report-photo-perfect.jpg";
import { photoGuideContent, photoGuideTips } from "./photo-guide-helpers";

type BuildPhotoGuideStepsParams = {
  isDesktop: boolean;
  onComplete: () => void;
  primaryColor: string;
};

export function buildPhotoGuideSteps({
  isDesktop,
  onComplete,
  primaryColor,
}: BuildPhotoGuideStepsParams) {
  return [
    {
      title: "Welcome to Your Damage Report",
      subtitle: "Get accurate estimates with great photos",
      icon: <Camera className="w-16 h-16" />,
      content: (
        <div className="space-y-6">
          <div className="border border-blue-400/30 bg-blue-500/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start space-x-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-slate-100">Why Good Photos Matter</h3>
                <p className="text-slate-300/80 leading-relaxed">
                  Clear, well-lit photos help auto body repair shops understand the damage and
                  provide you with the most accurate quotes. Better photos = better estimates!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-green-400/30 bg-green-400/10 rounded-xl p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-green-200">You'll Need</h4>
              </div>
              <ul className="space-y-2 text-sm text-green-300/80">
                {photoGuideContent.welcomeNeeds.map((need) => (
                  <li key={need.item} className="flex items-start">
                    <span className="mr-2">{need.icon}</span>
                    <span>{need.item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-blue-400/30 bg-blue-400/10 rounded-xl p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-blue-200">Quick Tips</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-300/80">
                {photoGuideContent.welcomeTips.map((tip) => (
                  <li key={tip} className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 1: Use Your Camera",
      subtitle: isDesktop
        ? "Take photos or upload from your device"
        : "How to capture damage photos",
      icon: <Smartphone className="w-16 h-16" />,
      content: (
        <div className="space-y-5">
          {isDesktop ? (
            <div className="border border-blue-400/30 bg-blue-500/10 rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center text-slate-100">
                <ImageIcon className="w-5 h-5 mr-2" />
                Desktop Users: Two Options
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-100 mb-1">
                      Take Photos on Your Phone First
                    </p>
                    <p className="text-sm text-slate-300/80">
                      Use your phone camera for best results, then upload those photos here
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-100 mb-1">Upload Existing Photos</p>
                    <p className="text-sm text-slate-300/80">
                      If you already have photos, click the upload button to select them from your
                      computer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="w-8 h-8" />
                <h3 className="font-bold text-xl">Using Your Phone Camera</h3>
              </div>
              <p className="text-blue-50 mb-4">
                When you tap "Add Photo" on the next screen, your phone will ask for permission to
                use the camera. Make sure to allow access!
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-sm font-medium mb-2">📸 Camera Permissions</p>
                <p className="text-xs text-blue-100">
                  If prompted, tap "Allow" to enable camera access. You can change this later in
                  your phone settings.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-slate-100 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-400" />
              Camera Best Practices
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {photoGuideTips.cameraBasics.map((tip) => (
                <div
                  key={tip.title}
                  className="border border-white/[0.08] bg-white/[0.05] rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-slate-100">{tip.title}</p>
                      <p className="text-xs text-slate-300/80">{tip.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2: Perfect Your Lighting",
      subtitle: "Natural light works best for clear photos",
      icon: <Sun className="w-16 h-16" />,
      content: (
        <div className="space-y-5">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={exampleImage}
              alt="Example showing good lighting on damaged vehicle"
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg text-sm font-medium">
              <Check className="w-4 h-4" />
              <span>Perfect Lighting</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-green-400/50 bg-green-400/10 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-green-200">DO THIS</h4>
              </div>
              <ul className="space-y-3 text-sm">
                {photoGuideTips.lightingDo.map((tip) => (
                  <li key={tip.title} className="flex items-start">
                    <span className="text-green-400 mr-2 text-lg">✓</span>
                    <div>
                      <p className="font-medium text-green-200">{tip.title}</p>
                      <p className="text-green-300/70 text-xs">{tip.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-red-400/50 bg-red-400/10 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-red-200">AVOID THIS</h4>
              </div>
              <ul className="space-y-3 text-sm">
                {photoGuideTips.lightingAvoid.map((tip) => (
                  <li key={tip.title} className="flex items-start">
                    <span className="text-red-400 mr-2 text-lg">✗</span>
                    <div>
                      <p className="font-medium text-red-200">{tip.title}</p>
                      <p className="text-red-300/70 text-xs">{tip.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 3: Capture All Angles",
      subtitle: "Show the complete picture from multiple views",
      icon: <Move className="w-16 h-16" />,
      content: (
        <div className="space-y-5">
          <div className="border border-amber-400/30 bg-amber-400/10 rounded-xl p-5">
            <h3 className="font-bold text-lg mb-3 text-amber-200">
              📸 Take At Least 4 Different Photos
            </h3>
            <p className="text-sm text-amber-300/80">
              More angles = more accurate quotes. Walk around your vehicle and capture the damage
              from different positions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photoGuideTips.angleShots.map((shot) => (
              <div
                key={shot.number}
                className="bd-glass-card border-2 border-blue-400/40 rounded-xl p-4"
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-xl">{shot.number}</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm mb-1 text-slate-100">{shot.title}</p>
                  <p className="text-xs text-slate-300/80">{shot.desc}</p>
                  <div className="mt-2 text-2xl">{shot.emoji}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-blue-400/30 bg-blue-400/10 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1 text-blue-200">Pro Tip: Move Around!</p>
                <p className="text-blue-300/80">
                  Take steps to the left, right, up close, and further back. Each angle reveals
                  different details that help shops give you accurate quotes.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Start!",
      subtitle: "Let's document your vehicle damage",
      icon: <Check className="w-16 h-16" />,
      content: (
        <div className="space-y-5">
          <div className="relative rounded-xl overflow-hidden border-4 border-green-500 shadow-lg">
            <img
              src={exampleImage}
              alt="Example of properly photographed vehicle damage"
              className="w-full h-auto"
            />
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-xl">
              <Check className="w-5 h-5" />
              <span className="font-medium">Perfect Example!</span>
            </div>
          </div>

          <div className="border-2 border-green-400/50 bg-green-400/10 rounded-2xl p-4 sm:p-6">
            <h3 className="font-bold text-xl mb-4 text-green-200 flex items-center">
              <span className="text-2xl mr-3">✅</span>
              Quick Checklist Before You Start
            </h3>
            <div className="space-y-3">
              {photoGuideTips.readyChecklist.map((item) => (
                <label
                  key={item.text}
                  className="flex items-center space-x-3 cursor-pointer group p-3 bd-glass-card rounded-lg hover:shadow-md transition-all"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-white/20"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-slate-200 group-hover:text-white font-medium">
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-5 px-6 rounded-xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-3 group"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)`,
            }}
          >
            <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Start Taking Photos Now</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {isDesktop && (
            <p className="text-center text-sm text-slate-400/70">
              💡 Tip: For best results, take photos on your phone first, then upload them here
            </p>
          )}
        </div>
      ),
    },
  ];
}
