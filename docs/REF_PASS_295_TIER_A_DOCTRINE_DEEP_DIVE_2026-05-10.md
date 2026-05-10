# REF — Doctrine-Aware Tier A Extraction Re-Classification (Pass 295, 2026-05-10, First Batch)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #19 (Phase A: doctrine-aware extraction mapping in BidOnDent before any extraction).
**Tier:** REF.
**Source modification:** ZERO. No extractions. No edits. No PLAN_PLATFORM_* modifications (the existing brief is owner-ratified work-product). Pure read-only mapping.
**Companion to:** [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md §3.1`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) (the existing Tier A list this pass deepens), [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) (the 21 owner-decision-points this pass does NOT touch).

---

## §1. Premise

Relay #19 named Phase A as: continue doctrine-aware extraction mapping in BidOnDent BEFORE any extraction. The relay supplied 7 mandatory questions for every candidate:

1. Is this **structurally** reusable? (the code mechanism works elsewhere)
2. Is this **behaviorally** reusable? (the runtime semantics fit elsewhere)
3. Is this **authority-localized**? (or does it create global authority claims)
4. Is this **continuity-sensitive**? (per the 5-axis audit set 289-293)
5. Is this **trust-sensitive**? (per relay #18 trust-choreography theme)
6. Is this **orchestration-depth-sensitive**? (would extraction add layers)
7. Would extraction **accidentally centralize ownership**?

The relay also reminded: *"many systems APPEAR reusable mechanically while actually carrying hidden continuity doctrine."* This pass tests that hypothesis on 5 Stacey-relevant Tier A candidates from the existing brief.

**Crucial constraint:** no extractions. The pass produces a CLASSIFICATION only.

---

## §2. The 5 candidates audited this batch

Selected for highest Stacey-site relevance + lowest extraction blast:

1. **shadcn UI primitives** (`src/app/components/ui/*` — 49 files)
2. **Theme system foundation** (`src/app/theme/globalSurfaceTheme.ts` + `src/styles/theme.css` — 4940 lines combined)
3. **Motion system / animations.css** (`src/styles/animations.css` — 553 lines, ~29 keyframes per LAW_ANIMATION_AND_ATMOSPHERE)
4. **ImageWithFallback** (`src/app/components/codelayer/ImageWithFallback.tsx` — 61 lines)
5. **ScreenErrorBoundary** (`src/app/components/ScreenErrorBoundary.tsx` — 97 lines)

---

## §3. Per-candidate doctrine analysis

### 3.1 shadcn UI primitives — `components/ui/`

**File count:** 49 .tsx files (button, card, dialog, drawer, sheet, dropdown-menu, etc.)

**Brand-coupling scan:** ONE site of `bd-` class usage found — `NotificationToast.tsx:60` uses `bd-glass-card`. All other 48 files use only generic Tailwind utilities + Radix primitives + lucide icons + the local `cn()` helper.

**External deps:** `@radix-ui/react-*` family + `class-variance-authority` + `lucide-react` + `./utils` (the `cn` helper).

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Pure shadcn pattern; works in any React+Tailwind project. |
| 2. Behaviorally reusable? | ✅ YES (48/49) | NotificationToast is the exception (uses `bd-glass-card` + tied to BD's notification feed semantics). |
| 3. Authority-localized? | ✅ YES | Each component owns its own state; no cross-component coupling beyond Radix internals (which are themselves localized). |
| 4. Continuity-sensitive? | NO for primitives; YES for `dialog.tsx` (Pass 289 Pattern B fullscreen) | Dialog/sheet primitives are part of the within-tab fullscreen lifecycle. Stacey site using them inherits the Radix unmount-on-close semantics — usually fine; worth noting. |
| 5. Trust-sensitive? | NO | Visual primitives; trust signals come from the brand-specific styling on top, not from the primitives themselves. |
| 6. Orchestration-depth-sensitive? | NO | Each primitive is leaf-or-near-leaf; doesn't introduce new providers. |
| 7. Centralizes ownership? | NO | Each component is independent; extraction does not create a "UI Coordinator". |

**Verdict:** **Tier A-PURE** (48/49). NotificationToast is **Tier A-cosmetic** (single class swap to debrand).

**Stacey-immediate-need:** ~15 of these (button, card, dialog, sheet, input, label, select, badge, separator, tooltip, drawer, accordion, alert, tabs, scroll-area). Other 33 are nice-to-have.

### 3.2 Theme system foundation — `globalSurfaceTheme.ts` + `theme.css`

**`globalSurfaceTheme.ts`:** 3-tone-token architecture (`light` / `soft-dark` / `map-dark`) with 6 token slots per tone (background / glassBg / glassBorder / text / textSecondary / shadow). Architecture is generic; values are 100% BidOnDent-locked palette per LAW_PROJECT_RULES.

**`theme.css`:** 4940 lines of accumulated brand-specific visual canon. The pass index alone enumerates Pass A through O+ for landing-section work. Contains:
- :focus-visible global styles (~5 lines, portable)
- html/body resets (~10 lines, portable)
- :root token declarations (~50-100 lines, partially portable — token NAMES are platform-tier, VALUES are brand-tier)
- ~4800 lines of brand-specific component styling, atmospheric overlays, gold-lamp palette, cool-blue gradients, bd-* utility classes

**7-question audit (architecture):**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES (architecture) | The 3-tone-token shape is a clean abstraction. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | Architecture yes; values explicitly NOT (LAW_PROJECT_RULES locks BD light-mode palette). Stacey gets her own palette. |
| 3. Authority-localized? | ✅ YES | Tone tokens consumed by reading the SurfaceTone constant per surface; no global theme service. |
| 4. Continuity-sensitive? | ⚠️ YES (palette LAW per CLAUDE.md fact #7) | The locked premium-gold palette is Pass 281 §11 invariant #4; not directly extraction-touching but the boundary matters. |
| 5. Trust-sensitive? | ✅ HIGH | Per Pass 292 §7: whitespace + premium glass + cool-blue-with-gold-lamp ARE the trust signal. The surface system is one of the load-bearing trust mechanisms. |
| 6. Orchestration-depth-sensitive? | NO | No providers; pure CSS + token lookup. |
| 7. Centralizes ownership? | NO if extracted as TOKEN architecture only; YES if extracted with values baked in | Extraction must preserve token-architecture-without-values shape. |

**Verdict:** **Tier A-DOCTRINE** — extraction is owner-decision-bound on which token NAMES are platform-tier vs brand-tier. The brief's note ("TOKENS architecture is reusable; the BD-specific values are not") is correct but understates the doctrine load: Stacey's site requires HER OWN tone definitions, and the platform should provide the SHAPE without prescribing emotional content.

**Owner-decision-bound:** YES — see Pass 268 §4 (token/theme architecture) which already has 4 unanswered owner-decision points for this exact subsystem.

### 3.3 Motion system / animations.css

**Surface:** ~29 keyframes per LAW_ANIMATION_AND_ATMOSPHERE; a sample of names visible: `float`, `float-slow`, `float-delayed`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `fadeIn`, `scaleIn`, `pulseGlow`, `shimmer`, `slideInNotification`, `countGrow`, `blobFloat`, `bounceSoft`, `dashMove`, `spinSlow`, `speedWarningPulse`, `orbDrift`, `orbGlow`, `orbFloat`, `orbRotateDrift`, `orbBreathe`, `arrival-scale-in`, `bdTileFade`, ...

**Two sub-classes within the keyframe set:**
- **Generic primitives:** `fadeInUp`, `fadeIn`, `scaleIn`, `shimmer`, `slideInNotification`, `dashMove`, `spinSlow`, `bounceSoft` — could move to platform layer.
- **Brand-specific atmosphere:** `orbDrift / orbGlow / orbFloat / orbRotate / orbBreathe` (BidOnDent's atmosphere orbs), `speedWarningPulse` (navigation), `arrival-scale-in` (navigation), `bdTileFade` (map). These embody BD's emotional infrastructure.

**Reduced-motion contract** (per Pass 284 + Pass 287 audits): every keyframe has a `motion-reduce:` companion. This is **PLATFORM DOCTRINE** — any extraction must preserve the contract.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES (generic subset); ⚠️ PARTIAL (atmosphere subset) | Generic keyframes are direct copies; atmosphere keyframes carry brand semantics. |
| 2. Behaviorally reusable? | ⚠️ MIXED | Generic yes; atmosphere keyframes encode the BD emotional cadence (per LAW_ANIMATION_AND_ATMOSPHERE). Re-using `orbBreathe` on Stacey's site would carry BD atmospheric DNA into a non-BD context. |
| 3. Authority-localized? | ✅ YES | Each keyframe is a leaf CSS construct; no global motion controller. |
| 4. Continuity-sensitive? | ✅ HIGH | Reduce-motion contract is the most mechanically-protected invariant in the codebase (Pass 238 + Pass 284). Extraction MUST preserve it. |
| 5. Trust-sensitive? | ✅ HIGH | Per Pass 292: motion is part of the "calm/premium" trust signal. Atmospheric keyframes especially. |
| 6. Orchestration-depth-sensitive? | NO | Pure CSS; no JS orchestration layer. |
| 7. Centralizes ownership? | NO if generic only; ⚠️ YES if atmosphere-orbs extracted as "platform atmosphere" | The orb family should NOT become platform-default atmosphere — that would force BD's emotional DNA onto every consumer. |

**Verdict:** Split:
- **Tier A-cosmetic** (generic keyframes ~15-18 of 29): extract with reduced-motion contract preservation.
- **Tier A-DOCTRINE** (atmosphere keyframes ~10-12 of 29): keep in BidOnDent. Stacey gets her own atmosphere if she wants one.
- **The reduced-motion CONTRACT itself:** **PLATFORM DOCTRINE** — codified into a future REF that any consumer must respect.

**Owner-decision-bound:** YES — owner picks which keyframes are platform vs brand. Brief's "29-keyframe set: platform doctrine" is too generous; the keyframe SET is mixed; only the CONTRACT is platform.

### 3.4 ImageWithFallback

**Surface:** 61 lines. Renders `<img>` with onError fallback to a stylized placeholder. Has `isRenderableSrc` helper that explicitly REJECTS `storage://` prefixes (line 14).

**Critical observation:** the `storage://` rejection encodes BidOnDent's storage-pointer convention (CLAUDE.md fact #2). The component "knows" that `storage://` URLs cannot be rendered directly — they must be hydrated via `hydrateSignedStorageUrl()` BEFORE reaching this component. If reached unhydrated, the component shows the fallback (rather than letting `<img src="storage://...">` 404).

**This is implicit doctrine knowledge.** Stacey's site might not use Supabase Storage at all (could use Vercel image hosting, local images, Cloudinary, etc.). Extracting ImageWithFallback as-is would carry an unused convention.

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Pattern is generic (try-img, on-error-show-placeholder). |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | The `storage://` knowledge is BD-specific. Extraction needs either (a) parameterize the "unrenderable prefixes" check or (b) split into a generic ImageWithFallback + a BD-specific HydrateAwareImage that wraps it. |
| 3. Authority-localized? | ✅ YES | Local component state; no provider. |
| 4. Continuity-sensitive? | NO | Pure render component. |
| 5. Trust-sensitive? | ⚠️ MEDIUM | Fallback styling uses BD's gold + cool-blue palette (lines 26, 35) — visually brand-coded. Stacey's fallback would look BD-branded. |
| 6. Orchestration-depth-sensitive? | NO | Leaf component. |
| 7. Centralizes ownership? | NO | Each instance independent. |

**Verdict:** **Tier A-DOCTRINE** with a clear remediation path:
- Extract a generic `ImageWithFallback` accepting `unrenderablePrefixes?: string[]` and `fallback?: ReactNode`.
- BidOnDent app retains a thin `BdImageWithFallback` wrapper that passes `["storage://"]` and the gold-cool-blue placeholder.
- Stacey's site provides her own wrapper or uses defaults.

**Owner-decision-bound:** light — owner approves the parameterization shape.

### 3.5 ScreenErrorBoundary

**Surface:** 97 lines. Class component implementing `getDerivedStateFromError` + `componentDidCatch`. Detects chunk-load errors (vite dynamic-import failures). Reports to Sentry via `captureException`. Renders a retry button.

**Brand contamination:**
- Line 78: hardcoded text `"A newer version of BidOnDent is available. Reload to get the latest."`
- Line 89: uses `bd-dashboard-primary-button` class
- Line 90: hardcoded gradient `linear-gradient(135deg, #003d82 0%, #00a0e9 100%)` — BD's primary blue ramp

**Dependencies:**
- `../services/errorReporting` → wraps Sentry. Platform-tier (per existing Tier A row).

**7-question audit:**

| Q | Answer | Notes |
|---|---|---|
| 1. Structurally reusable? | ✅ YES | Pattern is generic React error boundary. |
| 2. Behaviorally reusable? | ⚠️ PARTIAL | Chunk-error detection logic is platform doctrine; brand strings + brand gradient are BD-specific. |
| 3. Authority-localized? | ✅ YES | Each boundary instance is independent. |
| 4. Continuity-sensitive? | ⚠️ MEDIUM | The "shell remains intact while content errors" pattern (per the doc comment) is a continuity decision — extraction must preserve this stance, not collapse to whole-page error pages. |
| 5. Trust-sensitive? | ⚠️ HIGH | Error boundaries are direct trust signals — the messaging tone, the "Your data is safe" copy (line 79), the retry affordance shape — all encode BidOnDent's trust voice. Stacey's site needs HER trust voice, not BD's. |
| 6. Orchestration-depth-sensitive? | NO | No providers; React error boundary is a class component leaf. |
| 7. Centralizes ownership? | NO | Each boundary is independent. |

**Verdict:** **Tier A-cosmetic** to **Tier A-DOCTRINE** depending on extraction approach:
- **Cosmetic path:** parameterize all strings + classes + gradient via props; thin wrapper per brand. Low-doctrine.
- **Doctrine path:** treat error-message tone as a trust-voice slot; require each consumer to provide their own VoiceComponent. Higher-doctrine but more honest about the trust signal.

**Owner-decision-bound:** medium — owner picks the parameterization depth.

---

## §4. The 3-band split inside Tier A

This pass surfaces a structural finding the brief implies but does not formalize:

| Sub-band | Definition | Examples from this batch | Extraction posture |
|---|---|---|---|
| **A-pure** | No brand contamination, no hidden doctrine | 48 of 49 shadcn primitives; the `cn` utility | Extract today; near-zero risk |
| **A-cosmetic** | Brand strings/classes/gradient values; no hidden runtime doctrine | NotificationToast (one class), ScreenErrorBoundary (text+class+gradient), generic animation keyframes | Extract with parameterization; low risk |
| **A-doctrine** | Carries hidden runtime contract or brand-emotional encoding | Theme system (locked palette), ImageWithFallback (storage:// awareness), atmosphere keyframes (orbDrift family) | Owner-decision before extraction; high doctrine load |

**Implication for Stacey's bootstrap timing (relay #19 Phase C):**

The brief states "~25 platform-core subsystems." The doctrine deep-dive suggests:
- **~40-50 individual files** that are truly A-pure (most of components/ui + cn + a few others)
- **~10-15 files** that are A-cosmetic (need light debranding, ~30-min work each)
- **~5-10 surfaces** that are A-doctrine (require owner-decision-points before extraction)

Stacey's first bootstrap can consume ONLY the A-pure subset cleanly. A-cosmetic surfaces can follow within days. A-doctrine surfaces require owner-decision rounds first.

---

## §5. Connection to the existing planning corpus

### 5.1 Confirms PLAN_PLATFORM_EXTRACTION_BRIEF §3.1's headline claim

The brief said "~25 platform-core subsystems." Pass 295 confirms the claim is structurally correct but adds doctrine nuance: extraction-readiness varies WITHIN Tier A.

### 5.2 Activates PLAN_PLATFORM_BOOTSTRAP_PREP §4 owner-decision points

Per the brief's bootstrap-prep doc, §4 "Token/theme architecture" already has 4 unanswered owner-decision points. Pass 295 §3.2 confirms these decisions ARE prerequisite to theme extraction. The brief's existing analysis is correct.

### 5.3 Confirms relay #19's "behavioral survivability" framing

Pass 295's per-candidate audit shows that "structural reusability" alone is misleading — every candidate passed Q1 but failed at least one of Q2/Q4/Q5. **Behavioral survivability** under extraction is the more discriminating metric, exactly as the relay framed.

### 5.4 No new convergence on `placeDiscoveryQuality.ts:51` hotspot

Pass 295 finds zero new convergence on the hotspot. Tier A candidates do not touch the discovery-quality subsystem. Per relay #18: continue treating that surface carefully; do NOT fix.

---

## §6. The "extract only after duplication demonstrates true shared need" rule

Relay #19 explicitly: *"Do NOT extract based on theoretical reuse. Extract based on repeated behavioral convergence."*

Pass 295's per-candidate analysis suggests:
- **Shadcn primitives**: theoretical reuse is FINE (they are designed to be reused). Extraction can precede Stacey duplication.
- **Theme system**: theoretical reuse is RISKY (each brand will have different needs). Wait for Stacey to duplicate before extracting the architecture.
- **Animations (generic subset)**: theoretical reuse is FINE for fadeInUp/fadeIn/scaleIn/shimmer family. Extract with reduced-motion contract preservation.
- **Animations (atmosphere subset)**: WAIT. Stacey may want her own atmosphere; forcing BD's orb family is wrong.
- **ImageWithFallback**: WAIT. Stacey may not need `storage://` awareness; let the duplication decide whether parameterization is the right shape.
- **ScreenErrorBoundary**: WAIT. Stacey's trust voice is unknown; extract only after she duplicates and we see what she changes.

**Synthesized rule for this batch:** the "extract today" set is essentially **shadcn primitives + the cn utility + a small subset of generic animations**. Everything else benefits from duplication-first to surface the true platform shape.

---

## §7. Owner-decision-bound items surfaced this pass

Pass 295 surfaces NO new owner-decision points (the relevant ones already exist in PLAN_PLATFORM_BOOTSTRAP_PREP). Pass 295 ACTIVATES the following existing decisions as immediate-priority for Stacey-bootstrap-blocking:

1. **PLAN_PLATFORM_BOOTSTRAP_PREP §3.3** (package boundary): is component-level extraction acceptable, or must it be package-level (npm-publishable)?
2. **PLAN_PLATFORM_BOOTSTRAP_PREP §4.5** (token/theme): is the 3-tier token architecture (platform-shape / brand-name / brand-value) acceptable?
3. **PLAN_PLATFORM_BOOTSTRAP_PREP §6.6** (workspace tooling): pnpm + Turborepo, or single-repo path-aliased imports?

Without answers to (1)-(3), even A-pure extraction has nowhere to land. **These three are the unblocking decisions for Stacey-bootstrap.**

**Cumulative owner-decision points: still 31 (UNCHANGED).** Pass 295 does not invent new ones; it identifies which existing ones are the immediate blockers.

---

## §8. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| LAW_ANIMATION_AND_ATMOSPHERE | UNTOUCHED |
| LAW_PROJECT_RULES | UNTOUCHED |
| MOLANDJESUS_DESIGN_DECISIONS | UNTOUCHED |
| Existing PLAN_PLATFORM_* docs | UNTOUCHED (owner-ratified work-product) |

ZERO new owner-decision points (cumulative remains 31).

---

## §9. What this pass does NOT do

- No extraction (relay #19 Phase A is mapping only)
- No source modification
- No new files outside `docs/REF_PASS_295_*`
- No edit to PLAN_PLATFORM_EXTRACTION_BRIEF or PLAN_PLATFORM_BOOTSTRAP_PREP (owner-ratified)
- No bootstrap of any new repo
- No proposal to start Stacey site (relay #19 Phase C; awaits Phase B completion)
- No "platform doctrine" centralization
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §10. Forward triggers

1. **Owner answers the 3 immediate-blocker decisions from §7** → A-pure extraction can begin.
2. **Pass 296** continues doctrine-deep-dive on the next batch of Tier A candidates: Notifications system, Layered architecture doctrine, Service-worker / PWA hooks, Sentry integration, Validate-app-config, Provider/context pattern.
3. **Pass 297+** moves to Tier B candidates (map-engine, persistent-map-session, performance-tracking, etc.) — each likely heavier doctrine load.
4. **Owner authorizes the FIRST extraction** → preservation-governed micro-pass that lifts a single A-pure file (e.g. `cn` utility or one shadcn primitive) into a `src/platform-core/` folder + adds an import-direction lint rule. This is the "lightweight extraction-safe seam" the relay calls for.
5. **Stacey bootstrap planning pass** can begin in parallel with §7 decisions — does not block on extraction.

---

## §11. Status

REF doc shipped Pass 295. Audit-only. The 5-candidate doctrine deep-dive establishes the 3-band split (A-pure / A-cosmetic / A-doctrine) and identifies the 3 unblocking owner-decisions. Forward direction: owner answers the unblockers OR Pass 296 deepens the next Tier A batch.

**End of doc.**
