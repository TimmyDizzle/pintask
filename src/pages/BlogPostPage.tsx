import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import BlogContent from "@/components/BlogContent";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/config/adsense";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fetchLivePosts, fetchPostBySlug, formatPostDate } from "@/lib/blog";

export default function BlogPostPage() {
  const { slug = "" } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ["blog-posts-public"],
    queryFn: fetchLivePosts,
  });

  const defaultUrl = post ? `https://pintask.online/blog/${post.slug}` : undefined;
  const postUrl = post?.canonical_url || defaultUrl;
  const ogImage = post?.og_image || "https://pintask.online/og-image.png";
  const metaTitle = post?.seo_title || (post ? `${post.title} — Pintask Blog` : "Pintask Blog");
  const metaDescription = post?.seo_description || post?.excerpt;
  const publishedIso = post?.published_at ?? undefined;
  const displayDate = formatPostDate(post?.published_at ?? null);

  useDocumentTitle(
    metaTitle,
    metaDescription,
    post
      ? {
          ogType: "article",
          ogImage,
          canonical: postUrl,
          keywords: [post.category, "Pintask", "Kanban", "productivity", "task management"].join(", "),
          meta: {
            "article:published_time": publishedIso || "",
            "article:section": post.category,
            "article:author": "Pintask",
            "twitter:card": "summary_large_image",
            "twitter:url": postUrl || "",
            "twitter:image": ogImage,
          },
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: metaDescription,
              datePublished: publishedIso,
              dateModified: publishedIso,
              author: { "@type": "Organization", name: "Pintask", url: "https://pintask.online" },
              publisher: {
                "@type": "Organization",
                name: "Pintask",
                logo: { "@type": "ImageObject", url: "https://pintask.online/icon-512.png" },
              },
              image: ogImage,
              mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
              articleSection: post.category,
              url: postUrl,
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://pintask.online/" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://pintask.online/blog" },
                { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
              ],
            },
          ],
        }
      : undefined,
  );

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="px-6 py-24 text-center text-muted-foreground">Loading…</div>
      </MarketingLayout>
    );
  }

  if (!post) return <Navigate to="/blog" replace />;

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <MarketingLayout>
      <article className="px-6 pt-16 pb-12 md:pt-24">
        <RevealSection className="mx-auto max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>

          <div className="mt-6 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {post.category}
            </span>
            <span className="text-xs text-muted-foreground">{displayDate}</span>
            <span className="text-xs text-muted-foreground">· {post.read_time}</span>
          </div>

          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>
        </RevealSection>

        <div className="mx-auto mt-10 max-w-3xl">
          <BlogContent content={post.content} />
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <AdSlot slot={AD_SLOTS.blogPost} />
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8">
          <h3 className="font-heading text-xl font-bold">Try Pintask free</h3>
          <p className="mt-2 text-muted-foreground">
            Personal task tracking with the most customizable Kanban board on the web. Free forever — or grab the
            Co-Founder Lifetime for $39 while spots last.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth">
                Start free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </article>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading text-2xl font-bold tracking-tight">More from the blog</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="group rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {p.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.read_time}</span>
                </div>
                <h3 className="mt-3 font-heading text-base font-semibold flex-1 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
