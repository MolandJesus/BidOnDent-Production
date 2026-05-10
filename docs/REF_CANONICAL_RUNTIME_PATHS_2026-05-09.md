---
status: CANONICAL
authority: REFERENCE
scope: map-runtime-canonical-paths
canonical_source_of_truth: REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: critical
ai_summary: Canonical user-facing runtime paths through the BidOnDent map system. Documents nine paths (coverage exploration, shop operational navigation, dashboard preview exploration, preview to operational escalation, session restore, reroute lifecycle, route abandonment, viewport persistence, multi-device continuity) with current behavior, target behavior, and gap. Block D / Pass 231b deliverable.
last_updated: 2026-05-09
---

# REF — Canonical Runtime Paths

> Block D / Pass 231b deliverable. **Strategic planning artifact.**
> This document maps the user-facing runtime paths the BidOnDent map
> system must support. Each path is documented as
> (current behavior → target behavior → gap → resolution location).
>
> Vocabulary per
> [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
> §9. Tier classification per
> [`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md) §4.

---

## §1. Path index

| # | Path | Sub-runtime | Tier | Convergence phase |
|---|---|---|---|---|
| P1 | Coverage exploration | Exploratory | A | LAW lifecycle conformance only |
| P2 | Shop operational navigation | Operational | A | Phase 2 (Engine 2 contract) |
| P3 | Dashboard preview exploration | Preview | B | Phase 1 |
| P4 | Preview → operational escalation | Preview → Exploratory → Operational | B → A | Phase 1 (preview half) |
| P5 | Session restore | Operational | A | Phase 2 |
| P6 | Reroute lifecycle | Operational | A | Phase 2 |
| P7 | Route abandonment | Operational | A | Phase 2 |
| P8 | Viewport persistence | Exploratory + Preview | A + B | Phase 1 (preview), Phase 3 (exploratory) |
| P9 | Multi-device continuity | Operational | A | Out of launch envelope |

---

## §2. P1 — Coverage exploration

A customer (or shop, depending on coverage perspective) opens the
coverage map to investigate the spatial possibilities.

**Sub-runtime:** Exploratory Navigation.
**Today's surface:** coverage map (Engine 1 + Host A).
**Today's behavior:**
- User-owned camera (free pan/zoom/pitch).
- Coverage layer rendered.
- Tap on shop pin → bottom sheet with shop summary + "Get directions"
  CTA.
- Routes can be requested + previewed inline.
- No voice. No toast. No wake-lock. No cloud session.
- On reload: viewport NOT restored. Selected shop NOT restored. Route
  preview NOT restored.

**Target behavior:**
- Same Exploratory contract.
- Add: optional viewport persistence per
  [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
  §3 (local, per-surface).
- Add: LAW lifecycle obligations (onLoad/onError/error boundary/
  reduced-motion conformance).
- Do NOT add: voice, wake-lock, cloud session, gated reroute. Those
  are Operational concerns and would change the social contract of
  the surface.

**Gap:** KI-184 (Engine 1 lifecycle gap), KI-191 (reduced-motion CI).
Optional viewport persistence is new feature work, not gap closure.

**Resolution location:** Pass 232 group (Phase 1) extends to Engine
1 lifecycle. Viewport persistence deferred to Phase 3 only if
Branch C (the philosophy doc §8.1 third option) is selected.

---

## §3. P2 — Shop operational navigation

A shop driver commits to driving to a customer's location.

**Sub-runtime:** Operational Navigation.
**Today's surface:** shop directory map (Engine 2 + Host B).
**Today's behavior:**
- User commits via "Navigate" button.
- Cloud session created (`bidondent_nav_session_*` per-user).
- Wake-lock acquired.
- Voice + toast active.
- Reroute gated by `shouldTriggerReroute`.
- Camera owned by runtime: imperative `flyTo` follows route.
- Pitch elevates to 65° in guidance mode.
- On reload: route restored from cloud session.
- On end: cloud session cleared, wake-lock released.

**Target behavior:**
- Same Operational contract.
- Camera: declarative + revision-keyed per LAW §2 (currently
  imperative — KI-180).
- Reduced-motion: imperative `flyTo` must respect
  `prefers-reduced-motion` (currently does not — KI-180 same).
- All other behavior already conformant.

**Gap:** KI-180 (imperative flyTo bypasses reduced-motion + LAW §2
camera authority).

**Resolution location:** Phase 2 pass 237.

---

## §4. P3 — Dashboard preview exploration

User looks at a dashboard widget showing nearby shops or reports
without leaving the dashboard.

**Sub-runtime:** Preview Navigation.
**Today's surface:** `MapLibreDashboardMapPreview` (Engine 3) called
from CustomerMapWidget, ShopMapWidget, InsurerMapWidget,
ReportsListScreen, ReportDetailScreen, CompetitorAnalysisScreen.
**Today's behavior:**
- Caller passes `center` + `zoom`.
- Component silently overrides caller viewport when ≥2 shop pins
  exist (auto-fit to bbox). Hidden authority.
- Gestures suppressed.
- No tap-to-expand affordance on most callers — pin tap behavior
  varies by caller.
- No onLoad/onError surfaced to caller.

**Target behavior:**
- Caller passes `center` + `zoom` AND explicit `autoFit` prop
  (`'always' | 'when-no-caller-bounds' | 'never'`).
- Hidden override forbidden.
- Tap-to-expand affordance present on EVERY caller (per LAW §4 Tier
  B). Affordance escalates to the appropriate Exploratory surface
  (P4).
- onLoad/onError surfaced to caller for failure UI.

**Gap:** KI-181 (hidden auto-fit override), LAW §4 affordance
requirement, KI-184 (lifecycle).

**Resolution location:** Phase 1 (passes 232–235).

---

## §5. P4 — Preview → Operational escalation

User taps the dashboard preview, expands to an exploratory map, picks
a route, commits.

**Sub-runtime:** Preview → Exploratory → Operational.
**Today's behavior:**
- Tap-to-expand works inconsistently across the 6 callers (some
  navigate to a list screen, some to nothing, ReportDetailScreen
  shows the preview as decoration only).
- No carry-forward of viewport state across the boundary.
- Once on the exploratory surface, picking a route + tapping
  "Navigate" creates the Operational session correctly (P2's path).

**Target behavior:**
- Per [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
  §7.1: every preview surface escalates to a defined Exploratory
  surface, carrying viewport + selected pin (if any).
- Per §7.2: Exploratory → Operational requires explicit user
  commitment. No silent escalation. (Already met.)
- Per §7.5: Preview → Operational direct is forbidden. (Already met
  — no caller escalates directly.)

**Gap:** Preview affordance + carry-forward inconsistency. Each
caller needs an explicit "expand target" mapped.

**Resolution location:** Phase 1 (per-surface in passes 232–235);
specific carry-forward semantics declared per surface.

**Carry-forward map (proposed):**

| Caller | Expand target | Carry forward |
|---|---|---|
| CustomerMapWidget | full coverage map | viewport + customer location |
| ShopMapWidget | shop directory map | viewport + shop selection |
| InsurerMapWidget | insurer claims map (future) | viewport + claim filter |
| ReportsListScreen | full reports map | viewport + active filter |
| ReportDetailScreen | shop directory map filtered by report area | viewport + report context |
| CompetitorAnalysisScreen | shop directory map in analysis mode | viewport + analysis params |

This map is owner-reviewable; owner may revise during Phase 1
authorization.

---

## §6. P5 — Session restore

User reloads mid-route, OR signs back in on the same device.

**Sub-runtime:** Operational Navigation.
**Today's behavior:**
- Cloud session restored via `navigationSessionCloudService` per
  Host B's logic.
- Local session (`bidondent_nav_session_*`) restored on next mount.
- Wake-lock NOT auto-reacquired on reload — user must interact for
  the lock to re-establish (browser policy).
- Voice resumes on next route step trigger.
- UI mounts with route already loaded; no "restoring..." indication
  of the cold-start path.

**Target behavior:**
- Same restore behavior, but explicit "Restored navigation" toast on
  first frame after restore.
- Wake-lock re-acquisition prompted if user-interaction event
  available (silent if not — browser policy).
- Cold-start path documented in test coverage (KI-188).

**Gap:** UX legibility (no restoration toast); test coverage
(KI-188).

**Resolution location:** Phase 2 pass 237 + KI-188 test pass
(safe-for-autopilot independent of LAW gate).

**Sign-out behavior:** `useNavigationSession` cleanup must clear
both local AND cloud session on sign-out / account switch (per
[`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
§3 sign-out row). Verify in KI-188 test pass.

---

## §7. P6 — Reroute lifecycle

Driver deviates from the planned route.

**Sub-runtime:** Operational Navigation.
**Today's behavior:**
- `detectDeviation` flags off-route condition.
- `shouldTriggerReroute` gates the prompt (sustained deviation
  threshold, last-prompt cooldown, route-stale guard).
- On gate pass: toast "Route updated" + new geometry committed.
- During route preview (BEFORE user commits): NO reroute. Gating
  doc'd in [`REF_NAVIGATION_AUTHORITY_2026-05-09.md`](REF_NAVIGATION_AUTHORITY_2026-05-09.md) §4.
- During Exploratory exploration: NO reroute (Host A doesn't run
  the gate).

**Target behavior:**
- Same. This path is currently well-formed.
- Add: explicit telemetry when gate prevents reroute (today the
  prevention is silent; debugging an over/under-firing reroute is
  hard without it).

**Gap:** Telemetry only.

**Resolution location:** Phase 2 pass 237 (with declarative camera
work) OR a separate post-launch pass.

---

## §8. P7 — Route abandonment

User taps "End navigation" mid-route, OR closes the app, OR signs
out.

**Sub-runtime:** Operational Navigation.
**Today's behavior:**
- Explicit "End navigation": Host B clears local + cloud session,
  releases wake-lock, voice silent, camera releases to user.
- App close: cloud session persists. Next session restores (P5).
- Sign-out: should clear cloud session — needs verification under
  KI-188.

**Target behavior:**
- Same. Per [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
  §7.3: confirmation prompt required if route < 90% complete and
  user did NOT arrive.
- Add: confirmation prompt logic (currently end-button is silent).

**Gap:** Confirmation prompt absent. Sign-out cleanup unverified.

**Resolution location:** Phase 2 pass 238 (small UX addition); test
coverage in KI-188.

---

## §9. P8 — Viewport persistence

User pans + zooms an Exploratory or Preview surface, then
navigates away, then back.

**Sub-runtime:** Exploratory + Preview.
**Today's behavior:**
- Shop directory map (Exploratory): viewport survives in-app route
  changes via Host B's per-user persistence. Survives reload via
  same.
- Coverage map (Exploratory): viewport NOT persisted. Cold mount on
  every entry.
- Preview surfaces: stateless on every render.

**Target behavior:**
- Per [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
  §3: Exploratory viewport persists per-surface. Preview never
  persists.
- Coverage map should gain optional viewport persistence (matching
  shop directory).

**Gap:** Coverage map has no per-surface persistence.

**Resolution location:** Phase 3 (depends on owner Branch decision
for coverage; if Branch C — third option — is chosen, viewport
persistence rides along).

---

## §10. P9 — Multi-device continuity

User starts a navigation session on phone, picks up on tablet.

**Sub-runtime:** Operational Navigation.
**Today's behavior:** Cloud session is per-user-per-device. Same
user on a different device does NOT see the session. (Cloud key
includes device fingerprint or session id — not the user id alone.)

**Target behavior:** Out of launch envelope. Future feature.

**Gap:** Documented as out-of-scope.

**Resolution location:** Post-launch roadmap. Will require new
PLAN doc when prioritized.

---

## §11. Path-to-pass cross-reference

For every Phase 1+ convergence pass, the new governance rule (owner-
established at Block D authorization) requires the pass to declare
which path it preserves, changes, or escalates. This table feeds
that declaration.

| Pass (proposed) | Surface | Touches paths | Sub-runtimes touched | Tier semantics touched |
|---|---|---|---|---|
| 232 | ReportDetailScreen | P3, P4 | Preview | C-candidate (or B with stricter props) |
| 233 | ReportsListScreen | P3, P4 | Preview | B |
| 234 | 3 dashboard widgets | P3, P4 | Preview | B |
| 235 | CompetitorAnalysisScreen | P3, P4 | Preview | B |
| 236 | Engine 2 contract | P2, P5, P6, P7 | Operational | A |
| 237 | Engine 2 reduced-motion + declarative camera | P2, P5, P6, P7 | Operational | A |
| 238 | Engine 2 layer authority + UX (P7 confirm) | P2, P7 | Operational | A |
| 239+ | Coverage classification (Branch A/B/C) | P1, P8 | Exploratory (or escalate to Operational) | A |

---

## §12. Status

- **Block D / Pass 231b:** COMPLETE.
- **Authority:** REFERENCE / CANONICAL / runtime_impact_if_misunderstood: critical.
- **Binding:** Phase 1+ convergence passes must declare path
  impact per §11 before execution.
- **Next pass:** 231c — Map Shell + Layout Hierarchy Audit.
