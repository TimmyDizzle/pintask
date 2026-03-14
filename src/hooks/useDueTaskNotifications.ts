import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addDays, isPast, isToday, isTomorrow, startOfDay } from "date-fns";

export interface DueTask {
  id: string;
  title: string;
  due_date: string;
  priority: string | null;
  project_name: string | null;
  project_color: string | null;
  project_id: string | null;
  status: "overdue" | "today" | "upcoming";
}

export function useDueTaskNotifications(daysAhead = 3) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["due-task-notifications", daysAhead],
    queryFn: async (): Promise<DueTask[]> => {
      const cutoff = addDays(startOfDay(new Date()), daysAhead).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, due_date, priority, columns!inner(boards!inner(projects!inner(id, name, color)))")
        .not("due_date", "is", null)
        .lte("due_date", cutoff)
        .order("due_date", { ascending: true });

      if (error) throw error;

      return (data || []).map((task: any) => {
        const dueDate = new Date(task.due_date + "T00:00:00");
        let status: DueTask["status"] = "upcoming";
        if (isPast(dueDate) && !isToday(dueDate)) status = "overdue";
        else if (isToday(dueDate)) status = "today";

        return {
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          priority: task.priority,
          project_name: task.columns?.boards?.projects?.name || null,
          project_color: task.columns?.boards?.projects?.color || null,
          project_id: task.columns?.boards?.projects?.id || null,
          status,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });
}
