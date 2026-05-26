## Goal

Make sure regular signups can only see their own kanban/projects/assistant — not the admin-only areas (blog editor, ad analytics, AI eval, claim-admin banner).

## What I found

Admin role checks are already in the database (`user_roles` + `has_role`), and `AdminGuard` exists. But the wiring has gaps:

| Route | Current state | Issue |
|---|---|---|
| `/admin/blog` | Inline check + "Claim admin" banner for non-admins | Banner shouldn't show; should use AdminGuard like the others |
| `/admin/blog/:id` | `AdminGuard` ✅ | OK |
| `/admin/ai-eval` | `AdminGuard` ✅ | OK |
| `/ad-analytics` | **No guard** | Any signed-in user can view ad revenue UI |
| Sidebar links | Blog admin gated by `isAdmin` ✅; **Ad analytics shown to everyone** | Non-admins see the link |

Database RLS is already correct (blog writes, ai_usage, ad_impressions admin reads all require `has_role('admin')`), so there's no data leak — just unguarded UI pages and a misleading "Claim admin" banner.

"Emails" (Lovable Cloud → Emails) is the platform dashboard, not part of your app — only workspace members can reach it, so signups never see it.

## Plan

1. **Wrap `/ad-analytics` in `AdminGuard`** in `App.tsx` so non-admins get redirected to `/`.
2. **Refactor `/admin/blog`** to use `AdminGuard` like the other admin pages, and drop the `ClaimAdminBanner` (an admin already exists; the RPC just returns false anyway, and showing the banner invites confusion).
3. **Hide the "Ad analytics" sidebar link** behind `isAdmin` (same pattern already used for Blog admin).
4. **Quick audit pass** to confirm no other admin-only pages slip through (`AdminBlogEditor` and `AdminAiEval` already guard themselves).

## Out of scope

- No database/RLS changes — existing policies already restrict the data correctly.
- No changes to Lovable Cloud → Emails access (that's the platform, not your app).
- No new role tiers — sticking with the existing `admin` / non-admin split.
