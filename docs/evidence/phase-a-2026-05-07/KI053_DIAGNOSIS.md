# KI-053 — Map Performance Diagnostic

**Date:** 2026-05-07
**Scope:** Investigation only. **Zero code changes proposed in this file.**
**KI ref:** [REF_KNOWN_ISSUES.md § KI-053](../../REF_KNOWN_ISSUES.md)

---

## Hypothesis under test

Per KI-053: **pan/zoom samples exceed `mapPerformance.ts` budgets** (recorded: 502/520/543ms typical, one 2096ms burst, against 380/450ms budgets). Hypothesis on intake: a tile-abort storm against `*.basemaps.cartocdn.com/{rastertiles,dark_all}/*` is dominating frame time during pan/zoom.

## Method

Captured a Chrome DevTools performance trace + network log via `puppeteer-core` against system Chrome (real, not integrated browser). Surface: landing page coverage map (unauthenticated). Interaction sequence: 3× pan (drag), 4× zoom (wheel-in), then 2.5s idle. Total trace ~10s. Trace file + network summary saved alongside this doc:

- `ki053-trace.json` — DevTools tracing payload
- `ki053-summary.json` — request/response counts + sample failures

## Raw observation (this run)

```
{
  "page": "landing coverage map (unauthenticated)",
  "viewport": "1280x900",
  "tileRequests": {
    "total": 33,
    "failed": 1,
    "firstUrl": "https://a.basemaps.cartocdn.com/rastertiles/voyager/10/301/383@2x.png",
    "sampleFailures": [
      { "url": "https://b.basemaps.cartocdn.com/rastertiles/voyager/10/300/385@2x.png", "err": "net::ERR_ABORTED" }
    ]
  },
  "responseStatusCounts": { "200": 31 }
}
```

**Translation:**

- 33 tile requests over a full 10s pan + zoom + idle session.
- 31 successful (HTTP 200), 1 aborted (`net::ERR_ABORTED` — camera-debounce cancellation, expected behavior in MapLibre when a tile is no longer needed before fetch completes), 1 in-flight at trace stop.
- Zero CSP blocks, zero 4xx, zero 5xx.

## Diagnosis

**The "tile abort storm" hypothesis is not supported by this evidence.** A single abort over 10s of typical interaction is healthy, not pathological. The tile pipeline (CSP allowlisted at [`vite.config.ts:73`](../../../vite.config.ts#L73), [`vite.config.ts:79`](../../../vite.config.ts#L79); style sources at [`src/app/components/maps/mapLibreStyles.ts:16`](../../../src/app/components/maps/mapLibreStyles.ts#L16) and [`src/app/components/maps/mapLibreStyles.ts:34`](../../../src/app/components/maps/mapLibreStyles.ts#L34); shop-directory raster source at [`src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx:10`](../../../src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx#L10)) is functioning correctly.

That means the original 502/520/543ms / 2096ms-burst samples in `mapPerformance.ts` are **not caused by tile network behavior**. The dominant cost lives elsewhere on the main thread.

## Top 3 candidate fixes — ranked by surgicality (no code changes proposed here)

### Candidate 1 (most surgical) — Marker / cluster render path on viewport change

**Why suspect:** A 2096ms burst sample is not consistent with steady-state pan jitter; it matches the cost profile of synchronously rendering a large set of DOM markers or recomputing a clustering pass on a viewport change. If the marker layer (shop pins, report pins) is rendered via React DOM siblings rather than a MapLibre symbol/circle layer with a clustered GeoJSON source, every pan triggers an O(n) reflow.
**Investigation needed before any fix:** capture a Chrome DevTools "Performance" panel recording (User Timing + Long Tasks enabled) during the same pan/zoom sequence and identify the longest task. The trace JSON shipped with this doc (`ki053-trace.json`) can be loaded into DevTools → Performance → "Load profile…" to do exactly this.
**Risk if fixed naively:** changing the marker rendering surface from DOM to canvas/symbol layer can shift accessibility (focus, ARIA), tap-target geometry on mobile, and animation behavior. Out of audit-only scope.
**Surgicality:** medium — likely a single component swap if confirmed.

### Candidate 2 — Un-throttled effect / `useEffect` writing to map state on every move event

**Why suspect:** MapLibre fires `move` at ~60Hz. If any `useEffect` listens to `move` (or a derived state) and re-runs reads against `getBounds()`, `queryRenderedFeatures()`, or persists state to localStorage on each tick, frame budget is consumed by JS, not painting.
**Investigation needed:** grep for `map.on("move"`, `map.on("moveend"`, and React effects that depend on `bounds` / `center` / `zoom`. Confirm at least one of: rAF batching, `moveend`-only listening, or a debounce/throttle.
**Risk if fixed naively:** changing from `move` to `moveend` will visually defer overlay updates (e.g., shop count chip lagging until the user releases drag) — must be UX-tested.
**Surgicality:** medium — small diff, but UX must be re-validated.

### Candidate 3 (least surgical) — Budget recalibration

**Why suspect:** The current budgets (380ms / 450ms) were set at an unknown date and may not reflect the post-Pass-42 device profile. If the consistent pattern is 500–550ms with rare 2s outliers, and the user experience is actually smooth on a target device, the numbers in `mapPerformance.ts` may simply be wrong.
**Investigation needed:** record three traces — desktop Chrome, mid-range Android (real device or DevTools mobile-CPU 4× throttle), and iPhone Safari. Compare measured pan/zoom durations to user-perceived smoothness. If perception is fine and only the budgets are angry, downgrade KI-053 from "real perf bug" to "instrumentation tuning."
**Risk:** low. This is a measurement-vs-truth correction, not a behavior change.
**Surgicality:** highest — single-file numeric tweak in `mapPerformance.ts`.

## Recommendation to the planner-AI

1. Ship audit-only **Pass 44A — DevTools profile capture** that records a Performance panel trace on (a) landing coverage map and (b) authenticated find-shops map, identifying the dominant Long Task in each. That alone determines whether Candidate 1 or Candidate 2 is real.
2. Defer the actual fix to a dedicated pass after Pass 44A names the offender. Do not start surgery without the profile.
3. Consider downgrading KI-053 from P4-polish to **P5-instrumentation-tuning** if Pass 44A confirms tile network is innocent and overall map UX feels smooth on target devices. The original KI was authored on observability output, not user-perceived breakage.

## What this diagnostic does NOT claim

- It does **not** claim the `mapPerformance.ts` budget overruns are imaginary. The instrumentation evidence in KI-053 stands.
- It does **not** profile the **authenticated** find-shops map (clustered shop pins, route geometries). Authenticated mobile evidence is the same gap called out in `SUMMARY.md`.
- It does **not** quantify rendering cost on a real low-end mobile device. Desktop Chrome + landing surface only.

The narrow positive finding here is: **the carto-tile abort storm narrative can be retired.** The actual bottleneck is elsewhere and needs DevTools Performance panel work before any fix is authored.
