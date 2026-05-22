/**
 * Verifies that every URL in the sitemap returns a 2xx response
 * and that no draft (unpublished) blog URLs appear in the sitemap.
 *
 * Usage: bunx tsx scripts/verify-sitemap.ts [baseUrl]
 *   baseUrl defaults to https://pintask.online
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = process.argv[2] ?? "https://pintask.online";
const PUBLIC_DIR = join(process.cwd(), "public");
const CONCURRENCY = 8;

const SUPABASE_URL = "https://zieqfktltyolazltppjo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZXFma3RsdHlvbGF6bHRwcGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzMzNTEsImV4cCI6MjA4OTA0OTM1MX0.FXT6Z1M1etqUAArjviKycltG3y9zTvU-kQA36PNcuNU";

function extractLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
}

function readSitemap(name: string): string {
  return readFileSync(join(PUBLIC_DIR, name), "utf8");
}

async function collectAllUrls(): Promise<{ urls: string[]; sitemaps: string[] }> {
  const indexXml = readSitemap("sitemap.xml");
  const sitemapLocs = extractLocs(indexXml);
  const urls = new Set<string>();
  const sitemaps: string[] = [];

  // Find local sitemap files referenced by the index
  const localFiles = readdirSync(PUBLIC_DIR).filter((f) => /^sitemap.*\.xml$/.test(f));

  for (const loc of sitemapLocs) {
    const fileName = loc.split("/").pop()!;
    if (!localFiles.includes(fileName)) {
      console.warn(`! Sitemap referenced but file not found locally: ${fileName}`);
      continue;
    }
    sitemaps.push(fileName);
    const xml = readSitemap(fileName);
    for (const u of extractLocs(xml)) urls.add(u);
  }

  return { urls: [...urls], sitemaps };
}

async function checkUrl(url: string): Promise<{ url: string; status: number; ok: boolean; error?: string }> {
  const attempt = async (method: "HEAD" | "GET") => {
    const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": "sitemap-verifier/1.0" } });
    return res.status;
  };
  let lastErr = "";
  for (let i = 0; i < 3; i++) {
    try {
      let status = await attempt("HEAD");
      if (status === 405 || status === 403) status = await attempt("GET");
      return { url, status, ok: status >= 200 && status < 400 };
    } catch (e) {
      lastErr = (e as Error).message;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  return { url, status: 0, ok: false, error: lastErr };
}

async function runPool<T, R>(items: T[], n: number, worker: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) return;
        results[idx] = await worker(items[idx]);
      }
    })
  );
  return results;
}

async function getDraftSlugs(): Promise<Set<string>> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // Anon RLS only returns published rows; fetch all visible (published) slugs,
  // then any blog URL in the sitemap whose slug is NOT in this set is suspicious.
  const { data, error } = await supabase.from("blog_posts").select("slug,status");
  if (error) {
    console.warn(`! Could not fetch posts via anon (RLS): ${error.message}`);
    return new Set();
  }
  const published = new Set((data ?? []).filter((p: any) => p.status === "published").map((p: any) => p.slug));
  return published as unknown as Set<string>;
}

async function main() {
  console.log(`Verifying sitemap URLs against ${SITE_URL}\n`);

  const { urls, sitemaps } = await collectAllUrls();
  console.log(`Found ${sitemaps.length} sitemap file(s): ${sitemaps.join(", ")}`);
  console.log(`Total unique URLs: ${urls.length}\n`);

  // Draft leak check
  const blogUrls = urls.filter((u) => u.includes("/blog/") && !u.endsWith("/blog"));
  const publishedSlugs = await getDraftSlugs();
  const leaked: string[] = [];
  if (publishedSlugs.size > 0) {
    for (const u of blogUrls) {
      const slug = u.replace(/\/$/, "").split("/").pop()!;
      if (!publishedSlugs.has(slug)) leaked.push(u);
    }
  }

  // HTTP check
  console.log(`Checking ${urls.length} URLs with concurrency ${CONCURRENCY}...`);
  const results = await runPool(urls, CONCURRENCY, checkUrl);

  const failed = results.filter((r) => !r.ok);
  const ok = results.length - failed.length;

  console.log(`\n--- Results ---`);
  console.log(`OK (2xx):   ${ok}/${results.length}`);
  console.log(`Failed:     ${failed.length}`);
  if (failed.length) {
    console.log(`\nFailing URLs:`);
    for (const f of failed) console.log(`  [${f.status || "ERR"}] ${f.url}${f.error ? ` (${f.error})` : ""}`);
  }

  console.log(`\n--- Draft leak check ---`);
  if (publishedSlugs.size === 0) {
    console.log(`Skipped (could not verify against database).`);
  } else {
    console.log(`Published blog posts visible to anon: ${publishedSlugs.size}`);
    console.log(`Blog URLs in sitemap:                ${blogUrls.length}`);
    if (leaked.length === 0) {
      console.log(`No draft URLs leaked into the sitemap.`);
    } else {
      console.log(`!! ${leaked.length} suspicious (non-published) URL(s) found in sitemap:`);
      for (const u of leaked) console.log(`  ${u}`);
    }
  }

  const exit = failed.length > 0 || leaked.length > 0 ? 1 : 0;
  console.log(`\nExit code: ${exit}`);
  process.exit(exit);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
