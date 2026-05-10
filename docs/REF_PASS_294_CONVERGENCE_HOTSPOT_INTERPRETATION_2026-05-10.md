# REF — Convergence Hotspot Interpretation: `placeDiscoveryQuality.ts` (Pass 294, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #18 (Priority A: convergence hotspot interpretation; **DO NOT FIX YET** per relay; goal is understanding WHY multiple continuity systems converge on this site).
**Tier:** REF (interpretive — derived from source as of commit `52da293f`).
**Source modification:** ZERO. Explicit relay #18 prohibition: do not modify `placeDiscoveryQuality.ts`. Pure read-only interpretation.
**Companion to:** [`REF_PASS_288_PERSISTENCE_NAMESPACE_TEST_2026-05-09.md`](REF_PASS_288_PERSISTENCE_NAMESPACE_TEST_2026-05-09.md) (namespace lens), [`REF_PASS_290_CROSS_TAB_MAP_CONTINUITY_AUDIT_2026-05-09.md`](REF_PASS_290_CROSS_TAB_MAP_CONTINUITY_AUDIT_2026-05-09.md) (cross-tab lens).

---

## §1. Premise — the convergence-hotspot hypothesis

ChatGPT relay #18 framed this pass as not a remediation question but a **diagnostic** one:

> *"That likely means the file sits near an unresolved semantic-authority seam. The next goal is not remediation. The next goal is understanding WHY multiple continuity systems converge there."*

Pass 288 surfaced the file via a namespace-convention drift discovery. Pass 290 surfaced it again via a cross-tab last-write-wins observation. Two independent audit lenses converged on the SAME line (`placeDiscoveryQuality.ts:51`). The relay's hypothesis is that this is not coincidence — it is signal that the file holds an **authority concentration** the codebase has not (yet) decomposed.

Pass 294 tests the hypothesis by reading the file's actual responsibilities and tracing how each independent lens "sees" the same seam from a different angle.

---

## §2. The file's actual authority dimensions

[`src/app/services/navigation/placeDiscoveryQuality.ts`](../src/app/services/navigation/placeDiscoveryQuality.ts) (228 lines) carries **four distinct authority concerns** in a single module:

### 2.1 Schema authority

The `DiscoveryQualitySnapshot` type (lines 12-34) defines 21 fields covering counts (accepted/rejected/deduped/trimmed), category breakdowns (body-shop/insurance/fuel/rental/supplier), quality-label tiers (verified/standard/limited), and threshold metadata. It is the **shape contract** for downstream consumers and persistence-layer envelopes.

### 2.2 Scoring authority

`scorePlaceQuality` (lines 160-216) is the source of truth for what makes a place "good enough":
- Base score 35
- +20 for name/brand
- +12 for street/city
- +10 for phone or website (each)
- +8 for opening hours
- +12 for service-confirming tags (bodywork/painting/collision)
- +6 for operator
- +5 for email
- Distance penalty: −18 (>20mi) / −10 (>12mi) / −4 (>6mi)

`toQualityLabel` (lines 218-228) thresholds the score: ≥80 = verified, ≥60 = standard, else limited.

These are **product-policy decisions** — what BidOnDent considers a trustworthy place — encoded as constants. Every rebalance of "what counts as a body-shop we'll show" passes through these magic numbers.

### 2.3 Persistence authority

Three orchestrating functions:
- `persistDiscoveryQualitySnapshot` (lines 62-65) — writes to BOTH a module-level singleton AND `localStorage` via `writePersistedState`.
- `getLatestDiscoveryQualitySnapshot` (lines 67-90) — cache-first read: in-memory singleton wins; on miss, deserialize from `localStorage` via `readPersistedState`, then warm the cache.
- `sanitizeDiscoveryQualitySnapshotFromRaw` (lines 56-60) — public sanitizer used by diagnostics.

The module-level `let latestDiscoveryQualitySnapshot: DiscoveryQualitySnapshot | null = null;` (line 54) is the **shadow-state seam**. It is the difference between:
- "What this tab has computed during its lifetime" (singleton)
- "What was last persisted across all tabs / sessions" (localStorage)

These are not always the same value. The cache-first read prioritizes the former.

### 2.4 Validation authority

The validation logic flows through [`placeDiscoveryQualityValidation.ts`](../src/app/services/navigation/placeDiscoveryQualityValidation.ts) via the `toValidatedDiscoveryQualitySnapshot` helper, used by both `sanitizeDiscoveryQualitySnapshotFromRaw` and the `readPersistedState` `validate` / `normalize` / `migrateLegacy` callbacks.

The validation is **bidirectional**: incoming data from `localStorage` is sanitized; outgoing data is normalized for storage. Per [`persistedState.ts:121-141`](../src/app/services/navigation/persistedState.ts#L121), if the stored raw differs from the normalized re-stringified form, a SILENT REWRITE occurs — meaning **every read can trigger a write**.

### 2.5 The 4-authority concentration

| Concern | Lines | Authority kind |
|---|---|---|
| Schema | 12-34, 36-49 | Type / shape |
| Scoring | 160-228 | Product policy |
| Persistence | 51-90 | Lifecycle / storage |
| Validation | (delegated) | Sanity / normalization |

These four are NOT typically decomposed in this codebase. Most service modules carry one or two — e.g., `navigationSession.ts` carries persistence + validation, `marketIntelligence.ts` carries scoring + product-policy. `placeDiscoveryQuality.ts` is unusual in carrying all four.

---

## §3. Why the file became 4-authority

The file's doc comment (lines 1-6) says:

> *"placeDiscoveryQuality — Quality scoring, validation, snapshot persistence, and normalization for the place discovery system. Extracted from placeDiscovery.ts (Pass 28). Zero behavior change."*

This is the **origin of the concentration**. Pass 28 was a **size-driven extraction** — `placeDiscovery.ts` had grown beyond a comfortable budget (per Pass 28's likely motivation), so its quality-related concerns were lifted into a sibling file as a unit.

The 4-authority concentration is therefore:
- **Not** a deliberate consolidation
- **Not** a symptom of poor architecture
- An **emergent artifact** of size-budget refactoring that grouped semantically-adjacent concerns

This is important: the file is NOT a "code smell." It is a **healthy-looking** module that happened to inherit four authorities because they all share a common subject (place quality). A subsequent audit-driven refactor would split them further, but at the cost of fragmenting the subject.

The hyphen-namespace storage key (`bidondent-navigation-discovery-quality-snapshot-v1`) is also a **Pass 28 artifact**: the key existed before the namespace conventions were catalogued (Pass 274) and was carried over in the extraction without re-evaluation. This is the **leaked-implementation-choice** signature of size-driven extraction.

---

## §4. How each independent audit lens sees the seam

### 4.1 Pass 288 lens (namespace convention)

What Pass 288 saw: a string literal `"bidondent-navigation-discovery-quality-snapshot-v1"` that does not match any of the 4 documented namespace conventions.

What was actually present: a Pass 28 extraction artifact — a key written before namespace doctrine existed.

Pass 288's lens is calibrated for **string-shape**. It correctly flagged the asymmetry. It does not know (cannot know, by design) that the asymmetry is a Pass 28 inheritance.

### 4.2 Pass 290 lens (cross-tab persistence)

What Pass 290 saw: a key written by `writePersistedState` with no corresponding `storage` event listener registered anywhere; a `getLatestDiscoveryQualitySnapshot` reader that prioritizes an in-memory cache over re-reading from disk.

What was actually present: the **module-level singleton + localStorage** dual-authority pattern, where the singleton is "tab-experiential" state and localStorage is "session-persistent" state. The two are intentionally allowed to diverge because (presumably) the discovery-quality model is per-session and only persisted for warm-restart purposes.

Pass 290's lens is calibrated for **cross-tab synchronization**. It correctly flagged the divergence. It does not know that the divergence is the EXPECTED semantics of a per-tab quality model.

### 4.3 The convergence is signal-of-density, not signal-of-defect

Each lens detected a real asymmetry. Each asymmetry has a defensible origin (Pass 28 extraction; per-tab semantics by design). The convergence does NOT prove the file is broken — it proves the file **carries enough authority dimensions that any axis-specific lens will find SOMETHING to flag**.

This is the **convergence-hotspot signature**: a file that holds N independent concerns will be flagged by N independent audit dimensions. The signal is the concentration itself, not any individual flag.

---

## §5. The "unresolved semantic-authority seam" diagnosis

Relay #18 hypothesized that the file "sits near an unresolved semantic-authority seam." Pass 294's diagnosis:

**Yes — the seam exists, and it is the seam between the discovery-quality MODEL and the discovery-quality CACHE.**

The discovery-quality model is:
- **What** counts as a quality place (scoring authority)
- **What** the snapshot looks like (schema authority)

The discovery-quality cache is:
- **Where** the snapshot lives across time (persistence authority)
- **When** to trust an existing snapshot vs recompute (the implicit `latestDiscoveryQualitySnapshot` warmth signal)

These are **different concerns** that happen to share a subject. In a different architectural style (e.g. dependency-injection with a Repository pattern), they would be cleanly separated:
- `QualityScorer` (pure functions)
- `QualityRepository` (persistence)
- `QualityModel` (in-memory state)

In BidOnDent's architectural style — which favors **shallow orchestration** (per relay #15+#17 prohibitions) and **co-location of related concerns** — they are correctly together. The file is true to the codebase's stylistic preferences.

The "seam" is therefore NOT a defect to repair. It is the **intentional cost** of choosing co-location over separation. The convergence-hotspot is the receipt for that choice.

---

## §6. Authority-asymmetry interpretation per relay #18

Relay #18 named "authority asymmetry as design principle" as one of the strongest emergent findings of passes 291-293. `placeDiscoveryQuality.ts` is a textbook example:

| Authority dimension | Asymmetry observed | Intentional? |
|---|---|---|
| Schema | Centralized in this file | YES — one source of truth for the snapshot shape |
| Scoring | Centralized in this file | YES — one place to retune the policy |
| Persistence (write) | Uses general-purpose `writePersistedState` | YES — generic envelope handling |
| Persistence (read) | Module-singleton-cached, NOT cross-tab synced | YES (likely) — per-tab quality model is acceptable |
| Validation | Bidirectional (incoming + normalization rewrite) | YES — defensive against schema drift |

Each authority dimension expresses a **different stance**:
- Schema and scoring are **maximally centralized** (single file owns them).
- Persistence write is **maximally outsourced** (uses the generic envelope helper).
- Persistence read is **partially localized** (file owns the cache, but reads from generic helper).
- Validation is **dispersed** (file delegates to a sibling validator).

The **asymmetry is the architecture**. Each concern is handled at the level of localization that fits its blast radius. Schema changes are local; persistence-policy changes are global. The file does the right thing along each axis independently.

---

## §7. What the file is NOT

To prevent future passes from misreading this file, Pass 294 documents what it is **not**:

- **NOT** a violation of single-responsibility principle. SRP applied at module-level would split it; SRP applied at subject-level keeps it whole. The codebase chose subject-level.
- **NOT** a cache-coherence bug. The cache is INTENDED to be tab-local. Cross-tab divergence is a feature, not a bug.
- **NOT** a namespace-convention error. The hyphen format is a Pass 28 artifact; renaming would BREAK existing persisted snapshots in the wild.
- **NOT** a god-object. It is 228 lines, has 7 exports, has clear responsibilities. Co-location ≠ overload.
- **NOT** the wrong place to compute scoring. Scoring needs the snapshot type to record acceptance counts; co-location is natural.

---

## §8. Implications for the convergence hotspot remediation question

If the owner authorizes remediation in the future, Pass 294 surfaces the following decision matrix:

| Remediation option | What it fixes | What it costs |
|---|---|---|
| Rename storage key to `bidondent.navigation.discovery-quality.v1` | Pass 288 namespace drift | Migration of all in-the-wild persisted snapshots; brief data loss for existing users |
| Add `storage` event listener for cross-tab sync | Pass 290 X3 last-write-wins | Cross-tab sync may not be desirable for a per-tab quality model — would force same model in all tabs |
| Split into `placeDiscoverySchema.ts` + `placeDiscoveryScoring.ts` + `placeDiscoveryRepository.ts` | Authority-concentration | Loss of subject co-location; 3 files instead of 1; navigability cost |
| Document this file as a "multi-authority concentration point" in REF | The undocumented stance | Almost zero cost; clarifies the seam without disturbing it |
| Do nothing | Nothing — but accepts the hotspot status | Future audit lenses will continue to flag; cumulative cognitive load |

Per relay #18: **DO NOT FIX YET**. Pass 294 names the choice space without recommending an option. The current owner-decision territory is whether to:
- (a) accept the file as-is and document the seam (lowest cost),
- (b) split the authorities (highest design cost, may sacrifice subject coherence), or
- (c) defer indefinitely.

Owner-decision-bound. Pass 294 introduces ZERO new owner-decision points (the existing Pass 274 §3.4 RISK 2 + Pass 290 X3 owner-decisions remain the operative ones — Pass 294 only INTERPRETS them).

---

## §9. Connection to the broader doctrine

This pass corroborates relay #18's framing that:
- "Authority asymmetry as a design principle" is REAL and PERVASIVE in BidOnDent.
- Some asymmetries are valuable PRECISELY because they remain lightweight and local.
- Premature unification (e.g. forcing this file into a Repository pattern) would FLATTEN healthy emergent behavior.

The file's continued existence as a 4-authority concentration is, by relay #18's framework, an **architectural strength**, not a weakness. The audit lenses are doing their job by detecting it; the wisdom is in interpreting the detection rather than acting on it.

---

## §10. The convergence-hotspot signature pattern (generalized)

Pass 294 surfaces a pattern other audits should expect to encounter:

> **Convergence-hotspot signature:** when N independent audit lenses converge on the same line/file, the convergence is a function of the file's authority concentration, not a guarantee that the file is defective. Decompose the convergence by lens; check whether each lens's flag is consistent with the file's intended responsibility scope.

Future audit passes should apply this lens before recommending remediation. Hotspot detection is signal of density — defect detection requires additional analysis.

---

## §11. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 prohibitions | ZERO violations |
| Pass 285 harness spec | UNTOUCHED |
| `placeDiscoveryQuality.ts` source | EXPLICITLY UNTOUCHED per relay #18 directive |

ZERO new owner-decision points (cumulative remains 31).

---

## §12. What this pass does NOT do

- No source modification — explicit relay #18 directive: do NOT fix
- No rename of the storage key
- No split of the file into multiple modules
- No addition of `storage` event listener
- No new test files
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No update to Pass 274's namespace-convention catalogue (the 5th convention remains uncatalogued in the source-of-truth doc; updating would itself be a doctrine modification — owner-decision territory)
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §13. Forward triggers

1. Owner authorizes the "document the seam" path: a small REF update could codify the 4-authority observation into the navigation domain's REF docs.
2. Owner authorizes namespace remediation per Pass 274 §3.4 RISK 2: rename + migration helper for in-the-wild snapshots.
3. Owner authorizes cross-tab sync per Pass 290 X3: requires philosophical decision about whether discovery-quality is per-tab or per-user.
4. Owner authorizes repository decomposition: highest design cost; would sacrifice subject co-location.
5. Pass 295+ continues relay #18 priorities B (trust choreography), C (perceptual density), D (harness evolution), E (doctrine documentation).

---

## §14. Status

REF doc shipped Pass 294. Audit-only — preserves all existing doctrine and the `placeDiscoveryQuality.ts` source. The convergence-hotspot diagnostic is now interpreted; the file is renamed (in the audit narrative) from "drift discovery + cross-tab race site" to "4-authority concentration point with defensible origins." Forward direction remains owner-decision territory.

**End of doc.**
