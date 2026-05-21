import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ADSENSE_CLIENT } from "@/config/adsense";

interface AdSlotProps {
  /** AdSense ad unit slot ID (the numeric `data-ad-slot`). */
  slot: string;
  /** Ad format. "auto" responds to container size. */
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  /** Optional className for the wrapper. */
  className?: string;
  /** Show a label above the ad. Required by some ad networks / good UX. */
  label?: boolean;
}

// Get-or-create a per-tab session id so the same visitor doesn't inflate impression counts
// across rapid re-renders. Reset when the tab is closed.
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

// In-memory dedupe so we only log one impression per slot per page view in a session.
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
    /* swallow — analytics must never break the page */
  }
}

/**
 * Lightweight Google AdSense slot with built-in impression tracking.
 *
 * Renders nothing until ADSENSE_CLIENT is configured, but still records the
 * impression to the `ad_impressions` table so you can measure traffic per
 * page even before AdSense approval.
 */
export default function AdSlot({ slot, format = "auto", className = "", label = true }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    trackImpression(slot, path);
  }, [slot]);

  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* swallow — adblock or script not yet loaded */
    }
  }, [slot]);

  if (!ADSENSE_CLIENT) return null;

  return (
    <div className={`my-8 ${className}`}>
      {label && (
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Advertisement
        </p>
      )}
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
