import { useState } from "react";
import { ArrowLeft, Shield, Check, Search, ChevronRight, Info } from "lucide-react";

type InsurerConnectionScreenProps = {
  onBack: () => void;
  primaryColor?: string;
  secondaryColor?: string;
};

export default function InsurerConnectionScreen({
  onBack,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
}: InsurerConnectionScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInsurer, setSelectedInsurer] = useState<number | null>(null);
  const [connectedInsurers, setConnectedInsurers] = useState<number[]>([]);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [policyNumber, setPolicyNumber] = useState("");
  const [claimNumber, setClaimNumber] = useState("");

  // Mock insurers data - in production this would come from an API
  const insurers = [
    {
      id: 1,
      name: "State Farm",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "America's largest auto insurer",
      benefits: ["Direct claim filing", "Real-time updates", "Network shops"],
      popular: true,
    },
    {
      id: 2,
      name: "Geico",
      logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "15 minutes could save you 15% or more",
      benefits: ["Fast processing", "Mobile app integration", "24/7 support"],
      popular: true,
    },
    {
      id: 3,
      name: "Progressive",
      logo: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "Compare rates and save",
      benefits: ["Snapshot program", "Name Your Price tool", "Multi-policy discounts"],
      popular: true,
    },
    {
      id: 4,
      name: "Allstate",
      logo: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "You're in good hands",
      benefits: ["Accident forgiveness", "New car replacement", "Safe driving bonus"],
      popular: false,
    },
    {
      id: 5,
      name: "USAA",
      logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "Serving military members and their families",
      benefits: ["Military member exclusive", "Accident forgiveness", "Rideshare coverage"],
      popular: false,
    },
    {
      id: 6,
      name: "Liberty Mutual",
      logo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "Customized coverage options",
      benefits: ["Better car replacement", "Accident forgiveness", "New car replacement"],
      popular: false,
    },
    {
      id: 7,
      name: "Farmers Insurance",
      logo: "https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "Get smarter about insurance",
      benefits: ["Signal app", "Flexible payment", "Claims support"],
      popular: false,
    },
    {
      id: 8,
      name: "Nationwide",
      logo: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      description: "Nationwide is on your side",
      benefits: ["Vanishing deductible", "Accident forgiveness", "SmartRide program"],
      popular: false,
    },
  ];

  const filteredInsurers = insurers.filter(
    (insurer) =>
      insurer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insurer.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = () => {
    if (selectedInsurer && policyNumber) {
      setConnectedInsurers([...connectedInsurers, selectedInsurer]);
      setShowConnectForm(false);
      setSelectedInsurer(null);
      setPolicyNumber("");
      setClaimNumber("");
    }
  };

  const handleSelectInsurer = (id: number) => {
    setSelectedInsurer(id);
    setShowConnectForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div
        className="text-white sticky top-0 z-10"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Connect Your Insurance</h1>
              <p className="text-white/80 text-sm">Link your policy for faster claims</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search insurance companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-4 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why connect your insurance?</p>
            <p>
              Connecting your insurance allows for faster claims processing, direct communication
              with your insurer, and can streamline your repair approval process.
            </p>
          </div>
        </div>
      </div>

      {/* Connected Insurers */}
      {connectedInsurers.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="font-bold text-lg mb-3">Connected Insurance</h2>
          <div className="space-y-2">
            {connectedInsurers.map((insurerId) => {
              const insurer = insurers.find((i) => i.id === insurerId);
              if (!insurer) return null;

              return (
                <div
                  key={insurerId}
                  className="bg-white rounded-lg p-4 border-2 border-green-200 flex items-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 mr-3 flex items-center justify-center overflow-hidden">
                    <Shield className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{insurer.name}</h3>
                    <p className="text-sm text-gray-600">Policy connected</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Insurers */}
      <div className="px-4 pb-4">
        <h2 className="font-bold text-lg mb-3">
          {connectedInsurers.length > 0 ? "Add Another" : "Select Your Insurance Company"}
        </h2>

        {/* Popular Insurers */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Popular Choices</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredInsurers
              .filter((insurer) => insurer.popular && !connectedInsurers.includes(insurer.id))
              .map((insurer) => (
                <button
                  key={insurer.id}
                  onClick={() => handleSelectInsurer(insurer.id)}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors text-left"
                >
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 mr-3 flex items-center justify-center overflow-hidden">
                      <Shield className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-sm">{insurer.name}</h3>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">{insurer.description}</p>
                </button>
              ))}
          </div>
        </div>

        {/* All Insurers */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">All Insurance Companies</h3>
          <div className="space-y-2">
            {filteredInsurers
              .filter((insurer) => !connectedInsurers.includes(insurer.id))
              .map((insurer) => (
                <button
                  key={insurer.id}
                  onClick={() => handleSelectInsurer(insurer.id)}
                  className="w-full bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 mr-3 flex items-center justify-center overflow-hidden">
                      <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{insurer.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{insurer.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Connection Form Modal */}
      {showConnectForm && selectedInsurer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Connect {insurers.find((i) => i.id === selectedInsurer)?.name}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="POL-123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Claim Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={claimNumber}
                    onChange={(e) => setClaimNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="CLM-987654321"
                  />
                  <p className="text-xs text-gray-500 mt-1">Add if you already filed a claim</p>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {insurers
                      .find((i) => i.id === selectedInsurer)
                      ?.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start">
                          <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConnectForm(false);
                    setSelectedInsurer(null);
                    setPolicyNumber("");
                    setClaimNumber("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!policyNumber}
                  className="flex-1 px-4 py-2 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
