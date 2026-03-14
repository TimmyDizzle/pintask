import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, Plus, X, Check } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#6366f1", "#a855f7", "#f43f5e", "#84cc16",
];

interface TaskLabelsProps {
  taskId: string;
  boardId: string;
}

export function TaskLabels({ taskId, boardId }: TaskLabelsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // All user labels
  const { data: allLabels = [] } = useQuery({
    queryKey: ["labels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labels" as any)
        .select("*")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  // Labels assigned to this task
  const { data: taskLabelIds = [] } = useQuery({
    queryKey: ["task-labels", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_labels" as any)
        .select("label_id")
        .eq("task_id", taskId);
      if (error) throw error;
      return (data as any[]).map((tl) => tl.label_id as string);
    },
  });

  const assignedLabels = allLabels.filter((l: any) => taskLabelIds.includes(l.id));
  const unassignedLabels = allLabels.filter((l: any) => !taskLabelIds.includes(l.id));

  const createLabel = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from("labels" as any)
        .insert({ name, color, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (label: any) => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      setCreating(false);
      setNewName("");
      // Auto-assign newly created label
      assignLabel.mutate(label.id);
    },
  });

  const assignLabel = useMutation({
    mutationFn: async (labelId: string) => {
      const { error } = await supabase
        .from("task_labels" as any)
        .insert({ task_id: taskId, label_id: labelId, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-labels", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-labels-full", taskId] });
    },
  });

  const removeLabel = useMutation({
    mutationFn: async (labelId: string) => {
      const { error } = await supabase
        .from("task_labels" as any)
        .delete()
        .eq("task_id", taskId)
        .eq("label_id", labelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-labels", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-labels-full", taskId] });
    },
  });

  const deleteLabel = useMutation({
    mutationFn: async (labelId: string) => {
      const { error } = await supabase
        .from("labels" as any)
        .delete()
        .eq("id", labelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["task-labels", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-labels-full", taskId] });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Tag className="h-4 w-4" />
          Labels
        </label>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="text-primary hover:text-primary/80 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground">
                {creating ? "Create new label" : "Add or manage labels"}
              </p>
            </div>

            {creating ? (
              <div className="p-3 space-y-3">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Label name"
                  className="text-sm h-8"
                  maxLength={30}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newName.trim()) {
                      createLabel.mutate({ name: newName.trim(), color: newColor });
                    }
                    if (e.key === "Escape") setCreating(false);
                  }}
                />
                <div className="grid grid-cols-6 gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        newColor === c ? "scale-110 border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                {/* Preview */}
                {newName.trim() && (
                  <Badge
                    className="text-xs text-white border-0"
                    style={{ backgroundColor: newColor }}
                  >
                    {newName.trim()}
                  </Badge>
                )}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="text-xs h-7"
                    disabled={!newName.trim() || createLabel.isPending}
                    onClick={() => createLabel.mutate({ name: newName.trim(), color: newColor })}
                  >
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={() => { setCreating(false); setNewName(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto">
                {/* Unassigned labels */}
                {unassignedLabels.map((label: any) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/50 group"
                  >
                    <button
                      onClick={() => assignLabel.mutate(label.id)}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm truncate">{label.name}</span>
                    </button>
                    <button
                      onClick={() => deleteLabel.mutate(label.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {/* Assigned labels (shown with checkmark) */}
                {assignedLabels.map((label: any) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/50 bg-muted/30"
                  >
                    <button
                      onClick={() => removeLabel.mutate(label.id)}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm truncate">{label.name}</span>
                    </button>
                    <Check className="h-3 w-3 text-primary shrink-0 ml-2" />
                  </div>
                ))}
                {allLabels.length === 0 && (
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                    No labels yet
                  </p>
                )}
                {/* Create button */}
                <div className="border-t border-border p-2">
                  <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 w-full px-1 py-1"
                  >
                    <Plus className="h-3 w-3" />
                    Create new label
                  </button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Assigned labels display */}
      {assignedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {assignedLabels.map((label: any) => (
            <Badge
              key={label.id}
              className="text-[11px] text-white border-0 gap-1 pr-1 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: label.color }}
              onClick={() => removeLabel.mutate(label.id)}
            >
              {label.name}
              <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
