import { type ActionItem, actionIconTones, actionIconTonesLight } from "./homeScreenData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export { HomeReportsList } from "./HomeReportsList";

// ============================================================================
// HomeOnboardingCard — "How BidOnDent Works" for new customers
// ============================================================================

export function HomeOnboardingCard({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
}: {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
}) {
  const isLight = appearanceMode === "light";

  // Step card tones: per-mode so light mode renders dark text on light tinted
  // backgrounds and dark mode renders light text on deep navy. Borders match
  // the rest of the dashboard's rounded-2xl/3xl glass.
  const stepStylesDark = [
    {
      background: "linear-gradient(180deg, rgba(8, 18, 39, 0.95) 0%, rgba(7, 15, 31, 0.9) 100%)",
      borderColor: "rgba(96, 165, 250, 0.16)",
    },
    {
      background: "linear-gradient(180deg, rgba(16, 42, 84, 0.92) 0%, rgba(11, 29, 59, 0.88) 100%)",
      borderColor: "rgba(96, 165, 250, 0.26)",
    },
    {
      background: "linear-gradient(180deg, rgba(10, 49, 74, 0.92) 0%, rgba(8, 30, 47, 0.88) 100%)",
      borderColor: "rgba(34, 211, 238, 0.22)",
    },
  ];
  const stepStylesLight = [
    {
      background:
        "linear-gradient(180deg, rgba(241, 246, 253, 0.98) 0%, rgba(232, 239, 250, 0.94) 100%)",
      borderColor: "rgba(148, 163, 184, 0.30)",
    },
    {
      background:
        "linear-gradient(180deg, rgba(233, 243, 255, 0.98) 0%, rgba(220, 234, 251, 0.94) 100%)",
      borderColor: "rgba(96, 165, 250, 0.32)",
    },
    {
      background:
        "linear-gradient(180deg, rgba(237, 249, 245, 0.98) 0%, rgba(222, 243, 236, 0.94) 100%)",
      borderColor: "rgba(20, 184, 166, 0.28)",
    },
  ];
  const stepStyles = isLight ? stepStylesLight : stepStylesDark;
  const steps = [
    { label: "Submit a Report", detail: "Upload photos of vehicle damage" },
    { label: "Receive Bids", detail: "Local shops compete for your repair" },
    { label: "Choose & Navigate", detail: "Pick the best offer and get directions" },
  ];

  return (
    <section
      className={`bd-dashboard-panel relative overflow-hidden rounded-3xl p-4 sm:p-6 ${
        isLight ? "text-slate-800" : "text-white"
      }`}
      style={{
        // Pass 18 (cowork-A) — LAW Light-Mode Surface Rule violation fix.
        // Previous gradient started at `rgba(255, 255, 255, 0.98)` which is
        // explicitly banned per LAW_PROJECT_RULES.md § "Forbidden in light
        // mode" item 1 ("No pure-white surfaces" — panel/section/card/shell
        // backgrounds). Replaced with cool blue-gray glass starting from
        // `rgba(241, 246, 253, 0.96)` (matches the existing mid-stop, drops
        // the white start). Preserves the cool-glass intent + the depth
        // gradient direction; satisfies the LAW canonical Light-Mode
        // Surface Rule baseline. Dark-mode gradient unchanged.
        background: isLight
          ? "linear-gradient(135deg, rgba(241, 246, 253, 0.96) 0%, rgba(231, 240, 252, 0.92) 50%, rgba(214, 226, 244, 0.88) 100%)"
          : "linear-gradient(135deg, rgba(15, 30, 60, 0.92) 0%, rgba(10, 22, 48, 0.88) 50%, rgba(20, 40, 80, 0.85) 100%)",
      }}
    >
      {/* Atmospheric sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLight
            ? `radial-gradient(ellipse 80% 60% at 80% -10%, ${primaryColor}10, transparent 50%), radial-gradient(ellipse 50% 40% at -5% 110%, ${secondaryColor}0a, transparent 55%)`
            : `radial-gradient(ellipse 80% 60% at 80% -10%, ${primaryColor}22, transparent 50%), radial-gradient(ellipse 50% 40% at -5% 110%, ${secondaryColor}18, transparent 55%)`,
        }}
      />
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
          isLight ? "via-blue-400/30" : "via-blue-400/25"
        } to-transparent`}
      />
      <div className="relative">
        <p
          className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.20em] ${
            isLight ? "text-blue-700/70" : "text-blue-300/55"
          }`}
        >
          Getting started
        </p>
        <h2 className="mb-2 text-lg font-semibold sm:text-xl">How BidOnDent Works</h2>
        <p className={`max-w-2xl text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>
          A quick path from first damage photo to local bids and smart map navigation.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4">
          {steps.map((step, i) => {
            const tone = stepStyles[i % stepStyles.length];
            return (
              <div
                key={step.label}
                className="flex items-start gap-3 rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3"
                style={{
                  background: tone.background,
                  borderColor: tone.borderColor,
                  boxShadow: isLight
                    ? // Pass 28: cream-gold top inset per locked Premium Gold Palette.
                      "0 12px 24px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(252, 240, 208, 0.96)"
                    : "0 16px 30px rgba(2, 6, 23, 0.24), inset 0 1px 0 rgba(191, 219, 254, 0.05)",
                }}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ring-1 backdrop-blur-sm ${
                    isLight
                      ? "bg-blue-500/15 text-blue-700 ring-blue-400/30"
                      : "bg-blue-500/25 text-white ring-blue-400/30"
                  }`}
                >
                  {i + 1}
                </div>
                <div>
                  <p className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {step.label}
                  </p>
                  <p
                    className={`mt-0.5 text-sm leading-5 ${
                      isLight ? "text-slate-600" : "text-blue-100/70"
                    }`}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HomeQuickActions — 2x2 grid of role-specific action buttons
// ============================================================================

export function HomeQuickActions({
  quickActions,
  appearanceMode = "map-dark",
}: {
  quickActions: ActionItem[];
  appearanceMode?: DashboardAppearanceMode;
}) {
  const isLight = appearanceMode === "light";
  // Quick Actions tile rotation: alternate cool/warm/cool/warm so the row
  // gets two gold values mixed in with the blue tiles. Owner direction:
  // dashboard light mode was reading too off-white; needs gold mix without
  // becoming landing-loud.
  const actionSurfaceClasses = [
    "bd-dashboard-section--accent-blue",
    "bd-dashboard-section--accent-gold",
    "bd-dashboard-section--accent-cyan",
    "bd-dashboard-section--accent-champagne",
  ];
  if (quickActions.length === 0) return null;
  return (
    <section className="bd-dashboard-panel bd-dashboard-panel--deep rounded-2xl p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="bd-section-eyebrow mb-1.5">Your Dashboard</p>
          <h2
            className={`text-sm font-semibold uppercase tracking-[0.18em] md:text-base md:normal-case md:tracking-normal ${isLight ? "text-slate-800" : "text-slate-100"}`}
          >
            Quick Actions
          </h2>
          <p className={`mt-1 text-sm ${isLight ? "text-slate-500" : "text-blue-100/65"}`}>
            Fast routes into the most common dashboard tasks.
          </p>
        </div>
      </div>
      {/* V3e mobile fix: scroll container wrapped in relative for the
           right-edge fade affordance. Quick Actions correctly horizontal-
           scroll on mobile (Codex confirmed: not hidden, just
           undiscoverable). The fade + champagne hairline tell the user
           there's more to the right. Hidden at sm+ where the grid takes
           over. */}
      <div className="relative -mx-1 sm:mx-0">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 md:gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const iconTone = isLight
              ? actionIconTonesLight[index % actionIconTonesLight.length]
              : actionIconTones[index % actionIconTones.length];
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                className={`bd-dashboard-section bd-dashboard-section--interactive w-[min(15rem,72vw)] shrink-0 snap-start rounded-xl p-3 text-left font-medium transition-all duration-200 active:scale-[0.97] min-h-[124px] sm:min-h-[44px] sm:w-auto md:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 ${
                  actionSurfaceClasses[index % actionSurfaceClasses.length]
                } ${
                  isLight
                    ? // Pass 18 (cowork-A) — LAW Light-Mode Surface Rule fix.
                      // Replaced `inset_0_1px_0_rgba(255,255,255,0.85)` (idle)
                      // and `rgba(255,255,255,0.92)` (hover) with canonical
                      // warm-cream highlight `rgba(254,247,232,*)` per
                      // LAW_PROJECT_RULES.md § "Forbidden in light mode"
                      // item 2 ("No pure-white inset highlights — top-edge
                      // highlights must be warm cream rgba(254, 247, 232,
                      // 0.88-0.92)"). Idle 0.88 / hover 0.92 within the
                      // documented range.
                      "border-[rgba(147,197,253,0.32)] shadow-[0_10px_22px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(254,247,232,0.88),0_0_0_1px_rgba(191,219,254,0.18)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(254,247,232,0.92),0_0_0_1px_rgba(147,197,253,0.32),0_0_24px_rgba(59,130,246,0.10)] hover:-translate-y-0.5"
                    : "hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(2,6,23,0.42),inset_0_1px_0_rgba(147,197,253,0.18),inset_0_-1px_0_rgba(196,144,65,0.18),0_0_0_1px_rgba(96,165,250,0.30),0_0_28px_rgba(37,99,235,0.14),0_0_22px_rgba(196,130,45,0.16)]"
                }`}
              >
                <div
                  className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl md:mb-2.5 md:h-10 md:w-10 ${iconTone}`}
                >
                  <Icon className="h-4.5 w-4.5 md:h-5 md:w-5" />
                </div>
                <h3
                  className={`font-semibold text-sm leading-tight ${isLight ? "text-slate-800" : "text-slate-100"}`}
                >
                  {action.title}
                </h3>
                <p
                  className={`mt-1 line-clamp-2 text-[11px] leading-snug md:text-xs ${
                    isLight ? "text-slate-500" : "text-blue-100/58"
                  }`}
                >
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
        {/* Right-edge fade affordance — mobile only, hides at sm+ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:hidden"
          style={{
            background: isLight
              ? "linear-gradient(to left, rgba(244,250,254,0.96), rgba(244,250,254,0.85) 35%, transparent)"
              : "linear-gradient(to left, rgba(8,18,38,0.96), rgba(8,18,38,0.85) 35%, transparent)",
            // Aligned to locked 2026-05-03 premium gold palette (KI-066):
            // edge sheen uses corner-lamp gold (196,144,65), not legacy yellow-amber.
            boxShadow: isLight
              ? "inset 1px 0 0 rgba(196,144,65,0.22)"
              : "inset 1px 0 0 rgba(196,144,65,0.26)",
          }}
        />
      </div>
    </section>
  );
}
