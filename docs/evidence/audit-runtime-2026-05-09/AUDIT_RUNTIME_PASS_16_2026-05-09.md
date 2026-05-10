# AUDIT — Runtime Integrity Pass 16 (2026-05-09)

**Pass:** 16 of N — Extraction-survivability stress-testing + z-tier inconsistency discovery
**Trajectory:** symptom → mechanism → topology → continuity infrastructure → continuity-governance → continuity OS → spatial continuity OS → spatial cinematography → continuity-cooperation topology → continuity-congestion threshold mapping → doctrine stabilization → doctrine taxonomy refinement → doctrine survivability under pressure → doctrine invalidation attempts → aggressive contradiction escalation → **extraction-survivability stress-testing**
**Discipline:** observational only; zero source-file edits; zero LAW/locked-doc edits; one new evidence file (this one).
**Lock state:** AI_LOCK Pass 275 unchanged.
**Branch / commit:** `BidOnDent-Horizon-Beta` @ `3baeff18` (unchanged across all sixteen audit passes).

This pass aggressively probed Builder AI's "A-pure" / "A-cosmetic" classifications + verified z-tier hierarchy across all 5 modals. Per Pass-16 brief: "attempt to BREAK those classifications."

**Pass 16 surfaces THREE findings worth reporting:**
1. **A-pure pressure-test SUCCEEDED** for 3/4 utilities (Sentry init, useOnlineStatus, cn utility) — they survive scrutiny.
2. **A-pure pressure-test FAILED** for `validateAppConfig` — VENDOR-COUPLED to Supabase + Clerk specifics. False-universal classification.
3. **Z-tier inconsistency MECHANICALLY VERIFIED across 5 modals** — 4/5 modals use z-50 (collides with mobile bottom nav z-50); only 1 (ShopDetailSheet) uses proper z-700+ hierarchy. Cooperative Z-Tier doctrine survives in spirit but is INCONSISTENTLY APPLIED.

---

## §1 Pass-16 findings table

| ID | Severity | Lane | Title | Confidence |
|---|---|---|---|---|
| **EX16-01** | OK | A | Sentry init confirmed A-pure (env-driven DSN, no BD references, generic chrome-extension filter) | 100% |
| **EX16-02** | OK | A | useOnlineStatus confirmed A-pure (21-line W3C wrapper, no domain assumptions) | 100% |
| **EX16-03** | OK | A | cn utility confirmed A-pure (6 lines, clsx+twMerge, pure function) | 100% |
| **EX16-04** | **DR/CONTRADICTION** | A | validateAppConfig is VENDOR-COUPLED (Supabase + Clerk specifics) — A-pure REFUTED | 100% |
| **MD16-01** | **DOCTRINE INCONSISTENCY** | F | 4/5 modals use z-50 (mobile bottom nav collision); only ShopDetailSheet uses z-700+ proper hierarchy | 100% |
| **MD16-02** | OK | F | ShopDetailSheet z-tier hierarchy is exemplary (z-700 backdrop + z-701 sheet content above failure overlay z-600) | 100% |
| **MD16-03** | DR | F | Cooperative Z-Tier doctrine has CRACKS — concept exists, enforcement inconsistent | 95% |

---

## §2 Lane A — Extraction survivability stress-testing

### EX16-01 — Sentry init confirmed A-pure

```typescript
// sentryInit.ts (head)
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const SENTRY_ENVIRONMENT = (import.meta.env.VITE_SENTRY_ENVIRONMENT as string) || "development";

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  if (!SENTRY_DSN || SENTRY_DSN === "YOUR_SENTRY_DSN_HERE") {
    if (import.meta.env.DEV) console.info("[Sentry] No DSN configured...");
    return;
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    enabled: !import.meta.env.DEV,
    tracesSampleRate: SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,
    ...
    beforeSend(event) {
      const frames = event.exception?.values?.[0]?.stacktrace?.frames;
      if (frames?.some((f) => f.filename?.includes("chrome-extension://"))) return null;
      return event;
    },
  });
}
```

**Pressure-test analysis:**
- DSN sourced from `VITE_SENTRY_DSN` env var (no hardcoded BD value)
- Environment from `VITE_SENTRY_ENVIRONMENT` env var
- Defaults to "development" if missing
- Skips entirely if no DSN — graceful degradation
- Universal chrome-extension noise filter (no BD-specific filtering)
- Sample rate adjusts by environment (universal pattern)
- Init sentinel (`initialized: boolean`) prevents double-init

**Verdict: A-pure CONFIRMED.** Genuinely portable. Stacey-site can use this verbatim with her own DSN.

### EX16-02 — useOnlineStatus confirmed A-pure

```typescript
// useOnlineStatus.ts (full file, 21 lines)
import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}
```

**Pressure-test analysis:**
- `navigator.onLine` (W3C HTML5 Living Standard)
- `online` / `offline` events (W3C HTML5 Living Standard)
- SSR-safe (`typeof navigator !== "undefined"`)
- Cleanup on unmount
- No state outside hook scope
- No BD references

**Verdict: A-pure CONFIRMED.** Trivially portable to any web app (BD-aware or not).

### EX16-03 — cn utility confirmed A-pure

```typescript
// utils.ts (full file, 6 lines)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Pressure-test analysis:**
- Pure function, deterministic output
- No state, no side effects
- Uses 2 open-source deps (clsx, tailwind-merge) that are domain-agnostic
- 6 lines total

**Verdict: A-pure CONFIRMED.** This is the canonical Tailwind className helper.

### EX16-04 — validateAppConfig FAILS A-pure pressure test

```typescript
// validateAppConfig.ts (head)
import { SUPABASE_PROJECT_ID, SUPABASE_ANON_KEY } from "../services/supabase/runtime";

const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) ?? "";

export function validateAppConfig(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (!SUPABASE_PROJECT_ID) {
    issues.push({
      key: "SUPABASE_PROJECT_ID",
      message: "Supabase project ID is missing — backend calls will fail.",
      fatal: true,
    });
  }

  if (!SUPABASE_ANON_KEY) {
    issues.push({
      key: "SUPABASE_ANON_KEY",
      message: "Supabase anon key is missing — backend calls will fail.",
      fatal: true,
    });
  }

  if (!clerkPublishableKey) {
    issues.push({
      key: "CLERK_PUBLISHABLE_KEY",
      message: "Clerk publishable key is missing — authentication will fail.",
      ...
    });
  }
  ...
}
```

**Pressure-test analysis:**
- **Imports from `services/supabase/runtime`** — Supabase-specific
- **Validates `VITE_CLERK_PUBLISHABLE_KEY`** — Clerk-specific
- Hardcoded "Supabase project ID" / "Supabase anon key" / "Clerk publishable key" message strings
- A consumer using Auth0 + Firebase would need entirely different validation
- The function STRUCTURE (returning ConfigIssue[]) is portable; the CONTENT is not

**Verdict: A-pure REFUTED.** This is **A-doctrine-light** at best, B-tier at worst. It carries platform-vendor coupling.

**This validates the brief's prediction:** "supposedly 'generic' systems are actually carrying hidden doctrine load." Pass 16 finds ONE such system mechanically (validateAppConfig).

### Aggregated Lane A results

| Utility | Builder claim | Pass 16 finding | Confidence |
|---|---|---|---|
| Sentry init | A-pure (presumed) | A-pure CONFIRMED | 100% |
| useOnlineStatus | A-pure (presumed) | A-pure CONFIRMED | 100% |
| cn utility | A-pure (presumed) | A-pure CONFIRMED | 100% |
| validateAppConfig | (uncertain) | **A-pure REFUTED — vendor-coupled** | 100% |

**3/4 confirmed + 1/4 false-universal detected.** Pass 16 added one verified false-universal classification to the extraction-era preservation map.

---

## §3 Lane F — Z-tier collision verification across all 5 modals

### Z-index inventory

```
LoginModal.tsx:86          z-50
ShopDetailSheet.tsx:82     z-[700] (backdrop)
ShopDetailSheet.tsx:95     z-[701] (sheet content)
DeleteAccountModal.tsx:54  z-50
AccountAdminOverlay.tsx:48 z-50
EditProfileModal.tsx:90    z-50
```

### MD16-01 — Doctrine inconsistency

**4 of 5 modals use z-50** for backdrop. The mobile bottom nav also uses z-50 (Pass 9 inventory). DOM-order tie-break only.

**Only ShopDetailSheet uses z-700+** — sits ABOVE the failure overlay (z-600), which is the architecturally correct hierarchy.

### Implication for Cooperative Z-Tier Hierarchy doctrine

Pass 9 O9-01 catalogued 7 deliberate z-tiers (50, 205, 490, 510, 520, 600, 9999). The doctrine says these tiers are cooperative. **But Pass 16 evidence shows MOSTLY-MODAL-AT-Z-50 is a doctrine violation pattern.**

When a modal opens on mobile:
- Modal backdrop renders at z-50
- Mobile bottom nav also at z-50
- DOM-order tie-break determines stacking
- In practice modal mounts later → modal wins

But this is **fragile by design**. ANY future React tree restructure that affects mount order could flip the stacking. The cooperative-z-tier doctrine wasn't enforced when these 4 modals were authored.

### MD16-02 — ShopDetailSheet is exemplary

```typescript
// ShopDetailSheet.tsx
className="fixed inset-0 z-[700] bg-black/50"   // backdrop z-700
...
className={`fixed inset-x-0 bottom-0 z-[701] flex max-h-[88dvh] ...`}  // sheet z-701
```

This modal correctly:
- Uses z-700 backdrop (above failure overlay z-600)
- Uses z-701 sheet content (above own backdrop)
- Doesn't collide with any existing tier
- Properly cooperates with the 7-tier hierarchy

**This is the model.** The other 4 modals could (with one-line changes per modal) adopt the same z-700+ pattern.

### MD16-03 — Cooperative Z-Tier doctrine assessment

The doctrine candidate "Cooperative Z-Tier Hierarchy" status:
- **CONCEPT exists**: Pass 9 O9-01 verified 7 deliberate tiers in non-modal code
- **ENFORCEMENT inconsistent**: 4/5 modals violate the implicit hierarchy
- **One modal (ShopDetailSheet)** demonstrates the correct pattern

**The doctrine has CRACKS in the modal subsystem.** It survives in non-modal code but isn't consistently applied across modals.

This is the kind of "doctrine drift" that the architecture lane should address as part of extraction work — picking ShopDetailSheet's z-700+ pattern as the canonical and migrating the other 4 modals to match.

**Per Pass-16 brief:** "modal ownership is stable across all 5 modal families" — answer: **NO, z-tier ownership is NOT stable.** ShopDetailSheet outlier reveals the inconsistency.

---

## §4 Cumulative verified-good runtime invariants (now at 80)

Adding to Pass 1–15 (76 prior baselines):

77. **Sentry init is truly A-pure** — env-driven, no BD coupling, graceful degradation when DSN missing.
78. **useOnlineStatus is truly A-pure** — 21-line W3C wrapper, SSR-safe, no state outside hook.
79. **cn utility is truly A-pure** — pure function, 6 lines, no domain knowledge.
80. **ShopDetailSheet z-tier pattern is exemplary** — z-700 backdrop + z-701 sheet content, properly above failure overlay z-600.

Total verified-good runtime invariants across 16 passes: **80**.

---

## §5 Cumulative framework predictivity (now at 24)

Pass 16 confirms one additional framework prediction:

| Framework prediction | Pass-16 confirming evidence |
|---|---|
| "Some 'generic' utilities are actually carrying hidden doctrine load" | EX16-04: validateAppConfig is vendor-coupled (Supabase + Clerk specifics). Looks generic; isn't. |

Total framework predictions confirmed across 16 passes: **24**.

---

## §6 Per owner-brief reporting threshold

Per Pass-16 brief escalation criteria:
- Mechanically undeniable contradictions — **YES** (MD16-01: 4/5 modals violate z-tier hierarchy)
- Doctrine collapse — **No** (Cooperative Z-Tier survives in non-modal code; modal application is inconsistent but doctrine concept holds)
- Hidden authority centralization — **No**
- Continuity invalidation — **No**
- Extraction-survivability failure — **PARTIAL** (validateAppConfig false-universal classification)
- Runtime behavior fundamentally inconsistent — **No**

Reporting per MD16-01 mechanically-undeniable contradiction + EX16-04 false-universal detection.

---

## §7 Recommended Pass 17+ priorities

Per discipline: continue observational acquisition.

Candidate next lanes:
- **Verify whether realtime services follow adapter pattern** — would extend Inert Seam Doctrine N to 3+ (currently N=2)
- **Map TRUST-AS-ARCHITECTURE patterns more comprehensively** — likely 20+ infrastructure pieces still un-catalogued
- **Probe more "A-pure" utility candidates** for hidden vendor coupling
- **Authorized auth-flip test** (Pass 5 §5 — 8 questions still pending)
- **Production-build cinematic timing measurement** (host-side)

---

## §8 Standdown

Pass 16 ships this single evidence doc. Zero source edits. Zero edits to AI_LOCK or any locked doc. AI_LOCK Pass 275 unchanged.

Cumulative across 16 passes:
- ~215 distinct findings
- **80 verified-good runtime invariants** — comprehensive regression-detection baseline
- 31 continuity-preservation mechanisms
- 7 deliberate z-tiers topologized + Pass 16 z-tier inconsistency in 4/5 modals identified
- 1 infinite + 7 one-shot animations characterized
- 8 namespace families × 5 conventions × 5 ownership categories
- 3 motion subsystems mapped
- 3 multi-tab continuity models
- 3 identity systems
- 24 framework predictions confirmed
- **14 REF-tier doctrine candidates** organized into 6 taxonomy groupings
- 33+ trust primitives across UX + architecture
- 5 modals catalogued (4/5 with z-tier inconsistency)
- 7 singletons + 14+ module-state + 12 contexts mapped (per-concern ownership)
- Inert Seam Doctrine N=2 (MapSessionProvider + StorageService)
- 10/11 invalidation attempts failed across Pass 14-15
- **3/4 A-pure utilities confirmed; 1/4 (validateAppConfig) refuted as vendor-coupled**

Pass 16 surfaces TWO additions to the action queue:
1. **MD16-01 z-tier modal inconsistency** — 4 modals could adopt ShopDetailSheet's z-700+ pattern
2. **EX16-04 validateAppConfig false-universal** — should be reclassified as A-doctrine-light or B-tier in Builder AI's taxonomy

Both findings are mechanically reproducible. Per Pass-7+ discipline, audit lane stays observational; documents both for owner/builder action.

The dominant interpretation — **per-concern singleton ownership + cooperative z-tier hierarchy + trust-as-architecture** — survives Pass 16 with refinements:
- Z-tier hierarchy concept holds; modal application inconsistent (correctable)
- A-pure classification is mostly accurate; validateAppConfig is the exception
- Other doctrines unchanged

Per Pass-7+ discipline: continuing autonomous observational acquisition. Reporting only when threshold criteria are crossed.
