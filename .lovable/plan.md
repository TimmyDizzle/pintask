# Fix password reset errors

## What's going wrong (from auth logs)

Looking at the live auth logs for `pintask.online/reset-password`, three real issues are happening:

1. **"One-time token not found / 403: Email link is invalid or has expired"** on `/verify` — the recovery token is being consumed more than once. With the PKCE flow we're using (`flowType: 'pkce'` in the Supabase client), the recovery link arrives as `?code=...` and must be exchanged exactly once. React 18 Strict Mode + our current `useEffect` polling pattern in `ResetPassword.tsx` (a `setTimeout` re-checking the session) causes a second exchange attempt against an already-used code, which then fails.

2. **"429 over_email_send_rate_limit"** — users clicking "Send reset link" repeatedly hit Supabase's per-email rate limit. We currently surface the raw `error.message` in a destructive toast which is confusing. We should detect 429 / `over_email_send_rate_limit` and show a friendly "please wait N seconds" message, plus disable the button briefly.

3. **"400: Email not confirmed"** on `/token` after signup — a brand-new user (who hasn't clicked their confirmation email) tries to sign in and gets a generic "Error" toast. We should detect this code and tell them to check their inbox / offer to resend.

There's also a UX trap: a user who signed up but never confirmed their email and then asks for a password reset will, on clicking the recovery link, get their account auto-confirmed (this is normal Supabase behavior, visible as `user_signedup` on `/verify`). That's fine — we just need the recovery page to actually work after that redirect.

## Fix plan

### 1. `src/pages/ResetPassword.tsx` — robust PKCE recovery handling

- Replace the current `getSession` + `setTimeout` re-poll with a single, idempotent flow:
  - Subscribe to `onAuthStateChange` and treat **either** a `PASSWORD_RECOVERY` event **or** an existing session as "ready".
  - Use a `useRef` guard so we never trigger a second code-exchange path even under Strict Mode double-invoke.
  - Replace the 800ms timeout with a longer grace window (~3s) before declaring the link invalid, since `detectSessionInUrl` may take a moment on slow networks.
- Improve the invalid-link state copy to explain the most likely cause ("This link was already used or has expired — request a new one") and keep the "Request a new reset link" CTA.
- Surface `auth.updateUser` errors with friendlier messages (e.g. weak password, session expired).

### 2. `src/pages/Auth.tsx` — friendlier error handling on forgot + login

- Map common Supabase error codes/messages to clear toast copy:
  - `over_email_send_rate_limit` / status 429 → "Please wait a moment before requesting another reset email."
  - `Email not confirmed` on login → "Please confirm your email first. Check your inbox for the verification link."
  - `Invalid login credentials` → "Email or password is incorrect."
- On a successful reset request, briefly disable the submit button (e.g. 30s cooldown via local state) to discourage rapid re-clicks that trigger the rate limit.
- Keep the existing mode-switching UI unchanged.

### 3. No backend / DB / edge function changes

The Supabase auth recovery flow itself is working correctly server-side (the 200 responses on `/recover` confirm the email is being sent). All fixes are client-side in the two files above.

## Files touched

- `src/pages/ResetPassword.tsx` — idempotent code exchange, better ready/invalid states, friendlier errors
- `src/pages/Auth.tsx` — mapped error messages, rate-limit cooldown on forgot form

## Out of scope

- Email template customization (already wired through `auth-email-hook`)
- Changing the Supabase auth flow type away from PKCE
- Sign-up flow itself works; the only sign-up-adjacent fix is the "Email not confirmed" message on login
