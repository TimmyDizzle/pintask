import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailSheet } from "@/components/TaskDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoreHorizontal, X, Check, Trash2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface KanbanBoardProps {
  boardId: string;
  projectId: string;
}

export function KanbanBoard({ boardId, projectId }: KanbanBoardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [addingTaskInColumn, setAddingTaskInColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Tables<"tasks"> | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editColumnName, setEditColumnName] = useState("");

  const kanbanShortcuts = useMemo(
    () => [
      {
        key: "n",
        handler: () => {
          if (columns.length > 0) {
            setAddingTaskInColumn(columns[0].id);
          }
        },
      },
    ],
    [columns]
  );
  useKeyboardShortcuts(kanbanShortcuts);

  const { data: columns = [] } = useQuery({
    queryKey: ["columns", boardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("board_id", boardId)
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", boardId],
    queryFn: async () => {
      const columnIds = columns.map((c) => c.id);
      if (columnIds.length === 0) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .in("column_id", columnIds)
        .order("position");
      if (error) throw error;
      return data;
    },
    enabled: columns.length > 0,
  });

  const addColumn = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("columns").insert({
        name,
        board_id: boardId,
        user_id: user!.id,
        position: columns.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      setAddingColumn(false);
      setNewColumnName("");
    },
  });

  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase.from("columns").delete().eq("id", columnId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const renameColumn = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("columns").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      setEditingColumn(null);
    },
  });

  const addTask = useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
      const colTasks = tasks.filter((t) => t.column_id === columnId);
      const { error } = await supabase.from("tasks").insert({
        title,
        column_id: columnId,
        user_id: user!.id,
        position: colTasks.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      setAddingTaskInColumn(null);
      setNewTaskTitle("");
    },
  });

  const moveTask = useMutation({
    mutationFn: async ({
      taskId,
      newColumnId,
      newPosition,
    }: {
      taskId: string;
      newColumnId: string;
      newPosition: number;
    }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ column_id: newColumnId, position: newPosition })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    moveTask.mutate({
      taskId: draggableId,
      newColumnId: destination.droppableId,
      newPosition: destination.index,
    });
  };

  const getTasksForColumn = (columnId: string) =>
    tasks.filter((t) => t.column_id === columnId).sort((a, b) => a.position - b.position);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-6 pb-8 h-[calc(100vh-3rem)] scrollbar-thin">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col w-72 shrink-0 bg-muted/30 rounded-xl"
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3">
                {editingColumn === column.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={editColumnName}
                      onChange={(e) => setEditColumnName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editColumnName.trim())
                          renameColumn.mutate({ id: column.id, name: editColumnName.trim() });
                        if (e.key === "Escape") setEditingColumn(null);
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <button onClick={() => {
                      if (editColumnName.trim()) renameColumn.mutate({ id: column.id, name: editColumnName.trim() });
                    }}>
                      <Check className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{column.name}</h3>
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                        {getTasksForColumn(column.id).length}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingColumn(column.id);
                          setEditColumnName(column.name);
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteColumn.mutate(column.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              {/* Tasks */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 px-2 pb-2 space-y-2 min-h-[60px] transition-colors rounded-lg mx-1 ${
                      snapshot.isDraggingOver ? "bg-primary/5" : ""
                    }`}
                  >
                    {getTasksForColumn(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                              onClick={() => setSelectedTask(task)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add task */}
              <div className="px-2 pb-3">
                {addingTaskInColumn === column.id ? (
                  <div className="space-y-2">
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTaskTitle.trim())
                          addTask.mutate({ columnId: column.id, title: newTaskTitle.trim() });
                        if (e.key === "Escape") {
                          setAddingTaskInColumn(null);
                          setNewTaskTitle("");
                        }
                      }}
                      placeholder="Task title..."
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newTaskTitle.trim())
                            addTask.mutate({ columnId: column.id, title: newTaskTitle.trim() });
                        }}
                        className="text-xs h-7"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAddingTaskInColumn(null);
                          setNewTaskTitle("");
                        }}
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTaskInColumn(column.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-2 py-1.5 rounded-md hover:bg-muted/50"
                  >
                    <Plus className="h-4 w-4" />
                    Add task
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add column */}
          <div className="w-72 shrink-0">
            {addingColumn ? (
              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                <Input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newColumnName.trim())
                      addColumn.mutate(newColumnName.trim());
                    if (e.key === "Escape") {
                      setAddingColumn(false);
                      setNewColumnName("");
                    }
                  }}
                  placeholder="Column name..."
                  className="text-sm"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newColumnName.trim()) addColumn.mutate(newColumnName.trim());
                    }}
                    className="text-xs h-7"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingColumn(false);
                      setNewColumnName("");
                    }}
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingColumn(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/30"
              >
                <Plus className="h-4 w-4" />
                Add column
              </button>
            )}
          </div>
        </div>
      </DragDropContext>

      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        boardId={boardId}
      />
    </>
  );
}
