# BidOnDent — Product Future Cards (PLAN)

**Authority level:** PLAN — forward-looking work cards extracted from the original `PLAN_PRODUCT_BRAIN.md` during Phase 1.5c of the v3.3 master plan (2026-05-04).

**Last updated:** 2026-05-04

**Purpose:** Read **one card** to understand a system upgrade, what's delivered, what's next, and what NOT to do. These cards are deliberate primary entry points — a future agent should be able to read one card and one [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) phase and begin correct work without consulting 1,000+ lines of context.

**Source:** Originally lived in `PLAN_PRODUCT_BRAIN.md` "Quick Reference — System Upgrade Cards." Full original context (architecture, screen maps, 6-part plans) preserved at [`docs/archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md`](archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md).

**Authority:** These are PLAN-tier — future direction, not current truth. Do not act on them without a fired trigger or owner naming. For current truth, read [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md). For execution authority, read [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md).

---

## How to read a card

Each card has six fields:

- **STATE** — what's delivered now, what tier (1=spec only, 2=partial, 3=delivered)
- **NEXT MOVE** — the next concrete step
- **TOUCHES** — files or modules that change
- **DO NOT** — anti-patterns specific to this work
- **VERIFY** — how to confirm the change worked
- **UNLOCKS** — what becomes possible once this ships

Read one card. Start work. Verify. Update the card.

---

## CARD: Navigation Productization

(Currently a section header without body content — see archived original. Future-pass scope: turn-by-turn nav engine productization. Tracked in [`PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md`](archive/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY_archived_2026-05-04.md) for now; will be absorbed into `PLAN_MAP_MASTER.md` per Phase 1.5d.)

---

## CARD: Navigation Session Cloud Sync (Pass 19)

- **STATE:** Tier 3 (Delivered in code, backend-dependent in runtime). Navigation session state is designed to persist in Supabase (`navigation_sessions` table) with localStorage as cache. If the connected backend is missing `navigation_sessions`, the client now temporarily falls back to local-only session storage and suppresses repeat cloud sync calls until schema parity is restored.
- **DELIVERED (2026-03-23):** Navigation session cloud sync, persistent session memory, and cross-device continuity. Build, diagnostics, and spellcheck all clean. Session persistence verified after reload and across devices.
- **TOUCHES:** `supabase/migrations/009_create_navigation_sessions.sql`, `src/app/services/navigation/navigationSessionCloudService.ts`, `src/app/features/navigation/useNavigationSession.ts`, `src/app/features/navigation/sessionTypes.ts`
- **DO NOT:** Change navigation UI to accommodate sync. Add sync indicators that distract from driving.
- **VERIFY:** Route session persists after closing browser. Same session loads on different device. localStorage remains as cache/fallback. Session state is always hydrated from Supabase first.
- **UNLOCKS:** Navigation history, cross-device continuity, preferences sync.

---

## CARD: Design System Expansion & Map Vision Alignment (Pass 17)

- **STATE:** Tier 3 active. Royal-blue glass tokens and classes fully deployed: `bd-glass-panel`, `bd-glass-card`, `bd-glass-badge`, `bd-glass-control` (with CSS hover/active), `bd-glass-floating`. Navy dark mode (`#0c1929` base, `#132237` card, `#1c2e47` accent), blue-tinted glass (alice-blue light, blue-glow dark). Unified hover standard `hover:bg-white/40` across all screens. Map surfaces, shell surfaces, HomeScreen, dashboard, reports, shop directory, bids, account screens all on-system. Landing identity convergence delivered (Pass 12) — all 7 primary landing surfaces now visually unified with the map system.
- **MAP VISION:** The final intended map product is **BidOnDent-owned, royal-blue-first, and meaningfully color-coded**. Royal blue is the primary identity, route, and action color; baby/light blue for air/sky/calm; deep ocean blue for depth/premium/spatial confidence; gray-blue/navy for night/dark mode. The map should feel like a branded geographic world, not a generic tile with overlays. **Day/night guidance mode** (automatic switching based on local time/route context) is a planned feature, not yet implemented.
- **NEXT MOVE:** Stage 3b for ShopActiveJobsScreen forms and InsurerClaimsScreen data tables (glass-safe, not forced).
- **TOUCHES:** `src/styles/theme.css` (`:root` + `.dark` properties + `.bd-glass-*` classes), `src/app/theme/globalSurfaceTheme.ts`, `src/app/components/maps/mapSurfaceTheme.ts`.
- **DO NOT:** Force glass on forms/tables/data-entry. Change map glass system without design reason. Use `hover:bg-white/40` (not `hover:bg-slate-50/100` or `hover:bg-gray-50/100`).
- **VERIFY:** CSS custom properties visible in DevTools. `.bd-glass-panel` applies outside `.coverage-map-surface`. Dark mode shows navy (not gray). All hovers are soft glow. Landing hero cycles value statements every 3.8s.
- **UNLOCKS:** Stage 3b form/table glass treatment, remaining role screen glass adoption, full site-wide dark mode identity.
- **DESIGN AUTHORITY:** Defer to [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) (locked apex canon) and [`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md) (implementation snapshot).

---

## CARD: Customer Map Intelligence

- **STATE:** Tier 3 (Delivered). CustomerMapWidget live on HomeScreen. Compact CarPlay-style card showing 5 nearest shops with distance + rating. Tapping any row or "Open Map" button triggers CoverageMapDialog. Works in demo mode with fallback hubs.
- **NEXT MOVE:** Repair status pin on map. Smart shop recommendation routing (insurance-preferred). Distance-based sort refinement.
- **TOUCHES:** `components/dashboard/CustomerMapWidget.tsx`. Consumes `useCoveragePartnerShops()` + `useCoverageNavigationExperience()`. Triggers `CoverageMapDialog`.
- **DO NOT:** Build smart routing before shop-level metadata (turnaround, capacity) exists in Supabase.
- **VERIFY:** Widget shows up to 5 nearest shops with distance/rating. Tapping expands to full map. Demo fallback works.
- **UNLOCKS:** Repair status pin, smart shop recommendation routing, insurance-preferred shop highlighting.

---

## CARD: Shop Map Intelligence

- **STATE:** Tier 3 (Placeholder delivered). ShopMapWidget on shop HomeScreen showing region count, partner density, and operating region pills. Structure-only — real service-area data requires Supabase table.
- **NEXT MOVE:** Create `shop_service_areas` Supabase table. Replace placeholder with live service-area visualization.
- **TOUCHES:** `components/dashboard/ShopMapWidget.tsx`. New Supabase migration when ready.
- **DO NOT:** Build request heatmaps or proximity alerts before the service area table and visualization exist.
- **VERIFY:** Shop sees compact widget with region/partner counts. "Coming soon" message for service-area management.
- **UNLOCKS:** Incoming request heatmap, customer proximity alerts, competitor overlay.

---

## CARD: Insurer Map Intelligence

- **STATE:** Tier 3 (Placeholder delivered). InsurerMapWidget on insurer HomeScreen showing shop count, region count, and average rating. Structure-only — real network analytics require queryable shop data.
- **NEXT MOVE:** Wire real network analytics when shop location data is queryable by region.
- **TOUCHES:** `components/dashboard/InsurerMapWidget.tsx`. Consumes `useCoveragePartnerShops()` for basic stats.
- **DO NOT:** Build claims heatmaps or gap analysis before shop location data is queryable by region.
- **VERIFY:** Insurer sees compact widget with 3-column stats (shops/regions/avg rating). "Coming soon" message for analytics.
- **UNLOCKS:** Claims density analysis, coverage gap detection, route optimization.

---

## CARD: Provider Evolution

- **STATE:** Stable. MapLibre GL JS + react-map-gl + OSRM + Nominatim + Overpass are all live and functional. No rate-limit or renderer-blocking issues observed.
- **NEXT MOVE:** No provider changes needed. Focus on reliability within the current stack.
- **TOUCHES:** Nothing — this card exists to prevent unnecessary work.
- **DO NOT:** Migrate providers for aesthetic reasons. Build a provider abstraction layer before it's needed.
- **VERIFY:** N/A — no change required until a specific trigger (rate limits, feature gap, business justification).
- **UNLOCKS:** Globe rendering (Mapbox GL), traffic-aware routing (Google/TomTom), offline maps (PMTiles).

---

## CARD: Cloud Navigation Persistence

- **STATE:** Tier 3 (Delivered in code, guarded in runtime). Navigation session state persists through Supabase when `navigation_sessions` exists in the connected backend; otherwise the client now mitigates schema drift by falling back to local-only session storage until the backend table is restored. See "Navigation Session Cloud Sync (Pass 19)" above.
- **DELIVERED:** Supabase migration `009_create_navigation_sessions.sql`, `navigationSessionCloudService.ts`, session hydration from Supabase on boot, save on update.
- **DO NOT:** Change navigation UI to accommodate sync. Add sync indicators that distract from driving.
- **VERIFY:** Route session persists after closing browser. Same session loads on different device. localStorage remains as cache/fallback.
- **UNLOCKS:** Navigation history, cross-device continuity, preferences sync.

---

## Cross-references

- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — current execution authority
- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — code organization charter
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED)
- [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) — map strategy
- [`PLAN_POST_LAUNCH_ROADMAP.md`](PLAN_POST_LAUNCH_ROADMAP.md) — deferred work + triggers
- [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) — current architecture truth
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — bug ledger
- [`docs/archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md`](archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md) — full original context
