import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ResetPassword() {
  useDocumentTitle("Reset Password");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    let settled = false;
    const markReady = () => {
      if (settled) return;
      settled = true;
      setReady(true);
      setError(null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
        markReady();
      }
    });

    // Immediate check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    // Grace window for detectSessionInUrl (PKCE code exchange) to complete
    const timer = setTimeout(async () => {
      if (settled) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        markReady();
      } else {
        settled = true;
        setError("This password reset link is invalid or has already been used. Please request a new one.");
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Password updated", description: "You're now signed in." });
      navigate("/");
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      let friendly = msg;
      if (/same.*password/i.test(msg)) {
        friendly = "New password must be different from your old password.";
      } else if (/session|expired|jwt/i.test(msg)) {
        friendly = "Your reset session expired. Please request a new reset link.";
      } else if (/weak|short|characters/i.test(msg)) {
        friendly = "Please choose a stronger password (at least 6 characters).";
      }
      toast({ title: "Couldn't update password", description: friendly, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckSquare className="h-10 w-10" />
            <h1 className="text-3xl font-bold tracking-tight">Pintask</h1>
          </div>
        </div>
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>Set a new password</CardTitle>
            <CardDescription>Enter a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="space-y-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button className="w-full" onClick={() => navigate("/auth?mode=forgot")}>
                  Request a new reset link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={!ready}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    disabled={!ready}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !ready}>
                  {loading ? "Updating..." : ready ? "Update password" : "Verifying link..."}
                </Button>
                {!ready && (
                  <p className="text-xs text-muted-foreground text-center">
                    Verifying your reset link… this takes a couple of seconds.
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
