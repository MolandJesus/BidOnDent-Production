import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Info,
  Phone,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import {
  buildInsuranceIntelligenceSummary,
  buildInsuranceRecommendations,
  getInsuranceDirectory,
  type MarketUserType,
} from "../../services/intelligence/marketIntelligence";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";

type InsurerConnectionScreenProps = {
  onBack: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  identity?: WebsiteIdentity | null;
  userType?: MarketUserType;
  reports?: Array<{
    damageArea?: string;
    damageAreas?: string[];
    damageType?: string;
    description?: string;
  }>;
};

export default function InsurerConnectionScreen({
  onBack,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  identity,
  userType = "customer",
  reports = [],
}: InsurerConnectionScreenProps) {
  const { inventory } = useNetworkDirectory();
  const savedMemory = loadWebsiteSessionMemory(identity);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInsurer, setSelectedInsurer] = useState<number | null>(
    savedMemory.insuranceConnection.lastSelectedInsurerId
  );
  const [connectedInsurers, setConnectedInsurers] = useState<number[]>(
    savedMemory.insuranceConnection.connectedInsurerIds
  );
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [policyNumber, setPolicyNumber] = useState(
    savedMemory.insuranceConnection.draftPolicyNumber
  );
  const [claimNumber, setClaimNumber] = useState(savedMemory.insuranceConnection.draftClaimNumber);

  useEffect(() => {
    const memory = loadWebsiteSessionMemory(identity);
    setSelectedInsurer(memory.insuranceConnection.lastSelectedInsurerId);
    setConnectedInsurers(memory.insuranceConnection.connectedInsurerIds);
    setPolicyNumber(memory.insuranceConnection.draftPolicyNumber);
    setClaimNumber(memory.insuranceConnection.draftClaimNumber);
  }, [identity?.websiteUserKey]);

  useEffect(() => {
    updateWebsiteSessionMemory(
      identity,
      {
        insuranceConnection: {
          connectedInsurerIds: connectedInsurers,
          draftPolicyNumber: policyNumber,
          draftClaimNumber: claimNumber,
          lastSelectedInsurerId: selectedInsurer,
        },
      },
      { accountType: userType }
    );
  }, [claimNumber, connectedInsurers, identity?.websiteUserKey, policyNumber, selectedInsurer]);

  const insurerRecommendations = buildInsuranceRecommendations({
    searchQuery,
    reports,
    connectedInsurerIds: connectedInsurers,
    directoryInsurers: inventory.insurers,
  });
  const summary = buildInsuranceIntelligenceSummary(insurerRecommendations);
  const insurerDirectory = getInsuranceDirectory(inventory.insurers);
  const selectedCarrier = insurerDirectory.find((insurer) => insurer.id === selectedInsurer);

  const handleConnect = () => {
    if (!selectedInsurer || !policyNumber.trim()) {
      return;
    }

    setConnectedInsurers((currentInsurers) =>
      [...new Set([...currentInsurers, selectedInsurer])].sort((left, right) => left - right)
    );
    setShowConnectForm(false);
    setPolicyNumber("");
    setClaimNumber("");
  };

  const handleSelectInsurer = (id: number) => {
    setSelectedInsurer(id);
    setShowConnectForm(true);
  };

  const handleDisconnectInsurer = (insurerId: number) => {
    setConnectedInsurers((currentInsurers) =>
      currentInsurers.filter((currentId) => currentId !== insurerId)
    );

    if (selectedInsurer === insurerId) {
      setSelectedInsurer(null);
      setShowConnectForm(false);
      setPolicyNumber("");
      setClaimNumber("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
              <p className="text-white/80 text-sm">
                Carrier-aware account links for the signed-in {userType} flow
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search carrier, headquarters, claims workflow, hail, network..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4" />
            Insurance intelligence active
          </div>
          <h2 className="text-lg font-bold text-gray-900">{summary.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{summary.description}</p>
          <div className="grid gap-2 mt-4">
            {summary.callouts.map((callout) => (
              <div
                key={callout}
                className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {callout}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why connect your insurance?</p>
            <p>
              This future-proof layer stores carrier connections against the BidOnDent website user
              identity, not only a specific auth vendor, so recommendations and account context can
              survive future sign-in provider swaps.
            </p>
          </div>
        </div>

        {connectedInsurers.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg">Connected Insurance</h2>
            {insurerDirectory
              .filter((insurer) => connectedInsurers.includes(insurer.id))
              .map((insurer) => (
                <div
                  key={insurer.id}
                  className="bg-white rounded-2xl p-4 border-2 border-green-200 flex items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{insurer.name}</h3>
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        Connected
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{insurer.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {insurer.headquarters}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {insurer.claimsPhone}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDisconnectInsurer(insurer.id)}
                      className="mt-3 inline-flex rounded-xl px-3 py-2 text-xs font-semibold bd-glass-control--destructive"
                    >
                      Disconnect carrier
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="space-y-3">
          <h2 className="font-bold text-lg">
            {connectedInsurers.length > 0 ? "Add Another Carrier" : "Select Your Insurance Company"}
          </h2>

          {insurerRecommendations.map((insurer) => (
            <button
              key={insurer.id}
              onClick={() => handleSelectInsurer(insurer.id)}
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-slate-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{insurer.name}</h3>
                    {insurer.popular && (
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        Popular
                      </span>
                    )}
                    {insurer.connected && (
                      <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                        Connected
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">{insurer.description}</p>

                  <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-gray-500 text-xs uppercase tracking-wide">Headquarters</p>
                      <p className="font-medium text-gray-900">{insurer.headquarters}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-gray-500 text-xs uppercase tracking-wide">Claims line</p>
                      <p className="font-medium text-gray-900">{insurer.claimsPhone}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {insurer.connectionReasons.map((reason) => (
                      <span
                        key={reason}
                        className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="rounded-xl bg-slate-900 text-white px-3 py-2 min-w-[82px] text-center">
                    <p className="text-[11px] uppercase tracking-wide text-white/70">Fit</p>
                    <p className="text-lg font-bold">{insurer.fitScore}%</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showConnectForm && selectedCarrier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Connect {selectedCarrier.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedCarrier.description}</p>
                </div>
                <div className="rounded-xl bg-slate-900 text-white px-3 py-2 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-white/70">HQ</p>
                  <p className="text-xs font-semibold">{selectedCarrier.headquarters}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(event) => setPolicyNumber(event.target.value)}
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
                    onChange={(event) => setClaimNumber(event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="CLM-987654321"
                  />
                  <p className="text-xs text-gray-500 mt-1">Add this if a claim already exists.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                    <Shield className="w-4 h-4 text-slate-500" />
                    Connection notes
                  </div>
                  <div className="space-y-2">
                    {selectedCarrier.accountConnectionNotes.map((note) => (
                      <div
                        key={note}
                        className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-700"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConnectForm(false);
                    setSelectedInsurer(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!policyNumber.trim()}
                  className="flex-1 px-4 py-2 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  Save Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
