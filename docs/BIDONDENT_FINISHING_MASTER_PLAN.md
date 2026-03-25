# BidOnDent — Finishing Master Plan

**Created:** 2026-03-25
**Last updated:** 2026-03-25
**Status:** Active — Phases 1–6 COMPLETE, Phase 7 (Hardening) in progress
**Phase:** Hardening + production readiness (Pass 196+)
**Context:** 195 passes complete. Stability, map dominance, interaction flow, spatial data, mobile, and micro polish all verified and shipped.

This is the single source of truth for what remains to finish BidOnDent. It synthesizes insights from screenshots, all governing docs, ChatGPT analysis, and codebase audit.

---

## The Product Truth

BidOnDent is a **map-first auto body repair marketplace**. The map is not a feature — it is the product. Everything else (reports, bids, shop discovery, insurer workflows) supports the spatial experience.

The site is **109% past its original milestone** (185/160 passes). The design system is unified. The glass tokens are locked. The blue identity is established. What remains is not more polish — it is **product completion and coherence**.

### What the screenshots confirm is strong
- Hero section: premium, clean, honest
- Map/coverage section: the strongest, most product-owned surface on the entire site
- Report wizard: functional 5-step flow with cloud storage
- Glass system: unified across all surfaces
- Trust stats and copy: honest, no false claims
- Business inquiry gateway: progressive disclosure, no wall-of-inputs

### What the screenshots reveal as gaps
- Light landing sections feel disconnected from the stronger map/dark identity
- Dashboard feels like "UI with a map widget" not "map with floating panels"
- Some navigation transitions crash ("Can't find variable: props")
- Section stacking in lighter areas feels template-like
- Customer journey (landing → report → bids → decision) doesn't yet feel like one connected spatial experience

---

## Hard Rules

1. **NO new features** — finish what exists
2. **NO scope expansion** — log unrelated issues, don't fix them
3. **NO design experimentation** — the design system is locked
4. **NO touching unrelated files** — surgical passes only
5. **NO fantasy data or fake capabilities** — honesty is the product
6. **NO skipping doc updates** — every pass updates the build dashboard
7. **NO batching unrelated changes** — one pass, one goal

---

## Pass Execution Order

### PHASE 1 — STABILITY ✅ COMPLETE (Pass 186)

#### Pass 186 — Fix "Can't find variable: props" runtime crash

**Priority:** P1-RUNTIME
**Why:** App crashes with error boundary on certain navigation paths. Nothing else matters if the app crashes.

**Investigation targets:**
- `src/app/components/maps/ReportDetailDrawer.tsx` — new untracked file, untyped destructured props
- `src/app/components/maps/MapReportMarkers.tsx` — renders ReportDetailDrawer, may pass undefined props
- Any component referencing bare `props` without it being a parameter

**Validation:** Navigate through all flows (landing → report → submit → dashboard → bids) without crash. Error boundary should never appear in normal usage.

**Files to touch:** Only the files causing the crash.

---

### PHASE 2 — MAP DOMINANCE ✅ COMPLETE (Passes 187–189)

#### Pass 187 — Map dominance finalization

**Priority:** P3-UX (high impact)
**Why:** The dashboard still feels like "UI with a map widget." The map should be the background layer with floating panels on top, not a widget inside a traditional dashboard.

**Focus:**
- Reduce visual weight of non-map dashboard elements
- Ensure map is always visible when possible (not hidden behind opaque panels)
- Convert blocking sections to overlays/sheets where appropriate
- Improve depth hierarchy (z-index, blur, spacing)

**Validation gate:** "Does the dashboard feel like a map app or a website?" If website → revise.

#### Pass 188 — Landing-to-map identity connection

**Priority:** P3-UX
**Why:** Light landing sections are clean but feel disconnected from the dark map sections. The product's identity lives in the map; lighter sections need subtle blue/spatial connection without becoming dark.

**Focus:**
- Add subtle blue-tinted backgrounds or borders to lighter sections
- Improve section transitions (reduce "stacked marketing site" feel)
- Not every section needs to be dark — but every section must feel like BidOnDent

**Anti-pattern:** Don't make everything dark. Don't add gratuitous glass to light sections. The goal is identity cohesion, not uniformity.

---

### PHASE 3 — INTERACTION FLOW ✅ COMPLETE (Passes 190–192)

#### Pass 189 — Interaction flow smoothing

**Priority:** P3-UX
**Why:** Some transitions between states feel abrupt or unclear. Every tap should have immediate visual feedback.

**Audit checklist:**
- [ ] Tap → response → transition → feedback for all primary actions
- [ ] No dead clicks (buttons that look interactive but do nothing)
- [ ] No unclear state changes (user wonders "did that work?")
- [ ] Smooth transitions between: map → report, report → shop, shop → navigation

**Focus:** Subtle transitions (not flashy). Immediate visual feedback on every interactive element.

#### Pass 190 — Customer decision loop continuity

**Priority:** P2-PRODUCT
**Why:** The customer journey (landing → report → dashboard → bids → choose shop → navigation) should feel like one connected experience, not separate pages.

**Focus:**
- Report submission should naturally lead to "waiting for bids" state
- Bids arriving should feel like a map event (shops appearing)
- Choosing a shop should connect to navigation/directions
- The entire loop should feel spatially grounded

---

### PHASE 4 — MAP→DATA LOOP ✅ VERIFIED (Pass 191 audit, Pass 192 wiring)

#### Pass 191 — Spatial data linkage

**Priority:** P3-ARCH
**Why:** Reports and shops should feel tied to their geographic location, not just listed in a table.

**Verify:**
- Reports originate from map context (location attached)
- Shops feel spatially near the user
- Bid comparison shows distance/location context
- Actions reflect geographic awareness

#### Pass 192 — Shop/insurer real workflow depth

**Priority:** P2-PRODUCT
**Why:** Shop and insurer dashboards have structure but some flows are display-only. Real product depth means these roles can actually do things.

**Focus:**
- Shop: Receive requests, submit bids, manage active jobs (verify these work end-to-end)
- Insurer: View claims, assign shops, track progress (verify workflow completeness)
- Don't add new features — verify and fix what exists

---

### PHASE 5 — MOBILE PERFECTION ✅ COMPLETE (Pass 193)

#### Pass 193 — Mobile experience audit

**Priority:** P4-UX
**Why:** Mobile is the product. Every screen must work perfectly on 375px width.

**Audit:**
- [ ] Thumb reach zones (primary actions within bottom 60% of screen)
- [ ] Bottom sheet behavior (not blocking map, smooth snap points)
- [ ] Map visibility during all flows (map never fully hidden)
- [ ] No cramped UI, no overlap conflicts
- [ ] Report wizard usable one-handed

---

### PHASE 6 — MICRO POLISH ✅ COMPLETE (Passes 194–195)

Only after Phases 1-5 are complete.

#### Pass 194 — Spacing and hierarchy consistency

- Consistent padding/margin across all sections
- Visual hierarchy audit (headings, subheadings, body, captions)
- Hover/tap state consistency

#### Pass 195 — Animation timing and motion

- Entry/exit animations serve purpose (not decoration)
- Transition timing consistent (400ms ease-in-out standard)
- Respect `prefers-reduced-motion`

---

### PHASE 7 — HARDENING (Production readiness)

#### Pass 196+ — Security and infrastructure

| Task | Priority | Notes |
| ---- | -------- | ----- |
| Fix Supabase RLS policies (`USING(true)` on 4 tables) | HIGH | Production security |
| Enable leaked password protection | HIGH | Supabase Auth setting |
| Set `VITE_SENTRY_ENVIRONMENT=production` for deploy | MEDIUM | Already wired, needs env config |
| Code-splitting for bundle size (>1000 kB warning) | LOW | Dynamic `import()` |
| CI/CD pipeline setup | HIGH | Currently manual deploys only |
| Basic test coverage (critical paths) | HIGH | Zero test coverage currently |
| WCAG AA accessibility audit | MEDIUM | Keyboard nav, contrast, aria |
| Remove admin features from production bundle | LOW | Feature flag or code split |

---

## Validation Gate (Run After Every Pass)

Every pass must answer YES to all four:

1. **Does this make the map feel more central?**
2. **Does this reduce friction?**
3. **Does this feel more like an app than a website?**
4. **Would a premium map-first product do this?**

If any answer is NO → revise before continuing.

---

## Documentation Rule

After each completed pass:
1. Update `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` — pass log entry
2. Update `BIDONDENT_MAP_TRACKER_2026-03-21.md` — if map-related
3. Update `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — only if strategy changed
4. Update this plan — mark completed phases, adjust priorities if needed

---

## Stop Conditions

Pause and ask for direction if:
- Build breaks in a genuinely new way
- Required product behavior is unclear
- Scope expansion would be needed to continue
- Docs are contradictory enough to block safe execution

Otherwise: **keep going.**

---

## North Star

The user should feel like they are **navigating a system** — not using a website.

The map is alive. Location is context. Every action is spatial. Trust is earned through clarity, not claimed through marketing.

**Finish BidOnDent.**
