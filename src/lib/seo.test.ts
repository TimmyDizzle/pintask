import { describe, expect, it } from "vitest";
import { canonicalUrl, PUBLIC_PAGE_SEO } from "./seo";

describe("Pintask page URLs", () => {
  it("uses the primary domain and the current page rather than the homepage", () => {
    expect(canonicalUrl("/blog/planning?utm_source=test#article")).toBe("https://pintask.online/blog/planning");
  });
  it("normalizes trailing slashes without changing the root URL", () => {
    expect(canonicalUrl("/features/")).toBe("https://pintask.online/features");
    expect(canonicalUrl("/")).toBe("https://pintask.online/");
  });
  it("includes both public partner pages and excludes private app pages", () => {
    expect(Object.keys(PUBLIC_PAGE_SEO)).toContain("/jvsalespage");
    expect(Object.keys(PUBLIC_PAGE_SEO)).toContain("/jv");
    expect(Object.keys(PUBLIC_PAGE_SEO)).not.toContain("/dashboard");
    expect(Object.keys(PUBLIC_PAGE_SEO)).not.toContain("/admin/blog");
  });
});