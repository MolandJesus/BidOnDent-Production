# Audit — Map Program Functionality (2026-05-05)

**HEAD:** `708d0d3805b19b62907ec14d172a1f65ab0b1cf7`
**Date:** 2026-05-05
**Auditor:** Sonnet (running inside VS Code agent / Electron browser)
**Scope:** Map Program Functionality Audit (Audit B of dual prompt) — measurement-only, hardening-paused
**Pre-flight:** PARTIAL — see "Pre-flight reconciliation" in companion doc [docs/AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md](docs/AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md)
**Findings count by severity:** P0:1 P1:1 P2:2 P3:1

```yaml
machine_summary:
  head: 708d0d3805b19b62907ec14d172a1f65ab0b1cf7
  date: 2026-05-05
  scope: map_functionality
  pre_flight: partial
  findings:
    P0: 1
    P1: 1
    P2: 2
    P3: 1
  surfaces_audited: [smart_shop_map_immersive]
  surfaces_unreachable:
    [
      landing_coverage_inline,
      landing_full_search,
      landing_full_explore,
      landing_full_saved,
      landing_full_shops,
      active_navigation,
    ]
  contract_passes:
    - search_submit_pass_888_deterministic_commit
    - geolocation_degraded_path_explicit_button
    - shop_pins_distinct_from_report_pins
```

---

## Scope reconciliation

Per § B.1, only the seven **delivered** map surfaces from [`docs/PLAN_MAP_MASTER.md`](docs/PLAN_MAP_MASTER.md) are in scope. Of those seven:

| #   | Surface                                      | Status this pass                                                      |
| --- | -------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Landing coverage inline map                  | **NOT REACHED** — auth-locked dev-demo session                        |
| 2   | Landing fullscreen Search tab                | **NOT REACHED**                                                       |
| 3   | Landing fullscreen Explore tab               | **NOT REACHED**                                                       |
| 4   | Landing fullscreen Saved tab                 | **NOT REACHED**                                                       |
| 5   | Landing fullscreen Shops tab                 | **NOT REACHED**                                                       |
| 6   | Dashboard Smart Shop Map (immersive)         | ✓ FULLY AUDITED                                                       |
| 7   | Active turn-by-turn navigation route preview | **NOT REACHED** — requires GPS permission grant which Electron blocks |

A retest pass against the unauthenticated landing (incognito browser context) is required to close coverage on surfaces 1–5. Surface 7 requires either real GPS or a mocked-coordinate harness inside the browser context.

---

## Findings (Smart Shop Map only — surface #6)

### M-001 [P0] — Basemap tile failures (CartoCDN `net::ERR_ABORTED`)

- **Surface:** Dashboard Smart Shop Map
- **Behavior tested:** § B.2.1 mount + first paint, § B.2.8 CSP / network errors
- **Measured result:** Network panel records 20+ requests against `*.basemaps.cartocdn.com/rastertiles/voyager/*.png` returning `net::ERR_ABORTED`. Verbatim:
  ```
  GET request to https://c.basemaps.cartocdn.com/rastertiles/voyager/7/36/50@2x.png failed: "net::ERR_ABORTED"
  GET request to https://b.basemaps.cartocdn.com/rastertiles/voyager/7/39/49@2x.png failed: "net::ERR_ABORTED"
  GET request to https://a.basemaps.cartocdn.com/rastertiles/voyager/10/299/382@2x.png failed: "net::ERR_ABORTED"
  …
  ```
  CSP allowlist DOES include `https://*.basemaps.cartocdn.com` for `connect-src` and `img-src`, so this is NOT a CSP block. The aborts appear to be runtime cancellations (likely camera-move debounce abort) but the _quantity_ suggests a refetch storm.
- **Expected per spec:** [`docs/PLAN_MAP_MASTER.md`](docs/PLAN_MAP_MASTER.md) "delivered" map chrome continuity baseline assumes tile flow is stable. Repeated `ERR_ABORTED` storm risks tile thrashing on slow networks and noisy console output.
- **Reproduction:** Mount Smart Shop Map at zoom 7. Wait. Pan once. Observe network panel.
- **Network/Console evidence:** see verbatim above; quantified ~20 aborted requests in a 5-second window.
- **Screenshot:** [docs/audit-assets/map-2026-05-05/01-smart-shop-map-light-1440.png](docs/audit-assets/map-2026-05-05/01-smart-shop-map-light-1440.png), [docs/audit-assets/map-2026-05-05/02-smart-shop-map-fullpage-light-1440.png](docs/audit-assets/map-2026-05-05/02-smart-shop-map-fullpage-light-1440.png) — note the visible map _did_ render (West Virginia / Maryland coastline visible) so this isn't a total mount failure; it's a refetch-storm tax.
- **Notes:** Could be a MapLibre `transformRequest` debounce issue, or `setStyle` being called during pan. Worth instrumenting whether the abort count correlates with `setStyle` invocations.

---

### M-002 [P1] — Edge-function 500 with `"Invalid Clerk token issuer"`

- **Surface:** Dashboard (any surface that calls `getMyEstimateRequests`) — observed cascading into Smart Shop Map session
- **Behavior tested:** § B.2.8 CSP / network errors, but specifically the edge-function auth path
- **Measured result:** Verbatim console:
  ```
  Failed to load resource: the server responded with a status of 500 ()
  Failed to load resource: the server responded with a status of 401 ()
  Error in getMyEstimateRequests: EdgeFunctionError: Invalid Clerk token issuer
      at parseSupabaseEdgeResponse (http://localhost:5173/src/app/services/supabase/runtime.ts:168:11)
      at async getMyEstimateRequests (http://localhost:5173/src/app/services/supabase/estimateRequests.ts:25:18)
  ```
  Multiple 500s observed on subsequent loads.
- **Expected per spec:** Skill `supabase-clerk-edge-function` defines the contract: edge functions verify the Clerk JWT inside the handler via `requireClerkSession()`, with `verify_jwt: false` pinned in `supabase/config.toml`. "Invalid Clerk token issuer" indicates the JWT issuer claim does NOT match what the edge function expects — likely a dev-vs-prod Clerk instance mismatch (the dev app holds a Clerk dev key but is hitting a Supabase project whose handler validates a different Clerk environment's issuer).
- **Reproduction:** Load any authenticated dashboard surface. Observe 401/500 in network + console.
- **Network/Console evidence:** quoted above.
- **Screenshot:** N/A (silent in UI; data simply doesn't load — falls back to "No bids" / "0 nearby shops" empty states)
- **Notes:** This silently degrades the dashboard's data freshness while showing UI as if nothing is wrong. Per LAW Law 5, errors should be user-visible. Recommend either (a) align Clerk environments dev↔prod for this dev session, or (b) surface a non-blocking banner when `getMyEstimateRequests` 500s.

---

### M-003 [P2] — Map performance budget breach (pan + zoom)

- **Surface:** Dashboard Smart Shop Map
- **Behavior tested:** § B.2.2 pan + zoom responsiveness, § B.3 FPS
- **Measured result:** Verbatim console (pre-existing entries in browser buffer from prior session):
  ```
  [map-performance] pan interaction exceeded budget: 838ms > 380ms
  [map-performance] zoom interaction exceeded budget: 784ms > 450ms
  [map-performance] pan interaction exceeded budget: 785ms > 380ms
  [map-performance] pan interaction exceeded budget: 746ms > 380ms
  ```
- **Expected per spec:** The codebase has its own self-imposed performance budgets (`pan ≤ 380ms`, `zoom ≤ 450ms`) — these breaches are >2× the budget. § B.3 desktop FPS not directly capturable in this tool; the existing budget-warning system is more useful as evidence.
- **Reproduction:** Pan or zoom Smart Shop Map. Observe `[map-performance]` warnings.
- **Network/Console evidence:** quoted above.
- **Screenshot:** N/A
- **Notes:** Likely correlates with M-001 (tile abort storm). Could also be `framer-motion` / `motion` re-render churn — pan/zoom should be off the React render path. Worth profiling.

---

### M-004 [P2] — Realtime websocket cycling (KI-057 dev-StrictMode pattern, persistent)

- **Surface:** All dashboard routes (cycles every ~3-5 seconds)
- **Behavior tested:** § B.2.7 realtime channel behavior
- **Measured result:** Verbatim console (recurrent):
  ```
  WebSocket connection to 'wss://wmdcnjgtsppftrofaqqa.supabase.co/realtime/v1/websocket?apikey=…'
  failed: WebSocket is closed before the connection is established.
  ```
  Observed 5+ times within the audit window.
- **Expected per spec:** Per § B.2.7 prompt instruction: "open browser console, monitor for KI-057 StrictMode cycling (dev only — note but don't flag as P0)." Confirmed it is the dev-StrictMode double-mount cycling. Production behavior was not tested in this pass.
- **Reproduction:** Load any authenticated surface in dev. Watch console.
- **Network/Console evidence:** quoted above.
- **Screenshot:** N/A
- **Notes:** Verify production build does NOT exhibit this — if it does, it crosses into P1.

---

### M-005 [P3] — Address search submit (Pass 888 contract) — PASSING with note

- **Surface:** Smart Shop Map → Origin search
- **Behavior tested:** § B.2.4 address search submit behavior — "deterministic single-match commits on Find; ambiguous stays explicit"
- **Measured result:** Typed `White Plains, NY` into the Origin input → clicked `Find` → 2,529 ms later the input value resolved to **`City of White Plains`** and the **Save** chip became active. This is a **deterministic single-match commit** per Pass 888.
- **Expected per spec:** [`docs/PLAN_MAP_MASTER.md`](docs/PLAN_MAP_MASTER.md) §"Submitted Address Search Commit Hardening (Pass 888)".
- **Network/Console evidence:** Geocoding likely routed through `nominatim.openstreetmap.org` (allowlisted in CSP); no errors during submit.
- **Screenshot:** [docs/audit-assets/map-2026-05-05/02-smart-shop-map-fullpage-light-1440.png](docs/audit-assets/map-2026-05-05/02-smart-shop-map-fullpage-light-1440.png)
- **Notes:** Only one input case tested (full unique address). Ambiguous-match and garbage-string cases (Pass 888 (b) + (c)) were not exercised. Recommend a follow-up pass with the three full input cases per surface.

---

## Positive verifications (no findings — informational)

- **Mount + first paint:** 1 `canvas.maplibregl-canvas` rendered, 2 `[role=region]` map regions present (the smaller one is the dashboard inline mini-map). Map visible state confirmed via screenshot.
- **Pin distinction (LAW: shops ≠ reports):** 17 markers detected on the map — 15 shop pins (matching the "15 shops" badge) + 2 report markers (`YOUR REPORT` callout for `2014 Mazda Mazda6` visible in screenshot). Visual differentiation confirmed in screenshot (shop cluster on right vs. report card overlay on bottom).
- **Origin chips functional:** All 5 expected chips present (`My Location`, `Yonkers`, `White Plains`, `New Rochelle`, `Spring Valley`).
- **Mode tabs functional:** All expected tabs present (`Hybrid`, `Map`, `List`, `Night`, `Satellite`).
- **Geolocation degraded path:** Electron browser denies geolocation. The map surfaces an explicit disabled button labeled `Location not available` rather than silently failing — this matches the [`docs/REF_AI_BROWSER_NAVIGATION.md`](docs/REF_AI_BROWSER_NAVIGATION.md) §"Audit active navigation state" guidance to treat `GPS weak` as expected degraded behavior. PASS.
- **Memory:** JS heap `141 MB` after extensive interaction across 5 routes + map mount + search submit. No leak signal yet (would need a 30s idle re-check to confirm growth ≤ 50MB threshold).
- **Demo data labeling (LAW Law 3 compliance):** The amber banner "Showing example shop locations. Verified partner shops will appear once your account is connected." is unambiguous and prominent at the top of the surface. This is exactly the "Document What Is" expectation.

---

## Audit complete. 5 findings logged. No code changes made. Tree unchanged at 708d0d38 by this audit (3 pre-existing concurrent-agent files remain).
