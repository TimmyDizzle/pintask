import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getConsent, setConsent, onConsentChange } from "@/lib/adsense";

/**
 * Bottom-left cookie consent banner. Renders only until the user picks an
 * option, then never again. Ads + non-essential trackers should check
 * `getConsent() === "accepted"` before loading.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === "unknown");
    return onConsentChange((s) => setVisible(s === "unknown"));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:left-4 sm:max-w-md">
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur p-4 shadow-lg">
        <p className="text-sm text-foreground">
          We use cookies for analytics and ad personalization.{" "}
          <Link to="/privacy" className="underline underline-offset-2">Learn more</Link>.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setConsent("accepted")}>Accept all</Button>
          <Button size="sm" variant="outline" onClick={() => setConsent("declined")}>
            Essential only
          </Button>
        </div>
      </div>
    </div>
  );
}
