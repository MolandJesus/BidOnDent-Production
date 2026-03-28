# BidOnDent — AI Handoff Master Prompt

**Last updated:** March 28, 2026
**Status:** Historical superseded prompt

> **SUPERSEDED** — This doc is historical. The current master context is [`CLAUDE_AI_MASTER_CONTEXT.md`](CLAUDE_AI_MASTER_CONTEXT.md). Read that first.

> **Date**: March 26, 2026
> **Author**: GitHub Copilot (Claude Opus 4.6) — handing off to next AI agent
> **Repository**: `MolandJesus/BidOnDent-Production`
> **URL**: https://github.com/MolandJesus/BidOnDent-Production

---

## 1. What Is BidOnDent?

BidOnDent is a **map-first marketplace for automotive dent repair**. Vehicle owners submit damage reports (with photos, location, and urgency). Body shops see those reports on a map and bid on them. Insurers can partner and track claims. The core product loop is:

```
Report damage → Pin on map → Shops see & bid → Owner selects shop → Repair happens
```

**Tech stack**: React 18 + TypeScript, Vite 6.4.1, Tailwind CSS, Supabase (backend/auth/storage), Clerk (identity), MapLibre GL JS (maps), Radix UI primitives, deployed via Vercel-compatible static build.

---

## 2. What Has Been Done (Chat History Summary)

### A. Branch Reorganization (Completed — March 25)

- The old `main` branch (stale, 53+ commits behind) was **renamed to `legacy`** on GitHub.
- `feature/platform-bugfix-sweep-by-MolandJesus` was **set as the new GitHub default branch**.
- **All obsolete remote branches were deleted**:
  - `BidOnDent-Horizon-Stable`
  - `BidOnDent-Production-Stable`
  - `feature/bidondent-horizon`
  - `horizon/bidondent-map-final`
  - `milestone/map-navigation-productization`
- Local branches were pruned to match. Only two branches remain:
  - `feature/platform-bugfix-sweep-by-MolandJesus` ← **active default**
  - `legacy` ← archived reference of old main

### B. Appearance Mode & Contrast Sweep (Completed — March 26)

Major stabilization of the dark/light appearance system:

- **Removed OS `prefers-color-scheme` live-override** from `App.tsx`. Manual in-app mode selection is now authoritative. First-run still falls back to OS preference via `readSavedAppearanceMode()`.
- **Cross-tab sync** preserved via `storage` event listener.
- **Dark-surface contrast sweep** across 12+ components — all `isLightAppearance` text ternaries updated from dark-on-light colors (e.g., `text-slate-900`) to light-on-dark colors (e.g., `text-slate-100`) because the app uses a frosted-dark surface even in "light" mode.
- **Affected components**: HomeScreen, HomeScreenSections, MobileBottomNav, ReportHeader, StepComplete, StepDamageArea, StepDescription, StepPhotos, StepServiceLocation, StepVehicleInfo, SettingsModal.
- **Landing page components** updated for surface theme consistency: HeroSection, HowItWorksSection, WhoWeServeSection, BenefitsSection, CTASection, FooterSection, BusinessInquirySection, BusinessInquiryShopForm, BusinessInquiryInsurerForm, AboutOpportunitySection, OperatingRegionsSection, TrustStatsSection, LandingPageHeader, CoverageBrowseMapOverlays, MobileMapBottomSheet, MapSurfaceHeaderBadges, ServiceCoverageMap.

### C. Dashboard Header & Dropdown Redesign (Completed — March 26)

- **DashboardLayout.tsx**: Notification trigger made circular (`w-11 h-11 rounded-full`). Account avatar enlarged (`w-10 h-10`). Profile dropdown widened to `w-60` with icons on all menu items (Home, Settings, User, LogOut via Lucide).
- **NotificationCenter.tsx**: Mobile-aware positioning using `max-md:fixed max-md:left-2 max-md:right-2` with safe-area-aware top offset. Width reduced to `min(24rem, calc(100vw-1rem))`. Content spacing tightened. Z-index raised to `z-[70]`.

### D. Repository State

- **Branch**: `feature/platform-bugfix-sweep-by-MolandJesus` (default)
- **Build status**: Clean. `npm run build` passes (Vite 6.4.1, ~2.15s, 0 errors).
- **Diagnostics**: 0 errors across all files.
- **Spellcheck**: Clean on all touched files.
- **Build warnings** (non-blocking):
  - `index-*.js` chunk ~783 kB — needs code-splitting attention later.
  - Dynamic vs static import overlap on `bids.ts` and `reports.ts`.

### E. Development History (Passes 130–180+)

The codebase has gone through **180+ structured passes** covering:

- **Glass design system**: Dark mode, royal blue accents, liquid glass overlays (Apple Maps aesthetic). Applied across all cards, modals, admin panels, reports, bids, shop directory, onboarding, legal pages.
- **Map productization**: Reports visible on map with urgency-colored markers. Tap report/shop for detail panel. Dashboard rebuilt as full-screen map with floating panels.
- **Report wizard**: Glass overhaul, validation, submitting state, error handling, premium completion flow.
- **Bid system**: Real Supabase integration, removed mock data, status progression on bid acceptance.
- **Routing**: Hash-based routing for legal/standalone pages.
- **Hero/landing**: Redesign with warm rounded corners, button sizing, grouped controls.

### F. Documentation

All major docs are maintained:

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — primary execution framework
- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — strategic map law
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — delivery reality tracker
- `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` — historical pass archive
- `docs/BIDONDENT_FINISHING_MASTER_PLAN.md` — finishing roadmap

---

## 3. Current Architecture

```
src/
  main.tsx                          # App entry
  app/
    App.tsx                         # Root component, appearance mode state
    components/
      admin/                        # Admin panels
      app/                          # Shell: DashboardLayout, LandingPageLayout
      auth/                         # Auth flows (Clerk)
      codelayer/                    # Report/account extraction layer
      dashboard/                    # Dashboard views, NotificationCenter, MobileBottomNav
      demo/                         # Demo/preview components
      figma/                        # Figma design tokens
      landing/                      # Landing page sections (Hero, HowItWorks, WhoWeServe, etc.)
      legal/                        # Terms, Privacy, About
      maps/                         # MapReportMarkers, map overlays, ServiceCoverageMap
      reports/                      # Report detail, reports list, wizard
      ...
    config/                         # App config
    constants/                      # Shared constants
    features/                       # Feature modules
    hooks/                          # Custom hooks (useMarketplaceReports, etc.)
    routers/                        # DashboardRouter, route definitions
    services/
      supabase/                     # reports.ts, workflow.ts, bids, profiles
      supabaseService.ts            # Aggregated service barrel
    theme/
      globalSurfaceTheme.ts         # Surface theme utilities
    types/                          # TypeScript types
    utils/                          # Helpers, transforms
  styles/
    theme.css                       # CSS custom properties for theme
    animations.css                  # Animation keyframes
    fonts.css                       # Font imports
    tailwind.css                    # Tailwind directives
    index.css                       # CSS entry
supabase/
  functions/                        # Edge functions
  migrations/                       # 11+ migration files
```

### Architecture Rules (from copilot-instructions.md)

- **services** = data/domain logic only
- **hooks** = orchestration/state lifecycle
- **components** = rendering + local interaction only
- **utils/helpers** = transforms/formatting/calculations
- **Clerk** = identity, **Supabase** = backend (via edge functions, never direct in components)
- File soft limit: 300 lines. Hard limit: 500 lines.

### Appearance Mode System

- Type: `DashboardAppearanceMode` = `"light"` | `"map-dark"`
- Storage: localStorage via `APPEARANCE_STORAGE_KEY`
- Cross-tab sync: `storage` event listener in `App.tsx`
- First-run fallback: `readSavedAppearanceMode()` checks OS `prefers-color-scheme`
- Manual selection is authoritative — no live OS override listener
- Surface: Both modes use a frosted-dark surface. "Light" mode has lighter glass but still dark text backgrounds. Text colors should always be light (slate-100/200) in both modes.

---

## 4. Design System

Target aesthetic: **Apple Maps-inspired**

- Dark mode with frosted glass surfaces
- Royal blue accents (`#1d4ed8` family)
- Liquid glass overlays (`bd-glass-card`, `bd-glass-floating`, `bd-glass-control--utility`)
- Map must feel immersive — overlays sit ON the map, not around it
- Touch targets: minimum 44x44px
- Mobile-first (375px minimum viewport)
- No horizontal scroll at any breakpoint
- Dashboard header: circular icon triggers, icons in dropdown menus

---

## 5. Key Commands

| Command                                                            | Purpose                   |
| ------------------------------------------------------------------ | ------------------------- |
| `npm run dev`                                                      | Start Vite dev server     |
| `npm run build`                                                    | Production build (~2.15s) |
| `npx cspell lint "src/**/*.{ts,tsx}" "docs/**/*.md" --no-progress` | Spellcheck                |
| Do NOT use `npx tsc --noEmit`                                      | Resolves wrong package    |

---

## 6. What Needs To Happen Next

### Immediate Priorities

1. **Map-first product loop completion** — Ensure the report → map → shop → bid → action loop is fully functional end-to-end with real Supabase data.
2. **Form control light-mode values** — Some input backgrounds still use legacy `white`/`bg-white` that clash with the dark surface. Needs sweep of form inputs, selects, textareas.
3. **Code-splitting** — The main JS bundle is ~783 kB. Needs dynamic imports for route-level splitting.
4. **Mobile 375px viewport verification** — Systematic check of all dashboard screens at 375px width.
5. **Landing page header** — Dashboard button could be more compact with home icon (user requested, deferred to focus on dropdowns).

### Secondary Priorities

6. **Dependabot vulnerabilities** — GitHub reports vulnerabilities on the default branch.
7. **Shop onboarding flow** — Complete the shop registration and profile setup.
8. **Insurer partnership page** — Finalize integration with insurer workflow.
9. **Real-time bid notifications** — Supabase realtime subscriptions for bid updates.
10. **Image optimization** — Multiple PNG assets are 2–14MB each in the build output.

---

## 7. Hard Rules for Any AI Working on This Repo

1. **Read `docs/BIDONDENT_PRODUCT_BRAIN.md` first** — it's the execution framework.
2. **Read `.github/copilot-instructions.md`** — it contains all architecture rules, design rules, quality loop, problem taxonomy (P0–P7), and anti-drift enforcement.
3. **Every pass must follow the Single-Pass Discipline** — one coherent change per pass, buildable and testable on its own.
4. **Run `npm run build` after every pass** — zero errors required.
5. **Map is the primary product surface** — every pass should strengthen the report → map → shop → action loop.
6. **Mobile-first** — validate 375px minimum viewport for all UI changes.
7. **Do not drift into polish** — no random UI tweaks, typography changes, or widget additions unless tied to map experience or product function.
8. **Stop and ask human** if touching auth, payment, identity, or deleting >3 files.
9. **Appearance mode** — Both modes use dark surfaces. Text should be light (slate-100/200). Do not use dark text colors (slate-900/800) for either mode.

---

## 8. File Quick Reference

| File                                                  | Purpose                                                |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `.github/copilot-instructions.md`                     | AI execution rules, architecture, design, quality loop |
| `docs/BIDONDENT_PRODUCT_BRAIN.md`                     | Product strategy and execution framework               |
| `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`        | Map system strategic plan                              |
| `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`            | Map delivery progress tracker                          |
| `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`          | Historical pass archive (not active tracker)           |
| `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`             | Finishing roadmap                                      |
| `src/app/App.tsx`                                     | Root component, appearance mode state                  |
| `src/app/components/app/DashboardLayout.tsx`          | Dashboard shell, header, sidebar                       |
| `src/app/components/dashboard/NotificationCenter.tsx` | Notification dropdown (mobile-aware)                   |
| `src/app/routers/DashboardRouter.tsx`                 | Main routing                                           |
| `src/app/components/maps/`                            | Map components                                         |
| `src/app/services/supabase/`                          | All Supabase service modules                           |
| `src/app/hooks/`                                      | Custom React hooks                                     |
| `src/app/theme/globalSurfaceTheme.ts`                 | Surface theme utilities                                |
| `src/styles/theme.css`                                | CSS custom properties                                  |
| `vite.config.ts`                                      | Build config with manual chunks                        |

---

## 9. Known Risks & Technical Debt

- **Bundle size**: `index-*.js` at ~783 kB — functional but should be split.
- **Image assets**: Several PNGs are 2–14 MB. Need WebP/AVIF conversion or CDN loading.
- **Dynamic/static import overlap**: `bids.ts` and `reports.ts` are both dynamically and statically imported, preventing chunk separation.
- **Form controls**: Some inputs still use `bg-white` / light backgrounds that clash with dark surfaces.
- **Dependabot**: Unresolved GitHub security advisories on default branch.

---

_This prompt was generated on March 26, 2026. The repo builds successfully (0 errors), spellcheck is clean, and diagnostics show 0 problems. Ready for continued development._
