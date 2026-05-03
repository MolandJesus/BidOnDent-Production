---
title: HANDOFF — Opus Visual Next-Pass Planning Prompt
date: 2026-05-03
target_model: Claude Opus 4.7 or current high-depth design/build model
status: READY — use after current screenshots and, ideally, the Sonnet audit report
companion_docs:
  - docs/REF_AI_COLLABORATION_PROTOCOL.md
  - docs/REF_VISUAL_SYSTEM.md
  - docs/VISUAL_AUDIT_PREP_2026-05-03.md
  - docs/HANDOFF_VISUAL_AUDIT_PROMPT_SONNET_2026-05-03.md
  - docs/MOLANDJESUS_DESIGN_DECISIONS.md
  - docs/LAW_PROJECT_RULES.md
  - docs/LAW_HARDENING_PLAN.md
  - docs/PLAN_MAP_MASTER.md
---

# Opus Visual Next-Pass Planning Prompt — copy/paste

Use this prompt in a fresh Opus design/build chat after attaching the latest visual screenshots. If the Sonnet audit has already run, attach or paste `docs/visual_audit_sonnet_2026-05-03.md` too. If it has not run yet, Opus must stay in planning mode and produce a next-pass proposal only.

If this prompt is being used inside a live multi-AI relay with Mola's add-on directives mixed into the transcript, apply [`REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md) first. Treat Mola's embedded add-ons as owner input, separate them from prior AI claims, and reconcile them with LAW/REF docs before planning or building.

---

## Prompt to paste into Opus

You are working on BidOnDent, a map-first auto repair bidding marketplace in soft-launch hardening.

You are **not** here to reinvent the visual identity. The product is already in a strong place. Your job is to read the current docs, inspect the attached screenshots, synthesize the remaining visual risks, and produce a disciplined next-pass plan. Do not code unless the owner explicitly says to proceed after reading your plan.

### Required reading

Read these first, in order:

1. `docs/LAW_PROJECT_RULES.md`
2. `docs/LAW_HARDENING_PLAN.md`
3. `docs/REF_AI_COLLABORATION_PROTOCOL.md`
4. `docs/REF_SYSTEM_STATE.md`
5. `docs/REF_VISUAL_SYSTEM.md`
6. `docs/VISUAL_AUDIT_PREP_2026-05-03.md`
7. `docs/MOLANDJESUS_DESIGN_DECISIONS.md` §7 and §9
8. `docs/PLAN_MAP_MASTER.md` hardening notice + current map constraints
9. If present: `docs/visual_audit_sonnet_2026-05-03.md`

Do not read archived landing plans as active instructions. They are historical only. Current visual truth lives in `REF_VISUAL_SYSTEM.md`.

### Current visual truth

BidOnDent's visual system is:

- Cool blue glass surfaces lit by warm gold studio-lamp atmosphere.
- Dark mode: navy map/intelligence world with gold-lamp top-light.
- Light mode: frosted daylight glass with controlled champagne/gold warmth.
- Blue = product/action/route/selection.
- Gold = lighting/halo/trim/marketplace energy only; never primary button infill.
- Map-first identity is load-bearing product DNA.

The system already has intentional sibling utilities:

- `bd-dashboard-primary-button` for primary CTAs.
- `bd-report-primary-button` for report-flow primary CTAs.
- `bd-report-input` for canonical input fields.
- `bd-glass-card`, `bd-glass-card--landing`, `bd-glass-card--landing-warm`, `bd-glass-card--dashboard`.
- `bd-map-control-pill` and `bd-map-overlay-card` for map controls.
- `bd-bid-card-float` for hero result chips only.
- Liquid Map Intelligence utilities: `bd-map-contour`, `bd-liquid-gold-flow`, `bd-liquid-gold-sheen`, `bd-route-line`, `bd-pin-pulse`, `bd-gold-sheen-hover`.

Do **not** flatten these sibling systems into one generic style.

### Attached screenshot context to analyze

You should inspect the latest screenshots the owner attaches in the fresh chat. They are expected to include:

- Dashboard overview, light and dark.
- Account/settings page, light and dark.
- Notification center/profile dropdown states.
- Landing hero, light and dark.
- Landing section sequence: HowItWorks, Benefits, WhoWeServe, AboutOpportunity, TrustStats, Coverage, BusinessInquiry, CTA/Footer.
- Coverage map section in light and dark, including empty/out-of-region states.

When analyzing screenshots, look especially for:

1. **Dark hero headline contrast.** In the current screenshots, the blue "Auto Body Repair" line may be too low-contrast in dark mode.
2. **Hero map-stage integration.** The map scene is much better, but may still read as a discrete rectangular mock rather than an embedded intelligence field.
3. **Coverage/out-of-region trust.** If a user outside NY sees a Live GPS map centered elsewhere while NY service chips are visible, the copy/visual hierarchy must make that state clear without implying fake coverage.
4. **Light/dark twin relationship.** Dark mode now feels very signature; light mode needs to feel like the daylight twin, not a separate SaaS theme.
5. **Gold restraint.** Gold should remain lamp/trim/halo, not wallpaper.
6. **Section seams.** Warm-to-cool landing transitions should feel intentional, not like stacked color bands.
7. **Dashboard light-mode whitespace.** Wide desktop screenshots may show a strong content column with large empty blue/gray field to the right; decide whether this is premium breathing room or layout imbalance.
8. **Header/search/profile chrome.** The dashboard/landing headers are strong, but search/profile/notification surfaces should all feel like the same material system.
9. **Mobile risk.** The prior hero chip overflow was fixed, but mobile hero/header still needs calm, non-busy verification.

### Hard boundaries

Do not:

- Add backend changes.
- Add new features.
- Add fake shops, fake coverage, fake claims, or fake operational data.
- Change map providers.
- Turn BidOnDent into a directory, insurance platform, fleet tool, or generic SaaS.
- Reopen archived landing plans as active scope.
- Run a broad refactor.
- Replace the current identity with Apple Maps, neon cyber, monochrome slate, beige SaaS, or generic frosted-glass UI.
- Remove the gold-lamp identity. You may recommend restraining overuse, but not deleting the identity.
- Over-audit tiny style nits while bigger launch trust issues remain.

### What to produce first

Return a single Markdown planning report with this structure:

```markdown
# Opus Visual Next-Pass Plan — 2026-05-03

## Overall Read

One short verdict on the current screenshots: what is strong, what is most fragile, and whether the site is ready for only targeted refinement.

## Preserve

List the visual wins that must not be dismantled.

## Screenshot Findings

Prioritized issues:

### P0 — Fix before more visual expansion

- **Where:** screenshot/surface + file/class if known.
- **Symptom:** visual issue.
- **Why it matters:** trust/product impact.
- **Likely fix direction:** concrete, scoped, no code yet.

### P1 — Next targeted pass

Same structure.

### P2 — Watchlist

Same structure.

## Recommended Next Passes

Propose at most 3 passes. Each pass must include:

- Goal
- Files likely touched
- System classes involved
- What must not change
- Verification checklist
- Estimated risk

## Implementation Gate

Say clearly whether implementation should proceed now or wait for owner confirmation.
```

### Preferred next-pass shape

Bias toward a **small, surgical pass**, not another large redesign. The likely top candidates are:

1. Dark hero contrast + map-stage integration refinement.
2. Coverage/out-of-region trust polish if screenshots confirm the NY-vs-live-location tension.
3. Light-mode daylight twin parity and section seam restraint.

Dashboard/account surfaces currently look strong. Treat them as a calibration reference unless the screenshots reveal a concrete issue.

### If the owner then says "build it"

Only after explicit owner approval:

- Keep edits scoped to the approved pass.
- Prefer existing `bd-*` utilities and local patterns.
- Avoid new abstractions unless they reduce real duplication.
- Run the repo's build command after edits.
- If a load-bearing design-system fact changes, update `docs/REF_VISUAL_SYSTEM.md` in the same pass.
- If a current bug is discovered, update `docs/REF_KNOWN_ISSUES.md`.
- Stop after the approved pass. Do not continue into another implementation cycle.

---

## Notes for MolandJesus

This prompt is intentionally more conservative than the earlier landing redesign prompts. The product now has a real visual system. The next model should protect the wins, find the highest-leverage remaining issues, and avoid turning a strong product into a forever-polished mood board.
