import { ADSENSE_CLIENT } from "@/config/adsense";

const CONSENT_KEY = "pt_cookie_consent"; // "accepted" | "declined"
const CONSENT_EVENT = "pt:consent-change";

export type ConsentState = "accepted" | "declined" | "unknown";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === "accepted" || v === "declined") return v;
  return "unknown";
}

export function setConsent(value: "accepted" | "declined") {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  if (value === "accepted") void loadAdsenseScript();
}

export function onConsentChange(cb: (state: ConsentState) => void) {
  const handler = () => cb(getConsent());
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

let scriptPromise: Promise<void> | null = null;

/**
 * Inject the AdSense library exactly once. Safe to call from many AdSlots —
 * subsequent calls return the same promise.
 */
export function loadAdsenseScript(): Promise<void> {
  if (!ADSENSE_CLIENT) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    // Already on the page (e.g. another tab/script added it)
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
      ADSENSE_CLIENT,
    )}`;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fail silently — adblock etc.
    document.head.appendChild(s);
  });

  return scriptPromise;
}
