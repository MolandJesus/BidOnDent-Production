import { Briefcase, Car, Shield } from "lucide-react";
import { describe, expect, it } from "vitest";

import { getRoleAccent, getRoleIcon } from "./shopDirectoryScreenUtils";

describe("shopDirectoryScreenUtils", () => {
  it("maps each market role to the correct icon", () => {
    expect(getRoleIcon("customer")).toBe(Car);
    expect(getRoleIcon("shop")).toBe(Briefcase);
    expect(getRoleIcon("insurer")).toBe(Shield);
  });

  it("returns stable accent classes for light and dark appearance modes", () => {
    expect(getRoleAccent("customer", true)).toBe("bg-blue-50 text-blue-700 border-blue-300/60");
    expect(getRoleAccent("customer", false)).toBe(
      "bg-blue-400/15 text-blue-200 border-blue-400/30",
    );

    expect(getRoleAccent("shop", true)).toBe("bg-amber-50 text-amber-700 border-amber-300/60");
    expect(getRoleAccent("shop", false)).toBe(
      "bg-amber-400/15 text-amber-300 border-amber-400/30",
    );

    expect(getRoleAccent("insurer", true)).toBe(
      "bg-emerald-50 text-emerald-700 border-emerald-300/60",
    );
    expect(getRoleAccent("insurer", false)).toBe(
      "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    );
  });
});
