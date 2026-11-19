import { Link, useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import BlogContent from "@/components/BlogContent";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/config/adsense";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileText, Tag, CalendarDays, Clock } from "lucide-react";
import { fetchLivePosts, fetchPostBySlug, formatPostDate } from "@/lib/blog";
import { blogSeo, canonicalUrl } from "@/lib/seo";

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

  const postUrl = canonicalUrl(`/blog/${slug}`);
  const ogImage = post?.og_image || "https://pintask.online/og-image.png";
  const { title: metaTitle, description: metaDescription } = post
    ? blogSeo(post)
    : { title: "ADHD Productivity Article — Pintask Blog", description: "Practical ADHD productivity and Kanban insights from Pintask." };
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
              "@type": "BlogPosting",
              "@id": `${postUrl}#article`,
              headline: post.title,
              description: metaDescription,
              datePublished: publishedIso,
              dateModified: publishedIso,
              isPartOf: { "@id": "https://pintask.online/#website" },
              inLanguage: "en",
              author: { "@type": "Organization", "@id": "https://pintask.online/#organization", name: "Pintask", url: "https://pintask.online/" },
              publisher: {
                "@type": "Organization",
                "@id": "https://pintask.online/#organization",
                name: "Pintask",
                logo: { "@type": "ImageObject", url: "https://pintask.online/icon-512.png" },
              },
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
      <article className="px-6 pt-10 pb-12 md:pt-16">
        <RevealSection className="mx-auto max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>

          <FileText className="mt-8 h-11 w-11 text-primary" strokeWidth={1.25} aria-hidden="true" />
          <h1 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <dl className="mt-6 space-y-3 border-b border-border pb-6 text-sm">
            <div className="flex flex-wrap gap-3"><dt className="flex w-28 items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" /> Category</dt><dd className="text-primary">{post.category}</dd></div>
            <div className="flex flex-wrap gap-3"><dt className="flex w-28 items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Published</dt><dd>{displayDate}</dd></div>
            <div className="flex flex-wrap gap-3"><dt className="flex w-28 items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Reading time</dt><dd>{post.read_time}</dd></div>
          </dl>
        </RevealSection>

        <div className="mx-auto mt-8 max-w-3xl">
          <BlogContent content={post.content} />
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <AdSlot slot={AD_SLOTS.blogPost} />
        </div>

        <div className="mx-auto mt-12 max-w-3xl border-y border-border py-8">
          <h3 className="font-heading text-xl font-bold">Try Pintask free</h3>
          <p className="mt-2 text-muted-foreground">
            Turn scattered thoughts into manageable tasks, see your progress on a visual Kanban board,
            and choose your next step with Pintask's ADHD-friendly tools.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to={`/auth?utm_source=blog&utm_medium=article&utm_campaign=${encodeURIComponent(slug)}`}>
                Create your Pintask account <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </article>

      <section className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-semibold">More from the blog</h2>
          <div className="mt-6 divide-y divide-border">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="group block py-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
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
