import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { getConsent, setConsent, onConsentChange, type ConsentState } from "@/lib/adsense";
import { Cookie, X } from "lucide-react";

/**
 * Centered cookie consent modal.
 *
 *  - Shows automatically on first load (consent "unknown").
 *  - Hidden after the user picks "Accept all" or "Reject all" / saves preferences.
 *  - A floating cookie icon lets the user reopen and change their choice.
 */
export default function CookieConsentBanner() {
  const [consent, setConsentState] = useState<ConsentState>(() => getConsent());
  const [open, setOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    setConsentState(getConsent());
    const handler = () => {
      const s = getConsent();
      setConsentState(s);
      if (s !== "unknown") {
        setOpen(false);
        setShowCustomize(false);
      }
    };
    return onConsentChange(handler);
  }, []);

  const bannerOpen = consent === "unknown" || open;

  const handleChoice = useCallback((value: "accepted" | "declined") => {
    setConsent(value);
    setShowCustomize(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    setConsent(analyticsEnabled ? "accepted" : "declined");
    setShowCustomize(false);
  }, [analyticsEnabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setShowCustomize(false);
  }, []);

  return (
    <>
      {bannerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="p-6 sm:p-8">
              {consent !== "unknown" && (
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close cookie preferences"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                We value your privacy
              </h2>

              {!showCustomize ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
                    <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
                      Cookie Policy
                    </Link>
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCustomize(true)}
                    >
                      Customize
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleChoice("declined")}
                    >
                      Reject All
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleChoice("accepted")}
                    >
                      Accept All
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Manage your cookie preferences below. Necessary cookies are always enabled.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Necessary cookies</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Required for the site to function</p>
                      </div>
                      <Switch checked disabled />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Analytics & personalization</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Helps us improve and show relevant content</p>
                      </div>
                      <Switch
                        checked={analyticsEnabled}
                        onCheckedChange={setAnalyticsEnabled}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCustomize(false)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSavePreferences}
                    >
                      Save preferences
                    </Button>
                  </div>
                </>
              )}
            </div>
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
