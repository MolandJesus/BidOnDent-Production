# BidOnDent — Dual AI Coordination Prompt

> **SUPERSEDED** — Dual AI coordination is no longer in use. The current master context is [`CLAUDE_AI_MASTER_CONTEXT.md`](CLAUDE_AI_MASTER_CONTEXT.md).

**Created:** 2026-03-25
**Context:** Passes 1–214 complete. Two AI agents now work the codebase concurrently.  
**Branch:** `feature/platform-bugfix-sweep-by-MolandJesus`

---

## The Two Roles

### REFINEMENT AI (Mola's Coder — this agent)

**Focus:** Polish, fixes, design consistency, dark/light mode rollout, bug repair, doc alignment.  
**Does NOT:** Build new features, add new screens, create new database tables, add new routes, or expand product scope.

### MAIN BUILD AI (new agent)

**Focus:** Heavy feature construction, new screen wiring, persistence chains, Supabase integration, product loop completion.  
**Does NOT:** Restyle existing screens, fix contrast issues, roll out appearance mode, or do design polish sweeps.

---

## Why This Split

214 passes have been completed. The codebase has:

- Strong architectural foundation
- Partial dark/light mode coverage (19% of surfaces wired)
- Multiple design inconsistencies accumulated over rapid feature passes
- Known bugs in prop threading and visual state
- Unwired screens that need feature-level construction

One agent doing both creates scope creep and slow progress. Splitting into "refine what exists" and "build what's next" allows parallel momentum.

---

## REFINEMENT AI — Work Plan

### Priority 1: Fix Known Bugs

These are verified issues found during audit:

1. **ReportScreen missing appearance prop from DashboardRouter** — The component has internal appearance-mode logic (Pass 212–213) but DashboardRouter never passes `appearanceMode={appearanceMode}` to `<ReportScreen>`. It always defaults to `"map-dark"` regardless of user setting. Fix: add the prop at DashboardRouter.tsx ~line 199.

2. **theme.css duplicate `:root` selector** — Line 705 duplicates the `:root` at line 96. Should be consolidated or scoped.

3. **theme.css contrast warnings** — Lines 425, 807, 841 have CSS color–background contrast issues flagged by diagnostics.

4. **Pass 214 doc updates missing** — HomeScreen appearance-mode wiring (Pass 214) was code-complete and build-validated but the 3 tracker docs were never updated.

### Priority 2: Dark/Light Mode Rollout (Remaining 81% of surfaces)

Complete the appearance-mode prop threading for all remaining screens. Order by user impact:

| Priority | Screen                    | Impact             | Why                                                 |
| -------- | ------------------------- | ------------------ | --------------------------------------------------- |
| HIGH     | BidsScreen                | Core loop          | Compare/accept bids is the product's revenue action |
| HIGH     | ReportsListScreen         | Core loop          | User reviews their submitted reports                |
| HIGH     | ReportDetailScreen        | Core loop          | Individual report view with photos + bids           |
| MEDIUM   | ShopRequestsScreen        | Shop flow          | Shop's primary incoming work view                   |
| MEDIUM   | ShopActiveJobsScreen      | Shop flow          | Shop's active jobs                                  |
| MEDIUM   | LikedShopsScreen          | Discovery          | Saved shops                                         |
| LOW      | CompetitorAnalysisScreen  | Analytics          | Not core loop                                       |
| LOW      | VehicleProfileScreen      | Settings           | Vehicle management                                  |
| LOW      | InsurerClaimsScreen       | Insurer role       | Secondary role                                      |
| LOW      | InsurerPartnerShopsScreen | Insurer role       | Secondary role                                      |
| LOW      | InsurerConnectionScreen   | Insurer onboarding | One-time flow                                       |
| LOW      | InsurerNewClaimScreen     | Insurer action     | Secondary role                                      |
| LOW      | InsuranceCompaniesScreen  | Directory          | Low traffic                                         |
| LOWEST   | SmokeTestScreen           | Dev only           | Never user-facing                                   |
| FUTURE   | 10 modals                 | Polish             | Secondary surfaces                                  |

**Pattern for each screen:**

1. Add `appearanceMode?: DashboardAppearanceMode` prop (default `"map-dark"`)
2. Derive `const isLightAppearance = appearanceMode === "light"`
3. Apply conditional class names to key surfaces (cards, text, backgrounds, buttons)
4. Thread the prop from DashboardRouter
5. Build validate, run diagnostics, update docs

### Priority 3: Design Consistency Sweep

After appearance mode is complete, audit and fix:

- Inconsistent card/panel styles across screens
- Touch target sizes below 44px on mobile
- Color hierarchy violations (everything same emphasis)
- Glass class usage inconsistencies
- Text contrast issues in both modes
- Spacing rhythm inconsistencies between screens

### Priority 4: Doc Alignment

- Keep BUILD_PROGRESS_DASHBOARD current with every pass
- Keep MAP_TRACKER current with appearance-mode progress
- Keep MAP_MASTER_PLAN notes accurate

### Boundaries — WILL NOT Touch

- New feature logic
- Supabase schema or migrations
- Route/navigation structure changes
- New screens or components
- Edge function changes
- Auth flow modifications
- Any file the Main Build AI is actively working on

---

## MAIN BUILD AI — Suggested Work Plan

Read these docs first (in this order):

1. `docs/BIDONDENT_PRODUCT_BRAIN.md` — full product vision, quick cards, architecture
2. `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — map strategy
3. `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — delivery reality
4. `docs/CODE_ORGANIZATION_AUDIT.md` — architecture boundaries
5. `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` — what's been done (214 passes)
6. This file — coordination boundaries

### Suggested Focus Areas (by product impact)

#### 1. Complete the Report → Bid → Accept Loop (P0)

The core product loop is: customer creates report → shops see report → shops bid → customer compares bids → customer accepts → shop starts work.

**Current state:**

- Report creation: WORKING (6-step wizard, all steps wired)
- Report persistence to Supabase: WORKING (via Clerk edge functions)
- Bid submission: WORKING (edge functions, Pass 191)
- Bid listing for report: WORKING (useBidsForReport hook)
- Bid accept/reject: PARTIALLY WORKING (UI exists, edge function exists, but no notification to shop)
- Shop notification of new reports: NOT BUILT
- Shop notification of bid acceptance: NOT BUILT
- Job status tracking after acceptance: PLACEHOLDER ONLY

**What to build:**

- Real-time or polling notification for shops when reports match their service area
- Notification when a bid is accepted
- Job lifecycle state machine (bid accepted → in progress → completed)
- Rating/review flow after job completion

#### 2. Shop Service Area System (P1)

Shops need to define their service area so reports can be matched to them.

**Current state:** ShopMapWidget is placeholder-only. `shop_service_areas` Supabase table does not exist.

**What to build:**

- `shop_service_areas` Supabase table
- Service area definition UI (ZIP codes or polygon on map)
- Report-to-shop matching logic based on service area + report location

#### 3. Real Marketplace Data Flow (P1)

Currently the "marketplace" reports list for shops uses seed/sample data with a fallback pattern.

**What to build:**

- Real report querability by region/service area
- Filtered marketplace view showing only relevant reports for each shop
- Report photo display from Supabase storage in marketplace context

#### 4. Payment Integration Skeleton (P2)

The PaymentModal exists but has no real payment integration.

**What to build:**

- Stripe or equivalent integration skeleton
- Escrow concept for bid acceptance (customer commits funds, released on completion)
- Payment status in job lifecycle

#### 5. Map-Native Features (P2)

- Report pins on map showing active damage reports in a shop's area
- Shop pins for customers showing nearby shops
- Route from customer location to selected shop
- Replace demo hub data with real shop locations

### Architecture Rules for Main Build AI

- Services = data/domain logic only
- Hooks = orchestration/state lifecycle
- Components = rendering + local interaction only
- Clerk = identity, Supabase = backend (via edge functions, not direct in components)
- File soft limit: 300 lines, hard limit: 500 lines
- Build: `npm run build` (Vite, ~2s)
- Do NOT use `npx tsc --noEmit` (resolves wrong package)
- Spellcheck: `npx cspell lint "src/**/*.{ts,tsx}" "docs/**/*.md" --no-progress`
- Branch: `feature/platform-bugfix-sweep-by-MolandJesus`

### Boundaries — What Main Build AI Should NOT Do

- Restyle or redesign existing screens (Refinement AI handles this)
- Roll out appearance mode to screens (Refinement AI handles this)
- Fix contrast, spacing, or visual consistency issues (Refinement AI handles this)
- Update design-related docs (Refinement AI handles this)
- Touch theme.css for visual tweaks (Refinement AI handles this)

---

## Deconfliction Protocol

### File Ownership

To avoid merge conflicts, the two agents should prefer different file zones:

**Refinement AI owns styling in:**

- All `*Screen.tsx` files (appearance mode + visual fixes only)
- `src/styles/theme.css`
- `src/app/components/app/DashboardLayout.tsx` (visual only)
- `src/app/components/dashboard/*` (visual only)
- All visual doc updates

**Main Build AI owns logic in:**

- `src/app/services/` (new services, edge function integrations)
- `src/app/hooks/` (new hooks for feature orchestration)
- `supabase/` (migrations, edge functions)
- New components if needed
- `src/app/routers/DashboardRouter.tsx` (new route/tab wiring)
- `src/app/utils/buildDashboardRouterProps.ts` (new prop threading)

**Shared files (coordinate carefully):**

- `DashboardRouter.tsx` — Refinement AI adds `appearanceMode={}` props to existing screen renders; Main Build AI adds new screen route blocks
- `dashboard-router-types.ts` — Main Build AI adds new types; Refinement AI should not need to touch this
- `package.json` — Only Main Build AI should add dependencies

### Naming Convention

- Refinement AI: Passes continue from 215+ with prefix `R-` (e.g., "Pass R-215 — BidsScreen appearance mode")
- Main Build AI: Passes use prefix `B-` (e.g., "Pass B-1 — Shop notification integration")

### Communication via Docs

Both agents update `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` but in separate sections:

- Refinement section: "Refinement Sweep (Passes R-215+)"
- Build section: "Feature Build (Passes B-1+)"

---

## Current Codebase State Summary

### What Works

- Full 6-step report creation wizard (customer)
- Clerk authentication (login, profile, session)
- Bid CRUD via Clerk-authenticated edge functions
- Cloud persistence for reports, vehicles, profiles, navigation sessions
- Dashboard shell with role-based navigation (customer/shop/insurer)
- Appearance mode toggle in Settings (persisted to localStorage + document attribute)
- Landing page with 8 sections, blue-system design
- Coverage map with partner shops, ZIP search
- Demo mode for role switching

### What's Partial

- Dark/light mode: 19% of surfaces wired (3 of 18 screens + 2 layouts + 1 modal)
- Shop marketplace: uses seed data fallback, not real filtered data
- Job lifecycle: UI exists but no state machine
- Push notifications: not implemented
- Payment: modal exists, no integration
- Shop service areas: placeholder only

### What's Missing

- Shop notification of new matching reports
- Bid acceptance notification to shop
- Real report-to-shop matching by service area
- Job status progression (accepted → in-progress → completed → rated)
- Payment/escrow integration
- Offline support
- Real analytics dashboard data

### Build Health

- 0 build errors
- 4 CSS diagnostics (contrast + duplicate selector — non-blocking)
- 2,758 modules, 742KB main bundle
- Dev server: `http://localhost:5173/`

---

## Key Files Reference

| File                                           | Purpose                                             |
| ---------------------------------------------- | --------------------------------------------------- |
| `src/app/App.tsx`                              | Root — appearance state, Clerk auth, data loading   |
| `src/app/routers/DashboardRouter.tsx`          | Screen routing by viewMode + currentTab + userType  |
| `src/app/routers/dashboard-router-types.ts`    | `DashboardAppearanceMode` type definition           |
| `src/app/utils/buildDashboardRouterProps.ts`   | Props adapter for dashboard router                  |
| `src/app/hooks/useUserData.ts`                 | User state, cloud hydration, cache                  |
| `src/app/hooks/useAppHandlers.ts`              | Mutation handlers (submit report/bid, login/logout) |
| `src/app/hooks/useNavigation.ts`               | In-app view state, tab persistence                  |
| `src/styles/theme.css`                         | Design tokens, glass classes, appearance-mode CSS   |
| `src/app/components/app/DashboardLayout.tsx`   | Authenticated shell (header, sidebar, bottom nav)   |
| `src/app/components/app/LandingPageLayout.tsx` | Public site shell                                   |
