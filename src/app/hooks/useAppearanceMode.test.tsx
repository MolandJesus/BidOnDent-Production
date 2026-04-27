import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAppearanceMode } from "./useAppearanceMode";

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
  };
}

function AppearanceModeHarness() {
  const [appearanceMode, setAppearanceMode] = useAppearanceMode();

  return (
    <div>
      <div data-testid="appearance-mode">{appearanceMode}</div>
      <button onClick={() => setAppearanceMode("light")} type="button">
        Set Light
      </button>
      <button onClick={() => setAppearanceMode("map-dark")} type="button">
        Set Dark
      </button>
    </div>
  );
}

describe("useAppearanceMode", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
    document.documentElement.removeAttribute("data-appearance-mode");
    document.documentElement.style.colorScheme = "";
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        media: "(prefers-color-scheme: light)",
        onchange: null,
      })),
    });
  });

  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute("data-appearance-mode");
    document.documentElement.style.colorScheme = "";
  });

  it("defaults to the saved appearance mode when one exists", () => {
    window.localStorage.setItem("bidondent.appearance-mode", "light");

    render(<AppearanceModeHarness />);

    expect(screen.getByTestId("appearance-mode").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-appearance-mode")).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("falls back to the system preference when nothing is saved", () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      media: "(prefers-color-scheme: light)",
      onchange: null,
    }));

    render(<AppearanceModeHarness />);

    expect(screen.getByTestId("appearance-mode").textContent).toBe("light");
    expect(window.localStorage.getItem("bidondent.appearance-mode")).toBe("light");
  });

  it("clears invalid saved modes and falls back to map-dark", () => {
    window.localStorage.setItem("bidondent.appearance-mode", "purple");

    render(<AppearanceModeHarness />);

    expect(screen.getByTestId("appearance-mode").textContent).toBe("map-dark");
    expect(window.localStorage.getItem("bidondent.appearance-mode")).toBe("map-dark");
  });

  it("persists mode changes from the setter", () => {
    render(<AppearanceModeHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Set Light" }));
    expect(screen.getByTestId("appearance-mode").textContent).toBe("light");
    expect(window.localStorage.getItem("bidondent.appearance-mode")).toBe("light");

    fireEvent.click(screen.getByRole("button", { name: "Set Dark" }));
    expect(screen.getByTestId("appearance-mode").textContent).toBe("map-dark");
    expect(window.localStorage.getItem("bidondent.appearance-mode")).toBe("map-dark");
  });

  it("syncs appearance mode changes across storage events", () => {
    render(<AppearanceModeHarness />);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "bidondent.appearance-mode",
          newValue: "light",
        })
      );
    });

    expect(screen.getByTestId("appearance-mode").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-appearance-mode")).toBe("light");
  });
});
