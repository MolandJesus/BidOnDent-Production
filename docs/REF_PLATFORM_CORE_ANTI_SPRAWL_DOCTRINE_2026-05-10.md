---
status: ACTIVE
authority: REF
scope: platform-core-anti-sprawl-doctrine
canonical_source_of_truth: REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE_2026-05-10.md
companion_to: REF_PASS_300_PLATFORM_CORE_PRESSURE_AUDIT_2026-05-10.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
---

# Platform-Core Anti-Sprawl Doctrine (Pass 303, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #26 (Phase G sub-stage: survivability preservation under normalization pressure).

**Tier:** REF (lightweight philosophical doctrine). **Not LAW** per relay #26 explicit instruction. **Not enforcement machinery** per relay #26 prohibition.

**Function:** survivability brake system. The artifact's job is to make platform-core expansion *psychologically expensive* without creating bureaucracy.

**Companion:**
- [`REF_PASS_300_PLATFORM_CORE_PRESSURE_AUDIT_2026-05-10.md`](REF_PASS_300_PLATFORM_CORE_PRESSURE_AUDIT_2026-05-10.md) — REACTIVE: applies anti-extraction lenses to specific candidates.
- This doc — GENERATIVE: articulates *why* the discipline matters as standalone philosophy.

---

## §0. Premise

Across passes 299, 301, the repo proved it can extract safely. Across pass 302, it proved it can respond to extraction by *increasing doctrine resistance* rather than decreasing it.

But the dangerous phase is now beginning. Every successful extraction quietly normalizes extraction behavior. The contributor mind starts saying:

> "we've done this twice cleanly — surely we can do it again."

That sentence is the beginning of architecture decay.

This doc exists because the most important survivability mechanism the repo can install is **friction against its own competence**. Having proven extraction works, the repo must now refuse to make extraction casual.

---

## §1. Extraction capability ≠ extraction necessity

Passes 299 and 301 proved capability:
- The seam mechanism works.
- The cn-extraction template generalizes (Pass 301 §5).
- Single-commit reversibility is intact.
- 997/997 tests pass after each move.

**Capability proves nothing about necessity.**

Of the ~18 candidates audited across passes 295-297, at least 17 are *capable* of extraction. Perhaps 1-2 have ever been *necessary*. The gap is enormous (Pass 300 §6).

A cleanly extractable file is NOT a candidate for extraction by virtue of being clean. It is a candidate for extraction *only when a second consumer demonstrates genuine shared need*. Until that moment, the file's "rightful home" is wherever it currently lives.

**Operational consequence:** the question "can we extract X?" should rarely be asked, because asking it primes the answer toward yes. The better question is "**what real-world consumer pressure would extraction relieve?**" If no answer exists, extraction is not warranted regardless of cleanliness.

---

## §2. Asymmetry of risk

Extraction rewards arrive slowly. Extraction damage appears immediately. (Pass 300 §9.)

| Reward | Realized when |
|---|---|
| Code reuse | A second consumer actually exists and consumes |
| Ownership clarity | A reader notices the new tier signal (modest, slow gain) |
| Future portability | Validated only if portability is later tested |

| Damage | Realized when |
|---|---|
| Folder gravity | Immediately upon adding a 2nd same-category file |
| Doctrine loss | Silently — the moment the file leaves its co-located context |
| Centralization pressure | The next contributor reasons "the platform owns this now" |
| Hidden-consumer-doctrine | The first consumer that disagrees with the embedded vendor/library/convention |
| Reversibility erosion | Each new consumer increases the cost of reverting |

**This asymmetry is not a curiosity — it is the central architectural fact.** Every extraction decision must apply different time discounts to rewards (long-tail, contingent on validation) and risks (immediate, structural).

**Operational consequence:** when in doubt, prefer the choice that preserves *future optionality*. That choice is almost always: keep in place. A file that stays where it is can be extracted later if necessity emerges. A file that has been extracted is much harder to *unextract* once consumers have formed.

---

## §3. Folder gravity compounds

The actual risk of `src/platform-core/` is NOT its current size. It is the *psychological field* the folder creates.

Before Pass 299, the question "where does this go?" had a default answer: "next to the related code." After Pass 299, the question gained a second answer: "platform-core, if shareable." That second answer is now *available to every contributor*, every refactor, every cleanup pass — even though no contributor explicitly added it to their decision tree.

This is the silent normalization the relay framework warns against.

**Folder gravity dynamics:**

1. **The "there is now a place" effect.** A folder that exists creates legitimacy for future additions. Even rejecting "should this go in platform-core?" requires effort. Every refactoring pass loses small amounts of time to that question.

2. **Category density.** The first file establishes a category (utility / hook / type / etc.). The second file in the same category invites a subfolder. Pass 300 §7 hard-stop: no `platform-core/utils/`, no `platform-core/hooks/`. But hard-stops only work if the contributor reads them — and contributors do not always read README files.

3. **Helper ecosystems emerge in three steps:**
   - Step 1: extract one utility (legitimate per relay #19/#20 case).
   - Step 2: extract a helper that "uses" the utility (less legitimate, justified as "while we're already here").
   - Step 3: extract a coordinator that "manages" the helper. (Bureaucracy.)
   By step 3, the platform has accreted authority that should have stayed local.

4. **The "since we've done it before" pattern.** Once 2 files exist, the third is psychologically easier than the second was. By the fifth, the discipline is gone.

**Operational consequence:** the decision to add a third file to platform-core/ should require *substantially more justification* than the decision to add the second did. Extraction friction must be visibly increasing, not decreasing, with each successful extraction.

---

## §4. Selective duplication preserves survivability

Some duplication is healthier than the cure.

The reasons duplication can be valuable:

- **Ownership clarity.** Two consumers each owning their copy is clearer than two consumers sharing one copy via implicit dependency on the platform.
- **Local reasoning.** Reading a consumer's code without jumping to platform-core is faster cognition. Co-located code preserves "everything I need to understand this surface is in this folder."
- **Behavioral specificity.** A copy can drift to fit its consumer's actual needs without breaking the other consumer. A shared module accretes special-case branches.
- **Orchestration independence.** If the shared module's lifecycle assumptions change, all consumers move in lockstep. Duplicates can evolve independently.
- **Blast-radius containment.** A bug in a copy affects one consumer. A bug in the shared module affects all consumers. (Subtler: a *fix* in the shared module that's wrong for one consumer is much harder to detect than a wrong fix in a copy.)
- **Continuity coherence.** The Pass 285+ harness work showed continuity invariants are local. Forcing two consumers onto a shared module makes their continuity invariants couple unintentionally.

**Anti-pattern: framing duplication as universally bad.** "DRY" is a heuristic, not a law. The repo's strongest qualities — shallow orchestration, localized authority, behavioral coherence — are sometimes preserved precisely BY duplication.

**Operational consequence:** when two surfaces have similar code, the default conclusion is *not* "extract." The default conclusion is "examine whether the similarity is incidental or structural." Incidental similarity (two consumers happen to have similar lines) does not warrant extraction. Structural similarity (the same authority concern manifesting twice) might — but only after second-consumer evidence is real.

---

## §5. Reversibility > reuse density

The healthiest seams are easy to undo.

`cn` (Pass 299) and `useOnlineStatus` (Pass 301) are both reversible via `git revert`. That reversibility is not a side effect — it is the core architectural property. As long as the repo can revert, the extraction is provisional, not load-bearing.

Dense abstraction ecosystems become **politically irreversible**. By "political" I mean: not technically impossible, but socially expensive. After 6 consumers depend on a shared module, removing the module requires either updating all 6 simultaneously OR forking responsibility across teams. Both are expensive in coordination cost — and that cost is what makes the abstraction load-bearing.

**The reversibility trap:** a shared module starts reversible (1 consumer). Each new consumer that adopts it adds a tiny increment to the un-extraction cost. By N=6 the cost is large. By N=20 it is essentially infinite. Yet at no single moment did the cost become "high" — each individual adoption seemed harmless.

**Operational consequence:** the question to ask before each extraction is "**what is the un-extraction cost if this turns out wrong?**" If the answer is "1 commit revert," the extraction is reversible. If the answer is "negotiate with N consumers," the extraction has crossed an irreversibility threshold. Avoid that threshold by keeping platform-core sparse and consumers few.

---

## §6. Shallow topology outperforms dense abstraction

The repo's architectural strength repeatedly came from the SAME property: low orchestration depth. Pass 281's 4-layer provider chain. Pass 291's intentional gaps in the z-axis canon. Pass 292's bimodal map-to-screen ratio (full or peripheral, not in between). Pass 297's recommendation NOT to extract navigation/turn-by-turn despite mechanical extractability.

**Shallow topology vs dense abstraction — what's actually different:**

| Property | Shallow topology | Dense abstraction |
|---|---|---|
| Read time | Hierarchy fits on one screen | Requires navigation tooling |
| Mental model | "Each layer does one thing" | "Components compose at multiple levels" |
| Debugging | Step through linear stack | Follow indirection across files |
| Onboarding | New contributor sees the shape | New contributor must trust the framework |
| Refactor | Surface changes are local | Surface changes ripple through abstractions |
| Testing | Each layer has obvious boundary | Mocks proliferate to isolate units |

**Dense abstraction sells "sophistication."** It produces code that *looks* enterprise. But sophistication is not survivability. Sophistication is correlated with *fragility* under repeated change because each abstraction is a load-bearing assumption that future contributors must preserve.

**Operational consequence:** when faced with a choice between adding a layer of abstraction and writing slightly more direct code, prefer direct code. The repo's track record is that directness ages better than indirection.

---

## §7. Emotional-runtime coherence

A discovery that emerged across passes 289-301: the repo's most distinctive runtime quality is not technical performance — it is *felt continuity*. State survives transitions cleanly (Pass 289 D-series). Visual transitions feel calm (Pass 282 cadence/easing tokens). Reduced-motion is universally honored (Pass 284 + Pass 287 protections). Trust signals (whitespace per Pass 292 §7, premium glass per `bd-design-identity`) are coherent across surfaces.

These are not separate "polish" decisions. They are a coherent **emotional-runtime architecture**.

**What "emotional-runtime" includes:**

- **Restoration calmness:** when state restores after a transition, it does so without flicker, jump, or recomputation visible to the user (Pass 289 §5 camera-handoff contract).
- **Continuity pacing:** transitions follow consistent timing tokens (Pass 282) rather than ad-hoc per-component values.
- **Interruption softness:** error/loading/offline states use trust-preserving voice (per Pass 291 toast deduplication, per `bd-design-identity` skill).
- **Lifecycle reassurance:** providers are inert by default (Pass 302 §3.3) so users never see "loading the app" gymnastics.
- **Atmosphere continuity:** light-mode + dark-mode palettes are LAW-protected (Pass 281 §11 invariant #4) so theme transitions don't fragment.
- **Orchestration legibility:** the provider chain reads top-to-bottom in App.tsx (Pass 287 protected) so authority flow is obvious.

**Why this matters for anti-sprawl:** emotional-runtime coherence is *especially fragile under abstraction*. Each new helper, registry, or coordinator added to platform-core has the potential to inject a stutter, a flicker, an inconsistent timing, or an authority confusion that cumulatively degrades the *felt* experience without degrading any individual technical metric.

**Operational consequence:** the bar for adding to platform-core is not just "does it work?" — it is "does it preserve the felt continuity of consumer apps that adopt it?" That second question is much harder to answer in advance, which is why the answer should usually be "no, leave it local."

---

## §8. High-resistance seams as health mechanisms

The repo's stability increasingly comes from **expensive authority movement**.

This is counterintuitive to "good engineering" instincts. Most engineering culture rewards reducing friction: easier deployments, faster builds, cleaner abstractions, fewer steps. The repo is consistently demonstrating the OPPOSITE rule for *architectural decisions*: high friction is a feature.

**Why high-resistance seams improve health:**

- They filter out cosmetic refactors. A 5-minute refactor is rejected by the friction of justifying it.
- They preserve doctrine context. A high-friction extraction requires the contributor to read the surrounding LAW/REF docs, which prevents the contributor from making changes that violate doctrines they didn't know existed.
- They make compounding errors visible. If extraction is easy, 3 small wrong extractions can compound silently. If extraction is hard, the third extraction inherits the friction of the first two.
- They preserve owner-decision authority. High friction makes it natural to ask "should we do this?" rather than "let's do this and see."

**The seam-friction inventory the repo currently has:**

- README in `src/platform-core/` (Pass 299) — passive friction (must be read).
- Pass 300 anti-extraction registry — explicit DO NOT EXTRACT YET classifications.
- Pass 302 §5 failure cases — provider refactors must answer them first.
- This doc (§3, §10) — failure-pattern callouts that any contributor's "anti-sprawl reflex" can match against.
- Single-commit reversibility — each extraction is its own revertible unit.
- ~31 cumulative owner-decision points — many extractions are gated on owner decisions that haven't been answered.

**Operational consequence:** if the repo's seam-friction *decreases* over time, that is a signal that anti-sprawl discipline is degrading, regardless of whether any specific bad extraction has occurred. Watch the friction itself, not just the outcome.

---

## §9. Platform-core is NOT a convenience layer

This is the most important section.

`src/platform-core/` exists *only* for seams that have survived multi-pass adversarial survivability analysis. As of Pass 303, the folder contains 2 files (cn.ts + useOnlineStatus.ts) and a README. That sparseness is correct.

**`src/platform-core/` is NOT:**

- A utilities folder. Utilities live next to the code they support.
- A helper bucket. Helpers earn their location by their consumer's needs.
- A framework layer. The repo does not need a framework layer.
- A "shared" namespace. Sharing implies multiple consumers; the repo currently has 1 (BidOnDent itself).
- A cleanup destination. Loose code in `src/app/` belongs in `src/app/`.
- A DRY optimization target. DRY is incidental; doctrine survivability is structural.

**`src/platform-core/` IS:**

- A high-resistance survivability boundary.
- A doctrine-traveling channel between consumer apps that share NOT code but PHILOSOPHY.
- An audit surface for what has actually proven its right to platform tier.

**The asymmetry rule that must be codified:**

> **Successful extractions should INCREASE future extraction resistance.**

After Pass 299, the bar to add the *second* file (`useOnlineStatus`) had to be HIGHER than the bar to add the first. After Pass 301, the bar to add a *third* file must be higher still. After a 4th, higher again. This is the inverse of the "every additional unit is easier" instinct that drives platform sprawl in most architectures.

**Operational consequence:** every contributor proposing an addition to platform-core/ should expect to write MORE justification than the previous contributor did. If that ratchet ever reverses — if a new addition is justified more cheaply than its predecessors — the discipline is decaying.

---

## §10. Failure patterns to monitor

These phrases (and their close cousins) are early-warning indicators that the doctrine is under pressure. None is automatically wrong; all warrant scrutiny under repetition pressure:

| Phrase | Why dangerous |
|---|---|
| "while we're here" | Bundles unrelated changes into the current commit; bypasses single-purpose discipline. |
| "just one more helper" | The N+1 helper is always the easiest. The discipline degrades at the margin. |
| "tiny harmless abstraction" | Tiny abstractions accrete. The first is harmless; the tenth is a framework. |
| "shared because reused twice" | Two consumers is not necessity. Two might be coincidence. Wait for evidence of structural similarity. |
| "cleanup pass" | Cleanup is the natural cover for sprawl. Most "cleanups" extract things that should have stayed local. |
| "modernize architecture" | Modernization is a euphemism for "introduce currently-fashionable abstractions." Survivability has a longer half-life than fashion. |
| "consolidate providers" | Provider consolidation triggers Pass 302 §5 failure cases. Apply the failure-case test before accepting. |
| "standardize orchestration" | Standardization presumes uniformity is desirable. The repo's strength comes from intentional asymmetry. |
| "flatten naming" | Naming flattening usually erases doctrine context (e.g. removing `bd-` prefix where the prefix marks intentional brand-tier scope). |
| "improve consistency" | Consistency at the cost of locality is a regression. Local divergence often encodes specific reasoning the consistency-pass would erase. |
| "DRY this up" | DRY is a code-shape rule, not a doctrine rule. Apply Pass 300 §2 anti-extraction lenses before deciding repetition is a problem. |
| "since we proved it works twice" | Proof of capability is not proof of necessity. Resist the appetite escalation. |
| "let's just see what happens" | The seam-friction is meant to STOP "let's just see." If a contributor is reaching for "see what happens," the friction has already degraded. |

**These phrases should be treated as soft alarms, not hard prohibitions.** A contributor using one of these phrases is not necessarily wrong — but they should be invited to articulate why this specific case is an exception. If the articulation is convincing, proceed. If it relies on "it just feels right," apply Pass 300 §2 anti-extraction lenses adversarially.

---

## §11. Second-order pressure recon (relay #26 additional priority)

Per relay #26: *"opportunistically observe — which systems currently LOOK extractable only because Passes 299–301 normalized extraction thinking?"*

The post-Pass-301 candidate field, examined under the new question "**would extraction silently centralize doctrine?**":

| Candidate | Looks extractable because... | Would centralize doctrine? | Verdict |
|---|---|---|---|
| **Retry helpers** (any retry-with-backoff utility) | "Generic — every consumer needs retries" | YES — retry semantics are continuity choreography (jitter, max attempts, fallback voice). Each consumer's retry voice is a trust signal. | KEEP LOCAL |
| **Loading coordination** (loading-state-manager-style helpers) | "Loading is universal" | YES — loading PACING is part of emotional-runtime coherence (§7). A shared loading coordinator would impose its pacing on all consumers. | KEEP LOCAL |
| **Persistence wrappers** (generic localStorage/sessionStorage helpers) | "Already partly genericized in `persistedState.ts`" | YES — Pass 290 X3 + Pass 294 already showed: persistence wrappers carry namespace doctrine, validation doctrine, migration doctrine, cross-tab semantics. The 4-authority concentration would compound across consumers. | KEEP LOCAL |
| **Navigation lifecycle utilities** (route-transition observer, hash-page hooks at scale) | "Routing is generic" | YES — navigation transitions are the densest continuity surface (Pass 289 + Pass 297 §3.4 EXTREME-doctrine). A shared navigation lifecycle would force consumer apps to inherit BD's interruption semantics. | KEEP LOCAL |
| **Orchestration hooks** (hook factories like `createSeamHook`) | "Reduces boilerplate across providers/services" | YES — Pass 302 §5.1 + §5.4 failure cases apply directly. | KEEP LOCAL |
| **Provider composition helpers** (any `combineProviders([...])` API) | "App.tsx provider chain looks like a list" | YES — Pass 302 §5.2 failure case applies directly (registry pattern). | KEEP LOCAL |
| **Runtime coordinators** (lifecycle managers, hydration coordinators) | "App startup is universal" | YES — Pass 281 §11 invariants #1 + #3 generalize across consumer apps but the SHAPE of the orchestration is per-consumer. A shared coordinator would normalize what should remain per-consumer doctrine. | KEEP LOCAL |
| **Atmosphere utilities** (theme-tone helpers, glass-shadow generators) | "Visual primitives are reusable" | YES — Pass 295 §3.2 already classified theme system as A-DOCTRINE; values are LAW-locked per consumer. Atmosphere-helper APIs would smuggle BD's specific palette decisions into other consumers. | KEEP LOCAL |

**Headline observation:** ALL eight candidates listed by relay #26 fail the centralization-doctrine test. None should be extracted in any phase that the repo can currently see.

**The deeper observation:** the candidates that LOOK most generic after passes 299-301 are precisely the ones that would centralize the most doctrine if extracted. This inverse correlation is itself a survivability signal: the repo's most apparently-shareable surfaces are precisely where its most load-bearing doctrines live.

This finding extends the false-universal pattern (Pass 296 §5 + Pass 297 §5) into a stronger form: **post-success appetite specifically targets doctrine-dense surfaces**. The architectural antidote is to recognize the appetite as evidence of doctrine density, not as evidence of extractability.

---

## §12. The anti-sprawl reflex (operational summary)

Synthesizing §1-§11 into a single decision heuristic:

```
  Before ANY proposed addition to src/platform-core/, answer:

  1. What CONSUMER pressure would this addition relieve?
     (If "none yet" — STOP. Capability ≠ necessity.)

  2. What is the un-extraction cost if this turns out wrong?
     (If > "single-commit revert" — STOP. Reversibility > reuse density.)

  3. Does this addition increase friction for the NEXT addition?
     (If "no" — STOP. Successful extractions should ratchet up resistance.)

  4. Does this addition silently centralize a doctrine?
     (If yes — STOP. Apply Pass 300 §2 + Pass 302 §5 failure-case tests.)

  5. Is the matching FAILURE PATTERN from §10 active in the contributor's
     reasoning?
     (If yes — STOP and articulate the exception explicitly.)
```

If all 5 questions pass, the addition warrants serious owner consideration. If any fails, the addition is rejected.

**This is not enforcement machinery.** It is a reflex. Contributors apply it (or fail to). The repo's discipline is measured by how often the reflex catches an inappropriate addition BEFORE the addition is proposed, not after.

---

## §13. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 / #20 / #21 / #22 / #23 / #24 / #25 / #26 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| Source code | UNTOUCHED (this is a pure-doc pass) |
| `src/platform-core/` folder | UNTOUCHED (still 2 files + README per Pass 301) |
| LAW / MOLANDJESUS / CLAUDE.md / MAP_SHELL_HIERARCHY / PLAN_PLATFORM_* | UNTOUCHED |

ZERO new owner-decision points (cumulative remains 31).
ZERO new live extractions (relay #26 most-important-continuity-rule preserved).
ZERO enforcement tooling (relay #26 explicit prohibition observed).
ZERO scoring systems (relay #26 explicit prohibition observed).
ZERO registries / tags / classifications / metadata infrastructure (relay #26 explicit prohibitions observed).

---

## §14. What this pass does NOT do

- No third live extraction (relay #26 explicit prohibition; most-important-continuity-rule)
- No enforcement tooling
- No extraction scoring systems
- No registries / tags / classifications / metadata infrastructure
- No "official extraction criteria"
- No source modification
- No new platform-core files
- No modification of existing `REF_PASS_300_PLATFORM_CORE_PRESSURE_AUDIT_2026-05-10.md` (Pass 300 stays as the REACTIVE artifact; this doc is its GENERATIVE companion)
- No LAW edit (relay #26: REF-tier only)
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §15. Forward triggers

1. **Owner authorizes PMS continuity reconnaissance** (Priority D, observation only) → Pass 304+. Investigate MapSessionProvider + perfMarks + dev counters as continuity-choreography-infrastructure rather than persistence-infrastructure. Do NOT extract / normalize / centralize.
2. **Owner provides Stacey business context** (Priority E) → Pass 304+ Stacey atmosphere portability reconnaissance. Currently blocked.
3. **Owner authorizes hidden-survivability-pressure detection deep-dive** (Priority F) → Pass 304+. Continue second-order drift detection per §11.
4. **Future contributor attempts to add to platform-core/** → MUST first answer §12's 5 questions. If any fails, addition rejected.
5. **Future "modernize / consolidate / standardize" refactor proposed by ANY agent** → MUST first match against §10 failure patterns. If a pattern matches, contributor articulates exception explicitly OR refactor is rejected.

---

## §16. Status

REF doc shipped Pass 303. Pure-doc artifact. Companion to Pass 300 (REACTIVE) by being its GENERATIVE counterweight. The anti-sprawl doctrine is now codified as standalone philosophy with §11's second-order recon producing a concrete finding: post-success appetite specifically targets doctrine-dense surfaces. The architectural antidote (recognize appetite as evidence of doctrine density, not extractability) is now visible.

**End of doc.**
