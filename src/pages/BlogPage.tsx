import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, BookOpen, FileText } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/config/adsense";
import { fetchLivePosts, formatPostDate } from "@/lib/blog";
import { blogListingStructuredData } from "@/lib/structuredData";

const categories = ["All", "Productivity", "Kanban", "Tutorials", "Product Updates"];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts-public"],
    queryFn: fetchLivePosts,
  });

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => p.id !== featured?.id);
  useDocumentTitle(undefined, undefined, {
    jsonLd: blogListingStructuredData(featured ? [featured, ...rest] : rest),
  });

  return (
    <MarketingLayout>
      <section className="px-6 pb-10 pt-12 md:pt-16">
        <RevealSection className="mx-auto max-w-5xl">
          <BookOpen className="h-9 w-9 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="mt-5 font-heading text-4xl font-bold sm:text-5xl">Pintask Blog</h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Practical guides on Kanban, workflow design, and team productivity.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">The Pintask Team</span>
            <span aria-hidden>·</span>
            <span>Updated weekly</span>
            <span aria-hidden>·</span>
            <span>{posts.length} articles</span>
          </div>
        </RevealSection>
      </section>

      <section id="blog-content" className="px-6">
        <div className="mx-auto max-w-5xl border-y border-border py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant="ghost"
                  size="sm"
                  aria-pressed={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-sm px-2 text-sm font-medium ${
                    activeCategory === cat
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                aria-label="Search posts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {featured && (
            <RevealSection>
              <Link
                to={`/blog/${featured.slug}`}
                className="group mb-6 block border-b border-border pb-8 pt-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-primary">
                    {featured.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatPostDate(featured.published_at)}</span>
                  <span className="text-xs text-muted-foreground">· {featured.read_time}</span>
                </div>
                <h2 className="mt-3 max-w-3xl font-heading text-2xl font-bold group-hover:text-primary transition-colors sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read article <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            </RevealSection>
          )}

          <AdSlot slot={AD_SLOTS.blogIndexTop} className="mb-8" />

          <div className="grid gap-x-10 md:grid-cols-2">
            {rest.map((post, i) => (
              <RevealSection key={post.id} delay={Math.min(i * 30, 150)}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex h-full flex-col border-b border-border py-6"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.read_time}</span>
                  </div>
                  <h3 className="mt-3 font-heading text-base font-semibold flex-1 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <p className="mt-3 text-xs font-medium text-primary">{formatPostDate(post.published_at)}</p>
                </Link>
              </RevealSection>
            ))}
          </div>

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No posts match your search.</p>
          )}
        </div>
      </section>

      <section className="px-6 pb-6">
        <div className="mx-auto max-w-4xl">
          <AdSlot slot={AD_SLOTS.blogIndexInline} />
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <RevealSection className="mx-auto max-w-md text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Get new posts in your inbox</h2>
          <div className="mt-6 flex gap-2">
            <Input placeholder="Your email" type="email" />
            <Button>Subscribe</Button>
          </div>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
