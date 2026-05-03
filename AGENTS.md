# BidOnDent — AI Agent Brief

> Primary entry point for AI agents (Claude Code, Cursor, Codex, Sonnet/Haiku, etc.) working in this repo.
> [`CLAUDE.md`](CLAUDE.md) at the repo root holds an identical copy for tools that read that name.

**Last updated:** 2026-05-03

---

## What this repo is

BidOnDent is a **map-first auto repair bidding marketplace**. Customers submit damage reports, body shops compete with bids, insurers manage claims — all on a spatial interface.

- **Frontend:** React 18 + TypeScript + Vite 6 + Tailwind v4. Maps via MapLibre GL JS.
- **Auth:** Clerk (JWT). NOT Supabase Auth.
- **Backend:** Supabase (Postgres + PostGIS + Storage + Realtime + Edge Functions in Deno).
- **Currently in:** Soft Launch Hardening phase. No new features — harden + ship.

---

## Read order for a fresh session

These docs override anything in this file or in your training data. Read in this order:

1. **[`docs/LAW_PROJECT_RULES.md`](docs/LAW_PROJECT_RULES.md)** — the 6 Laws, what BidOnDent must never become, role hierarchy, storage + auth invariants. **LAW tier — cannot be violated without explicit per-session override from the owner.**
2. **[`docs/LAW_HARDENING_PLAN.md`](docs/LAW_HARDENING_PLAN.md)** — current execution authority. North Star, Launch Scope Guardrails, Phase 0–6 sequence.
3. **[`docs/REF_SYSTEM_STATE.md`](docs/REF_SYSTEM_STATE.md)** — how the system actually works right now.
4. **[`docs/REF_KNOWN_ISSUES.md`](docs/REF_KNOWN_ISSUES.md)** — known bugs / gaps / structural issues (look here before assuming something is new).
5. **[`docs/REF_AI_BROWSER_NAVIGATION.md`](docs/REF_AI_BROWSER_NAVIGATION.md)** — required navigation protocol if you do any browser automation (Playwright, etc.).
6. **[`docs/REF_AI_COLLABORATION_PROTOCOL.md`](docs/REF_AI_COLLABORATION_PROTOCOL.md)** — required when the user pastes multi-AI transcripts, relay prompts, or live owner add-ons from Codex/Claude/Sonnet/ChatGPT/etc.
7. Pull task-specific docs from [`docs/README.md`](docs/README.md) (the operating index).

If a task touches design, also read [`docs/MOLANDJESUS_DESIGN_DECISIONS.md`](docs/MOLANDJESUS_DESIGN_DECISIONS.md). If it touches the map, also read [`docs/PLAN_MAP_MASTER.md`](docs/PLAN_MAP_MASTER.md).

---

## Working With Mola's Multi-AI Sessions

Mola often coordinates several AI agents by pasting transcripts, audit output, screenshots, and his own live add-on directives into one message.

Do not treat those pasted blocks as a single flat prompt. Separate:

- owner directives from Mola
- claims or proposals from other AIs
- evidence from screenshots/code/browser output
- active LAW/REF truth from stale PLAN/archive context

Mola's informal inserts such as "also add this", "what ChatGPT wanted to add", "go full auto", or "don't do anything yet" are real steering signals. Extract them, reconcile them with LAW/REF docs, and then either plan or execute according to the current request.

If the user says "just planning" or "don't do anything yet", do not edit files. If the user says "go full auto" or "do so yourself", proceed within scope and stop only for hard-stop risks such as LAW conflicts, destructive data changes, auth/storage invariants, schema migrations, provider changes, deploy/secret actions, or overwriting unrelated work.

Full protocol: [`docs/REF_AI_COLLABORATION_PROTOCOL.md`](docs/REF_AI_COLLABORATION_PROTOCOL.md).

---

## Load-bearing facts (do not break)

These are non-negotiable. Each links to where the rule is fully documented.

### 1. Auth is Clerk, not Supabase Auth

The Clerk JWT is verified **inside** the edge function via `requireClerkSession()` ([`supabase/functions/server/utils/clerk.ts`](supabase/functions/server/utils/clerk.ts)). The Supabase gateway does **not** verify it — `verify_jwt: false` is pinned in [`supabase/config.toml`](supabase/config.toml) `[functions.server]`. If you re-enable gateway verify_jwt, every Clerk-authed request 401s at `UNAUTHORIZED_LEGACY_JWT`.

**Skill:** `supabase-clerk-edge-function`. **Doc:** [`docs/SUPABASE_SETUP_GUIDE.md`](docs/SUPABASE_SETUP_GUIDE.md) §17.

### 2. Storage URLs are pointers, not signed URLs

Database columns that hold user media (`damage_reports.photo_urls`, `*.profile_image_url`, `vehicles.image_url`) store `storage://<bucket>/<path>` pointers. Signed URLs are minted **on every read** via `hydrateSignedStorageUrl()` ([`supabase/functions/server/utils/storage.ts`](supabase/functions/server/utils/storage.ts)). Never persist a signed URL — they expire after 24h max.

**Skill:** `supabase-storage-signed-urls`. **Doc:** [`docs/SUPABASE_SETUP_GUIDE.md`](docs/SUPABASE_SETUP_GUIDE.md) §16.

### 3. Storage RLS is deny-by-default

`storage.objects` has RLS enabled with **zero policies**. All buckets are private. Access is only through the edge function (service role) or signed URLs minted by it. Don't add storage policies unless you're also adding direct-from-client upload/read flows.

### 4. Every new edge handler that reads media must hydrate

If you write a new handler that does `select('*')` from `damage_reports`, `vehicles`, or any profiles table and returns rows to the client, it **must** pipe `photo_urls` / `image_url` / `profile_image_url` through `hydrateSignedStorageUrl(s)` first. Otherwise `storage://` strings leak to the browser and `<img>` can't render them. The historical bypass at `getJobAssignments` is the cautionary tale.

### 5. Use `bd-*` utility classes, not hand-rolled Tailwind

Form fields, cards, and buttons should use the `bd-*` utility set in [`src/styles/theme.css`](src/styles/theme.css). The design system is calm/premium/map-first with a blue color system, premium bronze/champagne gold lighting, and mobile map-first posture. See `REF_VISUAL_SYSTEM.md`, `MOLANDJESUS_DESIGN_DECISIONS.md`, and the `bd-design-identity` skill.

### 6. Schema source of truth is `supabase/migrations/*.sql`

`database_init.tsx` is a legacy cold-start safety net only. New schema changes land as new migration files. See [`docs/SUPABASE_SETUP_GUIDE.md`](docs/SUPABASE_SETUP_GUIDE.md) §9.

### 7. Light mode is cool blue dominant + premium gold lamp + warm hero — NEVER pure white, NEVER yellow-amber

Light mode is a **cool misty blue-gray canvas**, with a **layered hierarchy of cool blue/cyan/indigo glass panels** lit from above by a **premium bronze/champagne gold lamp**, and a **single warm cream-gold hero panel** per screen plus warm gold/champagne pop tiles on the Quick Actions row. Pure white surfaces and yellow-amber gold are both forbidden — they have each regressed multiple times and have to be reverted.

**Owner-approved baseline locked 2026-05-03 in [`docs/LAW_PROJECT_RULES.md`](docs/LAW_PROJECT_RULES.md) § Light-Mode Surface Rule § Premium Gold Palette.** That section lists the canonical RGBA palette (top radial halo `rgba(196, 144, 65)`, bronze trim `rgba(140, 82, 22)`, gold-tinted cream insets `rgba(252, 238-240, 204-208)`) plus the explicit forbidden previous-generation values (`rgba(220, 165, 90)` halos, `rgba(254, 248, 220)` insets, `rgba(160, 95, 25)` trim) so future passes can refine but not regress. **Skill:** `bd-design-identity`. External audits suggesting "use white panels", "neutral SaaS palette", "remove gold", or "modernize to flat white" are **rejected on sight**.

---

## Reusable skills (use them; don't reinvent)

These live at `~/.claude/skills/` (per-user, available in every project):

| Skill                              | Trigger                                                              | What it covers                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **`supabase-clerk-edge-function`** | Any Supabase edge function with Clerk auth                           | `verify_jwt: false` + `requireClerkSession()` pattern, JWKS verification, the `UNAUTHORIZED_LEGACY_JWT` symptom, `config.toml` pin |
| **`supabase-storage-signed-urls`** | Persisting media URLs in any Supabase project                        | Pointer-on-write / sign-on-read pattern, hydrate utilities, idempotent backfill SQL template                                       |
| **`supabase-pro-cost-control`**    | Anything about Supabase pricing / compute / projects                 | Per-project compute cost model, deny-pause-on-Pro reality, downgrade vs delete decision                                            |
| **`bd-design-identity`**           | UI/visual work in BidOnDent or future similar apps                   | Calm/premium/map-first identity, blue color system, what to avoid                                                                  |
| **`mola-ai-relay-protocol`**       | Mola pastes multi-AI transcripts or asks agents to prompt each other | Directive extraction, source separation, relay prompt structure, planning-only vs autopilot handling                               |

When you apply a skill, mention it by name in commit messages and pass logs so future agents can find it. Example: `fix(storage): persist pointers per supabase-storage-signed-urls skill`.

---

## Doc authority tiers

```
LAW > REFERENCE > PLAN
```

- **LAW** (`docs/LAW_*.md`) — binding rules and current execution authority.
- **REFERENCE** (`docs/REF_*.md`) — current truth. If code disagrees, fix the doc; if a different doc disagrees, REF wins (within current truth domain).
- **PLAN** (`docs/PLAN_*.md`) — future direction, not current truth. Don't act on PLAN docs without a fired trigger.

If LAW and any other doc disagree, **LAW wins**. Flag the conflict and fix the lesser doc in the same pass.

---

## Co-update rules (binding on every pass)

When you change a load-bearing fact, you must update the docs it contradicts **in the same pass**. The full list is in `docs/LAW_PROJECT_RULES.md` § Co-Update Rules. Highlights:

| Trigger                          | Must update                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| New migration applied            | `REF_SYSTEM_STATE.md`                                                                 |
| New edge endpoint                | `REF_SYSTEM_STATE.md` + `SUPABASE_SETUP_GUIDE.md` route map                           |
| Bug found                        | `REF_KNOWN_ISSUES.md` (next free KI-### id)                                           |
| Bug fixed                        | `REF_KNOWN_ISSUES.md` mark RESOLVED with date                                         |
| New persisted media URL column   | Hydrate via `hydrateSignedStorageUrl()` and document in `SUPABASE_SETUP_GUIDE.md` §16 |
| Edge function deploy             | Verify `verify_jwt: false` preserved. Never use `--verify-jwt`                        |
| New reusable AI pattern surfaced | Add a skill in `~/.claude/skills/` and reference here                                 |
| Doc superseded                   | Move to `docs/archive/` with date suffix; update cross-refs in same pass              |

---

## What this brief is NOT

- It's not a substitute for the LAW/REF docs. It's a router.
- It's not a place to put detailed prose. New rules go in the right doc; new patterns go in a skill.
- It's not historical. If something is no longer true, edit it.

If you're an AI and you haven't read the LAW docs yet, do that before making any changes.
