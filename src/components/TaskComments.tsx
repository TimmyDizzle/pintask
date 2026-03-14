import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_comments" as any)
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["comment-profiles", taskId],
    queryFn: async () => {
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      if (error) throw error;
      return data;
    },
    enabled: comments.length > 0,
  });

  const profileMap = Object.fromEntries(
    profiles.map((p) => [p.user_id, p])
  );

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("task_comments" as any).insert({
        task_id: taskId,
        user_id: user!.id,
        content,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["comment-profiles", taskId] });
      setNewComment("");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("task_comments" as any)
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
    },
  });

  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (trimmed && trimmed.length <= 2000) {
      addComment.mutate(trimmed);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </label>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
          {comments.map((comment: any) => {
            const profile = profileMap[comment.user_id];
            const isOwn = comment.user_id === user?.id;
            return (
              <div key={comment.id} className="group rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
                      {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {profile?.display_name || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* New comment input */}
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          className="text-sm resize-none"
          maxLength={2000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            ⌘+Enter to send
          </span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim() || addComment.isPending}
            className="text-xs h-7"
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
