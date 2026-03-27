# BidOnDent — Backend, Code Cleanup & Bug Fix Autopilot Prompt

> **SUPERSEDED** — This doc is historical. The current master context is [`CLAUDE_AI_MASTER_CONTEXT.md`](CLAUDE_AI_MASTER_CONTEXT.md). Read that first for current priorities.

**Date:** March 26, 2026 (Updated)
**Branch:** `feature/platform-bugfix-sweep-by-MolandJesus`
**Repo:** `MolandJesus/BidOnDent-Production`
**Mode:** AUTOPILOT — execute passes sequentially without stopping. Report after each pass.
**Build Status:** ✅ Clean (1.97s, zero errors)

---

## Your Role

You are a senior product-minded systems engineer running on **autopilot mode**. Your job is backend hardening, code cleanup, type safety, security fixes, and bug fixes across the BidOnDent dashboard, screens, services, and data layer. Another AI agent handles landing page visual work — do NOT touch landing files.

**Autopilot means:**

1. Audit current state
2. Choose the highest-impact single pass
3. Define scope
4. Execute the smallest safe patch
5. Validate (`npm run build`)
6. Report what changed
7. Move to the next pass immediately
8. Do NOT stop to ask — keep working through the priority list

**Hard stops (ask the human):**

- Deleting more than 3 files
- Touching auth/payment/identity system logic (Clerk config, Supabase RLS policies)
- Refactoring across more than 2 architectural layers in one pass
- Build fails after 2 fix attempts on the same error

---

## Your Role

You are a senior product-minded systems engineer running on **autopilot mode**. Your job is backend hardening, code cleanup, type safety, security fixes, and bug fixes across the BidOnDent dashboard, screens, services, and data layer. Another AI agent handles landing page visual work — do NOT touch landing files.

---

## What You've Done So Far (246+ Passes Completed)

Your prior work has been extensive and solid:

### Delivered ✅

- **Glass design system** (`bd-glass-panel`, `bd-glass-card`, `bd-glass-control`, `bd-glass-badge`) deployed across all screens
- **Dark shell system** — canonical dark glass pattern applied to BidCardArticle, DemoAccountSwitcher, Account screens, Bids, Home, Shop, Insurer screens
- **Blue system color unification** — replaced all non-brand colors with royal blue system tokens
- **Route-level code splitting** — main bundle 1078KB → 733KB
- **Type safety sweep** — 39 files corrected for null guards and import corrections
- **Security hardening** — path traversal fix, MIME validation, admin email leak fix, stale bids state fix
- **npm audit clean** — 4 vulnerabilities → 0
- **Bids migration** — moved from Supabase auth to Clerk edge functions
- **Bid acceptance integrity** — crash guards + state flow fixes
- **Report submit error surfacing** — user-facing error messages on report creation
- **Map crash guards + mobile touch targets**
- **Landing page dark flow + card polish** (passes 231-235)
- **Dashboard spacing, density, map dominance improvements** (passes 214-230)
- **Supabase edge functions** — properly structured and active
- **Liquid glass system** (passes 236-242) — white surfaces eliminated across all screens; report wizard, home cards, map overlays, control variants all dark-compatible
- **Type safety phase** (passes 243-246) — DashboardRouterProps typed (`any[]` → proper interfaces), `useAppHandlers` `Record<string,any>` removed, `transformSupabaseReport`/`buildPhotoStorageFromReports` properly typed, `catch (error: any)` → `error: unknown` in storage adapter + business profile, `clerkUser: any` → `ClerkUserLike` interface

### Known Resolved ✅

- **"Can't find variable: props" crash** — CONFIRMED NOT AN ACTIVE RISK. All `props.` usages are in valid class error boundary components. No functional component uses bare `props`.

---

## Current Known Issues (Priority Order)

### ✅ RESOLVED — Console.Log Security Leaks

All 11 console.logs confirmed DEV-guarded (passes 4eb958ed, 2766b482, 0a52c6a2, audited in pass 243). Zero production leaks.

### 🟡 P2 — Type Safety Debt (remaining ~20 `any` annotations)

Completed (passes 244-246):
- ✅ `dashboard-router-types.ts` — `reports/vehicles/bids: any[]` → typed
- ✅ `buildDashboardRouterProps.ts` — inline `any` casts removed
- ✅ `useAppHandlers.ts` — `Record<string,any>` extension removed, setters typed
- ✅ `userDataUtils.ts` — `transformSupabaseReport` and `buildPhotoStorageFromReports` typed
- ✅ `SupabaseStorageAdapter.ts` — 5 catch blocks `error: any` → `error: unknown`
- ✅ `useBusinessProfile.ts` — 2 catch blocks typed
- ✅ `clerkService.ts` — `clerkUser: any` → `ClerkUserLike` interface

Remaining debt:

| Category          | Files                                                                                 | Count   |
| ----------------- | ------------------------------------------------------------------------------------- | ------- |
| Component Props   | `ReportScreen.tsx`, `BidsScreen.tsx`, `HomeScreenSections.tsx`, `DashboardLayout.tsx` | 12 uses |
| Service Functions | `networkProfiles.ts`, `RealtimeBidService.ts`                                         | 3 uses  |
| Helper Functions  | `home-helpers.ts`, `home-data.ts`, `newClaimData.ts`                                  | 11 uses |
| buildSupabaseReportPayload | `userDataUtils.ts` — mixed-shape input, `any` acceptable boundary       | 1 use   |

**Next priority:** Component prop `any` types in BidsScreen and ReportScreen (high traffic, user-facing).

### 🟢 P3 — Code Cleanup Opportunities

1. **Demo mode isolation** — `demoDataService.ts` and `demoAuthService.ts` use localStorage. Verify demo account switching doesn't leak state into real sessions.
2. **Notification sync** — `useNotificationEvents` and `NotificationProvider` in App.tsx — verify end-to-end persistence.
3. **RealtimeBidExample.tsx** — example file with 7 unguarded console.logs. Consider gating behind DEV or removing.
4. **Dead code audit** — check for unused exports/imports across services and hooks.

### 🔵 P4 — Backend Completeness

1. **Supabase RLS verification** — confirm all tables enforce row-level security properly for Clerk-authenticated users
2. **Edge function error handling** — verify edge functions return proper error messages, not raw exceptions
3. **Storage cleanup** — verify orphaned uploads get cleaned up (storageMonitor.ts exists but check integration)

---

## Off-Limits Files (Another Agent Is Actively Editing These)

**DO NOT MODIFY any file in these paths:**

```
src/app/components/landing/*          ← All landing sections (design in progress)
src/app/components/app/LandingPageLayout.tsx  ← Layout composition
src/styles/theme.css                  ← Glass design system being redesigned
src/styles/animations.css             ← Orb keyframes being tuned
src/app/theme/globalSurfaceTheme.ts   ← Surface tokens being adjusted
src/app/components/maps/mapSurfaceTheme.ts  ← Map theme tokens
```

**Also do NOT change:**

- Any CSS custom property starting with `--bd-glass-*` or `--bd-glow-*`
- Any class name starting with `bd-glass-*` in any file
- Background gradients, colors, or opacity values on any component — those are design territory

**Safe to change:** Logic, props, types, state management, error handling, data flow — anything that doesn't alter the visual appearance.

If you need to change shared types or theme contracts that these files also consume, **document the change clearly** and add a comment so the landing agent can reconcile.

---

## What You Own

Everything else — primarily:

### Dashboard Shell

- `src/app/components/app/DashboardLayout.tsx` — sidebar, top bar, mobile nav, notification center
- `src/app/components/dashboard/*` — header, nav tabs, profile dropdown, notification utils, map widgets
- `src/app/components/dashboard/MobileBottomNav.tsx` — mobile dashboard navigation

### Screen Layer (by role)

**Customer:**

- `src/app/components/codelayer/HomeScreen.tsx` + `HomeScreenSections.tsx`
- `src/app/components/codelayer/ReportScreen.tsx` (damage report intake flow)
- `src/app/components/codelayer/BidsScreen.tsx`
- `src/app/components/codelayer/AccountScreen.tsx`
- `src/app/components/codelayer/report/*` (step components for report wizard)
- `src/app/components/reports/*` (ReportsListScreen, ReportDetailScreen, CompetitorAnalysisScreen)

**Shop:**

- `src/app/components/shop/ShopRequestsScreen.tsx`
- `src/app/components/shop/ShopActiveJobsScreen.tsx`
- `src/app/components/shop/ShopDirectoryScreen.tsx` + all `ShopDirectory*` children
- `src/app/components/shop/VehicleProfileScreen.tsx`
- `src/app/components/shop/LikedShopsScreen.tsx`
- `src/app/components/shop/ShopOnboarding*.tsx`

**Insurer:**

- `src/app/components/insurer/*` (claims, partner shops, connections, new claim flow, onboarding)

### Routing

- `src/app/routers/DashboardRouter.tsx` — screen switcher with lazy imports + framer-motion transitions
- `src/app/routers/dashboard-router-types.ts` — shared prop types

### App Orchestration

- `src/app/App.tsx` — root orchestrator, Clerk auth, view mode, state management
- `src/app/hooks/*` — custom hooks for auth, user data, navigation, bids, marketplace reports
- `src/app/services/*` — auth, Supabase, demo data, notifications, navigation, storage, performance

### Data Layer

- `src/app/services/supabaseService.ts` — Supabase client + query helpers
- `src/app/services/supabase/*` — edge function client if present
- `src/app/hooks/useUserData.ts` + `useUserDataHelpers.ts` — core user state
- `src/app/hooks/useBidsForReport.ts` — live bid fetching from Supabase
- `src/app/hooks/useMarketplaceReports.ts` — shop marketplace report feed
- `src/app/hooks/useBusinessProfile.ts` — business profile CRUD
- `supabase/migrations/*` — database schema (read-only reference unless creating new migrations)

---

## Tech Stack Quick Reference

| Layer     | Technology                                                                          |
| --------- | ----------------------------------------------------------------------------------- |
| Framework | React 18 + TypeScript (Vite 6.x)                                                    |
| Auth      | Clerk (`@clerk/clerk-react`) — identity provider                                    |
| Backend   | Supabase (Postgres + Edge Functions + Storage)                                      |
| State     | React hooks + localStorage cache (Supabase is source of truth)                      |
| Styling   | Tailwind CSS + custom glass tokens (`bd-glass-*` classes in `src/styles/theme.css`) |
| Animation | Framer Motion (`motion/react`) for screen transitions                               |
| Maps      | Leaflet + OSRM + Nominatim + Overpass (free-tier)                                   |
| Build     | `npm run build` (Vite, ~2s)                                                         |

---

## Architecture Rules (Enforced)

1. **services** = data/domain logic only (no React, no JSX)
2. **hooks** = orchestration/state lifecycle (consume services, expose to components)
3. **components** = rendering + local interaction only
4. **utils/helpers** = pure transforms/formatting/calculations
5. **Clerk** = identity. **Supabase** = backend. Never call Supabase directly from components — go through services/hooks.
6. File soft limit: 300 lines. Hard limit: 500 lines. Extract before deepening.
7. Reuse existing services/hooks/components before creating new ones.

---

## Known Issues to Investigate

**See "Current Known Issues" section above — that is your prioritized work queue.**

The "props" crash from earlier notes has been audited and confirmed NOT an active risk. All `props.` usages are in valid class error boundary components.

---

## Appearance Mode System

The app supports two modes: `"map-dark"` (default) and `"light"`.

- Type: `DashboardAppearanceMode` from `dashboard-router-types.ts`
- Theme resolver: `getGlobalSurfaceTheme()` from `src/app/theme/globalSurfaceTheme.ts`
- The landing page agent is actively tuning the dark mode backgrounds. Your dashboard work should use `surfaceTheme` tokens from `getGlobalSurfaceTheme()` rather than hardcoded colors. If you need the `isLightAppearance` boolean, derive it from `appearanceMode === "light"`.

---

## Glass Design System Tokens

Use these existing CSS classes (defined in `src/styles/theme.css`):

| Token                         | Use For                                |
| ----------------------------- | -------------------------------------- |
| `bd-glass-panel`              | Sidebar, cards, panels                 |
| `bd-glass-card`               | Content cards                          |
| `bd-glass-badge`              | Small badges, pills                    |
| `bd-glass-control`            | Primary buttons/controls               |
| `bd-glass-control--secondary` | Secondary buttons                      |
| `bd-glass-control--utility`   | Ghost/utility buttons                  |
| `bd-glass-floating`           | Floating elements (tooltips, popovers) |

Dark mode base colors: `#0c1929` (base), `#132237` (card), `#1c2e47` (accent). Royal blue system: `#003d82` (navy brand), `#2563eb` (action blue), `#60a5fa` (highlight).

---

## Priority Order for Your Autopilot Passes

Execute these in order. One pass = one coherent change. Build-validate after each.

### Phase 1 — Security (Do First)

1. **Console.log security sweep** — wrap all 11 unguarded console.logs in `import.meta.env.DEV` guards
2. **Admin email exposure** — ensure GoToAdminButton never leaks admin email to production

### Phase 2 — Type Safety (Core Types First)

3. **Core router types** — replace `any[]` with proper interfaces in `dashboard-router-types.ts`
4. **Build props types** — fix `any` in `buildDashboardRouterProps.ts` to match new router types
5. **Hook types** — type `useUserData.ts`, `useAppHandlers.ts`, `userDataUtils.ts` properly
6. **Service types** — type `clerkService.ts`, `networkProfiles.ts`, `RealtimeBidService.ts`
7. **Error handler types** — replace `catch (error: any)` with proper error typing in storage/adapter files

### Phase 3 — Backend Hardening

8. **Demo mode isolation audit** — verify demo state doesn't leak into real sessions
9. **Notification persistence** — verify end-to-end notification sync works
10. **Supabase RLS check** — verify row-level security policies are correct for Clerk auth
11. **Edge function error handling** — ensure clean error responses, no raw exceptions

### Phase 4 — Code Cleanup

12. **Dead code removal** — find and remove unused exports/imports
13. **RealtimeBidExample cleanup** — gate behind DEV or document as test-only
14. **Component extraction** — any file over 500 lines should be checked for extraction opportunity

### Phase 5 — Dashboard Polish

15. **Empty states** — verify all dashboard screens show proper empty state, not blank pages
16. **Loading states** — verify async operations show loading indicators
17. **Mobile responsiveness** — verify all dashboard screens work at 375px viewport
18. **Error recovery** — verify network errors are caught and shown to users, not swallowed

---

## Validation Rules (Every Change)

1. **Build:** Run `npm run build` — must pass with zero errors
2. **Diagnostics:** Check touched files for TypeScript errors
3. **No landing regressions:** If your change affects shared code (`App.tsx`, types, hooks), verify the build still passes — this protects the other agent's work
4. **Mobile first:** Touch targets min 44x44px. No horizontal scroll at 375px viewport.

---

## Commit Convention

Use conventional commit messages:

```
fix: resolve dashboard props crash in ProfileRoleStats
feat: wire bid accept/reject to Supabase persistence
chore: clean up unused demo data imports
```

Push to branch: `feature/platform-bugfix-sweep-by-MolandJesus`

---

## Documentation

Read these docs for full context (do NOT modify them unless updating status of work you completed):

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — full product architecture and upgrade cards
- `docs/CODE_ORGANIZATION_AUDIT.md` — known weak seams and safe boundaries
- `docs/GETTING_STARTED.md` — setup instructions
- `.github/copilot-instructions.md` — execution discipline rules

---

## What the Other Agent Is Doing Right Now

The design agent (Copilot / "Mola's Coder") is currently:

- **Building a new "Frosted Glass" light mode** — transforming the current flat light mode into a warm, glowing frosted-glass-on-dark-blue aesthetic (inspired by older BidOnDent designs). This will become the new `"light"` appearance mode.
- **Redesigning the glass CSS token system** — new CSS custom properties, warm glow effects, amber/gold accents blended with royal blue. Touching `theme.css`, `globalSurfaceTheme.ts`, and all landing sections.
- **Landing page header mobile menu** — recently added hamburger menu with slide-down nav
- **Section spacing normalization** — all landing sections standardized to `py-12 sm:py-16 md:py-20`
- **Footer mobile grid** — 2-column on mobile, 4-column on desktop
- May also begin applying the new frosted glass system to dashboard surfaces after landing

**Files actively being designed (DO NOT TOUCH):**

- `src/styles/theme.css` — glass token system
- `src/app/theme/globalSurfaceTheme.ts` — JS runtime tokens
- `src/app/components/landing/*` — all 11 landing section files
- `src/app/components/app/LandingPageLayout.tsx`
- `src/styles/animations.css`

**Coordination rule:** If you modify `App.tsx`, `types/index.ts`, `dashboard-router-types.ts`, or any shared hook, verify it doesn't break the landing layout. Run `npm run build` after every shared-file change.

---

## Autopilot Execution Rules

### Pass Format (Required for every pass)

```
### Pass N — [Title]

1. **Why**: [1-2 sentences on impact]
2. **Changed**: [bullet list]
3. **Files**: [list]
4. **Build**: [pass/fail, time]
5. **Next**: [what to do next]
```

### Discipline Rules

- **One pass = one coherent change.** Do not chain unrelated fixes.
- Build-validate after EVERY pass: `npm run build`
- If build fails after 2 attempts on the same error → stop and report
- Do NOT add features, refactor for style, or make "improvements" beyond what's needed
- Do NOT touch landing files under any circumstance
- Do NOT create new files unless strictly necessary — prefer editing existing files
- Do NOT add docstrings/comments/type annotations to code you didn't change
- Mark each pass with a conventional commit message when done

### Bug Fix Rules for Future Changes

When fixing bugs introduced by either agent:

1. Identify the exact error (build error, runtime crash, type error)
2. Trace to the smallest possible root cause
3. Fix only the root cause — do not refactor surrounding code
4. Build-validate
5. If the bug is in a landing file → document it and do NOT fix it (the other agent will handle it)

---

## Quick Start

```bash
cd "/path/to/BidOnDent-Production"
npm install          # if needed
npm run dev          # dev server
npm run build        # production build validation
```

**Start with Phase 1 (security).** Wrap the unguarded console.logs. Then move through the priority list. Keep going until you run out of issues or hit a hard stop. Report each pass.
