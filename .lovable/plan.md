
## Goal

Treat the six deployed Supabase edge functions as "the API" and verify every one end-to-end (auth, happy path, error paths, CORS). Then drive the live preview browser through the `/extensions` page to confirm what the "Free Extensions" buttons actually do — because right now they don't do anything, and the test needs to surface that honestly rather than fake a pass.

## Scope

**API surface under test** (all under `supabase/functions/`):

| Function | Auth | Method | Purpose |
|---|---|---|---|
| `sitemap` | public | GET | Dynamic sitemap (index + `/static` + `/blog/:n`) |
| `parse-task` | public | POST | Claude-powered NLP task parser |
| `daily-briefing` | user JWT | POST | Per-user task briefing |
| `weekly-report` | user JWT | POST | Per-user weekly summary |
| `cancel-subscription` | user JWT | POST | Cancels user's active subscription |
| `send-due-date-reminders` | service-role (cron) | POST | Reads tasks, sends reminder emails |

**Free-extensions UX under test**: the two "Install Free" buttons on `/extensions` ("Checklist Boards", "Quick Card Actions") and the "Browse Extensions" / "Start Free Trial" CTAs.

## What I will build

### 1. Deno test files (one per function)

Created next to each function so `supabase--test_edge_functions` picks them up:

- `supabase/functions/sitemap/index.test.ts`
- `supabase/functions/parse-task/index.test.ts`
- `supabase/functions/daily-briefing/index.test.ts`
- `supabase/functions/weekly-report/index.test.ts`
- `supabase/functions/cancel-subscription/index.test.ts`
- `supabase/functions/send-due-date-reminders/index.test.ts`

Each file uses `Deno.test()` and hits the **deployed** function URL via `fetch` (matching the existing `verify-sitemap` style). Pattern per function:

```text
- OPTIONS preflight → 200 + CORS headers present
- Missing auth (where required) → 401
- Invalid auth token → 401
- Malformed body / wrong method → 400 or 405 with CORS
- Happy path with a real anon user JWT (minted in setup) → 2xx + expected JSON shape
- Response body always consumed (await res.text()) to avoid Deno resource leaks
```

Auth-required functions get a per-suite setup that signs up a throwaway test user via `supabase.auth.signUp`, captures the JWT, and tears down (deletes the test user via service role) on `addEventListener("unload")`. The service-role-only `send-due-date-reminders` is invoked with the service-role key from `Deno.env`.

Per-function specifics:

- **sitemap**: assert `/sitemap` returns `<sitemapindex>`, `/sitemap/static` and `/sitemap/blog/1` return `<urlset>`, all with `application/xml`, and that `/sitemap/blog/999` returns an empty urlset (not a 500).
- **parse-task**: send `{ text: "Email the client tomorrow at 5pm, urgent" }`, assert response has `title`, `dueDate` (ISO), `label: "urgent"`, `priority` ∈ {high,medium,low}. Also test the no-`ANTHROPIC_API_KEY` fallback shape with `{ text: "" }` → empty title default.
- **daily-briefing / weekly-report**: signed-in user with zero projects → 200 with the "no projects" message; user with one project + one task → 200 with non-empty `briefing`/report text. Verify it does NOT leak other users' data (create a second user, fetch the first user's briefing with the second user's token — must not contain first user's task titles).
- **cancel-subscription**: user with no subscription → 404; user with seeded `active` subscription → 200 and the row's `status` becomes `canceled` and `canceled_at` is set; cofounder lifetime → 4xx with the "cannot cancel" message.
- **send-due-date-reminders**: seed one task due tomorrow for the test user, hit the function with service-role auth, assert the JSON reports `emailsSent >= 0` and the function returns 200. (We don't assert SMTP — that's downstream.)

### 2. Helper for shared test setup

`supabase/functions/_shared/test-utils.ts` (test-only) with:

- `createTestUser()` / `deleteTestUser(id)` using service-role
- `getAnonJwt(email, password)` for signing in
- `functionUrl(name, sub?)` helper that reads `SUPABASE_URL` from env

Credentials come from `.env` via the `dotenv/load.ts` import documented in the testing guide — no hardcoded secrets, no `process.env`.

### 3. Live browser walkthrough

After the Deno tests pass, drive the preview browser:

1. `navigate_to_sandbox` to `/extensions`
2. `observe` the "Install Free" buttons for Checklist Boards and Quick Card Actions
3. Try `act` → click each. Capture: does anything happen? Network request? Toast? Navigation? (Expected: nothing — they're decorative.)
4. Click "Start Free Trial" and "Browse Extensions" — confirm they route to `/auth`.
5. Screenshot the final state.

The walkthrough's job is to **document reality**, not to pretend the buttons work. The test report will say plainly: "Install Free buttons have no handler; clicking them is a no-op. No download occurs because no extension artifact exists in the repo or storage."

### 4. Final report

Written to `/mnt/documents/api-and-extensions-e2e-report.md` (and surfaced via `<presentation-artifact>`) containing:

- Per-function pass/fail table with status code, latency, and response shape notes
- CORS coverage summary
- Browser walkthrough findings with screenshot reference
- A short "Gap analysis" section flagging that the `/extensions` page advertises features (extensions store, install flow, JS+Meteor API, MongoDB browser) that are not implemented anywhere in the codebase — with a recommendation to either build them or revise the copy

## Out of scope

- Building the actual "Checklist Boards" / "Quick Card Actions" extensions (separate effort — would need the scope decision you already declined)
- Modifying any production data — all tests use throwaway users and clean up
- SMTP / email delivery verification for `send-due-date-reminders` (we only assert the function's HTTP contract)
- Load / performance testing

## Risks and how I'll handle them

- **`send-due-date-reminders` mutates emails via Supabase's admin API**: I'll point it at a test user with a non-deliverable address (`+test@` alias) and check return shape only.
- **`cancel-subscription` requires a seeded `subscriptions` row**: seeding via service-role bypasses the `enforce_subscription_price_lock` trigger only on INSERT (it fires on UPDATE of locked fields). Safe to seed and then call cancel.
- **`parse-task` depends on Claude**: if `ANTHROPIC_API_KEY` is unset or the upstream is down, the function returns a fallback shape — the test asserts that fallback explicitly so it doesn't flake on outages.
- **Test user cleanup**: each test registers an `unload` handler that deletes its user; if a run crashes mid-flight, the next run's setup detects and deletes orphans by email prefix (`e2e-test-…@`).

## Deliverables

- 6 new `*.test.ts` files + 1 shared helper under `supabase/functions/`
- Test run output (via `supabase--test_edge_functions`)
- Browser screenshots in the chat
- `/mnt/documents/api-and-extensions-e2e-report.md` summarizing everything
