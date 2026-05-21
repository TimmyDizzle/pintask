import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  featured: boolean;
  status: "draft" | "scheduled" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Public-facing list: relies on RLS to filter to live posts. */
export async function fetchLivePosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPost) ?? null;
}

/** Admin: returns all posts regardless of status. RLS restricts to admins. */
export async function fetchAllPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

/** Format an ISO date like "May 21, 2026" for display. */
export function formatPostDate(iso: string | null): string {
  if (!iso) return "Draft";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
