import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

// --- Mocks ---------------------------------------------------------------

vi.mock("@/config/adsense", () => ({
  ADSENSE_CLIENT: "ca-pub-test",
  AD_SLOTS: {},
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert: vi.fn().mockResolvedValue({}) }) },
}));

const loadAdsenseScript = vi.fn().mockResolvedValue(undefined);
let consentState: "accepted" | "declined" | "unknown" = "unknown";
const consentListeners = new Set<(s: typeof consentState) => void>();

vi.mock("@/lib/adsense", () => ({
  loadAdsenseScript: (...args: unknown[]) => loadAdsenseScript(...args),
  getConsent: () => consentState,
  setConsent: (v: "accepted" | "declined") => {
    consentState = v;
    consentListeners.forEach((cb) => cb(consentState));
  },
  onConsentChange: (cb: (s: typeof consentState) => void) => {
    consentListeners.add(cb);
    return () => consentListeners.delete(cb);
  },
}));

// IntersectionObserver stub that exposes a trigger per instance.
type IOCallback = (entries: { isIntersecting: boolean }[]) => void;
const observers: { trigger: (visible: boolean) => void }[] = [];

class MockIO {
  constructor(private cb: IOCallback) {
    observers.push({
      trigger: (visible) => this.cb([{ isIntersecting: visible }]),
    });
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

import AdSlot from "./AdSlot";

beforeEach(() => {
  loadAdsenseScript.mockClear();
  consentState = "unknown";
  consentListeners.clear();
  observers.length = 0;
  (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
  vi.stubGlobal("IntersectionObserver", MockIO);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdSlot lazy load", () => {
  it("does not load AdSense before the slot is visible, even with consent", async () => {
    consentState = "accepted";
    render(<AdSlot slot="123" />);
    // Visible? No — IO hasn't fired.
    await Promise.resolve();
    expect(loadAdsenseScript).not.toHaveBeenCalled();
    expect(screen.queryByText("Advertisement")).toBeInTheDocument(); // label renders
    expect(document.querySelector("ins.adsbygoogle")).toBeNull();
  });

  it("does not load AdSense when visible but consent not granted", async () => {
    render(<AdSlot slot="123" />);
    act(() => observers[0].trigger(true));
    await Promise.resolve();
    expect(loadAdsenseScript).not.toHaveBeenCalled();
    expect(document.querySelector("ins.adsbygoogle")).toBeNull();
  });

  it("loads AdSense only after BOTH visibility and consent", async () => {
    render(<AdSlot slot="123" />);
    // Become visible first
    act(() => observers[0].trigger(true));
    await Promise.resolve();
    expect(loadAdsenseScript).not.toHaveBeenCalled();

    // Then grant consent
    await act(async () => {
      consentState = "accepted";
      consentListeners.forEach((cb) => cb(consentState));
    });
    await Promise.resolve();

    expect(loadAdsenseScript).toHaveBeenCalledTimes(1);
    expect(document.querySelector("ins.adsbygoogle")).not.toBeNull();
  });

  it("loads AdSense when consent precedes visibility", async () => {
    consentState = "accepted";
    render(<AdSlot slot="123" />);
    expect(loadAdsenseScript).not.toHaveBeenCalled();

    act(() => observers[0].trigger(true));
    await Promise.resolve();

    expect(loadAdsenseScript).toHaveBeenCalledTimes(1);
  });

  it("does not load again when declined then becoming visible", async () => {
    consentState = "declined";
    render(<AdSlot slot="123" />);
    act(() => observers[0].trigger(true));
    await Promise.resolve();
    expect(loadAdsenseScript).not.toHaveBeenCalled();
    expect(document.querySelector("ins.adsbygoogle")).toBeNull();
  });
});
