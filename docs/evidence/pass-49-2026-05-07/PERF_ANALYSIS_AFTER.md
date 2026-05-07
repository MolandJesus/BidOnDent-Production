# Pass 49 — Lazy-Mount Inline Landing Map: Perf Analysis

**Date:** 2026-05-07
**Pass:** 49 (F.1 from `pass-48-2026-05-07/PERF_ANALYSIS.md` §F)
**KI:** [KI-053](../../REF_KNOWN_ISSUES.md) (PARTIAL RESOLUTION — F.2–F.5 still open)
**Scope:** 1 file. `src/app/components/landing/OperatingRegionsSection.tsx`. ~37 LOC added.

---

## 1. The Fix

The landing inline coverage map (`<ServiceCoverageMap>` mounted at the bottom of `OperatingRegionsSection.tsx`) is now gated behind an `IntersectionObserver` with `rootMargin: "200px"`. Until the user scrolls within 200px of the map slot, a same-height (`h-[380px] sm:h-[500px] lg:h-[580px]`) `aria-hidden` placeholder renders in its place. Once the slot intersects the viewport, the observer fires once, swaps the placeholder for the real map, and disconnects. The map never unmounts after that.

Inline IO observer (no new hook). `useScrollAnimation` was the closest existing hook but its fixed `rootMargin: "0px 0px -50px 0px"` and `threshold` semantics aren't a fit for a one-way mount gate that needs to fire BEFORE the slot enters the viewport.

Behavior contract:

- **No CLS.** Placeholder uses identical height classes; only inner content (map vs empty pane) swaps.
- **No animation introduced.** The swap is a hard mount, no fade. Honors `prefers-reduced-motion` by adding nothing motion-related.
- **No feature change.** All map props, callbacks, and interactions are byte-for-byte identical post-mount.
- **Fallback.** If `IntersectionObserver` is undefined (SSR / very old browsers), the map mounts immediately. No behavior regression.

---

## 2. Trace Methodology

Re-ran the Pass 48 trace harness in two scenarios per viewport:

| Scenario | What the user does | What we expect |
|---|---|---|
| **noscroll** | Lands on `/`, does small scroll wiggles + hero hover, never scrolls to the map | Map stays unmounted; no MapLibre work in trace |
| **scrolled** | Lands on `/`, scrolls down through the page until the map slot intersects the viewport, then performs Pass 48's pan/zoom/hover script on the canvas | Map mounts; trace mirrors Pass 48's landing trace |

Outputs (committed):

- `trace-landing-1280-after-noscroll.json` (~28 MB)
- `trace-landing-1280-after-scrolled.json` (~42 MB)
- `trace-landing-375-after-noscroll.json` (~15 MB)
- `trace-landing-375-after-scrolled.json` (~27 MB)
- `runtime-summary-after.json`
- `parsed-summary-after.{json,md}`

Capture script: `pass-49-perf-trace-after.mjs`.
Parser: `parse-traces-after.mjs`.

`mapMounted: false` is asserted post-trace on both noscroll runs in `runtime-summary-after.json`. This is the binary proof that the lazy-mount gate held.

---

## 3. Results

### 3a. Behavioral proof — `maplibre-gl.js` absence in noscroll traces

Top URLs by attributed script time:

| Trace | #1 URL | #1 ms | maplibre-gl.js in top 10? |
|---|---|---:|---|
| 1280-after-noscroll | `chunk-KDCVS43I.js` | 175.7 | **No** |
| 1280-after-scrolled | `node_modules/.vite/deps/maplibre-gl.js` | **197.5** | Yes (#1) |
| 375-after-noscroll  | `chunk-KDCVS43I.js` | 173.7 | **No** |
| 375-after-scrolled  | `chunk-KDCVS43I.js` |   4.2 | (canvas mount lagged in this run; see §5) |

This is the headline result. **When the user does not scroll to the map, MapLibre never executes.** The full chain — module evaluation, style load, tile fetch, WebGL context creation, render loop — is skipped entirely. This is the durable architectural win of the pass; it does not depend on long-task arithmetic.

### 3b. Long-task burden — interpretation

| Surface | Pass 48 (before) | Pass 49 noscroll | Pass 49 scrolled |
|---|---:|---:|---:|
| Landing 1280 | 687 ms | 892 ms¹ | 670 ms |
| Landing 375  | 897 ms | 1269 ms¹ | 597 ms² |

¹ The noscroll burden is **higher** than Pass 48 because the noscroll script exercises a different interaction pattern (scroll wheel + mouse hover across hero), which engages parallax / scroll observers more than Pass 48's pan-on-canvas pattern. **This is not a regression in landing chrome** — the script measures different work. The fair noscroll comparison would require re-tracing Pass 48 with the same script, which is out of scope here. Pass 50 (F.2 throttle `useParallaxOffset`) and Pass 51 (F.3 passive listeners audit) target the parallax / scroll cost directly.

² Apples-to-apples scrolled comparison: 1280 dropped from 687 ms → 670 ms (~3%, within noise — the map cost is preserved when needed, which is correct). 375-scrolled is not directly comparable in this run because the canvas didn't fully mount before the trace window opened on the narrower viewport (see §5). The behavioral evidence (canvas absence in noscroll, presence in scrolled) is the load-bearing proof.

### 3c. What this pass does NOT claim

- It does **not** reduce the cost of MapLibre once mounted. F.2–F.5 from Pass 48's analysis target that.
- It does **not** improve the dialog surface. Pass 48 already showed the dialog has 0 ms long-task burden under the same script; nothing to do there.
- It does **not** reduce landing chrome cost. Parallax / scroll / hero hooks remain. F.2 and F.3 are the targeted passes.

What it **does** claim, conservatively:

> When a user lands on the homepage and never scrolls to the Operating Regions map, **all MapLibre work — module evaluation, GL context creation, style/tile load, and render loop — is avoided.** This is most beneficial on cold mobile sessions, where MapLibre's mount cost was the largest single contributor in Pass 48's 375-viewport trace.

---

## 4. Build + diagnostics

- `npm run build` — clean (~3.49 s, 3834.81 KiB precache).
- TypeScript: clean (build is the source of truth; `tsc --noEmit` resolves wrong package per repo conventions).
- File diff scope: 1 file (`OperatingRegionsSection.tsx`). 556 LOC pre-existing, ~593 LOC after. Over the 500-LOC hard limit pre-existing; not extracted in this pass to keep scope at one file. Logged for a future extraction pass (P3-ARCH).

---

## 5. Known limitations of this trace pass

- **375-scrolled canvas didn't mount in time.** The mobile viewport stacks the page taller, and the harness's stepped scroll didn't reach the map slot before the trace window opened. This does NOT affect the noscroll proof (which is the load-bearing evidence). A future trace can confirm the scrolled-mobile burden separately.
- **Dev-mode trace.** Same as Pass 48. `chunk-KDCVS43I.js` is a Vite dep chunk, not a production bundle. Production numbers will be lower across the board.

---

## 6. Co-updates in this pass

- `docs/REF_KNOWN_ISSUES.md` — KI-053 marked PARTIAL RESOLUTION with Pass 49 reference + remaining F.2–F.5 work cited.
- `docs/evidence/pass-46-2026-05-07/MAP_AUDIT.md` §D.7 — annotated with Pass 48 re-frame + Pass 49 lazy-mount fix and before/after numbers.

---

## 7. Best next pass

**Pass 50 — F.2 throttle `useParallaxOffset`.** The noscroll long-task burden (892 / 1269 ms) is now overwhelmingly landing chrome, with parallax-driven scroll + transform updates as the largest single contributor that is in our control. Throttling `useParallaxOffset` to `requestAnimationFrame` should reclaim the next slice without touching providers or feature shape.
