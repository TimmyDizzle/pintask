import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Link as LinkIcon, Clock } from "lucide-react";
import { format, differenceInDays, startOfDay } from "date-fns";
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

  const isUrgent = task.priority === "urgent";
  const hasMetadata = !!task.due_date || taskLabels.length > 0;

  return (
    <Card
      onClick={onClick}
      className={`p-3 cursor-pointer hover:shadow-md transition-all border-border/50 ${
        isDragging ? "shadow-lg rotate-2 scale-105" : ""
      } ${activeTimer ? "ring-2 ring-accent/50" : ""} ${
        isUrgent ? "border-l-[3px] border-l-red-500" : ""
      } ${!hasMetadata ? "opacity-[0.88]" : ""}`}
    >
      {task.color_label && (
        <div
          className="h-1.5 w-12 rounded-full mb-2"
          style={{ backgroundColor: task.color_label }}
        />
      )}
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {taskLabels.map((label: any) => (
            <Badge
              key={label.id}
              className="text-[9px] text-white border-0 px-1.5 py-0 h-4 font-medium"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-[13px] font-semibold leading-snug">{task.title}</p>

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
        {task.due_date && (() => {
          const daysUntil = differenceInDays(startOfDay(new Date(task.due_date)), startOfDay(new Date()));
          const dueDateColor = daysUntil <= 0
            ? "text-red-600 dark:text-red-400"
            : daysUntil <= 7
              ? "text-amber-600 dark:text-amber-400"
              : "text-emerald-600 dark:text-emerald-400";
          return (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${dueDateColor}`}>
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), "MMM d")}
            </span>
          );
        })()}
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
