import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { useIsMobile } from "@/shared/lib/hooks/use-mobile";

const DESKTOP_WIDTH = 1024;
const MOBILE_WIDTH = 375;

function mockMatchMedia() {
  const listeners = new Set<() => void>();
  const addEventListener = vi.fn<(event: string, listener: () => void) => void>(
    (event, listener) => {
      if (event === "change") {
        listeners.add(listener);
      }
    },
  );
  const removeEventListener = vi.fn<(event: string, listener: () => void) => void>(
    (event, listener) => {
      if (event === "change") {
        listeners.delete(listener);
      }
    },
  );

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: window.innerWidth < 768,
      media: "(max-width: 767px)",
      addEventListener,
      removeEventListener,
    })),
  );

  return {
    addEventListener,
    removeEventListener,
    triggerChange: () => {
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

function ServerProbe() {
  return createElement("span", null, String(useIsMobile()));
}

describe("useIsMobile hook", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false on desktop widths and true on mobile widths", () => {
    expect.hasAssertions();
    mockMatchMedia();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: DESKTOP_WIDTH,
    });

    const { result: desktopResult } = renderHook(() => useIsMobile());
    expect(desktopResult.current).toBe(false);

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: MOBILE_WIDTH,
    });

    const { result: mobileResult } = renderHook(() => useIsMobile());
    expect(mobileResult.current).toBe(true);
  });

  it("updates when media query change event fires and cleans up listener on unmount", () => {
    expect.hasAssertions();
    const { addEventListener, removeEventListener, triggerChange } = mockMatchMedia();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: DESKTOP_WIDTH,
    });

    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: MOBILE_WIDTH,
      });
      triggerChange();
    });

    expect(result.current).toBe(true);

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("returns false during server-side rendering", () => {
    expect.hasAssertions();

    expect(renderToString(createElement(ServerProbe))).toContain("false");
  });
});
