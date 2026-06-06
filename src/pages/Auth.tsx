import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Sparkles, Infinity as InfinityIcon } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type PlanKey = "founder" | "loyalty";
type Mode = "login" | "signup" | "forgot";

const PLAN_META: Record<PlanKey, { label: string; price: string; blurb: string; icon: typeof Sparkles }> = {
  founder: {
    label: "Co-Founder Lifetime",
    price: "$39 once",
    blurb: "One payment, full app forever — locked in at signup.",
    icon: Sparkles,
  },
  loyalty: {
    label: "Loyalty Club",
    price: "$8 / month forever",
    blurb: "Grandfathered rate — never goes up, no matter the future price.",
    icon: InfinityIcon,
  },
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const modeParam = searchParams.get("mode");
  const selectedPlan: PlanKey | null =
    planParam === "founder" || planParam === "loyalty" ? planParam : null;

  const initialMode: Mode =
    modeParam === "forgot" ? "forgot" : selectedPlan ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);

  const titleMap: Record<Mode, string> = {
    login: "Log In",
    signup: "Sign Up",
    forgot: "Reset Password",
  };
  useDocumentTitle(titleMap[mode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem("pintask_pending_plan", selectedPlan);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const friendlyAuthError = (err: any): { title: string; description?: string } => {
    const msg = String(err?.message ?? "");
    const status = err?.status;
    const code = err?.code;
    if (status === 429 || code === "over_email_send_rate_limit" || /rate limit|after \d+ second/i.test(msg)) {
      const match = msg.match(/after (\d+) seconds?/i);
      const secs = match ? Number(match[1]) : 30;
      setCooldown(secs);
      return {
        title: "Please wait a moment",
        description: `Too many requests. Try again in about ${secs} second${secs === 1 ? "" : "s"}.`,
      };
    }
    if (/email not confirmed/i.test(msg)) {
      return {
        title: "Confirm your email first",
        description: "We sent a confirmation link when you signed up. Check your inbox (and spam folder) to verify your account before signing in.",
      };
    }
    if (/invalid login credentials|invalid_credentials/i.test(msg)) {
      return {
        title: "Email or password is incorrect",
        description: "Double-check your details, or use “Forgot password?” to reset it.",
      };
    }
    if (/user already registered|already registered/i.test(msg)) {
      return {
        title: "Account already exists",
        description: "Try signing in instead, or reset your password if you've forgotten it.",
      };
    }
    return { title: "Something went wrong", description: msg || "Please try again." };
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        if (selectedPlan) {
          toast({
            title: `${PLAN_META[selectedPlan].label} selected`,
            description: "You'll be prompted to complete checkout shortly.",
          });
        }
        navigate("/");
      } else if (mode === "signup") {
        await signUp(email, password, displayName);
        toast({
          title: "Account created!",
          description: selectedPlan
            ? `Your ${PLAN_META[selectedPlan].label} selection is saved. Check your email to verify your account.`
            : "Check your email to verify your account, or start using the app right away.",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setCooldown(30);
        toast({
          title: "Check your email",
          description: "If an account exists for that address, a password reset link is on its way. It can take a minute to arrive.",
        });
        setMode("login");
      }
    } catch (error: any) {
      const { title, description } = friendlyAuthError(error);
      toast({ title, description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const planInfo = selectedPlan ? PLAN_META[selectedPlan] : null;
  const PlanIcon = planInfo?.icon;

  const cardTitle =
    mode === "login"
      ? "Welcome back"
      : mode === "forgot"
      ? "Reset your password"
      : planInfo
      ? `Claim your ${planInfo.label}`
      : "Create account";

  const cardDescription =
    mode === "login"
      ? "Sign in to your account"
      : mode === "forgot"
      ? "Enter your email and we'll send you a reset link."
      : planInfo
      ? "Create an account to lock in your plan"
      : "Get started with Pintask";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckSquare className="h-10 w-10" />
            <h1 className="text-3xl font-bold tracking-tight">Pintask</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Organize your work. Track your time. Ship faster.
          </p>
        </div>

        {planInfo && PlanIcon && mode !== "forgot" && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <PlanIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{planInfo.label}</p>
                  <span className="text-sm font-medium text-primary">{planInfo.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{planInfo.blurb}</p>
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Loading..."
                  : mode === "login"
                  ? "Sign In"
                  : mode === "forgot"
                  ? "Send reset link"
                  : planInfo
                  ? `Create Account & Claim ${planInfo.label}`
                  : "Create Account"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
              {mode === "forgot" ? (
                <button
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Back to sign in
                </button>
              ) : (
                <>
                  <div>
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      className="text-primary hover:underline font-medium"
                    >
                      {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
