import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import AdminGuard from "@/components/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import BlogContent from "@/components/BlogContent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { slugify, type BlogPost } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = ["Productivity", "Kanban", "Tutorials", "Product Updates"];
type Status = BlogPost["status"];

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminBlogEditorInner() {
  const { id = "new" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  useDocumentTitle(isNew ? "New post — Pintask admin" : "Edit post — Pintask admin");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Productivity");
  const [readTime, setReadTime] = useState("5 min read");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<Status>("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  const { data: existing } = useQuery({
    queryKey: ["blog-post-edit", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
      if (error) throw error;
      return data as BlogPost;
    },
  });

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setSlug(existing.slug);
      setExcerpt(existing.excerpt);
      setContent(existing.content);
      setCategory(existing.category);
      setReadTime(existing.read_time);
      setFeatured(existing.featured);
      setStatus(existing.status);
      setPublishedAt(toLocalInput(existing.published_at));
      setSeoTitle(existing.seo_title ?? "");
      setSeoDescription(existing.seo_description ?? "");
      setOgImage(existing.og_image ?? "");
      setCanonicalUrl(existing.canonical_url ?? "");
      setSlugTouched(true);
    }
  }, [existing]);

  // Auto-derive slug from title for new posts until user edits slug manually.
  useEffect(() => {
    if (isNew && !slugTouched) setSlug(slugify(title));
  }, [title, isNew, slugTouched]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        category,
        read_time: readTime.trim(),
        featured,
        status,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        og_image: ogImage.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
      };
      if (!payload.title || !payload.slug) throw new Error("Title and slug are required");

      if (isNew) {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert({ ...payload, author_id: user!.id })
          .select()
          .single();
        if (error) throw error;
        return data as BlogPost;
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as BlogPost;
      }
    },
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ["blog-posts-admin"] });
      qc.invalidateQueries({ queryKey: ["blog-posts-public"] });
      toast({ title: isNew ? "Post created" : "Post saved" });
      if (isNew) navigate(`/admin/blog/${post.id}`, { replace: true });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold">{isNew ? "New post" : "Edit post"}</h1>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg" />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
            <p className="text-xs text-muted-foreground mt-1">URL: /blog/{slug || "your-slug"}</p>
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="content">Content (markdown-lite: ## H2, ### H3, - bullets, **bold**, `code`)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label>Preview</Label>
            <div className="mt-2 rounded-lg border border-border bg-card p-6">
              <BlogContent content={content || "_Nothing to preview yet._"} />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="published_at">Publish date</Label>
              <Input
                id="published_at"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled posts auto-publish at this time.
              </p>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="read_time">Read time</Label>
              <Input id="read_time" value={readTime} onChange={(e) => setReadTime(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured</Label>
              <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function AdminBlogEditor() {
  return <AdminGuard><AdminBlogEditorInner /></AdminGuard>;
}
