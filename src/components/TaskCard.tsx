import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Link as LinkIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const priorityColors: Record<string, string> = {
  low: "bg-blue-400/20 text-blue-600 dark:text-blue-400",
  medium: "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400",
  high: "bg-orange-400/20 text-orange-600 dark:text-orange-400",
  urgent: "bg-red-400/20 text-red-600 dark:text-red-400",
};

interface TaskCardProps {
  task: Tables<"tasks">;
  isDragging: boolean;
  onClick: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const { data: linkCount = 0 } = useQuery({
    queryKey: ["task-link-count", task.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("task_links")
        .select("*", { count: "exact", head: true })
        .eq("task_id", task.id);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: activeTimer } = useQuery({
    queryKey: ["active-timer", task.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("task_id", task.id)
        .is("ended_at", null)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Labels for this task
  const { data: taskLabels = [] } = useQuery({
    queryKey: ["task-labels-full", task.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_labels" as any)
        .select("label_id")
        .eq("task_id", task.id);
      if (error) throw error;
      const labelIds = (data as any[]).map((tl) => tl.label_id);
      if (labelIds.length === 0) return [];
      const { data: labels, error: lErr } = await supabase
        .from("labels" as any)
        .select("id, name, color")
        .in("id", labelIds);
      if (lErr) throw lErr;
      return labels as any[];
    },
  });

  return (
    <Card
      onClick={onClick}
      className={`p-3 cursor-pointer hover:shadow-md transition-all border-border/50 ${
        isDragging ? "shadow-lg rotate-2 scale-105" : ""
      } ${activeTimer ? "ring-2 ring-accent/50" : ""}`}
    >
      {task.color_label && (
        <div
          className="h-1.5 w-12 rounded-full mb-2"
          style={{ backgroundColor: task.color_label }}
        />
      )}
      <p className="text-sm font-medium leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {task.priority && task.priority !== "medium" && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        )}
        {task.due_date && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.due_date), "MMM d")}
          </span>
        )}
        {linkCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <LinkIcon className="h-3 w-3" />
            {linkCount}
          </span>
        )}
        {activeTimer && (
          <span className="flex items-center gap-1 text-[10px] text-accent font-medium">
            <Clock className="h-3 w-3 animate-pulse" />
            Tracking
          </span>
        )}
      </div>
    </Card>
  );
}
