import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDueTaskNotifications, type DueTask } from "@/hooks/useDueTaskNotifications";
import { format } from "date-fns";

const statusConfig: Record<DueTask["status"], { label: string; className: string }> = {
  overdue: { label: "Overdue", className: "bg-destructive text-destructive-foreground" },
  today: { label: "Today", className: "bg-warning text-white" },
  upcoming: { label: "Soon", className: "bg-primary/15 text-primary" },
};

export function NotificationBell() {
  const { data: dueTasks = [] } = useDueTaskNotifications(3);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const overdueCount = dueTasks.filter((t) => t.status === "overdue").length;
  const totalCount = dueTasks.length;

  const handleClick = (task: DueTask) => {
    if (task.project_id) navigate(`/project/${task.project_id}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                overdueCount > 0
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {totalCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm">Due Soon</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalCount === 0
              ? "No tasks due in the next 3 days"
              : `${totalCount} task${totalCount !== 1 ? "s" : ""} need attention`}
          </p>
        </div>
        {totalCount > 0 && (
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {dueTasks.map((task) => {
              const config = statusConfig[task.status];
              return (
                <button
                  key={task.id}
                  onClick={() => handleClick(task)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium truncate flex-1">{task.title}</span>
                    <Badge variant="secondary" className={`text-[10px] h-4 shrink-0 ${config.className}`}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {task.project_name && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span
                          className="h-1.5 w-1.5 rounded-sm inline-block"
                          style={{ backgroundColor: task.project_color || "#6366f1" }}
                        />
                        {task.project_name}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {format(new Date(task.due_date + "T00:00:00"), "MMM d")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
