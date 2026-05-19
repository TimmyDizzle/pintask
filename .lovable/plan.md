
# gstack Review — Pintask

**Roles active:** CEO (Office Hours) → Engineering Manager (Planning) → Designer → Release Manager.

---

## 1. Honest Completion Assessment

Your "70% complete" instinct is roughly right for **product**, but generous for **launch readiness**. Here's the breakdown:

| Area | Status | Notes |
|---|---|---|
| Core Kanban (boards, cards, labels, comments, attachments) | ~85% | Solid foundation, works |
| Auth + dashboard | ~80% | Functional |
| Marketing site (10 pages, footer, SEO routes) | ~75% | Pages exist, copy varies in quality |
| Landing page conversion polish | ~50% | Exists but generic — biggest gap |
| Pricing strategy + signup funnel | ~40% | Unclear positioning (free + paid extensions is confusing) |
| Email capture → nurture loop | ~30% | Waitlist table exists, no email sending |
| Onboarding (first-run experience) | ~20% | Drops users into empty dashboard |
| Analytics / conversion tracking | ~10% | Can't optimize what you can't measure |
| Production polish (perf, a11y, mobile QA) | unknown | Needs QA pass |

**Realistic number: ~60–65% to a *shippable, marketable* product.** Engine is built; the conversion funnel and onboarding aren't.

---

## 2. Pricing Strategy — Research & Recommendation

You proposed "100% free to build buzz + email list." That's valid, but let me lay out the proven options:

### Options seen in SaaS/Kanban space

1. **100% Free + email gate** — Trello's early playbook. Maximizes signups, but you get noise, no revenue runway, and monetization later is hard.
2. **Freemium (free core + paid tiers)** — Trello, Notion, ClickUp today. Best long-term LTV; weak for early buzz.
3. **Free + paid extensions (your current model)** — Wekan-style. Differentiated, but confusing to first-time visitors. Most don't know what an "extension" is worth.
4. **Free during beta, paid at launch (waitlist + lifetime deal)** — AppSumo / Linear early days. Creates urgency + revenue.
5. **Lifetime Deal launch (LTD)** — Sell $49–$79 lifetime on AppSumo/JVZoo (you already have JV pages!). Generates cash + raving fans + reviews.

### My recommendation: **Hybrid "Free Forever Core + Launch LTD + Future Extensions"**

- **Free forever:** unlimited boards, all core Kanban — captures the buzz you want.
- **Launch offer (60–90 days):** $39 lifetime "Founder" deal → unlocks all current + future extensions. Pairs perfectly with your existing JVZoo funnel.
- **Post-launch:** extensions become per-user monthly subs ($3–7 each).
- **Email list compounding:** waitlist + free signup + LTD buyers → 3 segmented lists for nurture.

This gives you **buzz (free) + cash (LTD) + recurring revenue path (extensions)** instead of picking one.

---

## 3. Top Ideas to Make the App Better for Customers

Prioritized by impact ÷ effort:

**P0 — Ship blockers**
- **Real onboarding flow:** Sample board + 3-step tour on first login. Empty dashboards kill activation.
- **Landing page rebuild:** One focused hero, real product video/GIF, social proof slots, single CTA. (See section 4.)
- **Email capture + welcome sequence:** Connect Resend via Lovable Cloud, send a 3-email welcome drip.
- **Analytics:** Add PostHog or Plausible — measure signup → first-board → first-card funnel.

**P1 — High-leverage features**
- **Board templates** (Sprint, Content Calendar, Bug Tracker, Personal GTD) — instant value.
- **Public/shareable read-only boards** — viral loop, every shared board = ad.
- **AI quick-add** (you have parse-task edge function — surface it prominently as a "type naturally" input).
- **Keyboard-first UX polish** (you have shortcuts; add a "?" overlay everywhere).

**P2 — Differentiation**
- **Nested cards demo** on landing (your real moat vs Trello).
- **Import from Trello** — one-click migration is a kingmaker for switchers.
- **Mobile PWA polish** — installable, offline-capable.

**P3 — Growth loops**
- **Referral credits** ("invite a teammate, unlock X extension free for 30 days").
- **Spire Club** community page — currently just an anchor link; deserves its own page.

---

## 4. Landing Page Plan (the "must ship" piece)

Current `LandingPage.tsx` exists but is generic. Proposed rebuild structure:

```text
[Sticky nav]
[HERO]
  H1: "The Kanban Board That Actually Bends to How You Work"
  Sub: "Nested cards, custom extensions, full API — free forever."
  CTA: Email + "Get Free Access" (primary)
  Secondary: "See a live board →" (links to public demo board)
  Trust strip: "No credit card · Free forever · Import from Trello in 2 clicks"
[PRODUCT VISUAL]
  Animated GIF / Lottie of drag-drop + nested card open
[3-PILLAR VALUE PROPS]
  Nested cards · Build your own extensions · Free forever
[SOCIAL PROOF placeholder]
  Logos / "Join 1,247 makers on the waitlist" counter
[FEATURE DEEP-DIVE]
  Alternating zigzag, 4 features with screenshots
[COMPARISON TABLE]
  vs Trello / ClickUp / Asana (reuse from PricingPage)
[FOUNDER LTD OFFER BANNER]
  "Founding Member: $39 lifetime — 100 spots left"
[FAQ]
[FINAL CTA + email]
[Footer]
```

---

## 5. Proposed Execution Plan (ordered, ship-focused)

### Phase A — Landing + Pricing Repositioning (ship in 1 pass)
1. Rebuild `LandingPage.tsx` with the structure above.
2. Update `PricingPage.tsx` to show: **Free Forever** | **Founder LTD $39** | **Spire Club**.
3. Add LTD banner component reusable across marketing pages.
4. Wire email capture → `waitlist_emails` (already exists) + add `source` column to segment.

### Phase B — Activation & Onboarding (next pass)
5. First-login sample board + dismissible 3-step tour.
6. 4 board templates on "New Project" modal.
7. Connect Resend, send welcome email on signup + waitlist confirm.

### Phase C — Measure & Iterate (parallel)
8. Add Plausible/PostHog snippet.
9. Define and instrument funnel events (visit → signup → board_created → card_created → return_day_2).

### Phase D — Growth Hooks (after launch)
10. Public shareable boards (read-only link).
11. Trello importer.
12. Referral loop.

---

## What I Need From You to Proceed

Pick the scope for **this build**:

- **Option 1 — Ship-focused (recommended):** Phase A only (landing rebuild + pricing reposition + email segmentation). ~1 build session. Gets you live and collecting signups this week.
- **Option 2 — Ship + Activate:** Phase A + B. Bigger, but users who sign up actually stick.
- **Option 3 — Everything:** A through D. Multi-session, but the full launch package.

Also confirm:
- **Pricing direction:** go with the Hybrid (Free + $39 LTD + future extensions)? Or pure 100% free?
- **LTD price point:** $29 / $39 / $49 / $79?
- **Headline angle:** "Most customizable Kanban" vs "Kanban that bends to you" vs your own?

Once you answer, I'll switch to build mode and execute Phase A end-to-end.
