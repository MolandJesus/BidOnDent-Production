# BidOnDent — AI Handoff Master Prompt

> **Date**: March 25, 2026
> **Author**: GitHub Copilot (Claude Opus 4.6) — handing off to next AI agent
> **Repository**: `MolandJesus/BidOnDent-Production`
> **URL**: https://github.com/MolandJesus/BidOnDent-Production

---

## 1. What Is BidOnDent?

BidOnDent is a **map-first marketplace for automotive dent repair**. Vehicle owners submit damage reports (with photos, location, and urgency). Body shops see those reports on a map and bid on them. Insurers can partner and track claims. The core product loop is:

```
Report damage → Pin on map → Shops see & bid → Owner selects shop → Repair happens
```

**Tech stack**: React 18 + TypeScript, Vite, Tailwind CSS, Supabase (backend/auth/storage), Clerk (identity), MapLibre GL JS (maps), Radix UI primitives, deployed via Vercel-compatible static build.

---

## 2. What Has Been Done (Chat History Summary)

### A. Branch Reorganization (Completed)

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

### B. Repository State

- **83 total commits** across all branches.
- **Latest commit**: `e757e06c` — "Update docs to reference new default branch"
- **Build status**: Clean. `npm run build` passes (Vite, ~1.9s, 0 errors).
- **Working tree**: Clean, nothing uncommitted.
- **Build warnings** (non-blocking):
  - `index-*.js` chunk >1000 kB — needs code-splitting attention later.
  - Dynamic vs static import overlap on `reports.ts` and `workflow.ts`.

### C. Development History (Passes 130–180+)

The codebase has gone through **180+ structured passes** covering:

- **Glass design system**: Dark mode, royal blue accents, liquid glass overlays (Apple Maps aesthetic). Applied across all cards, modals, admin panels, reports, bids, shop directory, onboarding, legal pages.
- **Map productization**: Reports visible on map with urgency-colored markers. Tap report/shop for detail panel. Dashboard rebuilt as full-screen map with floating panels.
- **Report wizard**: Glass overhaul, validation, submitting state, error handling, premium completion flow.
- **Bid system**: Real Supabase integration, removed mock data, status progression on bid acceptance.
- **Routing**: Hash-based routing for legal/standalone pages.
- **Hero/landing**: Redesign with warm rounded corners, button sizing, grouped controls.

### D. Documentation Updates

All major docs are maintained and current:

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — primary execution framework
- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — strategic map law
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — delivery reality tracker
- `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` — pass-by-pass progress
- `docs/BIDONDENT_FINISHING_MASTER_PLAN.md` — finishing roadmap

---

## 3. Current Architecture

```
src/
  main.tsx                          # App entry
  app/
    App.tsx                         # Root component
    components/
      admin/                        # Admin panels
      app/                          # Shell: DashboardLayout, etc.
      auth/                         # Auth flows (Clerk)
      codelayer/                    # Report/account extraction layer
      dashboard/                    # Dashboard views
      demo/                         # Demo/preview components
      figma/                        # Figma design tokens
      landing/                      # Landing page sections (Hero, HowItWorks, WhoWeServe)
      legal/                        # Terms, Privacy, About
      maps/                         # MapReportMarkers, map overlays
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
    theme/                          # Theme config
    types/                          # TypeScript types
    utils/                          # Helpers, transforms
  styles/                           # Global CSS (animations, fonts, tailwind, theme)
supabase/
  functions/                        # Edge functions
  migrations/                       # 10+ migration files
```

### Architecture Rules (from copilot-instructions.md)

- **services** = data/domain logic only
- **hooks** = orchestration/state lifecycle
- **components** = rendering + local interaction only
- **utils/helpers** = transforms/formatting/calculations
- **Clerk** = identity, **Supabase** = backend (via edge functions, never direct in components)
- File soft limit: 300 lines. Hard limit: 500 lines.

---

## 4. Design System

Target aesthetic: **Apple Maps-inspired**

- Dark mode
- Royal blue accents (`#1d4ed8` family)
- Liquid glass overlays (`bd-glass-card` pattern)
- Map must feel immersive — overlays sit ON the map, not around it
- Touch targets: minimum 44x44px
- Mobile-first (375px minimum viewport)
- No horizontal scroll at any breakpoint

---

## 5. Key Commands

| Command                                                            | Purpose                  |
| ------------------------------------------------------------------ | ------------------------ |
| `npm run dev`                                                      | Start Vite dev server    |
| `npm run build`                                                    | Production build (~1.9s) |
| `npx cspell lint "src/**/*.{ts,tsx}" "docs/**/*.md" --no-progress` | Spellcheck               |
| Do NOT use `npx tsc --noEmit`                                      | Resolves wrong package   |

---

## 6. What Needs To Happen Next

The branch reorg and cleanup phase is **complete**. The next phase is **building the site and integrating design**. Priority areas per the product directives:

### Immediate Priorities

1. **Map-first product loop completion** — Ensure the report → map → shop → bid → action loop is fully functional end-to-end with real Supabase data.
2. **Landing page polish** — Hero, HowItWorks, WhoWeServe sections need final mobile/desktop validation and design alignment.
3. **Code-splitting** — The main JS bundle is >1MB. Needs dynamic imports for route-level splitting.
4. **Dependabot vulnerabilities** — GitHub reports 7 vulnerabilities (4 high, 1 moderate, 2 low) on the default branch.

### Secondary Priorities

5. **Shop onboarding flow** — Complete the shop registration and profile setup.
6. **Insurer partnership page** — Finalize integration with insurer workflow.
7. **Real-time bid notifications** — Supabase realtime subscriptions for bid updates.
8. **Image optimization** — Multiple PNG assets are 2–14MB each in the build output.

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

---

## 8. File Quick Reference

| File                                           | Purpose                                                |
| ---------------------------------------------- | ------------------------------------------------------ |
| `.github/copilot-instructions.md`              | AI execution rules, architecture, design, quality loop |
| `docs/BIDONDENT_PRODUCT_BRAIN.md`              | Product strategy and execution framework               |
| `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` | Map system strategic plan                              |
| `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`     | Map delivery progress tracker                          |
| `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`   | Pass-by-pass build log                                 |
| `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`      | Finishing roadmap                                      |
| `src/app/App.tsx`                              | Root React component                                   |
| `src/app/routers/DashboardRouter.tsx`          | Main routing                                           |
| `src/app/components/maps/`                     | Map components                                         |
| `src/app/services/supabase/`                   | All Supabase service modules                           |
| `src/app/hooks/`                               | Custom React hooks                                     |
| `vite.config.ts`                               | Build config with manual chunks                        |

---

_This prompt was generated on March 25, 2026. The repo is clean, builds successfully, and is ready for the next phase of development._
