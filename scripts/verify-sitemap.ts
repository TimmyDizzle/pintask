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

type RedirectHop = { from: string; to: string; status: number };
type CheckResult = {
  url: string;
  status: number;
  ok: boolean;
  contentType: string | null;
  contentTypeOk: boolean;
  latencyMs: number;
  redirects: RedirectHop[];
  finalUrl: string;
  error?: string;
};
type CacheEntry = {
  lastmod: string | null;
  status: number;
  ok: boolean;
  contentType: string | null;
  contentTypeOk: boolean;
  latencyMs: number;
  redirects: RedirectHop[];
  finalUrl: string;
  checkedAt: number;
};
type Cache = { version: 2; entries: Record<string, CacheEntry> };

function loadCache(): Cache {
  if (!existsSync(CACHE_PATH)) return { version: 2, entries: {} };
  try {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
    if (parsed?.version === 2 && parsed.entries) return parsed as Cache;
  } catch {
    /* ignore */
  }
  return { version: 2, entries: {} };
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
    return { kind: "image", matcher: /^image\//i };
  }
  // Default: HTML pages (including extensionless routes).
  return { kind: "html", matcher: /text\/html|application\/xhtml\+xml/i };
}

const MAX_REDIRECTS = 10;

async function checkUrl(url: string): Promise<CheckResult> {
  const expected = expectedContentType(url);
  const headers = { "user-agent": "sitemap-verifier/1.0" } as const;

  const fetchChain = async (method: "HEAD" | "GET") => {
    const redirects: RedirectHop[] = [];
    let current = url;
    let res: Response | null = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await fetch(current, { method, redirect: "manual", headers });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        const next = new URL(res.headers.get("location")!, current).toString();
        redirects.push({ from: current, to: next, status: res.status });
        current = next;
        continue;
      }
      break;
    }
    return { res: res!, redirects, finalUrl: current };
  };

  let lastErr = "";
  for (let i = 0; i < 3; i++) {
    const started = performance.now();
    try {
      let { res, redirects, finalUrl } = await fetchChain("HEAD");
      let ct = res.headers.get("content-type");
      // HEAD often lacks/wrong content-type; promote to GET if status needs retry OR ct missing.
      if (res.status === 405 || res.status === 403 || !ct) {
        ({ res, redirects, finalUrl } = await fetchChain("GET"));
        ct = res.headers.get("content-type");
      }
      const latencyMs = Math.round(performance.now() - started);
      const ok = res.status >= 200 && res.status < 400;
      const contentTypeOk = !!ct && expected.matcher.test(ct);
      return { url, status: res.status, ok, contentType: ct, contentTypeOk, latencyMs, redirects, finalUrl };
    } catch (e) {
      lastErr = (e as Error).message;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  return {
    url, status: 0, ok: false, contentType: null, contentTypeOk: false,
    latencyMs: 0, redirects: [], finalUrl: url, error: lastErr,
  };
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

/**
 * Returns the set of blog slugs that are LIVE according to RLS — i.e. what
 * an unauthenticated visitor (and therefore the sitemap) is allowed to see.
 *
 * We deliberately do NOT re-filter by `status` client-side. RLS already
 * encodes the "live" definition (published OR scheduled with due date),
 * so trusting the RLS-returned slugs is the single source of truth.
 */
async function getLiveSlugs(): Promise<{ ok: true; slugs: Set<string> } | { ok: false; reason: string }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from("blog_posts").select("slug");
  if (error) return { ok: false, reason: error.message };
  return { ok: true, slugs: new Set((data ?? []).map((p: any) => p.slug as string)) };
}

function slugFromBlogUrl(u: string): string {
  return u.replace(/\/$/, "").split("/").pop()!;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function renderHtmlReport(summary: any, results: CheckResult[]): string {
  const rows = results.map((r) => {
    const statusClass = !r.ok ? "fail" : !r.contentTypeOk ? "warn" : "ok";
    const statusLabel = r.status || "ERR";
    const redirects = r.redirects.length
      ? r.redirects.map((h) => `<div class="hop">${h.status} → <a href="${escapeHtml(h.to)}">${escapeHtml(h.to)}</a></div>`).join("")
      : `<span class="muted">—</span>`;
    return `
      <tr class="${statusClass}">
        <td class="status">${statusLabel}</td>
        <td class="url"><a href="${escapeHtml(r.url)}">${escapeHtml(r.url)}</a></td>
        <td class="ct">${escapeHtml(r.contentType ?? "—")}${r.ok && !r.contentTypeOk ? ' <span class="badge">wrong</span>' : ""}</td>
        <td class="lat">${r.latencyMs || "—"}${r.latencyMs ? "ms" : ""}</td>
        <td class="redir">${redirects}${r.error ? `<div class="err">${escapeHtml(r.error)}</div>` : ""}</td>
      </tr>`;
  }).join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Sitemap verification report — ${escapeHtml(summary.site)}</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 -apple-system, system-ui, sans-serif; margin: 2rem; max-width: 1200px; }
  h1 { margin-bottom: 0.25rem; }
  .meta { color: #888; margin-bottom: 1.5rem; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
  .card { padding: 0.75rem 1rem; border: 1px solid #8884; border-radius: 8px; }
  .card .n { font-size: 1.5rem; font-weight: 600; }
  .card .l { font-size: 0.75rem; text-transform: uppercase; color: #888; letter-spacing: 0.05em; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { padding: 0.5rem 0.6rem; text-align: left; border-bottom: 1px solid #8883; vertical-align: top; }
  th { background: #8881; position: sticky; top: 0; }
  tr.fail .status { color: #c0392b; font-weight: 600; }
  tr.warn .status { color: #d4882a; font-weight: 600; }
  tr.ok .status { color: #2a8a4a; }
  .url a { color: inherit; word-break: break-all; }
  .hop { font-family: ui-monospace, monospace; font-size: 12px; color: #888; }
  .badge { background: #d4882a; color: white; padding: 1px 6px; border-radius: 3px; font-size: 11px; }
  .err { color: #c0392b; font-size: 12px; }
  .muted { color: #aaa; }
  .leaks { margin: 1.5rem 0; padding: 0.75rem 1rem; border: 1px solid #c0392b; border-radius: 8px; background: #c0392b11; }
</style></head><body>
  <h1>Sitemap verification report</h1>
  <div class="meta">${escapeHtml(summary.site)} · generated ${escapeHtml(summary.generatedAt)} · ${summary.sitemaps.length} sitemap file(s): ${summary.sitemaps.map(escapeHtml).join(", ")}</div>
  <div class="cards">
    <div class="card"><div class="n">${summary.totals.urls}</div><div class="l">Total</div></div>
    <div class="card"><div class="n" style="color:#2a8a4a">${summary.totals.ok}</div><div class="l">OK</div></div>
    <div class="card"><div class="n" style="color:#c0392b">${summary.totals.failedStatus}</div><div class="l">Failed status</div></div>
    <div class="card"><div class="n" style="color:#d4882a">${summary.totals.failedContentType}</div><div class="l">Wrong type</div></div>
    <div class="card"><div class="n">${summary.latencyMs.p50}ms</div><div class="l">p50 latency</div></div>
    <div class="card"><div class="n">${summary.latencyMs.p95}ms</div><div class="l">p95 latency</div></div>
  </div>
  ${summary.draftLeaks.length ? `<div class="leaks"><strong>${summary.draftLeaks.length} draft/scheduled-future slug(s) leaked into the sitemap:</strong><ul>${summary.draftLeaks.map((l: { slug: string; url: string }) => `<li><code>${escapeHtml(l.slug)}</code> — <a href="${escapeHtml(l.url)}">${escapeHtml(l.url)}</a></li>`).join("")}</ul></div>` : ""}
  ${summary.orphanSlugs.length ? `<div class="leaks" style="border-color:#d4882a;background:#d4882a11"><strong>${summary.orphanSlugs.length} live slug(s) missing from the sitemap:</strong><ul>${summary.orphanSlugs.map((s: string) => `<li><code>${escapeHtml(s)}</code></li>`).join("")}</ul></div>` : ""}
  ${summary.dbCheckSkipped ? `<div class="leaks" style="border-color:#888;background:#8881"><strong>Slug-level leak check skipped:</strong> ${escapeHtml(summary.dbCheckSkipped)}</div>` : ""}
  <table>
    <thead><tr><th>Status</th><th>URL</th><th>Content-Type</th><th>Latency</th><th>Redirects / error</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>
`;
}

async function main() {
  console.log(`Verifying sitemap URLs against ${SITE_URL}${FORCE ? " (force: recheck all)" : ""}\n`);

  const { entries, sitemaps } = await collectAllUrls();
  const urls = [...entries.keys()];
  console.log(`Found ${sitemaps.length} sitemap file(s): ${sitemaps.join(", ")}`);
  console.log(`Total unique URLs: ${urls.length}`);

  const cache = FORCE ? { version: 2 as const, entries: {} } : loadCache();
  const now = Date.now();

  // Partition: cached-hit vs needs-check
  const toCheck: string[] = [];
  const cached: CheckResult[] = [];
  for (const url of urls) {
    const lastmod = entries.get(url) ?? null;
    const c = cache.entries[url];
    const fresh = c && c.ok && c.contentTypeOk && c.lastmod === lastmod && now - c.checkedAt < CACHE_TTL_MS;
    if (fresh) {
      cached.push({
        url, status: c.status, ok: c.ok, contentType: c.contentType, contentTypeOk: c.contentTypeOk,
        latencyMs: c.latencyMs, redirects: c.redirects ?? [], finalUrl: c.finalUrl ?? url,
      });
    } else {
      toCheck.push(url);
    }
  }
  console.log(`From cache: ${cached.length}   To check: ${toCheck.length}\n`);

  // ---- Slug-level draft leak detection ----
  // 1. Collect every /blog/<slug> URL in the sitemap.
  // 2. Ask Supabase for every slug visible to anon (RLS is the source of
  //    truth — it already enforces published OR scheduled-and-due).
  // 3. Leaks       = sitemap slugs that RLS does NOT expose (draft/scheduled-future).
  //    Orphans     = RLS-live slugs that are MISSING from the sitemap.
  const blogUrls = urls.filter((u) => u.includes("/blog/") && !u.endsWith("/blog"));
  const sitemapSlugToUrl = new Map<string, string>();
  for (const u of blogUrls) sitemapSlugToUrl.set(slugFromBlogUrl(u), u);

  const liveResult = await getLiveSlugs();
  const leaked: Array<{ slug: string; url: string }> = [];
  const orphans: string[] = [];
  let dbCheckSkipped: string | null = null;

  if (!liveResult.ok) {
    dbCheckSkipped = liveResult.reason;
  } else {
    for (const [slug, url] of sitemapSlugToUrl) {
      if (!liveResult.slugs.has(slug)) leaked.push({ slug, url });
    }
    for (const slug of liveResult.slugs) {
      if (!sitemapSlugToUrl.has(slug)) orphans.push(slug);
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
      latencyMs: r.latencyMs,
      redirects: r.redirects,
      finalUrl: r.finalUrl,
      checkedAt: now,
    };
  }
  // Drop stale entries no longer in sitemap
  for (const u of Object.keys(cache.entries)) {
    if (!entries.has(u)) delete cache.entries[u];
  }
  saveCache(cache);

  const results: CheckResult[] = [...cached, ...checked].sort((a, b) => a.url.localeCompare(b.url));
  const failedStatus = results.filter((r) => !r.ok);
  const failedCT = results.filter((r) => r.ok && !r.contentTypeOk);
  const ok = results.filter((r) => r.ok && r.contentTypeOk).length;
  const latencies = results.map((r) => r.latencyMs).filter((n) => n > 0).sort((a, b) => a - b);
  const pct = (p: number) => latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(p * latencies.length))] : 0;
  const summary = {
    generatedAt: new Date(now).toISOString(),
    site: SITE_URL,
    sitemaps,
    totals: { urls: results.length, ok, failedStatus: failedStatus.length, failedContentType: failedCT.length, cached: cached.length, fetched: checked.length },
    latencyMs: { p50: pct(0.5), p95: pct(0.95), max: latencies.at(-1) ?? 0 },
    draftLeaks: leaked,
    orphanSlugs: orphans,
    liveSlugCount: liveResult.ok ? liveResult.slugs.size : null,
    blogUrlCount: blogUrls.length,
    dbCheckSkipped,
  };

  // Write reports
  const reportsDir = join(process.cwd(), "scripts", "reports");
  mkdirSync(reportsDir, { recursive: true });
  const jsonPath = join(reportsDir, "verify-sitemap.json");
  const htmlPath = join(reportsDir, "verify-sitemap.html");
  writeFileSync(jsonPath, JSON.stringify({ summary, results }, null, 2));
  writeFileSync(htmlPath, renderHtmlReport(summary, results));

  console.log(`\n--- Results ---`);
  console.log(`OK (2xx + content-type): ${ok}/${results.length}  (${cached.length} cached, ${checked.length} fetched)`);
  console.log(`Failed status:           ${failedStatus.length}`);
  console.log(`Wrong content-type:      ${failedCT.length}`);
  console.log(`Latency:                 p50=${summary.latencyMs.p50}ms  p95=${summary.latencyMs.p95}ms  max=${summary.latencyMs.max}ms`);
  if (failedStatus.length) {
    console.log(`\nFailing URLs (status):`);
    for (const f of failedStatus) console.log(`  [${f.status || "ERR"}] ${f.url}${f.error ? ` (${f.error})` : ""}`);
  }
  if (failedCT.length) {
    console.log(`\nFailing URLs (content-type):`);
    for (const f of failedCT) {
      const exp = expectedContentType(f.url).kind;
      console.log(`  [expected ${exp}, got ${f.contentType ?? "none"}] ${f.url}`);
    }
  }
  console.log(`\nReports written:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${htmlPath}`);

  console.log(`\n--- Draft leak check (slug-level, cross-checked against RLS) ---`);
  if (dbCheckSkipped) {
    console.log(`Skipped — could not query blog_posts via anon: ${dbCheckSkipped}`);
  } else {
    console.log(`Live slugs visible to anon (RLS): ${liveResult.ok ? liveResult.slugs.size : 0}`);
    console.log(`Blog URLs in sitemap:             ${blogUrls.length}`);
    if (leaked.length === 0) {
      console.log(`✓ No draft/scheduled-future slugs leaked into the sitemap.`);
    } else {
      console.log(`!! ${leaked.length} sitemap URL(s) point to slugs NOT exposed by RLS (draft or scheduled-future):`);
      for (const { slug, url } of leaked) console.log(`  [${slug}] ${url}`);
    }
    if (orphans.length === 0) {
      console.log(`✓ Every live slug is included in the sitemap.`);
    } else {
      console.log(`!! ${orphans.length} live slug(s) MISSING from sitemap:`);
      for (const slug of orphans) console.log(`  ${slug}`);
    }
  }

  console.log(`\nCache: ${CACHE_PATH}`);
  const exit = failedStatus.length > 0 || failedCT.length > 0 || leaked.length > 0 || orphans.length > 0 ? 1 : 0;
  console.log(`Exit code: ${exit}`);
  process.exit(exit);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
