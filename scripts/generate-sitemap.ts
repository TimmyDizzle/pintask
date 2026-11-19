// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml as a sitemap index that references:
//   - public/sitemap-static.xml  (marketing routes)
//   - public/sitemap-blog-N.xml  (blog posts, chunked)
// Splitting kicks in automatically as blog post count grows.

import { writeFileSync, readdirSync, unlinkSync } from "fs";
import { resolve } from "path";
import { PUBLIC_PAGE_SEO } from "../src/lib/seo";

const BASE_URL = "https://pintask.online";
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://zieqfktltyolazltppjo.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZXFma3RsdHlvbGF6bHRwcGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzMzNTEsImV4cCI6MjA4OTA0OTM1MX0.FXT6Z1M1etqUAArjviKycltG3y9zTvU-kQA36PNcuNU";

// Sitemaps spec hard limit is 50,000 URLs per file. Keep chunks well under
// that so we never trip the limit even with rapid growth.
const POSTS_PER_SITEMAP = 5000;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
  image?: {
    loc: string;
    title?: string;
    caption?: string;
  };
}

const staticEntries: SitemapEntry[] = Object.keys(PUBLIC_PAGE_SEO).map((path) => ({
  path,
  changefreq: path === "/blog" || path === "/" ? "weekly" : "monthly",
  priority: path === "/" ? "1.0" : "0.7",
}));

async function fetchLivePosts(): Promise<SitemapEntry[]> {
  // RLS already filters to live posts (published, or scheduled with published_at <= now).
  const posts: SitemapEntry[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,published_at,og_image&order=published_at.desc.nullslast,slug.asc&offset=${offset}&limit=${pageSize}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      signal: AbortSignal.timeout(30000),
    });
    // Do not erase the existing sitemap when the database is unavailable.
    if (!res.ok) throw new Error(`[sitemap] Failed to fetch blog posts: ${res.status}`);
    const rows = await res.json() as Array<{ slug: string; title: string; published_at: string | null; og_image: string | null }>;
    posts.push(...rows.map((r) => ({
      path: `/blog/${r.slug}`,
      // Publication is a page-specific significant change; generic updated_at is not.
      lastmod: r.published_at?.slice(0, 10),
      changefreq: "monthly" as const,
      priority: "0.7",
      image: r.og_image ? { loc: new URL(r.og_image, BASE_URL).href, title: r.title } : undefined,
    })));
    if (rows.length < pageSize) break;
  }
  return posts;
}

function renderUrlset(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${escapeXml(`${BASE_URL}${e.path}`)}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      e.image
        ? [
            `    <image:image>`,
            `      <image:loc>${escapeXml(e.image.loc)}</image:loc>`,
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

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderIndex(files: Array<{ name: string; lastmod?: string }>) {
  const items = files.map((f) =>
    [
      `  <sitemap>`,
      `    <loc>${BASE_URL}/${f.name}</loc>`,
      ...(f.lastmod ? [`    <lastmod>${f.lastmod}</lastmod>`] : []),
      `  </sitemap>`,
    ].join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...items,
    `</sitemapindex>`,
    ``,
  ].join("\n");
}

function cleanOldBlogSitemaps() {
  try {
    for (const f of readdirSync(resolve("public"))) {
      if (/^sitemap-blog-\d+\.xml$/.test(f)) {
        unlinkSync(resolve("public", f));
      }
    }
  } catch {
    // ignore
  }
}

async function main() {
  const posts = await fetchLivePosts();

  cleanOldBlogSitemaps();

  // Static sitemap
  writeFileSync(resolve("public/sitemap-static.xml"), renderUrlset(staticEntries));

  // Blog sitemaps, chunked
  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < posts.length; i += POSTS_PER_SITEMAP) {
    chunks.push(posts.slice(i, i + POSTS_PER_SITEMAP));
  }
  // Always emit at least one blog sitemap (empty is valid) so the index is stable.
  if (chunks.length === 0) chunks.push([]);

  const blogFiles: Array<{ name: string; lastmod?: string }> = [];
  chunks.forEach((chunk, idx) => {
    const name = `sitemap-blog-${idx + 1}.xml`;
    writeFileSync(resolve("public", name), renderUrlset(chunk));
    const lastmod =
      chunk.map((c) => c.lastmod).filter(Boolean).sort().pop() || undefined;
    blogFiles.push({ name, lastmod });
  });

  // Index references the static + all blog sitemaps
  const indexFiles = [
    { name: "sitemap-static.xml" },
    ...blogFiles,
  ];
  writeFileSync(resolve("public/sitemap.xml"), renderIndex(indexFiles));

  console.log(
    `sitemap index written: ${indexFiles.length} child sitemaps (` +
      `${staticEntries.length} static + ${posts.length} blog posts across ${chunks.length} file(s))`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
