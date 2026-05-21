import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Sparkles, Infinity as InfinityIcon } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type PlanKey = "founder" | "loyalty";

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
  const selectedPlan: PlanKey | null =
    planParam === "founder" || planParam === "loyalty" ? planParam : null;

  const [isLogin, setIsLogin] = useState(!selectedPlan);
  useDocumentTitle(isLogin ? "Log In" : "Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Persist the selected plan so it survives auth redirects / email verification
  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem("pintask_pending_plan", selectedPlan);
    }
  }, [selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        if (selectedPlan) {
          toast({
            title: `${PLAN_META[selectedPlan].label} selected`,
            description: "You'll be prompted to complete checkout shortly.",
          });
        }
        navigate("/");
      } else {
        await signUp(email, password, displayName);
        toast({
          title: "Account created!",
          description: selectedPlan
            ? `Your ${PLAN_META[selectedPlan].label} selection is saved. Check your email to verify your account.`
            : "Check your email to verify your account, or start using the app right away.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const planInfo = selectedPlan ? PLAN_META[selectedPlan] : null;
  const PlanIcon = planInfo?.icon;

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

        {planInfo && PlanIcon && (
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
            <CardTitle className="text-xl">
              {isLogin ? "Welcome back" : planInfo ? `Claim your ${planInfo.label}` : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to your account"
                : planInfo
                ? "Create an account to lock in your plan"
                : "Get started with Pintask"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required={!isLogin}
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Loading..."
                  : isLogin
                  ? "Sign In"
                  : planInfo
                  ? `Create Account & Claim ${planInfo.label}`
                  : "Create Account"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
