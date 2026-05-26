# Wire up Payments + Email

Two parallel tracks: **payments** (Paddle, alongside JVZoo) and **email** (auth + transactional on your domain). Each can be tested independently in a test environment before going live.

---

## Track 1 — Payments (Paddle)

**Why Paddle:** The eligibility check ran against Pintask's source — it's classified as a standard SaaS productivity product, fully eligible. Paddle is the **merchant of record**, so it calculates, collects, files, and remits VAT/sales tax in every country for you, handles chargebacks, and processes refunds. All-in pricing: **5% + 50¢** per transaction, no surcharges. This is the right call for a global SaaS where you don't want to deal with tax registrations.

**JVZoo stays untouched.** This adds a second checkout path — JVZoo affiliates keep working exactly as today; Paddle becomes an option for direct buyers (e.g. from `/pricing`, the in-app upgrade screen, or future paid features).

### Steps

1. **Enable Paddle.** A test (sandbox) environment is provisioned instantly so we can build and test checkout without real money. Going live later requires a short Paddle verification (business name, etc.) which you do in Cloud → Payments.
2. **Create products in test mode** matching your existing tiers — pulled from `mem://marketing/jvzoo-funnel` and the `subscriptions` table:
   - Pro Monthly
   - Pro Yearly
   - Lifetime (one-time)
   - Exact prices: TBD from you in the next message, or I'll mirror current JVZoo pricing.
3. **Add a `/checkout` flow** that opens Paddle's overlay for the chosen plan, with success/cancel routes.
4. **Webhook handler** (`paddle-webhook` edge function) that inserts/updates rows in the existing `subscriptions` table on `subscription.created` / `subscription.updated` / `subscription.canceled` / `transaction.completed` events. Respects the `enforce_subscription_price_lock` trigger (grandfathered pricing stays locked).
5. **Surface in the app:**
   - Add "Upgrade with card" button on the existing pricing/upgrade screens (alongside the JVZoo CTA).
   - Show current subscription source (JVZoo vs Paddle) in account settings.
6. **Test checkout end-to-end** with Paddle's test card, verify a row lands in `subscriptions` with correct plan + locked price.

---

## Track 2 — Email (notify.pintask.online)

**Current state:** There's a failed setup attempt on `notify.thynklabs.online` (DNS verification timed out — never propagated). We'll start fresh on **`notify.pintask.online`** — your actual brand domain, with `pintask.online` already verified as your custom domain. Using a `notify.` subdomain is the standard pattern: keeps the root domain's reputation isolated and lets Lovable manage SPF/DKIM/DMARC on the subdomain only.

### What you get

- **Auth emails** (branded on your domain): signup confirmation, password reset, magic link, email change, reauthentication, invite — 6 templates total, styled to match Pintask (Space Grotesk + Inter, your accent colors, logo).
- **Transactional emails** ready for: payment receipts (from the Paddle webhook), weekly report delivery (already an edge function), assistant quota warnings, welcome email on signup.

### Steps

1. **Set up email domain** via the email setup dialog — this delegates `notify.pintask.online` to Lovable's nameservers (you'll add 2 NS records at your registrar). The old `notify.thynklabs.online` attempt can be removed at the same time.
2. **Email infrastructure** (pgmq queue + dispatcher + cron) is provisioned automatically.
3. **Scaffold auth email templates** and brand them with Pintask styling (your fonts, colors, logo from `public/`). Email body keeps a white background per email best practices.
4. **Deploy `auth-email-hook`** — Supabase auth events route through it; default Lovable templates keep working until DNS verifies, then your branded ones take over automatically.
5. **Scaffold transactional emails** (`send-transactional-email` edge function) and wire 2 initial uses:
   - **Welcome email** on first signup (triggered from `handle_new_user` flow).
   - **Payment receipt** from the Paddle webhook on `transaction.completed`.
6. **Test by triggering a password reset** — once DNS is green, you'll see the branded version land.

---

## Order of execution

Both tracks are independent, but emails should go first so the Paddle webhook can send receipts on day one:

1. Email domain setup dialog → infra → auth templates → deploy
2. Transactional scaffold + welcome email wiring
3. Enable Paddle → create products → checkout UI → webhook (which also fires the receipt email)
4. End-to-end test: signup → welcome email → test purchase → subscription row + receipt email

## Technical notes (skip if not relevant)

- **Tables touched:** existing `subscriptions` (writes from webhook only), new email infra tables (`email_send_log`, `email_send_state`, `suppressed_emails`, `email_unsubscribe_tokens`) created automatically by setup_email_infra.
- **Secrets:** none asked from you — `LOVABLE_API_KEY` (already present) covers both AI gateway and email; Paddle keys are provisioned by `enable_paddle_payments`.
- **Webhook URL:** `/functions/v1/paddle-webhook` — paste into Paddle dashboard after enable.
- **Plan-locking trigger:** `enforce_subscription_price_lock` already enforces immutable price/plan/currency on `subscriptions` — webhook handler will INSERT new rows on plan changes rather than mutating.
- **Email retry safety:** all sends go through pgmq with 5 retries + dead-letter queue. Auth emails get high priority (15 min TTL); transactional 60 min.

## Open question before I start

What prices should the Paddle products use — same as JVZoo today, or different? If different, give me: Pro Monthly, Pro Yearly, Lifetime amounts.
