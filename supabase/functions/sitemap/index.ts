// Dynamic sitemap served from the database — always reflects the latest
// published/scheduled posts without needing a redeploy.
//
// Routes (all GET, public):
//   /sitemap            → sitemap index
//   /sitemap/static     → marketing routes
//   /sitemap/blog/:n    → blog post chunk N (1-indexed)
//
// Referenced from public/robots.txt.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const BASE_URL = "https://pintask.online";
const POSTS_PER_SITEMAP = 5000;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const xmlHeaders = {
  ...corsHeaders,
  "Content-Type": "application/xml; charset=utf-8",
  // Cache at the edge for 5 minutes; stale-while-revalidate keeps things snappy
  // while still letting publish/edit changes propagate quickly.
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
};

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  image?: { loc: string; title?: string; caption?: string };
}

const today = () => new Date().toISOString().slice(0, 10);

const staticEntries = (): SitemapEntry[] => {
  const d = today();
  return [
    { path: "/", lastmod: d, changefreq: "weekly", priority: "1.0" },
    { path: "/features", lastmod: d, changefreq: "monthly", priority: "0.9" },
    { path: "/pricing", lastmod: d, changefreq: "monthly", priority: "0.9" },
    { path: "/extensions", lastmod: d, changefreq: "weekly", priority: "0.8" },
    { path: "/trello-alternative", lastmod: d, changefreq: "monthly", priority: "0.9" },
    { path: "/kanban-board", lastmod: d, changefreq: "monthly", priority: "0.9" },
    { path: "/task-tracker", lastmod: d, changefreq: "monthly", priority: "0.9" },
    { path: "/about", lastmod: d, changefreq: "monthly", priority: "0.6" },
    { path: "/blog", lastmod: d, changefreq: "weekly", priority: "0.8" },
    { path: "/privacy", changefreq: "yearly", priority: "0.3" },
    { path: "/terms", changefreq: "yearly", priority: "0.3" },
    { path: "/jv", lastmod: d, changefreq: "monthly", priority: "0.5" },
  ];
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderUrlset(entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      e.image
        ? [
            `    <image:image>`,
            `      <image:loc>${e.image.loc}</image:loc>`,
            e.image.title ? `      <image:title>${escapeXml(e.image.title)}</image:title>` : null,
            e.image.caption ? `      <image:caption>${escapeXml(e.image.caption)}</image:caption>` : null,
            `    </image:image>`,
          ]
            .filter(Boolean)
            .join("\n")
        : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

function renderIndex(files: Array<{ url: string; lastmod: string }>): string {
  const items = files.map((f) =>
    [`  <sitemap>`, `    <loc>${f.url}</loc>`, `    <lastmod>${f.lastmod}</lastmod>`, `  </sitemap>`].join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...items,
    `</sitemapindex>`,
    ``,
  ].join("\n");
}

async function fetchLivePosts(): Promise<SitemapEntry[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // RLS already filters to live posts (published, or scheduled with published_at <= now).
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,title,published_at,updated_at,og_image")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) {
    console.warn("[sitemap] Failed to fetch posts:", error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({
    path: `/blog/${r.slug}`,
    lastmod: (r.updated_at || r.published_at || "").slice(0, 10) || undefined,
    changefreq: "monthly" as const,
    priority: "0.7",
    image: r.og_image
      ? { loc: r.og_image.startsWith("http") ? r.og_image : `${BASE_URL}${r.og_image}`, title: r.title }
      : undefined,
  }));
}

function functionUrl(path: string): string {
  // Self-reference back to this edge function for the sitemap index entries.
  return `${SUPABASE_URL}/functions/v1/sitemap${path}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Path looks like /functions/v1/sitemap[/...]; strip the prefix.
    const sub = url.pathname.replace(/^.*?\/sitemap/, "") || "/";

    // /sitemap/static
    if (sub === "/static") {
      return new Response(renderUrlset(staticEntries()), { headers: xmlHeaders });
    }

    // /sitemap/blog/:n
    const blogMatch = sub.match(/^\/blog\/(\d+)$/);
    if (blogMatch) {
      const n = parseInt(blogMatch[1], 10);
      const posts = await fetchLivePosts();
      const start = (n - 1) * POSTS_PER_SITEMAP;
      const chunk = posts.slice(start, start + POSTS_PER_SITEMAP);
      return new Response(renderUrlset(chunk), { headers: xmlHeaders });
    }

    // Default: sitemap index
    const posts = await fetchLivePosts();
    const chunkCount = Math.max(1, Math.ceil(posts.length / POSTS_PER_SITEMAP));
    const d = today();
    const files = [
      { url: functionUrl("/static"), lastmod: d },
      ...Array.from({ length: chunkCount }, (_, i) => ({
        url: functionUrl(`/blog/${i + 1}`),
        lastmod:
          posts
            .slice(i * POSTS_PER_SITEMAP, (i + 1) * POSTS_PER_SITEMAP)
            .map((p) => p.lastmod)
            .filter(Boolean)
            .sort()
            .pop() || d,
      })),
    ];
    return new Response(renderIndex(files), { headers: xmlHeaders });
  } catch (err) {
    console.error("[sitemap] error", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
