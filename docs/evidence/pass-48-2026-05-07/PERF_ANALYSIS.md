# Pass 48 — KI-053 Performance Analysis

**Date:** 2026-05-07
**Branch:** `BidOnDent-Horizon-Beta`
**Pass type:** Read-only investigation + analysis. **Phase 2 deferred — no cheap-win qualified.**
**Authority:** Hardening-safe ceiling. No KI-075 territory.
**Capture script:** [`pass-48-perf-trace.mjs`](pass-48-perf-trace.mjs)
**Parser:** [`parse-traces.mjs`](parse-traces.mjs)
**Raw evidence:** [`trace-landing-1280.json`](trace-landing-1280.json), [`trace-dialog-1280.json`](trace-dialog-1280.json), [`trace-landing-375.json`](trace-landing-375.json), [`trace-dialog-375.json`](trace-dialog-375.json), [`parsed-summary.json`](parsed-summary.json), [`parsed-summary.md`](parsed-summary.md), [`runtime-summary.json`](runtime-summary.json)

---

## A. Methodology

- **Tool:** `puppeteer-core` driving system Chrome (headless: new) → Chrome DevTools Tracing API → JSON traces with categories `devtools.timeline`, `disabled-by-default-devtools.timeline.frame`, `disabled-by-default-v8.cpu_profiler`, `blink.user_timing`, `v8.execute`.
- **Surfaces:**
  1. **Landing inline coverage map** — `OperatingRegionsSection` mounts an inline coverage canvas above-the-fold-after-scroll, using the same `MapLibreServiceCoverageMap` family.
  2. **`CoverageMapDialog` fullscreen** — opened by clicking "Coverage Map" CTA. This is the surface KI-053 originally flagged.
- **Viewports:** 1280×900 (desktop) and 375×812 (mobile via CDP `isMobile`/`hasTouch`).
- **Interaction script (~10s per surface):** 4-direction pan (280ms each) → 3 zooms in + 3 zooms out (220ms each) → 5 ring-position marker hovers (180ms each) → 1.5s settle.
- **Auth path skipped:** dashboard-only `MapLibreServiceCoverageMap` requires Clerk session, not reachable from puppeteer-core in pass scope. The landing-dialog surface uses the same component family (same hooks, same MapLibre instance shape) so findings transfer.
- **Note:** Traces are dev-server (`http://localhost:5173/`) under un-minified Vite, so absolute ms are higher than production. The **relative ranking** of hot paths is what matters.

---

## B. Headline Result

| Surface             | Viewport |  Events | Long-task burden (>50ms) | Total RunTask ms | Top contributor                                                              |
| ------------------- | -------- | ------: | -----------------------: | ---------------: | ---------------------------------------------------------------------------- |
| Landing inline      | 1280     | 204,956 |                **687ms** |            4,244 | V8.InvokeApiInterruptCallbacks (171ms × 4)                                   |
| Landing inline      | 375      | 151,940 |                **897ms** |            4,248 | V8.InvokeApiInterruptCallbacks (166ms × 4) + GC_MC_BACKGROUND_MARKING (87ms) |
| `CoverageMapDialog` | 1280     | 194,290 |                  **0ms** |            3,287 | UpdateLayoutTree (387ms · count 652)                                         |
| `CoverageMapDialog` | 375      | 153,947 |                  **0ms** |            2,578 | Layerize (158ms · count 644)                                                 |

### Inversion of prior assumption

**The fullscreen `CoverageMapDialog` is NOT the bottleneck.** Both 1280 and 375 dialog traces show **zero long tasks (>50ms)** under the same pan/zoom/hover script. The dialog mounts the map in isolation (rest of landing page is overlay-hidden), so the map gets the main thread to itself.

**The landing inline coverage map IS the bottleneck.** 687-897ms of long-task time on a ~10s interaction window means roughly 7-9% of the interaction was spent in tasks that block frame production. On mobile (375) this is worse — 897ms with V8 background GC marking adding 87ms of JS-thread interruption.

This is a meaningful re-framing of KI-053. The 2026-04-26 audit observation of 502/520/543ms pan/zoom samples likely came from the landing surface — not the dialog. The dialog had been blamed because that's the surface KI-053 is documented against.

---

## C. Top Frame-Time Contributors (Hot Paths)

### C.1 Landing 1280 (desktop)

| Rank | Contributor                    | Total ms | Count | Max ms | Source                                                                                                               |
| ---- | ------------------------------ | -------: | ----: | -----: | -------------------------------------------------------------------------------------------------------------------- |
| 1    | V8.InvokeApiInterruptCallbacks |    192.5 |     4 |  171.3 | V8 internal — fires when JS calls into native and a stack guard interrupt is pending. Usually GC or microtask drain. |
| 2    | maplibre-gl.js (script eval)   |    182.1 |   374 |    2.6 | MapLibre internals — render loop, source updates, layer compile.                                                     |
| 3    | FunctionCall (blob:)           |     22.6 |    14 |   21.3 | MapLibre's tile worker (Web Worker bootstrap blob). One 21ms peak.                                                   |

### C.2 Landing 375 (mobile)

| Rank | Contributor                    | Total ms | Count | Max ms | Source                                                                                                            |
| ---- | ------------------------------ | -------: | ----: | -----: | ----------------------------------------------------------------------------------------------------------------- |
| 1    | V8.InvokeApiInterruptCallbacks |    188.6 |     4 |  166.4 | Same V8 interrupt class as desktop.                                                                               |
| 2    | maplibre-gl.js (script eval)   |    150.6 |   368 |    2.2 | MapLibre internals.                                                                                               |
| 3    | V8.GC_MC_BACKGROUND_MARKING    |     86.9 |    51 |    3.5 | **Mark-compact GC background marking. Mobile-only top-10 entry.** Indicates allocation pressure on lower-spec V8. |
| —    | (blob:) FunctionCall           |     25.9 |    32 |   22.2 | MapLibre tile worker — more invocations on mobile (32 vs 14).                                                     |

### C.3 Dialog 1280 (desktop)

| Rank | Contributor      | Total ms | Count | Max ms | Source                                                |
| ---- | ---------------- | -------: | ----: | -----: | ----------------------------------------------------- |
| 1    | UpdateLayoutTree |    387.4 |   652 |    1.3 | Render-engine layout (mostly < 1ms each — healthy).   |
| 2    | GPUTask          |    214.3 |   965 |    1.3 | GPU compositing — healthy.                            |
| 3    | maplibre-gl.js   |      3.1 |    44 |    0.4 | **MapLibre script time drops 60×** vs landing inline. |

### C.4 Dialog 375 (mobile)

| Rank | Contributor                 | Total ms | Count | Max ms | Source                              |
| ---- | --------------------------- | -------: | ----: | -----: | ----------------------------------- |
| 1    | Layerize                    |    158.5 |   644 |    0.4 | Compositing layers built (healthy). |
| 2    | GPUTask                     |    153.7 |   853 |    1.8 | GPU work — healthy.                 |
| 3    | V8.GC_MC_BACKGROUND_MARKING |    102.8 |    60 |    3.4 | Background GC.                      |

---

## D. Suspect Classification

The audit suspect order was:

1. marker-render path
2. route geometry source
3. un-throttled effects in map controllers

**This trace rules out marker-render and route-geometry as the dominant cost** on the dialog surface (both have <5ms total on dialog). It points to a **fourth suspect not in the original list:**

> **Co-mounted non-map work on the landing inline surface** — landing-page parallax, hero animations, scroll observers, GPS tracking, and intersection observers run on the same main thread as MapLibre's render loop. The 4 InvokeApiInterruptCallbacks bursts (171ms each) are most likely V8 yielding to GC or to a microtask drain triggered by allocation churn from the surrounding landing page (`useParallaxOffset`, `useScrollAnimation`, `useNavigationGpsTracking`, `HeroSection`).

Evidence:

- Dialog trace = same MapLibre instance, same interaction script, same viewport → 0 long tasks.
- Landing trace = same MapLibre instance + landing page chrome → 687-897ms long tasks.
- Mobile (375) shows GC_MC_BACKGROUND_MARKING in top-10 only on landing, not dialog → allocation pressure correlates with landing-only co-mounted code.
- `useParallaxOffset.ts` and `useScrollAnimation.ts` appear in landing's source-attribution list with non-zero time; absent or near-zero in dialog.

This is a **structural** cost, not a single-effect cost.

---

## E. Cheap-Win Qualification (Phase 2 Gate)

Per planner relay, a cheap win qualifies only if **all** of:

- Single source file ✅ require
- ≤30 LOC diff ✅ require
- No prop change to public component API ✅ require
- No new hook ✅ require
- No dependency change ✅ require
- Identified as a top-3 frame-time contributor in Phase 1 ✅ require
- Has an obvious throttle / memo / passive-listener / lazy-init fix ✅ require

### Candidates evaluated

| Candidate                                                                  | Top-3?                        | Single file?                                | Obvious fix?                                  | Verdict                                                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Throttle `useParallaxOffset` when reduced-motion or below scroll threshold | No (sub-ms in trace)          | Yes                                         | Yes                                           | **Reject** — not top-3.                                                                                                             |
| Throttle `useScrollAnimation` IntersectionObserver callbacks               | No (sub-ms)                   | Yes                                         | Yes                                           | **Reject** — not top-3.                                                                                                             |
| Pause `useNavigationGpsTracking` polling on landing (no nav active)        | No (0.6ms)                    | Yes                                         | Yes                                           | **Reject** — not top-3.                                                                                                             |
| Defer landing inline map mount until in viewport (lazy mount)              | Would address structural cost | One file                                    | Possible (IntersectionObserver gate on mount) | **Reject for Phase 2** — touches mount semantics, risk of layout shift, behaviour change requires UX validation. Pass-49 candidate. |
| Optimize MapLibre marker layer                                             | Maybe                         | Touches MapLibre source layers (multi-file) | No                                            | **Reject** — multi-file, provider-coupled.                                                                                          |
| Reduce V8 GC pressure (object pooling in render loop)                      | Yes (171ms × 4)               | Multi-file structural                       | No                                            | **Reject** — not a cheap win.                                                                                                       |
| Tweak MapLibre internals                                                   | N/A                           | Provider code                               | N/A                                           | **Hard-stop — provider-side.**                                                                                                      |

**Result: NO Phase 2 candidate qualifies.** Phase 2 skipped. Analysis-only commit.

---

## F. Pass 49+ Candidates (for planner's queue)

Listed in order of estimated leverage / safety:

### F.1 — `LazyMountInlineLandingMap` (highest-leverage, hardening-safe)

- **What:** Gate the landing-section coverage canvas behind a `IntersectionObserver` with `rootMargin: "200px"`, render a same-height visual placeholder until the observer fires.
- **Why:** Eliminates ~700-900ms of long-task burden when the user never scrolls to the map. Removes the co-mount problem entirely for the most common landing visit.
- **Risk:** Low. Mount-once-on-visible is a well-known pattern. Requires a placeholder that matches the section height to avoid CLS.
- **Files:** Likely 1 (`OperatingRegionsSection.tsx` or its inline-map child). Need to verify file shape before greenlight.
- **Validation:** Re-run Pass 48 trace; expect landing long-task burden to drop to dialog levels (0-50ms) when the user does NOT scroll to the map.

### F.2 — Throttle `useParallaxOffset` while map is in viewport

- **What:** When the inline map's IntersectionObserver fires, set a flag that puts `useParallaxOffset`'s rAF loop on a slower cadence (or pauses). Resume on intersection-out.
- **Why:** Reduces concurrent main-thread work during map interaction, even if F.1 doesn't ship.
- **Risk:** Low. Reversible.
- **Files:** 1-2 (`useParallaxOffset.ts` + a coordination hook).

### F.3 — Audit landing-page IntersectionObservers for `passive: true`

- **What:** Walk through `useScrollAnimation`, parallax, and any landing-page scroll listeners; ensure they use `{ passive: true }` and `rAF`-batched updates.
- **Why:** Cheap micro-optimization; reduces interrupt frequency.
- **Risk:** Very low.
- **Files:** Up to 3.

### F.4 — Memo MapLibre source/layer descriptors (defer; needs eval)

- **What:** Audit whether `MapLibreServiceCoverageMap` rebuilds `Source` / `Layer` JSON objects per render. If yes, lift to module scope or `useMemo`.
- **Why:** MapLibre re-runs `setSource`/`addLayer` on identity changes.
- **Risk:** Medium. Requires understanding render-stability guarantees.
- **Files:** Probably 1 (the map component) but depends on shape.

### F.5 — Investigate the 4 V8.InvokeApiInterruptCallbacks bursts

- **What:** Reproduce in a profiler with V8 interrupt-source attribution enabled (Node `--inspect-brk` not applicable here; would need `chrome://tracing` with a custom flag set). Determine whether the interrupts are GC, microtask drain, or finalization registry.
- **Why:** Each burst is 166-171ms — the single largest visible cost.
- **Risk:** Investigation only, no risk.
- **Files:** None initially.

### Owner-decision required (NOT autopilot territory)

- **F.X (deferred KI-075):** Audit MapLibre marker rendering path for batching opportunities. Provider-coupled; multi-file. **Do not execute** without owner unlock.

---

## G. Budgets vs Observed (this run)

| Budget      |          Value | Surface | Observed in this trace                                                                                                                                                                                                                                                       |
| ----------- | -------------: | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pan budget  |          380ms | All     | No discrete pan-sample export; `mapPerformance.ts` writes to localStorage but the trace script did not read it. **Follow-up:** capture `mapPerformance` samples via `page.evaluate(() => localStorage.getItem('bidondent.navigation.mapPerformance.v1'))` after interaction. |
| Zoom budget |          450ms | All     | Same as above.                                                                                                                                                                                                                                                               |
| Long-task   | (none defined) | Landing | 687-897ms total in 10s window.                                                                                                                                                                                                                                               |
| Long-task   | (none defined) | Dialog  | 0ms. **Within any reasonable budget.**                                                                                                                                                                                                                                       |

The `mapPerformance.ts` budget values stay untouched per planner directive (don't relax budgets to mask).

---

## H. Doc Updates Required (next pass that ships a fix)

When Pass 49 ships F.1 or any other candidate, update:

- `docs/REF_KNOWN_ISSUES.md` KI-053 — add finding that dialog is healthy, landing inline is the actual hot surface.
- `docs/evidence/pass-49-XXXX/PERF_ANALYSIS.md` — re-run script, post before/after.
- `docs/evidence/pass-46-2026-05-07/MAP_AUDIT.md` §D.7 — annotate that the suspect-order list was updated by Pass 48 (landing co-mount is the new #1).

This pass does not modify those docs (analysis-only, no fix shipped).

---

## I. Hard Stops Triggered This Pass

None. Investigation completed cleanly. The "no clear single winner" pattern was anticipated by the planner relay and routed to analysis-only as designed.

---

## J. Closing Summary

- **Phase 1:** ✅ Complete. 4 traces (29-40 MB each), parsed summary, runtime summary, this analysis doc.
- **Phase 2:** ✅ Skipped per gate. No cheap win qualified.
- **Key re-frame:** KI-053's blamed surface (`CoverageMapDialog`) is healthy. The actual hot surface is the **landing inline coverage map**, where landing-page chrome (parallax/scroll/hero/GPS hooks) competes with the MapLibre render loop on the main thread.
- **Best next pass:** Pass 49 — F.1 LazyMountInlineLandingMap. Hardening-safe, single-file, expected to drop landing long-task burden to dialog levels.
- **KI-075 status:** Untouched. Doc/exec divergence from prior turn still open for owner.
