# BidOnDent — New Session Master Prompt

> **Copy-paste this into a fresh chat to resume autopilot work on BidOnDent.**

---

## Start Here

Read `docs/CLAUDE_AI_MASTER_CONTEXT.md` first — it is the single source of truth for product context, architecture, design system, current state, map program status, and next priorities. Also read `.github/copilot-instructions.md` for execution discipline and quality rules.

## Project Summary

**BidOnDent** is a map-first marketplace for automotive dent repair. React 18 + TypeScript + Vite 6.4.1, deployed via Vercel. MapLibre GL JS 5.21.1 WebGL engine with OSRM routing, Nominatim search, and Web Speech API British voice navigation. Clerk for auth, Supabase for backend.

- **Branch:** `BidOnDent-Horizon-Beta`
- **Build:** `npm run build` — 0 errors, ~3.2s
- **Dev server:** `npm run dev` → localhost:5173

## Current State (as of Pass 500, April 2, 2026)

### What's Working

- Full MapLibre GL JS WebGL map engine (Leaflet fully removed at Pass 448)
- Three tile modes: roadmap (CARTO Voyager), night (CARTO Dark), satellite (Esri)
- OSRM-backed real routing with 3 alternatives, 15s timeout, distance-based fallback
- Turn-by-turn navigation with spoken British voice guidance (Web Speech API)
- GPS tracking, heading cone, speed display, speed limit monitoring
- Route deviation detection + auto-reroute with semantic voice dedup (10s cooldown)
- Address search via Nominatim with circuit breaker + 1-hour cache TTL
- Shop directory with clustering, AI fit scoring, smart filtering
- Report creation with photo upload (Supabase Storage)
- Premium glass design system (`mapSurfaceTheme.ts` + `bd-glass-*` custom properties)
- **Both landing page and dashboard maps now share unified blue-accented glass aesthetic** (Pass 500)
- Voice utterance safety: 200-char cap + Chrome resume watchdog (Pass 498)
- Shop marker touch targets: 44px minimum at zoom 15 (Pass 499)
- Platform-specific GPS error recovery (iOS vs Android/desktop) (Pass 497)
- Mobile-first layout: 375px minimum, 44px touch targets, safe-area spacing

### What's NOT Working / Needs Backend

- **Request Estimate**: Currently shows "Coming Soon" toast — needs `estimate_requests` Supabase table + edge function
- **Real shop data**: Demo shops only — needs `shops` Supabase table with location-based queries
- **Saved shops Supabase sync**: localStorage only — needs cloud persistence edge function
- **Bid acceptance flow**: Frontend UI exists, backend logic missing
- **Push notifications**: Not started
- **Payment processing**: Not started

### Known Remaining Frontend Gaps

- Offline/network detection during navigation (no `navigator.onLine` listener)
- Route layer explicit removal on navigation end (conditional rendering works but no cleanup)
- Voice long utterance Chrome stall: defended but not chunked (low probability issue)

## Architecture Rules

```
services/   = data/domain logic only — no React, no UI state
hooks/      = orchestration/state lifecycle — bridges services ↔ components
components/ = rendering + local interaction only — calls hooks, not services directly
utils/      = transforms/formatting/calculations — pure functions only
```

- Clerk = identity, Supabase = backend (via edge functions, never direct from components)
- File soft limit: 300 lines. Hard limit: 500 lines. Extract before deepening.
- Reuse existing services/hooks/components before creating new ones.

## Design System

- Target aesthetic: dark mode, royal blue accents, liquid glass overlays, Apple Maps-style hierarchy
- Landing page glass: `mapSurfaceTheme.ts` — `getMapSurfaceTheme(tone)` returns full token set
- Dashboard glass: `useOverlayTokens(isDark)` — now aligned with landing page (blue-accented gradients)
- Both maps share: CARTO tiles, OSRM routing, MapLibre popup CSS, navigation services
- CSS custom properties: `--bd-glass-*` in `theme.css`

## Key Files

### Map Components

- `src/app/components/maps/MapLibreServiceCoverageMap.tsx` — Landing page map
- `src/app/components/maps/mapSurfaceTheme.ts` — Landing page glass token system
- `src/app/components/maps/MapSurfaceControls.tsx` — Landing page tile/focus/expand controls
- `src/app/components/shop/MapLibreShopDirectoryMapPane.tsx` — Dashboard full-screen map
- `src/app/components/shop/ShopDirectoryMapLayers.tsx` — Shop markers, routes, GPS, nav steps
- `src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx` — Dashboard header/bottom overlays
- `src/app/components/shop/ShopDirectoryMapPaneInlineUI.tsx` — Tile picker, loading, empty state
- `src/app/components/shop/ShopDirectoryMapPopup.tsx` — Shop info popup on map

### Navigation Services

- `src/app/services/navigation/routeEngine.ts` — OSRM fetch, route parsing, step generation
- `src/app/services/navigation/voiceGuidance.ts` — Speech synthesis with safety guardrails
- `src/app/services/navigation/voiceSupport.ts` — Browser support detection, speech priming
- `src/app/services/navigation/addressSearch.ts` — Nominatim geocoding with circuit breaker
- `src/app/services/navigation/providerHealth.ts` — Circuit breaker (3 failures → 90s cooldown)

### Navigation Hooks

- `src/app/hooks/useCoverageNavigationExperience.ts` — Master navigation orchestrator
- `src/app/hooks/useNavigationRoutePreview.ts` — OSRM route fetch + fallback
- `src/app/hooks/useNavigationGpsTracking.ts` — GPS watch + speed limit
- `src/app/features/navigation/useNavigationVoiceAlerts.ts` — Deviation/reroute voice events

### Docs (operating system)

- `docs/CLAUDE_AI_MASTER_CONTEXT.md` — Primary master context (read first)
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — Every pass since the map program began
- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — Strategic map law
- `docs/BIDONDENT_PRODUCT_BRAIN.md` — Product execution framework
- `docs/CODE_ORGANIZATION_AUDIT.md` — Weak seams, safe boundaries

## Build & Quality Commands

```bash
npm run build          # Vite build — target: 0 errors, ~3.2s
npm run dev            # Dev server → localhost:5173
# Do NOT use: npx tsc --noEmit (resolves wrong package)
```

## Execution Discipline

1. **One pass = one coherent change.** Each buildable, testable, documentable.
2. **Impact-first**: P0/P1 before P4/P5. Build-breaking before cosmetic.
3. **Mobile-first**: Every UI change validated at 375px. Touch targets 44px minimum.
4. **Map is the product**: Every pass must strengthen the report→map→shop→action loop.
5. **Always-run quality loop**: Build → diagnostics → spellcheck → mobile/desktop.
6. **Update docs**: Map Tracker + Master Context after every pass.
7. **Hard stop rules**: Ask before deleting >3 files, touching auth/payment, or if build fails after 2 fix attempts.

## Recommended Next Passes

### High Priority (P2-P3)

1. **Offline detection during navigation** — Add `navigator.onLine` + window offline/online events in `useCoverageNavigationExperience`. Show toast, pause voice, prevent stale route fetches.
2. **Backend: Request Estimate** — Create `estimate_requests` Supabase table + edge function. Wire frontend's "Coming Soon" toast to real submission.
3. **Backend: Real shop data** — Create `shops` Supabase table with PostGIS location queries. Replace demo shop data.

### Medium Priority (P3-P4)

4. **Supabase saved-shops sync** — Edge function for bookmarked shops cloud persistence
5. **Route layer explicit cleanup** — Remove MapLibre layers on navigation end (vs relying on conditional render)
6. **Share ETA functionality** — The "Share ETA" button in route preview needs implementation

### Design Polish (P4)

7. **Landing page full-screen expansion** — When user clicks "Expand" on landing page coverage map, match the dashboard's truly full-screen experience (no header, no rounded corners)
8. **Night mode starfield** — Port the landing page's starfield ambient overlay to dashboard night mode

## Continue Command

Say **"continue"** to start the autopilot. The AI will:

1. Read `docs/CLAUDE_AI_MASTER_CONTEXT.md`
2. Audit for highest-impact next pass
3. Execute one pass at a time with full quality loop
4. Update docs after each pass
5. Report results in the standard pass format
