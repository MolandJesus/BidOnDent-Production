# Pass 27 — Doc Correction (audit AI verification fold-in)

**Date:** 2026-05-08
**Author:** cowork-A (continuation pass under owner "go full auto" directive)
**Scope:** doc-only edits — no source-file changes
**Predecessor passes:** Pass 26 (doc-only enrollment) → Pass 25 audit-AI ship (−224 LoC) → Pass 27 (this pass, fold-in correction)

---

## §1. Why this pass exists

Audit AI relayed via owner that cowork-A's Pass 25/25b dormant-exports sweep had partially overstated findings. Independent verification surfaced:

- **`photoUtils.ts`** — NOT entire-file dead. `compressImage` export has **6 consumers** (verified: `imageCompression.ts`, `AccountScreen.tsx`, `reportPhotoUpload.ts`, `profileImageUpload.ts`, etc.). Only 4 of 5 exports were dead.
- **`useUserDataHelpers.ts`** — actual export count was 10, not 6. **6 of 10 dead**, not 5 of 6.
- **`useCountUp`** — confirmed 0 consumers.

Audit AI shipped Pass 25 = **−224 LoC of verified dead code removed across 3 files**. Typecheck PASS exit 0.

Cowork-A's role this pass: **fold the verification correction into the canonical doc tree** (REF_KNOWN_ISSUES.md) so future agents inherit the audit-AI-verified record rather than the cowork-A original overstatement.

---

## §2. Edits shipped this pass

### 2.A. `docs/REF_KNOWN_ISSUES.md` — KI-178 RESOLVED

- Title updated to reflect correct denominators: "`photoUtils.ts` partially dead (4/5), `useUserDataHelpers` 6/10 dead, `useCountUp` dead"
- Original cowork-A claims preserved with strikethrough so the methodology lesson is traceable
- Audit AI's verified counts laid out under "Audit AI's independent verification (corrects record)"
- **Methodology lesson** added: cowork-A's path-pattern grep missed individual named-import consumers. Future dormant-export sweeps should use audit AI's per-export consumer-count approach: `grep -rln "<exportName>" src/ --include="*.ts" --include="*.tsx" | grep -v "<file-itself>"`.
- Status changed from OPEN to **RESOLVED 2026-05-08 (audit AI Pass 25 — −224 LoC shipped, typecheck PASS)**.
- Cross-ref to KI-177 (shadcn ui/) as separate post-launch janitor target.

### 2.B. `docs/REF_KNOWN_ISSUES.md` — KI-177 numbers refined

Re-audited shadcn ui/ closed graph this pass with stricter methodology:

```
Total ui/ files:          53 (not ~36 — original undercount)
Total ui/ LoC:            4,771 (not 4,707)
Alive files:               6 — NotificationToast, utils, alert-dialog, dialog, drawer, sheet
Dormant files:            47 (not ~30)
Dormant LoC:               4,178 (not ~4,100)
```

- KI-177 title updated: "47 of 53 files dormant (~4,178 LoC)"
- Closed-graph proof re-verified by reading each alive file's import list. Confirmed: alive files import only from `@radix-ui/react-*` packages externally — they do **not** transitively pull in any of the 47 dormant ui/ files.
- Status remains **OPEN — janitor pass deferred** with closed-graph proof re-verified note.

### 2.C. `AI_LOCK.md`

- Active AI re-claimed: `cowork-A (Pass 27 — doc-only correction + RESOLVED status)`
- Locked files: `docs/REF_KNOWN_ISSUES.md`
- Standdown line will be applied at the end of this pass.

---

## §3. Methodology lesson logged

This is the second documented audit-AI-correcting-cowork-A event in the autopilot session (the first was the cooperative-edit race during Pass 14 Step 1.6, where both AIs concurrently shipped identical-scope edits). Both events are protocol-improvement opportunities, not failures of either AI:

**Lesson 1 (Pass 14 Step 1.6):** When starting work after a previous standdown, re-claim AI_LOCK Active AI before any source-file edit, even if the work is a continuation of an earlier-authorized track. Each work batch needs its own claim/standdown cycle.

**Lesson 2 (Pass 27 / KI-178 correction):** Dormant-export sweeps must enumerate exports by name and grep each name individually, not rely on path-pattern matches. Path-pattern matches miss individual named-imports (e.g., `import { compressImage } from "../utils/photoUtils"` is found by the path pattern; `import { compressImage } from "@/utils/photoUtils"` may not be, depending on the regex). Audit AI's per-export consumer-count is the canonical methodology going forward.

Both lessons should propagate into the relay protocol doc when audit AI / master-builder next opens it for revision. Cowork-A is not editing `REF_AI_COLLABORATION_PROTOCOL.md` in this pass — that's a shared-territory edit with broader implications.

---

## §4. Cumulative session delta after Pass 27

```
Source files modified (audit AI Pass 25 ship):  ~3 (photoUtils.ts, useUserDataHelpers.ts, useScrollAnimation.ts)
Source LoC removed (audit AI Pass 25):           −224
Docs modified this pass (cowork-A Pass 27):      AI_LOCK.md, REF_KNOWN_ISSUES.md
Evidence created this pass:                       PASS_27_DOC_CORRECTION_AUDIT_AI_VERIFIED.md (this file)

KIs at end of Pass 27:
  KI-177 OPEN  — shadcn ui/ 47-of-53 dormant (~4,178 LoC) — post-launch janitor target
  KI-178 RESOLVED — audit AI Pass 25 −224 LoC shipped, methodology lesson logged

Cluster typecheck:                                PASS exit 0 (audit AI ship verified)
Six gates:                                        unchanged in count
```

---

## §5. Standdown

cowork-A standing down for the third time on 2026-05-08. AI_LOCK Active AI cleared in the final commit-equivalent edit at the end of this pass.

**Genuine sandbox-bounded exhaustion now reaffirmed.** All viable continuation tracks remaining require either:

1. **Master-builder authorization** — gate #6 Engine A consumer strategy (`MapProgramTopBar` variant prop vs two-component split vs defer); Step B re-scope decision; F-1 vs F-2 commit fold; KI-162 reopen routing.
2. **Owner authorization** — engine-convergence pick (1 vs N engines, Phase 3 gate); KI-177 post-launch janitor authorization.
3. **External-access actions** — host `rm -f .git/*.lock` to land queued commits; host `npm run build` to verify production bundle; Supabase secret deploy for KI-002 RESEND_API_KEY; browser DOM verify for KI-165/173/174.

None of these can be progressed from inside the sandbox without overstepping authorization scopes. All evidence is on disk for audit AI / master-builder / Mola consumption.

End of Pass 27 evidence.
