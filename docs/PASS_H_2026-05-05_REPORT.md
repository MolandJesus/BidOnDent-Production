# Pass H — Final Report (2026-05-05)

**Branch:** `BidOnDent-Horizon-Beta`
**Commit range:** `91147e12 → e07087ec` (11 commits including 2 mid-pass corrective + 1 owner-directive bundle)
**Status:** ✅ Complete. KI-091 RESOLVED.
**Authority:** LAW_PROJECT_RULES.md § Premium Glass Body Opacity + Directional Backlight Canon (locked 2026-05-03).

---

## Summary

Pass H = LAW-canon adoption for the 8 surfaces flagged in REF_VISUAL_SYSTEM.md §4b "Pending canon adoption" (KI-091), plus 3 mid-pass corrective bundles driven by live owner directives.

The unifying canon: every premium glass surface in BidOnDent should read as "lit from above" by a directional champagne top-cast lamp, with cool-blue body identity, bronze trim, and cream highlight — never yellow-amber, never pure white, never flat.

---

## What shipped (chronological)

| # | Commit | Surface | Brief |
|---|---|---|---|
| H1 | `91147e12` | MapBidSheet body | Directional top-cast + body opacity to canon + cream highlight + backdrop-filter |
| H1.5 | `c140e983` | Landing seam-fade light register | Owner: "still have abrupt splitter" — light mode now renders the bridge |
| H1.6 | `9b269117` | Light-card panel/section accent variants | Owner: "add gold back in light mode" — restored premium gold via canon directional top-cast |
| H1.7 | `d97c827b` | Landing spacing + atmosphere | Owner directive bundle: trim cool-section py + boost seam-fade + apply toplamp to all 4 unapplied cool sections |
| H2 | `b10807a2` | CoverageSearchPanel light shell | LAW canon adoption via centralized `getMapSurfaceTheme` |
| H3 | `ddec7719` | `.bd-report-input` focus | Micro-triad directional top-cast + canon palette swap |
| H4 | `b57d74a6` | MobileBottomNav light bg | Body opacity → canon + bronze trim + cream highlight + canon micro top-cast |
| H5 | `718bad04` | DashboardHeader light shell | Canon micro top-cast champagne lamp appended |
| H6 | `f66e856f` | `.bd-section-eyebrow` (light + dark) | Canon champagne backing glow inherited by ~14 existing usages without per-call-site edits |
| H7 | `93b6fd72` | Landing CTA pill | New `.bd-landing-cta-glow` utility; applied to CTASection closing CTA |
| H8 | `b6557b75` | List markers + flanking accents | 5 marker locations + 4 flanking-accent strands swapped to canon palette |
| H9 | `e07087ec` | Landing atmospheric boost | toplamp alpha bump + new `.bd-landing-section-bottomwash` utility + canon-swap of 6 cool-section warm blobs |

---

## Owner directives folded in

Three directives surfaced mid-execution and were extracted via the `mola-ai-relay-protocol` skill:

1. **"take away space + better smoothly add the atmospheric background with future updated lighting to the different sections"** → H1.7 (spacing trim + seam-fade boost + toplamp coverage).
2. **"hero section on landing page has a good example that i want you to improve and polish for entire landing page"** → also H1.7 (hero-language extension to all cool sections).
3. **"this is older landing page section design that i wanted you to improve on that looks way better then what we have now"** (4 reference screenshots) → H9 (toplamp alpha boost + companion bottomwash + canon-swap atmospheric blobs).

---

## New utilities introduced

| Utility | Purpose |
|---|---|
| `.bd-landing-cta-glow` | Backing radial champagne aura behind landing pill CTAs (button itself untouched since shared with dashboard) |
| `.bd-landing-section-bottomwash` | Companion to `.bd-landing-section-toplamp`; cool-blue depth wash from section bottom; "lit room" canon completion |

`.bd-section-eyebrow` gained inherited `text-shadow` (no new utility, base + dark-register override).

---

## Hard stops respected (every commit)

- ✅ Single-layer halo cap 0.22a never exceeded
- ✅ Locked Premium Gold Palette only — `rgba(196,144,65)` / `rgba(196,130,45)` / `rgba(140,82,22)` / `rgba(252,238-240,204-208)`
- ✅ Forbidden previous-generation values (`rgba(220,165,90)`, `rgba(254,248,220)`, `rgba(160,95,25)`) absent throughout
- ✅ Light bodies internal-radial ≤ 0.05a
- ✅ Cool blue identity dominant; gold strictly as lighting layer
- ✅ Hero, dark MobileBottomNav, dark DashboardHeader UNTOUCHED (Pass F-fix lock + owner template signal preserved)
- ✅ npm run build clean every commit (3808.26 KiB precache stable)
- ✅ Branch-aware forbidden grep returned ZERO every commit

---

## Out of scope / deferred

Identified during H8/H9 grep sweeps but deferred to maintain Pass H coherence:

- **56 pre-canon goldenrod values** in landing atmospheric mesh/radial internals (`rgba(210,180,130)`, `rgba(220,185,115)`, `rgba(184,134,11)` etc.). Pre-date the LAW palette lock. Not flagged by branch-aware forbidden grep. → Future **Pass I — landing atmospheric palette canon sweep**.
- **Status-semantic amber-* uses** in `CoverageSearchPanel`, `CoverageActiveNavigationLayout`, `CoverageNearestShopCard`. UI warn/alert convention, not design canon decoration. → Stays.
- **HeroSection atmospheric blobs** still use `bg-amber-200/[0.32]` etc. Owner explicitly cited hero as the template ("hero is a good example") — preserved.
- **BenefitsSection / TrustStatsSection** warm bronze paint untouched per LAW landing identity rule (warm bronze sections are intentional warm sections).

---

## Co-update obligations

- `REF_VISUAL_SYSTEM.md §4b "Surfaces following the canon"` — running list updated through H2; H3-H9 still need the §4b list refresh (not yet touched in this report's commit window — flag for next pass).
- `REF_KNOWN_ISSUES.md` — KI-091 should be marked **RESOLVED 2026-05-05** with reference to commit range `91147e12 → e07087ec`.

---

## Verification commands

```bash
# Build
npm run build  # → clean (3808.26 KiB precache stable)

# Branch-aware forbidden grep (expected: ZERO)
grep -rE "rgba\(228, ?(140|175)|rgba\(220, ?(140|165)|rgba\(255, ?(228|230|215)|rgba\(160, ?95|rgba\(180, ?100|rgba\(170, ?95|rgba\(253, ?(200|220)" src/ \
  | grep -v "// legacy" | grep -v "(legacy register"

# Pass H commit range
git log --oneline 91147e12^..e07087ec
```

---

## What's next (recommendations)

1. **Co-update REF_VISUAL_SYSTEM.md §4b** to reflect H3-H9 surfaces moving from "Pending" to "Following".
2. **Mark KI-091 RESOLVED** in REF_KNOWN_ISSUES.md with the commit range.
3. **Open KI-092 (Pass I scope)** — landing atmospheric palette canon sweep for the 56 pre-canon goldenrod internals.
4. **Verify in browser** at light + dark, mobile + desktop. Pass H is build-verified but visual confirmation against the older-design reference (owner's screenshots) should determine whether Pass I is a priority or whether the H9 boost was sufficient.

---

*Generated end of long-run autopilot session 2026-05-05.*
*Per `bd-design-identity` and `mola-ai-relay-protocol` skills.*
