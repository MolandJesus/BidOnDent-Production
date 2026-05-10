# `src/platform-core/`

This folder holds **platform-tier** code: small, vendor-neutral primitives
that are shared by BidOnDent today and reusable by future branded sites
(e.g. Stacey's site) tomorrow.

## Inclusion criteria

A file belongs in `platform-core/` only if it satisfies ALL seven of the
mandatory extraction questions from owner relay 2026-05-10 #19:

1. Structurally reusable
2. Behaviorally reusable
3. Authority-localized
4. Continuity-insensitive (or carries doctrine that travels with it)
5. Trust-insensitive (or carries doctrine that travels with it)
6. Orchestration-depth-neutral
7. Does NOT centralize ownership when extracted

The classification framework is in
[`docs/REF_PASS_295_TIER_A_DOCTRINE_DEEP_DIVE_2026-05-10.md`](../../docs/REF_PASS_295_TIER_A_DOCTRINE_DEEP_DIVE_2026-05-10.md).
The extraction-trigger taxonomy is in
[`docs/REF_PASS_297_TIER_B_DOCTRINE_DEEP_DIVE_BATCH_1_2026-05-10.md`](../../docs/REF_PASS_297_TIER_B_DOCTRINE_DEEP_DIVE_BATCH_1_2026-05-10.md) §5.

## Resist sprawl

Per relay #21: this folder should remain **sparse**. New additions earn
their place ONLY via:
- the **designed-for-extraction** trigger (vendor-neutral by construction), or
- the **duplication-triggered** trigger (a second consumer demonstrated
  genuine shared need).

Do NOT use this folder as a generic `utils/` dumping ground. Per relay #21:
"avoid mega shared folders."

## Import direction

`platform-core/` may import from `node_modules` only. It must NOT import
from `src/app/` or any consumer-app code. The import-direction discipline
is the seam.

## Current contents

- [`cn.ts`](./cn.ts) — class-name helper (`clsx` + `tailwind-merge`).
  Extracted Pass 299 (2026-05-10) per
  [`docs/REF_PASS_298_FIRST_MICRO_EXTRACTION_SPEC_CN_2026-05-10.md`](../../docs/REF_PASS_298_FIRST_MICRO_EXTRACTION_SPEC_CN_2026-05-10.md).
- [`useOnlineStatus.ts`](./useOnlineStatus.ts) — browser online/offline
  status hook. Reports state only; consumer renders its own offline UX.
  Extracted Pass 301 (2026-05-10) per
  [`docs/REF_PASS_300_PLATFORM_CORE_PRESSURE_AUDIT_2026-05-10.md`](../../docs/REF_PASS_300_PLATFORM_CORE_PRESSURE_AUDIT_2026-05-10.md) §5.
