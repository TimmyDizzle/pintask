## Fix missing excerpt on "ADHD Productivity Tech Stack" blog card

### Problem
The blog index card for "The ADHD Productivity Tech Stack: 8 Tools to Tame Your Brain" is missing the gray body description that every other card shows. Cause: the `excerpt` column for that row in `blog_posts` is an empty string (confirmed via DB query). The card template renders `{post.excerpt}` directly, so an empty value leaves a blank gap.

### Fix
Run a one-line SQL `UPDATE` to set a proper excerpt on that row only. No code or component changes — every other post already has an excerpt and renders fine.

Proposed excerpt (matches the tone/length of neighboring cards, ~25 words):

> "The 8 tools ADHD brains actually stick with — for capture, focus, task management, and follow-through. A no-fluff stack built around how your brain really works."

### Technical detail
- Single migration / update against `public.blog_posts` where `slug = 'the-adhd-productivity-tech-stack-8-tools-to-tame-your-brain'`.
- No schema, RLS, or frontend changes.
- Card will repopulate immediately on next blog index load (React Query refetch).

### Out of scope
- No changes to the post body, title, category, read time, or publish date.
- No changes to other posts.
