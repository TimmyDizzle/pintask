import { Link } from "react-router-dom";
import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";

const categories = ["All", "Productivity", "Kanban", "Tutorials", "Product Updates"];

const posts = [
  { title: "The 7 Best Trello Alternatives in 2026 (Free & Paid)", category: "Productivity", date: "Coming Soon", readTime: "12 min read", excerpt: "Teams are leaving Trello in droves. We compare the 7 best alternatives — including one built by developers, for developers.", featured: true },
  { title: "How to Build a Custom Kanban Board with JavaScript", category: "Tutorials", date: "Coming Soon", readTime: "10 min read", excerpt: "Most Kanban tools limit what you can build. Here's how to use the Pintask JS + Meteor API to create exactly what your team needs." },
  { title: "Kanban Board Best Practices for High-Performing Teams", category: "Kanban", date: "Coming Soon", readTime: "9 min read", excerpt: "The 5 most common Kanban mistakes teams make — and how to structure your lists, limits, and boards for maximum flow." },
  { title: "How to Migrate from Trello to Pintask in Under 5 Minutes", category: "Tutorials", date: "Coming Soon", readTime: "4 min read", excerpt: "Step-by-step walkthrough: import your entire Trello workspace in 2 clicks. All boards, lists, and cards transfer instantly." },
];

export default function BlogPage() {
  useDocumentTitle("Pintask Blog — Productivity, Kanban, and Task Management Insights", "Practical guides on Kanban workflow, task management, team productivity, and getting the most out of Pintask.");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">The Pintask Blog</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Practical guides on Kanban, workflow design, and team productivity.</p>
        </RevealSection>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"}`}>{cat}</button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          {featured && (
            <RevealSection>
              <article className="rounded-xl border border-primary/20 bg-card p-8 shadow-sm mb-8">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{featured.category}</span>
                  <span className="text-xs text-muted-foreground">{featured.date}</span>
                  <span className="text-xs text-muted-foreground">· {featured.readTime}</span>
                </div>
                <h2 className="mt-3 font-heading text-2xl font-bold">{featured.title}</h2>
                <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
              </article>
            </RevealSection>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {rest.map((post, i) => (
              <RevealSection key={post.title} delay={80 + i * 80}>
                <article className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{post.category}</span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="mt-3 font-heading text-base font-semibold flex-1">{post.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <p className="mt-3 text-xs font-medium text-primary">{post.date}</p>
                </article>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
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
