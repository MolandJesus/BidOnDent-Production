import { describe, expect, it } from "vitest";
import { toggleRoleCollectionShopId } from "./shopMapRoleCollections";

describe("toggleRoleCollectionShopId", () => {
  it("adds shop ID when not present", () => {
    expect(toggleRoleCollectionShopId([], 42)).toEqual([42]);
  });

  it("adds to existing collection", () => {
    expect(toggleRoleCollectionShopId([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it("removes shop ID when present", () => {
    expect(toggleRoleCollectionShopId([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("does not mutate original array", () => {
    const original = [1, 2, 3];
    toggleRoleCollectionShopId(original, 2);
    expect(original).toEqual([1, 2, 3]);
  });

  it("handles removing last item", () => {
    expect(toggleRoleCollectionShopId([5], 5)).toEqual([]);
  });
});
