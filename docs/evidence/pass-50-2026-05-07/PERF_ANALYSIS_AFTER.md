# Pass 50 — useParallaxOffset Throttle Investigation: Perf Analysis (no fix shipped)

**Date:** 2026-05-07
**Pass:** 50 (F.2 from `pass-48-2026-05-07/PERF_ANALYSIS.md` §F.2)
**KI:** [KI-053](../../REF_KNOWN_ISSUES.md) — no status change this pass
**Outcome:** **No code change shipped.** F.2 hypothesis investigated and disproven by trace.

---

## 1. Hypothesis going in

Pass 48 + Pass 49 left the noscroll long-task burden on the landing surface at 892 ms (1280) / 1269 ms (375), now overwhelmingly landing chrome rather than map work. F.2 from the Pass 48 spec said: throttle `useParallaxOffset` to reduce parallax-driven re-render frequency and free main-thread time.

## 2. What I checked first

`src/app/hooks/useParallaxOffset.ts` — read end to end.

```ts
window.addEventListener("scroll", handleScroll, { passive: true });
// handleScroll wraps setOffset in a single rAF tick + pending guard
// honors prefers-reduced-motion (returns early; never installs listener)
```

The hook is **already**:

- rAF-batched (one update per animation frame max)
- passive-listener registered
- `prefers-reduced-motion`-safe (early return; no listener installed at all)

Two consumers (`HeroSection.tsx`, `OperatingRegionsSection.tsx`), each calls the hook at component root. Each rAF tick fires `setOffset(window.scrollY * speed)` → React re-renders the consumer subtree.

## 3. Hypothesis tested — pixel-quantize the offset

The only remaining defensive throttle was **pixel-quantization**: `setOffset(Math.round(window.scrollY * speed))`. React's `Object.is` bail-out then suppresses re-renders whenever sub-pixel scroll deltas (inertial-scroll tail, iOS rubber-band, programmatic micro-scrolls) round to the same integer pixel. Especially relevant on mobile where `speed=0.06` means ~16 px of `scrollY` map to 1 visible pixel of parallax.

Implemented the change; re-ran the Pass 49 trace harness on `pass-50-2026-05-07/`.

## 4. Result — no measurable improvement

| Surface               | Pass 49 (baseline) | Pass 50 (with throttle) |                     Δ |
| --------------------- | -----------------: | ----------------------: | --------------------: |
| Landing 1280 noscroll |             892 ms |                  926 ms | +34 ms (within noise) |
| Landing 375 noscroll  |            1269 ms |                 1352 ms | +83 ms (within noise) |
| Landing 1280 scrolled |             670 ms |                  699 ms | +29 ms (within noise) |
| Landing 375 scrolled  |             597 ms |                  617 ms | +20 ms (within noise) |

All four surfaces moved +3% to +6.5%, all within run-to-run noise on a single-sample harness. No measurable improvement from the throttle.

## 5. Why — what the trace actually shows

`useParallaxOffset.ts` attributed **1.4 ms** (1280 noscroll) / **0.3 ms** (375 noscroll) of script time across the **entire trace window**. The hook is not a hot path. The actual cost dominators on the noscroll traces:

### Pass 50 — top events (1280 noscroll, ~3 s wall time)

| Event                | total ms |
| -------------------- | -------: |
| `RunTask` (umbrella) |   4392.5 |
| `GPUTask`            |      617 |
| `UpdateLayoutTree`   |      293 |
| `FunctionCall`       |      195 |
| `Layerize`           |      192 |

### Pass 50 — top events (375 noscroll, ~3 s wall time)

| Event                | total ms |
| -------------------- | -------: |
| `RunTask` (umbrella) |     5966 |
| `GPUTask`            | **1414** |
| `FunctionCall`       |      177 |
| `EventDispatch`      |      154 |
| `V8.StackGuard`      |      152 |

**The cost is in the rendering pipeline, not JS.** `GPUTask` + `UpdateLayoutTree` + `Layerize` are compositing / layout work driven by the heavy CSS atmosphere (large blurred gradient pools, backdrop-filter panels, layered transforms). `chunk-KDCVS43I.js` at 173-185 ms is a Vite dep chunk (React + framer-motion + upstream maplibre chunks bundled together by Vite's pre-bundler). None of these are fixable by changing the parallax hook.

## 6. Honest verdict

The F.2 hypothesis is **disproven by trace**. `useParallaxOffset` was the wrong target because it's already optimally batched at the JS layer, and the cost it could plausibly affect (consumer-side React re-renders) is dwarfed by the atmosphere's GPU + layout work that runs every frame regardless of whether React re-renders or not.

Per the Pass 50 dispatch's hard-stop rule:

> If the hook is already fully rAF-batched and there is no obvious throttle target → write findings to PERF_ANALYSIS_AFTER.md and stop without shipping a code change. Honest "no improvement available here" is a valid pass outcome.

The pixel-quantization change has been **reverted** (committed `git diff src/` is empty post-revert). Build + diagnostics clean.

## 7. What this redirects

This trace data **redirects the F-series perf chain**, with implications for Pass 51 and beyond:

- **F.3 (passive-listener audit)** — likely also no-op-shippable. Top events show no `EventDispatch` dominance on 1280 (only 154 ms on 375, less than 3% of total), and the existing scroll listener is already passive. The audit can still ship as evidence but should expect "no shippable issues found."
- **The real cost dominator is the CSS atmosphere itself** — large gradient pools, backdrop-filter panels, layered transforms. Reducing GPUTask requires either (a) shrinking the atmosphere's painted area, (b) removing backdrop-filter from above-the-fold panels, or (c) flagging atmosphere effects to be skipped on low-power / mobile. All three are **design changes**, not perf-throttle changes — they touch the visual canon and need owner direction before any pass authorizes them.
- **F.4 (memo MapLibre source/layer descriptors)** still applies to scrolled traces where MapLibre is the #1 URL (211 ms in Pass 50 scrolled-1280). That pass remains worth running.
- **F.5 (V8 InvokeApiInterruptCallbacks)** — Pass 50 confirms `V8.StackGuard` + `V8.HandleInterrupts` + `V8.InvokeApiInterruptCallbacks` cluster at ~150-208 ms each on the scrolled traces. Provider-side V8 GC pressure. Not a unilateral fix; planner-level decision.

## 8. Files in this pass

- `pass-50-perf-trace.mjs` — capture harness (clone of Pass 49's, output dir set to `pass-50-2026-05-07/`)
- `parse-traces-pass50.mjs` — parser (clone of Pass 49's)
- `trace-landing-{1280,375}-after-{noscroll,scrolled}-pass50.json` — 4 traces (~28-42 MB each)
- `runtime-summary-after.json`
- `parsed-summary-pass50.{json,md}`
- `PERF_ANALYSIS_AFTER.md` (this file)

**No source files touched. No KI-053 / MAP_AUDIT co-update** (per dispatch: co-updates only if a code change ships).

## 9. Build + spellcheck

- `npm run build` — clean.
- `git diff src/` — empty (revert verified).

---

**Recommended next pass:** planner's call. The F-series chain has tapered as predicted in the Pass 50 dispatch. Likely candidates:

- Pass 51 — F.3 passive-listener audit (expect "no shippable issues found"; useful as documentation that the hardening-safe perf chain is exhausted at this layer)
- Pass 52 — `NavigationBrowseDiscoveryPanel` friendlier copy (independent of perf chain)
- Pass 53 — "Load failed" → friendlier copy via `edgeErrorMessage.ts` (needs symptom reproduction)
- A planner-level decision on whether to escalate the GPUTask / atmosphere cost finding to an owner conversation (it's design canon territory and requires explicit approval).
