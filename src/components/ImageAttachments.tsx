import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Image, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageAttachmentsProps {
  taskId?: string;
  projectId?: string;
}

export function ImageAttachments({ taskId, projectId }: ImageAttachmentsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const queryKey = taskId
    ? ["attachments", "task", taskId]
    : ["attachments", "project", projectId];

  const { data: attachments = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from("attachments" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (taskId) query = query.eq("task_id", taskId);
      if (projectId) query = query.eq("project_id", projectId);

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const fetchUrls = async () => {
      const paths = attachments.map((a: any) => a.file_path).filter(Boolean);
      if (paths.length === 0) return;
      const { data } = await supabase.storage
        .from("attachments")
        .createSignedUrls(paths, 3600);
      if (cancelled || !data) return;
      const map: Record<string, string> = {};
      data.forEach((d: any) => {
        if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
      });
      setSignedUrls(map);
    };
    fetchUrls();
    return () => { cancelled = true; };
  }, [attachments]);

  const getUrl = (filePath: string) => signedUrls[filePath] || "";


  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const filePath = `${user!.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("attachments" as any)
        .insert({
          user_id: user!.id,
          task_id: taskId || null,
          project_id: projectId || null,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type,
        } as any);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Image uploaded" });
      setUploading(false);
    },
    onError: (err: any) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: any) => {
      await supabase.storage.from("attachments").remove([attachment.file_path]);
      const { error } = await supabase
        .from("attachments" as any)
        .delete()
        .eq("id", attachment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Image removed" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Only image files are supported", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Max file size is 5MB", variant: "destructive" });
      return;
    }

    uploadImage.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Image className="h-4 w-4" />
          Images ({attachments.length})
        </label>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att: any) => (
            <div
              key={att.id}
              className="group flex items-center gap-3 rounded-lg bg-muted/30 p-2 hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => setPreviewUrl(getUrl(att.file_path))}
                className="shrink-0"
              >
                <img
                  src={getUrl(att.file_path)}
                  alt={att.file_name}
                  className="h-12 w-12 rounded object-cover border border-border"
                />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{att.file_name}</p>
                {att.file_size && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(att.file_size)}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteAttachment.mutate(att)}
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
