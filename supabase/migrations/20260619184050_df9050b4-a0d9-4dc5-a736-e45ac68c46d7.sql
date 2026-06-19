UPDATE public.blog_posts
SET title = regexp_replace(title, 'pintask\.me', 'Pintask', 'gi'),
    excerpt = regexp_replace(coalesce(excerpt,''), 'pintask\.me', 'Pintask', 'gi'),
    content = regexp_replace(coalesce(content,''), 'pintask\.me', 'Pintask', 'gi')
WHERE title ILIKE '%pintask.me%' OR content ILIKE '%pintask.me%' OR excerpt ILIKE '%pintask.me%';