import { canonicalUrl, PUBLIC_PAGE_SEO, SITE_ORIGIN, normalizePagePath } from "./seo";

export type SchemaNode = Record<string, unknown>;

/** Public route entities share stable identifiers with the static site graph. */
export function publicPageStructuredData(path: string, extras?: SchemaNode | SchemaNode[]): SchemaNode[] {
  const route = normalizePagePath(path);
  const metadata = PUBLIC_PAGE_SEO[route];
  const additional = extras ? (Array.isArray(extras) ? extras : [extras]) : [];
  if (!metadata) return additional;
  const url = canonicalUrl(route);
  const type = route === "/about" ? "AboutPage" : route === "/blog" ? "CollectionPage" : "WebPage";
  const page: SchemaNode = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: metadata.title,
    description: metadata.description,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
  if (["/", "/features", "/pricing", "/kanban-board", "/task-tracker", "/extensions", "/trello-alternative", "/jvsalespage"].includes(route)) {
    page.about = { "@id": `${SITE_ORIGIN}/#application` };
  }
  const nodes = [page];
  if (route !== "/" && !additional.some(node => node["@type"] === "BreadcrumbList")) {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: metadata.title.split(" — ")[0], item: url },
      ],
    });
    page.breadcrumb = { "@id": `${url}#breadcrumb` };
  }
  return [...nodes, ...additional];
}

export function blogListingStructuredData(posts: { slug: string; title: string }[]): SchemaNode {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonicalUrl("/blog")}#articles`,
    name: "Pintask blog articles",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem", position: index + 1,
      item: { "@type": "BlogPosting", "@id": `${canonicalUrl(`/blog/${post.slug}`)}#article`, url: canonicalUrl(`/blog/${post.slug}`), headline: post.title },
    })),
  };
}