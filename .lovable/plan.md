## Goal

Replace every inaccurate technical claim (Meteor API, MongoDB browser access, custom extensions, "full API access") with honest, on-brand copy that highlights Pintask's real differentiator: an **ADHD-friendly Kanban** with Next Action, Break It Down, Brain Dump, and Momentum tools — backed by Supabase, with a free forever core plan.

No backend, schema, or feature code changes. Copy-only edits across 7 marketing pages.

---

## New positioning lines (the replacements)

**Hero tagline (LandingPage.tsx line 218-219)** — replaces "Nested cards, custom extensions, full API access, AI assistant. Free forever — no per-seat trap."

> "Nested subtasks, AI-powered Next Action, Brain Dump capture, and momentum tracking. **Free forever** — no per-seat trap."

**Developer/API positioning** — replaces all "JavaScript + Meteor API" and "MongoDB browser access" claims with:

> "Built on Supabase. Your data is yours — open schema, exportable any time, webhook-ready via Edge Functions."

**Extensibility positioning** — replaces "custom extensions" / "Extensions Store":

> "Power-ups that matter: Voice Capture, Momentum Meter, and the AI Assistant — built into the app, not bolted on."

---

## Files & specific edits

### 1. `src/pages/LandingPage.tsx`
- **Line 218-219**: swap hero subline to new ADHD-forward tagline above.
- **Line 418-421** (feature checklist): replace `"Full API access"` → `"AI Next Action assistant"`; replace any `"custom extensions"` → `"Voice & Brain Dump capture"`.
- Keep "Free forever" and "No per-seat pricing" — both are accurate.

### 2. `src/pages/PricingPage.tsx`
- **Line 19-20**: remove `"Full JavaScript + Meteor API access"` and `"MongoDB browser access"` from the free plan feature list. Replace with `"Open data — export anytime"` and `"Webhook-friendly Edge Functions"`.
- **Line 25 FAQ**: rewrite to: *"Yes. The core Kanban — unlimited boards, nested subtasks, AI Next Action, and Brain Dump — is free with no time limit."*
- **Line 29 FAQ**: change question to *"Can I export my data or build integrations?"* — answer: *"Yes. Your data lives in an open Supabase Postgres schema, exportable any time. Edge Functions support webhooks for custom integrations."*
- **Line 62** comparison row: rename `"API Access"` → `"Open Data Export"`.

### 3. `src/pages/FeaturesPage.tsx`
- **Line 43-44**: replace the two feature cards:
  - `"JavaScript + Meteor API"` → **"AI Next Action"** — *"An ADHD-friendly assistant that surfaces the single most important task right now."*
  - `"MongoDB Browser Access"` → **"Open Data, Open Export"** — *"Your boards live in Supabase Postgres. Export everything, anytime."*

### 4. `src/pages/ExtensionsPage.tsx`
- **Line 11** card: `"Build Your Own"` desc → *"Hook into your Pintask data via Supabase Edge Functions and webhooks."*
- **Line 154-155**: rewrite section to *"For Developers: Open Data, Your Way"* and *"Pintask runs on Supabase. Your data is yours — open Postgres schema, REST access via your account, and Edge Functions for custom workflows."*
- Consider whether the Extensions Store framing should soften to "Power-ups" — flag in implementation, default to renaming.

### 5. `src/pages/KanbanBoardPage.tsx`
- **Line 95**: replace with *"Pintask is the only Kanban board with built-in ADHD-friendly tools: Next Action, Break It Down, and Brain Dump capture."*

### 6. `src/pages/TrelloAlternativePage.tsx`
- **Line 27**: rename card to **"Pintask Helps You Start"** — *"Trello shows you tasks. Pintask tells you which one to do next, then helps you break it down."*
- **Lines 41, 53**: rewrite tagline to *"Everything Trello does — plus AI Next Action, Brain Dump capture, nested subtasks, and momentum tracking. Free forever. Import your Trello boards in 2 clicks."*
- **Line 60**: keep ✓ chips, drop any "API" reference.

### 7. `src/pages/TaskTrackerPage.tsx`
- **Lines 11-12**: replace both feature cards:
  - `"JavaScript + Meteor API"` → **"AI Next Action"** with ADHD-focused desc.
  - `"MongoDB Browser Access"` → **"Open Data Export"** with Supabase Postgres desc.
- **Lines 25-26** comparison rows: replace with:
  - `feature: "AI Next Action", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌"`
  - `feature: "Open Data Export", pintask: "✅", trello: "Limited", clickup: "Limited", asana: "Limited"`
- **Lines 37, 49, 59, 74**: rewrite all hero/body paragraphs to drop Meteor/MongoDB and lead with ADHD workflow.
- **Lines 56, 163**: rename `"Read the API Docs"` / `"View API Documentation"` buttons → `"See All Features"` linking to `/features` (no docs page exists yet).

---

## Out of scope (not changed this round)

- `src/data/blogPosts.ts` and `src/pages/BlogPostPage.tsx` — blog post bodies. If any post repeats the Meteor/MongoDB claim I'll flag during implementation but will not silently rewrite published posts; you'll decide whether to retract or amend.
- Terms of Service — the "free tier may change" clause stays; that's standard and accurate.
- Sitemaps, schema markup, meta titles — will be checked and updated only if they repeat the inaccurate claims.

---

## What this gives you

- **Zero false claims** — no Meteor, no MongoDB, no fictional extensions store, no API docs that don't exist.
- **Sharper positioning** — every page now leads with the ADHD workflow stack, your actual category-of-one differentiator.
- **Ad-safe copy** — nothing in the rewritten lines would fail a paid-ad review or invite a Wekan trademark issue.
- **Preserved trust signals** — "Free forever," "No per-seat," lifetime/$8/mo pricing all stay because they're true.

Ready to switch to build mode and apply these edits.