# BidOnDent — Soft Launch Hardening Master Plan

**Created:** 2026-04-14
**Status:** IN PROGRESS — collaborative planning session between MolandJeus + Claude (with ChatGPT input)
**Purpose:** Single source of truth for the "harden and activate the marketplace loop" phase leading to soft launch. Captures every locked decision, rationale, and open question so the main AI on auto-pilot can execute without guesswork.

---

## North Star

> **"Does this help one real transaction happen cleanly, end-to-end?"**
> If no → defer. No new features. No Phase 4. Harden, activate, launch.

**The goal is NOT:** more features, better UI, scaling infra.
**The goal IS:** make one real customer → real shop → real bid → real job happen cleanly.

---

## Timeline

- **1–2 weeks** → Soft launch (real users)
- **3–6 weeks** → First meaningful usage data
- **2–3 months** → Investor/demo-ready polish

Source: Pass 854 audit confirmed codebase is past "pre-product." Core loop is wired end-to-end. Biggest risk is not missing features — it's that no one is using the loop yet, and "fake vs real" ambiguity will erode trust the moment real users arrive.

---

## Biggest Risk (Refined)

**Not:** missing features, missing payments, missing push notifications.
**Actually:** mismatch between what the UI implies and what actually happens.

Every locked decision below is filtered through this lens: does it close the gap between implied reality and actual reality?

---

## Launch Scope Guardrails (Non-Negotiable)

These items are launch-scope regardless of which question group they originate from. They are listed here explicitly so the main AI does not quietly reclassify them as "post-launch" during execution drift.

- **Email delivery.** `RESEND_API_KEY` deployed to the Supabase edge function environment. Emails verified as actually sending end-to-end before launch. Email is NOT the same category as push notifications — push is deferred, email is not.
- **Observability.** Sentry is already wired in code ([src/main.tsx:10](src/main.tsx#L10), [sentryInit.ts](src/app/services/sentryInit.ts), [errorReporting.ts](src/app/services/errorReporting.ts)). Guardrail requires verifying `VITE_SENTRY_DSN` is configured in prod + staging and that capture actually fires end-to-end before launch. You cannot harden what you cannot see. No launch without proven capture.
- **Event capture quality.** Even though the audit logging dashboard (S2 in Post-Launch Roadmap) is deferred, the underlying event data is not. Every launch-critical event in `platform_activity_events` (or equivalent) must capture: actor ID, object ID, timestamp, outcome (success/failure), and sufficient context to reconstruct a user's journey. The dashboard can wait; the data cannot.
- **Global error boundary at app root.** Verify `ScreenErrorBoundary` (or equivalent) is wired at the application root, not only inside per-screen surfaces. Unhandled errors must never produce a blank white screen for real users.
- **Staging vs prod separation.** (Pending Group 7 lock, but flagged here as a guardrail — `main = production` with no staging environment is a launch risk that needs an intentional answer, not a default.)
- **Identity normalization on launch-critical tables.** Per Group 5b. Launch-first pragmatism means narrow scope, but it does NOT mean skipping it entirely.
- **RLS on every user- or business-relevant table.** Per Group 5a. Non-negotiable.

**Rule:** if execution wants to defer any of these, it must be explicitly reclassified with written justification in the Change Log — not silently dropped.

---

## Locked Decisions

### Group 1 — Direction & Timeline ✅

**1a. Timeline:** Real users in 1–2 weeks (soft launch). Investor-ready polish 2–3 months out.

**1b. Focus:** STOP adding features. Harden + activate the marketplace loop. **No Phase 4 / payments yet.**

---

### Group 2 — Dev Workflow Going Forward ✅

**2a. Development model:** Main AI on auto-pilot executing a pre-agreed plan, with a smaller AI handling code cleanup / type error corrections as a support role. MolandJeus approves at checkpoints.

**2b. Progress tracking:** Switch primary "where are we" tool to the **Module Completion Matrix** (per-module: backend % / frontend % / tests / real data / prod-ready). Pass log continues from 855+ as historical audit trail only — no longer the primary tracker.

**2c. `DUAL_AI_COORDINATION.md`:** Archive to `docs/archive/` (don't delete — has historical context on why certain files were split between Claude and ChatGPT ownership).

---

### Group 3 — Demo vs Real Posture ✅

**3a. Demo mode (`VITE_DEMO_MODE`):** Keep in production, **hidden behind URL param** (e.g. `?demo=true` or `/demo`).

- When active, show an **explicit, unmistakable banner**: "You're in demo mode — no real jobs will be sent."
- Purpose: investor demos, shop recruiting, your own debugging.
- Must NOT be accessible from any normal navigation surface.

**3b. Map demo fallback (`VITE_ENABLE_MAP_DEMO_FALLBACK`):** **OFF in production.**

- No fake shop density. Ever.
- Replace with **conversion-focused empty states**:
  - "No shops in your area yet — we're onboarding shops right now. Be first in line when they go live."
  - Email capture + zip code capture.
  - "Are you a shop?" CTA → shop signup flow.
- Turns the weakness (cold-start) into a signal-gathering tool (demand + supply leads).

**3c. "Coming Soon" UI (PaymentModal, SettingsModal, etc.):** **Convert to waitlist / signal capture.**

- No dead buttons. No "coming soon" text without action.
- Every placeholder becomes a signal-capture moment:
  - Payments → "Get notified when payments go live"
  - Advanced settings → "Join beta access"
  - Push notifications → "Enable alerts when available"
- Outcome: learn what users actually care about → informs Phase 4 prioritization.

**3d. Market Status Layer (NEW — added during planning):** Introduce a transparent market-density indicator across the app.

- Surfaces: map, report flow confirmation, shop directory, landing page coverage areas.
- Examples: "No shops yet in this area" / "1 shop active" / "3 shops responding nearby."
- Purpose: align expectations _before_ users act, not after. Directly attacks the trust risk.

---

### Group 4 — Architecture Consolidation ✅

**Verification-first discipline confirmed:** Two of the original recommendations in this group were overturned after verifying load-bearing reality in the codebase. Going forward, destructive cleanup decisions (deletions, archival, source-of-truth changes) must be verified against the live code **before** locking, not during execution.

**4a. Type system — explicit adapter layer at service boundary only.**

- DB row types (`services/supabase/types.ts`, snake_case) stay **inside** the data/service layer. They do not escape.
- Adapters convert DB ↔ domain/UI models at the service boundary.
- Components and hooks consume normalized app-domain types (`app/types/index.ts`, camelCase) only.
- **No mapping logic in UI code. No mini-adapters scattered across components.**
- Full merge to a single canonical type set remains the long-term goal post-launch — clean, organized code is a stated priority alongside functionality and design.

**4b. Schema source of truth — SQL migrations are canonical law (updated Pass 871/877, Pass 10).**

- `supabase/migrations/20251230000001_full_schema.sql` = **canonical schema law.** Single source of truth. FROZEN — new schema goes in new timestamped migrations alongside it.
- `supabase/functions/server/database_init.tsx` = **validation-only safety net (Pass 10).** As of Pass 10 this file no longer runs DDL. It connects on cold start, verifies the required tables and the `requesting_clerk_user_id()` function exist, logs the result, and exits. The only DDL retained is a `CREATE OR REPLACE FUNCTION public.handle_updated_at()` which is idempotent and harmless. Load-bearing call site unchanged: [supabase/functions/server/index.ts:92](supabase/functions/server/index.ts#L92).
- `supabase/functions/server/handlers/health.ts` `migrateDatabase` = validation endpoint only (Pass 10). Previously contained redundant `ALTER TABLE` DDL; that has been removed.
- `supabase/functions/server/database_schema_sql_*.ts` = **reference-only dead code.** Removed in Pass 878.
- **Execution rule (updated Pass 871):** see Execution Discipline rule 4 below. Every schema-affecting change lands as a new migration file. No dual-path sync required.
- **Post-launch:** the Pass 10 conversion means `database_init.tsx` can be further simplified or removed once prod edge function is redeployed and we have observability that schema validation failures would be caught elsewhere.

**4c. Hardcoded Clerk + Supabase keys — migrate to `.env`.**

- Verified load-bearing in 3 runtime files: [App.tsx:61](src/app/App.tsx#L61), [services/supabase/runtime.ts:1](src/app/services/supabase/runtime.ts#L1), [utils/validateAppConfig.ts:8](src/app/utils/validateAppConfig.ts#L8). Deletion off the table.
- Migrate all key reads to `.env`-driven runtime config.
- Update all docs and error copy to stop telling users to edit source files: [README.md](README.md), [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md), [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md), [AppShell.tsx:17](src/app/components/app/AppShell.tsx#L17) error copy.
- Enables clean staging vs prod key separation (ties directly into Group 7).

**4d. Meta — verification discipline (locked as ongoing rule).** Strategic decisions can lock now. Destructive decisions (deletion, archival, source-of-truth changes, runtime assumptions) must be verified against live code as part of the planning group before finalizing. Do not defer load-bearing claims to execution time.

---

### Group 5 — Security Posture ✅

**Execution order:** 5b (scoped) → 5a → 5c. Identity consistency must precede RLS authoring, but 5b is **not allowed to become an endless precondition** that blocks 5a. If 5b scope expands beyond launch-critical tables, do a launch-scope identity normalization first, ship RLS against those tables, and defer broader identity cleanup to the Post-Launch Roadmap.

**5a. RLS on every user- or business-relevant table before launch.**

- Current gap (verified in audit): `shop_interest_submissions`, `insurer_interest_submissions`, `platform_activity_events`, `job_assignments`, `notification_preferences`, `shop_service_areas`.
- Why: the Supabase anon key ships in the client bundle. Edge function auth alone is not enough — any user can open a console and query unprotected tables directly. RLS is the only real server-side enforcement for this architecture.
- Why not "edge-function-only access": Supabase Realtime uses direct client subscriptions, and Realtime is core to the product. Locking down client access kills Realtime.
- **Execution rule:** no table is considered prod-ready without RLS verification. The Module Completion Matrix must explicitly mark RLS status per table or module.

**5b. Unify on `clerk_user_id` (TEXT) as the forward identity standard — launch-first pragmatism.**

- Lock the standard now: `clerk_user_id` (TEXT) is the single identity column going forward.
- For soft launch, normalize only the **launch-critical tables** (the ones RLS policies will target). If the full migration scope is clean and small, do it all. If scope starts branching, stop, ship launch-critical normalization, and defer the rest to the Post-Launch Roadmap (A3).
- Why not bridge Clerk → Supabase Auth via webhook (the orthodox path): 2–3 days + webhook infra, too expensive for soft launch. See Post-Launch Roadmap A4 for the alternative future.
- Must happen **before** 5a RLS rollout, because RLS policies need to reference a consistent identity column.

**5c. Soft delete on critical tables — minimal implementation.**

- Scope: `reports` (damage_reports), `bids`, `job_assignments`, `vehicles`.
- Implementation: `deleted_at` column + filter deleted rows out of standard queries + update RLS policies to respect `deleted_at`.
- **No restore UI, no audit dashboard, no elaborate admin UX** for launch. Those live in the Post-Launch Roadmap (S1, S2).
- Backend-first, minimal, cheap. ~1 day of work.

---

### Group 6 — Cleanup Scope Confirmations ✅

All four areas verified against the live codebase before locking. See Change Log for verification-driven corrections.

**6a. Orphaned components — targeted handling, not blanket delete.**

- **Delete:** [src/app/components/admin/GoToAdminButton.tsx](src/app/components/admin/GoToAdminButton.tsx) — zero imports, flagged in archive docs as leaking sensitive data (user email, session tokens). Deleting is a mild security win.
- **Delete:** [src/app/components/auth/AccountTypeMigrationModal.tsx](src/app/components/auth/AccountTypeMigrationModal.tsx) — zero imports. "80% built unwired components" are mental clutter. Post-registration account switching is explicitly NOT launch-critical. Delete unless a confirmed near-term feature requires it (none identified at this time).
- **Keep and reuse:** [src/app/components/demo/DemoModeBanner.tsx](src/app/components/demo/DemoModeBanner.tsx) — Group 3a explicitly requires an "in demo mode" banner behind the URL param. Rebuilding it from scratch would be wasteful. This component becomes the implementation target for 3a.
- **Keep and wire if cheap; otherwise keep for immediate hardening follow-up:** [src/app/components/reports/MissingReportState.tsx](src/app/components/reports/MissingReportState.tsx) — "report not found" is a legitimate product state, not speculative UI. Do not park indefinitely — either wire it in during the hardening pass or rebuild minimally. Not a candidate for the Post-Launch Roadmap.

**6b. Unused devtools — be selective, do NOT wire all four by default.**

- **Wire into AdminDashboard (hardening-critical):**
  - [src/app/components/devtools/EdgeFunctionStatus.tsx](src/app/components/devtools/EdgeFunctionStatus.tsx) — direct launch value: at-a-glance view of whether edge functions are healthy.
  - [src/app/components/devtools/RealtimeStatusIndicator.tsx](src/app/components/devtools/RealtimeStatusIndicator.tsx) — direct launch value: at-a-glance view of whether Supabase Realtime is connected. Realtime is core to the product.
- **Validate then keep or cut:**
  - [src/app/components/devtools/StorageMonitor.tsx](src/app/components/devtools/StorageMonitor.tsx) — less central to launch confidence. Keep only if validated as working and genuinely useful for the hardening phase.
  - [src/app/components/devtools/StorageInspector.tsx](src/app/components/devtools/StorageInspector.tsx) — same. Archive docs flag a known `any` type issue. Keep only if validated; otherwise delete and don't rebuild.
- **Rule:** do not wire components into admin surfaces just because they exist. Value must be proven before they stay.

**6c. `make-server-9f243523/` legacy edge function alias — DEFER to Post-Launch Roadmap.**

- Verified as a live backward-compatibility layer with four touchpoints (runtime constant, path-stripping logic, deploy command, docs). Not a simple stub.
- Removing safely requires: verifying no clients still hit the legacy URL, removing the runtime constant and callers, removing the path-stripping logic, updating deploy commands, un-deploying the legacy function.
- Not launch-critical. Classic "cleaner-looking but not helpful for launch" work. Added to Post-Launch Roadmap.

**6d. Atlanta QA pack — convert to NY metro QA pack.**

- Atlanta 45-destination QA drive panel was a DEV-only dual-AI pass era artifact. Coverage area is NY metro, not Atlanta.
- Conversion gives immediate launch value: a QA drive panel populated with real NY destinations so manual navigation testing happens in the actual coverage area.
- Scope: `atlantaQADestinations.ts`, `atlantaTestHubSeedData.ts`, their tests, and `ShopDirectoryQADrivePanel.tsx`. Do NOT touch unrelated test fixtures that happen to use "Atlanta" as a generic string — those test different logic.
- This is one of the few cleanup tasks that also creates launch value, so it passes the North Star test.

---

### Group 7 — Launch-Operability Prerequisites ✅

**Framing rule:** Group 7 is about launch _operability_, not general infrastructure polish. Every item in this group answers the question "is the launch actually survivable?" — not "is the infra pretty?" If execution tries to expand this group into platform work, push back.

**7a. Staging vs prod — Vercel preview deployments as practical staging, backed by staging Supabase config.**

- Use Vercel PR preview URLs as the de-facto staging tier.
- Point previews at a **staging Supabase project** (or staging schema on the same project, if simpler) via env var overrides.
- One clean flow: branch/PR → Vercel preview URL → verify auth, edge functions, realtime, email sending, error tracking → merge to `main` → prod.
- **Keep it minimal.** Do NOT build a separate heavyweight staging environment or a second Vercel project. Previews + staging env vars are enough for soft launch.
- What this buys you: a real pre-prod check for auth, edge functions, realtime, env/config mistakes, email behavior, error tracking wiring.

**7b. `RESEND_API_KEY` — verification + deployment + proof of one real email.**

- This is an **execution verification item**, not a strategy question. The lock is the action, not the decision.
- Execution sequence:
  1. Verify whether `RESEND_API_KEY` is already in the Supabase edge function environment.
  2. If not, deploy it. Requires a Resend account + API key; treat Resend account setup itself as in-scope launch work if the account does not exist yet.
  3. Prove at least **one end-to-end email flow** actually lands in a real inbox (e.g., new-bid notification to a test customer) before launch.
- Launch cannot proceed without this working. Already listed under Launch Scope Guardrails as non-negotiable.

**7c. Geocoding — stay on Nominatim for soft launch. Defer provider migration.**

- Do not proactively migrate. A proactive migration now is classic overbuilding: more config, more vendor complexity, more cost, zero immediate launch benefit.
- **Trigger for migration:** rate limit incidents, reliability issues, or daily report volume exceeding Nominatim's polite-use threshold. Not "professionalism."
- **Soft future preference (not a lock):** Mapbox if the priority is a developer-friendly mapping/geocoding ecosystem fit, Google if the priority is broadest enterprise reliability / mature geocoding depth. Decision not required until the trigger fires.
- Tracked in Post-Launch Roadmap as I1.

**7d. Prod-readiness smoke-test checklist (new — added during planning).**

- Before launch, a short checklist of concrete smoke tests must be run against the staging environment AND again against prod after deploy. Items at minimum:
  - Sign up a new customer end-to-end (Clerk → Supabase profile created).
  - Submit a damage report with at least one photo upload.
  - From a shop account, see the new report and submit a bid.
  - From the customer account, accept the bid, confirm competing-bid auto-reject and job assignment.
  - Receive the confirmation email (proves 7b is working).
  - Open navigation to the shop, confirm route and turn-by-turn work.
  - Verify observability captures a deliberately-triggered error.
  - Verify RLS by attempting direct Supabase client queries on protected tables from an unauthenticated session — must fail.

---

## Open Questions (Still To Decide)

_All 7 groups locked as of 2026-04-14. No open questions. Any new ambiguity surfaced during execution must be brought back here for explicit lock before proceeding._

---

## Execution Plan

**Purpose:** Ordered, concrete work for the main AI on auto. Each phase is a work block with explicit dependencies, parallel-safe markers, and a checkpoint gate where MolandJeus reviews before the next block begins. Do not reorder phases. Do not merge phases. If execution discovers a blocker, stop at the current phase and bring it back to the open questions section for an explicit lock before continuing.

**Pass numbering:** Continue from pass 855+. Each pass follows the existing "one coherent change per pass" discipline. Pass log remains the historical audit trail; the Module Completion Matrix (built in Phase 5) is the primary "where are we" tool going forward.

**Parallel-safe vs sequential:** Items within a phase may be done in parallel unless marked `[SEQ]`. Phases themselves are sequential except where noted.

---

### Phase 0 — Pre-flight Verification 🛑 Checkpoint gate

**Purpose:** Establish ground truth before any work begins. Verification-first discipline applies.

Work items:

1. Audit the current state of every Launch Scope Guardrail:
   - Is `RESEND_API_KEY` deployed to Supabase edge function env? (yes/no + evidence)
   - Is Sentry capture actually firing? `initSentry()` is already called from [src/main.tsx:10](src/main.tsx#L10) and [sentryInit.ts](src/app/services/sentryInit.ts) is wired — verify `VITE_SENTRY_DSN` is set in prod/staging env and that a deliberate test error reaches the dashboard. This is verification, not installation.
   - Is `ScreenErrorBoundary` (or equivalent) wired at the **application root**, not just per-screen? (yes/no + file/line)
   - Does `platform_activity_events` currently capture actor/object/timestamp/outcome, or is the data thin? (report sample rows)
   - Which of the 6 launch-critical tables currently have RLS policies? (list per table)
   - Are `clerk_user_id` vs `user_id` columns used consistently or inconsistently per table? (report the split)
2. **Rate-limiter coverage audit.** `rateLimiter.ts` exists and is wired into the edge function middleware at [supabase/functions/server/index.ts:88,120-121](supabase/functions/server/index.ts#L88). Verify that every launch-critical write endpoint (report create, bid create, bid accept/job assignment, estimate submit, onboarding submits) is actually covered by a `rateLimitType` classification. Report any uncovered endpoint — do NOT build new limiter logic, just confirm or flag gaps.
3. **Legal/trust-surface audit.** [TermsOfServicePage.tsx](src/app/components/legal/TermsOfServicePage.tsx) and [PrivacyPolicyPage.tsx](src/app/components/legal/PrivacyPolicyPage.tsx) exist and are routed in [App.tsx:266-267](src/app/App.tsx#L266-L267). Verify: (a) both pages are reachable from the footer/nav on launch surfaces, (b) content is not visibly placeholder/stale, (c) nothing in either page is actively misleading about current functionality (e.g., claims about payments when payments are not live). Fixes go into Phase 1. No full compliance rewrite.
4. Re-verify Group 4b and 4c load-bearing claims still hold (in case of drift since 2026-04-14 planning).
5. Re-verify Group 6 orphaned-component and devtools import counts are still zero.
6. Produce a concrete **Pre-flight Report** documenting findings and the resulting punch list going into Phase 1.

**Gate criteria:** Pre-flight Report must explicitly mark each Launch Scope Guardrail as one of: **already satisfied**, **missing**, or **needs verification fix**, with file/line or runtime evidence for each. No Phase 1 start until every guardrail has an owner action attached. MolandJeus reviews the report; any surprising findings (e.g., guardrails unexpectedly met, or load-bearing claims changed) must be reconciled before Phase 1 begins.

---

### Phase 1 — Safe Cleanup + Early Observability 🛑 Checkpoint gate

**Purpose:** Get visibility installed and remove dead weight. **Parallel-safe block.** This phase does not touch architecture or security — only additive observability and subtractive cleanup.

Why observability is in Phase 1: you cannot harden what you cannot see. Any breakage introduced by Phase 2+ must be immediately visible.

Work items (parallel-safe):

**1.1 Observability verification (not installation) — highest priority in this phase**

- **Sentry is already installed and wired.** [src/main.tsx:10](src/main.tsx#L10) calls `initSentry()`, [sentryInit.ts](src/app/services/sentryInit.ts) owns the lifecycle, [errorReporting.ts](src/app/services/errorReporting.ts) is the capture adapter, existing error boundaries (`GlobalErrorBoundary`, `NavigationErrorBoundary`, `ImageErrorBoundary`) already route through it. **Activation is just setting `VITE_SENTRY_DSN` in `.env`.** Do NOT re-install or replace the SDK.
- Verify `VITE_SENTRY_DSN` is configured in prod and staging env (ties into Phase 1.5 `.env` migration).
- Verify frontend capture works end-to-end with one deliberate test error that reaches the Sentry dashboard.
- Verify at least one error boundary actually routes a thrown error through `errorReporting.ts` → Sentry.
- Verify edge function / server-side capture path if a Deno integration is configured; if not configured, flag it as a decision (add to Phase 1 punch list or consciously defer — but the decision must be explicit, not silent).
- Keep it minimal: no custom dashboards, no alerting config beyond defaults.

**1.2 Global error boundary verification + fix**

- Audit `ScreenErrorBoundary` wiring at the application root in [src/app/App.tsx](src/app/App.tsx) and [src/app/components/app/AppShell.tsx](src/app/components/app/AppShell.tsx).
- If the root is not protected, wire the boundary there. Verify that a deliberate thrown error in a child component produces a graceful fallback UI, not a blank white screen.
- The fallback UI must route the error into the observability layer from 1.1.

**1.3 Group 6 deletions (confirmed safe)**

- Delete [src/app/components/admin/GoToAdminButton.tsx](src/app/components/admin/GoToAdminButton.tsx).
- Delete [src/app/components/auth/AccountTypeMigrationModal.tsx](src/app/components/auth/AccountTypeMigrationModal.tsx).
- Do NOT delete `DemoModeBanner.tsx` — reserved for Phase 4 (Group 3a reuse).
- Do NOT delete `MissingReportState.tsx` — reserved for Phase 4 wire-in.

**1.4 Group 6 devtool wiring (selective)**

- Wire [src/app/components/devtools/EdgeFunctionStatus.tsx](src/app/components/devtools/EdgeFunctionStatus.tsx) into AdminDashboard.
- Wire [src/app/components/devtools/RealtimeStatusIndicator.tsx](src/app/components/devtools/RealtimeStatusIndicator.tsx) into AdminDashboard.
- Validate `StorageMonitor.tsx` and `StorageInspector.tsx`. If they work and are genuinely useful → wire them. If not → delete. Do not rebuild.

**1.5 Group 4c — `.env` migration**

- Migrate `clerkPublishableKey` and Supabase `projectId` / `publicAnonKey` from [utils/clerk/info.tsx](utils/clerk/info.tsx) and [utils/supabase/info.tsx](utils/supabase/info.tsx) into `.env`-driven runtime config.
- Update the 3 verified callers: [App.tsx:61](src/app/App.tsx#L61), [runtime.ts:1](src/app/services/supabase/runtime.ts#L1), [validateAppConfig.ts:8](src/app/utils/validateAppConfig.ts#L8).
- Update docs so nothing tells users to edit source files: [README.md](README.md), [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md), [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md), and the error copy in [AppShell.tsx:17](src/app/components/app/AppShell.tsx#L17).
- Keep `info.tsx` files as thin re-exports from env, OR delete them after callers are migrated (prefer delete for cleanliness).
- **Preserve current runtime behavior during the migration.** Config centralization is the goal; changing effective keys, environment resolution order, or fallback behavior is not. A successful `.env` migration must be indistinguishable from the prior hardcoded path at runtime.

**1.6 Group 2c — archive `DUAL_AI_COORDINATION.md`**

- Move to `docs/archive/`. Do not delete.

**1.7 Group 6d — Atlanta QA pack → NY metro conversion**

- Build a 45-destination NY metro pack covering the real coverage area (Westchester, Rockland, Dutchess, etc.). Use a mix of commercial, residential, landmark, and transit destinations.
- Update [atlantaQADestinations.ts](src/app/services/intelligence/atlantaQADestinations.ts) → rename to `nyMetroQADestinations.ts` with new data.
- Update [atlantaTestHubSeedData.ts](src/app/services/intelligence/atlantaTestHubSeedData.ts) → rename accordingly.
- Update all imports and their tests.
- Update [ShopDirectoryQADrivePanel.tsx](src/app/components/shop/ShopDirectoryQADrivePanel.tsx) to use NY metro data.
- Do NOT touch unrelated test fixtures that use "Atlanta" as a generic string (identity sanitizers, market intelligence, etc.).

**Gate criteria:** Observability captures a deliberate test error. Global error boundary catches a deliberate thrown error. All deletions complete with no broken imports. `.env` migration verified in dev + preview deploy. NY metro QA pack usable for a manual drive test.

---

### Phase 2 — Architecture Foundations 🛑 Checkpoint gate

**Purpose:** Lay the consistent identity and type groundwork that Phase 3 security hardening depends on. **Sequential — do not parallelize these items with each other.**

Work items:

**2.1 [SEQ] Group 4a — Adapter layer at service boundary**

- Define the canonical app-domain types in [src/app/types/index.ts](src/app/types/index.ts) (camelCase).
- **Launch-critical first.** Start with the launch-critical flows: reports, bids, jobs, vehicles, shop profiles, activity events. Only expand to the remaining models (insurer profiles, estimates, service areas, preferences) **if the pattern is stable and the pass remains contained**. If scope starts ballooning, stop, ship the launch-critical adapters, and defer the rest to Post-Launch Roadmap A1.
- For each in-scope data model that crosses the DB↔UI boundary, build explicit `fromDb()` and `toDb()` adapters in the service layer.
- Adapters live in the corresponding `services/supabase/*.ts` files. **No mapping logic in components or hooks.**
- Components and hooks consume only domain types. Reject any PR/pass that leaks snake_case DB types into UI code.
- Fix the known `Vehicle.year` type conflict (string vs number) — pick number, adapt on the way in.

**2.2 [SEQ] Group 5b — Launch-critical identity normalization**

- Identify the launch-critical tables (the ones that will have RLS policies in Phase 3). At minimum: `damage_reports`, `bids`, `job_assignments`, `vehicles`, `shop_profiles`, `insurer_profiles`, `notification_preferences`, `shop_service_areas`, `estimate_requests`, `platform_activity_events`.
- For each, normalize to `clerk_user_id` (TEXT) as the primary identity column. Write migrations.
- Update all service-layer code to use `clerk_user_id` consistently.
- **Launch-first pragmatism:** if scope expands beyond these tables, stop, document the remaining work in [BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md](BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md) under A3, and proceed to Phase 3. Do NOT let identity cleanup block RLS rollout.
- ~~Schema sync execution rule~~ — **Superseded by Pass 871.** Migrations folder is the sole authority; `database_schema_sql_*.ts` helpers are dead code. See Execution Discipline rule 4.

**Gate criteria:** Launch-critical flows have **no verified DB-type leaks into UI code**, adapter functions exist for each launch-critical model, and a grep/typecheck review confirms no new snake_case DB types are consumed directly in components/hooks for those flows. Launch-critical tables all use `clerk_user_id`. Full test suite still passing (543+/555 baseline, do not regress). No runtime errors in preview env.

---

### Phase 3 — Security Hardening 🛑 Checkpoint gate

**Purpose:** Close the trust gap. Depends on Phase 2 identity consistency.

Work items:

**3.1 [SEQ] Group 5a — RLS on launch-critical tables**

- Write and apply RLS policies for each launch-critical table identified in 2.2.
- Policies must reference `clerk_user_id` consistently.
- Required policies per table (at minimum):
  - Owner can select/insert/update/delete their own rows.
  - Cross-user read only where explicitly required by product logic (e.g., shops reading reports in their service area, customers reading bids on their reports).
  - No anon/public access unless explicitly required (e.g., landing page coverage stats).
- Test each policy by attempting direct Supabase client queries with and without auth from a browser console. RLS must block what it should block.
- **Save a short verification artifact per table**: query attempted, auth state, expected result, actual result. A small markdown table in the pass log is sufficient. "Tested manually" is not an acceptable gate claim.
- Update the Module Completion Matrix as each table is cleared.

**3.2 Event capture quality verification (Launch Scope Guardrail)**

- Audit `platform_activity_events` (or equivalent) capture paths across all launch-critical flows: report creation, bid creation, bid acceptance, job assignment, shop onboarding, customer signup.
- Each event must include: actor ID (clerk_user_id), object ID, object type, timestamp, outcome (success/failure), and a JSON context payload with enough info to reconstruct the user's journey.
- Fix any gaps. No dashboard work — data capture only.

**3.3 Idempotency / duplicate-submission protection for launch-critical write flows (narrow scope)**

- **Verify or add** duplicate-prevention for the following flows only: report submission, bid creation, bid acceptance / job assignment transition, and the outbound email side effects tied to those writes. This is NOT a mandate to build a full idempotency framework.
- UI-level `isSubmitting` / debounce is helpful but insufficient on its own. The concern is retries, double-clicks across tabs, network resubmits, repeated edge-function invocation, and duplicate email side effects.
- Acceptable minimum: server-side dedupe via unique constraint, idempotency key, or state-machine check that rejects a repeat transition (e.g., a bid in `accepted` state cannot be accepted again; a report with the same `(clerk_user_id, client-provided request id)` cannot insert twice within a short window).
- For each of the four flows, produce a one-line verification artifact: flow → mechanism → test performed → result. Same lightweight format as the RLS artifacts in 3.1.
- If existing protection already exists (e.g., unique constraints, state checks), mark it verified and move on. If it does not exist, add the narrowest viable protection — do not turn this into a framework project.

**3.4 Group 5c — Minimal soft delete**

- Add `deleted_at TIMESTAMPTZ NULL` to: `damage_reports`, `bids`, `job_assignments`, `vehicles`.
- Update all standard queries to filter `deleted_at IS NULL` by default.
- Update RLS policies so soft-deleted rows are not returned.
- Replace existing hard-delete calls with soft-delete calls.
- **No restore UI. No audit dashboard. Backend-only.** Admin restore UI is deferred to S1 in the Post-Launch Roadmap.

**Gate criteria:** Every launch-critical table has RLS verified by direct-client query attempts with per-table artifacts saved. Event capture populates all required fields in a live test flow. Idempotency / duplicate-submission protection is verified (or added) on all four launch-critical write flows with per-flow artifacts saved. Soft delete works end-to-end on at least one table (verify a deleted bid disappears from standard queries but remains in DB).

---

### Phase 4 — Trust Surfaces (Higher Urgency + Tightly-Scoped Addendum) 🛑 Checkpoint gate

**Purpose:** Close the "UI implies vs reality" gap defined as the biggest launch risk. Split into two sub-phases by urgency per ChatGPT pressure-test.

#### Phase 4A — Higher-urgency trust surfaces (parallel-safe)

**4A.1 Group 3a — Demo mode URL param + explicit banner**

- Gate demo mode on a URL param (`?demo=true` OR a `/demo` route — pick one, be consistent).
- Reuse [DemoModeBanner.tsx](src/app/components/demo/DemoModeBanner.tsx) as the implementation target. Do not rebuild.
- Banner copy: "You're in demo mode — no real jobs will be sent." Must be unmistakable, not a subtle chip.
- Demo mode must NOT be accessible from any normal navigation surface.
- Verify: a real visitor landing on `/` never sees demo state.

**4A.2 Group 3b — Map fallback OFF in prod + honest empty states with conversion**

- Turn `VITE_ENABLE_MAP_DEMO_FALLBACK` off in production env.
- Replace empty-state UI with conversion-focused copy: "No shops in your area yet — we're onboarding shops right now. Be first in line when they go live."
- Add: email capture + zip code capture form on empty states.
- Add: "Are you a shop?" CTA linking to shop signup flow.
- Store captures in a new `waitlist_signups` table (or reuse `shop_interest_submissions` / `insurer_interest_submissions` if schema fits). **Prefer reusing an existing submission table only if it preserves semantic clarity and does not force mixed-purpose records that will complicate follow-up workflows.** If reuse would muddy the table's purpose, create `waitlist_signups`.

**4A.3 Group 3c — Coming Soon → waitlist conversion**

- [PaymentModal.tsx](src/app/components/codelayer/account/PaymentModal.tsx): replace "Billing tools are coming soon" with "Get notified when payments go live" + email capture.
- [SettingsModal.tsx](src/app/components/codelayer/account/SettingsModal.tsx): replace disabled-with-badge fields with "Join beta access" capture where appropriate, or hide entirely.
- No dead buttons. Every clickable surface does something.
- Reuse a single `WaitlistCapture` component so future deferred features can add one line to get a capture surface.

**4A.4 Group 6 — `MissingReportState` wire-in**

- Wire the existing [MissingReportState.tsx](src/app/components/reports/MissingReportState.tsx) into the report detail route as the 404/error state.
- If the existing component needs more than a quick update to fit, rebuild minimally rather than forcing the old one.
- Do NOT skip this — "report not found" is a legitimate product state and shipping without it = bad UX on a broken link.

#### Phase 4B — Market Status Layer (tightly scoped)

**4B.1 Group 3d — Market status layer MVP**

- **Tight scope.** One component, reused in 3–4 places max. Not a redesign.
- Possible surfaces: map overlay corner, report confirmation screen, shop directory header, landing page coverage section.
- Content rules:
  - "No shops yet" when count = 0.
  - "1 shop active" / "N shops active" when count > 0.
  - "N shops responding nearby" only if realtime response data is already available (do not build new real-time pipelines for this).
- **Do not invent new realtime pipelines, new data sources, or new UX flows for this.** If the data isn't already wired, use what's available or skip that surface.
- If any one surface takes more than a few hours to wire, cut the surface from scope — do not expand.

**Gate criteria:** Demo mode never surfaces to real visitors. Empty states no longer show fake shops. No dead Coming Soon buttons. **One reusable market-status component is live on at least 2 approved surfaces, uses existing data only, and required no new backend endpoint, no new realtime pipeline, and no page-layout redesign.** `MissingReportState` handles a deliberate broken URL test.

---

### Phase 5 — Launch Operability 🛑 Checkpoint gate

**Purpose:** Everything that makes the launch actually survivable. Depends on prior phases being stable.

Work items:

**5.1 Group 7a — ~~Vercel previews as practical staging~~ Local dev + staging Supabase** _(Updated 2026-04-15)_

- ~~Configure Vercel preview deployments to use staging Supabase config via env var overrides.~~
- Staging Supabase project `lhhdqycnhweaxqviwdqt` created and fully bootstrapped (Pass 872).
- Local Docker dev stack running via `supabase start` with consolidated migration (Pass c2b44425).
- Edge function deployed to staging (Pass 880) and serving locally.
- Primary dev/test workflow: `localhost:5173` + local Supabase Docker stack. Deployment method (Vercel or otherwise) is TBD and does not gate any Phase 5/6 work.
- **Status: COMPLETE.** Local stack + staging Supabase are sufficient for all development and smoke testing.

**5.2 Group 7b — RESEND verification + deployment + one real email proof**

- Verify whether `RESEND_API_KEY` is already in the Supabase edge function env.
- If missing: create/confirm a Resend account, generate an API key, deploy it to Supabase edge function env.
- Send one end-to-end test email through the real Resend integration (e.g., a new-bid notification to a test customer inbox).
- Confirm delivery with a screenshot or log entry. Do not mark this done based on "the code runs" — mark done only when an email lands in an inbox.
- **Produce a launch-critical email mapping table** covering every notification the four handler functions in [supabase/functions/server/handlers/notificationEmails.ts](supabase/functions/server/handlers/notificationEmails.ts) can send (notifyCustomerNewBid, notifyShopBidStatus, notifyCustomerClaimDecision, and any others present). Columns: **trigger event → expected recipient → template used → expected timing → observed result**. Fill by running each happy-path trigger once. "One real email landed" is necessary but not sufficient — the mapping table catches wrong-event, missing-event, and duplicate-event failures that single-email proof cannot.
- **If domain-based sending is intended for launch, verify sender identity configuration (SPF/DKIM/verified domain) is sufficient for actual delivery, not just sandbox acceptance.** Not a full deliverability project — just enough to prevent the false-positive where email technically sends in test but prod sender reputation/config silently breaks delivery.

**5.3 Group 2b — Module Completion Matrix, first populated version**

- Build the Module Completion Matrix as a new doc (or section of an existing doc): `docs/BIDONDENT_MODULE_COMPLETION_MATRIX.md`.
- Columns per module: Backend %, Frontend %, Tests, Real Data, RLS Status, Prod-Ready %.
- Populate from current state of each module after all prior phases complete.
- **Keep the first version minimal and evidence-based.** Do not turn the matrix into a second planning system. It exists to reflect reality, not to prescribe work.
- This matrix becomes the primary "where are we" reference going forward, replacing the pass log as the day-to-day tracker.

**Gate criteria:** Local dev server (`localhost:5173`) proves end-to-end against local or staging Supabase. At least one real email delivered to a real inbox. Module Completion Matrix populated and reviewed.

---

### Phase 6 — Pre-launch Verification Gate 🛑 Final checkpoint before launch

**Purpose:** Last line of defense. Group 7d smoke-test checklist run against staging, then against prod after deploy.

**6.1 Run smoke-test checklist against local dev server**
Run every item in the Group 7d checklist on `localhost:5173` with the local Supabase Docker stack (or staging Supabase keys in `.env`). **The full end-to-end happy path must be executed using a fresh customer account AND a fresh shop account in one uninterrupted run** — not seeded/demo identities, not previously used test accounts. Seeded/reused accounts can hide onboarding, profile initialization, identity linkage, role-specific permission, and duplicate-record bugs that only appear on day-one users. Record each step with evidence (screenshot or log line).

Additionally, verify **legal-surface discoverability** as part of the smoke test: from the landing page nav/footer, both Terms of Service and Privacy Policy must be reachable in one click, must render, and must not contain content that is visibly misleading about current launch functionality (e.g., references to payments while payments are not live).

- Sign up a new customer end-to-end (Clerk → Supabase profile created).
- Submit a damage report with at least one photo upload.
- From a shop account, see the new report and submit a bid.
- From the customer account, accept the bid, confirm competing-bid auto-reject and job assignment.
- Receive the confirmation email (proves 7b is working).
- Open the navigation flow to the shop, confirm route and turn-by-turn work.
- Verify observability captures a deliberately-triggered error.
- Verify RLS by attempting direct Supabase client queries on protected tables from an unauthenticated browser console — must fail.

**6.2 Deploy to prod**

- Merge the hardening branch(es) to `main`.
- Deploy via chosen method (TBD — not blocking Phase 5/6 work).

**6.3 Re-run smoke-test checklist against prod**
Same checklist, against the live prod URL. Everything must pass.

**6.4 Soft launch**

- The loop is now survivable. Start inviting real users per the launch plan.
- First priority: one real transaction cleanly, end-to-end.

**Gate criteria:** Every smoke-test item passes on both staging and prod. No regressions from Phase 4 changes. Observability is catching real events. Emails are landing.

---

## Execution Discipline (Standing Rules)

1. **Verification-first.** Any destructive action (deletion, archival, source-of-truth change, removal of load-bearing code) must be verified against the live code in the current pass, not assumed from the plan. If verification contradicts the plan, stop and escalate. **Edge function corollary (added Pass 11a, 2026-04-15):** changes to any file under `supabase/functions/**` must be verified via a live cold-start (`supabase functions serve` or equivalent) before commit. `npm run build` and `tsc --noEmit` do **not** typecheck the Deno runtime — a file can compile clean under Vite and still fail to parse at edge function boot. Pass 10 shipped broken this way and the follow-up cleanup audit missed it. Live cold-start is the only authoritative check.
2. **North Star filter.** For every in-phase pass, ask: "Does this help one real transaction happen cleanly, end-to-end?" If no, defer to the Post-Launch Roadmap instead of shipping it.
3. **No scope expansion.** If a pass needs work beyond its stated scope, stop and document the addition as a new planned pass. Do not silently expand.
4. **Schema source of truth (Group 4b, updated Pass 871).** `supabase/migrations/` is the single authoritative schema source. Every schema-affecting change goes in a new migration file. `database_init.tsx` is a legacy cold-start safety net only — no new schema logic there. `database_schema_sql_*.ts` helpers are reference-only dead code.
5. **Launch Scope Guardrails are inviolable.** If execution wants to defer one, it must be explicitly reclassified with written justification in the Change Log. Otherwise they ship.
6. **Checkpoint gates are hard stops.** Do not begin the next phase until MolandJeus has reviewed the prior phase's gate criteria.

---

## Change Log

- **2026-04-14** — Document created. Groups 1, 2, 3 locked.
- **2026-04-14** — Group 4 locked after codebase verification. Two original recommendations (4b "delete TS generators", 4c "delete if dead") were overturned after finding both were load-bearing. Verification-first discipline established as ongoing rule (4d).
- **2026-04-14** — Group 5 locked. Execution order 5b → 5a → 5c. Launch-first pragmatism rule added to 5b to prevent identity cleanup from blocking RLS rollout. Companion doc `BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md` created to capture deferred work.
- **2026-04-14** — Launch Scope Guardrails section added after outside pressure-test caught drift risk: email delivery, observability, event capture quality, global error boundary, identity normalization for launch-critical tables, and RLS were at risk of being silently deferred. Explicitly locked as launch-scope non-negotiables. Post-Launch Roadmap updated with "intentional deferral only" rule and explicit "NOT allowed to drift into this doc" list.
- **2026-04-14** — Group 6 locked after codebase verification. All four orphaned components and four unused devtools verified truly unused. Corrections to original recommendations: (1) `DemoModeBanner` kept and reused for Group 3a banner requirement, (2) `MissingReportState` treated as legitimate product state requiring wire-in or immediate rebuild rather than deletion, (3) devtools wired selectively (only `EdgeFunctionStatus` and `RealtimeStatusIndicator` are hardening-critical; storage tools require validation before keeping), (4) `make-server-9f243523` confirmed load-bearing compatibility layer with 4 touchpoints and deferred to Post-Launch Roadmap rather than tackled now, (5) Atlanta QA pack to be converted to NY metro pack (one of few cleanup tasks with direct launch value).
- **2026-04-14** — Group 7 locked. Framed as launch-operability prerequisites, explicitly not general infra polish. 7a = Vercel previews pointed at staging Supabase config (minimal, not a second environment). 7b = RESEND verification + deploy + proof of one real end-to-end email. 7c = defer geocoding migration to post-launch with strict conditional trigger. 7d = prod-readiness smoke-test checklist added. **All 7 groups now locked. Ready to build Execution Plan.**
- **2026-04-14** — Execution Plan written. Six phases (0–6) with explicit checkpoint gates between each. Two key refinements from outside pressure-test adopted: (1) observability + global error boundary verification moved to Phase 1 so any breakage in later phases is immediately visible — "cannot harden what cannot be seen", (2) Group 3 trust surfaces split into higher-urgency 4A (demo banner, empty states, dead-button removal) and tightly-scoped 4B (market status layer with explicit scope limits to prevent mini-redesign). Execution Discipline standing rules added as guardrails against scope expansion, verification drift, and silent deferral.
- **2026-04-14** — Final pressure-test patches applied after adversarial review + codebase verification. Five flagged items bucketed: (1) **idempotency / duplicate-submission protection** — real plan gap, added as Phase 3.3 with narrow scope (report submit, bid create, bid accept, email side effects) and "verify or add" wording to prevent framework overbuild; (2) **rate limiting** — already covered in code (`rateLimiter.ts` wired at edge function middleware), added as Phase 0 verification task instead of new build; (3) **email trigger mapping table** — real plan gap, added to Phase 5.2 as trigger→recipient→template→timing→observed mapping covering all handlers in `notificationEmails.ts`; (4) **legal/trust surfaces** — Terms + Privacy pages already exist and are routed in `App.tsx`, added as Phase 0 audit + Phase 6.1 discoverability smoke test; (5) **dual-role fresh end-to-end** — partially covered, tightened Phase 6.1 to require fresh customer AND fresh shop in one uninterrupted run. **Bonus factual correction:** Sentry was flagged as "to install" in Phase 1.1 but is already fully wired (`initSentry()` in `main.tsx`, `errorReporting.ts` adapter, existing error boundaries routing through it). Phase 1.1 rewritten from "install" to "verify DSN + capture works end-to-end." Launch Scope Guardrails observability line corrected to match.
- **2026-04-14** — Ten refinements applied to Execution Plan after outside pressure-test: (1) Phase 0 gate now requires per-guardrail status label with evidence and owner action attached, (2) Phase 1.5 `.env` migration must preserve current runtime behavior exactly, (3) Phase 2.1 adapter layer narrowed to launch-critical models first, (4) Phase 2 gate rewritten to require auditable grep/typecheck proof scoped to launch-critical flows, (5) Phase 3.1 RLS verification must produce a per-table artifact (query/auth/expected/actual), (6) Phase 4A.2 waitlist storage requires semantic clarity over table reuse, (7) Phase 4B gate sharpened to one component + 2 approved surfaces + no new backend/realtime/layout, (8) Phase 5.1 staging choice criterion is test-data-cannot-leak-to-prod, not cheapness, (9) Phase 5.2 email proof adds sender-identity deliverability sanity, (10) Phase 5.3 Module Completion Matrix explicitly bounded as evidence-reflecting, not a second planning system, and Phase 6.1 smoke tests must use fresh accounts/records, not seeded identities.
- **2026-04-14** — Phase 0 completed (Pass 855). All 7 Launch Scope Guardrails audited with file:line evidence. Global error boundary already satisfied (3-tier). Email and Sentry code-wired but runtime deployment unverified. Event capture schema thin. Identity columns mixed across launch-critical tables. RLS enabled everywhere but legacy policies use `auth.uid()` not Clerk JWT.
- **2026-04-14** — Phase 1 execution started. Pre-1.1 env checks: `VITE_SENTRY_DSN` found in local `.env` with real DSN. `RESEND_API_KEY` not in local `.env` — logged for Phase 5.2. Phase 1.3: deleted `GoToAdminButton.tsx` and `AccountTypeMigrationModal.tsx` (0 imports confirmed). Phase 1.5: `.env` migration complete — `utils/clerk/info.tsx` and `utils/supabase/info.tsx` deleted, all 4 callers migrated to `import.meta.env`, docs updated (README.md, GETTING_STARTED.md, SUPABASE_SETUP_GUIDE.md, AppShell.tsx error copy). Phase 1.6: `DUAL_AI_COORDINATION.md` already archived (pre-satisfied). Privacy Policy placeholder status logged in Post-Launch Roadmap as D2.
- **2026-04-14** — Phase 1 completed. Phase 1.4: wired `EdgeFunctionStatus`, `RealtimeStatusIndicator`, and `StorageMonitor` into `AdminDashboard.tsx`. `StorageInspector` kept as standalone (overlaps with `StorageDebugPanel`). Phase 1.7: Atlanta QA pack converted to NY metro — 5 old files deleted (`atlantaQADestinations.ts`, `atlantaTestHubSeedData.ts`, `atlantaTestHubSeed.ts` + 2 tests), 5 new files created (`nyMetroQADestinations.ts`, `nyMetroTestHubSeedData.ts`, `nyMetroTestHubSeed.ts` + 2 tests). 45 destinations across 15 neighborhoods (Westchester, Rockland, Dutchess, Nassau, Orange, Putnam). 24 hub shop seeds. Imports updated in `ShopDirectoryQADrivePanel.tsx` and `navigationDestinationAdapters.ts`. All 4 NY metro tests pass. Build: 3.10s, 0 errors. Full test suite: 542 pass, 12 pre-existing failures in `bids.test.ts`/`reports.test.ts` (Supabase mock issues, unrelated).
- **2026-04-15** — Phases 2–4 + Phase 5 first attempt (Passes 856–870). Hardening work continued across adapter layer, RLS verification, idempotency, trust surfaces, market status, then Phase 5.1 staging Supabase project creation (`lhhdqycnhweaxqviwdqt`). Details in tracker Passes 856–870. Phase 5.1 execution via `supabase db push` blocked by PG17/uuid-ossp search_path incompatibility; fallback was a concatenated SQL blob pasted into the staging SQL editor. Pass 870 reported success; **this was a false positive** — see Pass 871 below.
- **2026-04-15** — **Phase 5.1 recovery (Pass 871).** User verification of staging found only `profiles` existed. Root cause audit revealed `supabase/migrations/` was never a complete schema source: six tables (`shop_interest_submissions`, `insurer_interest_submissions`, `platform_activity_events`, `public_partner_shops`, `job_assignments`, `estimate_requests`) and multiple Clerk-identity columns had been created only via `supabase/functions/server/database_init.tsx` and ad-hoc dashboard pastes from `database-setup/business_intake_and_activity.sql`, never captured as migrations. Any fresh environment built from `supabase/migrations/` alone would crash in migration 012. **Fix:** authored `supabase/migrations/011b_canonical_catchup.sql` — idempotent catchup creating all six missing tables, backfilling all drift columns on `profiles`/`vehicles`/`bids`, and adding required check constraints. Migrations folder now declared the single source of truth in `docs/SUPABASE_SETUP_GUIDE.md` §9; `database_init.tsx` demoted to "legacy cold-start safety net" status; modular `database_schema_sql_*.ts` helpers documented as reference-only dead code. Schema-sync rule in Execution Discipline (rule 4) should be read as "migrations folder is authoritative" going forward.
- **2026-04-15** — **Phase 5.1 closed (Pass 872).** Regenerated `staging_bootstrap.sql` with 011b slotted into correct lex position, re-ran against staging — all tables + routines (`find_shops_near`, `handle_updated_at`, `requesting_clerk_user_id`) verified present by user. **Separately:** 12 pre-existing test failures in `bids.test.ts`/`reports.test.ts` (logged at end of Phase 1 entry above) resolved by wrapping `requestSupabaseEdge` calls in try/catch with graceful fallbacks — the service layer's error contract now matches what tests asserted all along. `submitBid` and `updateBidStatus` changed to return `null` on missing `clerkUserId` instead of throwing. `saveDamageReport` intentionally left throwing (its test explicitly asserts "throws on network error"). Tests now 554/554. Working tree reorganized from ~90 uncommitted files into 7 logical commits (chore/migrations/docs-archive/code-batch/docs-batch/test-fix); branch 7 ahead of `origin/BidOnDent-Horizon-Beta`, user handles pushes manually. **Phase 5.1 is now actually complete.** Phase 5.2 (RESEND key deployment + real email proof), 5.3 (Module Completion Matrix — drafted in Pass 868), and remaining Phase 5.1 user-side items (Vercel preview env vars, `supabase functions deploy` to staging) are the next load-bearing blockers before Phase 6 can run.
- **2026-04-15** — **Migration collapse + local Docker (Passes 873–874, c2b44425).** The 27 incremental migrations were archived to `supabase/migrations/_archived/` and replaced by a single frozen baseline `20251230000001_full_schema.sql` (17 tables, 34 policies, all triggers, functions, indexes, storage buckets). Root cause for the collapse: sequential re-apply against a fresh DB reproducibly failed due to duplicate `CREATE TABLE`s, orphaned policies, double triggers, storage bucket privatization undone by a later file, and a migration that referenced tables only created by `database_init.tsx`. Local Docker Supabase stack now spins up from the single consolidated file via `supabase start`. Prod's `schema_migrations` still contains the old filenames, so `supabase db push` against prod would attempt to re-apply the consolidated file — **dashboard paste is the only supported path for prod schema changes until history is reconciled**. Doc drift corrected (Passes 873 `_archived/README.md` tombstone, `GETTING_STARTED.md`, `SUPABASE_SETUP_GUIDE.md` §9). Vercel dropped as Phase 5/6 blocker (Pass `b6fad46e`) — `localhost:5173` is the primary preview surface; staging is now exercised via dashboard + edge function deploy, not Vercel previews.
- **2026-04-15** — **Phase 5 smoke test restructure + RLS drift fixes (Passes 4–7).** Pass 4 restored the 3-run smoke test gate (Local Docker / Hosted Staging / Prod) after a single-run collapse was flagged — local Docker ≠ hosted staging for edge deploy, Resend, cold-start. Pass 5 fixed a P1 RLS drift: `database_init.tsx` was recreating old `auth.uid() = user_id`-only policies on every cold start, overwriting the frozen migration's Clerk-aware `requesting_clerk_user_id() OR auth.uid() = user_id` policies. Pass 6 added soft-delete RLS hardening migration `20260416000001_soft_delete_rls_hardening.sql` (applied to local Docker; **pending dashboard paste to staging + prod**). Pass 7 ran programmatic RLS/soft-delete/idempotency/event-capture verification against local Docker — all PASS, captured in `PHASE_6_SMOKE_TEST_CHECKLIST.md` Local Docker column.
- **2026-04-15** — **Bug 1 fix: `vehicle.year.trim is not a function` (Pass 8, commit 1c4f43a7).** Report-create crashed when selecting a saved vehicle. Root cause: `Vehicle.year` is `number` in the domain type but form state expects `string`; `StepVehicleInfo.tsx:33` called `.trim()` on the number. Fixed at the type contract boundary — `String()` wrap at form entry, `Number()` conversion at form exit. Browser-verified via VSCode browser-sharing. Regression grep found no other string-method-on-numeric-field bugs. Full dashboard walkthrough across all 3 roles (customer/shop/insurer) with no `ScreenErrorBoundary` fires.
- **2026-04-15** — **Bug 3 fix: report submission failure (Pass 9A, commit a27fb8a0).** Fresh end-to-end submission against PROD failed with "Failed to submit report." Root cause: `useReportForm.handleSubmitReport` was building `vehicleId` as `'vehicle-{timestamp}'` which the `damage_reports.vehicle_id` UUID column rejected. Fix: look up the matching saved vehicle's real UUID id, or pass `undefined` (→ `null` in DB). Defense-in-depth: `buildReportPayload` in `adapters.ts` now UUID-guards `vehicle_id` and `id` fields before they reach the DB. Also added 1-retry logic in `saveDamageReport` for transient PostgreSQL deadlock errors. Browser-verified end-to-end against PROD edge function.
- **2026-04-15** — **Report wizard UI polish (Pass 9B, commit 32a89668).** Replaced broken Unsplash car image with inline `CarDiagram.tsx` SVG (CSP-safe). All wizard step buttons rounded to `2xl` (16px). Photo step bottom bar spacing increased. **3rd design AI is actively iterating on `CarDiagram.tsx`** (zone paths now follow car silhouette, sheen/glass gradients, animated indicator) — uncommitted working state as of this entry. Main builder and auditor should not touch that file unless coordinating with the design AI.
- **2026-04-15** — **`database_init.tsx` runtime DDL removed (Pass 10, commit cc5475bd).** Collapsed 758 lines of runtime `CREATE`/`ALTER`/`DROP` DDL into 95 lines of validation-only code that checks 10 required tables + `requesting_clerk_user_id()` exist on cold start. Motivation: (1) frozen migration is already the single source of truth, (2) dropping/recreating policies during cold start opened temporary RLS gaps under concurrent traffic, (3) the old code only covered 7 of 17 tables and gave a false safety net for the rest. Retained the `CREATE OR REPLACE FUNCTION public.handle_updated_at()` block because it's idempotent and cheap. `handlers/health.ts` `migrateDatabase` also stripped of redundant `ALTER TABLE` DDL. **Not yet deployed to hosted staging or prod** — prod edge function still runs pre-Pass 5/10 code. Re-deploy is a user-side gate item.
- **2026-04-15** — **Audit correction flagged for Pass 11 planner.** The Pass 10 hand-off claimed "6 tables still lack RLS policies" (`shop_interest_submissions`, `insurer_interest_submissions`, `platform_activity_events`, `job_assignments`, `notification_preferences`, `shop_service_areas`). Audit re-verification found that claim is **wrong** — every one of those 6 tables already has at least one `CREATE POLICY` in `20251230000001_full_schema.sql`. The actual gap is `navigation_sessions`: RLS enabled, zero policies → effectively service-role-only access. Treat this as intentional (edge-function-only write path) or author a migration to scope it to `clerk_user_id`, not both. Pass 11 directive previously handed to main builder was written on the false premise and should be reissued.
- **2026-04-15** — **Pass 11a: P0 edge function boot failure fixed (commit a40a9315).** Builder AI found that Pass 10's `database_init.tsx` shipped with a type expression the Deno parser rejects: `let client: InstanceType<typeof (await import(...)).Client> = null` — `await` is not legal inside a `typeof` type query. Deno returned 503 on every request because the module failed to parse. The cleanup audit run earlier the same day missed it because `npm run build` and `tsc --noEmit` do not typecheck `supabase/functions/**` (it's a Deno runtime, not part of the Vite pipeline). Fix: replaced the inline type with a 4-method `PgClient` interface declared above the function. Verified via `supabase functions serve` — `/health` 200 OK, auth-guarded routes return 401 as expected, DB validation logs show all 10 required tables + `requesting_clerk_user_id()` verified. **Lesson (locked into Execution Discipline rule 1 below as an edge-function corollary):** edge function changes must be verified via live cold-start (`supabase functions serve`), not just `npm run build`.
- **2026-04-15** — **Pass 11b: Phase 3.2 event capture quality (commit c0f7fb40).** Three gaps closed in edge function event emission: (1) `user_profile_created` was missing on first-time customer signup — added fire-and-forget insert in `saveUserProfile` on the INSERT path, (2) `shop_profile_saved` and `insurer_profile_saved` were missing on network profile upserts — added fire-and-forget inserts in `saveShopProfile` / `saveInsurerProfile`, (3) `job_assignment_created` was logging `actor_id = payload.customer_user_id` (Supabase UUID) instead of the Clerk user ID from the authenticated session — fixed to use `session.clerkUserId` from `requireClerkSession()`. The `actor_id` fix is the most load-bearing: Clerk IDs are the identity source of truth for every other event type, so mixed-identity actor_ids would have silently broken admin journey reconstruction for job_assignment flows. **Retroactive note:** any `platform_activity_events` rows for job_assignment_created written before commit c0f7fb40 carry Supabase UUIDs in `actor_id` instead of Clerk IDs — joins against `profiles.clerk_user_id` will return zero hits for those legacy rows. No action required unless running retroactive queries. Phase 3.2 launch gate now satisfied across all 6 launch-critical flows.
