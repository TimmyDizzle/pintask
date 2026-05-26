import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "already" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "success" };

export default function UnsubscribePage() {
  useDocumentTitle("Unsubscribe — Pintask");
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", message: "Missing unsubscribe token." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: "invalid", message: data?.error ?? "Invalid or expired link." });
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setState({ kind: "already" });
        } else {
          setState({ kind: "ready" });
        }
      } catch {
        setState({ kind: "invalid", message: "Could not reach the server. Try again later." });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success || data.reason === "already_unsubscribed") {
        setState({ kind: "success" });
      } else {
        setState({ kind: "invalid", message: data?.error ?? "Could not complete unsubscribe." });
      }
    } catch {
      setState({ kind: "invalid", message: "Network error — please try again." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">Email preferences</CardTitle>
          <CardDescription>Manage your Pintask email subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {state.kind === "loading" && (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Checking your link…</p>
            </div>
          )}
          {state.kind === "ready" && (
            <>
              <p className="text-foreground">
                Click below to unsubscribe from Pintask app emails.
              </p>
              <Button onClick={confirm} variant="destructive" className="w-full">
                Confirm unsubscribe
              </Button>
            </>
          )}
          {state.kind === "submitting" && (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Processing…</p>
            </div>
          )}
          {state.kind === "success" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-foreground">You've been unsubscribed.</p>
              <Button asChild variant="outline">
                <Link to="/">Return home</Link>
              </Button>
            </div>
          )}
          {state.kind === "already" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-foreground">You're already unsubscribed.</p>
              <Button asChild variant="outline">
                <Link to="/">Return home</Link>
              </Button>
            </div>
          )}
          {state.kind === "invalid" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="text-foreground">{state.message}</p>
              <Button asChild variant="outline">
                <Link to="/">Return home</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
