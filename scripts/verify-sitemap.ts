/**
 * Verifies that every URL in the sitemap returns a 2xx response
 * and that no draft (unpublished) blog URLs appear in the sitemap.
 *
 * A local cache at scripts/.verify-sitemap-cache.json stores the last known
 * <lastmod> and HTTP status for each URL. On subsequent runs, URLs whose
 * <lastmod> is unchanged and whose previous check passed within CACHE_TTL_MS
 * are skipped. Pass --force (or set FORCE=1) to recheck everything.
 *
 * Usage: bunx tsx scripts/verify-sitemap.ts [baseUrl] [--force]
 *   baseUrl defaults to https://pintask.online
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const FORCE = args.includes("--force") || process.env.FORCE === "1";
const SITE_URL = (args.find((a) => !a.startsWith("--"))) ?? "https://pintask.online";
const PUBLIC_DIR = join(process.cwd(), "public");
const CACHE_PATH = join(process.cwd(), "scripts", ".verify-sitemap-cache.json");
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CONCURRENCY = 8;

const SUPABASE_URL = "https://zieqfktltyolazltppjo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZXFma3RsdHlvbGF6bHRwcGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzMzNTEsImV4cCI6MjA4OTA0OTM1MX0.FXT6Z1M1etqUAArjviKycltG3y9zTvU-kQA36PNcuNU";

type CacheEntry = {
  lastmod: string | null;
  status: number;
  ok: boolean;
  contentType: string | null;
  contentTypeOk: boolean;
  checkedAt: number;
};
type Cache = { version: 1; entries: Record<string, CacheEntry> };

function loadCache(): Cache {
  if (!existsSync(CACHE_PATH)) return { version: 1, entries: {} };
  try {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
    if (parsed?.version === 1 && parsed.entries) return parsed as Cache;
  } catch {
    /* ignore */
  }
  return { version: 1, entries: {} };
}

function saveCache(cache: Cache) {
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function extractUrlEntries(xml: string): Array<{ loc: string; lastmod: string | null }> {
  const out: Array<{ loc: string; lastmod: string | null }> = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = m[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1].trim();
    if (!loc) continue;
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1].trim() ?? null;
    out.push({ loc, lastmod });
  }
  return out;
}

function extractLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
}

function readSitemap(name: string): string {
  return readFileSync(join(PUBLIC_DIR, name), "utf8");
}

async function collectAllUrls(): Promise<{
  entries: Map<string, string | null>;
  sitemaps: string[];
}> {
  const indexXml = readSitemap("sitemap.xml");
  const sitemapLocs = extractLocs(indexXml);
  const entries = new Map<string, string | null>();
  const sitemaps: string[] = [];

  const localFiles = readdirSync(PUBLIC_DIR).filter((f) => /^sitemap.*\.xml$/.test(f));

  for (const loc of sitemapLocs) {
    const fileName = loc.split("/").pop()!;
    if (!localFiles.includes(fileName)) {
      console.warn(`! Sitemap referenced but file not found locally: ${fileName}`);
      continue;
    }
    sitemaps.push(fileName);
    const xml = readSitemap(fileName);
    for (const e of extractUrlEntries(xml)) {
      // If duplicated across sitemaps, keep the newest lastmod.
      const prev = entries.get(e.loc);
      if (prev === undefined || (e.lastmod && (!prev || e.lastmod > prev))) {
        entries.set(e.loc, e.lastmod);
      }
    }
  }

  return { entries, sitemaps };
}

function expectedContentType(url: string): { kind: "html" | "xml" | "image" | "any"; matcher: RegExp } {
  const path = (() => {
    try { return new URL(url).pathname; } catch { return url; }
  })();
  const ext = path.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
  if (ext === "xml") return { kind: "xml", matcher: /(application|text)\/xml|\+xml/i };
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"].includes(ext)) {
    return { kind: "image", matcher: /^image\// i };
  }
  // Default: HTML pages (including extensionless routes).
  return { kind: "html", matcher: /text\/html|application\/xhtml\+xml/i };
}

async function checkUrl(url: string): Promise<{
  url: string; status: number; ok: boolean; contentType: string | null; contentTypeOk: boolean; error?: string;
}> {
  const expected = expectedContentType(url);
  const attempt = async (method: "HEAD" | "GET") => {
    const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": "sitemap-verifier/1.0" } });
    return { status: res.status, ct: res.headers.get("content-type") };
  };
  let lastErr = "";
  for (let i = 0; i < 3; i++) {
    try {
      let r = await attempt("HEAD");
      // HEAD often lacks/wrong content-type; promote to GET if status needs retry OR ct missing.
      if (r.status === 405 || r.status === 403 || !r.ct) r = await attempt("GET");
      const ok = r.status >= 200 && r.status < 400;
      const contentTypeOk = !!r.ct && expected.matcher.test(r.ct);
      return { url, status: r.status, ok, contentType: r.ct, contentTypeOk };
    } catch (e) {
      lastErr = (e as Error).message;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  return { url, status: 0, ok: false, contentType: null, contentTypeOk: false, error: lastErr };
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

async function getPublishedSlugs(): Promise<Set<string>> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from("blog_posts").select("slug,status");
  if (error) {
    console.warn(`! Could not fetch posts via anon (RLS): ${error.message}`);
    return new Set();
  }
  return new Set((data ?? []).filter((p: any) => p.status === "published").map((p: any) => p.slug));
}

async function main() {
  console.log(`Verifying sitemap URLs against ${SITE_URL}${FORCE ? " (force: recheck all)" : ""}\n`);

  const { entries, sitemaps } = await collectAllUrls();
  const urls = [...entries.keys()];
  console.log(`Found ${sitemaps.length} sitemap file(s): ${sitemaps.join(", ")}`);
  console.log(`Total unique URLs: ${urls.length}`);

  const cache = FORCE ? { version: 1 as const, entries: {} } : loadCache();
  const now = Date.now();

  // Partition: cached-hit vs needs-check
  const toCheck: string[] = [];
  const cached: Array<{ url: string; status: number; ok: boolean; contentType: string | null; contentTypeOk: boolean }> = [];
  for (const url of urls) {
    const lastmod = entries.get(url) ?? null;
    const c = cache.entries[url];
    const fresh = c && c.ok && c.contentTypeOk && c.lastmod === lastmod && now - c.checkedAt < CACHE_TTL_MS;
    if (fresh) cached.push({ url, status: c.status, ok: c.ok, contentType: c.contentType, contentTypeOk: c.contentTypeOk });
    else toCheck.push(url);
  }
  console.log(`From cache: ${cached.length}   To check: ${toCheck.length}\n`);

  // Draft leak check
  const blogUrls = urls.filter((u) => u.includes("/blog/") && !u.endsWith("/blog"));
  const publishedSlugs = await getPublishedSlugs();
  const leaked: string[] = [];
  if (publishedSlugs.size > 0) {
    for (const u of blogUrls) {
      const slug = u.replace(/\/$/, "").split("/").pop()!;
      if (!publishedSlugs.has(slug)) leaked.push(u);
    }
  }

  // HTTP check
  if (toCheck.length) console.log(`Checking ${toCheck.length} URLs with concurrency ${CONCURRENCY}...`);
  const checked = await runPool(toCheck, CONCURRENCY, checkUrl);

  // Update cache
  for (const r of checked) {
    cache.entries[r.url] = {
      lastmod: entries.get(r.url) ?? null,
      status: r.status,
      ok: r.ok,
      contentType: r.contentType,
      contentTypeOk: r.contentTypeOk,
      checkedAt: now,
    };
  }
  // Drop stale entries no longer in sitemap
  for (const u of Object.keys(cache.entries)) {
    if (!entries.has(u)) delete cache.entries[u];
  }
  saveCache(cache);

  const results = [...cached, ...checked];
  const failedStatus = results.filter((r) => !r.ok);
  const failedCT = results.filter((r) => r.ok && !r.contentTypeOk);
  const ok = results.filter((r) => r.ok && r.contentTypeOk).length;

  console.log(`\n--- Results ---`);
  console.log(`OK (2xx + content-type): ${ok}/${results.length}  (${cached.length} cached, ${checked.length} fetched)`);
  console.log(`Failed status:           ${failedStatus.length}`);
  console.log(`Wrong content-type:      ${failedCT.length}`);
  if (failedStatus.length) {
    console.log(`\nFailing URLs (status):`);
    for (const f of failedStatus) console.log(`  [${f.status || "ERR"}] ${f.url}${(f as any).error ? ` (${(f as any).error})` : ""}`);
  }
  if (failedCT.length) {
    console.log(`\nFailing URLs (content-type):`);
    for (const f of failedCT) {
      const exp = expectedContentType(f.url).kind;
      console.log(`  [expected ${exp}, got ${f.contentType ?? "none"}] ${f.url}`);
    }
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

  console.log(`\nCache: ${CACHE_PATH}`);
  const exit = failedStatus.length > 0 || failedCT.length > 0 || leaked.length > 0 ? 1 : 0;
  console.log(`Exit code: ${exit}`);
  process.exit(exit);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
