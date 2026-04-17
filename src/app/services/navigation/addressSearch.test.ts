import { describe, expect, it } from "vitest";

import { addressSuggestionToResult, resolveSubmittedAddressResult } from "./addressSearch";
import type { NavigationAddressResult, NavigationAddressSuggestion } from "../../types/navigation";

function buildResult(overrides: Partial<NavigationAddressResult> = {}): NavigationAddressResult {
  return {
    id: "result-1",
    label: "White Plains, New York",
    primaryLabel: "White Plains",
    secondaryLabel: "Westchester County, New York",
    lat: 41.033,
    lng: -73.763,
    provider: "nominatim",
    ...overrides,
  };
}

function buildSuggestion(
  overrides: Partial<NavigationAddressSuggestion> = {}
): NavigationAddressSuggestion {
  return {
    id: "suggestion-1",
    title: "City of White Plains",
    subtitle: "Westchester County, New York",
    coordinate: { lat: 41.033, lng: -73.763 },
    intent: "address",
    confidenceScore: 92,
    provider: "nominatim",
    ...overrides,
  };
}

describe("address submit resolution", () => {
  it("commits a single full-search result", () => {
    const result = buildResult();

    expect(
      resolveSubmittedAddressResult({
        query: "White Plains, NY",
        results: [result],
        suggestions: [],
      })
    ).toEqual(result);
  });

  it("commits a uniquely matching result when multiple results are returned", () => {
    const result = buildResult({ id: "matching-result" });
    const otherResult = buildResult({
      id: "other-result",
      primaryLabel: "Albany",
      secondaryLabel: "Albany County, New York",
      label: "Albany, New York",
      lat: 42.6526,
      lng: -73.7562,
    });

    expect(
      resolveSubmittedAddressResult({
        query: "White Plains NY",
        results: [result, otherResult],
        suggestions: [],
      })
    ).toEqual(result);
  });

  it("commits a single high-confidence suggestion when no full-search result is available", () => {
    expect(
      resolveSubmittedAddressResult({
        query: "White Plains, NY",
        results: [],
        suggestions: [buildSuggestion()],
      })
    ).toEqual(addressSuggestionToResult(buildSuggestion()));
  });

  it("commits a dominant suggestion when it clearly outranks the next option", () => {
    expect(
      resolveSubmittedAddressResult({
        query: "White Plains, NY",
        results: [],
        suggestions: [
          buildSuggestion({ confidenceScore: 88 }),
          buildSuggestion({
            id: "suggestion-2",
            title: "White Plains Road",
            subtitle: "Bronx, New York",
            coordinate: { lat: 40.85, lng: -73.87 },
            confidenceScore: 71,
          }),
        ],
      })
    ).toEqual(addressSuggestionToResult(buildSuggestion({ confidenceScore: 88 })));
  });

  it("leaves ambiguous low-signal suggestion sets in manual-choice mode", () => {
    expect(
      resolveSubmittedAddressResult({
        query: "Main Street",
        results: [],
        suggestions: [
          buildSuggestion({
            title: "123 Main Street",
            subtitle: "White Plains, New York",
            confidenceScore: 78,
          }),
          buildSuggestion({
            id: "suggestion-2",
            title: "456 Main Street",
            subtitle: "Yonkers, New York",
            coordinate: { lat: 40.9312, lng: -73.8988 },
            confidenceScore: 74,
          }),
        ],
      })
    ).toBeNull();
  });
});
