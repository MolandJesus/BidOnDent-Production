import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNavigation } from "./useNavigation";

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: () => null,
    length: 0,
  };
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Harness({
  output,
}: {
  output: (out: ReturnType<typeof useNavigation>) => void;
}) {
  const nav = useNavigation();
  output(nav);
  return null;
}

function mountHook() {
  let api: ReturnType<typeof useNavigation> | null = null;
  render(<Harness output={(out) => (api = out)} />);
  return () => api!;
}

describe("useNavigation — KI-132 history pushState vs replaceState (Pass 201)", () => {
  it("first nav write seeds the history slot via pushState", () => {
    const pushSpy = vi.spyOn(history, "pushState");
    const replaceSpy = vi.spyOn(history, "replaceState");
    mountHook();
    // Initial mount triggers exactly one effect-driven write — the seed push.
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("peer-tab swap (currentTab only) uses replaceState, not pushState", () => {
    const get = mountHook();
    const pushSpy = vi.spyOn(history, "pushState");
    const replaceSpy = vi.spyOn(history, "replaceState");

    act(() => {
      get().navigateToTab("bids");
    });
    act(() => {
      get().navigateToTab("find-shops");
    });
    act(() => {
      get().navigateToTab("reports");
    });

    // Three peer-tab swaps within viewMode=dashboard — all replace.
    expect(replaceSpy).toHaveBeenCalledTimes(3);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("viewMode change pushes a new history entry", () => {
    const get = mountHook();
    const pushSpy = vi.spyOn(history, "pushState");
    const replaceSpy = vi.spyOn(history, "replaceState");

    act(() => {
      get().setViewMode("vehicles");
    });

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("selectedReportId change pushes a new history entry", () => {
    const get = mountHook();
    const pushSpy = vi.spyOn(history, "pushState");
    const replaceSpy = vi.spyOn(history, "replaceState");

    act(() => {
      get().setSelectedReportId("rpt_abc");
    });

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("popstate-restored state does not push or replace (silent record)", () => {
    const get = mountHook();
    // Simulate browser popstate restoring an earlier nav state.
    const popState = new PopStateEvent("popstate", {
      state: { currentTab: "bids", viewMode: "dashboard", selectedReportId: null },
    });

    const pushSpy = vi.spyOn(history, "pushState");
    const replaceSpy = vi.spyOn(history, "replaceState");

    act(() => {
      window.dispatchEvent(popState);
    });

    expect(pushSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
    expect(get().currentTab).toBe("bids");
  });

  it("forward navigation after popstate-restore classifies correctly (peer-tab → replace)", () => {
    const get = mountHook();
    // Restore from history.
    act(() => {
      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: { currentTab: "bids", viewMode: "dashboard", selectedReportId: null },
        })
      );
    });

    const pushSpy = vi.spyOn(history, "pushState");
    const replaceSpy = vi.spyOn(history, "replaceState");

    // Now swap tab — this is a peer-tab change vs. the restored state.
    act(() => {
      get().navigateToTab("home");
    });

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).not.toHaveBeenCalled();
  });
});
