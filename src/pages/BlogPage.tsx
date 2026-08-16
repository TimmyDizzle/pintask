import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import BlogHeroBackdrop from "@/components/BlogHeroBackdrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, ChevronDown } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/config/adsense";
import { fetchLivePosts, formatPostDate } from "@/lib/blog";

const categories = ["All", "Productivity", "Kanban", "Tutorials", "Product Updates"];

export default function BlogPage() {
  useDocumentTitle(
    "Pintask Blog — Productivity, Kanban, and Task Management Insights",
    "Practical guides on Kanban workflow, task management, team productivity, and getting the most out of Pintask.",
  );
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

  return (
    <MarketingLayout>
      <section className="relative isolate overflow-hidden px-6 py-24 md:py-32">
        <BlogHeroBackdrop />
        <RevealSection className="relative mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Productivity & Kanban
            </span>
          </div>
          <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            The{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pintask
            </span>{" "}
            Blog
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Practical guides on Kanban, workflow design, and team productivity.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">The Pintask Team</span>
            <span aria-hidden>·</span>
            <time dateTime="2026-01-01">Updated weekly</time>
            <span aria-hidden>·</span>
            <span>20+ articles</span>
          </div>
        </RevealSection>
      </section>

      <div className="flex justify-center -mt-10 pb-2">
        <a
          href="#blog-content"
          aria-label="Skip to blog posts"
          className="scroll-indicator inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-primary hover:border-primary/40"
        >
          <ChevronDown className="h-4 w-4" />
        </a>
      </div>

      <section id="blog-content" className="border-t border-border/40 bg-muted/30 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          {featured && (
            <RevealSection>
              <Link
                to={`/blog/${featured.slug}`}
                className="group block rounded-xl border border-primary/20 bg-card p-8 shadow-sm hover:shadow-md transition-shadow mb-8"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {featured.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatPostDate(featured.published_at)}</span>
                  <span className="text-xs text-muted-foreground">· {featured.read_time}</span>
                </div>
                <h2 className="mt-3 font-heading text-2xl font-bold group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read article <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            </RevealSection>
          )}

          <AdSlot slot={AD_SLOTS.blogIndexTop} className="mb-8" />

          <div className="grid gap-6 md:grid-cols-3">
            {rest.map((post, i) => (
              <RevealSection key={post.id} delay={80 + i * 80}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
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
