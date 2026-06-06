import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Square,
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Split,
  LifeBuoy,
} from "lucide-react";
import { TaskComments } from "@/components/TaskComments";
import { TaskLabels } from "@/components/TaskLabels";
import { ImageAttachments } from "@/components/ImageAttachments";
import { BreakItDownDialog } from "@/components/BreakItDownDialog";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

interface TaskDetailSheetProps {
  task: Tables<"tasks"> | null;
  onClose: () => void;
  boardId: string;
}

export function TaskDetailSheet({ task, onClose, boardId }: TaskDetailSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [colorLabel, setColorLabel] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setDueDate(task.due_date || "");
      setColorLabel(task.color_label || "");
    }
  }, [task]);

  const { data: links = [] } = useQuery({
    queryKey: ["task-links", task?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_links")
        .select("*")
        .eq("task_id", task!.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!task,
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["time-entries", task?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("task_id", task!.id)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!task,
  });

  const activeTimer = timeEntries.find((e) => !e.ended_at);

  const totalSeconds = timeEntries.reduce(
    (sum, e) => sum + (e.duration_seconds || 0),
    0
  );

  const updateTask = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from("tasks").update(updates).eq("id", task!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").delete().eq("id", task!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      onClose();
    },
  });

  const addLink = useMutation({
    mutationFn: async ({ title, url }: { title: string; url: string }) => {
      const { error } = await supabase.from("task_links").insert({
        task_id: task!.id,
        user_id: user!.id,
        title,
        url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-links", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["task-link-count", task?.id] });
      setNewLinkTitle("");
      setNewLinkUrl("");
      setAddingLink(false);
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from("task_links").delete().eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-links", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["task-link-count", task?.id] });
    },
  });

  const startTimer = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("time_entries").insert({
        task_id: task!.id,
        user_id: user!.id,
        started_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["active-timer", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["active-timers"] });
    },
  });

  const stopTimer = useMutation({
    mutationFn: async () => {
      if (!activeTimer) return;
      const endedAt = new Date();
      const startedAt = new Date(activeTimer.started_at);
      const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
      const { error } = await supabase
        .from("time_entries")
        .update({
          ended_at: endedAt.toISOString(),
          duration_seconds: duration,
        })
        .eq("id", activeTimer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["active-timer", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["active-timers"] });
      queryClient.invalidateQueries({ queryKey: ["time-today"] });
    },
  });

  const handleSave = () => {
    updateTask.mutate({
      title,
      description: description || null,
      priority,
      due_date: dueDate || null,
      color_label: colorLabel || null,
    });
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const colorOptions = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#3b82f6", "#8b5cf6", "#ec4899", "",
  ];

  if (!task) return null;

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin">
        <SheetHeader>
          <SheetTitle className="text-left">Task Details</SheetTitle>
          <SheetDescription className="sr-only">Edit task details</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => {
                  setPriority(v);
                  updateTask.mutate({ priority: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  updateTask.mutate({ due_date: e.target.value || null });
                }}
              />
            </div>
          </div>

          {/* Color Label */}
          <div className="space-y-2">
            <Label>Color Label</Label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color || "none"}
                  onClick={() => {
                    setColorLabel(color);
                    updateTask.mutate({ color_label: color || null });
                  }}
                  className={`h-6 w-6 rounded-full border-2 transition-transform ${
                    colorLabel === color ? "scale-125 border-foreground" : "border-transparent"
                  } ${!color ? "bg-muted" : ""}`}
                  style={color ? { backgroundColor: color } : undefined}
                  title={color || "No color"}
                />
              ))}
            </div>
          </div>

          {/* Labels */}
          <TaskLabels taskId={task.id} boardId={boardId} />

          {/* Time Tracking */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Tracking
              </Label>
              <span className="text-sm text-muted-foreground">
                Total: {formatDuration(totalSeconds)}
              </span>
            </div>
            <div>
              {activeTimer ? (
                <Button
                  onClick={() => stopTimer.mutate()}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Square className="h-3 w-3" />
                  Stop Timer
                </Button>
              ) : (
                <Button
                  onClick={() => startTimer.mutate()}
                  size="sm"
                  className="gap-2"
                >
                  <Play className="h-3 w-3" />
                  Start Timer
                </Button>
              )}
            </div>
            {timeEntries.filter((e) => e.ended_at).length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                {timeEntries
                  .filter((e) => e.ended_at)
                  .slice(0, 5)
                  .map((entry) => (
                    <div key={entry.id} className="flex justify-between text-xs text-muted-foreground px-2 py-1 rounded bg-muted/30">
                      <span>
                        {format(new Date(entry.started_at), "MMM d, HH:mm")}
                      </span>
                      <span>{formatDuration(entry.duration_seconds || 0)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Links
              </Label>
              <button
                onClick={() => setAddingLink(true)}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {addingLink && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                <Input
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Link title"
                  className="text-sm"
                />
                <Input
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-sm"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newLinkTitle.trim() && newLinkUrl.trim())
                        addLink.mutate({ title: newLinkTitle.trim(), url: newLinkUrl.trim() });
                    }}
                    className="text-xs h-7"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingLink(false);
                      setNewLinkTitle("");
                      setNewLinkUrl("");
                    }}
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 group"
              >
                <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate flex-1"
                >
                  {link.title}
                </a>
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                <button
                  onClick={() => deleteLink.mutate(link.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Images */}
          <ImageAttachments taskId={task.id} />

          {/* Comments */}
          <TaskComments taskId={task.id} />

          {/* Delete */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTask.mutate()}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Task
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
