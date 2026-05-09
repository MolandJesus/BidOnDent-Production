# BidOnDent — System State (REFERENCE)

**Authority level:** REFERENCE — describes the current system as it actually works. Not a vision doc. Not a roadmap.

**Last updated:** 2026-05-07 (autopilot chain Pass 49–58 on `BidOnDent-Horizon-Beta`. Pass 49 navigation surface lazy-mount + Pass 50/51/52 navigation polish + Pass 53 deep navigation engine audit (KI-075 description corrected) + Pass 54 reroute confirm-timing fix (`useShopDirectoryNavigation` defers `confirmReroute()` until OSRM refresh delivers a fresh `routePreview.fetchedAt`) + Pass 55 REF_KNOWN_ISSUES.md split (1163 LOC → 341 active + 828 archived) + Pass 56 LAW §3 reduce-motion contract repaired (animations.css 24 keyframes / 27 utility classes + theme.css `.animate-slide-in-right` toast — zero guards before, full coverage now) + Pass 57 dual off-route paths consolidation (silent ~100m auto-refetch in `useNavigationRoutePreview` now stands down via `suppressOffRouteRefetch` whenever `useNavigationReroute` is `pending`/`cooldown`) + Pass 58 saved places Supabase scaffolding (write-only — KI-114 tracks unapplied migration). 15+ unpushed commits queued on Horizon-Beta; owner pushes manually. Earlier on `main` at `f46dfad8`: Pass 12-41 polish arc complete — see prior baseline below.)

**Prior baseline (2026-05-06, `main` at `f46dfad8`):** Pass 12 map chrome unification + Pass 13/13b/13c KI-118 mileage data integrity + Pass 13d-13h/24/27/28/33 LAW pure-white-inset slip story closed repo-wide + Pass 14/19 KI-012 bid realtime trust signal + Pass 15-17b living-lava atmosphere ledger locked + Pass 18 atmosphere coherence audit + Pass 20 cspell domain-words sweep + Pass 21/26/31/32/34 Prettier housekeeping + Pass 29/30/33b/41 doc co-updates + Pass 37-40 doc-hygiene cluster. Phase 7.6/8 close — KI-113 RESOLVED, KI-109/110 RESOLVED, KI-108 partial closure. Pre-execution-audit pattern was 8-for-8 across Phases 4 / 6 / 6.5 / 7 / 7.5 / 8 / 8.5 / KI-113. Visual system pointer to `REF_VISUAL_SYSTEM.md`; gold-lamp identity + mobile map-first doctrine locked.

**Build:** 0 TS errors, 569/569 tests passing, ~3.5s

**Branch:** `BidOnDent-Horizon-Beta` (working) → `main` (stable)

**Edge functions:** Deployed **version 50** on Supabase project `wmdcnjgtsppftrofaqqa` (deployed 2026-05-02). Gateway `verify_jwt: false` (pinned in `supabase/config.toml`). Live bundle adds: durable `storage://<bucket>/<path>` pointer pattern for persisted media URLs, `hydrateSignedStorageUrl()` failure handling that returns null instead of leaking pointers, hydration of the `getJobAssignments` embedded report (was a bypass). All four prod `damage_reports.photo_urls` rows backfilled from expired signed URLs to pointers via migration `20260501000001_storage_pointer_backfill.sql`. Email delivery still blocked on `RESEND_API_KEY` deployment (KI-002).

**Compute:** Production project on **Micro** tier as of 2026-05-02 (was Medium — downgraded after invoice review). See [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §1.

**Org footprint:** 3 projects on the Pro org. `wmdcnjgtsppftrofaqqa` (production), `lhhdqycnhweaxqviwdqt` (MolandJesus-Staging — Phase 5 hardening, kept running), `yjbugpzarlyidgxbljjn` (bidondent-leads — empty Prisma DB, candidate for deletion). Pause is unavailable on Pro projects; deletion is the only way to drop compute cost on idle ones.

---

## §0. AI Operational Onboarding

> Adopted from the [`REF_CONVERGENCE_TOPOLOGY_2026-05-09.md`](REF_CONVERGENCE_TOPOLOGY_2026-05-09.md) §0 pattern (Pass 213). Propagated here Pass 214 per owner authorization.

- **What this doc controls:** the current architecture truth — auth flow, state ownership, role reality, map stack, edge function deploy state, storage invariants, and known runtime bottlenecks. Use it to answer "how does the system actually work right now?" before assuming behavior from older PLAN docs or pre-hardening commit history.
- **When to trust it:** the "Last updated" line names the most recent pass. Verify against code if a citation looks stale — the repo moves. If code disagrees, fix this doc in the same pass per LAW co-update rule.
- **What supersedes it:** [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md), [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md), [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md), [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md), [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md). Within the REF tier: this doc wins on system-state truth; [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) wins on bug status; [`REF_CONVERGENCE_TOPOLOGY_2026-05-09.md`](REF_CONVERGENCE_TOPOLOGY_2026-05-09.md) wins on duplication / convergence inventory.
- **What this doc must NOT be used for:** authorizing future direction (PLAN tier owns that), justifying new features pre-launch (hardening law forbids it), or explaining why something is the way it is at the philosophical level (LAW tier owns that).

---

## AI Session Reading Order

Before starting work, read docs in this order based on task type:

| Task                                   | Reading order                                                                                                                                                                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bug fix**                            | `LAW_PROJECT_RULES.md` → `REF_KNOWN_ISSUES.md` → this doc → code                                                                                                                                                                                                            |
| **Feature (within hardening plan)**    | `LAW_HARDENING_PLAN.md` → `LAW_PROJECT_RULES.md` → this doc → code                                                                                                                                                                                                          |
| **Architecture change**                | `LAW_PROJECT_RULES.md` → `LAW_HARDENING_PLAN.md` → this doc → `PLAN_POST_LAUNCH_ROADMAP.md` → code                                                                                                                                                                          |
| **Planning session**                   | All LAW → all REF → all PLAN → code as needed                                                                                                                                                                                                                               |
| **UI/design work**                     | `LAW_PROJECT_RULES.md` → `REF_VISUAL_SYSTEM.md` → `MOLANDJESUS_DESIGN_DECISIONS.md` → this doc → `theme.css` → code                                                                                                                                                         |
| **Major visual polish handoff**        | `LAW_PROJECT_RULES.md` → `REF_AI_COLLABORATION_PROTOCOL.md` → `REF_VISUAL_SYSTEM.md` → `HANDOFF_MASTER_PROMPT_2026-05-04_CODEBASE_CLEAN_AND_POLISH.md` (current). Earlier 2026-05-03 visual session docs archived 2026-05-04 to `docs/archive/2026-05-03-visual-handoffs/`. |
| **Multi-AI transcript / relay prompt** | `LAW_PROJECT_RULES.md` → `REF_AI_COLLABORATION_PROTOCOL.md` → task-specific docs → code only if execution is approved                                                                                                                                                       |

**If this doc and `LAW_HARDENING_PLAN.md` disagree, the Hardening Plan wins.** Flag the conflict.

---

## 1. What BidOnDent Currently Is

A **pre-launch React SPA** implementing a geo-native automotive repair marketplace. Three user roles (customer, shop, insurer) interact through a map-first interface backed by Supabase.

**Maturity:** Late alpha / early beta. Core customer→shop→bid loop is wired end-to-end but has zero completed real transactions with real users. Email notifications are not delivering. No payment integration.

**Coverage area:** NY metro — Westchester, Rockland, Dutchess, Nassau, Orange, Putnam counties.

---

## 2. Tech Stack (Actual Versions)

| Layer         | Technology                                                    | Version                      |
| ------------- | ------------------------------------------------------------- | ---------------------------- |
| Framework     | React + TypeScript                                            | 18.3.1 / ~5.7.0              |
| Build         | Vite                                                          | 6.4.2                        |
| CSS           | Tailwind CSS + custom `bd-*` tokens                           | 4.1.12                       |
| Auth          | Clerk                                                         | @clerk/clerk-react 5.59.2    |
| Backend       | Supabase (PostgreSQL, Edge Functions, Storage, Realtime)      | @supabase/supabase-js 2.89.0 |
| Maps          | MapLibre GL JS + react-map-gl                                 | 5.21.1 / 8.1.0               |
| Routing       | OSRM (external) + Nominatim geocoding via Supabase edge proxy | External services            |
| Monitoring    | Sentry                                                        | @sentry/react (wired)        |
| UI components | Radix UI (27+ primitives), motion (animations), recharts      | Various                      |
| PWA           | VitePWA plugin + workbox                                      | Configured                   |

**Edge functions:** Single Deno.serve() router under `supabase/functions/server/`. Canonical slug: `server`. Legacy alias: `make-server-9f243523`. Shared router now also carries the public geocoding proxy route used by browser map search/report geocoding flows.

---

## 3. Current Role Reality

### Customer (most complete)

- Sign up via Clerk → profile created in Supabase
- Submit damage report (6-step wizard with photo upload, location, vehicle)
- View own reports (fetched from Supabase, enriched with signed photo URLs)
- View bids on reports (live via Supabase Realtime subscription)
- Accept/reject bids (confirmation dialog → server-side atomic: bid status, job_assignment, auto-reject competing bids)
- Vehicle management (CRUD)
- Customer-owned vehicles, reports, and customer bid lookups recover across Clerk ID rotation or legacy `NULL` ownership by merging current/historical `clerk_user_id` matches with a stable `user_id` sweep, then self-healing stale `clerk_user_id` values on read
- Estimate requests to shops
- **Not working:** Email notifications (API key not deployed — code-side complete, blocked on secret deployment).

### Shop (mostly complete)

- View marketplace reports — **geo-filtered by service area** (PostGIS `find_reports_in_service_area`). Only biddable reports shown (pending/reviewing/quoted). Shops without service areas see most recent 50.
- Submit bids with geo enrichment from shop_profiles
- View own submitted bids
- Estimate inbox (receive/respond to customer requests)
- Active jobs screen (DB-sourced + report-derived, deduplicated)
- Shop profile with service areas (PostGIS polygons)
- **Not working:** No notification when bid is accepted (email blocked on RESEND_API_KEY deployment).

### Insurer (thin stub)

- Views all marketplace reports (same as shop — unfiltered)
- Can "approve/deny" reports by patching `damage_reports` fields
- Partner shops screen (displays shops, no business logic)
- **Reality:** No claims table exists. "Claims" are damage reports. No policy verification, no adjuster workflow. See KI-030.

### Admin (API-only)

- User management, profile listing, test account creation via edge function endpoints
- Protected by `requireAdminContext` (checks `is_admin` on profiles table)
- No admin UI — all operations via API calls

---

## 4. Frontend Architecture

### Application Shell

```
App.tsx (491 lines) — ClerkProvider + AppContent
  └── AppContent — Auth resolution, hook init, render logic
      ├── Hash pages (#about, #privacy, #terms) — lazy-loaded standalone
      ├── Loading state
      ├── Onboarding gate (account type selection)
      ├── Landing page (unauthenticated)
      └── DashboardLayout
          └── DashboardRouter (472 lines) — Screen dispatch
              ├── HomeScreen, ReportScreen, BidsScreen, AccountScreen
              ├── ShopRequestsScreen, ShopActiveJobsScreen, ShopEstimateInboxScreen
              ├── InsurerClaimsScreen, InsurerPartnerShopsScreen
              └── DashboardSecondaryViews (report detail, shop directory, vehicles, etc.)
```

### Current Routing Model (State-Driven)

Navigation is NOT URL-based. Two React state values drive all routing:

- `viewMode` — which "page" (`dashboard`, `reports-list`, `report-detail`, `shop-directory`, etc.)
- `currentTab` — which tab within dashboard (`home`, `report`, `bids`, `requests`, `jobs`, `claims`, `account`)

These are stored in React state + persisted to localStorage. `history.pushState()` is used for browser back button support but the URL never changes from `/`.

**Key file:** [useNavigation.ts](../src/app/hooks/useNavigation.ts) (245 lines)

**12 valid view modes:** dashboard, reports-list, report-detail, insurer-connect, liked-shops, shop-directory, insurance-companies, competitor-analysis, vehicles, new-claim, smoke-test, demo-switcher.

**Known limitation:** No URL sharing, no bookmarking, no deep linking. See KI-011.

### Prop-Drilling Pattern (Current Bottleneck)

All dashboard state and callbacks flow through a single adapter function:

```
App.tsx → buildDashboardRouterProps() → DashboardRouter → Screen Components
```

[buildDashboardRouterProps.ts](../src/app/utils/buildDashboardRouterProps.ts) (267 lines) constructs 60+ props from navigation state, user data, and handlers. It contains inline async mutation handlers that call Supabase services and update local state.

[DashboardRouterProps](../src/app/routers/dashboard-router-types.ts) (90 lines) — the interface with ~30 handler callbacks.

**Every new feature requires editing:** types file → builder → DashboardRouter → intermediate component → consuming component. See KI-010.

### State Ownership

| Domain              | Owner                                    | Source of Truth              | Sync                                                                                                                                                                                                                                     |
| ------------------- | ---------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth/session        | Clerk SDK                                | Clerk                        | Real-time via hooks                                                                                                                                                                                                                      |
| Navigation          | useNavigation                            | React state                  | localStorage persist + history.pushState                                                                                                                                                                                                 |
| User profile        | useUserData                              | Supabase (cloud-first)       | Fetched on mount, Clerk→local sync via useAppEffects                                                                                                                                                                                     |
| Reports             | useUserData.reports                      | Supabase                     | Fetched on mount, manual refetch after mutations                                                                                                                                                                                         |
| Bids (stale)        | useUserData.bids                         | Supabase                     | Fetched once on mount                                                                                                                                                                                                                    |
| Bids (live)         | useBidsForReport                         | Supabase Realtime            | Real-time subscription per report — **production-verified 2026-04-30**: phx_reply status:ok, INSERT event delivered. Auth via `accessToken` async callback + 50s periodic `refreshRealtimeAuth()`. See KI-057 for dev-mode cycling note. |
| Marketplace reports | useDashboardData → useMarketplaceReports | Supabase                     | Fetched on mount for shop/insurer                                                                                                                                                                                                        |
| Vehicles            | useUserData.vehicles                     | Supabase                     | Fetched on mount, optimistic updates                                                                                                                                                                                                     |
| Appearance mode     | AppearanceModeContext                    | React context + localStorage | Cross-tab sync                                                                                                                                                                                                                           |

**Split state warning:** Bids have dual ownership. See KI-012.

### Key Hooks

| Hook                  | Lines         | Purpose                                                                     |
| --------------------- | ------------- | --------------------------------------------------------------------------- |
| useNavigation         | 245           | View mode, tab, report selection, demo mode, history integration            |
| useUserData           | 412           | Cloud-first user data: reports, vehicles, bids, profile, photos             |
| useAppHandlers        | 226           | Mutation handlers: login, logout, delete account, submit bid, submit report |
| useAppEffects         | 86            | Side effects: click-outside, Clerk→local profile sync                       |
| useDashboardData      | (in routers/) | Marketplace data merging, estimate requests, shop bids                      |
| useBidsForReport      | 143           | Live bids for a specific report with Realtime subscription                  |
| useMarketplaceReports | 71            | Fetches ALL reports for shop/insurer (no pagination)                        |

---

## 5. Backend Architecture

### Edge Function Router

Single `Deno.serve()` in [server/index.ts](../supabase/functions/server/index.ts) (417 lines) with sequential `if (path === ... && req.method === ...)` matching for ~50 routes.

**Middleware (applied per-handler, not globally):**

- `requireClerkSession` — verifies Clerk JWT, extracts session
- `ensureClerkUserMatchesSession` — validates clerkUserId param matches JWT subject
- `requireMarketplaceContext` — verifies shop/insurer role
- `requireAdminContext` — verifies is_admin flag
- Rate limiting — applied globally before dispatch (identity from JWT `sub` claim since KI-003 fix)

**Handler modules:** reports, bids, vehicles, workflow, profiles, network_profiles, estimate_requests, service_areas, geographic_matching, notification_preferences, storage, auth, admin, health, intake, navigation, preferences, website_relationships.

### Auth Flow

```
Client: Clerk JWT → Authorization header
  ↓
Supabase gateway: NOT verified — `verify_jwt: false` pinned in
                  supabase/config.toml [functions.server]
  ↓
Edge Function: requireClerkSession() cryptographically verifies the Clerk JWT
                via JWKS in supabase/functions/server/utils/clerk.ts
  ↓
ensureClerkUserMatchesSession() validates clerkUserId param matches session.sub
  ↓
Profile lookup: profiles.clerk_user_id = session.sub
  (fallback: profiles.email = session.email — legacy migration path)
  ↓
Handler executes with authenticated clerkUserId
```

**Critical deployment fact:** `verify_jwt: false` is required and pinned in `supabase/config.toml`. The Supabase gateway only validates JWTs signed by Supabase's own key — it cannot verify Clerk JWTs and would 401 every authenticated request at `UNAUTHORIZED_LEGACY_JWT` if `verify_jwt: true` were re-enabled. **All `server` routes are reachable from the open internet** — handler-level `requireClerkSession`/`requireMarketplaceContext`/`requireAdminContext` is the only authentication enforcement point. Combined with the service-role Supabase client at [config/clients.ts:13](../supabase/functions/server/config/clients.ts#L13) (which bypasses RLS), this means the handler is the **only** authorization enforcement point. Any handler that omits an auth check is publicly accessible. See KI-048. Full deployment + symptom-mapping reference: [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §17.

### Storage URL Pattern

Persisted media URLs in `damage_reports.photo_urls` (text[]), `*.profile_image_url`, and `vehicles.image_url` are stored as **`storage://<bucket>/<path>` pointers**, not signed URLs. Read paths re-sign on every request via `hydrateSignedStorageUrl()` / `hydrateSignedStorageUrls()`. This avoids the 24h signed-URL TTL trap. Hydration coverage is comprehensive across `getReports`, `getMarketplaceReports`, `getJobAssignments`, `getVehicles`, `saveVehicle`, `getUserProfile`, `saveUserProfile`, `getShopProfile`/`getInsurerProfile` and `getDirectoryInventory`. Skill: `~/.claude/skills/supabase-storage-signed-urls/`. Full pattern: [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §16.

**Note:** Every API call passes `clerkUserId` as a parameter even though the JWT already contains it. This is a legacy pattern from the pre-Clerk auth system.

### Database

**Primary tables:** profiles, vehicles, damage_reports, bids, job_assignments, shop_profiles, insurer_profiles, website_preferences, website_relationships, navigation_sessions, navigation_saved_places (Pass 58 — migration scaffolded but unapplied; see KI-114), shop_interest_submissions, insurer_interest_submissions, platform_activity_events, notification_preferences, shop_service_areas, estimate_requests.

**Schema source of truth:** `supabase/migrations/20251230000001_full_schema.sql` (frozen). New changes go in new timestamped migration files.

**Identity column:** `clerk_user_id` (TEXT) is the forward standard. Legacy `user_id` (UUID) exists on some tables but is not used in new code.

**PostGIS:** Geography columns on `shop_profiles` and `damage_reports`. `shop_service_areas` stores polygon geometries.

**RLS:** Enabled on launch-critical tables (hardened in Phase 3). Edge function uses service role key — RLS is bypassed by edge functions, enforced on direct client access (Realtime). `requesting_clerk_user_id()` SQL helper (`SELECT nullif(current_setting('request.jwt.claims', true),'')::json->>'sub'`) reads the Clerk JWT `sub` claim for RLS policies — required because Clerk user IDs are text (`user_xxx` format), not UUIDs, so `auth.uid()` casts would fail. All `bids`, `damage_reports`, `profiles`, and `shop_profiles` policies use this helper. See KI-056.

### Data Boundary (Type Translation)

**The problem:** DB uses snake_case. Domain uses camelCase. Translation happens in multiple places (see KI-020).

**Current mapping locations:**

1. Edge function handlers (`hydrateReport`, `buildReportPayload`) — server-side enrichment
2. Client service files (`mapReportFromApi` in `services/supabase/reports.ts`) — client adapter
3. Hook-level (`mapBid` in `useBidsForReport.ts`) — handles 4 field name variants for `shopId`
4. Inline in various components

**Target:** Single adapter function per entity type (Law 4). Not yet implemented.

---

## 6. Map Stack

### Active and Foundational

| Component                                            | Purpose                                                          | Status                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| MapLibre GL JS + react-map-gl                        | WebGL map rendering                                              | Active, stable                                                          |
| CustomerMapWidget / ShopMapWidget / InsurerMapWidget | Dashboard home map previews                                      | Active                                                                  |
| ShopDirectoryScreen + MapLibreShopDirectoryMapPane   | Full interactive shop discovery                                  | Active                                                                  |
| Shared `server` geocode route                        | Browser-safe Nominatim proxy for address/origin/report geocoding | Active                                                                  |
| PostGIS geography columns                            | Spatial data storage                                             | Active                                                                  |
| getNearbyShops endpoint                              | Find shops near a location                                       | Built, **not wired to customer flow**                                   |
| getReportsInServiceArea endpoint                     | Filter reports by shop service area                              | Active — wired into shop marketplace via PostGIS service-area filtering |
| shop_service_areas table + CRUD                      | Shop service area polygons                                       | Active, CRUD works                                                      |
| Tile caching (service worker, 7-day TTL)             | Performance                                                      | Active                                                                  |

### Navigation System (Active — Pass 49+ unfreeze)

> **Status correction (2026-05-07, Pass 60):** the navigation system was previously listed as "Built but Frozen" through Pass 41. Pass 49 lazy-mount + Pass 50-58 work re-activated it as a first-class product surface for the shop-directory flow. The table below tracks current status per component.

| Component                                           | Purpose                                                  | Status                                                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| OSRM routing integration                            | Turn-by-turn directions                                  | **Active** — wired into shop directory navigation; off-route detection consolidated via `suppressOffRouteRefetch` (Pass 57).                   |
| Web Speech API voice navigation                     | British voice guidance                                   | **Active** — wired into navigation engine; consumed by `useNavigationVoiceAlerts` + `useNavigationRoutePreview`.                               |
| navigation_sessions table + API                     | Real-time navigation tracking                            | **Active** — cloud-sync of in-flight nav sessions.                                                                                             |
| navigation_saved_places table + API                 | Cloud-sync of pinned home/work/saved/recent places       | **Pass 58 scaffolding shipped**, owner-apply pending (KI-114). Hook degrades to localStorage-only until applied.                               |
| useNavigationLaunch / useNavigationLifecycleEffects | Navigation state management                              | **Active** — lazy-mounted via Pass 49 architecture decision; orchestrated by `useShopDirectoryNavigation` + `useCoverageNavigationExperience`. |
| useNavigationReroute                                | Manual reroute lifecycle (eligible → pending → cooldown) | **Active** — Pass 54 confirm-timing fix + Pass 57 silent-path suppression.                                                                     |

**Map tile sources:** CARTO Voyager (light), CARTO Dark All (night), Esri Satellite.

---

## 7. Design System

> **Single source of truth:** `docs/REF_VISUAL_SYSTEM.md` (current visual identity, full `bd-*` utility inventory, cross-app adoption status, intentionally separate sibling systems). The summary below stays for orientation; for any design work, read `REF_VISUAL_SYSTEM.md` first.

**Target identity (one sentence):** Cool blue glass surfaces lit by warm gold studio-lamp atmosphere, on a map-first product world.

**Appearance modes:** `"light"` (default) | `"map-dark"` — set via `data-appearance-mode` attribute. First-paint default is `"light"` for both the inline boot script in [index.html](../index.html) and the [useAppearanceMode](../src/app/hooks/useAppearanceMode.ts) hook; system `prefers-color-scheme` is intentionally ignored so a fresh deploy always lands in light mode. Both the pre-React HTML loader and the React [AppLoading](../src/app/components/app/AppLoading.tsx) component read `data-appearance-mode` (set synchronously before paint) so reload-time loading screens honor the saved mode — light mode renders a warm-ivory-on-soft-blue background with a gold spinner.

**Major utility families** (defined in [theme.css](../src/styles/theme.css)):

- **Buttons:** `bd-dashboard-primary-button` (canonical primary CTA shell, adopted across landing/dashboard/auth/onboarding/legal/error-boundary), `bd-report-primary-button`, `bd-glass-control--*`.
- **Inputs:** `bd-report-input` (canonical text/email/tel/textarea, adopted across report flow + auth + landing inquiry forms + onboarding + account modals).
- **Cards:** `bd-glass-card`, `bd-glass-card--landing`, `bd-glass-card--landing-warm`, `bd-glass-card--dashboard`, `bd-glass-panel`, `bd-glass-floating`, `bd-glass-badge`.
- **Atmosphere/shell:** `bd-bloom-atmosphere`, `bd-dashboard-atmosphere`, `bd-shell-header`, `bd-section-eyebrow`.
- **Liquid Map Intelligence (hero scene):** `bd-map-contour`, `bd-liquid-gold-flow`, `bd-liquid-gold-sheen`, `bd-route-line`, `bd-pin-pulse`, `bd-bid-card-float`, `bd-gold-sheen-hover`. All have reduced-motion + mobile motion-budget guards.
- **Map controls (intentional sibling system):** `bd-map-control-pill`, `bd-map-overlay-card` — stronger contrast than generic glass to read against MapLibre tiles.

**Color system:**

- Royal blue `#003d82` — primary identity / CTAs / route / selection
- Sky blue `#00a0e9` — secondary / gradients
- Navy — depth / night background
- Gold/amber (alpha 0.10–0.25 only) — lighting, halo, rim trim, marketplace energy. **Never primary button infill.**

**Identity continuity (2026-05-03):** the dashboard's navy-lit-by-gold-lamp shadow stack now mirrors at the top of landing in dark mode (scrolled header inset gold trim + ambient gold glow + lamp wash on hero atmosphere + amber lamp orb). Light mode is LAW-locked as cool blue-gray canvas + bronze/champagne lamp-light + warm hero, not white SaaS. Landing → dashboard navigation should read as one product world.

**Current post-V3 visual state (2026-05-03):** landing and dashboard already carry the premium gold/liquid-glass register across both modes. Recent shipped passes include V1/V2/V3 visual hardening, sidebar/header/search gold-language polish, atmospheric shadow falloff on panels/sections, hero-map double-tap/full-map dispatch, and full landing `CoverageMapDialog` shell retuned to premium gold + cool blue. Future visual work must improve these wins, not reset them.

**Mobile visual watchlist:** mobile dashboard bottom tabs are the correct pattern and should stay. The mobile landing/dashboard experience now needs viewport-economy polish: safe-area spacing, compact report-flow headers/progress, stronger map focus, no bottom-browser-toolbar overlap, and map dialogs that keep the map visible instead of letting a large sheet dominate the viewport.

**Note:** `primaryColor` and `secondaryColor` are threaded as props through the component tree. These are constants that never change. They should be CSS custom properties but this refactor is deferred.

---

## 8. Build and Development

| Command                     | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `npm run dev`               | Start Vite dev server (points at `.env` Supabase host)           |
| `npm run dev:local-browser` | Start Vite for local-browser mode (points at local Docker stack) |
| `npm run build`             | Production build (must = 0 errors)                               |
| `supabase functions serve`  | Local edge function server                                       |
| `supabase start`            | Local Supabase Docker stack                                      |

**Staging:** Supabase project `lhhdqycnhweaxqviwdqt` (created 2026-04-15).

**Local browser audit path:** `npm run dev:local-browser` + `http://localhost:5173`. The dev-server CSP `connect-src` allows `http://127.0.0.1:54321` and `http://localhost:54321` (added KI-054 fix), so the local Docker Supabase stack is directly reachable. No proxy needed. See KI-054.

**Build health:** 0 TypeScript errors. 555/557 tests passing (2 pre-existing failures in `bids.test.ts` — network mock edge cases, not blocking).

**Chunk splitting:** Manual vendor chunks in vite.config.ts (react, supabase, clerk, radix, motion, ui, sentry).

---

## 9. What's Foundational vs. Built-but-Frozen vs. Deferred

### Foundational (active, invest in)

- Report submission wizard
- Bid system (submit, accept, reject, auto-reject competing)
- Map widgets and shop directory
- PostGIS spatial queries and service areas
- Clerk auth + edge function auth middleware
- PWA configuration
- `bd-*` design system tokens
- Supabase Realtime for bid updates
- Activity event logging

### Built but Frozen (don't delete, don't invest)

- OSRM turn-by-turn navigation
- Web Speech API voice guidance
- Navigation sessions (DB table + API + Realtime)
- Market intelligence / AI shop recommendation engine

### Deferred (not yet built)

- URL-based routing (React Router / TanStack Router)
- DashboardContext (replaces prop-drilling)
- Single adapter layer per entity
- Payment integration
- Reviews and ratings
- Push notifications
- Admin UI
- Content moderation
- Dispute resolution

---

## 10. Authoritative Documents After This Rewrite

| Document                              | Authority                                            | Use when                                                  |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `docs/LAW_PROJECT_RULES.md`           | Permanent behavioral rules                           | Every session — governs what to do and not do             |
| `docs/LAW_HARDENING_PLAN.md`          | Execution authority for hardening phase              | Every execution session — governs current work            |
| `docs/REF_SYSTEM_STATE.md` (this doc) | Current system truth                                 | Understanding architecture before making changes          |
| `docs/REF_KNOWN_ISSUES.md`            | Known bugs and gaps                                  | Before starting work on any area — check for known issues |
| `docs/REF_MODULE_STATUS.md`           | Module status (to be rewritten as REF_MODULE_STATUS) | Checking what's done                                      |
| `docs/PLAN_POST_LAUNCH_ROADMAP.md`    | Deferred work (to be moved to PLAN tier)             | Checking if something is deferred                         |

**Superseded:** `docs/CLAUDE_AI_MASTER_CONTEXT.md` → archived to `docs/archive/`. This doc replaces it.
