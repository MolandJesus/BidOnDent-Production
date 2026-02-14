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

type PhotoGuideStep = {
  title: string;
  subtitle: string;
  icon: JSX.Element;
  content: JSX.Element;
};

type BuildStepsArgs = {
  primaryColor: string;
  isDesktop: boolean;
  onComplete: () => void;
};

export function buildPhotoGuideSteps({
  primaryColor,
  isDesktop,
  onComplete,
}: BuildStepsArgs): PhotoGuideStep[] {
  return [
    {
      title: "Welcome to Your Damage Report",
      subtitle: "Get accurate estimates with great photos",
      icon: <Camera className="w-16 h-16" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Why Good Photos Matter</h3>
                <p className="text-gray-700 leading-relaxed">
                  Clear, well-lit photos help auto body repair shops understand the damage and
                  provide you with the most accurate quotes. Better photos = better estimates!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-green-900">You'll Need</h4>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start">
                  <span className="mr-2">📱</span>
                  <span>Your phone camera or device</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">☀️</span>
                  <span>Good natural lighting (daylight)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🚗</span>
                  <span>3-5 minutes to capture photos</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-blue-900">Quick Tips</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Clean visible dirt from damaged area</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Take photos outdoors if possible</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Capture multiple angles</span>
                </li>
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
            <>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <h3 className="font-bold text-lg mb-3 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Desktop Users: Two Options
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        Take Photos on Your Phone First
                      </p>
                      <p className="text-sm text-gray-600">
                        Use your phone camera for best results, then upload those photos here
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Upload Existing Photos</p>
                      <p className="text-sm text-gray-600">
                        If you already have photos, click the upload button to select them from your
                        computer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
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
            </>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Camera Best Practices
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {[
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
              ].map((tip, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{tip.title}</p>
                      <p className="text-xs text-gray-600">{tip.desc}</p>
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
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-green-900">DO THIS</h4>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 text-lg">✓</span>
                  <div>
                    <p className="font-medium text-green-900">Shoot in daylight</p>
                    <p className="text-green-700 text-xs">Natural light shows true colors</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 text-lg">✓</span>
                  <div>
                    <p className="font-medium text-green-900">Avoid shadows</p>
                    <p className="text-green-700 text-xs">Position yourself properly</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 text-lg">✓</span>
                  <div>
                    <p className="font-medium text-green-900">Use overcast days</p>
                    <p className="text-green-700 text-xs">Clouds = even lighting!</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-red-900">AVOID THIS</h4>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2 text-lg">✗</span>
                  <div>
                    <p className="font-medium text-red-900">Camera flash</p>
                    <p className="text-red-700 text-xs">Creates glare and washes out details</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2 text-lg">✗</span>
                  <div>
                    <p className="font-medium text-red-900">Dark garages</p>
                    <p className="text-red-700 text-xs">Poor lighting hides damage</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2 text-lg">✗</span>
                  <div>
                    <p className="font-medium text-red-900">Direct harsh sun</p>
                    <p className="text-red-700 text-xs">Creates strong shadows</p>
                  </div>
                </li>
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
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
            <h3 className="font-bold text-lg mb-3 text-orange-900">
              📸 Take At Least 4 Different Photos
            </h3>
            <p className="text-sm text-orange-800">
              More angles = more accurate quotes. Walk around your vehicle and capture the damage
              from different positions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm mb-1">Wide Shot</p>
                <p className="text-xs text-gray-600">Full side of car showing damage location</p>
                <div className="mt-2 text-2xl">🚗</div>
              </div>
            </div>

            <div className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm mb-1">Medium Shot</p>
                <p className="text-xs text-gray-600">Damaged panel with surroundings</p>
                <div className="mt-2 text-2xl">📷</div>
              </div>
            </div>

            <div className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm mb-1">Close-Up</p>
                <p className="text-xs text-gray-600">Details of dents, scratches, paint</p>
                <div className="mt-2 text-2xl">🔍</div>
              </div>
            </div>

            <div className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm mb-1">Different Angle</p>
                <p className="text-xs text-gray-600">Another perspective of damage</p>
                <div className="mt-2 text-2xl">📐</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Pro Tip: Move Around!</p>
                <p className="text-blue-700">
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

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4 text-green-900 flex items-center">
              <span className="text-2xl mr-3">✅</span>
              Quick Checklist Before You Start
            </h3>
            <div className="space-y-3">
              {[
                { text: "Clean dirt/debris from damaged area", emoji: "🧹" },
                { text: "Find good natural lighting", emoji: "☀️" },
                { text: "Have phone camera ready", emoji: "📱" },
                { text: "Plan to take 4+ different angles", emoji: "📸" },
                { text: "Make sure battery is charged", emoji: "🔋" },
              ].map((item, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer group p-3 bg-white rounded-lg hover:shadow-md transition-all"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium">
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
            <p className="text-center text-sm text-gray-500">
              💡 Tip: For best results, take photos on your phone first, then upload them here
            </p>
          )}
        </div>
      ),
    },
  ];
}
