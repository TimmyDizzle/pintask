import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ADSENSE_CLIENT } from "@/config/adsense";
import { getConsent, loadAdsenseScript, onConsentChange } from "@/lib/adsense";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: boolean;
}

/** Stable placeholder dimensions for each ad format to minimize CLS. */
const SLOT_STYLE: Record<NonNullable<AdSlotProps["format"]>, React.CSSProperties> = {
  auto:       { minHeight: 250, maxHeight: 300 },   // responsive — bounded range
  rectangle:  { height: 250 },                       // 300×250
  horizontal: { height: 90, maxHeight: 120 },        // leaderboard
  vertical:   { height: 600 },                       // skyscraper / half-page
};

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "pt_ad_session";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

const logged = new Set<string>();

async function trackImpression(
  slot: string,
  pagePath: string,
  consentState: "accepted" | "declined" | "unknown",
) {
  const key = `${slot}|${pagePath}|${consentState}`;
  if (logged.has(key)) return;
  logged.add(key);
  try {
    await supabase.from("ad_impressions").insert({
      slot_id: slot,
      page_path: pagePath,
      session_id: getSessionId(),
      consent_state: consentState,
    });
  } catch {
    /* analytics must never break the page */
  }
}

/**
 * Google AdSense slot with CLS-conscious placeholder sizing.
 *
 * Behavior:
 *   1. Reserves a fixed-size placeholder immediately (no layout shift).
 *   2. Reveals via IntersectionObserver (200px rootMargin) to lazy-load.
 *   3. Only pushes the ad to AdSense when consent === "accepted".
 *   4. Tracks impressions on visibility regardless of consent.
 */
export default function AdSlot({ slot, format = "auto", className = "", label = true }: AdSlotProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [consent, setConsentState] = useState(getConsent());

  const size = SLOT_STYLE[format];

  useEffect(() => onConsentChange(setConsentState), []);

  // Lazy reveal via IntersectionObserver
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // Track impression on first visibility
  useEffect(() => {
    if (!visible) return;
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    trackImpression(slot, path);
  }, [visible, slot]);

  // Load AdSense + push ad once we have visibility + consent + client id
  useEffect(() => {
    if (!visible || consent !== "accepted" || !ADSENSE_CLIENT || pushedRef.current) return;
    pushedRef.current = true;
    loadAdsenseScript().then(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        /* adblock or load failure */
      }
    });
  }, [visible, consent]);

  if (!ADSENSE_CLIENT) return null;

  const showAd = visible && consent === "accepted";

  return (
    <div ref={wrapRef} className={`my-8 ${className}`}>
      {label && (
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Advertisement
        </p>
      )}
      <div
        className="relative overflow-hidden rounded-lg border border-border/30 bg-muted/20"
        style={size}
      >
        {showAd ? (
          <ins
            className="adsbygoogle block w-full h-full"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          /* Placeholder keeps the reserved space consistent before/after load */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-full p-2">
              <div className="h-full w-full rounded-md border border-dashed border-border/30" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
