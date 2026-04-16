# BidOnDent — Post-Launch Roadmap

**Created:** 2026-04-14
**Companion to:** [LAW_HARDENING_PLAN.md](LAW_HARDENING_PLAN.md)
**Purpose:** Controlled holding area for everything deliberately deferred from the soft launch hardening phase. These items are not forgotten — they are intentionally sequenced _after_ the "one real transaction happens cleanly" milestone. Each entry lists _why it was deferred_, a concrete _trigger_ for when it should return, and a _priority band_ so the post-launch queue has real sequencing instead of a flat backlog.

> **For any AI or developer reading this:** treat this roadmap as a controlled holding area, not a second backlog. Items here are not automatically next. Re-open them only when their stated triggers fire, and do not use this doc to offload launch-scope hardening work. Immediate post-launch attention should go first to any deferred cleanup that directly reduces operational drag from launch, not to easy cosmetic or documentation tasks.

---

## Rules of this doc

1. **Nothing lands here by accident.** Every entry was a conscious "not now" decision during planning.
2. **Intentional deferral only, not discomfort-driven.** An item only belongs here if shipping without it still preserves **trust, correctness, and basic operability**. If the answer to "can we launch safely without this?" is no, it belongs in the Hardening Plan, not here. This doc must not become a graveyard for uncomfortable tasks.
3. **Every entry states its trigger** — the condition under which it should get picked up (time-based, milestone-based, or scope-based).
4. **Every entry carries a priority band** — one of `Immediate post-launch`, `Conditional`, or `Later / only if triggered`. Post-launch is not a flat queue.
5. **Deletions from this doc are allowed** — if a deferred item turns out to be obsolete, remove it with a changelog note.
6. **No execution details** — this is the "what and when" doc. The "how" lives in the hardening plan or in per-feature planning docs created at execution time.

**Specific items that are NOT allowed to drift into this doc:**

- Email delivery (RESEND deployment + verified sending) — launch-scope.
- Observability (Sentry or equivalent) — launch-scope.
- Event capture data quality (actor/object/timestamp/outcome on platform activity events) — launch-scope. Only the **dashboard UI** for viewing events is deferred (see S2), not the event data itself.
- RLS on user/business-relevant tables — launch-scope.
- Identity normalization on launch-critical tables — launch-scope. Only the broader non-critical cleanup (A3) is deferred.
- Global error boundary at the application root — launch-scope.

---

## Review cadence

Revisit this roadmap **immediately after soft launch is declared stable**, then again after **the first 10 real transactions OR the first meaningful user/support incident, whichever comes first**. After that, review on a monthly cadence or when any listed trigger fires. The goal is to prevent deferred items from being silently forgotten once launch energy shifts elsewhere.

---

## Priority band legend

- **Immediate post-launch** — should be picked up as the first work after soft launch stabilizes. These are things that directly reduce operational drag and were only deferred because launch-first pragmatism demanded it.
- **Conditional** — should be picked up only when a specific operational condition makes the tradeoff clearly favorable (e.g., the current approach starts causing visible friction).
- **Later / only if triggered** — should not be started unless the stated trigger fires. These are explicitly not assumed next steps.

---

## Architecture & Code Quality (Post-Launch)

### A1. Full type system merge to one canonical set — **Conditional → Immediate post-launch candidate**

- **Deferred from:** Group 4a (chose adapter layer at service boundary for launch)
- **Why deferred:** Full merge is 2–4 days of refactor across 100+ files — too expensive pre-launch, too risky to land during a trust-hardening phase.
- **Target state:** No parallel DB/UI type authorities remain. Adapter layer is either removed entirely or reduced to external-boundary-only translation. Type conflicts (naming, primitive mismatches like `Vehicle.year` string vs number) are eliminated. Domain types are the single source of truth across the app.
- **Trigger:** When the adapter layer proves painful (e.g., mapper-drift bugs, new features consistently bottlenecking on type gymnastics). If the adapter layer stays healthy, this does not need to happen.
- **Audit evidence (Pass 10 cleanup, 2026-04-15):** `npx tsc --noEmit` currently reports **49 pre-existing type errors**, all concentrated at the `src/app/types/index` (domain) vs `src/app/services/supabase/types` (DB) boundary. Representative failures: (a) `useUserDataLoader.ts:116/149` — mapping functions typed against the domain `Bid`/`DamageReport` receive the DB variant with different required fields (`estimated_days`, `vehicle_make`, etc.), (b) `DashboardSecondaryViews.tsx:105,273,278` and `useDashboardData.ts:102,138,152` — code reads `zip_code`/`damage_report_id`/`report_id` off what TypeScript believes is the domain type. These are **silent Bug 1 waiting to happen** — the build succeeds only because `tsc` errors do not fail the build pipeline. After launch stabilizes, this is strong evidence the trigger has already fired; consider promoting to Immediate post-launch. Until then, catalog any new bug whose root cause touches this boundary (the Pass 8 `vehicle.year.trim` crash is the canonical example).

### A2. Codegen for schema bootstrap helpers from SQL migrations — **Mostly resolved (Pass 871/878/10)**

- **Deferred from:** Group 4b (originally chose to retain `database_schema_sql_*.ts` as temporary runtime bootstrap helpers during soft launch).
- **Update (Pass 871):** Drift audit revealed the modular `database_schema_sql_*.ts` helpers were never consumed by any runtime path. Helpers are reference-only dead code. Pass 878 deleted them, resolving the dual hand-written authority problem.
- **Update (Pass 10, 2026-04-15):** `database_init.tsx` no longer runs DDL at all. It is now a 95-line validation-only function that checks required tables + `requesting_clerk_user_id()` exist on cold start. `handlers/health.ts migrateDatabase` also stripped of redundant `ALTER TABLE` DDL. The drift surface from this file is now effectively zero.
- **Remaining:** Decide whether `database_init.tsx` validation should be (a) kept as a cold-start safety net, (b) moved to a CI check instead of a runtime check, or (c) removed entirely once hosted staging + prod edge function deploys are stable and observability would catch schema validation failures elsewhere.
- **Trigger:** Post-launch stabilization, or as part of cold-start latency audit (the validation adds a round-trip to Postgres on every edge function boot).

### A3. Broader identity column cleanup — **Immediate post-launch**

- **Deferred from:** Group 5b (chose launch-first pragmatism — unify on `clerk_user_id` for launch-critical tables first, finish broader cleanup after)
- **Why deferred:** Full sweep across every table risks snowballing and eating the rest of Group 5 security work. Better to normalize launch-critical scope first, then finish non-critical tables after soft launch.
- **⚠️ Strict scope clarification:** Launch is NOT allowed to ship with unresolved identity ambiguity in launch-critical tables or RLS-relevant flows. A3 is cleanup of **leftover non-critical residuals only** — it is **not** a permission slip for leaving core flows half-done. If any launch-critical table still has inconsistent identity columns at launch time, that work is in the Hardening Plan, not here.
- **Target state:** Every table in the database uses `clerk_user_id` (TEXT) as its identity column. No `user_id` UUID columns remain from the legacy Supabase Auth attempt.
- **Trigger:** Immediately after soft launch stabilizes, as a dedicated cleanup pass.

### A4. Bridge Clerk users to Supabase Auth — **Later / only if triggered (alternative future)**

- **Status:** This is an **alternative future**, not an assumed future. Listed here so it is not forgotten, not because it is approved.
- **Why deferred:** Group 5b's orthodox option was to bridge Clerk users into `auth.users` via webhook, then use `auth.uid()` in RLS policies. This is the "correct" Supabase pattern but 2–3 days of work plus webhook infra. Locked out of launch scope AND locked out as a default next step.
- **Target state:** Every Clerk user has a corresponding Supabase auth user row. RLS policies use `auth.uid()` natively.
- **Trigger:** Only if the `clerk_user_id` TEXT approach proves awkward for RLS or joins over an extended period, AND the team consciously decides to change identity direction. Do not start this speculatively.

---

## Security & Data (Post-Launch)

### S1. Admin restore UI for soft-deleted records — **Conditional**

- **Deferred from:** Group 5c (chose minimal soft delete — `deleted_at` + query filters only for launch)
- **Why deferred:** Admin UX work is not launch-critical. The minimal backend implementation gives the audit trail and recovery capability.
- **Interim recovery path (required at launch):** Until the admin restore UI exists, restoration must be possible via a **documented direct database or admin procedure**. Having recoverable data is not enough if there is no remembered path to actually restore it. The documented procedure lives in the hardening plan's launch readiness notes.
- **Target state:** Admin dashboard exposes a "Deleted records" view with filter, preview, and one-click restore for reports, bids, job assignments, and vehicles.
- **Trigger:** First real incident requiring a restore, OR when regular admin/support users need self-service recovery.

### S1b. `navigation_sessions` RLS policy review — **Immediate post-launch (non-blocking)**

- **Discovered:** Pass 10 cleanup audit (2026-04-15)
- **Finding:** `public.navigation_sessions` has `ENABLE ROW LEVEL SECURITY` but zero `CREATE POLICY` entries in `20251230000001_full_schema.sql`. Under Postgres semantics this means the table is effectively service-role-only — authenticated clients cannot read, write, or delete rows directly, even their own.
- **Why this is safe for launch:** All navigation session writes flow through the `server` edge function (service role bypasses RLS). No client-side code reads this table directly. Launch flows are not affected.
- **Why it still needs review:** An intentional "service-role-only" posture should either be (a) documented in a migration comment explaining _why_ no client policies exist, or (b) replaced with an explicit client-scoped policy so the intent is machine-verifiable and not an accident of drift. The current state reads like an omission even when it is not.
- **Target state:** Either a documented `/* intentional: service-role only, see roadmap S1b */` comment in the migration, or a `requesting_clerk_user_id()`-scoped SELECT/INSERT/UPDATE/DELETE policy set written in a new migration file.
- **Trigger:** First post-launch security review, or the first time a client feature needs to read navigation sessions directly.

### S1c. Production `schema_migrations` history reconciliation — **Immediate post-launch (high priority)**

- **Discovered:** Pass 871 archival + Pass 873 consolidation (2026-04-15)
- **Finding:** Prod's `supabase_migrations.schema_migrations` table still contains the 27 old filenames from the incremental migration era (e.g. `024_clerk_jwt_rls_policies`), while the repo at HEAD only contains the consolidated `20251230000001_full_schema.sql`. This means `supabase db push` against prod will see the consolidated file as a new migration, try to re-apply it, and fail with "already exists" errors. Every schema change to prod is currently forced through dashboard paste.
- **Risk:** (a) human error in a dashboard paste is higher than in `db push`, (b) no idempotent replay path for prod schema, (c) drift between what's in `schema_migrations` and what's actually in the schema is invisible.
- **Target state:** Prod's `schema_migrations` table either (i) has the 27 old rows replaced with a single row referencing `20251230000001_full_schema.sql`, or (ii) has a synthetic row inserted so `supabase db push` thinks the consolidated file has already been applied and moves on to future migrations. Pick whichever approach keeps the `supabase/migrations` folder as the single forward-looking source of truth.
- **Blocker pattern to preserve until fixed:** New migration files landed alongside the frozen baseline (e.g. `20260416000001_soft_delete_rls_hardening.sql`, any future Pass 11 RLS work) must be applied to prod via dashboard paste until `schema_migrations` is reconciled. Anyone running `supabase db push` against prod before this is fixed will get an error and may assume the migration itself is broken.
- **Trigger:** Immediately post-launch. This is infrastructure debt that compounds — every new migration widens the gap.

### S2. Audit logging dashboard — **Conditional**

- **Deferred from:** Group 5c (chose minimal soft delete — no elaborate audit dashboard for launch)
- **Scope clarification:** Deferred item is **dashboard UI only**. Required event fields for launch (captured as a Launch Scope Guardrail in the Hardening Plan) remain **actor, object, object type, timestamp, event type, and outcome status**, with enough JSON context to reconstruct a user's journey. The data is launch-scope; the pretty surface for viewing it is not.
- **Why deferred:** `platform_activity_events` table exists but there's no UI to query it. Launch needs the data to be correct, not the UI to be pretty.
- **Target state:** Admin dashboard exposes a filterable, searchable activity log with drill-down per user, per report, per bid.
- **Trigger:** First real support request that requires reconstructing a user's journey.

---

## Feature Expansion (Phase 4)

### F1. Payment processing / billing — **Later / only if triggered**

- **Deferred from:** Group 1b (chose harden-and-activate over Phase 4)
- **Why deferred:** Payments are Phase 4. The soft launch is a free marketplace. Adding payments before proving the loop works is premature.
- **Target state:** Customers pay shops through the platform. Planning doc exists at `docs/PAYMENT_MODEL_DESIGN.md` (if still current — verify before executing).
- **Trigger:** After real transactions have flowed through the free loop AND the market has signaled willingness to pay. The Coming Soon waitlist captures from Group 3c are the signal channel.

### F2. Push notifications — **Later / only if triggered**

- **Deferred from:** Group 1b / Group 3c (waitlist captures demand signal)
- **Why deferred:** In-app realtime notifications already work. Email is launch-scope (see Launch Scope Guardrails) and is NOT in the same category as push. Push is the third tier and needs FCM/APNs setup plus service worker wiring.
- **Target state:** Web push notifications for shops ("new job nearby") and customers ("new bid received").
- **Trigger:** When shop engagement drops off due to missed in-app notifications, OR when the waitlist signal is strong enough to justify the infra work.

### F3. Advanced analytics / reporting dashboard — **Later / only if triggered**

- **Deferred from:** Group 1b
- **Why deferred:** No dashboard analytics exist. Launch does not need them.
- **⚠️ Do not confuse with observability:** Business analytics remain deferred. Production error visibility and operational telemetry (Sentry or equivalent) are already launch-scope per the Launch Scope Guardrails and must not be displaced by dashboard work. "Analytics dashboard" ≠ "observability" ≠ "product analytics" — keep the three separate when scoping any future work here.
- **Target state:** Admin and per-account-type dashboards showing volume, conversion, time-to-bid, acceptance rates, shop performance, etc.
- **Trigger:** When enough data has accumulated to justify dashboards (post soft launch, after real usage).

### F4. Offline mode / offline-first data — **Later / only if triggered**

- **Deferred from:** Group 1b
- **Why deferred:** Online/offline detection exists. Actual offline-first data (IndexedDB, sync queues) is a major architectural undertaking.
- **Target state:** Core flows work offline, sync when reconnected.
- **Trigger:** When real users report disruptions from connectivity loss (unlikely to be a top complaint at soft launch scale).

---

## Legacy Compatibility Cleanup (Post-Launch)

### L1. Remove `make-server-9f243523` legacy edge function alias — **Immediate post-launch**

- **Deferred from:** Group 6c
- **Why deferred:** Verified as a live backward-compatibility layer with four touchpoints: runtime constant in [src/app/services/supabase/runtime.ts:8](src/app/services/supabase/runtime.ts#L8), path-stripping logic in [supabase/functions/server/utils/helpers.ts:65-67](supabase/functions/server/utils/helpers.ts#L65-L67), deploy command in `docs/SUPABASE_SETUP_GUIDE.md:412`, and canonical docs reference. Not launch-critical cleanup — classic "cleaner-looking but not helpful for launch" work.
- **Target state:** No references to `make-server-9f243523` anywhere in code, docs, or deploy pipeline. The legacy function is un-deployed from Supabase.
- **Trigger:** After soft launch is stable, as part of a compatibility cleanup pass. Before removing, verify no external tools, webhooks, or bookmarked URLs are still hitting the legacy namespace.

---

## Infrastructure (Post-Launch)

### I1. Geocoding provider migration (Nominatim → paid provider) — **Later / only if triggered**

- **Deferred from:** Group 7c
- **Why deferred:** Nominatim works for low volume. Paid providers cost money and require key management. Not worth the switching cost until usage creates actual pain.
- **Target state:** Production geocoding via Google, Mapbox, or similar paid provider.
- **Trigger:** When rate limiting, reliability degradation, or actual request volume causes **user-visible failures, slowdowns, or manual throttling workarounds**. Not abstract rate-limit warnings. Not "professionalism." Real observable pain — slowness, fragility, support complaints, or hard failures.
- **Soft future preference (not a lock):** Mapbox if the priority is a developer-friendly mapping/geocoding ecosystem fit, Google if the priority is broadest enterprise reliability / mature geocoding depth. Decision remains open until the trigger fires.

---

## Documentation Cleanup (Post-Launch)

### D1. Consolidate duplicated documentation content — **Later**

- **Deferred from:** Planning cleanup discussion
- **Why deferred:** The 14 active docs have significant overlap (architecture rules in 4+ places, map status in 4+ places). Consolidation is low-risk but time-consuming and doesn't help ship. Also: doc consolidation is the classic "productive-looking work that doesn't help users" trap.
- **Target state:** Each major topic has **one canonical source document**. Secondary docs contain only summary + links, not duplicated operational rules. No topic has its operational rules defined in more than one place.
- **Trigger:** Post soft launch, as part of a general documentation pass, AFTER higher-priority post-launch items (A3, L1) are complete.

### D2. Finalize Privacy Policy content — **Immediate post-launch**

- **Deferred from:** Phase 0 Pre-flight audit (Pass 855). Privacy Policy page exists and is routed ([PrivacyPolicyPage.tsx](../src/app/components/legal/PrivacyPolicyPage.tsx)), but content is an honest placeholder ("being finalized by our legal team") with a 4-bullet summary.
- **Why deferred:** Placeholder is not misleading — it accurately states the policy is being finalized. Acceptable for soft launch at low user volume. Not acceptable before scale or marketing push.
- **Target state:** Full privacy policy content covering data collection, usage, sharing, retention, user rights, and cookie/tracking disclosure. Reviewed by legal counsel if available.
- **Trigger:** Before any marketing push, paid acquisition, or public PR that would drive significant new user volume. Also trigger if any user or regulatory inquiry references the privacy policy.

---

## Not Approved as Assumed Next Steps

This section exists to prevent roadmap items from silently becoming inevitabilities. Future AI or devs reading this roadmap must understand that **listing something here does NOT approve it as the next default action.**

- **Bridging Clerk to Supabase Auth (A4)** is NOT an approved default path. It is an alternative future only, triggered by sustained pain with the current `clerk_user_id` approach.
- **Geocoding provider migration (I1)** is NOT approved preemptively. It is conditional on actual user-visible pain with Nominatim.
- **Full type merge (A1)** is NOT an automatic post-launch default if the adapter layer remains healthy. It is conditional on adapter pain.
- **Documentation consolidation (D1)** is NOT a launch-adjacent substitute for product hardening. It is explicitly lower priority than A3 and L1.
- **Payment processing (F1), push notifications (F2), analytics dashboards (F3), and offline mode (F4)** are NOT the next things to build post-launch. They are the next things to build **after** real signal from real users demands them.

If an AI or dev finds themselves about to start work on one of these items without a fired trigger, stop and escalate. Silent activation of a "not approved" item is a planning-discipline failure.

---

## Change Log

- **2026-04-14** — Document created alongside the Soft Launch Hardening Plan. Seeded with deferred items from Groups 1–5.
- **2026-04-14** — Nine refinements applied after outside pressure-test: review cadence added, priority bands introduced (Immediate post-launch / Conditional / Later), target state language tightened on A1/A2/D1, A3 stricter wording to prevent excuse-for-leaving-critical-messes-unfinished, S1 interim recovery path required, S2 minimum event fields explicitly referenced, F3 distinguished from observability, I1 trigger sharpened to user-visible pain, "Not Approved as Assumed Next Steps" section added as final anti-drift guardrail. Front-matter now explicitly frames the doc as a controlled holding area, not a second backlog.
- **2026-04-14** — D2 added: "Finalize Privacy Policy content" (Immediate post-launch). Privacy Policy page exists and renders but content is an honest placeholder. Flagged during Phase 0 Pre-flight audit (Pass 855). Acceptable for soft launch; must be completed before scale or marketing push.
- **2026-04-15** — Pass 10 cleanup audit additions: (a) A1 expanded with TypeScript type drift evidence — `tsc` reports 49 pre-existing errors at the domain/DB type boundary, reframed as near-Immediate; (b) A2 updated to reflect Pass 10's conversion of `database_init.tsx` to validation-only; (c) new **S1b** added — `navigation_sessions` has RLS enabled with zero policies, effectively service-role-only, needs intent documentation or explicit policies; (d) new **S1c** added — prod's `schema_migrations` still contains the 27 old incremental filenames, blocking `supabase db push` against prod until reconciled, flagged as high-priority Immediate post-launch infra debt.
