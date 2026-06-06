import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Clock, CheckCircle2, Timer, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { NextActionCard } from "@/components/NextActionCard";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingTime, setBriefingTime] = useState<Date | null>(null);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, columns!inner(*, boards!inner(*, projects!inner(*)))")
        .order("updated_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: activeTimers = [] } = useQuery({
    queryKey: ["active-timers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, tasks!inner(title, columns!inner(boards!inner(projects!inner(name))))")
        .is("ended_at", null)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: totalTimeToday } = useQuery({
    queryKey: ["time-today"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("time_entries")
        .select("duration_seconds")
        .gte("started_at", today.toISOString())
        .not("duration_seconds", "is", null);
      if (error) throw error;
      return data.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
    },
  });

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const generateBriefing = async () => {
    setGeneratingBriefing(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-briefing");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setBriefing(data.briefing);
      setBriefingTime(new Date());
    } catch (e: any) {
      toast({ title: "Briefing failed", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingBriefing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your projects and tasks
        </p>
      </div>

      <NextActionCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-xs text-muted-foreground">Recent Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Timer className="h-5 w-5" style={{ color: "hsl(var(--warning))" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeTimers.length}</p>
              <p className="text-xs text-muted-foreground">Active Timers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatTime(totalTimeToday || 0)}</p>
              <p className="text-xs text-muted-foreground">Tracked Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Briefing + Recent Projects + Active Timers */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Daily Briefing
            </CardTitle>
            {briefingTime && (
              <span className="text-[11px] text-muted-foreground">
                Generated {format(briefingTime, "h:mm a")}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {briefing ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_h2]:text-xs [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-primary [&_h2]:mt-4 [&_h2]:mb-1.5 [&_h2:first-child]:mt-0 [&_ul]:my-1 [&_li]:my-0 [&_p]:my-1">
              {briefing.split(/\n/).map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith("## ")) {
                  return <h2 key={i}>{trimmed.replace("## ", "")}</h2>;
                }
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                  return <p key={i} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span>{trimmed.slice(2)}</p>;
                }
                if (/^\d+\./.test(trimmed)) {
                  return <p key={i}>{trimmed}</p>;
                }
                return <p key={i}>{trimmed}</p>;
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                Get a personalized summary of your priorities, overdue items, and what to focus on today.
              </p>
            </div>
          )}
          <Button
            onClick={generateBriefing}
            disabled={generatingBriefing}
            variant={briefing ? "outline" : "default"}
            size="sm"
            className={`mt-3 ${!briefing ? "w-full" : ""}`}
          >
            {generatingBriefing ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating...</>
            ) : briefing ? (
              <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Regenerate</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate My Briefing</>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No projects yet. Create one from the sidebar!
              </p>
            ) : (
              projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div
                    className="h-3 w-3 rounded-sm shrink-0"
                    style={{ backgroundColor: project.color || "#6366f1" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Timers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeTimers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No active timers
              </p>
            ) : (
              activeTimers.map((timer: any) => (
                <div
                  key={timer.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{timer.tasks?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Started {formatDistanceToNow(new Date(timer.started_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
