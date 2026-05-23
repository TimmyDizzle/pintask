import { Link, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Sparkles, Loader2 } from "lucide-react";
import { fetchAllPostsAdmin, formatPostDate, type BlogPost } from "@/lib/blog";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function statusVariant(status: BlogPost["status"]) {
  if (status === "published") return "default" as const;
  if (status === "scheduled") return "secondary" as const;
  return "outline" as const;
}

function ClaimAdminBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const handleClaim = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    if (data) {
      toast({ title: "You're admin!", description: "Reloading…" });
      setClaimed(true);
      setTimeout(() => window.location.reload(), 800);
    } else {
      toast({ title: "Already claimed", description: "An admin already exists.", variant: "destructive" });
    }
  };
  if (!user || claimed) return null;
  return (
    <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
      <div>
        <p className="font-semibold">First-time setup</p>
        <p className="text-sm text-muted-foreground">Click to claim admin for this account (only works once).</p>
      </div>
      <Button onClick={handleClaim}>Claim admin</Button>
    </div>
  );
}

function BackfillEmbeddingsButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("embed-blog-post", {
        body: { all: true },
      });
      if (error) throw error;
      toast({
        title: "Search index updated",
        description: `Embedded ${data?.embedded ?? 0} post(s).`,
      });
    } catch (e: any) {
      toast({
        title: "Backfill failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="outline" onClick={run} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-1" />
      )}
      Rebuild search index
    </Button>
  );
}

function AdminBlogListInner() {
  useDocumentTitle("Blog admin — Pintask");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts-admin"],
    queryFn: fetchAllPostsAdmin,
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts-admin"] });
      qc.invalidateQueries({ queryKey: ["blog-posts-public"] });
      toast({ title: "Post deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="container max-w-6xl py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Blog admin</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and schedule blog posts.</p>
        </div>
        <div className="flex gap-2">
          <BackfillEmbeddingsButton />
          <Button asChild>
            <Link to="/admin/blog/new"><Plus className="h-4 w-4 mr-1" /> New post</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Publish date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
            )}
            {!isLoading && posts.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No posts yet.</TableCell></TableRow>
            )}
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  {p.featured && <Badge variant="outline" className="ml-2">featured</Badge>}
                </TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{formatPostDate(p.published_at)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/admin/blog/${p.id}`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { if (confirm(`Delete "${p.title}"?`)) deletePost.mutate(p.id); }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdminBlogList() {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading } = useIsAdmin();

  if (loading || (user && isLoading)) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="container max-w-6xl py-10">
        <h1 className="font-heading text-3xl font-bold mb-2">Blog admin</h1>
        <p className="text-muted-foreground mb-6">
          Your account doesn't have admin access yet. If no admin has been set up,
          you can claim it below (one-time only).
        </p>
        <ClaimAdminBanner />
      </div>
    );
  }

  return <AdminBlogListInner />;
}
