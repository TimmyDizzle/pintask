import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, ArrowRight, Loader2 } from "lucide-react";

type Match = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  og_image: string | null;
  published_at: string | null;
  similarity: number;
};

const SUGGESTIONS = [
  "how do I stop procrastinating",
  "tips for shipping faster",
  "managing a remote team",
  "ADHD-friendly task management",
];

export default function BlogSemanticSearch() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  // Debounce typing
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 3) {
      setMatches([]);
      setError(null);
      setLoading(false);
      return;
    }
    const mySeq = ++requestSeq.current;
    setLoading(true);
    setError(null);

    supabase.functions
      .invoke("semantic-search-blog", { body: { query: debounced, matchCount: 6 } })
      .then(({ data, error }) => {
        if (mySeq !== requestSeq.current) return; // stale
        if (error) {
          setError(error.message || "Search failed");
          setMatches([]);
        } else {
          setMatches((data?.matches ?? []) as Match[]);
        }
      })
      .catch((e) => {
        if (mySeq !== requestSeq.current) return;
        setError(e?.message ?? "Search failed");
      })
      .finally(() => {
        if (mySeq === requestSeq.current) setLoading(false);
      });
  }, [debounced]);

  const showEmpty = useMemo(
    () => debounced.length >= 3 && !loading && !error && matches.length === 0,
    [debounced, loading, error, matches.length]
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">Semantic Blog Search</h3>
          <p className="text-xs text-muted-foreground">
            Powered by Lovable AI — search by meaning, not just keywords.
          </p>
        </div>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "how to stay focused" or "team rituals that work"'
          className="h-12 pl-10 text-base"
          aria-label="Search blog posts"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {!query && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {showEmpty && (
        <p className="mt-6 text-sm text-muted-foreground">
          No matching posts yet. Try a broader phrase.
        </p>
      )}

      {matches.length > 0 && (
        <ul className="mt-6 space-y-3">
          {matches.map((m) => (
            <li key={m.id}>
              <Link
                to={`/blog/${m.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-border/50 bg-background/60 p-4 transition hover:border-primary/60 hover:bg-background"
              >
                {m.og_image && (
                  <img
                    src={m.og_image}
                    alt=""
                    loading="lazy"
                    className="hidden h-16 w-16 shrink-0 rounded-lg object-cover sm:block"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {m.category && (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                        {m.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {(m.similarity * 100).toFixed(0)}% match
                    </Badge>
                    {m.read_time && (
                      <span className="text-xs text-muted-foreground">{m.read_time}</span>
                    )}
                  </div>
                  <h4 className="mt-1 line-clamp-1 font-heading text-base font-semibold group-hover:text-primary">
                    {m.title}
                  </h4>
                  {m.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {m.excerpt}
                    </p>
                  )}
                </div>
                <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
