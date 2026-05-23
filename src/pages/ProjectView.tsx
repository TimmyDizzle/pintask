import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KanbanBoard } from "@/components/KanbanBoard";
import { BoardAssistant } from "@/components/BoardAssistant";
import { ImageAttachments } from "@/components/ImageAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Trash2,
  Link as LinkIcon,
  Plus,
  ExternalLink,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("");
  const [addingLink, setAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId!)
        .single();
      if (error) throw error;
      setProjectName(data.name);
      setProjectColor(data.color || "#6366f1");
      return data;
    },
    enabled: !!projectId,
  });

  const { data: boards = [] } = useQuery({
    queryKey: ["boards", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: projectLinks = [] } = useQuery({
    queryKey: ["project-links", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_links")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const updateProject = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from("projects").update(updates).eq("id", projectId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", projectId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/");
    },
  });

  const addProjectLink = useMutation({
    mutationFn: async ({ title, url }: { title: string; url: string }) => {
      const { error } = await supabase.from("project_links").insert({
        project_id: projectId!,
        user_id: user!.id,
        title,
        url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-links", projectId] });
      setNewLinkTitle("");
      setNewLinkUrl("");
      setAddingLink(false);
    },
  });

  const deleteProjectLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from("project_links").delete().eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-links", projectId] });
    },
  });

  const colorOptions = [
    "#6366f1", "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  ];

  if (!project) return null;

  const board = boards[0];

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Project Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-sm"
            style={{ backgroundColor: project.color || "#6366f1" }}
          />
          <h2 className="text-lg font-semibold">{project.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {projectLinks.length > 0 && (
            <div className="flex items-center gap-1 mr-2">
              {projectLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded bg-muted/50 hover:bg-muted transition-colors"
                  title={link.title}
                >
                  <LinkIcon className="h-3 w-3" />
                  <span className="max-w-20 truncate">{link.title}</span>
                </a>
              ))}
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddingLink(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteProject.mutate()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* Board */}
      {board ? (
        <>
          <KanbanBoard boardId={board.id} projectId={projectId!} />
          <BoardAssistant boardId={board.id} />
        </>
      ) : (
        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          Loading board...
        </div>
      )}

      {/* Add Link Dialog */}
      <Dialog open={addingLink} onOpenChange={setAddingLink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Link</DialogTitle>
            <DialogDescription>Add a URL to this project for quick access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="e.g. GitHub Repo"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button
              onClick={() => {
                if (newLinkTitle.trim() && newLinkUrl.trim())
                  addProjectLink.mutate({ title: newLinkTitle.trim(), url: newLinkUrl.trim() });
              }}
            >
              Add Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>Update project name and color.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setProjectColor(color)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      projectColor === color ? "scale-125 border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Links</Label>
              {projectLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 group">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate flex-1"
                  >
                    {link.title}
                  </a>
                  <button
                    onClick={() => deleteProjectLink.mutate(link.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                updateProject.mutate({ name: projectName, color: projectColor });
                setShowSettings(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
