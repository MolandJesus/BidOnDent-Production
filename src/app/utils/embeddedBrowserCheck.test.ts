/**
 * Tests for embeddedBrowserCheck — Pass 210.
 *
 * UA-string heuristic for detecting embedded browsers that Google OAuth
 * blocks with `disallowed_useragent`. Pure function; only dependency is
 * `navigator.userAgent`.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { describeEmbeddedBrowser, isEmbeddedBrowser } from "./embeddedBrowserCheck";

const ORIGINAL_UA = navigator.userAgent;

function setUA(ua: string): void {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

beforeEach(() => {
  setUA(ORIGINAL_UA);
});

afterEach(() => {
  setUA(ORIGINAL_UA);
});

describe("isEmbeddedBrowser", () => {
  it("returns false for vanilla Chrome on macOS", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    expect(isEmbeddedBrowser()).toBe(false);
  });

  it("returns false for vanilla Firefox", () => {
    setUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0");
    expect(isEmbeddedBrowser()).toBe(false);
  });

  it("returns false for vanilla Safari", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
    );
    expect(isEmbeddedBrowser()).toBe(false);
  });

  it("detects Electron shells", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Electron/28.0.0 Safari/537.36"
    );
    expect(isEmbeddedBrowser()).toBe(true);
  });

  it("detects Android WebView (wv marker)", () => {
    setUA(
      "Mozilla/5.0 (Linux; Android 14; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36"
    );
    expect(isEmbeddedBrowser()).toBe(true);
  });

  it("detects VS Code Simple Browser (VSCode UA fragment)", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) VSCode/1.90.0 Safari/537.36"
    );
    expect(isEmbeddedBrowser()).toBe(true);
  });

  it("detects VS Code via Code/x.y.z fragment", () => {
    setUA("Mozilla/5.0 Code/1.90.0 Electron/28.0.0");
    expect(isEmbeddedBrowser()).toBe(true);
  });

  it("returns false when navigator is undefined (SSR safety)", () => {
    const original = global.navigator;
    // @ts-expect-error - simulate SSR
    delete global.navigator;
    try {
      expect(isEmbeddedBrowser()).toBe(false);
    } finally {
      global.navigator = original;
    }
  });
});

describe("describeEmbeddedBrowser", () => {
  it("returns 'VS Code's Simple Browser' for VSCode UA", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 VSCode/1.90.0 Safari/537.36"
    );
    expect(describeEmbeddedBrowser()).toBe("VS Code's Simple Browser");
  });

  it("returns 'an Electron-based browser' for non-VSCode Electron", () => {
    setUA("Mozilla/5.0 AppleWebKit/537.36 Electron/28.0.0 Safari/537.36");
    expect(describeEmbeddedBrowser()).toBe("an Electron-based browser");
  });

  it("returns 'an Android WebView' for wv marker", () => {
    setUA("Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Mobile Safari/537.36");
    expect(describeEmbeddedBrowser()).toBe("an Android WebView");
  });

  it("returns null for vanilla Chrome", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
    );
    expect(describeEmbeddedBrowser()).toBeNull();
  });

  it("returns null when navigator is undefined", () => {
    const original = global.navigator;
    // @ts-expect-error - simulate SSR
    delete global.navigator;
    try {
      expect(describeEmbeddedBrowser()).toBeNull();
    } finally {
      global.navigator = original;
    }
  });
});
