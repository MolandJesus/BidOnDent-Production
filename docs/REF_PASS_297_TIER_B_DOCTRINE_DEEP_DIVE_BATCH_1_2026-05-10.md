# REF — Doctrine-Aware Tier B Extraction Re-Classification (Pass 297, 2026-05-10, First Batch)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #20 (forward trigger #2: Pass 297 moves to Tier B with same 7-question framework; each module likely heavier doctrine load).
**Tier:** REF.
**Source modification:** ZERO. No extractions. No edits. No PLAN_PLATFORM_* modifications. Pure read-only mapping.
**Companion to:** Pass 295 (Tier A Batch 1), Pass 296 (Tier A Batch 2). This pass extends the 3-band classification to optional modules.

---

## §1. Premise — Tier B is differently shaped

Tier A is "platform-core" (always shipped with the platform). Tier B is "optional opt-in modules" — each is a SEPARATE package the consumer app chooses to import (or not).

The 7-question framework still applies, but with TWO additional dimensions:

- **Module coherence:** does this module make sense as ONE opt-in unit, or is it actually multiple modules co-located?
- **Consumer-side doctrine cost:** what doctrine does adopting this module force the consumer to also adopt?

The brief lists 9 Tier B modules; 6 already exist (map-engine, persistent-map-session, performance-tracking, navigation, realtime, storage-media); 3 don't exist yet (scheduling/consultation, content/CMS, lead-capture/forms — the last has a BD-specific *instance* but no generic module).

Pass 297 audits 5 of the existing modules + 1 of the not-yet-existing (lead-capture as the BusinessInquirySection→generic transition).

---

## §2. The 5 candidates audited this batch

| # | Candidate | Path | Surface |
|---|---|---|---|
| 1 | **map-engine** | `components/maps/engine/MapEngineCanvas.tsx` + supporting | Headless MapLibre adapter (Pass 188 extraction) |
| 2 | **storage-media** | `services/storage/StorageService.ts` + `SupabaseStorageAdapter.ts` + `types.ts` | Provider-agnostic storage abstraction |
| 3 | **realtime services** | `services/realtime/Realtime{Bid,Estimate,Report}Service.ts` | Supabase realtime subscription wrappers |
| 4 | **navigation/turn-by-turn** | `features/navigation/*` + ~10 hooks | Live navigation, deviation detection, reroute, voice |
| 5 | **lead-capture/forms** | `components/landing/BusinessInquirySection.tsx` (BD instance) + future generic | Form pattern with multi-variant + validation + submit |

---

## §3. Per-candidate doctrine analysis

### 3.1 map-engine — `components/maps/engine/`

**Surface:** `MapEngineCanvas.tsx` is the headless adapter (Pass 188 extraction). Imports the resize-patch as the first non-comment line (Pass 281 §11 invariant #3). Imports `markEngineMount/Dispose` from perfMarks (the `bd:` namespace from Pass 296 §3.5). Wraps `<Map>` from `react-map-gl/maplibre` + `<MapLibreCoverageMapLayers>`.

**Brand-coupling found:**
- Imports `Coverage*` types from `serviceCoverageMapTypes` (BD-coupled type names — but the underlying shape is generic).
- Engine-mount perf-marks use `bd:engine:mount` namespace (Pass 296 §3.5 already flagged for rename).
- The "Coverage" prefix is a BD-domain word (coverage area for body-shop service); a Stacey site map (if she had one) wouldn't be "coverage."

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Headless adapter pattern is clean. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | Layers are coverage-shaped; Stacey-class consumers might need different layer compositions. |
| 3. Authority-localized? | ✅ YES | Engine instance owns its own state; viewport/follow/arrival controllers are leaf components. |
| 4. Continuity-sensitive? | ✅ HIGH | Pass 281 §11 invariant #3 (resize-patch first-import) anchors here. Pass 289 D4 (instance recreation cost on tree-swap) lives in the engine lifecycle. |
| 5. Trust-sensitive? | ⚠️ MEDIUM | Map gestures = trust signal (Pass 291 gesture-precedence pattern). Engine mounts shape gesture defaults. |
| 6. Orchestration-depth-sensitive? | ✅ HIGH | Engine + 3 controllers (viewport/follow/arrival) = small orchestration tree. Adding a 4th controller would deepen it. |
| 7. Centralizes ownership? | LOW (per-instance, not global) | Each consumer mounts its own engine. |

**Verdict:** **Tier B-DOCTRINE-modular.** Map-engine module is the right shape; would extract with: (a) resize-patch as a peer-import requirement (documented), (b) perf-mark namespace as a config option, (c) layer-composition slot pattern (consumer supplies its own `MapLibre*Layers` component), (d) coverage-typed primitives renamed to neutral names.

**Stacey-relevance:** ZERO. Stacey's site does not need a map engine.

**Module coherence:** YES — map-engine is one opt-in module.

**Consumer-side doctrine cost:** consumer must respect Pass 281 §11 invariant #3 (resize-patch first-import) AND Pass 289 D4 acknowledgment (engine recreation cost on lifecycle changes). Documented doctrine, not optional.

### 3.2 storage-media — `services/storage/`

**Surface:** `StorageService.ts` + `SupabaseStorageAdapter.ts` + `types.ts`. Already designed for provider-agnosticism (header explicitly says "Switch providers by changing environment variable. STORAGE_PROVIDER=supabase|aws-s3|cloudflare-r2"). `IStorageProvider` interface + adapter pattern.

**Critical doctrine note:** per CLAUDE.md fact #2 + #3, BidOnDent's storage discipline is:
- URLs are pointers (`storage://<bucket>/<path>`), NEVER signed URLs persisted
- Sign-on-read via `hydrateSignedStorageUrl()`
- RLS deny-by-default; access only via edge function (service role) or signed URLs

The current `StorageService.ts` is the CLIENT-side abstraction. The `hydrateSignedStorageUrl` helper lives in `supabase/functions/server/utils/storage.ts` (per CLAUDE.md). These are DIFFERENT layers — client-side abstraction (this file) and server-side hydration (different module).

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Provider-agnostic by design. |
| 2. Behaviorally reusable? | ✅ YES — IF the consumer adopts the pointer-on-write/sign-on-read doctrine | The doctrine MUST travel with the module. |
| 3. Authority-localized? | ✅ YES | Each upload/delete/signed-URL call is local. |
| 4. Continuity-sensitive? | ⚠️ MEDIUM | Signed URL expiration is a runtime continuity concern (24h max) — must re-sign on read. |
| 5. Trust-sensitive? | ✅ HIGH | Storage RLS + signed-URL discipline IS a security/trust contract. Wrong adoption = leak. |
| 6. Orchestration-depth-sensitive? | NO | Service-level; no providers. |
| 7. Centralizes ownership? | NO | Each consumer app initializes its own provider config. |

**Verdict:** **Tier B-DOCTRINE-modular.** The module is well-shaped for extraction; the doctrine that MUST accompany it is the pointer-on-write/sign-on-read pattern + RLS deny-by-default. Without doctrine adoption, consumers would re-introduce the same security gaps the BidOnDent skill (`supabase-storage-signed-urls`) prevents.

**Stacey-relevance:** MEDIUM-HIGH. If she has photos / portfolio images, she needs this. Even for hosted-elsewhere images (Cloudinary, Vercel images), the abstraction is useful for future-proofing.

**Module coherence:** YES — single opt-in module.

**Consumer-side doctrine cost:** must adopt the pointer/sign pattern. Skill should travel with the module (`supabase-storage-signed-urls` skill is already documented; should be co-extracted as platform doctrine).

### 3.3 realtime services — `services/realtime/`

**Surface:** Three services: `RealtimeBidService`, `RealtimeEstimateService`, `RealtimeReportService`. Each follows the same pattern (Supabase channel subscribe + typed callback + cleanup) but each is hard-coded to a BidOnDent business object.

**Brand-coupling:** the SERVICE NAMES (Bid, Estimate, Report) are 100% BD-product. The TYPES they carry are BD types. The CHANNEL NAMES are BD-domain.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Pattern is generic Supabase realtime wrapper. |
| 2. Behaviorally reusable? | ❌ NO | Three separate services, each typed to a BD object. Stacey would never use BidService. |
| 3. Authority-localized? | ✅ YES | Each service owns its own channel; cleanup is per-subscription. |
| 4. Continuity-sensitive? | ⚠️ MEDIUM | Subscription lifecycle is continuity-sensitive (Pass 290 §3.1 catalogued realtime channels). |
| 5. Trust-sensitive? | ⚠️ MEDIUM | Realtime updates create trust ("this is live"). |
| 6. Orchestration-depth-sensitive? | NO | Service-level. |
| 7. Centralizes ownership? | NO if extracted as a generic factory; YES if extracted as the 3 typed services | Forcing every consumer onto Bid/Estimate/Report is the centralization risk. |

**Verdict:** **Tier B-DOCTRINE-modular.** What extracts is the GENERIC FACTORY: `createRealtimeService<T>(channelName, eventTypes, parser)` — not the 3 typed instances. BidOnDent's app retains the 3 typed services as thin wrappers around the factory. Stacey defines her own typed wrappers if she needs realtime at all.

**Stacey-relevance:** LOW. Most landing/portfolio/business sites don't need realtime. Could become useful later (booking confirmations, contact-form notifications) but not for v1.

**Module coherence:** YES if extracted as factory + adapter pattern. NO if extracted as the 3 typed services.

**Consumer-side doctrine cost:** must understand Supabase realtime channel-naming + subscription lifecycle.

### 3.4 navigation/turn-by-turn — `features/navigation/`

**Surface:** 11+ files: `useNavigationSession`, `useNavigationReroute`, `useNavigationIntelligence`, `useNavigationToastBridge`, `detectDeviation`, `shouldTriggerReroute`, `computeNavigationMetrics`, plus type files. This is the MOST complex Tier B module.

**Doctrine load:** EXTREMELY HIGH.
- Pass 289 D3 (nav-side-sheet loss mid-navigation), D4 (instance recreation cost), D6 (cross-mount gate vulnerability) all live here.
- Pass 290 X1 (stale-navigation-session cross-tab), X3 (discovery-quality persistence — TIER A-doctrine that this module DEPENDS on).
- Pass 291 S3 (guidance overlay duplication), S4 (renderGuidanceOverlay duplication).
- Trust choreography: ALL of relay #18 Priority B's named items (deferred-fetch trust, "Search this area" timing, route plausibility, camera ownership transitions, loading-state honesty, interruption-recovery) live in this module.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ⚠️ PARTIAL | The pure compute helpers (`detectDeviation`, `shouldTriggerReroute`, `computeNavigationMetrics`) are reusable; the React hooks carry orchestration. |
| 2. Behaviorally reusable? | ⚠️ NICHE | Per the brief: "Niche; collision-style navigation use cases." Most websites do NOT need turn-by-turn. |
| 3. Authority-localized? | ⚠️ MIXED | Each hook owns its own state, but the navigation session crosses many components (Pass 289 §3 lifecycle survival). |
| 4. Continuity-sensitive? | ✅ EXTREME | This is the densest continuity surface in the audit set. |
| 5. Trust-sensitive? | ✅ EXTREME | Navigation is among the most trust-loaded UX surfaces in the entire codebase. |
| 6. Orchestration-depth-sensitive? | ✅ HIGH | Navigation orchestration (route preview → active guidance → deviation → reroute → arrival) is multi-stage. |
| 7. Centralizes ownership? | NO if extracted as a coherent module; YES if its hooks are scattered | Module coherence is critical. |

**Verdict:** **Tier B-DOCTRINE-EXTREME.** This is the highest-doctrine-load module in Tier B. Any extraction requires:
- Pass 289 D-series + Pass 290 X-series + Pass 291 S-series acknowledgment
- Camera-authority transition doctrine (per relay #18)
- Trust-choreography contract (per relay #18 Priority B)
- Co-extraction with the discovery-quality TIER A-doctrine module (which Pass 294 declined to fix; navigation depends on it)

**Stacey-relevance:** ZERO. Stacey does not need turn-by-turn navigation.

**Module coherence:** YES — but with hard prerequisite that consumer adopts the doctrine OR the module ships with explicit pre-flight checks that warn when doctrine is violated.

**Consumer-side doctrine cost:** EXTREMELY HIGH. Should NOT be extracted until: (a) BidOnDent's own navigation continuity is fully stable, (b) at least one OTHER consumer has actually requested turn-by-turn nav. Per relay #19/#20 "extract only after duplication demonstrates true shared need" — this module fails the duplication test today.

**Practical recommendation:** keep navigation in BidOnDent's repo until a SECOND consumer genuinely needs it. Don't pre-extract a complex module just because the brief lists it.

### 3.5 lead-capture/forms — `BusinessInquirySection.tsx` (BD instance) → future generic

**Surface:** `BusinessInquirySection.tsx` is 475 lines. Toggles between `"shop"` and `"insurer"` form variants. Each variant has BD-specific fields (`shop_name`, `dmv_registration_number`, `contact_person`, `email`, `phone_number`, `website` for shops; insurer-specific fields elsewhere). Validates + submits to a Supabase function.

**Brand-coupling:** the FORM VARIANTS (`shop` | `insurer`), the FIELDS, the VALIDATION rules — all BD-specific. The PATTERN (multi-variant tabs + validation + submit) is generic.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Multi-variant form pattern is generic. |
| 2. Behaviorally reusable? | ❌ NO (current state) | All variant types + fields are BD-product. Stacey would have her own variants (consultation request, mailing list signup, contact form). |
| 3. Authority-localized? | ✅ YES | Single component owns all state. |
| 4. Continuity-sensitive? | NO | Submit is one-shot. |
| 5. Trust-sensitive? | ✅ HIGH | Lead capture IS the conversion funnel — trust signals matter (validation messages, error handling, success feedback). |
| 6. Orchestration-depth-sensitive? | NO | Self-contained. |
| 7. Centralizes ownership? | NO if extracted as a generic Form factory; YES if extracted as the BD-shop-insurer form | Forcing Stacey onto shop/insurer would be wrong. |

**Verdict:** **Tier B-FUTURE-modular.** The BD instance is NOT the module. The module is the GENERIC `MultiVariantInquiryForm<TVariants>` pattern that gets generalized FROM the BD instance. The brief's note ("Light forms exist; generalize the pattern") is exactly right — the lead-capture module DOES NOT EXIST YET. It will be authored fresh when a SECOND consumer needs it (likely Stacey).

**Stacey-relevance:** ✅ HIGH. Stacey almost certainly needs a contact form / consultation request form / mailing list signup. This is one of the few Tier B modules Stacey actually needs.

**Module coherence:** YES — the future generic module is one opt-in unit.

**Consumer-side doctrine cost:** light — provide your own variant types, your own fields, your own submit handler. Validation pattern travels.

**Critical timing observation:** this module is the IDEAL "extract by duplication demonstrates true shared need" candidate per relay #19/#20. When Stacey's site is built and her contact form is duplicated from BusinessInquirySection's pattern, the SECOND build provides the convergence evidence to extract the generic. Pre-extracting would either over-generalize (designing for hypothetical use) or under-generalize (Stacey's needs differ from BD's).

---

## §4. Tier B 3-band classification (combined with Tier A from Passes 295-296)

| Sub-band | Tier B candidates this batch |
|---|---|
| **B-pure** | (none in this batch — Tier B is inherently doctrine-loaded) |
| **B-doctrine-modular** | map-engine; storage-media; realtime services (as factory, not as 3 typed services) |
| **B-doctrine-EXTREME** | navigation/turn-by-turn |
| **B-FUTURE-modular** | lead-capture/forms (extract on Stacey-duplication trigger) |

The lack of B-pure candidates is itself signal: **Tier B modules are by definition heavier than Tier A.** The brief's framing ("opt-in modules") is correct; doctrine-aware analysis confirms each opt-in carries a doctrine cost the consumer must accept.

---

## §5. New finding: the "extraction trigger sequence"

Combining Passes 295-296 (Tier A) and Pass 297 (Tier B) reveals a clear extraction-trigger taxonomy:

| Trigger type | Examples | When it fires |
|---|---|---|
| **Designed-for-extraction** | shadcn UI, Sentry init, useOnlineStatus, LAW_LAYERED_ARCHITECTURE | Already designed reusable; extract immediately on owner authorization |
| **Owner-decision-blocked** | theme system, notifications type system, provider/context pattern | Extract only after owner answers shape decisions |
| **Cosmetic-debranding** | NotificationToast, ScreenErrorBoundary, perfMarks namespace, useHashPage | Extract with parameterization; ~30-min each |
| **Module-shaped** | map-engine, storage-media, realtime factory | Extract as module with co-shipped doctrine |
| **EXTREME-doctrine** | navigation/turn-by-turn | Defer until second consumer demonstrates need |
| **Duplication-triggered** | lead-capture/forms generic | Author fresh when Stacey's instance provides convergence evidence |

The taxonomy maps to relay #19/#20's "extract only after behavioral convergence demonstrates genuine shared need" rule:
- **Designed-for-extraction** is the only category that justifies pre-Stacey extraction.
- **Cosmetic-debranding** is owner-priority for parameterization rounds.
- **Module-shaped** waits for owner ratification of the module shape.
- **EXTREME-doctrine** + **Duplication-triggered** wait for Stacey's site to provide the second-instance evidence.

---

## §6. Connection to relay #20 priorities

Pass 297 directly addresses:
- **Priority A** ("Tier A doctrine deep-dive Batch 2") — Pass 296 was strict Tier A; Pass 297 extends discipline into Tier B (forward trigger #2 from Pass 296 §10).
- **Priority E** ("identify false universals") — surfaced TWO new examples: realtime services as 3 typed instances (false-universal of "realtime is generic") + lead-capture/forms BD instance (false-universal of "form pattern is generic when it's actually three pages of BD product fields").
- **Priority F** ("preserve evolutionary asymmetry") — the recommendation to NOT pre-extract navigation (§3.4) is exactly this concern.

---

## §7. Updated Stacey-bootstrap consumption picture (Tier B addendum)

Combining Pass 295 + Pass 296 + Pass 297 findings for Tier B:

**Stacey can consume immediately (Tier B, no doctrine debt):** none. Tier B is by definition opt-in with doctrine cost.

**Stacey can consume with doctrine acceptance:**
- storage-media (if she has portfolio images and is willing to adopt the pointer/sign pattern)

**Stacey may want but cannot consume yet (awaits duplication-triggered authoring):**
- lead-capture/forms generic (will be authored from her contact-form needs)
- scheduling/consultation (DOES NOT EXIST YET; per brief)
- content/CMS (DOES NOT EXIST YET; per brief)

**Stacey explicitly does NOT consume:**
- map-engine (no map needed)
- navigation/turn-by-turn (no turn-by-turn needed)
- realtime services (no live-update needed for a small business site)

**Practical Stacey Tier B picture:** ZERO Tier B modules consumed at v1 launch. Stacey's site is a Tier-A-only consumer for v1. Tier B emerges later as her needs grow.

This is significant: **Stacey's first-version is a pure Tier A test of the platform.** The Tier B doctrine-load doesn't enter until v2+.

---

## §8. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 / #20 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| LAW_* / MOLANDJESUS / PLAN_PLATFORM_* | UNTOUCHED |

ZERO new owner-decision points (cumulative remains 31).

---

## §9. What this pass does NOT do

- No extraction (relay #19/#20 Phase A is mapping only)
- No source modification
- No new files outside `docs/REF_PASS_297_*`
- No edit to PLAN_PLATFORM_* docs
- No bootstrap of any new repo
- No platform-doctrine centralization
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §10. Forward triggers

1. **Owner answers Pass 295 §7 unblockers** → A-pure extraction can begin (Stacey's primary v1 needs are Tier A, so this unblocks her bootstrap timeline more than any other action).
2. **Pass 298** continues with: persistent-map-session (PMS) deep-dive (Pass 281 §11 invariants #1 and #3 anchors); performance-tracking module; the 3 not-yet-existing modules (scheduling, CMS, lead-capture-generic) as DESIGN sketches.
3. **Owner authorizes the FIRST extraction** → recommended starting candidate from combined Pass 295-297: `cn` utility (smallest, A-pure, zero risk).
4. **Owner provides Stacey business context** → Stacey-bootstrap reconnaissance pass becomes possible.
5. **Owner ratifies the duplication-triggered authoring approach** → defers lead-capture/forms generic until Stacey provides convergence evidence.

---

## §11. Status

REF doc shipped Pass 297. Audit-only. Combined Pass 295 + 296 + 297 cover ~18 candidates across Tier A + Tier B. The 3-band split + extraction-trigger taxonomy is now well-instantiated. Stacey's first-version is confirmed as a pure Tier A consumer (no Tier B modules at v1).

**End of doc.**
