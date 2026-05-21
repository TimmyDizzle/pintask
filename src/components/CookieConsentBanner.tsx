import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getConsent, setConsent, onConsentChange, type ConsentState } from "@/lib/adsense";
import { Cookie } from "lucide-react";

/**
 * Bottom-left cookie consent banner.
 *
 *  - Shows automatically on first load (consent "unknown").
 *  - Hidden after the user picks "Accept all" or "Essential only".
 *  - A floating cookie icon lets the user reopen and change their choice.
 */
export default function CookieConsentBanner() {
  const [consent, setConsentState] = useState<ConsentState>(() => getConsent());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setConsentState(getConsent());
    const handler = () => {
      const s = getConsent();
      setConsentState(s);
      if (s !== "unknown") setOpen(false);
    };
    return onConsentChange(handler);
  }, []);

  const bannerOpen = consent === "unknown" || open;

  const handleChoice = useCallback((value: "accepted" | "declined") => {
    setConsent(value);
  }, []);

  return (
    <>
      {bannerOpen && (
        <div className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:left-4 sm:max-w-md">
          <div className="rounded-xl border border-border bg-card/95 backdrop-blur p-4 shadow-lg">
            <p className="text-sm text-foreground">
              We use cookies for analytics and ad personalization.{" "}
              <Link to="/privacy" className="underline underline-offset-2">
                Learn more
              </Link>
              .
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant={consent === "accepted" ? "default" : "outline"}
                onClick={() => handleChoice("accepted")}
              >
                Accept all
              </Button>
              <Button
                size="sm"
                variant={consent === "declined" ? "default" : "outline"}
                onClick={() => handleChoice("declined")}
              >
                Essential only
              </Button>
            </div>
            {consent !== "unknown" && (
              <button
                onClick={() => setOpen(false)}
                className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating cookie icon to reopen preferences */}
      {!bannerOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur shadow-md hover:shadow-lg transition-shadow"
          aria-label="Manage cookie preferences"
          title="Cookie preferences"
        >
          <Cookie className="h-5 w-5 text-muted-foreground" />
        </button>
      )}
    </>
  );
}
