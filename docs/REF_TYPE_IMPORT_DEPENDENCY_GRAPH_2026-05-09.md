---
status: ACTIVE
authority: REF
scope: type-import-dependency-graph
canonical_source_of_truth: REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 275 type-import dependency graph under owner relay 2026-05-09 #5 priority A (highest hidden-coupling risk for package-boundary sequencing). Mechanical inventory of the type-import surface. Six type-bearing files identified; ranked by importers (types/index.ts 92, types/navigation.ts 58, types/mapDomain.ts 50, types/networkProfiles.ts 14, types/dashboardShell.ts 4, services/supabase/types.ts 3). Top-symbol fan-out concentrated in BD domain (DamageReport 48, Bid 21, Vehicle 16, Notification 12). Three concrete cross-tier coupling findings: (1) types/index.ts barrel MIXES Tier A platform-grade types (UserInfo, NavTab, RedirectInfo) with Tier C BD-domain types (DamageReport, Bid, Vehicle) — the import statement carries no tier signal, so 92 importers cannot be cleanly classified without per-import analysis; (2) types/dashboardShell.ts couples shell extraction to BD domain via ProfileDropdownData embedding `Bid[]` / `Notification[]` / `Report[]` / `Vehicle[]` — confirms Pass 271 prediction that shell needs slot-driven type primitives, not direct port; (3) UI primitives + atmosphere/ + features/ are CLEAN of BD domain types (zero DamageReport references), confirming Pass 270 §6.2 classification. Sequencing recommendation: types/index.ts must split into platform/domain/registry sub-files BEFORE any package-boundary extraction; otherwise the 92 import sites become per-call decisions during extraction. Framework HOLDS — every finding fits Pass 271 #1 type-import-coupling category. ZERO new contamination categories. ZERO new owner-decision points. Doc-only.
last_updated: 2026-05-09
---

# Pass 275 — Type-Import Dependency Graph

> **Tier:** REF. Current truth about the codebase's type
> dependency surface.
> **Authority:** Owner relay 2026-05-09 #5 priority A
> ("highest hidden-coupling risk remaining ... directly impacts
> package-boundary sequencing"). Discovery lane CLOSED;
> execution-readiness lane OPEN.
>
> **What this doc is:** mechanical inventory of where types live,
> how they fan out, and where cross-tier coupling concentrates.
>
> **What this doc is NOT:**
> - LAW. Inventory data, not doctrine.
> - A re-test of convergence. Framework used as stable doctrine.
> - An extraction plan. Inventory is input, not authority.
> - Exhaustive symbol-by-symbol analysis. Top-N coverage by
>   importer count is enough to surface sequencing risks.
> - A new decision-point generator. Pass 275 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #5 priority A:

> "Type-import dependency graph. Highest hidden-coupling risk
> remaining. This directly impacts package-boundary sequencing."

Type-import coupling is Pass 271 contamination category #1
(`type imports of types defined inside another subsystem`).
Pass 275 quantifies it mechanically.

The question this pass answers: **before extraction, which type
files cross which subsystem boundaries, and what does that mean
for package-extraction order?**

---

## §2 — Type-bearing file rank

### §2.1 The six files

`src/app/types/`:

| File                            | Lines | Importers | Mostly                              |
| ------------------------------- | ----- | --------- | ----------------------------------- |
| `types/index.ts`                | ~115  | **92**    | Mixed — BD entities + platform shapes |
| `types/navigation.ts`           | ~120  | **58**    | Mostly platform (geo + nav primitives) |
| `types/mapDomain.ts`            | ~330  | **50**    | Map engine domain                    |
| `types/networkProfiles.ts`      | ~60   | **14**    | Platform infrastructure              |
| `types/dashboardShell.ts`       | ~25   | **4**     | Shell types — BD-coupled (see §5)   |

`src/app/services/`:

| File                                  | Lines | Importers | Mostly                          |
| ------------------------------------- | ----- | --------- | ------------------------------- |
| `services/supabase/types.ts`          | 168   | 3         | DB row shapes (BD-domain)       |
| `services/storage/types.ts`           | 161   | 0 (internal) | Adapter contract (platform) |

**Total importer count across the six files: 221+ import
sites.** This is the type-extraction surface.

### §2.2 Concentration pattern

92 + 58 + 50 = **200 of 221 importers (90%)** target three
files:
- `types/index.ts` (BD domain barrel)
- `types/navigation.ts` (Tier B candidate)
- `types/mapDomain.ts` (Tier B candidate)

That concentration is good news — extraction sequencing is
dominated by three files, not 30. Get those three right and
~90% of the type-import surface follows.

---

## §3 — Top-symbol fan-out

The most-imported symbols from `types/index.ts`:

| Symbol                       | Importers | Tier classification (proposed)            |
| ---------------------------- | --------- | ----------------------------------------- |
| `DamageReport`               | 48        | Tier C — BD core entity                   |
| `Bid`                        | 21        | Tier C — BD core entity                   |
| `Vehicle`                    | 16        | Tier C — BD core entity                   |
| `Notification`               | 12        | Tier C — BD-coupled (see §3.1)            |
| `ViewMode`                   | 9         | Tier C — BD route taxonomy (Pass 274 §5.1) |
| `ShopOnboardingFormData`     | 7         | Tier C — BD form                          |
| `UserInfo`                   | 6         | **Tier A** — generic identity shape       |
| `Report` (alias)             | 6         | Tier C — alias of DamageReport            |
| `RedirectInfo`               | 6         | **Tier A candidate** — needs verify        |
| `LoginView`                  | 5         | Tier C — values bind to BD roles          |
| `UserData`                   | 3         | Tier C — BD-coupled                       |
| `NavTab`                     | 3         | Tier A shape, Tier C values               |
| `InsurerOnboardingFormData`  | 3         | Tier C — BD form                          |
| `JobAssignment`              | 2         | Tier C — BD entity                        |
| `ActivityEvent`              | 2         | Tier C — BD activity                      |

### §3.1 The Notification ambiguity

`Notification` (12 importers) is interesting. Pass 273 §2.2
classified the notification machinery (events, toast, deep-link
type-parameterization) as platform-grade. The `Notification`
type in `types/index.ts` is BD-specific (its `category` enum is
the BD 8-category union, its `deepLink` targets BD screens).

So:
- **Notification machinery** (NotificationEvent, NotificationToast,
  NotificationContext) → platform-core
- **The specific `Notification` type in types/index.ts** → app-private

Mechanical implication: when extraction happens, the 12 import
sites of `Notification` from `types/index.ts` need to be re-routed
to a parameterized `BDNotification = NotificationEvent<BDCategory, BDDeepLink>`.

### §3.2 Symbol-tier ratio

Of the top 16 fan-out symbols:
- **3** are platform candidates (UserInfo, RedirectInfo, NavTab shape)
- **13** are BD-domain or BD-coupled

The platform-grade-shape types account for **~15 of 92 importers**
(estimate, since some importers pull multiple symbols).

The BD-domain types account for **~75-80 of 92 importers**.

**This ratio is the core finding.** The barrel mixes ~15% platform
content with ~85% BD content, and 92 callsites can't be tier-classified
from the import path alone — every callsite needs per-symbol inspection.

---

## §4 — types/index.ts split recommendation

### §4.1 Current shape (single flat barrel)

```
src/app/types/index.ts (~115 lines, 16 exports, 92 importers)
├── BD domain (Tier C):
│   DamageReport, Report (alias), Bid, Vehicle, Notification,
│   Activity, ActivityEvent, JobAssignment, UserData,
│   ShopOnboardingFormData, InsurerOnboardingFormData, LoginView
├── BD-shaped values, platform-shape types (Tier C values, Tier A shape):
│   ViewMode, NavTab
└── Pure platform shape (Tier A candidates):
    UserInfo, RedirectInfo
```

### §4.2 Pre-extraction split

```
src/app/types/
├── platform.ts            # Tier A — moves to @platform-core/types/
│   UserInfo, RedirectInfo
├── platform-shape.ts      # Tier A type shape with TApp generic
│   ViewMode<TRoutes>, NavTab<TRoute>, LoginView<TRoles>
├── domain.ts              # Tier C — stays app-private
│   DamageReport, Report (alias), Bid, Vehicle,
│   Activity, ActivityEvent, JobAssignment, UserData,
│   ShopOnboardingFormData, InsurerOnboardingFormData
└── notifications.ts       # Tier C registry, Tier A machinery
    BDNotification = NotificationEvent<BDCategory, BDDeepLink>
    BDCategory union (8 values)
    BDDeepLink union (7 values)
```

### §4.3 What this enables

After the split, every import statement carries a tier signal:

| Import path                    | Tier signal       |
| ------------------------------ | ----------------- |
| `from "../types/platform"`     | Will move to platform-core |
| `from "../types/platform-shape"` | Will move to platform-core (with type parameters) |
| `from "../types/domain"`       | Stays app-private (Tier C) |
| `from "../types/notifications"`| Stays app-private (registry instance) |

The 92 importers can be auto-classified by `grep` rather than by
manual inspection. **That converts the type-extraction work from
N=92 per-file decisions to N=4 per-file moves.**

### §4.4 Sequencing dependency

The split is a prerequisite for ANY of:
- Extracting `useNavigation` (depends on `ViewMode`)
- Extracting `useUser` / `useAuth` (depends on `UserInfo`)
- Extracting notification machinery (depends on `Notification`)
- Extracting `RedirectInfo`-using code

**Without the split, every extraction pass becomes barrel-archaeology.**
With the split, the existing barrel `types/index.ts` can be
preserved as a re-export shim (`export * from "./platform"; export * from "./platform-shape"; export * from "./domain"; export * from "./notifications";`) so no source-file edits are needed in the 92 importers during the split itself.

---

## §5 — types/dashboardShell.ts — concrete shell coupling evidence

### §5.1 Full content

```typescript
import type { RefObject } from "react";
import type { Bid, Notification, Report, Vehicle } from "./index";

export type ProfileDropdownData = {
  userType: "customer" | "shop" | "insurer";
  notifications?: Notification[];
  notificationSyncActive?: boolean;
  reports: Report[];
  vehicles: Vehicle[];
  bids: Bid[];
  onNavigate: (destination: string, tab?: string) => void;
  onLogout: () => void | Promise<void>;
  forwardedRef: RefObject<HTMLDivElement>;
};

export type UserProfile = {
  name: string;
  email: string;
  user_type: string;
  phone?: string;
};
```

### §5.2 Importers (4 sites)

| Importer                             | Symbols used                       |
| ------------------------------------ | ---------------------------------- |
| `components/app/DashboardLayout.tsx` | `ProfileDropdownData, UserProfile` |
| `components/app/DashboardSidebar.tsx`| `ProfileDropdownData, UserProfile` |
| `components/app/DashboardHeader.tsx` | `ProfileDropdownData, UserProfile` |
| `components/app/LandingPageLayout.tsx` | `ProfileDropdownData`            |

### §5.3 Significance

This file is the concrete evidence Pass 271 predicted. The shell
extraction is not just visual-slot work — it's TYPE-shape work.
`ProfileDropdownData` makes the shell components depend on BD
domain entity arrays directly.

### §5.4 Pass 271 → Pass 275 mapping

Pass 271 predicted (qualitative): "shell extraction needs slot-driven
primitive PATTERNS, not direct port of existing files."

Pass 275 confirms (mechanical):

```typescript
// Platform-core shell primitive
export type GenericProfileDropdownData<TItems extends Record<string, unknown>> = {
  userType: string;  // app supplies role taxonomy
  notifications?: GenericNotification[];
  syncActive?: boolean;
  items: TItems;     // app supplies its own entity arrays
  onNavigate: (destination: string, tab?: string) => void;
  onLogout: () => void | Promise<void>;
  forwardedRef: RefObject<HTMLDivElement>;
};

// BD app supplies
type BDProfileDropdownData = GenericProfileDropdownData<{
  reports: Report[];
  vehicles: Vehicle[];
  bids: Bid[];
}>;
```

### §5.5 Sequencing risk (shell)

`types/dashboardShell.ts` is small (4 importers, ~25 lines), but
it cannot be extracted without simultaneous changes in 4 shell
components. Pre-extraction prep options:

- **Option 1 (recommended):** generic-parameterize `ProfileDropdownData<TItems>`
  in-place. 4 component edits to specify `<{reports: Report[]; vehicles: Vehicle[]; bids: Bid[]}>`. 
  After this, the platform-core shell extraction is just file-move.
- **Option 2:** keep `ProfileDropdownData` BD-specific in BD app;
  platform-core shell exposes a different prop name (`<TProfileData>`)
  and BD app passes its `ProfileDropdownData`. Same end state, different timing.

---

## §6 — Cross-tier flow inventory

### §6.1 Tier A subsystems importing BD-domain types

Pass 270 §6.2 classifies these as Tier A (platform-core MVP nucleus):

| Subsystem                         | Imports DamageReport? | Other BD types? |
| --------------------------------- | --------------------- | --------------- |
| `src/app/components/ui/`          | **No**                | **None**        |
| `src/app/components/atmosphere/`  | **No**                | **None**        |
| `src/app/features/`               | **No**                | **None** (mediated through hooks/services) |

**ZERO Tier A subsystems import Tier C BD-domain types directly.**
This is exactly the cleanliness Pass 270 §6.2 expected. The
boundary discipline at the L1 + L3 layers is intact.

### §6.2 Hooks layer (mixed Tier A and Tier C)

13 hooks import `DamageReport`:

```
useMarketStatus, useCustomerReportStatusNotifications, userDataUtils,
useShopDirectoryActions, useAppHandlers, userDataActions,
useCustomerBidNotifications, useUserData, useMarketplaceReports,
userDataValidation, useReportLayerData, useUserDataCloudSync,
useUserDataLoader
```

All 13 are domain-aware orchestration hooks (Pass 270 classified
them Tier C). Their direct DamageReport coupling is correct for
their layer.

Pass 273 §3.6 platform-candidate hooks were `useNavigation`,
`useAppearanceMode`, `useUser`. Pass 275 mechanical check:
- `useNavigation` — does NOT import DamageReport ✓ (clean platform candidate)
- `useAppearanceMode` — does NOT import DamageReport ✓ (clean platform candidate)
- `useUserData` — DOES import DamageReport (Tier C as expected)

### §6.3 services/supabase/types.ts — DB-row shape coupling

Content (head):
```typescript
export interface Profile {
  account_type: "customer" | "shop" | "insurer";
  // ...
}

export interface Vehicle { /* DB shape */ }
```

3 importers:
- `hooks/userDataUtils.ts`
- `hooks/useUserDataLoader.ts`
- `hooks/useCoveragePartnerShops.ts`

This is BD-domain DB-row shape (Tier C). Account-type role coupling
matches Pass 271 #6 role-logic-coupling category. Small surface (3
importers); contained.

### §6.4 services/storage/types.ts — adapter contract (Tier A)

Pass 273 §3.3 confirmed `services/storage/StorageService.ts` is the
textbook adapter pattern. `services/storage/types.ts` is its
interface contract (`IStorageProvider`). 0 external importers — used
internally only. **Already platform-grade-shape; clean port.**

---

## §7 — Cross-cutting sequencing risks

### §7.1 RISK 1 (HIGH) — types/index.ts barrel must split first

The 92-importer surface is unbreakable into platform vs domain
without a per-symbol audit. Splitting the barrel is the
prerequisite to ANY platform extraction touching the types layer.

**Before:** 92 import sites need per-call inspection during
extraction.

**After:** 4 sub-files; each import path carries tier signal;
extraction is auto-classifiable.

### §7.2 RISK 2 (MEDIUM) — dashboardShell.ts type-shape extraction

The shell extraction needs `ProfileDropdownData` to become
generic-parameterized. 4 component edits required as
pre-extraction prep. Order: (a) parameterize type, (b) update 4
components, (c) THEN extract shell.

### §7.3 RISK 3 (LOW) — Notification dual-tier ambiguity

`Notification` type in `types/index.ts` is BD-specific, but
`NotificationEvent`/`NotificationToast` machinery (Pass 273 §2.2)
is platform-grade. The 12 import sites of `Notification` need to
move to `BDNotification = NotificationEvent<BDCategory, BDDeepLink>`
during the extraction pass. This is a deterministic rename, not a
design decision.

### §7.4 RISK 4 (LOW) — service-types files not yet rebased onto extracted types

`services/supabase/types.ts` defines its own `Vehicle` interface
distinct from `types/index.ts` `Vehicle`. Two `Vehicle` types
exist in the codebase. After extraction, these need explicit
relationship (DB shape → app shape adapter, or alias). The 3
importers go through `userDataUtils` already; the boundary is
small.

### §7.5 RISK 5 (MEDIUM) — `LoginView` and `userType` role-string drift

`LoginView` includes `"customer" | "shop" | "insurer"` mixed with
`"main" | "login" | "signup"`. The first three duplicate the
account-type role union (in services/supabase/types.ts `Profile.account_type`,
in types/dashboardShell.ts `ProfileDropdownData.userType`). Three
sources of role truth. Single canonical source needed before
extraction so platform-core auth abstraction has ONE role-token
contract to parameterize over.

---

## §8 — Type-extraction order recommendation

Based on the dependency graph, the safest type-extraction order:

1. **Audit `LoginView`/`userType`/`account_type` for role-token unification.** Single union. (Pre-extraction prep, source edit needed.)
2. **Split `types/index.ts` into platform/platform-shape/domain/notifications.** Re-export shim preserves import compatibility. (Pre-extraction prep, source edit needed.)
3. **Generic-parameterize `ProfileDropdownData<TItems>`.** 4 component edits. (Pre-extraction prep, source edit needed.)
4. **Verify `useNavigation` + `useAppearanceMode` are Tier-A-clean** post-split (re-run §6.2 check after barrel split).
5. **Audit `services/supabase/types.ts` Vehicle vs `types/index.ts` Vehicle.** Reconcile or document the relationship.
6. **THEN** platform-core type extraction is mechanical file-moves.

Steps 1-3 + 5 are **all source edits requiring owner authorization.** None are doctrine; they are pre-extraction prep. Pass 275 surfaces them; owner ratifies.

---

## §9 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- Does NOT bootstrap any repo / extract any subsystem / create any package.
- Does NOT split `types/index.ts` (that requires owner authorization per §8 step 2).
- Does NOT rename any role string (that requires owner authorization per §8 step 1).
- Does NOT generic-parameterize `ProfileDropdownData` (that requires owner authorization per §8 step 3).
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT re-open convergence-discovery lane — every finding fits Pass 271 #1 type-import-coupling category as stable doctrine.
- Does NOT supersede prior platform docs.

---

## §10 — What's deferred

Per relay #5 priority order, Pass 275 ships only Priority A. Five other
inventories remain (priorities B → E):

- **B. Token ownership map** (theme.css 4,913 lines) — largest future extraction surface by raw volume
- **C. Shell-slot contract mapping** — qualitative analysis of which shell components need which slots
- **D. Capability-vs-identity matrix** — interpretive synthesis; better after mechanical maps exist
- **E. Emotional-token inventory** — strategically important but not extraction-blocker

Plus from Pass 274 §8 deferred list:
- Provider/adapter matrix (partial overlap with Pass 274 §2)
- Subsystem boundary inventory (overlap with Pass 270 §6.2)

Each is its own future pass if/when authorized.

---

## §11 — Cross-references

- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — vendor / storage / realtime / route inventories. Pass 275 extends the execution-readiness lane with type-import depth.
- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — convergence verdict; framework Pass 275 uses as doctrine.
- Pass 271 [`PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md`](PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md) — type-import-coupling category #1; §5 dashboardShell coupling confirmed mechanically.
- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — 16-subsystem MVP nucleus; §6.1 confirms Tier A subsystems clean of BD types.
- Pass 269 [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) — 3-tier token architecture (the type analog: 3-tier type architecture).
- Pass 268 [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) — 4-tier extraction matrix.
- Owner relay 2026-05-09 #5 priority A explicit directive.

---

## §12 — Status

- **Drafted:** 2026-05-09 (Pass 275, Type-Import Dependency Graph lane).
- **Status:** ACTIVE reference. Mechanical inventory — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself. TRUE for any of the §8 step 1-5 source edits (role-token unification, types/index.ts split, ProfileDropdownData parameterization, Vehicle reconciliation).
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines:** Pass 271 #1 type-import-coupling category — converts qualitative finding to mechanical line-by-line surface.

**Forward triggers (any one re-opens an inventory pass):**

1. Owner authorizes any of the 5 deferred inventories in §10 (priorities B-E + provider/adapter matrix + subsystem boundary).
2. Owner ratifies any of the §8 step 1-5 pre-extraction prep tasks → source-edit work begins.
3. Owner ratifies any of the 31 cumulative decision points → relevant draft platform-LAW / extraction plan becomes authorable.
4. Real runtime defect surfaces (independent lane).
5. Owner provides Stacey answers (Pass 268 §8).

Until one fires: dormant.

The execution-readiness lane is now populated with two registries
(Pass 274) and one dependency graph (Pass 275). Together they
turn ~95% of Pass 273's qualitative seam taxonomy into mechanical
location data. The remaining inventories (priorities B-E) extend
this work to tokens, shell-slot contracts, capability-identity
synthesis, and emotional primitives.

The pre-extraction-prep work surfaced by §7 + §8 is the most
actionable extraction-risk reduction the inventory work can
produce. It is gated on owner authorization because each step
mutates source code.
