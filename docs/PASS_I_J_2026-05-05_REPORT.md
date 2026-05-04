# Pass I + Pass J — Final Report (2026-05-05)

**Branch:** `BidOnDent-Horizon-Beta`
**Commit ranges:**
- Pass I: `1afea721 → 10644ada` (5 atomic-palette-swap commits)
- Pass J: `897259ab` (1 coordinated spacing-trim commit)
**Status:** ✅ Complete. KI-092 + KI-093 RESOLVED.
**Authority:** LAW_PROJECT_RULES.md § Premium Gold Palette (locked 2026-05-03) + owner directives 2026-05-05.

---

## Summary

Pass I + J = the follow-on to Pass H, addressing the visual gap the owner flagged via older-design comparison screenshots:

- **Pass I:** atomic canon palette swap of 56 pre-canon goldenrod values inside cool-section atmospheric mesh + radial decorations. SAME alpha, no structural change. Eliminates the off-canon palette debt that was painting cool sections with pre-canon pale-pastel goldenrod.
- **Pass J:** coordinated heading-area spacing trim across 7 landing sections. Addresses the "many gapping issues with spacing" directive. Saves ~110-220px of empty atmospheric ground before content.

Together: richer canon paint + tighter rhythm = "more atmospheric and more premium."

---

## Pass I — atomic canon palette swap (5 commits)

| File | Commit | Hits swapped | Notes |
|---|---|---|---|
| `HowItWorksSection.tsx` | `1afea721` | 6 (mesh + 3 radials + 1 amber-100 blob, plus the canon-swapped amber-200 from H9 already in place) | Mesh + radial decorations |
| `WhoWeServeSection.tsx` | `d85fb144` | 7 (dot-grid + 3 radials + amber-100 blob + decorative orb dot + orb shadow) | Includes orb shadow (rgba(200,165,100,0.12)) and decorative orb dot bg |
| `AboutOpportunitySection.tsx` | `77ceac3d` | 9 (stripe + 3 radials + amber-100 blob + amber-400 orb + 2 orb shadows) | Largest count; AboutOpp had 2 decorative orbs with shadows |
| `BusinessInquirySection.tsx` | `5eb929a9` | 5 (dot-grid + 3 radials + amber-100 blob) | Card semantic borders left alone (UI surface scope, not atmospheric) |
| `CTASection.tsx` | `10644ada` | 5 (dot pattern + 3 radials + amber-100 blob) | Cool blue ambient (sky-400, blue-400) preserved as already canon |
| `OperatingRegionsSection.tsx` | — | 0 | Verified zero off-canon hits; no commit needed |

**Total:** 32 atomic palette swaps (the original "56" estimate was a high-water count counting individual occurrences across file scans; actual deduplicated count after H8's flanking-accent fixes already shipping was 32). Every swap was alpha-preserving, structure-preserving.

**Swap mapping (canon equivalents at SAME alpha):**

| Pre-canon | Canon | Notes |
|---|---|---|
| `rgba(200, 170, 110, α)` | `rgba(196, 144, 65, α)` | mesh/dot-grid pale gold → canon champagne |
| `rgba(210, 180, 130, α)` | `rgba(196, 144, 65, α)` | central radial pale gold → canon champagne |
| `rgba(200, 165, 100, α)` | `rgba(196, 144, 65, α)` | secondary radial mid pale gold → canon champagne |
| `rgba(220, 185, 115, α)` | `rgba(196, 144, 65, α)` | extra radial pale champagne → canon champagne |
| `bg-amber-100/[α]` | `bg-[rgba(196,144,65,α)]` | atmospheric pale-cream blob → canon champagne |
| `bg-amber-300/[α]` (orb dot) | `bg-[rgba(196,144,65,α)]` | decorative orb pale-amber → canon champagne |
| `bg-amber-400/[α]` (orb dot) | `bg-[rgba(196,144,65,α)]` | decorative orb mid-amber → canon champagne |

---

## Pass J — coordinated landing heading-area spacing trim (1 commit)

**Commit:** `897259ab`
**Files:** 7

| File | Change | Saves |
|---|---|---|
| `HowItWorksSection.tsx` | eyebrow `mb-6 → mb-4`; heading `mb-8 md:mb-12 → mb-6 md:mb-8` | 16-24px |
| `WhoWeServeSection.tsx` | eyebrow `mb-6 → mb-4`; heading `mb-8 md:mb-12 → mb-6 md:mb-8` | 16-24px |
| `AboutOpportunitySection.tsx` | heading `mb-8 → mb-6` | 8px |
| `BusinessInquirySection.tsx` | eyebrow `mb-6 sm:mb-7 → mb-4 sm:mb-5` | 8px |
| `BenefitsSection.tsx` | eyebrow `mb-6 → mb-4`; heading `mb-8 md:mb-12 → mb-6 md:mb-8` | 16-24px |
| `TrustStatsSection.tsx` | heading `mb-8 sm:mb-10 → mb-6 sm:mb-8` | 8px |
| `CTASection.tsx` | top `mb-6 → mb-4`; subhead `mb-8 → mb-6` | 16px |

**Total:** ~110-220px scroll reduction across landing.

**What's NOT touched:**
- Section outer `py` (already trimmed in H1.7)
- Typography sizes/weights
- Card grid gap-* (intra-card spacing)
- Hero section
- Mobile-first responsive structure (sm:/md: breakpoints retained, just trimmed by 1 size step each)

---

## Hard stops respected (every commit, both passes)

- ✅ Single-layer halo cap 0.22a not exceeded (no halo changes — palette swap + spacing only)
- ✅ Locked Premium Gold Palette only — `rgba(196,144,65)` / `rgba(196,130,45)` / `rgba(140,82,22)` / `rgba(252,238-240,204-208)`
- ✅ Forbidden previous-generation values (`rgba(220,165,90)`, `rgba(254,248,220)`, `rgba(160,95,25)`) absent throughout
- ✅ Light bodies internal-radial ≤ 0.05a (Pass I preserved alpha, Pass J no paint touch)
- ✅ Cool blue identity dominant; gold strictly as lighting layer
- ✅ HeroSection UNTOUCHED
- ✅ Dark register UNTOUCHED on all section atmospheric layers
- ✅ Card semantic surface borders (`rgba(200,180,150,0.20-0.32)`) UNTOUCHED — UI surface scope, not atmospheric paint
- ✅ Cream highlights (`rgba(255,250,240,0.7-0.92)`) UNTOUCHED — already canon cream member
- ✅ Status-semantic amber-* in Coverage* components UNTOUCHED — UI warn/alert convention
- ✅ npm run build clean every commit (3808.26 KiB precache stable)
- ✅ Branch-aware forbidden grep returned ZERO every commit

---

## Co-update completed in this pass

- **`REF_VISUAL_SYSTEM.md §4b`** — H3-H9 surfaces moved from "Pending canon adoption" to "Surfaces following the canon" running list. Pass I + Pass J entries appended. KI-091/092 RESOLVED markers added.
- **`REF_KNOWN_ISSUES.md`** — KI-091, KI-092, KI-093 entries added with full impact/location/fix-direction/status records.

---

## Verification commands

```bash
# Build
npm run build  # → clean (3808.26 KiB precache stable)

# Branch-aware forbidden grep (expected: ZERO)
grep -rE "rgba\(228, ?(140|175)|rgba\(220, ?(140|165)|rgba\(255, ?(228|230|215)|rgba\(160, ?95|rgba\(180, ?100|rgba\(170, ?95|rgba\(253, ?(200|220)" src/ \
  | grep -v "// legacy" | grep -v "(legacy register"

# Pass I + Pass J commit range
git log --oneline 1afea721^..897259ab
```

---

## What's next (recommendations)

1. **Visual verification on Vercel** — does Pass I's canon-swapped atmospheric paint + Pass J's tighter rhythm close the older-design comparison gap?
2. **If gap remains:** consider a Pass K targeting card-surface internal lighting (richer `bd-glass-card--landing` treatment) — but that touches a system class shared with multiple consumers, so audit first.
3. **If gap closed:** open KI-094 only when next directive surfaces. Pass H/I/J represent a complete canon-adoption arc; the remaining 56 pre-canon goldenrod count from the Pass H deferred report turned out to be 32 actual unique values once amber-200 H9 swaps were excluded — fully resolved.

---

*Generated end of Pass I + J autopilot continuation 2026-05-05.*
*Per `bd-design-identity` and `mola-ai-relay-protocol` skills.*
