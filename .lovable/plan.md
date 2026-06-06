## 1. Password Reset Feature

Add a complete forgot-password flow to the auth experience.

**Auth page (`src/pages/Auth.tsx`)**
- Add a "Forgot password?" link under the password field (shown in login mode).
- Add a third mode `forgot` alongside `login`/`signup`. In `forgot` mode, show only an email field and a "Send reset link" button that calls:
  ```ts
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  ```
- Show a toast confirming the email was sent and a link back to Sign In.

**New page `src/pages/ResetPassword.tsx`**
- Public route at `/reset-password`.
- Detects the recovery session from the URL (Supabase auto-handles via `detectSessionInUrl`).
- Shows a "New password" + "Confirm password" form, calls `supabase.auth.updateUser({ password })`.
- On success: toast + redirect to `/` (signed in) or `/auth` (signed out).
- Handles error states (expired/invalid link) with a clear message and a link to request a new reset.

**Route registration**
- Add `/reset-password` route in `src/App.tsx` as a public route (outside auth guards).

## 2. Blog in Menus — Verification Only

Blog is already present in both the top navigation (desktop + mobile) and the footer Resources column of `src/components/MarketingLayout.tsx`. No changes needed unless you want it surfaced elsewhere (e.g. the app sidebar for signed-in users) — let me know.

## Technical Notes
- No DB or edge function changes required. Supabase's default recovery email already works; if you've customized auth templates, `recovery.tsx` is already in place.
- `Auth.tsx` mode state expands from `boolean isLogin` to a `"login" | "signup" | "forgot"` union for clarity.
