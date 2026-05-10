---
status: ACTIVE
authority: REF
scope: pass-283-source-change-evidence
canonical_source_of_truth: REF_PASS_283_BLUR_TIER_TOKENIZATION_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 283 source-change evidence under owner relay 2026-05-09 #14 priority Item B (blur-tier token extraction). Single-file scope (src/styles/theme.css). Three new tier tokens added (--bd-blur-heavy 28px / --bd-blur-medium 20px / --bd-blur-light 10px) alongside existing --bd-glass-blur 16px primitive token. 36 mechanical inline replacements: blur(28px)→blur(var(--bd-blur-heavy)) 20 sites, blur(20px)→blur(var(--bd-blur-medium)) 12 sites, blur(10px)→blur(var(--bd-blur-light)) 2 sites, blur(16px)→blur(var(--bd-glass-blur)) 2 sites. Variant values (14, 18, 22, 24, 26, 32 px) preserved inline as special-case adjustments — atmospheric layer choreography asymmetry preserved per Pass 281 §11 invariant #4 + relay #14. ALL VALUES PRESERVED EXACTLY via CSS custom-property indirection — zero perceptual drift. Pass 281 §11 invariants all preserved; Pass 281 §12 anti-patterns zero violations. Pass 282 conservative-pattern continued: single-file mechanical edits with comment annotations. NO LAW touched. ZERO new owner-decision points (cumulative remains 31).
last_updated: 2026-05-09
---

# Pass 283 — Blur-Tier Token Extraction (Evidence)

> **Tier:** REF. Source-change evidence document.
> **Authority:** Owner relay 2026-05-09 #14 priority Item B
> ("blur-tier token extraction; single-file mechanical normalization").
>
> **Pass type:** Second source-edit pass. Continues Pass 282
> conservative-mechanical pattern.
>
> **Scope:** single file (src/styles/theme.css), 3 token additions
> + 36 mechanical inline replacements.

---

## §1 — Mission

Per Pass 280 §8.3 + relay #14 priority Item B: introduce a 3-tier
blur depth hierarchy as named tokens; replace inline duplicates
that match canonical tiers; preserve variant values inline.

---

## §2 — Edits applied

### §2.1 Edit 1: ADD 3 blur-tier tokens

**File:** `src/styles/theme.css`
**Location:** first `:root` block, immediately after Pass 282
`--bd-ease-entrance` token

**After:**
```css
  --bd-ease-entrance: cubic-bezier(0.2, 0.8, 0.2, 1);
  /* Pass 283 (2026-05-09) — backdrop-blur depth tier tokens.
     Three-tier hierarchy from theme.css inline survey (Pass 280 §8.1):
       --bd-blur-heavy   — primary glass depth (was 20 inline sites)
       --bd-blur-medium  — secondary glass / subdued depth (was 12 inline sites)
       --bd-blur-light   — lightest glass / mobile-optimized (was 2 inline sites)
     Existing --bd-glass-blur (16px) continues as the named glass-primitive
     token; the 3 new tokens are TIER tokens for the depth hierarchy.
     Variant values (14, 18, 22, 24, 26, 32 px) remain inline as
     special-case adjustments — emotional asymmetry preserved per
     relay #14 + Pass 281 §11 invariant #4 (atmospheric layer choreography). */
  --bd-blur-heavy: 28px;
  --bd-blur-medium: 20px;
  --bd-blur-light: 10px;
}
```

**Naming rationale:** the existing `--bd-glass-blur: 16px` is named
after its USE (glass primitive), not its TIER. The 3 new tokens
are named after their TIER (heavy/medium/light) to provide a
depth hierarchy distinct from the glass-primitive token.

### §2.2 Edits 2-5: Mass `blur()` value replacements

| Edit | Pattern | Replacement | Sites | Resolved value |
| --- | --- | --- | --- | --- |
| 2 | `blur(28px)` | `blur(var(--bd-blur-heavy))` | 20 | 28px (unchanged) |
| 3 | `blur(20px)` | `blur(var(--bd-blur-medium))` | 12 | 20px (unchanged) |
| 4 | `blur(10px)` | `blur(var(--bd-blur-light))` | 2 | 10px (unchanged) |
| 5 | `blur(16px)` | `blur(var(--bd-glass-blur))` | 2 | 16px (unchanged) |

**Total:** 36 mechanical replacements. Each preserves the exact
runtime computed value via CSS custom-property indirection.

**Method:** `replace_all` operations on theme.css. Each pattern
matched only the intended use; verified by post-replacement count
(0 remaining instances of any of the 4 inline patterns).

### §2.3 Variant values intentionally preserved inline

| Value | Occurrences | Why preserved |
| --- | --- | --- |
| `blur(32px)` | 2 | Heavy variant — distinct from --bd-blur-heavy 28px |
| `blur(26px)` | 2 | Heavy variant |
| `blur(24px)` | 2 | Medium-heavy variant |
| `blur(22px)` | 2 | Medium-heavy variant |
| `blur(18px)` | 1 | Medium variant |
| `blur(14px)` | 1 | Light variant |

**10 variant sites preserved inline.** These are special-case
adjustments tuned through visual-canon iteration; tokenizing them
would erase emotional asymmetry. Per Pass 281 §11 invariant #4
+ relay #14 ("preserve emotional asymmetry").

---

## §3 — What was preserved

### §3.1 Values + behavior

Every replacement uses `var(--token-name)` resolving to an
identical inline value. CSS computed-style values are byte-identical
to pre-Pass-283 baseline.

### §3.2 Per Pass 281 §11 invariants

| Invariant | Status |
| --- | --- |
| 4-layer provider mount order | UNTOUCHED |
| AppWithToast subcomponent boundary | UNTOUCHED |
| First-import-line resize-patch | UNTOUCHED |
| Light-vs-dark contrast LAW palette | UNTOUCHED |
| Reduced-motion guards | UNTOUCHED |
| Two intentional `:root` blocks | UNTOUCHED — tokens added to first block only |
| Pass 282 cadence/easing tokenization | UNTOUCHED |

### §3.3 Per Pass 281 §12 anti-patterns

Zero violations.

---

## §4 — Verification

### §4.1 Mechanical verification

Post-replacement counts:
- `blur(28px)` remaining inline: **0**
- `blur(20px)` remaining inline: **0**
- `blur(10px)` remaining inline: **0**
- `blur(16px)` remaining inline: **0**
- `blur(var(--bd-blur-*))` total: **34** (20 + 12 + 2 = matches sum of replacements 2-4)
- `blur(var(--bd-glass-blur))` total: **6** (4 pre-existing + 2 new from edit 5)

Math checks out:
- 20 heavy + 12 medium + 2 light = 34 new var() sites ✓
- 4 pre-existing glass-blur var() + 2 newly converted = 6 ✓

### §4.2 Recommended runtime validation

Per relay #6 ("runtime lane should govern implementation sequencing"):

1. **Primary glass surfaces** (.bd-glass-card, .bd-glass-panel,
   .bd-dashboard-panel, etc.): visual blur depth identical to baseline.
2. **Mobile-optimized glass**: lightest blur surfaces unchanged.
3. **Variant blur sites** (10 inline preserved): atmospheric
   asymmetry visible exactly as before.
4. **DevTools check**: inspect `:root` computed styles; verify
   `--bd-blur-heavy: 28px`, `--bd-blur-medium: 20px`, `--bd-blur-light: 10px`.

---

## §5 — Cross-references

- Pass 282 [`REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md`](REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md) — established conservative-pattern Pass 283 follows.
- Pass 281 [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) — preservation invariants Pass 283 respected.
- Pass 280 [`REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md`](REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md) — §8.1 blur surface inventory + §8.3 3-tier sketch.
- Owner relay 2026-05-09 #14 priority Item B.

---

## §6 — Status

- **Drafted:** 2026-05-09 (Pass 283, second execution-phase source-edit pass).
- **Status:** ACTIVE. Source change applied (3 token additions + 36 inline-to-var replacements). Companion to commit.
- **Authority:** REF.
- **Owner approval required:** FALSE for this doc. Pass 283 source change executed under relay #14 Item B authorization.
- **Refines:** Pass 280 §8.1 + §8.3 by adding 3 explicit tier tokens + reducing inline duplicates by 36.
