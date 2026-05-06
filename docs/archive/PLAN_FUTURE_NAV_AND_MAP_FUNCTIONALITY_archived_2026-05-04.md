# PLAN — Future Navigation Engine + Map Functional Buildout

**Authority level:** PLAN — future direction. NOT current truth.
**Created:** 2026-05-03 (Bucket 9 of cloud autopilot master pass).
**Status:** DEFERRED. Owner-driven start signal required.
**Tracking KI:** [`KI-075`](REF_KNOWN_ISSUES.md) — deferred future-nav buildout.
**Trigger:** Post-design-phase. Do NOT execute inside a design pass.

---

## Why this doc exists

The navigation + map UI surfaces are now design-complete and depth-bar compliant after the 2026-05-03 cloud autopilot master pass (commits `ed38beea` → Bucket 9). The functional layer behind those surfaces is partial. Owner directive: "note to fully build out navigation and all other functionality in the future. Focus on design for now."

This doc captures what's wired vs stub today, what needs full buildout, and the conditions under which this scope moves from PLAN to LAW.

**This is not a backlog.** It is a deferred initiative with explicit triggers.

---

## Section 1 — Future Navigation Engine

### What's wired today (UI surfaces shipped + depth-bar compliant)

The visual + interaction shells are done. The buttons exist, the panels exist, the depth bar is on every dark surface. What's behind them is partial:

| Surface / hook                                             | Current state                                                                                       |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `NavigationActionRail.tsx`                                 | UI shipped (Bucket A2 dark depth bar). Action buttons fire callbacks; routing engine not connected. |
| `NavigationActiveManeuverCard.tsx`                         | Card layout shipped. Live maneuver data is mocked.                                                  |
| `NavigationDeviationPrompt.tsx`                            | Alert UI shipped (Bucket A2 depth bar). Re-route logic is stub.                                     |
| `NavigationVoiceControlsSheet.tsx`                         | Sheet layout shipped. Voice TTS not implemented.                                                    |
| `NavigationSavedPlacesPanel.tsx`                           | Panel + list rendering shipped. Persistence is local state only.                                    |
| `useCoverageNavigationExperience.ts`                       | Orchestration hook exists. Routes to MapLibre + scaffolds nav state.                                |
| `useNavigationLifecycleEffects.ts`                         | Lifecycle hooks exist. No real navigation lifecycle yet.                                            |
| `useSavedNavigationLocations.ts`                           | Reads from localStorage. No Supabase backing.                                                       |
| `useNavigationGpsTracking.ts`                              | Geolocation API wired. No deviation detection logic.                                                |
| `useNavigationAddressSearch.ts`                            | Geocoder integration scaffolded. Limited fallback.                                                  |
| `useNavigationRoutePreview.ts`                             | Preview state exists. Real route engine not connected.                                              |
| `useNavigationDiscoveryPlaces.ts`                          | Place discovery scaffolded.                                                                         |
| `useNavigationLaunch.ts`                                   | Launch handshake exists. Engine connection is stub.                                                 |
| `CurrentSpeedBadge.tsx` / `NavigationActiveSpeedPanel.tsx` | UI shipped (Bucket A2). GPS speed feed wired.                                                       |
| `NavigationBrowseDiscoveryPanel.tsx`                       | Browse mode UI shipped.                                                                             |

### What needs real buildout

1. **Turn-by-turn routing engine** — choose provider (e.g., MapLibre routing, Mapbox Directions, OSRM, ORS). Wire real route generation, step decoding, maneuver previews.
2. **Voice prompts (TTS)** — `NavigationVoiceControlsSheet` exposes the toggle but no TTS layer exists. Decide between Web Speech API (free, browser-dependent quality) vs server-side voice generation (consistent quality, latency cost).
3. **Deviation detection + re-route** — `useNavigationGpsTracking` provides position. Need: distance-from-route check, hysteresis to avoid GPS jitter false positives, re-route trigger that updates the active route without losing context.
4. **Saved places persistence** — `useSavedNavigationLocations` currently uses localStorage. Move to Supabase via edge function (must follow `supabase-clerk-edge-function` pattern, JWT verification at the function level).
5. **Route preview + alternates** — `useNavigationRoutePreview` shows one route. Real engine should return alternates with time/distance/traffic comparison.
6. **Lane guidance + traffic-aware rerouting** — provider-dependent. Decision deferred to provider selection step.
7. **ETA accuracy tuning** — depends on routing engine + traffic feed. Stretch goal.
8. **Multi-stop routing** — explicitly out of scope until single-stop nav stabilizes.

---

## Section 2 — Map Functional Buildout

### Provider integration tiers

The current map provider is MapLibre with raster tiles. Functional buildout needs to harden the provider stack:

- **Tier 1 (current):** MapLibre + raster tiles. Works. No routing, no live places.
- **Tier 2 (next):** Add geocoder (already scaffolded), add routing API. Decide between OSRM-self-hosted, Mapbox Directions, ORS, or another provider. Cost + reliability trade-off.
- **Tier 3 (future):** Real-time partner-shop availability + bid state on map markers. Insurer route audit overlays. Heatmaps of demand zones.

### Geocoder hardening

`useNavigationAddressSearch.ts` exists. Needs:

- Fallback strategies when primary geocoder fails (try secondary, then static fallback)
- Autocomplete tuning (debounce, result quality scoring)
- Result deduplication when multiple providers return the same place

### Place search with Supabase-backed favorites

Current saved places are localStorage. Migration plan:

1. Schema: `user_saved_places` table (Postgres + PostGIS for location).
2. Edge function: `getSavedPlaces`, `saveSavedPlace`, `deleteSavedPlace` — all JWT-verified via `requireClerkSession()` (see `supabase-clerk-edge-function` skill).
3. Hydrate on login, cache locally, sync on changes.
4. Conflict resolution if user adds places offline.

### Per-role map layer activation rules

Customer / shop / insurer all see the same map today. Per-role layer activation:

- **Customer:** active reports, partner shops within service area, route preview.
- **Shop:** incoming reports in service area, accepted jobs, route to current job.
- **Insurer:** all claims in coverage region, audit-flagged jobs, partnership network.

These rules don't exist yet. Surface conditions for each role need definition before layer logic ships.

---

## Section 3 — Sequencing & Skill Dependencies

### What blocks what

```
Provider selection (routing engine)
    ↓
Turn-by-turn engine wiring  ←  Voice TTS layer (independent)
    ↓
Deviation detection + re-route
    ↓
Multi-stop routing (deferred)

Geocoder hardening (independent — can ship in parallel with routing)

Supabase saved places
    ↓
Per-role layer activation
    ↓
Tier 3 features (real-time bid state, heatmaps)
```

### Load-bearing skills

- **`supabase-clerk-edge-function`** — every new edge function for nav/places must verify Clerk JWT inside the function via `requireClerkSession()`. `verify_jwt: false` stays pinned in `supabase/config.toml`. Re-enabling gateway verify_jwt will 401 every Clerk-authed request at `UNAUTHORIZED_LEGACY_JWT`.
- **`supabase-storage-signed-urls`** — if any nav feature persists media (e.g., turn screenshots, route maps), follow the `storage://<bucket>/<path>` pointer pattern. Sign on every read via `hydrateSignedStorageUrl()`. Never persist a signed URL.
- **`supabase-pro-cost-control`** — adding edge functions or tables increases compute. Audit the per-project cost when scope expands.
- **`bd-design-identity`** — the visual layer is locked. Functional buildout MUST NOT add new visual surfaces without depth-bar compliance review.

---

## Section 4 — Trigger Conditions (when this moves from PLAN to LAW)

This plan stays DEFERRED until ALL of the following are true:

1. **Owner-driven greenlight.** Mola explicitly says "start the nav buildout." No AI may infer this trigger from design completion alone.
2. **Design phase declared complete.** REF_VISUAL_SYSTEM.md and KI-066 / 069 / 072 / 073 / 074 all stable for at least one sprint without new design issues.
3. **Provider decision made.** Owner picks a routing provider OR delegates to a future planning session that produces a clear choice with costs.
4. **No conflicting LAW changes.** The 6 Laws (`docs/LAW_PROJECT_RULES.md`) and the current execution authority (`docs/LAW_HARDENING_PLAN.md`) must be aligned with starting nav work. If the hardening plan is in soft-launch mode (current state), nav buildout DOES NOT START.

When all four are true, this plan moves from `docs/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` to `docs/LAW_NAV_AND_MAP_BUILDOUT_PLAN.md` (or merges into `LAW_HARDENING_PLAN.md`'s next phase). Until then, the file path stays `PLAN_*` and KI-075 stays DEFERRED.

---

## What this doc is NOT

- A backlog. Don't pull items off this list one-by-one without the full trigger.
- A code-side TODO. Code references in Section 1 are existence checks, not start signals.
- A feature spec. Each item needs its own spec doc when its trigger fires.
- A retrospective. The 2026-05-03 cloud autopilot pass closed the design layer; this doc captures what's left, not what's done.

---

## Cross-references

- `docs/REF_KNOWN_ISSUES.md` `KI-075` — DEFERRED status pointer.
- `docs/PLAN_MAP_MASTER.md` — strategic map vision (currently paused).
- `docs/PLAN_POST_LAUNCH_ROADMAP.md` — broader deferred-work index.
- `docs/REF_SYSTEM_STATE.md` — current architecture.
- `docs/LAW_PROJECT_RULES.md` § 6 Laws — governance for any future buildout.

**End of plan doc.**
