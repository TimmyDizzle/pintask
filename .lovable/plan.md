## Pre-launch review — Pintask

Site is broadly ready (public, admin areas locked, RLS clean, security scan returns zero findings). Below is everything I found that's still worth doing before launch, grouped by priority.

## P0 — must do before launch

1. **Verify the `pintask.online` email domain.** It's stuck in `initiated`; until DNS verifies, no auth or transactional emails go out. Open the email setup dialog, copy the NS records to your registrar, and wait for verification.
2. **Scaffold auth + transactional email templates.** Templates don't exist yet, so password reset/verification will use plain Lovable defaults and the welcome/receipt flows can't fire. Plan: 6 branded auth templates + 2 transactional (welcome on signup, JVZoo receipt).
3. **Turn on Leaked Password Protection (HIBP)** in Cloud auth settings — one toggle, blocks signups using known-breached passwords.
4. **Confirm email confirmation is required** for new signups (auto-confirm should be OFF). Right now I can't see the setting; need to verify in Cloud auth.

## P1 — strongly recommended

5. **Connect Google Search Console + submit sitemap** (SEO finding). Verify `https://pintask.online/` and submit `https://pintask.online/sitemap.xml`.
6. **Fix LCP / hero load** on the homepage (Lighthouse finding). Add `width`/`height` + `fetchpriority="high"` on the hero image, remove `loading="lazy"` from it, ensure `font-display: swap` on all `@font-face` rules.
7. **Fix low-contrast text** (Lighthouse a11y finding). Replace any `text-gray-300/400` or `text-muted-foreground/50` with semantic tokens (`text-foreground` / `text-muted-foreground`).
8. **Decide on Paddle.** Right now JVZoo is the only checkout path. We previously planned to add Paddle as a built-in second path. Either enable it now (so direct credit-card buyers work on day 1) or explicitly defer to post-launch.

## P2 — nice to have

9. **Remove unused pages** to shrink the bundle: `Dashboard.tsx`, `LandingPage.tsx`, `ProjectView.tsx`, `Reports.tsx` are not routed in `App.tsx`. Confirm with a search, then delete.
10. **Add a 404-friendly `<title>` / canonical** on `NotFound` route so accidental 404s don't get indexed.
11. **Pre-launch smoke test:** sign up with a new email → confirm → log in → create project → kanban + AI quick-add → upgrade via JVZoo test link → verify receipt arrives → logout. Catches anything the static analysis misses.

## Out of scope

- No database/RLS changes (security scan is clean).
- No new features — this is pure launch readiness.
- I won't claim findings are fixed in the SEO panel until you republish (the scanner reads the published build, not source).

## Recommended order

P0 (1→4) today → P1 (5→8) before announcing → P2 cleanup → publish → run SEO rescan.

**Tell me which subset to execute and I'll start.** Sensible default if you just say "go": do P0 + P1 #5–7, defer Paddle to a separate session, skip P2.
