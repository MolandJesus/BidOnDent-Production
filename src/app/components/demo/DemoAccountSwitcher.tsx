import { User, Wrench, Shield, ArrowLeft, Eye, Sparkles } from "lucide-react";

interface DemoAccountSwitcherProps {
  currentAccountType: "customer" | "shop" | "insurer";
  onSelectAccountType: (type: "customer" | "shop" | "insurer") => void;
  onExitDemo: () => void;
  primaryColor: string;
}

export default function DemoAccountSwitcher({
  currentAccountType,
  onSelectAccountType,
  onExitDemo,
  primaryColor
}: DemoAccountSwitcherProps) {
  const accountTypes = [
    {
      id: "customer" as const,
      title: "Customer Dashboard",
      description: "Experience the customer view: submit damage reports, compare bids, and manage vehicle repairs.",
      icon: User,
      color: "#003d82",
      features: [
        "Submit damage reports with photos",
        "Compare competitive bids from shops",
        "Track repair progress",
        "Manage vehicle information"
      ]
    },
    {
      id: "shop" as const,
      title: "Shop Dashboard",
      description: "See how repair shops receive requests, submit bids, and manage their active jobs.",
      icon: Wrench,
      color: "#00a0e9",
      features: [
        "View incoming repair requests",
        "Submit competitive bids",
        "Manage active repair jobs",
        "Track business analytics"
      ]
    },
    {
      id: "insurer" as const,
      title: "Insurer Dashboard",
      description: "Explore the insurance company view: manage claims, partner with shops, and oversee repairs.",
      icon: Shield,
      color: "#70c0ee",
      features: [
        "Monitor insurance claims",
        "Manage partner shop network",
        "Review claim approvals",
        "Track claim analytics"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onExitDemo}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to My Account</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)` }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Demo Mode</h1>
              <p className="text-gray-600">Experience BidOnDent from different perspectives</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Demo Mode Active:</span> You're viewing sample data. 
                Your actual account information and saved data remain unchanged. Click any card below to switch perspectives.
              </p>
            </div>
          </div>
        </div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {accountTypes.map((type) => {
            const Icon = type.icon;
            const isActive = currentAccountType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => onSelectAccountType(type.id)}
                className={`text-left bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                  isActive 
                    ? 'border-blue-600 transform scale-105' 
                    : 'border-transparent hover:border-blue-200'
                }`}
              >
                {/* Header with Icon */}
                <div 
                  className="p-6 text-white relative overflow-hidden"
                  style={{ backgroundColor: type.color }}
                >
                  <div className="relative z-10">
                    <Icon className="w-12 h-12 mb-3" />
                    <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        Currently Viewing
                      </span>
                    )}
                  </div>
                  {/* Background decoration */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {type.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                      Key Features:
                    </p>
                    <ul className="space-y-2">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                  <div 
                    className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isActive ? 'Currently Viewing' : 'Switch to This View'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={onExitDemo}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Exit Demo Mode
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Return to your original account at any time without losing data
          </p>
        </div>
      </div>
    </div>
  );
}
