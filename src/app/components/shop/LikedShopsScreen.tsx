import { useEffect, useState } from "react";
import { ArrowLeft, Heart, MapPin, Phone, Search, Shield, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import { buildShopMapListings } from "../../services/intelligence/shopMapExperience";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";

type LikedShopsScreenProps = {
  onBack: () => void;
  onOpenMap?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  identity?: WebsiteIdentity | null;
};

export default function LikedShopsScreen({
  onBack,
  onOpenMap,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  identity,
}: LikedShopsScreenProps) {
  const { inventory } = useNetworkDirectory();
  const memory = loadWebsiteSessionMemory(identity);
  const [savedShopIds, setSavedShopIds] = useState<number[]>(
    memory.mapSession?.customerSavedShopIds || []
  );
  const [connectedInsurerIds, setConnectedInsurerIds] = useState<number[]>(
    memory.insuranceConnection.connectedInsurerIds
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const nextMemory = loadWebsiteSessionMemory(identity);
    setSavedShopIds(nextMemory.mapSession?.customerSavedShopIds || []);
    setConnectedInsurerIds(nextMemory.insuranceConnection.connectedInsurerIds);
  }, [identity?.websiteUserKey]);

  useEffect(() => {
    updateWebsiteSessionMemory(
      identity,
      {
        mapSession: {
          customerSavedShopIds: savedShopIds,
        },
      },
      { accountType: "customer" }
    );
  }, [identity, savedShopIds]);

  const savedListings = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: inventory.shops,
    searchQuery: "",
    sortBy: "smart-match",
    userType: "customer",
  }).filter((shop) => savedShopIds.includes(shop.id));

  const filteredListings = savedListings.filter((shop) => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) {
      return true;
    }

    return (
      shop.name.toLowerCase().includes(normalizedQuery) ||
      shop.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery)) ||
      shop.insurerPrograms.some((program) => program.toLowerCase().includes(normalizedQuery))
    );
  });

  const handleUnlike = (shopId: number) => {
    setSavedShopIds((currentIds) => currentIds.filter((id) => id !== shopId));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div
        className="sticky top-0 z-10 border-b border-white/10 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="px-4 py-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 transition-colors hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Saved Shops</h1>
              <p className="text-sm text-white/80">
                {savedListings.length} customer shortlist{savedListings.length === 1 ? "" : "s"}{" "}
                synced from the map
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search saved shops, specialties, or carrier programs..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/15 py-3 pl-10 pr-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/35"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {savedListings.length === 0 ? (
          <div className="rounded-[28px] bd-glass-card p-5 sm:p-8 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900">No saved shops yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Save shops from the Smart Shop Map to keep a customer shortlist for bids, follow-up,
              and future repair decisions.
            </p>
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="mt-5 rounded-2xl px-4 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Open Smart Shop Map
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((shop) => (
              <article key={shop.id} className="overflow-hidden rounded-[28px] bd-glass-card">
                <div className="flex flex-col gap-4 p-4 md:flex-row md:p-5">
                  <div className="h-36 w-full overflow-hidden rounded-[22px] bg-slate-100 md:h-auto md:w-44 md:flex-shrink-0">
                    <ImageWithFallback
                      src={shop.image}
                      alt={shop.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold text-slate-950">{shop.name}</h3>
                          {shop.topPick && (
                            <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                              Top fit
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                            <span className="font-semibold text-slate-900">{shop.rating}</span>
                            <span>({shop.reviews})</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {shop.mapDistanceLabel}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Shield className="h-4 w-4 text-slate-400" />
                            {shop.insuranceCompatibilityScore}% carrier fit
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnlike(shop.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        <Heart className="h-4 w-4" fill="currentColor" />
                        Remove
                      </button>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">{shop.aiSummary}</p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">AI Fit</p>
                        <p className="text-lg font-semibold text-slate-950">
                          {shop.recommendationScore}%
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Avg ticket
                        </p>
                        <p className="text-lg font-semibold text-slate-950">
                          {shop.averagePriceLabel}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Response
                        </p>
                        <p className="text-lg font-semibold text-slate-950">
                          {shop.responseTimeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {shop.specialties.slice(0, 4).map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {shop.insurerPrograms.slice(0, 3).map((program) => (
                        <span
                          key={program}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                        >
                          {program}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                        onClick={onOpenMap}
                      >
                        Review In Map
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors bd-glass-control--utility">
                        <Phone className="h-4 w-4" />
                        Contact Shop
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
