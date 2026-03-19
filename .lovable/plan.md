

## Landing Page + Email Collection for Pintask

### What we're building
A public landing page at `/` for unauthenticated visitors with a product screenshot, feature highlights, email waitlist form, and sign-in CTA. Authenticated users continue to see the dashboard.

### Steps

1. **Database migration**: Create `waitlist_emails` table with `id`, `email` (unique), `created_at`. Enable RLS with a public anonymous insert policy (no auth needed to submit) and an authenticated select policy.

2. **Product screenshot**: Take a screenshot of the logged-in app, run it through the product shot generator with the `lavender` preset (matches the purple primary color), and save as a static asset in `public/`.

3. **Create `src/pages/LandingPage.tsx`**:
   - Hero section: headline, tagline, email capture form with validation, "Sign In" link
   - Product screenshot in a polished frame
   - Features grid: 6 cards (Kanban boards, time tracking, labels & comments, image attachments, keyboard shortcuts, reports)
   - Bottom CTA with second email form
   - Simple footer
   - Uses existing design tokens (primary purple, Space Grotesk headings, Inter body)

4. **Update `src/pages/Index.tsx`**: Show `LandingPage` for unauthenticated visitors instead of redirecting to `/auth`.

5. **Email form logic**: Insert into `waitlist_emails`, handle duplicate emails gracefully, show toast on success/error.

### Technical Details

- `waitlist_emails` table: RLS insert policy for `anon` role, select policy for `authenticated` role
- Email validation client-side (format + not empty) plus unique constraint in DB
- Landing page is fully public, no auth required
- Product shot saved to `public/product-shot.png` and referenced as a static image

