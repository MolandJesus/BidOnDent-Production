import { type ActionItem, actionIconTones, actionIconTonesLight } from "./homeScreenData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export { HomeReportsList } from "./HomeReportsList";

// ============================================================================
// HomeOnboardingCard — "How BidOnDent Works" for new customers
// ============================================================================

export function HomeOnboardingCard({
  primaryColor,
  secondaryColor,
}: {
  primaryColor: string;
  secondaryColor: string;
}) {
  const stepToneClasses = [
    "bd-dashboard-section--deep",
    "bd-dashboard-section--accent-blue",
    "bd-dashboard-section--accent-cyan",
  ];
  const steps = [
    { label: "Submit a Report", detail: "Upload photos of vehicle damage" },
    { label: "Receive Bids", detail: "Local shops compete for your repair" },
    { label: "Choose & Navigate", detail: "Pick the best offer and get directions" },
  ];

  return (
    <section
      className="bd-dashboard-panel relative overflow-hidden rounded-2xl p-4 text-white sm:p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 30, 60, 0.92) 0%, rgba(10, 22, 48, 0.88) 50%, rgba(20, 40, 80, 0.85) 100%)",
      }}
    >
      {/* Royal blue atmospheric sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 80% -10%, ${primaryColor}22, transparent 50%), radial-gradient(ellipse 50% 40% at -5% 110%, ${secondaryColor}18, transparent 55%)`,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />
      <div className="relative">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.20em] text-blue-300/55">
          Getting started
        </p>
        <h2 className="mb-2 text-lg font-semibold sm:text-xl">How BidOnDent Works</h2>
        <p className="max-w-2xl text-sm text-blue-100/70">
          A quick path from first damage photo to local bids and smart map navigation.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className={`bd-dashboard-section flex items-start gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 ${stepToneClasses[i % stepToneClasses.length]}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/25 text-sm font-bold shadow-sm ring-1 ring-blue-400/30 backdrop-blur-sm">
                {i + 1}
              </div>
              <div>
                <p className="font-semibold">{step.label}</p>
                <p className="mt-0.5 text-sm leading-5 text-blue-100/70">{step.detail}</p>
              </div>
            </div>
          ))}
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
  const actionSurfaceClasses = [
    "bd-dashboard-section--accent-blue",
    "bd-dashboard-section--deep",
    "bd-dashboard-section--accent-cyan",
    "bd-dashboard-section--accent-indigo",
  ];
  if (quickActions.length === 0) return null;
  return (
    <section className="bd-dashboard-panel bd-dashboard-panel--deep rounded-2xl p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p
            className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
              isLight ? "text-slate-500" : "text-blue-100/55"
            }`}
          >
            Your Dashboard
          </p>
          <h2
            className={`text-sm font-semibold uppercase tracking-[0.18em] md:text-base md:normal-case md:tracking-normal ${isLight ? "text-slate-800" : "text-slate-100"}`}
          >
            Quick Actions
          </h2>
          <p className={`mt-1 text-sm ${isLight ? "text-slate-500" : "text-blue-100/65"}`}>
            Fast routes into the most common dashboard tasks.
          </p>
        </div>
        <span
          className={`bd-dashboard-chip shrink-0 px-2.5 py-1 text-[11px] font-medium ${
            isLight ? "bg-white/85 text-blue-700" : "border-blue-200/18 bg-white/10 text-blue-50"
          }`}
        >
          {quickActions.length} shortcuts
        </span>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 md:gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const iconTone = isLight
            ? actionIconTonesLight[index % actionIconTonesLight.length]
            : actionIconTones[index % actionIconTones.length];
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`bd-dashboard-section bd-dashboard-section--interactive w-[min(15rem,72vw)] shrink-0 snap-start rounded-xl p-3 text-left font-medium transition-all duration-200 active:scale-[0.97] min-h-[124px] sm:min-h-[44px] sm:w-auto md:p-4 ${
                actionSurfaceClasses[index % actionSurfaceClasses.length]
              } ${
                isLight
                  ? "border-[rgba(200,180,150,0.24)] shadow-[0_10px_22px_rgba(15,23,42,0.07)] hover:shadow-[0_16px_30px_rgba(15,23,42,0.10)]"
                  : ""
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
    </section>
  );
}
