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

async function trackImpression(slot: string, pagePath: string) {
  const key = `${slot}|${pagePath}`;
  if (logged.has(key)) return;
  logged.add(key);
  try {
    await supabase.from("ad_impressions").insert({
      slot_id: slot,
      page_path: pagePath,
      session_id: getSessionId(),
    });
  } catch {
    /* analytics must never break the page */
  }
}

/**
 * Google AdSense slot.
 *
 * Behavior:
 *   1. Renders an empty reserved space until visible in the viewport
 *      (IntersectionObserver, 200px rootMargin).
 *   2. Once visible AND the user has accepted cookies, loads the AdSense
 *      script (once globally) and pushes the ad.
 *   3. Impressions are tracked when the slot becomes visible — independent of
 *      consent — so you still measure traffic per page.
 */
export default function AdSlot({ slot, format = "auto", className = "", label = true }: AdSlotProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [consent, setConsentState] = useState(getConsent());

  // Watch for consent changes (so an ad already scrolled into view fills in
  // immediately after the user accepts).
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

  // If AdSense isn't configured at all, render nothing visible (but still keep
  // the wrapper so impressions can be measured for empty placements? No — only
  // render when configured to avoid layout shift on real pages).
  if (!ADSENSE_CLIENT) return null;

  const showAd = visible && consent === "accepted";

  return (
    <div ref={wrapRef} className={`my-8 ${className}`} style={{ minHeight: 100 }}>
      {label && (
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Advertisement
        </p>
      )}
      {showAd && (
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
