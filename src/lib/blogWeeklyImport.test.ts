import { describe, expect, it } from "vitest";

// Live content regression: these dates are the user's weekly backfill, not build dates.
describe("November 2026 weekly blog import", () => {
  it("keeps the ten supplied posts one week apart before today's comparison", async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Public blog connection is unavailable");
    const slugs = [
      "how-to-prioritize-tasks", "pin-important-tasks", "eisenhower-matrix",
      "daily-planning-routine", "time-blocking-for-beginners", "stop-procrastinating",
      "weekly-review", "digital-vs-paper-to-do-list", "stop-overcommitting", "single-tasking",
    ];
    const response = await fetch(`${url}/rest/v1/blog_posts?select=slug,published_at&slug=in.(${slugs.join(",")})&order=published_at.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    expect(response.status).toBe(200);
    const posts: Array<{ slug: string; published_at: string }> = await response.json();
    expect(posts.map((post) => post.slug)).toEqual(slugs);
    expect(posts.map((post) => post.published_at.slice(0, 10))).toEqual([
      "2026-09-10", "2026-09-17", "2026-09-24", "2026-10-01", "2026-10-08",
      "2026-10-15", "2026-10-22", "2026-10-29", "2026-11-05", "2026-11-12",
    ]);
    for (let i = 1; i < posts.length; i++) {
      expect(Date.parse(posts[i].published_at) - Date.parse(posts[i - 1].published_at)).toBe(7 * 24 * 60 * 60 * 1000);
    }
  });
});