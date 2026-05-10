---
status: ACTIVE
authority: REF
scope: stacey-atmospheric-foundation-reconnaissance
canonical_source_of_truth: REF_PASS_306_STACEY_ATMOSPHERIC_FOUNDATION_RECON_2026-05-10.md
companion_to: REF_PASS_305_PMS_CONTINUITY_RECONNAISSANCE_2026-05-10.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
---

# Stacey Atmospheric Foundation Reconnaissance (Pass 306, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #29 (BEGIN PHASE I: Atmospheric Portability Recon).

**Tier:** REF. **Reconnaissance only.** No Stacey repo bootstrapped, no infrastructure migrated, no abstraction proposed.

**Function:** lay the conceptual groundwork for the Stacey lane WITHOUT crossing the boundary into actual implementation. Priority A is owner-decision-blocked (Stacey business context required); this pass executes Priorities B-E.

---

## §1. Premise — what Pass 305 changes for the Stacey strategy

Pass 305 anchored the architectural finding: **the repo's continuity reassurance comes from a HABIT, not a system.** 18 specific timing constants distributed across 8 files, each calibrated for one user moment.

That finding governs the entire Stacey strategy. If continuity is a HABIT — a discipline of attentive local timing decisions — then Stacey's site does NOT need to inherit BidOnDent's infrastructure to inherit its continuity property. **Stacey's site needs to inherit the discipline, not the implementations.**

This is the Pass 306 thesis. Phase I's primary experiment is whether a much simpler product can develop ITS OWN HABIT and produce its own felt-continuity outcome — without importing PMS, without copying timing constants, without recreating the provider chain.

The question Phase I asks the Stacey site to answer: **what is the minimum viable form of the discipline?**

---

## §2. The owner-decision blocker (Priority A)

Relay #29 Priority A explicitly enumerates what must be known about Stacey before the lane can be meaningfully entered:

| Required input | Status |
|---|---|
| Stacey's business type | UNKNOWN |
| Target audience | UNKNOWN |
| Emotional tone | UNKNOWN (likely "calm/premium" inheriting BD's calibration intent, but Stacey's specific voice unknown) |
| Trust requirements | UNKNOWN |
| Interaction density | UNKNOWN |
| Expected session length | UNKNOWN |
| Mobile vs desktop emphasis | UNKNOWN |
| Emotional goals | UNKNOWN |
| Premium vs approachable balance | UNKNOWN |
| Information complexity | UNKNOWN |
| Expected interruption patterns | UNKNOWN |

Pass 306 explicitly **does NOT speculate** on these. Per memory + prior relay context, "Stacey is the owner's mom" is the only personal context available. Speculating on her business shape would either:
- (a) produce a generic-business-website plan that ignores her actual needs, OR
- (b) impose BidOnDent's product instincts onto Stacey, which is exactly the anti-gravity violation relay #29 prohibits.

**Operational consequence:** Pass 306 produces ZERO Stacey-specific design choices. The actual Stacey work begins in Pass 307+ once owner provides context. Pass 306 lays the FRAMING that the eventual Stacey work will operate within.

---

## §3. Atmosphere portability mapping (Priority B)

The most concrete contribution Pass 306 can make: separate BidOnDent's qualities into three buckets — clearly portable, clearly NOT portable, and the ambiguous middle.

### 3.1 Portable at the philosophical level

These qualities are habits-of-attention that can be re-instantiated in a simpler organism with completely different specific implementations:

| Quality | What is portable | What is NOT portable |
|---|---|---|
| **Restraint** | The discipline of asking "does this user moment deserve more pause?" | BidOnDent's specific 2.8s arrival hold |
| **Visual breathing room** | The instinct that whitespace is not waste (Pass 292 §7) | BidOnDent's specific `max-w-[1480px]` + `mx-4` patterns |
| **Soft transitions** | The principle that state changes should not feel jarring | BidOnDent's specific cubic-bezier curves (`--bd-flow-ease`, `--bd-ease-entrance`) |
| **Premium typography calmness** | The discipline of low text noise; deliberate hierarchy | BidOnDent's specific font scale, glass shells, tone tokens |
| **Trust-oriented runtime pacing** | The habit of choosing constants that respect emotional moments | BidOnDent's specific 18-constant inventory (Pass 305 §2) |
| **Shallow orchestration** | The principle that direct code outperforms layered abstractions (Pass 303 §6) | BidOnDent's specific 4-layer provider chain |
| **Continuity legibility** | The principle that App.tsx should reveal authority flow at a glance (Pass 302 §3.5) | BidOnDent's specific provider sequence |
| **Interruption softness** | The discipline of "tell the user once, then disappear" (Pass 305 §3 — 4-second toast/error windows) | BidOnDent's specific 3000/4000ms constants |
| **Reduce-motion contract** | The principle of universally honoring prefers-reduced-motion (Pass 284 35/35 audit) | BidOnDent's specific 29 keyframes |
| **Selective synchronization** | The principle of "sync the visible, lazy-rehydrate the invisible, never-sync the per-tab" (Pass 305 §6) | BidOnDent's specific storage-event listener for `bidondent.appearance-mode` |

**The pattern:** every philosophical principle is portable; every specific implementation is not. This is exactly the doc-as-extraction philosophy from Pass 296 §3.7 / Pass 302 §6.

### 3.2 Non-portable (infrastructural)

These should NOT cross into Stacey's repo:

- **PMS** (`MapSessionProvider` + `mapSessionContext`) — Pass 297 §3.4 classified as Tier B-DOCTRINE-EXTREME; Pass 305 §1 confirmed currently inert; relay #29 explicit prohibition.
- **Provider chain** (Clerk → MapSession → Appearance → Notification) — BidOnDent's specific 4-layer hierarchy. Stacey's chain might be 1 layer (just a theme provider) or 2 (theme + auth) or differently ordered.
- **Specific timing constants** (Pass 305 §2's 18-constant inventory) — each calibrated for BD's specific user moments. Stacey calibrates her own.
- **Discovery quality system** (`placeDiscoveryQuality.ts` 4-authority concentration per Pass 294) — BidOnDent-specific subject matter.
- **Navigation infrastructure** (`features/navigation/`) — Pass 297 §3.4 EXTREME doctrine load.
- **Map engine** (`components/maps/engine/`) — Stacey almost certainly does not need a map.
- **Realtime services** (`services/realtime/`) — three BD-typed services per Pass 297 §3.3.
- **`storage://` pointer convention** — CLAUDE.md fact #2; only relevant if Stacey uses Supabase Storage.
- **`bd-*` CSS classes** — brand-tier per Pass 295 §3.2.

### 3.3 Ambiguous middle (case-by-case judgment)

These need conscious decisions per consumer:

| Quality | Decision required |
|---|---|
| **Tailwind + shadcn** | Stacey can adopt the same toolchain (with her own theme + her own components). The TOOLCHAIN is portable; the specific shadcn primitives copied over should be only the ones Stacey actually uses (Pass 300 §4.5: do NOT bulk-extract 48 primitives). |
| **Vite + React** | Highly likely portable (modern web stack). Specific config decisions (PWA strategy, code-splitting strategy) per Stacey. |
| **Sentry telemetry** | Pass 300 §3 reclassified to DO NOT EXTRACT YET — Stacey may not want telemetry, or want a different vendor. Owner-decision per Stacey. |
| **PWA / service worker** | If Stacey doesn't want PWA, skip. If she does, she chooses her own update-prompt UX (Pass 296 §3.4 split). |
| **Supabase backend** | If Stacey uses Supabase, the `pointer-on-write/sign-on-read` doctrine applies. If she uses Vercel + edge functions + a different storage, she develops her own patterns. |
| **Clerk auth** | If Stacey uses Clerk, the `verify_jwt: false` doctrine applies (CLAUDE.md fact #1). If she uses different auth, she develops her own. |
| **Calm/premium identity vs different identity** | Per memory — Stacey is described as "first branded implementation" with calm/premium expectation, but her specific brand voice may differ from BidOnDent's. Owner-decision territory. |

---

## §4. The "minimum viable continuity organism" framing (Priority C)

Relay #29 Priority C asks: *"can a product feel high-trust, premium, emotionally coherent, and behaviorally calm while using dramatically LESS infrastructure?"*

Pass 306 frames the test:

### 4.1 What "minimum viable" might mean for Stacey's v1

The simplest organism that could plausibly carry the felt-continuity property:

- **1 provider** (likely a theme provider). Possibly zero providers if theme is purely CSS.
- **0 timing constants beyond what's local-to-each-component**. Each component picks its own pause/duration/transition for its own user moment.
- **1-2 routes** (landing + maybe one secondary surface). Possibly even just a single page.
- **No persistence layer** unless Stacey actually persists user state. (A simple business-card site probably doesn't.)
- **No realtime, no notifications system, no map, no navigation** unless explicitly required.
- **The reduce-motion contract honored** at the CSS level (every keyframe/transition has its `motion-reduce:` companion).
- **Trust-tone inherited as principle** — but expressed in Stacey's specific voice.

Numerically: probably **<500 lines of source for v1**. (BidOnDent is currently >100k lines.)

### 4.2 Why this is testable

If a 500-line Stacey site can produce felt-continuity that resembles BidOnDent's, the architectural claim is validated: **continuity is a discipline, not a system.**

If a 500-line Stacey site CANNOT produce felt-continuity without importing BidOnDent infrastructure, the architectural claim is partially falsified — meaning some of BidOnDent's continuity actually does come from infrastructure scale, not just discipline.

Either result is informative.

### 4.3 The risk of premature failure-attribution

If Stacey's first version doesn't feel as continuous as BidOnDent, the natural-but-wrong response is "we should have ported the timing system." Per Pass 305 §3: those timings encode BD's specific user moments. Importing them into Stacey would feel UNCANNY (mechanically working, emotionally not-Stacey).

The right response to "Stacey doesn't feel as continuous yet" is: **add specific local timing decisions for Stacey's specific user moments**. Calibrate. Iterate. Build the habit at Stacey-scale, not by stealing BD-scale habits.

---

## §5. Anti-gravity preservation discipline for the Stacey lane (Priority D)

Relay #29 names the survivability traps:

> *"we already solved this" / "reuse the provider pattern" / "copy the timing system" / "move platform-core over" / "standardize the architecture" / "use the existing continuity model" / "extract shared atmosphere utilities"*

Pass 306 establishes the operational rule:

**Every time Pass 307+ encounters one of these instincts, the answer is "no, build local."** Not because reuse is bad in principle, but because the specific reuse instinct is a survivability trap at this stage. Reuse becomes legitimate only AFTER:
- Stacey's site has independently developed the local pattern, AND
- A specific code shape has organically emerged that resembles BidOnDent's, AND
- The owner explicitly decides extraction is warranted.

Premature extraction destroys the experiment. Per Pass 303 §3 folder-gravity: the SECOND addition is psychologically easier than the FIRST. Stacey's first addition that "looks like BidOnDent" will create instant pressure to align. The discipline is to resist that pressure.

**The Stacey repo's first commit should look NOTHING like BidOnDent.** It should look like a 5-file landing page made by someone who happens to have read REF_PROVIDER_SEAM_PATTERN.md (Pass 302) and absorbed the philosophy without copying any specific code.

This sounds extreme. It is. The architectural experiment specifically requires it.

---

## §6. Continuity-without-complexity hypothesis (Priority E)

Relay #29 Priority E asks whether continuity reassurance can emerge from:

> *"calm defaults / visible reasoning / restrained motion / breathable layout / low orchestration depth / predictable interaction rhythm / soft interruption handling — WITHOUT distributed timing choreography complexity."*

Pass 306's working hypothesis:

**Yes, at small scale.** Specifically:

- A 1-page Stacey site has fewer "user moments" than a multi-screen BidOnDent dashboard. Fewer moments → fewer specific timing decisions → less calibration burden.
- Calm defaults (Tailwind's `transition-all duration-200`, shadcn's `cubic-bezier(0.4, 0, 0.2, 1)`) get most of the way there for low-traffic surfaces. BidOnDent needed CALIBRATED constants because its dense interaction surface produces user moments where defaults feel wrong; Stacey's sparser surface may not.
- Reduce-motion contract is fundamental, not scale-dependent — Stacey's 5 transitions get the same `motion-reduce:` companion as BidOnDent's 200.
- Interruption softness (toast pacing, error display) becomes simpler when the volume of interruptions is lower.

**The smaller the surface, the more "calm defaults" suffice.** BidOnDent's 18-constant calibration emerged because BidOnDent's surface is large enough that the cracks in calm-defaults became visible. Stacey's smaller surface may never need that level of calibration.

This is a TESTABLE hypothesis. The Stacey v1 should attempt to use calm defaults and see if the surface feels coherent. If it does → calibration was scale-dependent. If it doesn't → identify the specific cracks and add Stacey-specific calibrations only for those moments.

This approach also avoids the relay #29 anti-gravity trap — Stacey's calibrations are EARNED by specific cracks, not inherited from BidOnDent.

---

## §7. Concrete near-term plan (post-Pass-306)

When owner provides Stacey business context (Priority A inputs), the pass sequence becomes:

### Pass 307 — Stacey identity + scope crystallization

Pure-doc REF artifact. Translate the owner's business-context inputs into:
- A 1-paragraph Stacey identity statement (who she is, what her site does)
- A list of essential surfaces (likely <5 — landing, services, contact, maybe portfolio)
- A list of explicitly-DEFERRED surfaces (anything BidOnDent has that Stacey does not need)
- Trust-voice notes (premium-or-approachable, density preference, mobile/desktop balance)

### Pass 308 — Stacey repo bootstrap (separate repo)

NEW git repo, NOT a folder in BidOnDent. Initial commit:
- `index.html` + entry point
- ~3-5 React components (no shared UI library)
- 1 theme.css (Stacey-specific palette, no `bd-*` classes)
- Vite config (minimal)
- Tailwind config (Stacey-specific theme extension)
- README explaining the experiment
- LICENSE
- Possibly Sentry skipped at v1 if owner doesn't want telemetry

The bootstrap is itself a survivability experiment. If it can be done in 1-2 hours and the resulting repo is <500 lines, the doctrine is validated.

### Pass 309+ — iterative Stacey development per owner direction

Each pass adds ONE specific surface or refinement, with the same single-doc-per-pass discipline. The Stacey lane mirrors BidOnDent's discipline at smaller scale.

**None of this is authorized yet.** Pass 307+ requires Pass 306 to land + owner business-context input. Pass 306 is the framing pass.

---

## §8. Anti-bureaucracy self-check

Per the §305 §7 health check rule, Pass 306 must contribute one specific finding not present in any prior artifact.

**Specific contribution:** the Stacey portability matrix (§3) + the "minimum viable continuity organism" framing (§4) + the calm-defaults-vs-calibration hypothesis (§6). None is in passes 281-305. The portability matrix specifically maps BidOnDent qualities to portable / non-portable / ambiguous; the prior corpus discussed each in isolation but did not produce the full crosswalk.

**Verdict: Pass 306 passes the health check.**

**Forward implication:** the doctrine corpus has now reached a crossroads. The next pass will either:
- (a) be a Stacey-context-translation pass (Pass 307) IF owner provides context, OR
- (b) be a non-doctrine direct-code observation pass (analyzing a specific behavior in BidOnDent that hasn't been observed yet), OR
- (c) standdown until either of the above materializes.

**Specifically excluded:** an 11th doctrine artifact that restates principles already covered by passes 295-305. The corpus is at saturation.

---

## §9. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15-#29 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| `src/platform-core/` folder | UNTOUCHED (still 2 files + README) |
| LAW / MOLANDJESUS / CLAUDE.md / MAP_SHELL_HIERARCHY / PLAN_PLATFORM_* | UNTOUCHED |
| MapSessionProvider + mapSessionContext | UNTOUCHED (Pass 305 observation continues) |
| BidOnDent source (any file) | UNTOUCHED |

ZERO new owner-decision points (cumulative remains 31).
ZERO new Stacey repo (relay #29 implicit — bootstrap awaits Pass 308 + owner context).
ZERO infrastructure migration / shared package planning / cross-repo platform-core / provider extraction / continuity framework / orchestration skeleton / generalized timing systems / shared runtime coordinator / pre-emptive architecture scaling / future-proofing — all relay #29 explicit prohibitions observed.

---

## §10. What this pass does NOT do

- No Stacey repo bootstrapped (requires Pass 308 + owner business context)
- No Stacey-specific design choices (Priority A is owner-decision-blocked)
- No infrastructure migration of any kind
- No shared package planning
- No cross-repo platform-core
- No provider extraction
- No continuity framework
- No orchestration skeleton
- No generalized timing systems
- No shared runtime coordinator
- No pre-emptive architecture scaling
- No "future-proofing"
- No new platform-core files
- No third live extraction (cumulative Phase F+ prohibition)
- No source modification
- No LAW edit (relay #29: REF-tier only)
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §11. Forward triggers

1. **Owner provides Stacey business-context inputs** (Priority A from §2 table) → Pass 307 = identity + scope crystallization.
2. **Owner authorizes Stacey repo bootstrap** → Pass 308 = NEW git repo creation per §7.2 plan. Critical: NEW repo, not a folder inside BidOnDent.
3. **Owner authorizes a non-Stacey direct-code observation pass** → Pass 307 alternative: pick a BidOnDent runtime behavior not yet audited and produce a concrete inventory like Pass 305.
4. **Owner authorizes nothing further** → standdown until owner direction.
5. **Future contributor proposes infrastructure migration FROM BidOnDent INTO any future Stacey work** → REJECT per relay #29 + this pass §5. Build local; migrate only after independent emergence + owner authorization.

---

## §12. Status

REF doc shipped Pass 306. Phase I framing complete. Stacey lane is now mapped at the philosophical level — portable qualities catalogued (§3), minimum-viable-organism framed (§4), anti-gravity discipline established (§5), continuity-without-complexity hypothesis articulated (§6), concrete pass sequence sketched (§7).

**The architectural mission has shifted decisively.** The repo's primary remaining frontier is not internal doctrine expansion; it is testing whether the discovered behavioral principles can survive in a SECOND lightweight organism. Pass 306 lays the groundwork. Pass 307+ executes once owner business-context inputs arrive.

**End of doc.**
