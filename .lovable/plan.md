# Blog System with Admin Editor + Scheduled Publishing

## Goal
Turn the current static blog (`src/data/blogPosts.ts`) into a database-backed blog with:
- An admin-only editor where you log in and create/edit posts easily
- All 10 supplied posts seeded
- First 3 published immediately (dated 5/14/26, 5/20/26, 5/21/26)
- Remaining 7 auto-publish 2/week over the next ~5 weeks
- Public `/blog` and `/blog/:slug` continue to work, but only show posts where `status = 'published'` AND `published_at <= now()`

## A note on the domain
The project currently runs on `pintask.online` (sitemap, JSON-LD, all internal links). Your brief uses `pintask.me`. I will keep using `pintask.online` everywhere unless you tell me otherwise — switching domains is a separate task (DNS + canonical/OG/sitemap rewrite). Tell me if you want me to swap.

## What gets built

### 1. Database (migration)
- `blog_posts` table: `slug` (unique), `title`, `excerpt`, `content` (markdown), `category`, `read_time`, `featured` (bool), `status` ('draft' | 'scheduled' | 'published'), `published_at` (timestamptz), `author_id`, timestamps.
- `user_roles` table + `app_role` enum (`admin`, `user`) + `has_role()` SECURITY DEFINER function — follows the standard secure pattern (roles never on profiles).
- RLS on `blog_posts`:
  - Public SELECT: only rows where `status = 'published'` AND `published_at <= now()`
  - Admin SELECT/INSERT/UPDATE/DELETE: full access via `has_role(auth.uid(), 'admin')`
- RLS on `user_roles`: users can read their own roles; only admins can write.
- You'll be granted the `admin` role via a one-time insert after the migration.

### 2. Seed the 10 posts
Insert all 10 posts as rows. Publish dates:

```text
Post 1  pintask-is-back                        2026-05-14  published
Post 2  pintask-alternatives                   2026-05-20  published
Post 3  why-visual-boards-beat-to-do-lists     2026-05-21  published
Post 4  how-to-organize-saved-links            2026-05-25  scheduled
Post 5  adhd-productivity-app                  2026-05-28  scheduled
Post 6  pocket-vs-raindrop-vs-pintask          2026-06-01  scheduled
Post 7  pinterest-is-not-a-productivity-tool   2026-06-04  scheduled
Post 8  manage-multiple-projects               2026-06-08  scheduled
Post 9  free-productivity-app-visual-thinkers  2026-06-11  scheduled
Post 10 digital-pinboard-productivity          2026-06-15  scheduled
```

(2 per week, Mon/Thu cadence starting the week after launch.)

### 3. Auto-publishing
Scheduled posts flip to `published` automatically without an edge function — we use a Postgres view + RLS that treats `status='scheduled' AND published_at<=now()` as live. A lightweight `pg_cron` job also runs nightly to update `status` to `'published'` for cleanliness so the admin UI shows truth. No edge function needed, nothing for you to babysit.

### 4. Admin editor UI
- New route `/admin/blog` (and `/admin/blog/:id` for edit). Guarded by `has_role` check — non-admins get redirected to `/`.
- List view: table of all posts (draft/scheduled/published), with status badges, publish date, edit/delete actions, "New post" button.
- Edit view: form with title, slug (auto-generated from title, editable), category dropdown, excerpt, read time, featured toggle, status, publish date, and a markdown content textarea with live preview (using the existing `BlogContent` renderer).
- Sidebar gets an "Admin" section visible only to admins, linking to `/admin/blog`.

### 5. Public blog migration
- `BlogPage` and `BlogPostPage` switch from importing `blogPosts` to fetching via React Query from Supabase (RLS filters to live posts automatically).
- `src/data/blogPosts.ts` stays as a fallback type definition / can be deleted.
- Existing ads, SEO tags, JSON-LD, related posts all keep working.

### 6. Menu
The public `MarketingLayout` already links to `/blog`. The app sidebar gets a "Blog admin" entry under the existing nav, gated by admin role.

### 7. Sitemap
Update `public/sitemap.xml` so it lists the 10 new slugs with correct `lastmod`. (Site is fully static-generated today, so I'll just edit the file. A generator script is a follow-up if you want auto-sync.)

## Out of scope (call out if you want them)
- Domain switch `pintask.online` → `pintask.me`
- Submitting sitemap to Google Search Console (manual step you do)
- Image uploads in the editor (current posts are text-only; can add later via the existing `attachments` bucket)
- Rich-text WYSIWYG (using markdown textarea + preview, which matches how posts are stored today)

## Implementation order
1. Migration: tables, roles, RLS, `has_role`, pg_cron job
2. Grant you admin (after you tell me your account email or user id)
3. Seed the 10 posts
4. Build admin pages + route guard
5. Switch public blog to DB-backed queries
6. Update sitemap
7. Verify: public `/blog` shows 3 posts now, scheduled posts hidden, admin sees all 10

Approve and I'll start with the migration.
