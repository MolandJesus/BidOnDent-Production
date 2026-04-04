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
import {
  buildInsuranceIntelligenceSummary,
  buildInsuranceRecommendations,
  getInsuranceDirectory,
} from "../../services/intelligence/marketIntelligence";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";
import InsurerConnectFormModal from "./InsurerConnectFormModal";
import type { InsurerConnectionScreenProps } from "./insurerConnectionScreenHelpers";

export default function InsurerConnectionScreen({
  onBack,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  identity,
  userType = "customer",
  reports = [],
  appearanceMode = "map-dark",
}: InsurerConnectionScreenProps) {
  const isLight = appearanceMode === "light";
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
    <div className={`min-h-screen pb-20 ${isLight ? "bg-slate-50/80" : ""}`}>
      <div
        className={`border-b px-4 py-5 ${isLight ? "border-slate-200/60 bg-white/90" : "border-white/10"}`}
        style={
          isLight
            ? { backdropFilter: "blur(12px)" }
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className={`mr-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
              isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${isLight ? "text-slate-700" : "text-slate-200"}`} />
          </button>
          <div>
            <p
              className={`mb-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-cyan-600" : "text-cyan-300/80"}`}
            >
              Insurance connection
            </p>
            <h1 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Connect Your Insurance
            </h1>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Carrier-aware account links for the signed-in {userType} flow
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isLight ? "text-slate-400" : "text-slate-400/60"}`}
          />
          <input
            type="text"
            placeholder="Search carrier, headquarters, claims workflow, hail, network..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border backdrop-blur-sm focus:outline-none focus:ring-2 ${
              isLight
                ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-blue-300"
                : "border-white/15 bg-white/10 text-slate-100 placeholder:text-slate-400/60 focus:ring-blue-400/20"
            }`}
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bd-glass-card rounded-2xl border border-blue-100 p-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/10 text-blue-400"}`}
          >
            <Sparkles className="w-4 h-4" />
            Insurance intelligence active
          </div>
          <h2 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {summary.title}
          </h2>
          <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            {summary.description}
          </p>
          <div className="grid gap-2 mt-4">
            {summary.callouts.map((callout) => (
              <div
                key={callout}
                className={`rounded-xl px-3 py-2 text-sm ${isLight ? "bg-slate-100 text-slate-700" : "bg-white/[0.04] text-slate-300"}`}
              >
                {callout}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`border border-blue-400/20 rounded-2xl p-4 flex items-start ${isLight ? "bg-blue-50" : "bg-blue-500/10"}`}
        >
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
            <h2 className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Connected Insurance
            </h2>
            {insurerDirectory
              .filter((insurer) => connectedInsurers.includes(insurer.id))
              .map((insurer) => (
                <div
                  key={insurer.id}
                  className="bd-glass-card rounded-2xl p-4 border-2 border-green-200 flex items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                      >
                        {insurer.name}
                      </h3>
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        Connected
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {insurer.description}
                    </p>
                    <div
                      className={`flex flex-wrap gap-3 mt-3 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}
                    >
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
          <h2 className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {connectedInsurers.length > 0 ? "Add Another Carrier" : "Select Your Insurance Company"}
          </h2>

          {insurerRecommendations.map((insurer) => (
            <button
              key={insurer.id}
              onClick={() => handleSelectInsurer(insurer.id)}
              className="w-full bd-glass-card rounded-2xl p-4 hover:border-blue-300 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? "bg-slate-100" : "bg-white/[0.08]"}`}
                >
                  <Shield className="w-6 h-6 text-slate-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3
                      className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                    >
                      {insurer.name}
                    </h3>
                    {insurer.popular && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/10 text-blue-400"}`}
                      >
                        Popular
                      </span>
                    )}
                    {insurer.connected && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${isLight ? "bg-green-100 text-green-700" : "bg-green-400/10 text-green-300"}`}
                      >
                        Connected
                      </span>
                    )}
                  </div>

                  <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    {insurer.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                    <div
                      className={`rounded-xl px-3 py-2 ${isLight ? "bg-slate-100" : "bg-white/[0.04]"}`}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${isLight ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Headquarters
                      </p>
                      <p className={`font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                        {insurer.headquarters}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl px-3 py-2 ${isLight ? "bg-slate-100" : "bg-white/[0.04]"}`}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${isLight ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Claims line
                      </p>
                      <p className={`font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                        {insurer.claimsPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {insurer.connectionReasons.map((reason) => (
                      <span
                        key={reason}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/10 text-blue-400"}`}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div
                    className={`rounded-xl px-3 py-2 min-w-[82px] text-center ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-white"}`}
                  >
                    <p
                      className={`text-[11px] uppercase tracking-wide ${isLight ? "text-slate-500" : "text-white/70"}`}
                    >
                      Fit
                    </p>
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
        <InsurerConnectFormModal
          carrier={selectedCarrier}
          isLight={isLight}
          primaryColor={primaryColor}
          policyNumber={policyNumber}
          claimNumber={claimNumber}
          onPolicyNumberChange={setPolicyNumber}
          onClaimNumberChange={setClaimNumber}
          onConnect={handleConnect}
          onCancel={() => {
            setShowConnectForm(false);
            setSelectedInsurer(null);
          }}
        />
      )}
    </div>
  );
}
