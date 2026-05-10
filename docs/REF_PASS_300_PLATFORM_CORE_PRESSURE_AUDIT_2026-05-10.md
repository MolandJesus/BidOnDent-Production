# REF — Platform-Core Pressure Audit + Anti-Extraction Discipline (Pass 300, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #23 (Phase E Priority A: BEFORE second extraction, audit the new platform-core boundary itself; establish anti-extraction discipline).
**Tier:** REF.
**Source modification:** ZERO. No extractions. No edits. Pure read-only audit applying anti-extraction lens.
**Companion to:** [`REF_PASS_299_FIRST_SEAM_EXECUTION_2026-05-10.md`](REF_PASS_299_FIRST_SEAM_EXECUTION_2026-05-10.md) (the live extraction this pass audits the consequences of); [`REF_PASS_295`](REF_PASS_295_TIER_A_DOCTRINE_DEEP_DIVE_2026-05-10.md), [`REF_PASS_296`](REF_PASS_296_TIER_A_DOCTRINE_DEEP_DIVE_BATCH_2_2026-05-10.md), [`REF_PASS_297`](REF_PASS_297_TIER_B_DOCTRINE_DEEP_DIVE_BATCH_1_2026-05-10.md) (the prior classifications this pass re-examines).

---

## §1. Premise — relay #23 mission shift

Relay #23 explicitly reframed the architectural risk profile:

> *"The greatest danger is no longer: 'failure to modularize.' The greatest danger is now: successful modularization creating silent centralization pressure."*

> *"This is where most systems begin accidentally centralizing authority. Do NOT allow that drift."*

> *"The repo now needs anti-extraction discipline, NOT merely extraction capability."*

Pass 299 succeeded mechanically. The seam works. The platform-core/ folder exists. The README codifies sprawl resistance. **And precisely because of that success, the appetite to extract more is now elevated.**

This pass formalizes the **anti-extraction filter** — a mechanism for refusing extractions that would damage doctrine locality even when they look mechanically clean.

---

## §2. The four anti-extraction risk lenses

Beyond the existing 7-question framework (Pass 295), four NEW filters apply to every candidate:

### 2.1 Centralization-pressure risk

Extraction creates a "platform owner" of something that should remain consumer-owned.

*Symptom:* extracting forces the platform to make a choice on behalf of all future consumers when each consumer should make that choice independently.

*Example:* extracting Sentry init makes the platform "own" the observability stack. Stacey may not want telemetry at all, or want LogRocket, or want Honeybadger. The platform shouldn't decide.

### 2.2 Doctrine-loss risk

Extraction separates code from co-located doctrine.

*Symptom:* the file's behavior depends on context (CLAUDE.md fact, LAW invariant, hidden invariant from another pass) that travels poorly across repo boundaries.

*Example:* `ImageWithFallback` knows about `storage://` (CLAUDE.md fact #2). Extracted, the next reader doesn't know why that prefix matters. The doctrine doesn't travel.

### 2.3 Folder-gravity risk

Extracting one creates pressure to extract many.

*Symptom:* the candidate is structurally identical to N other files. Extracting one establishes a precedent that pulls the others along.

*Example:* extracting one shadcn primitive (e.g. `button.tsx`) creates immediate pressure to extract all 49. That pressure produces `platform-core/ui/` — exactly the "mega shared folder" relay #21 prohibited.

### 2.4 Hidden-consumer-doctrine risk

Extraction forces the consumer to adopt doctrine they don't yet have.

*Symptom:* using the extracted code requires the consumer to accept a vendor, a convention, or a runtime contract.

*Example:* extracting `useServiceWorkerUpdate` forces consumers to adopt vite-plugin-pwa. Stacey may use a different PWA library or no PWA at all.

---

## §3. Re-examining prior classifications under the anti-extraction lens

Each prior-classified candidate from Passes 295-296 is re-examined. NEW classifications added below:

| Candidate (prior verdict) | Pass 300 anti-extraction verdict | Lens triggered |
|---|---|---|
| **`cn` utility** (A-PURE, EXTRACTED Pass 299) | ✅ EXTRACTED — confirms the model works for true A-PURE | none — clean |
| **shadcn UI primitives 48/49** (A-PURE) | ⚠️ DO NOT BULK-EXTRACT | Folder-gravity (§2.3) — extracting all 48 creates `platform-core/ui/` mega-folder |
| ↳ Same, individual primitives on demand | ✅ Each safe IF Stacey actually needs each one | Extract 1-at-a-time per Stacey requirement only |
| **NotificationToast** (A-cosmetic) | ⚠️ DO NOT EXTRACT YET | Doctrine-loss (§2.2) — depends on Notifications system which is A-DOCTRINE; extracting independently splits the toast from its category enum |
| **Theme system** (A-DOCTRINE) | 🛑 DO NOT EXTRACT — already gated on owner-decision Pass 295 §7 #2 | Centralization-pressure (§2.1) + hidden-consumer-doctrine (§2.4) — token architecture is owner-decision territory |
| **Motion system / animations.css** (mixed) | ⚠️ DO NOT EXTRACT YET (any subset) | Doctrine-loss (§2.2) — reduce-motion contract per Pass 284 must travel; orb atmosphere keyframes carry BD emotional DNA |
| **ImageWithFallback** (A-DOCTRINE) | 🛑 DO NOT EXTRACT | Doctrine-loss (§2.2) — `storage://` knowledge is BD-specific; CLAUDE.md fact #2 doesn't travel |
| **ScreenErrorBoundary** (A-cosmetic-to-DOCTRINE) | 🛑 DO NOT EXTRACT YET | Hidden-consumer-doctrine (§2.4) — trust-voice slot question; chunk-error detection is platform doctrine; brand strings need parameterization decision |
| **Notifications system** (A-DOCTRINE) | 🛑 DO NOT EXTRACT — TOAST_CATEGORIES is BD-product | Centralization-pressure (§2.1) — would force every consumer onto BD category enum |
| **validate-app-config** (A-cosmetic) | ⚠️ DO NOT EXTRACT YET | Hidden-consumer-doctrine (§2.4) — vendor list (Supabase + Clerk) is BD-coupled; safe only after parameterizing as `runConfigChecks(checks: ConfigCheck[])` |
| **Sentry init + errorReporting** (A-PURE) | 🛑 DO NOT EXTRACT YET — RECLASSIFIED | Hidden-consumer-doctrine (§2.4) — extracting Sentry as a platform default makes the platform "own" observability; Stacey may not want any telemetry, or use a different vendor (LogRocket, Honeybadger). Per Pass 296 §3.3 Sentry was A-PURE because the CODE is generic, but the DECISION is brand-tier. Pass 300 anti-extraction lens reclassifies. |
| **useOnlineStatus** (A-PURE) | ✅ EXTRACTABLE on owner authorization | None triggered — pure 21-line hook wrapping `navigator.onLine` + online/offline events; no doctrine; no folder gravity (would be lone hook in platform-core/); no hidden coupling. Recommended next extraction. |
| **useServiceWorkerUpdate** (A-cosmetic) | 🛑 DO NOT EXTRACT YET | Hidden-consumer-doctrine (§2.4) — vite-plugin-pwa coupling forces PWA library on consumer |
| **perfMarks** (A-cosmetic) | 🛑 DO NOT EXTRACT YET | Doctrine-loss (§2.2) + Folder-gravity (§2.3) — `bd:engine:mount/dispose` namespace is BD-engine-lifecycle convention; markRouteEnter/Leave is consumed by useHashPage; extracting perfMarks creates pressure to extract the consumer convention too |
| **useHashPage** (A-cosmetic) | 🛑 DO NOT EXTRACT YET | Cascade from perfMarks — useHashPage calls markRouteEnter/Leave; extracting one without the other creates broken telemetry |
| **Provider/context pattern** (A-DOCTRINE-as-PATTERN) | ✅ EXTRACTABLE as DOC ONLY (no helper) | None triggered IF extracted as REF doc + skeleton; CRITICAL centralization-pressure (§2.1) IF extracted as `createSeamProvider()` helper |
| **LAW_LAYERED_ARCHITECTURE** (A-PURE-as-DOCTRINE) | ⚠️ EXTRACTABLE as REFERENCE (not requirement) | None triggered if optional; centralization-pressure (§2.1) if marked as required for all consumers |

---

## §4. The new "DO NOT EXTRACT YET" registry

Synthesized from §3, the formal registry of candidates explicitly held back for owner-decision OR doctrine-stabilization:

### 4.1 Permanently DO NOT EXTRACT (until doctrine evolves)

These should NEVER be extracted in their current shape:

| File / surface | Reason |
|---|---|
| `ImageWithFallback` | `storage://` doctrine doesn't travel |
| Theme system (values) | LAW-locked palette per Pass 281 invariant #4 |
| Atmosphere keyframes (orb*) | BD emotional DNA |
| Notifications type system (current shape) | TOAST_CATEGORIES hard-codes BD product mechanics |

### 4.2 Owner-decision-blocked

Extractable AFTER owner answers a specific decision:

| File / surface | Decision required |
|---|---|
| Theme system (architecture) | Pass 295 §7 #2 (token architecture 3-tier) |
| Notifications system (generic-core) | Pass 296 §3.1 — generic-core vs registry shape |
| validate-app-config | parameterization shape (check-engine vs vendor-list) |

### 4.3 Owner-decision-blocked + Stacey-need-blocked

Extractable AFTER owner-decision AND Stacey actually needs it:

| File / surface | Reasons |
|---|---|
| Sentry init + errorReporting | Owner: is Sentry permanent? + Stacey: does she want telemetry? |
| useServiceWorkerUpdate | Owner: PWA strategy + Stacey: does she need PWA? |

### 4.4 Cascade-blocked

Extractable only WITH related files, not independently:

| File / surface | Cascade dependency |
|---|---|
| perfMarks | bd-namespace decision + consumer-convention coupling |
| useHashPage | depends on perfMarks (cascade) |
| NotificationToast | depends on Notifications system (cascade) |
| Animation keyframes (generic subset) | reduce-motion contract must travel |

### 4.5 Folder-gravity-blocked

Extractable INDIVIDUALLY only, never bulk:

| File / surface | Risk |
|---|---|
| 48 shadcn UI primitives | Bulk extraction creates `platform-core/ui/` mega-folder |
| (Future generic helpers) | Same risk pattern |

---

## §5. The TINY safe-second-extraction subset

Applying §3 + §4: the ONLY clean second-extraction candidates today are:

| Candidate | Notes |
|---|---|
| **`useOnlineStatus`** | 21-line hook; no doctrine load; no folder gravity (still single file post-extraction); no hidden coupling. **Recommended.** |
| **Provider seam pattern** (as REF doc only) | Extract as `REF_PROVIDER_SEAM_PATTERN.md` doc + `ProviderTemplate.tsx.example` skeleton. Zero source change to existing providers. |
| **LAW_LAYERED_ARCHITECTURE** (as optional reference) | Could be referenced from Stacey's site if she wants the discipline. Optional. |

Everything else from the Pass 295-297 catalogue triggers at least one anti-extraction lens.

**Recommended next live extraction:** `useOnlineStatus`. Same shape as cn. Lone-file extraction. No mega-folder pressure (joins cn as the SECOND file in platform-core/, not the start of `platform-core/hooks/`). Hidden-consumer-doctrine risk is acceptable (the consumer chooses whether to render offline UX; hook only reports state).

**NOT recommended:** Sentry (despite being A-PURE in Pass 296). Pass 300 reclassifies under the anti-extraction lens.

---

## §6. The "extraction capability vs extraction necessity" distinction

Relay #23 Priority C asks for codification of this distinction. Pass 300 surfaces the operational form:

**Extraction capability:** the file is mechanically movable without breaking anything. (Pass 295-297 audited this.)

**Extraction necessity:** there exists a SECOND consumer that genuinely needs this file shared. (Currently: only Stacey, hypothetically. No actual second consumer exists yet.)

**Pass 300 finding:** the gap between capability and necessity is enormous. Of the ~18 candidates audited, ~17 are CAPABLE of extraction; perhaps 1-2 are NECESSARY (cn was; useOnlineStatus could be).

**Implication:** the platform-core/ folder should grow at a rate dictated by NECESSITY, not capability. Each addition requires:
- A specific second-consumer need (Stacey's site requires X)
- OR a doctrine-traveling artifact (REF doc, contract, pattern)
- NOT "this file passed the 7-question audit" alone

This is the operational form of relay #19/#20/#21/#22's "extract only after duplication demonstrates true shared need" rule.

---

## §7. Folder-gravity heuristics

For Pass 300 + future passes, the platform-core sprawl-resistance discipline:

| Trigger | Action |
|---|---|
| Adding 2nd file to `platform-core/` | OK; hook + utility (different categories — natural pairing) |
| Adding 3rd file with same category | STOP — creates pressure for `platform-core/<category>/` subfolder |
| Adding any file with prefix `bd*`, `bidondent*` | STOP — brand-coupled name signals doctrine-loss risk |
| Adding any `index.ts` barrel | STOP — re-export indirection invites bulk-import patterns |
| Adding any file > 100 lines | STOP — large platform-core files concentrate authority; smaller is better |
| Adding a `hooks/`, `utils/`, `helpers/` subfolder | STOP — explicit relay #21 prohibition |

If ANY trigger fires, the candidate goes to "cascade-blocked" or "folder-gravity-blocked" registry until owner ratifies the new shape.

---

## §8. Connection to relay #23 priorities

| Relay #23 priority | Pass 300 contribution |
|---|---|
| A — Platform-core pressure audit + DO NOT EXTRACT YET classifications | DONE — §3 (re-examination) + §4 (registry) + §5 (safe subset) + §7 (heuristics) |
| B — Controlled second-seam analysis with hidden-doctrine-probability filter | PARTIALLY — §5 nominates useOnlineStatus + reclassifies Sentry; full Priority B analysis can be Pass 301 |
| C — Formalize anti-sprawl doctrine | PARTIALLY — §2 + §6 + §7 establish the concepts; full REF artifact can be Pass 301 OR Pass 302 |
| D — Provider doctrine deepening | DEFERRED — Pass 301+ |
| E — PMS continuity organism investigation | DEFERRED — Pass 302+ |
| F — Stacey portability proving | AWAITS owner business context |

---

## §9. New finding: the asymmetry of extraction risk vs reward

Relay #23 implicit theme: extraction risk is asymmetric.

**Reward of extraction:**
- Code reuse (limited until 2nd consumer exists)
- Ownership clarity (Pass 299 confirmed — modest gain)
- Future portability (theoretical until validated)

**Risk of extraction:**
- Folder-gravity → mega-folder → exact relay #21 anti-pattern
- Doctrine-loss → silent CLAUDE.md/LAW context drift
- Centralization-pressure → platform "owns" decisions consumers should own
- Hidden-consumer-doctrine → consumer forced into vendor/library/convention they don't want
- Reversibility erosion (extraction-pull from many call sites becomes harder to reverse over time)

**Asymmetry:** the rewards are realized OVER TIME; the risks fire IMMEDIATELY upon extraction.

**Implication:** the bar for extraction should be HIGHER than the bar for keeping in-place. Default: keep in BidOnDent. Extract only when 2nd-consumer evidence overrides the default.

---

## §10. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 / #20 / #21 / #22 / #23 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| `cn.ts` (post-Pass-299) | UNTOUCHED (no sprawl additions) |
| `src/platform-core/` folder | UNTOUCHED (still 2 files: cn.ts + README.md) |

ZERO new owner-decision points (cumulative remains 31).

---

## §11. What this pass does NOT do

- No source modification
- No new platform-core files (folder remains 2-file)
- No second extraction (Priority B prep only)
- No anti-sprawl REF artifact (only the conceptual scaffolding; full REF is Pass 301 or Pass 302)
- No provider doctrine artifact (Priority D deferred)
- No PMS deep-dive (Priority E deferred)
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §12. Forward triggers

1. **Owner authorizes 2nd extraction (useOnlineStatus)** → Pass 301 = AUTHORIZED execution following same shape as Pass 299. Verify the platform-core folder remains shallow + sprawl-resistant.
2. **Owner authorizes anti-sprawl REF artifact** → Pass 301 OR Pass 302 = `REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE.md` formalizing §2 + §6 + §7 + §9 as standalone REF.
3. **Owner authorizes provider-pattern REF artifact** → Pass 301 OR Pass 302 = `REF_PROVIDER_SEAM_PATTERN.md` per Pass 296 §3.7 doc-as-extraction approach.
4. **Owner authorizes PMS deep-dive** → Pass 302+ continues with Priority E.
5. **Owner provides Stacey business context** → Stacey-bootstrap reconnaissance pass.
6. **Pass 300 itself becomes the operational filter** → all future extraction candidate analyses must answer the 4 anti-extraction lenses (§2) BEFORE the 7-question audit.

---

## §13. Status

REF doc shipped Pass 300. Audit-only. The anti-extraction discipline is now formalized:
- 4 risk lenses
- DO NOT EXTRACT YET registry across 5 sub-categories
- TINY safe-second-extraction subset (1-3 candidates)
- Folder-gravity heuristics
- Capability-vs-necessity distinction
- Asymmetry-of-risk principle

The platform-core/ folder remains 2 files. The discipline is now mechanical for future passes. Phase E (survivable platform evolution) is operationally underway.

**End of doc.**
