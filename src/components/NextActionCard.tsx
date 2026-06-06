import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Play, Sparkles, Loader2, RefreshCw, Clock, Split } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  buildContext,
  scoreTasks,
  impactLabel,
  isDoneColumnName,
  type ScoredTask,
} from "@/lib/nextAction";
import { BreakItDownDialog } from "@/components/BreakItDownDialog";

export function NextActionCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cycleIdx, setCycleIdx] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  // Load preferences, columns + tasks, and yesterday's completion count.
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["next-action-data", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [prefRes, taskRes, colRes, completedRes] = await Promise.all([
        supabase.from("user_preferences").select("*").maybeSingle(),
        supabase
          .from("tasks")
          .select("id, title, description, priority, due_date, column_id, tags")
          .limit(200),
        supabase
          .from("columns")
          .select("id, name, board_id, boards!inner(project_id, projects!inner(name))"),
        supabase
          .from("tasks")
          .select("id, updated_at")
          .gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const preferences = prefRes.data;
      const tasks = taskRes.data || [];
      const rawCols = colRes.data || [];
      const completedLast24h = completedRes.data?.length || 0;

      // Map columns with project name.
      const columns = new Map<string, { id: string; name: string; project_name: string }>();
      const doneColIds: string[] = [];
      for (const c of rawCols as any[]) {
        const projectName = c.boards?.projects?.name || "Unknown";
        columns.set(c.id, { id: c.id, name: c.name, project_name: projectName });
        if (isDoneColumnName(c.name)) doneColIds.push(c.id);
      }

      return { preferences, tasks, columns, doneColIds, completedLast24h };
    },
  });

  const ranked = useMemo<ScoredTask[]>(() => {
    if (!data) return [];
    const ctx = buildContext(
      data.preferences,
      data.completedLast24h,
      data.doneColIds,
      data.tasks as any,
    );
    return scoreTasks(data.tasks as any, data.columns, ctx);
  }, [data]);

  const top = ranked[cycleIdx % Math.max(ranked.length, 1)];

  const handleExplain = async () => {
    if (!top) return;
    setLoadingExplain(true);
    setExplanation(null);
    try {
      const { data: res, error } = await supabase.functions.invoke("next-action-explain", {
        body: {
          task: {
            title: top.title,
            priority: top.priority,
            due_date: top.due_date,
          },
          reasons: top.reasons,
          estimatedMinutes: top.estimatedMinutes,
          score: top.score,
          completedLast24h: data?.completedLast24h ?? 0,
        },
      });
      if (error) throw error;
      if ((res as any)?.error) throw new Error((res as any).error);
      setExplanation((res as any).explanation);
    } catch (e: any) {
      toast({ title: "Couldn't load explanation", description: e.message, variant: "destructive" });
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleStart = () => {
    if (!top) return;
    // Navigate to the column's project board.
    // Lean approach: open the task search/dashboard route via toast hint;
    // ideally task detail sheet. For now, navigate to projects list.
    toast({
      title: "Let's go",
      description: `Opening "${top.title}". You've got this.`,
    });
    // Try project navigation by looking up via column meta (best-effort).
    navigate("/");
  };

  const handleCycle = () => {
    setExplanation(null);
    setCycleIdx((i) => i + 1);
  };

  const handleRefresh = async () => {
    setExplanation(null);
    setCycleIdx(0);
    await refetch();
  };

  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding your next best move...
        </CardContent>
      </Card>
    );
  }

  if (!top) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Next Action</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            You're all caught up. Plant something tiny for tomorrow — even one line counts.
          </p>
        </CardContent>
      </Card>
    );
  }

  const impact = impactLabel(top.score);
  const impactStyles = {
    high: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  }[impact];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Target className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                AI Next Action
              </p>
              <p className="text-[11px] text-muted-foreground">{top.project_name} · {top.column_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh} title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <h2 className="mt-3 text-lg font-semibold leading-snug">{top.title}</h2>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> ~{top.estimatedMinutes} min
          </Badge>
          <Badge variant="outline" className={impactStyles}>
            {impact} impact
          </Badge>
          {top.reasons.slice(0, 2).map((r, i) => (
            <span key={i} className="text-muted-foreground">· {r}</span>
          ))}
        </div>

        {explanation && (
          <p className="mt-3 text-sm leading-relaxed text-foreground/90 bg-muted/40 rounded-md p-3 border border-border/50">
            <Sparkles className="inline h-3.5 w-3.5 text-primary mr-1.5 -mt-0.5" />
            {explanation}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleStart} size="sm" className="gap-1.5">
            <Play className="h-3.5 w-3.5" /> Start Task
          </Button>
          <Button onClick={handleExplain} variant="outline" size="sm" disabled={loadingExplain} className="gap-1.5">
            {loadingExplain ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Why this one?
          </Button>
          <Button onClick={() => setBreakdownOpen(true)} variant="outline" size="sm" className="gap-1.5">
            <Split className="h-3.5 w-3.5" /> Break It Down
          </Button>
          {ranked.length > 1 && (
            <Button onClick={handleCycle} variant="ghost" size="sm">
              Show me another
            </Button>
          )}
        </div>
      </CardContent>
      <BreakItDownDialog
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
        task={{ id: top.id, title: top.title, description: top.description, column_id: top.column_id }}
        mode="breakdown"
      />
    </Card>
  );
}
