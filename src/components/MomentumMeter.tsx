import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type Tier = { min: number; emoji: string; label: string; tone: string };
const TIERS: Tier[] = [
  { min: 0, emoji: "🌱", label: "Starting", tone: "text-emerald-500" },
  { min: 26, emoji: "⚡", label: "Building Momentum", tone: "text-amber-500" },
  { min: 51, emoji: "🔥", label: "In The Zone", tone: "text-orange-500" },
  { min: 76, emoji: "🚀", label: "Unstoppable", tone: "text-primary" },
];

function tierFor(score: number): Tier {
  return [...TIERS].reverse().find((t) => score >= t.min) ?? TIERS[0];
}

export function MomentumMeter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ["user-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const toggleAdhd = useMutation({
    mutationFn: async (next: boolean) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("user_preferences")
        .upsert(
          { user_id: user.id, adhd_mode: next },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-preferences"] });
      qc.invalidateQueries({ queryKey: ["next-action-data"] });
    },
    onError: (e: any) =>
      toast({ title: "Couldn't save preference", description: e.message, variant: "destructive" }),
  });

  const score = Math.max(0, Math.min(100, Math.round(prefs?.momentum_score ?? 0)));
  const tier = tierFor(score);
  const adhd = !!prefs?.adhd_mode;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl" aria-hidden>{tier.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Momentum
              </p>
              <p className={`text-sm font-semibold truncate ${tier.tone}`}>
                {tier.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor="adhd-mode" className="text-xs text-muted-foreground cursor-pointer">
              ADHD Mode
            </Label>
            <Switch
              id="adhd-mode"
              checked={adhd}
              onCheckedChange={(v) => toggleAdhd.mutate(!!v)}
              aria-label="Toggle ADHD productivity mode"
            />
          </div>
        </div>
        <Progress value={score} className="h-2" />
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{score}%</span>
          <span className="italic">Rewards consistency, not perfection.</span>
        </div>
      </CardContent>
    </Card>
  );
}
