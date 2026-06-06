import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Split, LifeBuoy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface BreakItDownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: { id?: string; title: string; description?: string | null; column_id?: string };
  mode?: "breakdown" | "stuck";
}

export function BreakItDownDialog({ open, onOpenChange, task, mode = "breakdown" }: BreakItDownDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [blocker, setBlocker] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [included, setIncluded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const runBreakdown = async (firstStepOnly = false) => {
    setLoading(true);
    setSteps([]);
    try {
      const { data, error } = await supabase.functions.invoke("break-it-down", {
        body: {
          task: { title: task.title, description: task.description ?? null },
          blocker: mode === "stuck" ? blocker.trim() || undefined : undefined,
          firstStepOnly,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const got = (data as any).steps as string[];
      setSteps(got);
      const next: Record<number, boolean> = {};
      got.forEach((_, i) => (next[i] = true));
      setIncluded(next);
    } catch (e: any) {
      toast({ title: "Couldn't break it down", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createSubtasks = async () => {
    if (!user || !task.column_id) {
      toast({ title: "Can't add steps", description: "Open this from inside a task to add subtasks.", variant: "destructive" });
      return;
    }
    const selected = steps.filter((_, i) => included[i]);
    if (selected.length === 0) return;
    setCreating(true);
    try {
      // Find max position in the column so we append at the end.
      const { data: existing } = await supabase
        .from("tasks")
        .select("position")
        .eq("column_id", task.column_id)
        .order("position", { ascending: false })
        .limit(1);
      const startPos = (existing?.[0]?.position ?? 0) + 1;
      const rows = selected.map((step, i) => ({
        column_id: task.column_id!,
        user_id: user.id,
        title: step,
        description: `↳ from "${task.title}"`,
        position: startPos + i,
        priority: "medium" as const,
      }));
      const { error } = await supabase.from("tasks").insert(rows);
      if (error) throw error;
      await queryClient.invalidateQueries();
      toast({ title: `Added ${rows.length} step${rows.length === 1 ? "" : "s"}`, description: "One tiny move at a time. You've got this." });
      onOpenChange(false);
      setSteps([]);
      setBlocker("");
    } catch (e: any) {
      toast({ title: "Couldn't create steps", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (loading || creating) return;
    onOpenChange(false);
    setSteps([]);
    setBlocker("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "stuck" ? <LifeBuoy className="h-5 w-5 text-primary" /> : <Split className="h-5 w-5 text-primary" />}
            {mode === "stuck" ? "I'm Stuck" : "Break It Down"}
          </DialogTitle>
          <DialogDescription>
            {mode === "stuck"
              ? `It's okay. Tell me what's blocking you on "${task.title}" and I'll find the smallest next move.`
              : `Let's turn "${task.title}" into a few tiny steps you can actually start.`}
          </DialogDescription>
        </DialogHeader>

        {mode === "stuck" && steps.length === 0 && (
          <Textarea
            placeholder="What's getting in the way? (one sentence is plenty)"
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            rows={3}
            className="resize-none"
          />
        )}

        {steps.length === 0 && (
          <div className="flex gap-2">
            {mode === "stuck" ? (
              <>
                <Button onClick={() => runBreakdown(true)} disabled={loading} className="flex-1 gap-1.5">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Just the first step
                </Button>
                <Button onClick={() => runBreakdown(false)} disabled={loading} variant="outline" className="flex-1">
                  Show me all
                </Button>
              </>
            ) : (
              <Button onClick={() => runBreakdown(false)} disabled={loading} className="w-full gap-1.5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Break it into steps
              </Button>
            )}
          </div>
        )}

        {steps.length > 0 && (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {steps.map((step, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={included[i] ?? true}
                  onCheckedChange={(v) => setIncluded((s) => ({ ...s, [i]: !!v }))}
                  className="mt-0.5"
                />
                <div className="flex-1 text-sm">
                  <span className="text-xs font-medium text-muted-foreground mr-2">{i + 1}.</span>
                  {step}
                </div>
              </label>
            ))}
            <p className="text-xs text-muted-foreground italic px-1 pt-1">
              The first step is on purpose tiny. Just start there.
            </p>
          </div>
        )}

        {steps.length > 0 && (
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setSteps([]); setBlocker(""); }} disabled={creating}>
              Try again
            </Button>
            {task.column_id ? (
              <Button onClick={createSubtasks} disabled={creating || Object.values(included).every((v) => !v)}>
                {creating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
                Add as subtasks
              </Button>
            ) : (
              <Button onClick={handleClose}>Got it</Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
