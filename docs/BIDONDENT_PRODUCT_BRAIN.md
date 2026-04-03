## Pass 18 — Future Map Identity + Atmosphere Governance Alignment (2026-03-22)

### Identity Differentiation Rule (Added Pass 67, 2026-03-23)

- BidOnDent map UX should feel **inspired by but NOT a clone of** Apple Maps or Google Maps.
- The map is productized navigation — but the identity must remain BidOnDent: **blue system, dent-repair context, insurance workflow integration.**
- Visual language should be warm, trustworthy, slightly playful (the BidOnDent brand) — not cold/minimal Apple or busy/functional Google.
- Glass effects serve atmosphere, not decoration. If something looks "too Apple," check if it serves the BidOnDent user or just looks nice.
- The map is one surface in a larger product — dashboard, reports, bids, claims, shop matching — and should harmonize with those surfaces, not outshine them into irrelevance.

### Map/Design/Navigation Future Planning

- The BidOnDent map identity target is a **product-owned, premium, blue-system-driven world** — not a desktop clone or generic SaaS UI.
- Blue is a system: deep royal blue (primary/route/action), sky/baby blue (atmosphere/guidance), ocean/navy blue (depth/night), gray-blue (subdued/inactive/low-noise). Blue should act like **light through glass**.
- The future map should feel like a living world: more depth, atmosphere, layered transparency, and “surface floating above geography.”
- Aspirational direction: richer world feel, environmental depth, spatial layering, and better blending between map and UI. 3D/world rendering is **not implemented** and depends on future provider/platform decisions.
- **Day/night guidance mode switching** is a future direction, not shipped. Any implementation must respect provider stack, real capability boundaries, and user override/settings.
- Controls should be tactile, soft, layered, calm, and premium — not loud, harsh, over-glossed, or like desktop window chrome.
- Glass/material direction: breathable, warm, softly illuminated, transparent/translucent — not over-solidified, painted, cold, or aggressively glossy.
- The future map experience should be more emotional and trustworthy: calm, guided, breathable, confident, premium, friendly, and trustworthy — not cold, flat, generic, or overly technical.

All of the above is **future planning** and not yet implemented unless otherwise stated in the tracker.

# BidOnDent Product Brain

Last updated: April 3, 2026 (Pass 626 — Bundle optimization: 10 dead deps removed, lazy-load landing page + settings modal, index chunk 604→206KB. Test normalization fix Pass 625.)
Status: Active strategic reference

This is a working internal handbook for anyone acting as the product brain, engineering partner, or maintenance agent for BidOnDent. It is meant to preserve context, reduce re-discovery, and keep future edits aligned with what the product is trying to be.

---

## How To Read This Document

This Product Brain has **three reading levels**. Choose the level that matches your task:

| Level                | Section                                                       | When To Use                                                    | Time    |
| -------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- | ------- |
| **1 — Quick Cards**  | "Quick Reference — System Upgrade Cards" (below)              | Starting any upgrade or change. Read ONE card.                 | 10 sec  |
| **2 — Execution**    | "Upgrade Checklists", "Change Impact Index", "Change Recipes" | Ready to implement. Follow the steps.                          | 2-5 min |
| **3 — Full Context** | Everything else (architecture, screen maps, 6-part plans)     | Need deep understanding. Onboarding or architecture decisions. | 30+ min |

**Rule:** A future AI or human should be able to read one Quick Card and one Upgrade Checklist and begin correct work. You should NOT need to read 1,600+ lines before making a change.

---

## Quick Reference — System Upgrade Cards

These cards are the **primary entry point** for future work. Read one card, understand the system, start correctly.

### CARD: Navigation Productization

### CARD: Navigation Session Cloud Sync (Pass 19)

- **STATE:** Tier 3 (Delivered). Navigation session state is now persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. No UI or unrelated code changed. All changes are minimal and scoped.
- **DELIVERED (2026-03-23):** Navigation session cloud sync, persistent session memory, and cross-device continuity. Build, diagnostics, and spellcheck all clean. Session persistence verified after reload and across devices.
- **TOUCHES:** supabase/migrations/009_create_navigation_sessions.sql, src/app/services/navigation/navigationSessionCloudService.ts, src/app/features/navigation/useNavigationSession.ts, src/app/features/navigation/sessionTypes.ts
- **DO NOT:** Change navigation UI to accommodate sync. Add sync indicators that distract from driving.
- **VERIFY:** Route session persists after closing browser. Same session loads on different device. localStorage remains as cache/fallback. Session state is always hydrated from Supabase first.
- **UNLOCKS:** Navigation history, cross-device continuity, preferences sync.
- **FULL DETAIL:** Phase 2 doc "Pillar 3: Cloud persistence for navigation"

### CARD: Design System Expansion & Map Vision Alignment (Pass 17)

- **STATE:** Tier 3 active. Royal-blue glass tokens and classes fully deployed: `bd-glass-panel`, `bd-glass-card`, `bd-glass-badge`, `bd-glass-control` (with CSS hover/active), `bd-glass-floating`. Navy dark mode (`#0c1929` base, `#132237` card, `#1c2e47` accent), blue-tinted glass (alice-blue light, blue-glow dark). Unified hover standard `hover:bg-white/40` across all screens. Map surfaces, shell surfaces, HomeScreen, dashboard, reports, shop directory, bids, account screens all on-system. Landing identity convergence delivered (Pass 12) — all 7 primary landing surfaces now visually unified with the map system: navy brand identity `#003d82`/`#0c2340`, `bd-glass-card` adopted in `AboutOpportunitySection` and `BenefitsSection`, green/orange mismatch colors fixed (step numbers → navy gradient, shops card → sky blue), animated value carousel in `HeroSection` with reduced-motion safety, blue-atmospheric wrapper gradient, blue-tinted header scroll state.
- **MAP VISION:** The final intended map product is **BidOnDent-owned, royal-blue-first, and meaningfully color-coded**. Royal blue is the primary identity, route, and action color; baby/light blue for air/sky/calm; deep ocean blue for depth/premium/spatial confidence; gray-blue/navy for night/dark mode. The map should feel like a branded geographic world, not a generic tile with overlays. **Day/night guidance mode** (automatic switching based on local time/route context) is a planned feature, not yet implemented. Day mode = lighter/sky/atmospheric; night mode = navy/gray-blue/low-glare. All map and design decisions must reinforce this blue system and day/night awareness, and avoid desktop window clones or generic map UI.
- **NEXT MOVE:** Stage 3b for ShopActiveJobsScreen forms and InsurerClaimsScreen data tables (glass-safe, not forced).
- **TOUCHES:** `src/styles/theme.css` (`:root` + `.dark` properties + `.bd-glass-*` classes), `src/app/theme/globalSurfaceTheme.ts`, `src/app/components/maps/mapSurfaceTheme.ts`.
- **DO NOT:** Force glass on forms/tables/data-entry. Change map glass system without design reason. Use `hover:bg-white/40` (not `hover:bg-slate-50/100` or `hover:bg-gray-50/100`).
- **VERIFY:** CSS custom properties visible in DevTools. `.bd-glass-panel` applies outside `.coverage-map-surface`. Dark mode shows navy (not gray). All hovers are soft glow. Landing hero cycles value statements every 3.8s.
- **UNLOCKS:** Stage 3b form/table glass treatment, remaining role screen glass adoption, full site-wide dark mode identity.
- **FULL DETAIL:** Search this doc for "Design System Direction" and "Map Vision Alignment".

### CARD: Customer Map Intelligence

- **STATE:** Tier 3 (Delivered). CustomerMapWidget live on HomeScreen. Compact CarPlay-style card showing 5 nearest shops with distance + rating. Tapping any row or "Open Map" button triggers CoverageMapDialog. Works in demo mode with fallback hubs.
- **NEXT MOVE:** Repair status pin on map. Smart shop recommendation routing (insurance-preferred). Distance-based sort refinement.
- **TOUCHES:** `components/dashboard/CustomerMapWidget.tsx`. Consumes `useCoveragePartnerShops()` + `useCoverageNavigationExperience()`. Triggers `CoverageMapDialog`.
- **DO NOT:** Build smart routing before shop-level metadata (turnaround, capacity) exists in Supabase.
- **VERIFY:** Widget shows up to 5 nearest shops with distance/rating. Tapping expands to full map. Demo fallback works.
- **UNLOCKS:** Repair status pin, smart shop recommendation routing, insurance-preferred shop highlighting.
- **FULL DETAIL:** Search this doc for "Customer Map Intelligence"

### CARD: Shop Map Intelligence

- **STATE:** Tier 3 (Placeholder delivered). ShopMapWidget on shop HomeScreen showing region count, partner density, and operating region pills. Structure-only — real service-area data requires Supabase table.
- **NEXT MOVE:** Create `shop_service_areas` Supabase table. Replace placeholder with live service-area visualization.
- **TOUCHES:** `components/dashboard/ShopMapWidget.tsx`. New Supabase migration when ready.
- **DO NOT:** Build request heatmaps or proximity alerts before the service area table and visualization exist.
- **VERIFY:** Shop sees compact widget with region/partner counts. "Coming soon" message for service-area management.
- **UNLOCKS:** Incoming request heatmap, customer proximity alerts, competitor overlay.
- **FULL DETAIL:** Search this doc for "Shop Map Intelligence"

### CARD: Insurer Map Intelligence

- **STATE:** Tier 3 (Placeholder delivered). InsurerMapWidget on insurer HomeScreen showing shop count, region count, and average rating. Structure-only — real network analytics require queryable shop data.
- **NEXT MOVE:** Wire real network analytics when shop location data is queryable by region.
- **TOUCHES:** `components/dashboard/InsurerMapWidget.tsx`. Consumes `useCoveragePartnerShops()` for basic stats.
- **DO NOT:** Build claims heatmaps or gap analysis before shop location data is queryable by region.
- **VERIFY:** Insurer sees compact widget with 3-column stats (shops/regions/avg rating). "Coming soon" message for analytics.
- **UNLOCKS:** Claims density analysis, coverage gap detection, route optimization.
- **FULL DETAIL:** Search this doc for "Insurer Map Intelligence"

### CARD: Provider Evolution

- **STATE:** Stable. MapLibre GL JS + react-map-gl + OSRM + Nominatim + Overpass are all live and functional. No rate-limit or renderer-blocking issues observed.
- **NEXT MOVE:** No provider changes needed. Focus on reliability within the current stack.
- **TOUCHES:** Nothing — this card exists to prevent unnecessary work.
- **DO NOT:** Migrate providers for aesthetic reasons. Build a provider abstraction layer before it's needed.
- **VERIFY:** N/A — no change required until a specific trigger (rate limits, feature gap, business justification).
- **UNLOCKS:** Globe rendering (Mapbox GL), traffic-aware routing (Google/TomTom), offline maps (PMTiles).
- **FULL DETAIL:** Search this doc for "Provider Evolution Decision Framework"

### CARD: Cloud Navigation Persistence

- **STATE:** Tier 3 (Delivered, Pass 19). Navigation session state persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Cross-device continuity is real. See updated card "Navigation Session Cloud Sync (Pass 19)" above.
- **DELIVERED:** Supabase migration `009_create_navigation_sessions.sql`, `navigationSessionCloudService.ts`, session hydration from Supabase on boot, save on update.
- **DO NOT:** Change navigation UI to accommodate sync. Add sync indicators that distract from driving.
- **VERIFY:** Route session persists after closing browser. Same session loads on different device. localStorage remains as cache/fallback.
- **UNLOCKS:** Navigation history, cross-device continuity, preferences sync.
- **FULL DETAIL:** Phase 2 doc "Pillar 3: Cloud persistence for navigation"

---

## What BidOnDent Is

BidOnDent is a three-sided auto body repair marketplace:

- Customers report damage, upload photos, receive repair bids, compare options, and choose a shop.
- Auto body shops review repair opportunities, submit bids, and manage active work.
- Insurers review claims, monitor repair activity, and manage or assign partner shops.

The product promise is transparency:

- structured intake
- visible bid comparison
- faster repair decision-making
- shared visibility across customer, shop, and insurer workflows

The platform wants to feel trustworthy, professional, and operationally clear rather than flashy for its own sake.

## The Most Important Product Truth

The codebase is part real marketplace, part demo shell, and part admin/dev toolbox.

That means there are two truths we have to keep in our head at the same time:

- The intended product is a real multi-party repair marketplace.
- The current implementation still mixes real persistence with mock/sample flows, especially for shop and insurer experiences.

When working on the app, do not assume every visible screen is fully wired end to end. Many are polished frontends that still need deeper integration.

## Current Supabase Reality

The repo has now crossed into a cleaner "website-era" Supabase contract:

- frontend Supabase URLs, route slugs, and bucket names are centralized in `src/app/services/supabase/runtime.ts`
- admin/dashboard edge calls are centralized in `src/app/services/supabase/admin.ts`
- canonical live edge function is `server`
- `make-server-9f243523` is still deployed only as a compatibility alias
- canonical buckets for new uploads are:
  - `bidondent-account-media`
  - `bidondent-vehicle-media`
  - `bidondent-report-media`
- old buckets still exist only to preserve previously uploaded assets
- the empty `bidondent-landing-page-images` bucket has already been removed from the live project

Implication:

- do not add new hardcoded Supabase URLs in components
- do not point new uploads at the legacy buckets
- when touching map/account/profile code, prefer website-identity-aware edge services over raw browser table access

## Current Map/Search Reality

The repo now has a real first-pass map foundation. Important facts:

- `src/app/services/auth/websiteIdentity.ts` is the provider-agnostic identity/session layer.
- `websiteIdentity` owns `websiteUserKey`, `sessionId`, and local website memory.
- `src/app/services/intelligence/marketIntelligence.ts` is still the recommendation/scoring brain.
- `src/app/services/intelligence/shopMapExperience.ts` now adds seeded geo metadata, suggested origins, and role-aware map framing.
- provider-agnostic shop and insurer business profiles now persist through edge routes keyed by `website_user_key`.
- `src/app/components/shop/ShopDirectoryScreen.tsx` is now a dedicated map-first shell, not just the old list screen stretched wider.
- `src/app/components/shop/MapLibreShopDirectoryMapPane.tsx` is the active dashboard shop-discovery map surface.
- `src/app/components/maps/MapLibreServiceCoverageMap.tsx` is the active coverage-map renderer for landing and dashboard flows.
- `src/app/types/mapDomain.ts` is the shared domain type layer for map/search/origin/place/session state.
- customer saved shops, shop competitor watchlists, and insurer shortlists now persist inside shared map session memory and feed their related screens.
- that website memory now also has a cloud-backed provider-agnostic sync path through `website_preferences`, not only browser storage.
- onboarding for shop and insurer accounts now has a real persistence target instead of stopping at form UI.
- live directory inventory can now feed the map and insurer connection flows, with seeded fallback still preserved.
- those saved/watchlist/shortlist/carrier collections now also mirror into durable provider-agnostic relationship rows.
- shop and insurer dashboard role views now prefer merged live report data (including hydrated photo storage) before demo fallback, so a newly submitted report can surface downstream faster.
- fullscreen mobile map browse now uses stronger touch-scroll handling and less vertically bloated quick-origin/menu lanes.
- compact fullscreen/mobile shop-result cards now favor a single clear route CTA with lighter support actions instead of preserving the heavier desktop card hierarchy.
- pre-navigation route preview now shows a shorter, cleaner step stack on phones and no longer leaves light mode partially styled like a dark-only panel.

Implication:

- future map work should extend this dedicated shell and shared map domain
- do not regress the newer identity/session/intelligence abstraction just to wire a UI shortcut
- screenshots are still design direction, but the real checked-in source-of-truth for map work is now these files

### Map Session Persisted State

`WebsiteSessionMemory.mapSession` persists:

- `savedPlaces`, `recentSearches`, `lastSearchOrigin`, `lastSearchQuery`, `lastSearchFilters`
- `customerSavedShopIds`, `shopWatchlistIds`, `insurerShortlistIds`
- `mapViewMode`, `mapTheme`, `lastViewedShopId`, `lastMapCenter`, `lastMapZoom`

This sits beside `shopDirectory` (search/filter/sort memory) and `insuranceConnection` (carrier-link memory).

### Three-Layer Persistence Architecture

1. **Local browser storage** — instant startup, offline-safe continuity
2. **Cloud `website_preferences`** — durable app-level memory keyed by `website_user_key`
3. **Cloud `website_relationships`** — durable saved shops, watchlists, shortlists, connected carriers

Startup flow: build `websiteIdentity` → hydrate local memory → fetch cloud preferences → fetch cloud relationships → merge newer cloud state into local → debounce future writes back to cloud.

### Role-Aware Map Panel Behavior

- **Customer:** Panel frames the experience as repair routing. Saved shops mirror into `website_relationships` rows. Connected insurer preferences influence ranking.
- **Shop:** Panel frames the map as competitor scouting / market benchmarking. Watchlist mirrors into `website_relationships` rows.
- **Insurer:** Panel frames the map as partner-network recruitment. Shortlist mirrors into `website_relationships` rows. Mapped partner-shop actions seed website map memory and open the insurer-scoped shop-directory map flow.

### Compact Overlay Density (April 2026)

The dashboard embedded map uses `overlayDensity="compact"` to reduce floating UI footprint compared to the full-viewport immersive map. This affects tile/theme picker, search-area pills, route preview card, guidance card, bottom legend/filter rail, and popup card sizing.

## Architecture In One Pass

App boot:

- `src/main.tsx`
- `src/app/App.tsx`

Main orchestration happens in `src/app/App.tsx`:

- wraps the app in `ClerkProvider`
- reads the Clerk user
- extracts a product-facing profile from Clerk metadata
- initializes shared hooks
- decides between account setup, onboarding, landing page, and dashboard

Shared hooks:

- `src/app/hooks/useUserData.ts`
- `src/app/hooks/useNavigation.ts`
- `src/app/hooks/useAppEffects.ts`
- `src/app/hooks/useAppHandlers.ts`

UI shells:

- `src/app/components/app/LandingPageLayout.tsx`
- `src/app/components/app/DashboardLayout.tsx`

Screen routing:

- `src/app/routers/DashboardRouter.tsx`

This app does not use React Router for main navigation. It uses local React state plus `viewMode` and `currentTab`.

That is a major architectural fact. Any navigation change needs to respect that model.

## How Navigation Actually Works

Navigation state lives in `src/app/hooks/useNavigation.ts`.

Core state:

- `currentTab`
- `viewMode`
- `selectedReportId`
- `showLandingPage`
- `showOnboarding`
- `showProfileDropdown`
- demo mode flags

It persists parts of navigation into localStorage under `bidondent_navigation_state`.

Implication:

- page flow is state-driven, not URL-driven
- restoring state after refresh is intentional
- if you change view names or tab IDs, you also affect saved local state behavior

## The Product Roles

### Customer

Intent:

- report collision/body damage
- upload damage photos
- describe incident
- receive quotes
- compare shops
- pick a repair path
- manage profile and vehicles

Main customer areas:

- home dashboard
- report flow
- bids screen
- reports list/detail
- insurer connection
- liked shops
- vehicles
- account

### Shop

Intent:

- see open repair opportunities
- bid on jobs
- manage active repairs
- monitor competition and insurer opportunities

Main shop areas:

- home dashboard
- requests
- active jobs
- competitor analysis
- insurance company directory
- account / shop profile

### Insurer

Intent:

- review claims
- compare or assign repair options
- manage partner network
- manually create claims

Main insurer areas:

- home dashboard
- claims
- partner shops
- new claim
- account

### Admin / Test Accounts

Intent:

- create and manage linked test accounts
- verify system health
- inspect profiles/users

Reality:

- admin infrastructure exists in the repo
- it is explicitly marked as removable for production
- it is important operationally, but it is not the core customer-facing product

### Demo Mode

Intent:

- let one logged-in user preview customer, shop, and insurer dashboards without separate sign-ins

Reality:

- demo mode is a real first-class concept in the dashboard shell
- it is useful for product demos and manual QA
- it should not be confused with real cross-account data integrity

## Role Interaction Map

This is the conceptual interaction graph the product is aiming for.

Customer -> Shop:

- customer creates a damage report
- shops review the request
- shops submit bids
- customer compares and selects a shop

Customer -> Insurer:

- customer can connect insurer information
- insurer can review claims tied to damage/repair activity

Shop -> Customer:

- shops send bids
- shops communicate repair timing, cost, and status

Insurer -> Customer:

- insurer approves or denies claim amounts
- insurer may help route the customer toward a partner shop

Insurer -> Shop:

- insurer evaluates shop network
- insurer can assign or prefer shops
- insurer tracks network performance

Admin -> Everyone:

- creates test users
- manages admin/test privileges
- validates system health and operational state

## Current Implementation Reality Of Those Interactions

Customer flows are the most real.

- customer auth/account setup is real through Clerk
- customer vehicles and reports have real persistence paths through Supabase
- customer report photo upload has real storage logic with fallback behavior

Shop flows are more demo-heavy.

- shop dashboards look intentional and usable
- shop request and job screens currently lean heavily on hardcoded sample data
- shop bid submission UI exists, but the current cross-role data path is not fully coherent

Insurer flows are also more demo-heavy.

- claims, partner shops, and new claim screens are polished
- a lot of insurer-side data is sample/mock data, not clearly wired to real persisted marketplace state

Admin/devtools are real utility surfaces.

## The Visual Language

BidOnDent consistently leans on:

- deep royal blue plus cyan gradients
- white cards on soft gray or blue-tinted backgrounds
- large rounded corners
- icon-led cards and quick actions
- polished but readable motion
- clean B2B/B2C hybrid trust aesthetics

Design principles visible in the repo:

- the product wants to feel clean and credible
- trust is communicated through badges, stats, certifications, and process clarity
- screens favor explicit labels and guided next actions
- landing sections are modular and market-facing
- dashboard sections are action-first and role-specific

When editing UI, avoid:

- generic app-store-style fluff
- flattening all roles into the same copy
- replacing the blue/cyan trust language with unrelated themes
- making flows more clever than clear

## Code Organization Style To Preserve

The project already shows a preferred organization style.

### 1. Centralized orchestration

Keep app-level decisions in:

- `src/app/App.tsx`
- shared hooks
- `src/app/routers/DashboardRouter.tsx`

Do not scatter top-level route logic randomly across screens.

### 2. Role-based component grouping

Major screen groups live under:

- `src/app/components/landing`
- `src/app/components/shop`
- `src/app/components/insurer`
- `src/app/components/reports`
- `src/app/components/admin`
- `src/app/components/demo`

That is good. Preserve it.

### 3. Legacy but active `codelayer`

`src/app/components/codelayer` is not dead.

It still contains active screens:

- `HomeScreen.tsx`
- `ReportScreen.tsx`
- `BidsScreen.tsx`
- `AccountScreen.tsx`

Do not delete or casually relocate these without updating the router and dependent logic.

### 4. Services should stay modular

Supabase operations are split under:

- `src/app/services/supabase/profiles.ts`
- `src/app/services/supabase/vehicles.ts`
- `src/app/services/supabase/reports.ts`
- `src/app/services/supabase/bids.ts`
- `src/app/services/supabase/storage.ts`

Backward compatibility is preserved through:

- `src/app/services/supabaseService.ts`

That pattern is worth keeping.

### 5. Use hooks as coordination layers

The app already tries to keep side effects and coordination out of leaf screens:

- `useUserData`
- `useNavigation`
- `useAppEffects`
- `useAppHandlers`

New shared behavior should usually go through those layers before it spreads into screen-local hacks.

## Public Landing Page Map

Current landing composition lives in `src/app/components/app/LandingPageLayout.tsx`.

### Header

File:

- `src/app/components/landing/LandingPageHeader.tsx`

Current buttons and behavior:

- logo -> scrolls to top
- `How It Works` -> scrolls to the `how-it-works` section
- `Who We Serve` -> scrolls to the `who-we-serve` section
- if logged out:
  - `Login` -> opens Clerk sign-in modal
  - `Get Started` -> opens Clerk sign-up modal
- if logged in and on landing:
  - `Dashboard` -> exits landing and shows dashboard
  - Clerk `UserButton`

### Hero

File:

- `src/app/components/landing/HeroSection.tsx`

Current buttons:

- primary CTA
  - logged out: `Get Started`
  - logged in customer: `Start New Report`
  - logged in shop: `View Requests`
  - logged in insurer: `Create New Claim`
- secondary CTA: `Learn More` -> scrolls to How It Works

Visual meaning:

- damaged vehicle + customer context
- trust badge
- claim of cost savings and local shop access

### How It Works

File:

- `src/app/components/landing/HowItWorksSection.tsx`

Concept:

- 1. report damage
- 2. receive bids
- 3. choose and repair

### Benefits / Why Choose Us

File:

- `src/app/components/landing/BenefitsSection.tsx`

Themes:

- repair quality
- certified professionals
- competitive pricing

### Who We Serve

File:

- `src/app/components/landing/WhoWeServeSection.tsx`

Audience cards:

- customers
- auto body repair shops
- insurers

### Trust Stats

File:

- `src/app/components/landing/TrustStatsSection.tsx`

Role:

- social proof
- scale
- confidence

### CTA Section

File:

- `src/app/components/landing/CTASection.tsx`

Current main button:

- signed in: `Go to Dashboard`
- signed out: `Get Started Now`

### Footer

File:

- `src/app/components/landing/FooterSection.tsx`

Important note:

- many footer links are placeholder `#` links
- some screenshot-visible sections implied by footer labels are not fully represented in current landing code

## Dashboard Shell Map

Main file:

- `src/app/components/app/DashboardLayout.tsx`

Desktop shell:

- sidebar logo
- role-aware tab list
- optional `Demo Mode` button
- bottom sidebar profile trigger

Top bar:

- active tab label
- search input
- bell icon with unread dot
- top-right compact profile menu

Important note:

- the bell/search are mainly shell UI elements
- the richer navigation and notification behavior is actually handled in `ProfileDropdown`

## Profile Dropdown Behavior

Main file:

- `src/app/components/dashboard/ProfileDropdown.tsx`

What it does:

- shows user identity and role badge
- shows role-specific stats
- subscribes to real-time notifications when open
- offers role-aware quick navigation

Current notification intent:

- customer -> new bids
- shop -> new repair requests
- insurer -> new claims

Important reality:

- subscriptions exist
- but overall end-to-end data consistency still depends on the mixed auth/data architecture being aligned

## Experience Maps (Archived)

> **Archived:** Full screen-by-screen experience maps for Customer, Shop, Insurer, and Admin roles moved to `docs/archive/PRODUCT_BRAIN_EXPERIENCE_MAPS.md` (Pass 537). Each map details every screen's file, primary actions, CTAs, layout, and known issues.

## Data And Persistence Model

### Clerk

Clerk is the active auth provider.

Main file:

- `src/app/services/clerkService.ts`

Clerk metadata currently stores:

- `user_type`
- `name`
- `phone`
- `account_setup_completed`

In practical terms, Clerk is the current identity source.

### Supabase

Supabase is used for:

- profiles
- vehicles
- damage reports
- bids
- storage
- realtime
- edge functions

Important client files:

- `src/app/services/supabase/client.ts`
- `src/app/services/supabase/profiles.ts`
- `src/app/services/supabase/vehicles.ts`
- `src/app/services/supabase/reports.ts`
- `src/app/services/supabase/bids.ts`
- `src/app/services/supabase/storage.ts`

### localStorage

Used for:

- quick per-user cache
- navigation state
- report drafts

Important consequence:

- localStorage is not just a convenience here; parts of UX rely on it

## Backend Shape

Edge function router:

- `supabase/functions/server/index.ts`

Important handlers:

- `handlers/reports.ts`
- `handlers/vehicles.ts`
- `handlers/auth.ts`
- `handlers/storage.ts`
- `handlers/admin.ts`

Important backend reality:

- server uses service-role Supabase access
- several handlers use `clerk_user_id`
- several frontend direct reads still assume `user_id` / Supabase-auth alignment

That mismatch matters.

## Known Architectural Risks And Mismatches

### 1. Clerk vs Supabase session split

The app now authenticates users through Clerk, but `useUserData` still waits for a Supabase session before loading cloud data.

Effect:

- a user can be signed in through Clerk and still not fully load cloud-backed data

### 2. Schema drift around `clerk_user_id`

Edge handlers and `database_init.tsx` expect `clerk_user_id` columns on vehicles and damage reports.

Static migration files originally omitted `clerk_user_id` from `damage_reports`. **Pass 84 fix:** Migration `010_add_clerk_user_id_to_damage_reports.sql` now adds the column, makes `user_id` nullable, and adds the `user_id_or_clerk_user_id` constraint. Reports now persist correctly through sign-out/in cycles.

**Remaining risk:** Some frontend modules still center `user_id`. Full unification of identity columns is a medium-term goal.

### 3. Mixed report shapes

Different parts of the frontend treat reports differently:

- nested vehicle object
- flattened `vehicle_make` / `vehicle_model` / `vehicle_year`
- different status names

Effect:

- transformations are common
- bugs can appear when one screen expects a shape another screen does not produce

### 4. `selectedReportId` number vs UUID/string mismatch

Navigation stores `selectedReportId` as a number-ish value, but persisted reports can have string/UUID IDs.

Effect:

- report selection/detail behavior is fragile when real Supabase IDs are involved

### 5. Shop request bidding is partially coherent

Shop request cards are sample data with numeric IDs, while bid routing/lookup logic depends on the app report collection.

**Pass 425 fix (2026-03-28):** Bid submission now properly propagates errors from `useAppHandlers` through `ShopRequestsScreen` to `ShopBidModal` with inline error display and loading states. The UI is honest about submission success/failure.

**Pass 435 fix (2026-03-29):** `submitBid` now throws on missing report instead of silently returning. Callers can catch and display errors. `useWebsiteSessionSync` uses `Promise.allSettled` so one failing cloud fetch doesn't kill session hydration.

**Remaining risk:** The data path between sample shop requests and real persisted bids is not fully end-to-end trustworthy.

Effect:

- the UI now shows real submission feedback, but the underlying data path still mixes sample and real data

### 6. Landing/footer/code drift

Footer promises things like shop signup and insurer partnership, and screenshots show more landing surfaces than the current landing modules expose.

Effect:

- product intent is broader than the current checked-in landing composition

### 7. Automated test baseline exists but is minimal

**Pass 324 (2026-03-28):** Vitest + 33 unit tests covering formatters, routing, collections. CI pipeline in GitHub Actions (format → test → build).

Effect:

- basic regression protection exists for utility logic
- role-specific UI flows and integration paths remain manually validated
- test coverage should expand as core workflows stabilize

## How To Work On This Repo Without Making It Messier

### Current Build & Quality Health (as of Pass 437)

- **Build:** 0 errors, ~2.1s (Vite 6.4.1)
- **TypeScript:** 0 `tsc` errors (clean since Pass 421)
- **Production `any` types:** ZERO (was 21; eliminated Passes 433-434; 7 remain in test files only)
- **Bundle:** 514KB index chunk (down from 783KB)
- **Images:** 22.9MB total (down from 53.6MB — 57% reduction via JPEG conversion)
- **User-facing alerts:** ZERO remaining (all replaced with inline feedback)
- **File sizes:** 8 oversized files refactored under 500-line hard cap (Passes 400-407). Extraction sweep (Passes 540-562) reduced all major files: `ShopDirectoryScreen.tsx` (494), `DashboardRouter.tsx` (452), `MapLibreServiceCoverageMap.tsx` (459), `ShopDirectoryResultCard.tsx` (286). Pass 565 structurally extracted `useNavigationLaunch.ts` from `useOperatingRegionsCoverage.ts` (515→436) to durably stay under 500 despite Prettier expansion. All files now under 500-line hard cap.
- **Race conditions:** Fixed in useBusinessProfile (426) and useUserData autosave (427)
- **Session sync:** Promise.allSettled for resilient cloud hydration (435)
- **Async safety:** All critical handlers have try-catch/finally (Pass 428); submitBid throws on missing report (435)
- **Tests:** 33 unit tests via Vitest + CI pipeline (Pass 324/327)
- **ShopProfileModal:** All 5 form fields wired to Supabase save (436)
- **Documentation:** 14 historical docs archived, governance index rewritten (437)
- **Full sweep log:** See `docs/CLAUDE_AI_MASTER_CONTEXT.md` Section 14

If adding or changing a feature:

- start from the role that owns the action
- trace the handler path all the way to data persistence before claiming the feature is complete
- check whether the screen is real-data or mock-data first
- keep orchestration in hooks/router, not in random child components
- preserve role folders and screen naming conventions
- do not delete `codelayer` screens unless you are deliberately migrating them
- prefer extending the service modules instead of creating one-off fetch logic inside screens
- keep landing sections modular
- keep trust-oriented copy and visual consistency

If replacing mock/sample data with real data:

- keep the existing UI contract stable where possible
- add adapter/transform code at the boundary instead of rewriting all screens at once
- unify ID types before wiring deeper navigation
- decide whether Clerk or Supabase auth is the canonical identity for that path

If working on design:

- keep the blue/cyan trust system unless there is a clear brand change
- keep hierarchy obvious
- keep role language explicit
- avoid generic startup-saas visuals that remove the collision-repair personality

## Fast Mental Model For Future Work

When thinking about BidOnDent, think:

- public marketing site + logged-in dashboard shell
- three-sided marketplace
- customer flow is closest to real
- shop and insurer flows are strong UI shells with partial real wiring
- demo mode is part of the product story
- admin/devtools exist and are useful, but are not the customer-facing product core
- data architecture still needs consolidation

## Product-Brain Stance

When acting as the BidOnDent agent:

- prioritize clarity over novelty
- protect the role boundaries
- look for data truth before UI assumptions
- treat screenshots, code, and runtime behavior as three separate evidence sources
- call out when they disagree
- preserve the repo's modular structure and avoid unnecessary sprawl

## Best Starting Files For Any Future Investigation

If reloading context quickly, start here:

- `src/app/App.tsx`
- `src/app/hooks/useUserData.ts`
- `src/app/hooks/useNavigation.ts`
- `src/app/hooks/useAppHandlers.ts`
- `src/app/routers/DashboardRouter.tsx`
- `src/app/components/app/LandingPageLayout.tsx`
- `src/app/components/app/DashboardLayout.tsx`
- `src/app/components/codelayer/HomeScreen.tsx`
- `src/app/components/codelayer/ReportScreen.tsx`
- `src/app/components/codelayer/AccountScreen.tsx`
- `src/app/services/clerkService.ts`
- `src/app/services/supabase/*`
- `supabase/functions/server/index.ts`
- `supabase/functions/server/database_init.tsx`

## Map & Navigation Program — Implementation Reality (audited 2026-03-21)

This section exists so that any agent, human, or cross-reference doc can quickly determine what the map program actually delivers versus what is planned.

### Confirmed Real (production code, real APIs)

| Capability                     | Implementation                                                                           | API / Provider                           |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| GPS live tracking              | `navigator.geolocation.watchPosition()` with high accuracy                               | Browser Geolocation API                  |
| Turn-by-turn routing           | OSRM fetch → 15+ maneuver templates → step-by-step UI                                    | `router.project-osrm.org` (public, free) |
| Live speed + speed-limit HUD   | GPS-derived speed + Overpass API speed-limit query with confidence scoring               | Overpass API (OSM)                       |
| Voice navigation (TTS)         | `SpeechSynthesisUtterance`, voice personas, volume presets                               | Web Speech API                           |
| Address search + suggestions   | Nominatim geocoder with caching, predictive dropdown                                     | Nominatim (OSM)                          |
| Navigation session persistence | localStorage v2 with route/origin/destination/provider                                   | Browser localStorage                     |
| Dashboard map widget           | `DashboardCoveragePanel.tsx` renders `CoverageMapDialog` with full navigation experience | MapLibre GL JS + react-map-gl            |
| Map tile rendering             | CARTO Voyager, CARTO Dark All, Esri Satellite                                            | CARTO / Esri via MapLibre styles         |

### Known Gaps

| Gap                                | Detail                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Cloud sync for navigation sessions | **Delivered (Pass 19).** Supabase `navigation_sessions` table with localStorage as cache. Cross-device continuity is real. |
| Route provider label               | Code uses `"osrm-public"` but historically was mislabeled as `"osrm-demo"` — the engine calls real production OSRM.        |
| Globe rendering                    | No 3D globe enabled today. Current MapLibre build uses flat raster styles; globe would require a vector-style upgrade.     |
| Premium TTS voices                 | Current voices are browser-default. No paid TTS (e.g., Google Cloud TTS, ElevenLabs).                                      |

### Cross-Document Awareness

This Product Brain should be read alongside:

- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — strategic themes, non-negotiables, and future direction
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — granular delivery history, active risks, and staged roadmap
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture truth table and Phase 3 direction

Any decision about map features, providers, or design language should cross-check all four docs to avoid contradictions.

## Feature Maturity Classification

Every major BidOnDent capability falls into one of three tiers. This classification prevents confusion between "it works in code" and "it is ready for users" and "we want it someday."

### Tier 1 — Implemented (works in code, real APIs, ships today)

These features are in the production bundle with real provider backing. They work but may still have rough edges, missing error handling, or incomplete UX polish.

| Feature                                 | Notes                                                      |
| --------------------------------------- | ---------------------------------------------------------- |
| GPS live tracking                       | Browser Geolocation API, high accuracy mode                |
| Turn-by-turn routing                    | OSRM public, 15+ maneuver templates                        |
| Speed + speed-limit HUD                 | Overpass API + GPS-derived, confidence scoring             |
| Voice navigation (browser TTS)          | Web Speech API, personas, volume presets                   |
| Address search + predictive suggestions | Nominatim with caching                                     |
| Navigation session persistence          | localStorage v2, versioned envelopes                       |
| Dashboard embedded map                  | CoverageMapDialog inline on dashboard                      |
| Coverage map (embedded + fullscreen)    | MapLibre GL JS + react-map-gl, three raster tile styles    |
| Royal-blue glass map controls           | theme.css + mapSurfaceTheme.ts                             |
| In-map command pod + overlays           | CoverageBrowseExperience.tsx                               |
| Provider health telemetry               | Diagnostics checks, trust state UI                         |
| Directions handoff                      | BidOnDent Maps in-app by default, external export fallback |
| Customer report flow                    | Clerk auth → Supabase persistence → photo upload           |
| Customer vehicle management             | Real CRUD with Supabase                                    |
| Demo mode                               | First-class role preview, clearly gated                    |

### Tier 2 — Productizing (works but needs maturity before relying on it at scale)

These features exist in code but have known gaps in reliability, UX completeness, edge-case handling, or operational readiness.

| Feature                        | Gap                                                                                                                                               | Next Step                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Turn-by-turn UX                | No offline fallback; deviation detection + rerouting delivered (Pass 500s). No ETA updates during navigation.                                     | Add offline fallback + ETA updates       |
| Speed-limit HUD                | Overpass API can return stale/missing data in rural areas; no fallback display                                                                    | Add "no data available" graceful state   |
| Voice navigation               | Browser TTS quality varies wildly across devices/OS; no voice selection UI                                                                        | Add voice picker, test cross-browser     |
| Navigation session persistence | **Delivered (Pass 19).** Supabase cloud sync + localStorage cache. Cross-device continuity real.                                                  | Done — monitor reliability               |
| Shop bid submission            | UI exists, cross-role data path not fully coherent                                                                                                | Wire real Supabase bid rows to shop view |
| Insurer claims view            | Polished UI, mostly mock data                                                                                                                     | Connect to real claim persistence        |
| Shop/insurer dashboards        | Strong UI shells, partial real data                                                                                                               | Progressive real-data wiring             |
| Profile dropdown               | Real user data, no glass design treatment                                                                                                         | Adopt map theme tokens                   |
| Landing page design            | Unified — all 10 landing surfaces use bd-glass tokens and navy dark identity. 4 light sections (Hero→WhoWeServe) → 6 dark sections (About→Footer) | Stage 3b: forms + data tables            |
| Bid cards (BidCardArticle)     | Dark shell complete (Pass 234) — matches BidsScreen dark navy background                                                                          | Wire to real bids from Supabase          |
| Demo account switcher          | Dark shell complete (Pass 235) — all text, banners, buttons now on-system                                                                         | Keep current; verify on mobile           |

### Tier 3 — Aspirational (not in code, documented as future direction only)

These features do not exist in the codebase today. They represent product direction that should be built gradually over multiple future passes.

| Feature                                 | Why It Matters                                                                                                          | Technical Prerequisites                              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| ~~Cloud-synced navigation sessions~~    | ~~Cross-device session continuity~~ **DELIVERED (Pass 19)**                                                             | Done — Supabase table + sync service live            |
| ~~Role-specific dashboard map widgets~~ | ~~CarPlay-style glanceable map intelligence per role~~ **DELIVERED (Passes 11-13)**                                     | Done — Customer/Shop/Insurer map widgets live        |
| Customer repair routing intelligence    | Smart route-to-shop with wait time, rating, distance weighting                                                          | Shop availability API + scoring algorithm            |
| Shop service-area operations view       | Geographic incoming request visualization + technician logistics                                                        | Geofenced request queries + service area persistence |
| Insurer claims density heatmap          | Regional claim clustering + network coverage analysis                                                                   | Aggregated claim geo data + heatmap layer            |
| 3D globe rendering                      | Premium zoom-out experience                                                                                             | Mapbox GL or MapLibre GL migration                   |
| Premium TTS voices                      | Higher-quality voice navigation                                                                                         | Google Cloud TTS or ElevenLabs integration           |
| Offline navigation                      | Works without network after route is loaded                                                                             | Route geometry caching + offline tile pack           |
| ~~Real-time rerouting~~                 | ~~Automatic deviation detection + new route~~ **DELIVERED (Pass 500s)**                                                 | Done — GPS comparison + OSRM re-query live           |
| Multi-stop routing                      | Route optimization for multiple shop visits / pickup-delivery                                                           | OSRM trip service or custom optimization             |
| ~~Site-wide glass design system~~       | ~~Unified Apple-inspired visual identity~~ **LARGELY DELIVERED** (bd-glass-\* tokens, theme.css, globalSurfaceTheme.ts) | Stage 3b forms/tables remaining                      |
| Marketplace-aware map discovery         | Show real-time bid activity, shop ratings, repair capacity on map                                                       | Live Supabase subscriptions + map marker enrichment  |

## Design System Direction — Apple-Inspired Expansion

### 1. Current State

The map surface implements a royal-blue glass design language (Theme 5 in the Map Master Plan):

- Rounded controls with blue gradient fills and inner glow
- Glass-effect overlays with `backdrop-blur` layering
- Floating animation (`map-glass-float`) for ambient movement
- Tone-aware light/dark palette via `mapSurfaceTheme.ts`
- Compact mobile controls maintaining tap-target comfort
- All glass/blur CSS is currently scoped to `.coverage-map-surface` and `.map-*` classes in `theme.css`

The rest of the site uses completely separate styling. Integration status:

| Surface                   | Uses Map Tokens | Uses Glass/Blur                                 | Integration Barrier |
| ------------------------- | --------------- | ----------------------------------------------- | ------------------- |
| Map surfaces              | Yes             | Yes                                             | N/A — source        |
| Coverage landing sections | Yes             | Yes                                             | Low                 |
| DashboardCoveragePanel    | Yes             | Yes (bd-glass-panel/card)                       | Wired               |
| DashboardLayout (shell)   | No              | MobileBottomNav only                            | High                |
| HomeScreen (customer)     | Yes             | Yes — CustomerMapWidget + glass cards           | Wired               |
| ShopActiveJobsScreen      | No              | No                                              | High                |
| InsurerClaimsScreen       | No              | No                                              | High                |
| ProfileDropdown           | No              | No                                              | High                |
| Landing hero/benefits/CTA | Yes             | Yes — bd-glass-card/badge/floating, navy footer | Delivered (Pass 1)  |

### 2. Productizing Stage

Make the design system usable outside maps so adoption can begin.

| Step                        | What                                                                                                              | Files Touched     | Acceptance                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| 2a. Token extraction        | Add `--bd-royal-blue`, `--bd-royal-blue-strong`, `--bd-royal-blue-soft` CSS custom properties to `:root`          | `theme.css`       | Properties available in DevTools on any page                                   |
| 2b. Global glass classes    | Create `.bd-glass-panel`, `.bd-glass-card`, `.bd-glass-badge` (non-map-scoped) alongside existing `.map-liquid-*` | `theme.css`       | Classes can be applied to any element, not just inside `.coverage-map-surface` |
| 2c. Low-barrier adoption    | Adopt glass tokens in `DashboardCoveragePanel.tsx` outer shell, `MobileBottomNav.tsx`, `ProfileDropdown.tsx`      | 3 component files | Visual glass treatment visible on dashboard                                    |
| 2d. Landing header adoption | Use consistent royal-blue palette tokens in `LandingPageHeader.tsx`                                               | 1 component file  | Header visually matches map control palette                                    |

**Role implications:** Affects all roles equally — these are shared shell surfaces.

### 3. Aspirational Stage

Full site-wide Apple-inspired identity unification.

| Step                              | What                                                                                                                        | Files Touched                 | Acceptance                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------ |
| 3a. Role dashboard cards          | `HomeScreen.tsx` stat cards, `ShopActiveJobsScreen.tsx` job cards, `InsurerClaimsScreen.tsx` claim cards adopt glass tokens | 3 screen files                | Role dashboards visually match map quality |
| 3b. Dashboard shell               | `DashboardLayout.tsx` sidebar + top bar get glass shell treatment                                                           | 1 layout file                 | Entire dashboard feels like a native app   |
| 3c. Landing unification           | All landing sections adopt royal-blue depth/palette                                                                         | ~8 landing component files    | **Delivered (Pass 1, 2026-03-22)**         |
| 3d. Theme function generalization | Extract `mapSurfaceTheme.ts` → `globalSurfaceTheme.ts` serving both map and non-map surfaces                                | 1 new file + consumer updates | Single theme function for entire app       |

**Role implications:**

- **Customer:** Stat cards (active requests, bids, repairs, savings) get royal-blue glass treatment
- **Shop:** Job cards with status badges adopt tone-aware glass + list card tokens
- **Insurer:** Claim cards with priority badges adopt strong-panel glass treatment

### 4. Technical Prerequisites

| Prerequisite                                 | Needed For  | Exists Today                                           |
| -------------------------------------------- | ----------- | ------------------------------------------------------ |
| CSS custom properties for royal-blue palette | Stage 2a    | **Yes** — `--bd-royal-blue-*` in `:root`               |
| Non-map-scoped glass utility classes         | Stage 2b    | **Yes** — `bd-glass-panel/card/badge/control/floating` |
| Dark mode support in all non-map surfaces    | Stage 3a-3c | Partial — map has it, dashboards do not                |
| `getGlobalSurfaceTheme(tone)` function       | Stage 3d    | No                                                     |

### 5. UI/UX Evolution Path

1. **Now:** Map surfaces are glass-forward; rest of site is flat Tailwind with slate palette
2. **After Stage 2:** Shared surfaces (nav, profile, coverage panel) feel cohesive with maps
3. **After Stage 3a:** Each role's dashboard cards match map visual quality
4. **After Stage 3b-3c:** Entire product feels like one Apple-inspired native app
5. **Final state:** User cannot tell where "map design" ends and "app design" begins

### 6. What Should NOT Be Built Yet

- Do not force glass effects on forms, dense tables, or data-entry surfaces — flat treatment is better there
- Do not create a component library abstraction — keep it as Tailwind classes + theme function
- Do not change the map design language to accommodate other surfaces — other surfaces adopt map's language
- Do not skip Stage 2 prerequisites when working on Stage 3 adoption
- Do not attempt dark mode for non-map surfaces until the royal-blue palette tokens exist globally

## Role-Specific Future Map Intelligence

> **Archived:** Full role-specific future map intelligence (Customer, Shop, Insurer) and Navigation Productization Roadmap moved to `docs/archive/PRODUCT_BRAIN_FUTURE_MAP_INTEL.md` (Pass 537). Quick Reference Cards above contain the essential planning info.

## Upgrade Checklists

These checklists turn the 6-part plans into mechanical step-by-step execution guides. Follow them in order.

### Checklist: Navigation Reliability (Productizing Stage)

**READ:** "Navigation Productization Roadmap" → sections 1 and 2 in this doc.

**CHANGE (in this order):**

1. ~~**Error boundary** — Create `NavigationErrorBoundary.tsx` in `components/maps/`. Wrap all navigation panel content. Catches render errors, shows recovery UI.~~ ✅ Delivered 2026-03-22. Class component boundary wraps planner + discovery/saved panels in `CoverageBrowseExperience`. Fallback: `bd-glass-card` with amber warning icon, calm message, retry button.
2. ~~**GPS degradation** — In `useCoverageNavigationExperience.ts`, add a `gpsStatus` state (`active | lost | stale`). When `watchPosition` errors or goes >10s without update, set `lost`. Show warning banner in the navigation panel.~~ ✅ Delivered 2026-03-22. `gpsStatus` state + 3s staleness interval + inline rose/amber warning banner in planner.
3. **Network error handling** — In `services/navigation/routeEngine.ts`, wrap OSRM fetch in try/catch. Return a typed error result instead of throwing. Surface in UI as "Route unavailable — check connection."
4. ~~**Speed fallback** — In `services/navigation/speedLimit.ts`, when Overpass returns empty or errors, return `{ available: false }`. UI shows "Speed limit unavailable" instead of blank/stale.~~ ✅ Delivered 2026-03-22. `speedLimitStatus` state (`off | waiting | loading | available | unavailable`) in hook + inline slate banner in planner when unavailable.
5. **Deviation detection** — Create `services/navigation/deviationDetector.ts`. Compare current GPS position to route polyline. If >200m off-route for >5s, emit deviation event. Hook shows reroute prompt.
6. **Cross-browser voice** — Test `voiceGuidance.ts` across Chrome, Safari, Firefox, mobile. Document known issues in a code comment at the top of the file.

**IMPLEMENTATION SHAPE:** Six focused changes across 4-5 files. Do NOT add all of this into one component. Each numbered item is a separate mini-pass. A single PR can contain multiple items but each should be its own commit with a clear scope.

**TEST:** GPS loss → warning in 3s. OSRM failure → error message, no crash. Overpass empty → "unavailable" label. Deviation → prompt.

**UPDATE DOCS:** Update tier classification from Tier 2 to Tier 1 for completed items. Update Map Tracker "Staged Future Roadmap" status from "Planned" to "Delivered."

---

### Checklist: Design Token Extraction (Stage 2a-2b)

**READ:** "Design System Direction" → sections 1 and 2 in this doc.

**CHANGE (in this order):**

1. **CSS custom properties** — In `src/styles/theme.css`, add to `:root`:
   - `--bd-royal-blue: #2563eb`
   - `--bd-royal-blue-strong: #1d4ed8`
   - `--bd-royal-blue-soft: #93c5fd`
   - `--bd-glass-blur: 12px`
   - `--bd-glass-bg: rgba(37, 99, 235, 0.08)`
2. **Global glass classes** — In `theme.css`, add `.bd-glass-panel`, `.bd-glass-card`, `.bd-glass-badge` NOT scoped inside `.coverage-map-surface`. Use the new custom properties.
3. **Verify independence** — Confirm the new classes render correctly on any element outside the map surface.

**IMPLEMENTATION SHAPE:** This is a CSS-only change. One file, ~30-50 new lines. Do NOT touch any component files in this step. The classes must exist and work BEFORE any component adopts them.

**TEST:** Open DevTools → Elements → any page element → apply `.bd-glass-panel` → glass effect appears. Custom properties visible on `:root`.

**UPDATE DOCS:** Update Design System Direction Stage 2a-2b status. Tracker "Design token extraction" → "Delivered."

---

### Checklist: Design Token Adoption (Stage 2c-2d)

**READ:** "Design System Direction" → section 2 table (Steps 2c-2d) in this doc.

**CHANGE (in this order):**

1. **DashboardCoveragePanel.tsx** — Replace outer container's Tailwind background/border with `bd-glass-panel` class + `--bd-royal-blue` accent.
2. **MobileBottomNav.tsx** — Adopt glass panel treatment on the nav bar background.
3. **ProfileDropdown.tsx** — Adopt glass panel + list card tokens on the dropdown container.
4. **LandingPageHeader.tsx** — Use `--bd-royal-blue` palette tokens in place of existing color values.

**IMPLEMENTATION SHAPE:** Four small component edits. Each is 5-15 lines changed. Do them in separate commits. Do NOT change layout, spacing, or functionality — only visual treatment.

**TEST:** Dashboard, mobile nav, profile dropdown, and landing header visually match map control palette. Dark mode still works where supported.

**UPDATE DOCS:** Update Design System Direction Stage 2c-2d status. Tracker → "Delivered."

---

### Checklist: Customer Nearest-Shops Widget

**READ:** "Customer Map Intelligence" → sections 1 and 2 in this doc.

**CHANGE (in this order):**

1. **Widget component** — Create `components/maps/CustomerNearestShopsWidget.tsx`. Compact card list (3-5 shops) with distance and rating. Consumes `useCoveragePartnerShops()`.
2. ~~**Dashboard integration** — Import widget into `components/codelayer/HomeScreen.tsx`. Place below stat cards or in a visible dashboard slot.~~ ✅ Delivered 2026-03-22. `DashboardCoveragePanel` wired into HomeScreen between stats grid and content grid. Full coverage command center with map dialog, not just a compact widget.
3. **Expand action** — Tapping a shop opens `CoverageMapDialog` centered on that shop.
4. **Demo support** — Widget must render with demo shop data when in demo mode.

**IMPLEMENTATION SHAPE:** One new component file (~100-150 lines). One small edit to HomeScreen (~10-15 lines added). Do NOT embed the widget logic inside HomeScreen — keep it as a standalone component.

**TEST:** Customer dashboard shows nearest shops with real/demo data. Tap opens map. Works on mobile.

**UPDATE DOCS:** Update Customer Map Intelligence status from Tier 3 to Tier 2 for "Nearest partner shops." Tracker near-term row → "Delivered."

---

## Change Impact Index

Before modifying any system, check this index to understand what gets affected.

| IF YOU CHANGE                  | CHECK DOCS                                                                 | TOUCH FILES                                                                              | RISKS                                                                                        | DO NOT FORGET                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Navigation services**        | Product Brain "Nav Roadmap", Map Master Plan "Theme A", Phase 2 "Pillar 1" | `services/navigation/*`, `useCoverageNavigationExperience.ts`, navigation map components | Browser API differences can break silently. localStorage shape changes break saved sessions. | Update Map Tracker status. Test on Chrome + Safari + Firefox.                       |
| **Map visual design**          | Product Brain "Design System Direction", Map Master Plan "Theme 5-6"       | `theme.css`, `mapSurfaceTheme.ts`, map components in `components/maps/`                  | Map-scoped CSS can bleed if selectors are wrong. Dark mode regressions.                      | Test both light and dark tones. Mobile and desktop.                                 |
| **Design tokens (non-map)**    | Product Brain "Design System Direction" Stage 2+                           | `theme.css` (`:root` properties), consuming component files                              | Glass effects on forms/tables are a bad idea. Performance on low-end devices.                | Do NOT adopt tokens in data-entry surfaces. Verify Stage 2a-2b prerequisites exist. |
| **Supabase schema**            | Product Brain "Supabase Reality", Phase 2 "Section 3"                      | `supabase/migrations/`, `services/supabase/*`, edge function handlers                    | Migration ordering matters. `clerk_user_id` vs `user_id` mismatch still exists.              | Do NOT break existing migration chain. Test with real Supabase project.             |
| **Customer dashboard**         | Product Brain "Customer Experience Map"                                    | `components/codelayer/HomeScreen.tsx`, `DashboardRouter.tsx`                             | HomeScreen is in `codelayer/` — do not casually relocate. State-driven routing.              | Demo mode must still work. Check `useNavigation` tab/view state.                    |
| **Shop dashboard**             | Product Brain "Shop Experience Map"                                        | `components/shop/*`, `components/codelayer/HomeScreen.tsx` (shop variant)                | Data is mostly sample/mock. Extending requires checking Supabase integration.                | Demo mode must still work. Mock → real data transitions must be explicit.           |
| **Insurer dashboard**          | Product Brain "Insurer Experience Map"                                     | `components/insurer/*`, `components/codelayer/HomeScreen.tsx` (insurer variant)          | Data is mostly sample/mock. Claims workflow not fully wired.                                 | Demo mode must still work.                                                          |
| **Map tile/provider**          | Map Master Plan "Theme C", Product Brain "Provider Evolution"              | `ServiceCoverageMap.tsx`, tile layer config, `mapSurfaceTheme.ts`                        | Provider migration affects the entire map surface. Attribution requirements differ.          | Only migrate when a specific trigger justifies it. See decision framework.          |
| **Routing/hooks architecture** | Product Brain "Architecture In One Pass"                                   | `useNavigation.ts`, `DashboardRouter.tsx`, `App.tsx`                                     | App is state-driven, NOT React Router. Changing view names affects localStorage.             | Test full app flow — landing → dashboard → detail → back. All roles.                |
| **Edge functions**             | Product Brain "Backend Shape"                                              | `supabase/functions/server/*`                                                            | `clerk_user_id` vs `user_id` mismatch. Service-role access.                                  | Verify both frontend direct reads and handler paths work after changes.             |

---

## Implementation Shape Guardrails

**These are not suggestions. These are standing rules for all future work on BidOnDent — by humans and AI agents alike.**

### File Size Rules

- A large file is not automatically bad, but **adding major new responsibilities to already-large files is not allowed.**
- If a file is already 500+ lines, future changes should **extract focused modules** rather than deepening the file.
- **ShopDirectoryScreen.tsx** (494 lines) and **DashboardRouter.tsx** (452 lines) were reduced to under 500 by extraction sweep (Passes 540-562). All files now comply with the 500-line hard cap.
- **Threshold rule:** If a single change would add 100+ lines to a file, stop and evaluate whether the new code belongs in a separate module.

### Responsibility Separation

Do NOT pack multiple concerns into a single file. If a change touches 3+ of these, it must be split:

| Concern                            | Where It Belongs                 |
| ---------------------------------- | -------------------------------- |
| Data fetching / API calls          | `services/` layer                |
| State orchestration / side effects | `hooks/` layer                   |
| Business logic / calculations      | `utils/` or `services/`          |
| Data transformation / formatting   | dedicated helper or `utils/`     |
| Visual rendering / UI              | `components/` layer              |
| Diagnostics / telemetry            | `services/navigation/*.check.ts` |

**Anti-pattern to avoid:**

```
// BAD: One component doing fetch + transform + state + render + diagnostics
export function BigFeatureScreen() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/...')           // ← data fetching
      .then(r => r.json())
      .then(d => {
        const transformed = d.map(/*...*/); // ← transformation
        setData(transformed);               // ← state
        logDiagnostic(transformed);         // ← diagnostics
      });
  }, []);
  return <div>/* 200 lines of JSX */</div>; // ← rendering
}
```

**Correct pattern:**

```
// Service: services/myFeature/myFeatureService.ts  (fetch + transform)
// Hook:    hooks/useMyFeature.ts                    (state + orchestration)
// Component: components/myFeature/MyFeaturePanel.tsx (render only)
```

### Staged Expansion Rules

1. **Do not build the full vision in one pass.** Follow the tier system: Productizing items first, then Aspirational.
2. **One PR = one responsibility.** A PR can have multiple commits but they should share a single theme.
3. **New features integrate in layers**, not by pasting into the nearest existing screen.
4. **Prefer adding one new focused file** over inflating an existing large file.
5. **Keep naming boring, clear, and scalable.** `CustomerShopWidget.tsx` not `EnhancedMapSurfaceV2.tsx`.

### Code Organization Expectations

- Preserve the existing folder structure: `components/[role]/`, `services/[domain]/`, `hooks/`.
- Do not create parallel mini-architectures. One state management pattern. One service layer pattern.
- Do not scatter top-level routing logic across random screen files — keep it in `useNavigation.ts` and `DashboardRouter.tsx`.
- Do not delete `codelayer/` screens without migrating all consumers.
- Do not create one-off fetch logic inside components — extend the service modules.

---

## Change Recipes

Reusable step-by-step instructions for the most common future changes.

### Recipe: Add Glass Design Treatment to a New Surface

**PURPOSE:** Apply the royal-blue glass visual language to a non-map component.

**START HERE:** Read Quick Card "Design System Expansion." Confirm Stage 2a-2b prerequisites exist (CSS custom properties + global glass classes in `theme.css`).

**TOUCH:** The target component file only.

**IMPLEMENT IN THIS ORDER:**

1. Identify the container element that should receive glass treatment.
2. Add `bd-glass-panel` (or `bd-glass-card` / `bd-glass-badge`) class to the container.
3. Replace hardcoded color values with `var(--bd-royal-blue)` variants where appropriate.
4. Test light and dark tones if the surface supports dark mode.
5. Test on mobile — verify touch targets are not obscured by blur effects.
6. Do NOT apply glass to forms, dense tables, or data-entry surfaces.

**VERIFY:** Glass effect renders. Dark mode works. Mobile layout intact. No regressions in adjacent components.

**DOC UPDATES:** Update Design System Direction integration status table. Update Map Tracker if relevant.

---

### Recipe: Add Graceful Degradation to a Navigation Feature

**PURPOSE:** Make an existing navigation capability handle failure without crashing or showing stale data.

**START HERE:** Read Quick Card "Navigation Productization." Identify which capability needs degradation handling.

**TOUCH:** The relevant service file in `services/navigation/` + the consuming hook or component.

**IMPLEMENT IN THIS ORDER:**

1. In the service file, wrap the external API call in try/catch.
2. Return a typed result: `{ success: true, data } | { success: false, error }`.
3. In the consuming hook, add a state for the degraded condition (e.g., `gpsStatus: 'lost'`).
4. In the component, render a visible warning/fallback when degraded.
5. Add the degraded state to any existing diagnostics check if one exists.

**VERIFY:** Simulate failure (disable network, mock GPS loss). UI shows clear warning. App does not crash. Recovery works when the condition resolves.

**DOC UPDATES:** Update Navigation Roadmap tier status. Update Map Tracker.

---

### Recipe: Add a New Supabase-Backed Map Intelligence Feature

**PURPOSE:** Add a new role-specific map feature that requires a new Supabase table.

**START HERE:** Read the relevant role Quick Card (Customer/Shop/Insurer). Read the relevant 6-part plan.

**TOUCH:** New Supabase migration, new service file, new hook (optional), new component.

**IMPLEMENT IN THIS ORDER:**

1. **Migration first** — Create `supabase/migrations/XXX_create_[table_name].sql`. Define schema. Include RLS policies.
2. **Service layer** — Create `services/supabase/[tableName].ts` or add to an existing service. Typed CRUD operations.
3. **Hook (if needed)** — Create `hooks/use[FeatureName].ts` for state orchestration. Consume the service.
4. **Component** — Create `components/maps/[FeatureName]Widget.tsx` (or role-appropriate folder). Consume the hook.
5. **Dashboard integration** — Import widget into the relevant `HomeScreen.tsx` variant.
6. **Demo mode** — Ensure the component renders with sensible demo data when in demo mode.

**VERIFY:** Data persists in Supabase. Component renders with real and demo data. Works on mobile. RLS policies enforced.

**DOC UPDATES:** Update the relevant role's Map Intelligence section. Move Tier 3 → Tier 2 for the completed feature. Update Map Tracker.

---

## Instructions for Future Agents

When working on BidOnDent, follow these principles. **Also read the Implementation Shape Guardrails section above — those are standing rules, not suggestions.**

### Before Any Map or Design Change

1. Read the implementation reality table above — know what is Tier 1/2/3
2. Check the Map Master Plan for relevant themes and non-negotiables
3. Check the Map Tracker for active risks and recent delivery context
4. Check the Phase 2 doc for architecture truth and Phase 3 direction
5. Do not build Tier 3 features without explicit user request — document them, do not implement them

### For Design System Work

1. Do not add glass effects to surfaces that should stay flat (forms, dense tables, data entry)
2. New glass/blur/animation CSS should go in `theme.css` using `bd-*` or `map-*` prefixes
3. Prefer extending `mapSurfaceTheme.ts` tokens over inventing parallel design systems
4. Test both light and dark tones for any glass-treated surface
5. Follow the staged adoption plan above — do not skip stages

### For Navigation Work

1. Current navigation features are Tier 2 (Productizing) — they work but have reliability gaps
2. Prioritize reliability (Level 2) over new features (Level 3+)
3. Do not add new navigation capabilities without addressing existing graceful-degradation gaps first
4. All navigation persistence changes must respect the non-negotiable: Supabase is source of truth, localStorage is cache only

### For Role-Specific Features

1. Customer flows are most real — they are the safest to extend
2. Shop and insurer flows have strong UI but partial data wiring — extending them requires checking the actual Supabase integration
3. Demo mode is first-class — any new role-specific feature should work in demo mode too
4. Map intelligence features for each role should follow the staged plan above — do not build long-term features before near-term ones

### For Code Organization and File Size

1. **Read the Implementation Shape Guardrails section before writing any code** — it defines file-size limits, responsibility separation rules, and anti-patterns
2. If the file you are editing is already 500+ lines, extract a new focused module rather than deepening the file
3. If your change touches data fetching + transformation + rendering, split into service → hook → component
4. Do not create parallel architectures or new state management patterns — follow the existing conventions
5. Future code should be organized so another AI can extend it without reverse-engineering a monster component
6. Name files clearly and boringly — `CustomerShopWidget.tsx` not `EnhancedMapSurfaceV2.tsx`

### For Documentation

1. Every map change updates both map docs (Master Plan + Tracker) per the non-negotiable
2. Every feature maturity change updates the tier classification in this Product Brain
3. Keep the three-tier system honest — do not promote features to Tier 1 until reliability gaps are addressed
4. Update the Phase 2 truth table when implementation status changes

## Bottom Line

BidOnDent is already shaped like a serious marketplace product, not a toy demo. The main job going forward is not inventing what it is from scratch. The main job is tightening the seams between:

- polished frontend experiences
- real data models
- role-to-role workflows
- auth and persistence consistency

The future direction is clear:

1. **Productize** existing navigation capabilities (reliability → polish → marketplace awareness)
2. **Expand** the royal-blue glass design language from maps to the entire site, gradually
3. **Build** role-specific map intelligence surfaces for customers, shops, and insurers
4. **Strengthen** the documentation system so it operates as a coherent planning layer, not isolated notes

That is the path from "looks like the platform" to "is the platform."
