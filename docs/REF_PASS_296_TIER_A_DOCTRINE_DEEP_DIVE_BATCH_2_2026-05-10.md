# REF — Doctrine-Aware Tier A Extraction Re-Classification (Pass 296, 2026-05-10, Second Batch)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #20 (Priority A: continue Tier A doctrine deep-dive Batch 2 using the same 7-question framework established in Pass 295).
**Tier:** REF.
**Source modification:** ZERO. No extractions. No edits. No PLAN_PLATFORM_* modifications. Pure read-only mapping.
**Companion to:** [`REF_PASS_295_TIER_A_DOCTRINE_DEEP_DIVE_2026-05-10.md`](REF_PASS_295_TIER_A_DOCTRINE_DEEP_DIVE_2026-05-10.md) (First Batch — established the 3-band split inside Tier A).

---

## §1. Premise & continuation

Pass 295 established the 3-band split (A-pure / A-cosmetic / A-doctrine) and identified 3 unblocking owner-decision-points. Relay #20 directs continued doctrine-aware mapping using the same 7-question framework before any extraction:

1. Structurally reusable?
2. Behaviorally reusable?
3. Authority-localized?
4. Continuity-sensitive?
5. Trust-sensitive?
6. Orchestration-depth-sensitive?
7. Extraction-centralization risk?

This pass audits the second batch of Tier A candidates from PLAN_PLATFORM_EXTRACTION_BRIEF §3.1 — the platform-infrastructure-flavored ones rather than the UI-flavored ones from Batch 1.

---

## §2. The 8 candidates audited this batch

| # | Candidate | Path | LOC |
|---|---|---|---|
| 1 | Notifications system | `features/notifications/*` | 264 |
| 2 | validate-app-config | `utils/validateAppConfig.ts` | ~50 |
| 3 | Sentry init + errorReporting | `services/sentryInit.ts` + `services/errorReporting.ts` | 108 |
| 4 | Service-worker / PWA hooks | `hooks/useServiceWorkerUpdate.ts` + `hooks/useOnlineStatus.ts` | 76 |
| 5 | Instrumentation substrate | `utils/perfMarks.ts` + `utils/devMapInstanceCounter.ts` + `utils/devGlContextCounter.ts` | 189 |
| 6 | Hashpage routing pattern | `useHashPage` inside `components/app/AppShell.tsx` | ~30 (the hook itself) |
| 7 | Provider/context pattern | `MapSessionProvider` exemplar | 70 (Phase 1 inert) |
| 8 | Layered architecture doctrine | `LAW_LAYERED_ARCHITECTURE.md` | doc only |

---

## §3. Per-candidate doctrine analysis

### 3.1 Notifications system — `features/notifications/`

**Surface:** 4 files (NotificationContext, useNotificationEvents, notificationEventTypes, index). Architecture: React Context + single-slot toast + dedupe + deep-link bridge. Pass 291 §3 already documented the toast-side runtime semantics.

**CRITICAL DOCTRINE FINDING — `useNotificationEvents.ts:51-55`:**

```typescript
const TOAST_CATEGORIES: Set<NotificationCategory> = new Set([
  "navigation",  // BD: turn-by-turn nav
  "reroute",     // BD: route deviation
  "bid",         // BD: bidding mechanic
  "report",      // BD: damage reports
  "system",      // generic
]);
```

The category enum (`navigation | reroute | report | bid | shop | insurer | estimate | system`) is **hard-coded to BidOnDent product mechanics**. Same for `NotificationDeepLink` screen targets (`navigation / report / bid / shop / shop-directory / estimates / dashboard`) — all are BidOnDent route names.

**This is the strongest doctrine finding of Pass 296.** The brief's classification as Tier A ("Toast + deep-link pattern is generic; route mapping is per-app") is correct in INTENT but the CURRENT code has the route mapping FUSED INTO the type system, not parameterized.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Context + single-slot toast + dedupe pattern is generic. |
| 2. Behaviorally reusable? | ❌ NO (current state) | Category enum + deep-link union are BD-product-specific. Stacey would never use `bid` or `reroute`. |
| 3. Authority-localized? | ✅ YES | One context, one consumer hook, no globals. |
| 4. Continuity-sensitive? | ⚠️ MEDIUM | Single-slot replacement (Pass 291 S1) is a lightweight continuity choice. |
| 5. Trust-sensitive? | ✅ HIGH | Toast tone, dedup window, replacement vs queue — all are trust signals (per Pass 291 S1 + Pass 292 §7). |
| 6. Orchestration-depth-sensitive? | ✅ YES | Notification provider mounts at App.tsx:528 — Pass 281 §11 invariant #1 (provider order) + invariant #2 (AppWithToast subcomponent boundary). Extraction must NOT alter that mount sequencing. |
| 7. Centralizes ownership? | NO if the type system is parameterized; YES if it ships as-is | Forcing every consumer onto BD's category enum is the centralization risk. |

**Verdict:** **Tier A-DOCTRINE.** The brief's headline ("generic; route mapping is per-app") is intent-correct but the CURRENT type system requires meaningful refactor. Two extraction shapes possible:
- **A — Generic-core + per-app extension:** platform exports `NotificationContext<TCategory, TDeepLink>(...)` generic; BidOnDent app declares its own `BdNotificationCategory` type and consumes the generic.
- **B — Plugin registry:** platform owns the category enum, but new categories register themselves at consumer-app startup. Heavier orchestration.
- **Recommendation context:** Option A preserves shallow orchestration (relay #19/#20 prohibition); Option B adds an orchestration layer. **A is the doctrine-aligned choice.**

**Owner-decision-bound:** YES — owner picks generic-core-with-types vs registry approach.

### 3.2 validate-app-config — `utils/validateAppConfig.ts`

**Surface:** ~50 lines. Reads `SUPABASE_PROJECT_ID`, `SUPABASE_ANON_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` from env; returns array of `ConfigIssue { key, message, fatal }`. Used at app startup to surface missing-config to the user.

**Brand-coupling:** the message strings reference Supabase / Clerk by name — vendor names, not "BidOnDent" brand. The check list is BD's specific vendor list.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Pattern: at startup, walk an array of (env-var, message, fatal) checks; surface to UI. Generic. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | The CHECKS are vendor-coupled (Supabase + Clerk). Stacey's site might use different vendors. |
| 3. Authority-localized? | ✅ YES | Pure function; no globals. |
| 4. Continuity-sensitive? | NO | Startup-only; no runtime continuity surface. |
| 5. Trust-sensitive? | ✅ HIGH | This is the FIRST-IMPRESSION code path — what the user sees if config is broken. Tone matters. |
| 6. Orchestration-depth-sensitive? | NO | Pure function. |
| 7. Centralizes ownership? | NO if extracted as a CHECK ENGINE; YES if extracted with the BD-specific vendor list baked in | Platform should expose `runConfigChecks(checks: ConfigCheck[])`; consumer apps assemble their own list. |

**Verdict:** **Tier A-cosmetic** if extracted as a check engine. Stacey's app would import the engine and supply her own checks. ~30-line pattern.

**Owner-decision-bound:** light — owner approves the parameterization shape.

### 3.3 Sentry init + errorReporting — `services/sentryInit.ts` + `services/errorReporting.ts`

**Surface:** 108 lines. Reads `VITE_SENTRY_DSN` + `VITE_SENTRY_ENVIRONMENT`. Initializes `@sentry/react` with sane defaults (10% transactions in production, dev mode silent, chrome-extension noise filter). `errorReporting.ts` exports `captureException` wrapper.

**Brand-coupling:** ZERO. The strings are generic ("[Sentry] No DSN configured…"). Filter logic is provider-agnostic.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Generic per-env Sentry initializer. |
| 2. Behaviorally reusable? | ✅ YES | Stacey could use the same Sentry pattern unchanged. |
| 3. Authority-localized? | ✅ YES | Single init function; module-level "initialized" flag. |
| 4. Continuity-sensitive? | NO | Startup-only; no runtime continuity surface. |
| 5. Trust-sensitive? | NO | Background telemetry; not user-facing. |
| 6. Orchestration-depth-sensitive? | NO | Pre-React init. |
| 7. Centralizes ownership? | NO | Each consumer app calls `initSentry()` once; platform doesn't enforce. |

**Verdict:** **Tier A-PURE.** Cleanest extraction candidate in Batch 2. Stacey could literally copy these two files.

**Owner-decision-bound:** none.

### 3.4 Service-worker / PWA hooks — `useServiceWorkerUpdate` + `useOnlineStatus`

**Surface:** 76 lines combined. `useOnlineStatus` wraps `navigator.onLine` + online/offline events. `useServiceWorkerUpdate` integrates with Vite PWA plugin's `useRegisterSW`.

**Brand-coupling:** `useServiceWorkerUpdate` likely imports from `virtual:pwa-register/react` (Vite PWA convention) — vendor-specific to vite-plugin-pwa.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Both are minimal hook wrappers. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | `useOnlineStatus` is fully portable. `useServiceWorkerUpdate` is Vite-PWA-coupled — Stacey would need vite-plugin-pwa configured (or a different PWA approach). |
| 3. Authority-localized? | ✅ YES | Each hook is independent. |
| 4. Continuity-sensitive? | ⚠️ MEDIUM | Service-worker update flow is a continuity transition (the "new version available" banner at App.tsx:535 — Pass 291 z-[9999] tier). |
| 5. Trust-sensitive? | ✅ MEDIUM | The "new version available" prompt is a trust signal. |
| 6. Orchestration-depth-sensitive? | NO | Hooks; no provider. |
| 7. Centralizes ownership? | NO | Each hook independent. |

**Verdict:** Split:
- `useOnlineStatus`: **Tier A-PURE.** Direct copy.
- `useServiceWorkerUpdate`: **Tier A-cosmetic.** Generic if Stacey adopts vite-plugin-pwa; if not, extract the abstract pattern (`{ needRefresh, updateServiceWorker }`) and let each consumer adapt to their PWA library.

**Owner-decision-bound:** light — Stacey's PWA strategy.

### 3.5 Instrumentation substrate — `perfMarks` + `devMapInstanceCounter` + `devGlContextCounter`

**Surface:** 189 lines combined. `perfMarks.ts` exports `markEngineMount/Dispose/RouteEnter/Leave` using `performance.mark` with `bd:` namespace prefix (lines 16-19). The two dev-counters track map-instance + GL-context creation for leak detection in Playwright tests.

**Brand-coupling:**
- `perfMarks.ts:16-19` namespace prefix is `bd:engine:mount`, `bd:engine:dispose`, `bd:route:enter`, `bd:route:leave` — literal `bd:` string baked into the constants.
- The "engine" concept is general (not strictly map-engine) but currently used only by map flows.
- The `devMapInstance*` and `devGlContext*` counters are MAP-specific — would belong to a `map-engine` Tier B optional module, not core platform.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | `perfMarks` is a thin wrapper around the Performance API. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | `perfMarks` portable with rename; map-specific counters belong to map-engine module. |
| 3. Authority-localized? | ✅ YES | Each function is leaf; no shared state. |
| 4. Continuity-sensitive? | NO | Pure observation; emits marks; no semantic effect. |
| 5. Trust-sensitive? | NO | Internal telemetry only. |
| 6. Orchestration-depth-sensitive? | NO | No providers. |
| 7. Centralizes ownership? | NO | Each consumer calls directly. |

**Verdict:**
- `perfMarks`: **Tier A-cosmetic.** Rename `bd:` namespace to platform namespace per the brief. Pattern is otherwise pure platform-tier.
- Dev counters: **Tier B (map-engine module),** not Tier A. The brief implicitly knows this (lists them under "Instrumentation substrate" but their semantics are map-domain).

**Owner-decision-bound:** light — namespace rename string ("platform:" or chosen platform identifier).

### 3.6 Hashpage routing pattern — `useHashPage` in `AppShell.tsx`

**Surface:** ~30 lines of the hook itself. `useState<HashPage | null>` + `hashchange` event listener + history.replaceState for clearing. Calls `markRouteEnter/Leave` from `perfMarks` — coupling to the instrumentation substrate.

**Brand-coupling:** the `HashPage` type is BD-specific (the "four hash-pages" the brief names — likely things like `report`, `bid`, etc.). The hook STRUCTURE is generic; the type parameter is BD-specific.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Generic hash-route observer. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | `HashPage` type is BD-specific; pattern parameterizes cleanly via generics: `useHashPage<TPage>(parser: (hash: string) => TPage \| null)`. |
| 3. Authority-localized? | ✅ YES | Single hook; no globals beyond `window.location`. |
| 4. Continuity-sensitive? | ⚠️ MEDIUM | Hash-page transitions emit perfMarks for the route-lifecycle telemetry (Pass 281 implicit invariant). Extraction must preserve mark emission. |
| 5. Trust-sensitive? | NO | Pure routing primitive. |
| 6. Orchestration-depth-sensitive? | NO | No provider; hook only. |
| 7. Centralizes ownership? | NO | Each consumer parses its own pages. |

**Verdict:** **Tier A-cosmetic.** Parameterize the page-type via generic; lift `parseHashPage` callback as a prop. Lite refactor (~10 lines).

**Owner-decision-bound:** none — clean parameterization.

### 3.7 Provider/context pattern — `MapSessionProvider` exemplar

**Surface:** 70 lines (Phase 1 inert per Pass 266). The provider is the **PATTERN** for platform extraction — the brief explicitly calls it out as "the post-auth single-responsibility provider seam."

**Critical doctrine note:** the resize-patch first-import-line (line 52) is Pass 281 §11 invariant #3. Pass 293 §4 verified preservation. The PATTERN of "first-import-line side-effect" must be preserved per-provider.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Provider + context + Phase-1-inert default value is a clean abstraction. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | The PATTERN is reusable; the SPECIFIC contents (map session) are not. |
| 3. Authority-localized? | ✅ YES (currently) | Phase 1 owns nothing; future phases own the engine handle. |
| 4. Continuity-sensitive? | ✅ HIGH | Pass 281 §11 invariant #1 (provider mount order) + #3 (resize-patch first-import) — both touch this file pattern. |
| 5. Trust-sensitive? | NO | Infrastructure; not user-facing. |
| 6. Orchestration-depth-sensitive? | ✅ HIGH | Provider mount order is a hard invariant (Pass 287 test enforces it). Pattern extraction must include the doctrine, not just the code shape. |
| 7. Centralizes ownership? | YES if extracted as a "ProviderRegistry" wrapper; NO if extracted as a copy-paste pattern with documentation | Owner-decision: pattern-as-doctrine vs pattern-as-helper. |

**Verdict:** **Tier A-DOCTRINE-as-PATTERN, not as code.** This is the unusual case where what extracts is the IDEA, not the file. The platform should provide a `REF_PROVIDER_SEAM_PATTERN.md` doc + a `ProviderTemplate.tsx.example` skeleton; consumer apps copy + adapt rather than import a generic helper. Imported provider helpers would risk centralizing what should remain consumer-owned.

**Owner-decision-bound:** medium — doc-as-extraction vs helper-as-extraction.

### 3.8 Layered architecture doctrine — `LAW_LAYERED_ARCHITECTURE.md`

**Surface:** doc-only. The brief's note: "L1/L2/L3/L4 is business-agnostic."

**Brand-coupling:** the doc references BidOnDent in examples but the L1-L4 model is a generic 4-layer architecture (typically: L1 = primitives, L2 = composites, L3 = features, L4 = screens — or similar).

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Pure doctrine. |
| 2. Behaviorally reusable? | ✅ YES | Layer model is product-agnostic. |
| 3. Authority-localized? | ✅ YES | The doc IS the authority; no runtime. |
| 4. Continuity-sensitive? | NO | Doc; no runtime. |
| 5. Trust-sensitive? | NO | Doc; not user-facing. |
| 6. Orchestration-depth-sensitive? | NO | Doc. |
| 7. Centralizes ownership? | NO | Doc-tier. |

**Verdict:** **Tier A-PURE-as-DOCTRINE.** Direct extraction (with minor BD-example-stripping). The doctrine itself is platform-tier; can be referenced from Stacey's site to enforce consistent layer discipline.

**Owner-decision-bound:** none.

---

## §4. The Batch 2 sub-band classification

Combining all 8 candidates with Pass 295's 3-band split:

| Sub-band | Batch 2 candidates |
|---|---|
| **A-pure** | Sentry init + errorReporting; `useOnlineStatus`; LAW_LAYERED_ARCHITECTURE doc |
| **A-cosmetic** | validate-app-config (parameterize check list); useServiceWorkerUpdate (parameterize PWA library); perfMarks (rename `bd:` namespace); useHashPage (parameterize page type via generic) |
| **A-doctrine** | Notifications system (TOAST_CATEGORIES + DeepLink type are BD-product-specific); Provider/context PATTERN (extract as doctrine doc + skeleton, NOT as helper) |

Plus one **Tier B re-classification:** `devMapInstanceCounter` + `devGlContextCounter` — these belong to the **map-engine optional module**, not platform-core. Brief grouped them with instrumentation; doctrine analysis suggests splitting.

---

## §5. New finding: false-universal pattern surfacing (relay #20 Priority E)

Relay #20 explicitly named "identify false universals" as Priority E — systems that appear universal mechanically but carry hidden brand doctrine.

Pass 296 surfaces TWO clear false-universals:

### 5.1 Notifications type system

The brief listed Notifications as straightforward Tier A. Code reads as a clean Context + hook + types pattern. **But** the category enum AND the deep-link union are hard-coded BD product mechanics. A "structurally reusable" lens passes; a "behaviorally reusable" lens fails.

This is the cleanest example yet of why the 7-question framework matters.

### 5.2 Provider/context pattern as a HELPER

The brief implies `MapSessionProvider` is "the pattern" — implying extraction as a helper. **But** the pattern's value is in its DOCTRINE (mount order + first-import side-effect + Phase-1-inert default + per-AI extraction discipline per the file's doc-comment), not in code reuse. Extracting as a generic `createSeamProvider(...)` helper would CENTRALIZE the pattern and dilute the doctrine.

Doc-as-extraction preserves the philosophy; helper-as-extraction centralizes ownership.

---

## §6. Updated Stacey-bootstrap consumption picture

Combining Pass 295 + Pass 296 findings:

**Stacey can consume immediately (A-pure, no debranding):**
- ~48 shadcn UI primitives + `cn` utility (Pass 295)
- Sentry init + errorReporting (Pass 296)
- `useOnlineStatus` (Pass 296)
- LAW_LAYERED_ARCHITECTURE doc as reference (Pass 296)

**Stacey can consume with light parameterization (A-cosmetic, ~30-min each):**
- NotificationToast (single class swap)
- ScreenErrorBoundary (text + class + gradient props)
- Generic animation keyframes subset (~15-18 of 29)
- validate-app-config (check list as prop)
- useServiceWorkerUpdate (PWA library param)
- perfMarks (namespace rename)
- useHashPage (page-type generic)

**Stacey cannot consume yet (A-doctrine, owner-decision required):**
- Theme system architecture (3 token-tier owner-decision)
- Atmosphere keyframe family (orb*)
- ImageWithFallback (storage://-awareness param decision)
- Notifications system (generic-core-vs-registry decision)
- Provider/context pattern (doc-vs-helper decision)

**Stacey explicitly does NOT consume:**
- Map engine + map-instance counters (Tier B map-engine module)
- All BidOnDent business logic (Tier C)

---

## §7. Connection to relay #20 priorities

Pass 296 directly addresses:
- **Priority A** ("Tier A doctrine deep-dive Batch 2") — done; this pass.
- **Priority E** ("identify false universals") — surfaced two clear examples (§5).
- **Priority F** ("preserve evolutionary asymmetry") — the doc-vs-helper distinction for provider pattern (§3.7) is exactly this concern — extracting as a helper would FORCE every consumer onto the same provider shape.

Priority B (folder topology) and Priority C (boundary enforcement prototype) are owner-decision-blocking on the 3 unblockers from Pass 295 §7 — cannot proceed without them.

Priority D (Stacey bootstrap reconnaissance) is partially addressed in §6 above (consumption picture) but full reconnaissance requires owner input on Stacey's actual business needs.

---

## §8. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 / #20 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| LAW_ANIMATION_AND_ATMOSPHERE / LAW_PROJECT_RULES / LAW_LAYERED_ARCHITECTURE / MOLANDJESUS | UNTOUCHED |
| Existing PLAN_PLATFORM_* docs | UNTOUCHED |

ZERO new owner-decision points (cumulative remains 31).

---

## §9. What this pass does NOT do

- No extraction (relay #19/#20 Phase A is mapping only)
- No source modification
- No new files outside `docs/REF_PASS_296_*`
- No edit to PLAN_PLATFORM_* docs (owner-ratified work-product)
- No bootstrap of any new repo
- No proposal to start Stacey site (relay #19 Phase C; awaits Phase B completion)
- No platform-doctrine centralization
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §10. Forward triggers

1. **Owner answers the 3 immediate-blocker decisions from Pass 295 §7** → A-pure extraction can begin.
2. **Pass 297** continues doctrine deep-dive — moves to Tier B (map-engine, persistent-map-session, performance-tracking, navigation/turn-by-turn, realtime, storage-media, scheduling, content/CMS, lead-capture). Each likely heavier doctrine load.
3. **Owner authorizes the FIRST extraction** → preservation-governed micro-pass. Best A-pure first candidate from combined Batch 1+2: `cn` utility (smallest possible extraction; proves the seam works).
4. **Owner provides Stacey business context** → Stacey-bootstrap reconnaissance pass becomes possible.
5. **Owner ratifies the doc-as-extraction approach for the provider pattern** → enables `REF_PROVIDER_SEAM_PATTERN.md` authoring.

---

## §11. Status

REF doc shipped Pass 296. Audit-only. Doctrine deep-dive Batch 2 complete. Combined with Pass 295, ~13 candidates audited; the 3-band classification framework is now well-instantiated. False-universal pattern surfaced explicitly per relay #20 Priority E.

**End of doc.**
