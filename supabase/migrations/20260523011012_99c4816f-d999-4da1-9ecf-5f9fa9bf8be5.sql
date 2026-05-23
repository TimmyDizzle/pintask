create extension if not exists vector;

alter table public.blog_posts
  add column if not exists embedding vector(1536);

create index if not exists blog_posts_embedding_idx
  on public.blog_posts using hnsw (embedding vector_cosine_ops);

create or replace function public.match_blog_posts(
  query_embedding vector(1536),
  match_count int default 5,
  similarity_threshold float default 0.2
)
returns table (
  id uuid,
  title text,
  slug text,
  excerpt text,
  category text,
  read_time text,
  og_image text,
  published_at timestamptz,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.category,
    p.read_time,
    p.og_image,
    p.published_at,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.blog_posts p
  where p.embedding is not null
    and p.status = 'published'
    and (p.published_at is null or p.published_at <= now())
    and 1 - (p.embedding <=> query_embedding) >= similarity_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_blog_posts(vector, int, float) to anon, authenticated;