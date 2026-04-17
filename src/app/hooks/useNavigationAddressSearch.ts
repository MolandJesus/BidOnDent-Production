/**
 * useNavigationAddressSearch — Address query, suggestion, search, and manual
 * origin selection lifecycle.
 *
 * Extracted from useCoverageNavigationExperience.ts (Pass 31). Zero behavior change.
 */

import { useEffect, useRef, useState } from "react";
import type { NavigationAddressResult, NavigationAddressSuggestion } from "../types/navigation";
import type { CoverageSearchTarget } from "../components/maps/serviceCoverageMapTypes";
import {
  addressResultToSearchTarget,
  searchNavigationAddresses,
  suggestNavigationAddresses,
} from "../services/navigation/addressSearch";
import { createTimeoutAbortController } from "../services/navigation/requestTimeout";

export type NavigationAddressSearchResult = {
  addressQuery: string;
  setAddressQuery: (value: string) => void;
  addressResults: NavigationAddressResult[];
  addressSuggestions: NavigationAddressSuggestion[];
  selectedAddressResult: NavigationAddressResult | null;
  selectedManualOriginTarget: CoverageSearchTarget | null;
  isSearchingAddresses: boolean;
  addressError: string;
  searchAddresses: () => Promise<NavigationAddressResult[]>;
  chooseAddressResult: (result: NavigationAddressResult) => void;
  selectManualOrigin: (target: CoverageSearchTarget) => void;
  clearAddressResult: () => void;
  clearManualOrigin: () => void;
};

export function useNavigationAddressSearch(): NavigationAddressSearchResult {
  const [addressQuery, setAddressQueryState] = useState("");
  const [addressResults, setAddressResults] = useState<NavigationAddressResult[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<NavigationAddressSuggestion[]>([]);
  const [selectedAddressResult, setSelectedAddressResult] =
    useState<NavigationAddressResult | null>(null);
  const [selectedManualOriginTarget, setSelectedManualOriginTarget] =
    useState<CoverageSearchTarget | null>(null);
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");

  const addressSearchAbortRef = useRef<AbortController | null>(null);
  const addressSuggestAbortRef = useRef<AbortController | null>(null);
  const suggestionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      addressSearchAbortRef.current?.abort();
      addressSuggestAbortRef.current?.abort();
      if (suggestionDebounceRef.current) {
        clearTimeout(suggestionDebounceRef.current);
      }
    };
  }, []);

  async function searchAddresses() {
    if (addressQuery.trim().length < 4) {
      setAddressError("Enter a full house, store, or street address to search.");
      setAddressResults([]);
      return [];
    }

    addressSearchAbortRef.current?.abort();
    const addressRequest = createTimeoutAbortController(12000);
    addressSearchAbortRef.current = addressRequest.controller;
    setIsSearchingAddresses(true);
    setAddressError("");

    try {
      const results = await searchNavigationAddresses(
        addressQuery,
        addressRequest.controller.signal
      );
      setAddressResults(results);

      if (results.length === 0) {
        setAddressError("No address matches were found. Try a fuller address.");
      }

      return results;
    } catch (error) {
      if (!addressRequest.controller.signal.aborted || addressRequest.didTimeout()) {
        setAddressError(error instanceof Error ? error.message : "Address lookup failed.");

        if (addressRequest.didTimeout()) {
          setAddressError("Address lookup timed out. Try a shorter query or retry.");
        }

        setAddressResults([]);
      }

      return [];
    } finally {
      addressRequest.clear();

      if (addressSearchAbortRef.current === addressRequest.controller) {
        addressSearchAbortRef.current = null;
      }

      if (!addressRequest.controller.signal.aborted || addressRequest.didTimeout()) {
        setIsSearchingAddresses(false);
      }
    }
  }

  function chooseAddressResult(result: NavigationAddressResult) {
    setSelectedAddressResult(result);
    setSelectedManualOriginTarget(addressResultToSearchTarget(result));
    setAddressQueryState(result.primaryLabel);
    setAddressResults([]);
    setAddressSuggestions([]);
    setAddressError("");
  }

  function clearManualOriginSelection() {
    setSelectedAddressResult(null);
    setSelectedManualOriginTarget(null);
    setAddressError("");
    setAddressResults([]);
    setAddressSuggestions([]);
  }

  function setAddressQuery(value: string) {
    setAddressQueryState(value);
    setAddressError("");
    setAddressResults([]);
    setAddressSuggestions([]);

    // Debounced predictive suggestions
    if (suggestionDebounceRef.current) {
      clearTimeout(suggestionDebounceRef.current);
    }
    addressSuggestAbortRef.current?.abort();

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setAddressSuggestions([]);
      return;
    }

    suggestionDebounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      addressSuggestAbortRef.current = controller;
      suggestNavigationAddresses(trimmed, controller.signal)
        .then((suggestions) => {
          if (!controller.signal.aborted) {
            setAddressSuggestions(suggestions);
          }
        })
        .catch(() => {
          // suggestion errors are silent
        });
    }, 250);
  }

  function selectManualOrigin(target: CoverageSearchTarget) {
    setSelectedAddressResult(null);
    setSelectedManualOriginTarget(target);
    setAddressQueryState(target.label);
    setAddressError("");
    setAddressResults([]);
    setAddressSuggestions([]);
  }

  return {
    addressQuery,
    setAddressQuery,
    addressResults,
    addressSuggestions,
    selectedAddressResult,
    selectedManualOriginTarget,
    isSearchingAddresses,
    addressError,
    searchAddresses,
    chooseAddressResult,
    selectManualOrigin,
    clearAddressResult: clearManualOriginSelection,
    clearManualOrigin: clearManualOriginSelection,
  };
}
