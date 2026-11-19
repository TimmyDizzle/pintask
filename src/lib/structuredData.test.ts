import { describe, expect, it } from "vitest";
import { PUBLIC_PAGE_SEO } from "./seo";
import { blogListingStructuredData, publicPageStructuredData } from "./structuredData";

describe("public structured data", () => {
  it.each(Object.keys(PUBLIC_PAGE_SEO))("self-references public route %s", path => {
    const nodes = publicPageStructuredData(path);
    expect(nodes[0].url).toBe(`https://pintask.online${path}`);
    expect(nodes[0].isPartOf).toEqual({ "@id": "https://pintask.online/#website" });
    expect(nodes.some(node => "aggregateRating" in node || "offers" in node)).toBe(false);
  });
  it("uses specific page types and excludes private routes", () => {
    expect(publicPageStructuredData("/about")[0]["@type"]).toBe("AboutPage");
    expect(publicPageStructuredData("/blog")[0]["@type"]).toBe("CollectionPage");
    expect(publicPageStructuredData("/dashboard")).toEqual([]);
  });
  it("preserves existing FAQ data without duplicating supplied breadcrumbs", () => {
    const faq = { "@type": "FAQPage", mainEntity: [] };
    expect(publicPageStructuredData("/pricing", faq)).toContain(faq);
    expect(publicPageStructuredData("/blog", { "@type": "BreadcrumbList" }).filter(node => node["@type"] === "BreadcrumbList")).toHaveLength(1);
  });
  it("lists real article URLs and titles", () => {
    expect(blogListingStructuredData([{ slug: "pintask-vs-goblin-tools-adhd", title: "Pintask vs Goblin Tools" }]).itemListElement).toEqual([
      { "@type": "ListItem", position: 1, item: { "@type": "BlogPosting", "@id": "https://pintask.online/blog/pintask-vs-goblin-tools-adhd#article", url: "https://pintask.online/blog/pintask-vs-goblin-tools-adhd", headline: "Pintask vs Goblin Tools" } },
    ]);
  });
});