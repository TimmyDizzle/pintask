import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    title: "Why We Rebuilt Pintask from Scratch",
    excerpt: "The original Pintask.me was loved by thousands. Here's why we started over — and what we kept.",
    date: "March 2026",
    slug: "#",
  },
  {
    title: "Kanban vs. To-Do Lists: Which Works Better?",
    excerpt: "We break down the pros and cons of each approach and when to use them.",
    date: "March 2026",
    slug: "#",
  },
  {
    title: "5 Keyboard Shortcuts That Save 30 Minutes a Day",
    excerpt: "Stop reaching for your mouse. These Pintask shortcuts will change how you work.",
    date: "Coming Soon",
    slug: "#",
  },
  {
    title: "How AI Is Changing Personal Productivity",
    excerpt: "A look at how AI assistants are being integrated into task management — and what's next for Pintask.",
    date: "Coming Soon",
    slug: "#",
  },
];

export default function BlogPage() {
  useDocumentTitle("Blog — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pintask Blog
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Tips, updates, and insights on productivity, task management, and building better workflows.
          </p>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-6">
          {posts.map((post) => (
            <article key={post.title} className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground">{post.date}</div>
              <h2 className="mt-2 font-heading text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Ready to try Pintask?</h2>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
