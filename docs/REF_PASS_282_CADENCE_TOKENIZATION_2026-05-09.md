---
status: ACTIVE
authority: REF
scope: pass-282-source-change-evidence
canonical_source_of_truth: REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 282 source-change evidence document under owner relay 2026-05-09 #13 priority Item A (cadence/easing token extraction). FIRST source-edit pass after Pass 281 doctrine codification. Single-file scope (src/styles/theme.css only). Four mechanical edits: (1) ADD `--bd-ease-entrance: cubic-bezier(0.2, 0.8, 0.2, 1)` token in :root next to existing --bd-flow-ease; (2) REPLACE inline `cubic-bezier(0.2, 0.8, 0.2, 1)` with `var(--bd-ease-entrance)` at .map-ui-enter mapUiEnter animation; (3) REPLACE inline `cubic-bezier(0.2, 0.8, 0.2, 1)` with `var(--bd-ease-entrance)` at mapPopupEnter animation (popup styling block); (4) REPLACE inline `28s` with `var(--bd-flow-loop-slow)` at .bd-dashboard-atmosphere::before orbDrift animation. Net: 1 new token + 3 inline-to-var replacements. ALL values preserved exactly via CSS custom-property indirection — zero perceptual drift, zero behavior change, zero reduce-motion guard touched. Conservative scope: explicitly DEFERRED 39-site `cubic-bezier(0.4, 0, 0.2, 1)` mass replacement (semantic ambiguity between flow-motion vs state-transition contexts; deserves explicit owner authorization). Conservative scope: explicitly DEFERRED per-purpose duration tokenization (220ms hover, 280ms popup, 420ms ui-enter, 1.4s gold-sheen, 7.2s map-sheen, 5.6s/6s map-glass-float, 2.8s nav-pulse, etc. — ~14 unique values; would require taxonomy decisions). Per Pass 281 §11 invariants: provider-order untouched / reduce-motion guards untouched / dark-mode contrast untouched / cascade-order :root blocks preserved (token added to first :root block alongside existing flow tokens). Per Pass 281 §12 anti-patterns: zero violations. Pre-existing CSS linter warnings about duplicate :root selector at lines 897+2933 + duplicate [data-appearance-mode="light"] at 2174+3070 are documented as INTENTIONAL architecture per Pass 276 §2.2 (cascade-order separation) — Pass 282 did NOT introduce these, did NOT fix them (out of scope per relay #13 prohibitions on "cleanup passes"). NO LAW touched. NO MOLANDJESUS touched. ZERO new owner-decision points (cumulative remains 31). Verification approach documented; runtime-audit lane to validate post-deploy.
last_updated: 2026-05-09
---

# Pass 282 — Cadence/Easing Token Extraction (Evidence)

> **Tier:** REF. Source-change evidence document.
> **Authority:** Owner relay 2026-05-09 #13 priority Item A
> ("cadence/easing token extraction; mechanical normalization
> only; preserve values exactly").
>
> **Pass type:** First source-edit pass after Passes 274-280
> inventory-lane completion + Pass 281 doctrine codification.
>
> **Scope discipline:** single file (src/styles/theme.css), single
> purpose (canonical-token DRY for inline duplicates of EXISTING
> tokens + ONE new entrance-easing token), four mechanical edits.

---

## §1 — Mission

Per relay #13:

> "Allowed: extracting inline durations into canonical cadence
> tokens, extracting inline cubic-bezier values into canonical
> easing tokens, preserving existing values exactly, preserving
> motion behavior exactly, preserving reduced-motion semantics
> exactly, adding comments/invariant references, mechanical
> normalization only.
>
> Not allowed: retuning timings, changing easing curves,
> simplifying atmosphere timing, animation redesign, motion
> cleanup, or emotional-system reinterpretation.
>
> The objective is: normalization without perceptual drift."

This pass executes that mandate at minimum mechanical scope.

---

## §2 — Edits applied

### §2.1 Edit 1: ADD `--bd-ease-entrance` token

**File:** `src/styles/theme.css`
**Location:** first `:root` block, line ~957 (immediately after existing `--bd-flow-ease`)

**Before:**
```css
  --bd-flow-loop-slow: 28s;
  --bd-flow-loop-med: 18s;
  --bd-flow-loop-fast: 4.2s;
  --bd-flow-ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**After:**
```css
  --bd-flow-loop-slow: 28s;
  --bd-flow-loop-med: 18s;
  --bd-flow-loop-fast: 4.2s;
  --bd-flow-ease: cubic-bezier(0.4, 0, 0.2, 1);
  /* Pass 282 (2026-05-09) — entrance physics easing, distinct from flow-ease.
     Used by mapUiEnter (line 617) and mapPopupEnter (line 765). The
     cubic-bezier(0.2, 0.8, 0.2, 1) overshoot-then-settle curve carries
     emotional weight separate from --bd-flow-ease infinite-loop motion.
     Do NOT collapse into --bd-flow-ease — distinct emotional intent
     per LAW_ANIMATION_AND_ATMOSPHERE.md trust+spatial-continuity filter. */
  --bd-ease-entrance: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

**Rationale:** the entrance-physics curve (`0.2, 0.8, 0.2, 1`) is semantically distinct from the flow-loop curve (`0.4, 0, 0.2, 1`). Per Pass 281 §11 invariants + relay #1 directive ("the emotional system already behaves like coherent infrastructure"), preserving the semantic distinction at the token layer prevents future re-tuning from accidentally collapsing the two.

### §2.2 Edit 2: Replace mapUiEnter inline easing

**File:** `src/styles/theme.css`
**Location:** `.map-ui-enter` class definition

**Before:**
```css
  .map-ui-enter {
    animation: mapUiEnter 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
```

**After:**
```css
  .map-ui-enter {
    /* Pass 282 (2026-05-09): easing curve tokenized as --bd-ease-entrance.
       Duration 420ms preserved inline (per-purpose value). */
    animation: mapUiEnter 420ms var(--bd-ease-entrance) both;
  }
```

**Verification:** CSS resolves `var(--bd-ease-entrance)` to `cubic-bezier(0.2, 0.8, 0.2, 1)` at runtime — identical computed value. Zero behavior change.

### §2.3 Edit 3: Replace mapPopupEnter inline easing

**File:** `src/styles/theme.css`
**Location:** map popup theming block (around line 765 pre-edit / ~770 post-edit)

**Before:**
```css
  font-family: "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif;
  animation: mapPopupEnter 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
```

**After:**
```css
  font-family: "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif;
  /* Pass 282 (2026-05-09): easing curve tokenized as --bd-ease-entrance.
     Duration 280ms preserved inline (per-purpose value). */
  animation: mapPopupEnter 280ms var(--bd-ease-entrance) both;
}
```

**Verification:** identical to §2.2 — `var()` resolves to identical computed value.

### §2.4 Edit 4: Replace orbDrift primary inline duration

**File:** `src/styles/theme.css`
**Location:** `.bd-dashboard-atmosphere::before` class definition

**Before:**
```css
  /* orbDrift gives a 4-stop translate+scale loop. 28s keeps it under perceptual
     threshold — the eye registers depth, not motion. */
  animation: orbDrift 28s ease-in-out infinite;
```

**After:**
```css
  /* orbDrift gives a 4-stop translate+scale loop. 28s keeps it under perceptual
     threshold — the eye registers depth, not motion.
     Pass 282 (2026-05-09): 28s tokenized as --bd-flow-loop-slow (canonical
     atmospheric drift cadence). Counter-pair at line 1335 stays inline at
     36s (variant; not tokenized — distinct emotional intent). */
  animation: orbDrift var(--bd-flow-loop-slow) ease-in-out infinite;
```

**Verification:** `--bd-flow-loop-slow` resolves to `28s` — identical computed value. Zero behavior change.

**Why ONLY this 28s site:** the dashboard primary orbDrift is the canonical atmospheric drift cadence (per existing token name `--bd-flow-loop-slow`). Counter-pair (36s reverse, line 1335) and landing-mode variants (32s, 24s, 38s, 44s, lines 4385-4473) intentionally use distinct durations for emotional layering — relay #1 ("emotional asymmetry") + Pass 281 §11 invariant #4 (atmospheric layer choreography) preserve those.

---

## §3 — What was preserved

### §3.1 Values

| Token | Resolved value |
| --- | --- |
| `--bd-ease-entrance` | `cubic-bezier(0.2, 0.8, 0.2, 1)` (NEW; explicit token for existing inline value) |
| `--bd-flow-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` (UNCHANGED) |
| `--bd-flow-loop-slow` | `28s` (UNCHANGED) |
| `--bd-flow-loop-med` | `18s` (UNCHANGED) |
| `--bd-flow-loop-fast` | `4.2s` (UNCHANGED) |

Every replacement uses `var(--token-name)` resolving to the EXACT inline value that was there before. CSS computes identical values at runtime.

### §3.2 Behavior

- mapUiEnter animation: 420ms duration + entrance curve UNCHANGED
- mapPopupEnter animation: 280ms duration + entrance curve UNCHANGED
- orbDrift primary: 28s duration + ease-in-out timing UNCHANGED
- All other animations / transitions: UNTOUCHED

### §3.3 Per Pass 281 §11 invariants

| Invariant | Status |
| --- | --- |
| 4-layer provider mount order (App.tsx) | UNTOUCHED |
| AppWithToast subcomponent boundary | UNTOUCHED |
| First-import-line resize-patch in MapSessionProvider | UNTOUCHED |
| Light-vs-dark contrast LAW palette (CLAUDE.md §7) | UNTOUCHED |
| Reduced-motion guards (10-13 in theme.css + Pass 56 single-block in animations.css) | UNTOUCHED |
| Two intentional `:root` blocks (cascade-order separation) | UNTOUCHED — token added to first block, second block (line 2933) unchanged |
| Pass 56 reduce-guard pattern | UNTOUCHED |
| EmbeddedBrowserBanner Pass 170 dev-only mitigation | UNTOUCHED |

### §3.4 Per Pass 281 §12 anti-patterns

Zero violations. Pass 282 did NOT:
- Reorder providers
- Collapse AppWithToast boundary
- Remove first-import-line resize-patch
- Move AppearanceModeProvider
- Mount providers out of order
- Remove EmbeddedBrowserBanner
- Batch providers under wrapper
- Tier-mix mount-order

---

## §4 — What was DEFERRED

Per relay #13 prohibitions on cleanup-scope-creep:

### §4.1 39-site `cubic-bezier(0.4, 0, 0.2, 1)` mass replacement

**Inventory:** the same curve appears INLINE at 39 sites (38 in theme.css + 1 in animations.css:552 bdTileFade). All 39 sites match the existing `--bd-flow-ease` token value.

**Why deferred:** semantic ambiguity. The 4 existing `var(--bd-flow-ease)` consumers are all `infinite` flow-motion animations. The 39 inline sites are state-transition curves on hover/focus/click — different motion class with the same curve TODAY but possibly distinct intent (the current uniformity could be coincidence or convergence).

Mass-replacing without semantic clarification would lock all 39 sites to whatever `--bd-flow-ease` becomes in the future. Deserves explicit owner authorization to either:
- Confirm unification (replace all 39 with `var(--bd-flow-ease)`), or
- Introduce a separate `--bd-ease-transition` token with the same value today, allowing future divergence.

### §4.2 Per-purpose duration tokenization

**Inventory:** ~14 inline duration values not yet tokenized:
- 220ms (hover/focus transition base)
- 280ms (popup entrance)
- 420ms (ui-enter)
- 0.3s = 300ms (slide-in-right)
- 1.4s, 1.1s = 1100ms, 1.0s = 1000ms, 900ms (gold-sheen one-shot variants)
- 7.2s (map liquid sheen drift)
- 6s (route shimmer + map glass float — appears 2x)
- 5.6s (map glass float — distinct duration than 6s variant)
- 2.8s (map nav icon pulse)
- 36s (orbDrift counter-pair reverse)
- 32s, 24s, 38s, 44s (orbDrift dark-mode + landing variants)

**Why deferred:** per-purpose tokens require a naming taxonomy decision (e.g., `--bd-cadence-popup-enter: 280ms` vs `--bd-cadence-quick: 280ms`). Pass 280 §13 step 1 prescribed tokenization but did NOT prescribe naming. Per relay #13 strict-construction, naming taxonomy decisions are owner-decision territory.

A future Pass 282b (or Pass 283 if owner re-authorizes Item A scope) can extend tokenization once naming is decided.

### §4.3 Pre-existing CSS linter warnings

**Conditions:**
- Duplicate `:root` selector at lines 897 + 2933 — INTENTIONAL per Pass 276 §2.2 + theme.css line 2918 inline comment ("Cascade order is structural ... merging would force one giant `:root` and break the topical separation")
- Duplicate `[data-appearance-mode="light"]` at lines 2174 + 3070 — pre-existing; not investigated by Pass 282

**Why not addressed:** out of scope per relay #13 prohibition on "cleanup passes." Pass 282 did NOT introduce these; relay explicitly forbids "generalized cleanup." Future audit pass can address if owner authorizes.

---

## §5 — Verification approach

### §5.1 Mechanical verification (CSS-level)

CSS custom properties resolve at runtime. Every `var(--token)` substitution is:
- Lexically identical at the byte level (same characters where var() resolves)
- Computed-value identical (browser computes the same `cubic-bezier(...)` and `28s` values)
- Behaviorally identical (animations use the same timing functions and durations)

### §5.2 Runtime-audit lane validation (recommended)

Per relay #6: "the runtime lane should now actively govern implementation sequencing." Recommended runtime checks post-deploy:

1. **mapUiEnter animation**: visit a screen that mounts MapEngineCanvas; verify the entrance animation timing is identical to pre-Pass-282 baseline.
2. **mapPopupEnter animation**: open a map popup; verify entrance timing identical.
3. **orbDrift primary**: load a dashboard; verify atmospheric drift cadence identical (28s loop period).
4. **Token resolution check**: in DevTools, inspect `:root` computed styles; verify `--bd-ease-entrance` resolves to `cubic-bezier(0.2, 0.8, 0.2, 1)` and `--bd-flow-loop-slow` resolves to `28s`.

### §5.3 Reverse-revertibility check

Pass 282 is fully reversible via `git revert <commit-sha>`. Reverting:
- Removes the `--bd-ease-entrance` token definition
- Restores 3 inline values (2 cubic-bezier + 1 duration) at their original sites
- Restores comment block to pre-edit state

No data migration. No source coordination required for revert.

---

## §6 — What this pass DOES NOT do

- Does NOT change any value (every replacement preserves the resolved value).
- Does NOT modify reduce-motion guards (Pass 281 §11 invariant #6 + LAW_ANIMATION_AND_ATMOSPHERE.md §3 preserved).
- Does NOT modify dark-mode contrast (Pass 281 §11 invariant #5 + CLAUDE.md §7 preserved).
- Does NOT modify provider order (Pass 281 §3 preserved).
- Does NOT mass-replace `cubic-bezier(0.4, 0, 0.2, 1)` 39-site surface (deferred per §4.1).
- Does NOT tokenize per-purpose durations (deferred per §4.2).
- Does NOT address pre-existing CSS linter warnings about duplicate selectors (out of scope per relay; documented in §4.3 as intentional architecture).
- Does NOT touch `animations.css` (single-file scope per Pass 281 §11; cross-file work would expand blast radius).
- Does NOT touch any LAW doc.
- Does NOT add new owner-decision points (cumulative remains 31).

---

## §7 — Forward triggers

The execution-phase has now generated its first source change. Next implementation passes (in any order owner authorizes):

1. **Pass 282b / Pass 283 — extend Item A scope**: tokenize the 39-site `cubic-bezier(0.4, 0, 0.2, 1)` (with naming decision: `--bd-flow-ease` unification vs `--bd-ease-transition` separation).
2. **Pass 282c / Pass 284 — Item A continued**: tokenize per-purpose durations (220ms hover, 280ms popup, 420ms ui-enter, etc.) once naming taxonomy is decided.
3. **Pass 283 — Item B**: blur-tier token extraction (Pass 280 §13 step 3).
4. **Pass 283 — Item C**: reduced-motion audit script (read-only validation infrastructure; Pass 280 §13 step 4).
5. **Pass 284 — Item D**: Clerk wrapper inflation (multi-file source edit per Pass 278 §10 step 3-5).
6. **Pass 285 — Item E**: notification generic parameterization prep (Pass 273 §2.2 + Pass 275 §4.2).
7. **Pass 286 — Item G**: runtime continuity regression harness prep.
8. **Owner ratifies any of the 31 cumulative decision points**.
9. **Real runtime defect surfaces** (independent lane).
10. **Stacey answers** (Pass 268 §8).

Until one fires: dormant.

---

## §8 — Cross-references

- Pass 281 [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) — preservation invariants Pass 282 respected; no §11 invariant violated, no §12 anti-pattern triggered.
- Pass 280 [`REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md`](REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md) — §3 cadence + §4 easing inventory + §13 step 1+2 prescribed tokenization (Pass 282 executes minimal scope).
- Pass 276 [`REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md`](REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md) — token surface; Pass 282 adds 1 token + replaces 3 inline duplicates.
- `docs/LAW_ANIMATION_AND_ATMOSPHERE.md` — emotional + reduced-motion canon (preserved).
- `CLAUDE.md` §7 — Light-Mode Surface Rule + Premium Gold Palette (preserved).
- Owner relay 2026-05-09 #13 priority Item A — execution authorization.

---

## §9 — Status

- **Drafted:** 2026-05-09 (Pass 282, first execution-phase source-edit pass).
- **Status:** ACTIVE. Source change applied to `src/styles/theme.css` at 4 sites (1 token addition + 3 inline-to-var replacements). Evidence document accompanies commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself. Pass 282 source change executed under relay #13 priority Item A explicit authorization. Future passes that EXTEND this work (39-site mass replacement, per-purpose durations) require explicit re-authorization.
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines:** Pass 280 §3.1 + §4.1 by adding 1 explicit token + reducing inline duplicates.

**Pass 282 is the first source-edit precedent in the execution phase. The pattern (single-file, mechanical, value-preserving, evidence-doc accompaniment, conservative-scope) becomes the template for subsequent execution-phase passes.**
