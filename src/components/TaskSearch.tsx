import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

const priorityIcons: Record<string, typeof AlertTriangle> = {
  urgent: AlertTriangle,
  high: AlertTriangle,
};

const priorityColors: Record<string, string> = {
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

export function TaskSearch() {
  const [open, setOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const navigate = useNavigate();

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["search-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, columns!inner(name, boards!inner(project_id, projects!inner(id, name, color)))")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const filteredTasks = allTasks.filter((task: any) => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (projectFilter !== "all" && task.columns?.boards?.projects?.id !== projectFilter) return false;
    return true;
  });

  const handleSelect = (task: any) => {
    const projectId = task.columns?.boards?.projects?.id;
    if (projectId) {
      navigate(`/project/${projectId}`);
    }
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 bg-background"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search tasks...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tasks by title..." />

        {/* Filters */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-7 w-[140px] text-xs">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-sm"
                      style={{ backgroundColor: p.color || "#6366f1" }}
                    />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-7 w-[120px] text-xs">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {(priorityFilter !== "all" || projectFilter !== "all") && (
            <button
              onClick={() => {
                setPriorityFilter("all");
                setProjectFilter("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <CommandList>
          <CommandEmpty>No tasks found.</CommandEmpty>
          <CommandGroup heading={`Tasks (${filteredTasks.length})`}>
            {filteredTasks.map((task: any) => {
              const project = task.columns?.boards?.projects;
              const columnName = task.columns?.name;

              return (
                <CommandItem
                  key={task.id}
                  value={`${task.title} ${project?.name || ""} ${columnName || ""}`}
                  onSelect={() => handleSelect(task)}
                  className="flex items-start gap-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {task.color_label && (
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: task.color_label }}
                        />
                      )}
                      <span className="font-medium text-sm truncate">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {project && (
                        <Badge variant="secondary" className="text-[10px] h-4 gap-1 px-1.5">
                          <div
                            className="h-1.5 w-1.5 rounded-sm"
                            style={{ backgroundColor: project.color || "#6366f1" }}
                          />
                          {project.name}
                        </Badge>
                      )}
                      {columnName && (
                        <span className="text-[10px] text-muted-foreground">
                          {columnName}
                        </span>
                      )}
                      {task.priority && task.priority !== "medium" && (
                        <span className={`text-[10px] font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {format(new Date(task.due_date), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
