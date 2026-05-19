import { useEffect, useRef } from "react";

// Replace with your real Google AdSense publisher ID once approved.
// Format: "ca-pub-XXXXXXXXXXXXXXXX"
export const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined) ?? "";

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

/**
 * Lightweight Google AdSense slot.
 *
 * Renders nothing until ADSENSE_CLIENT is configured, so the marketing pages
 * stay clean during development and review.
 */
export default function AdSlot({ slot, format = "auto", className = "", label = true }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);

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
