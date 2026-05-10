/**
 * Pass 23 / Step A (cowork-A) — re-export shim.
 *
 * The component implementation moved to the canonical map-program shell
 * location at `src/app/components/maps/shell/MapProgramTopBar.tsx` per
 * master-builder Pass 180 §7.5 authorization and §7.1 layer-placement
 * directive.
 *
 * This file is preserved as a re-export so existing consumers
 * (`ShopDirectoryImmersiveMap`, `ShopDirectoryHybridStage`, and any
 * other downstream imports) continue to work unchanged. The re-export
 * is API-identical: same default-export, same prop type, same DOM
 * output, same handler semantics. Pure presentational lift per the
 * Pass 180 §7.5 directive — zero behavior change.
 *
 * Future passes that consume the unified top bar should import directly
 * from `components/maps/shell/MapProgramTopBar` instead of through this
 * shim. Once all consumers migrate, this shim can be removed in a
 * janitor pass.
 *
 * Refs:
 *  - PLAN_MAP_UNIFICATION_2026-05-08.md §4 Step A, §7.5
 *  - LAW_LAYERED_ARCHITECTURE.md (canonical shell location)
 */

export type { MapProgramTopBarProps as ImmersiveMapTopBarProps } from "../maps/shell/MapProgramTopBar";
export { default } from "../maps/shell/MapProgramTopBar";
