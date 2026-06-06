# Plan: AI Next Action Engine + ADHD-first productivity suite

Built in 5 phases following your priority order. Each phase is independently shippable so you can ship + test phase 1 before committing to the rest.

## Guiding product principles (apply to every phase)

- **Tone**: supportive coach, never guilt or shame. All AI copy starts from "here's the smallest next move," never "you should have already…".
- **Cognitive load**: one recommendation at a time. Never show 5 options when 1 will do.
- **Visual rhythm**: each new surface uses the existing Space Grotesk / Inter stack and Kanban color tokens. No new design language.
- **AI**: all calls go through Lovable AI Gateway via a new edge function, default `google/gemini-3-flash-preview`, logged to `ai_usage` via `_shared/aiUsage.ts` (per existing project memory).
- **Mobile**: every new entry point also lives on the existing mobile FAB area.

---

## Phase 1 — AI Next Action Engine

The core feature. Answers "what do I do next?" in one tap.

### Data
- **DB migration**: add a `user_preferences` table (per-user singleton) with at minimum:
  - `adhd_mode` boolean (default false)
  - `momentum_score` int (default 0, range 0–100) — used in Phase 4 too
  - `last_completed_at` timestamptz
  - `streak_days` int
  - RLS: user can only read/write own row; auto-create row on first read via upsert helper.

### Scoring engine (deterministic, runs client-side first, AI second)
A pure TypeScript module `src/lib/nextAction.ts`:
- Loads the user's open tasks (cap at most-recent ~200 to stay snappy).
- Computes a score per task per the PDF formula:
  - Due date: overdue +40, today +30, tomorrow +20.
  - Priority: high +30, medium +15, low +5 (urgent → +40, since the project already has an `urgent` priority).
  - Size proxy: derived from description length + presence of subtasks/links (small +20, medium +10, large 0). No new size column required for v1.
  - Momentum: if `momentum_score >= 60` → +10; if user has 0 completions in last 24h → bias toward "easy win" (any task < 15 min estimate gets +20).
  - Anxiety reduction: tasks that unblock others (referenced by another task's description or a link) → +20; tasks tagged "quick" or with `[15m]`/`(5 min)` in title → +20.
- Returns top 1 candidate + the next 2 as fallbacks.

### AI explanation layer
- New edge function `next-action-explain`:
  - Input: chosen task summary + score breakdown + recent completions.
  - Output: 1–2 sentence "why" + an estimated time in minutes + an impact label (`low|medium|high`).
  - Strict supportive tone in the system prompt, with hard "never guilt, never shame" rule.
  - Logs to `ai_usage`.
- Client caches the explanation for 10 min per task id.

### UI
- **`NextActionCard` component** on the dashboard (top of `Index.tsx` / `Dashboard.tsx`), above the existing widgets:
  - Recommended task title, est. time, impact pill, "Why this one" reason.
  - Buttons: **Start Task** (opens the task detail sheet + starts time entry) and **Break It Down** (Phase 2).
  - "Show me another" link cycles to the next fallback candidate.
- **"Tell Me What To Do Next" button**:
  - Dashboard hero, top of task list view, and the existing mobile FAB gets a second action.
  - On click: scrolls to / mounts the `NextActionCard` with a fresh recommendation.
- **Empty state**: encouraging "you're all caught up — pick something tiny to plant for tomorrow."

### Settings
- New "ADHD Productivity Mode" toggle in profile/settings. When on:
  - Scoring weights shift: quick wins +30 instead of +20; large tasks penalized −10.
  - UI hides task counts > 5 ("12 tasks" → "a few more"), collapses long lists by default.

---

## Phase 2 — Break It Down

Turn an intimidating task into 3–7 tiny steps.

- **Edge function `break-it-down`**: takes a task (title + description), returns an array of ≤7 micro-steps using AI SDK `generateText` with `Output.object` for a typed array. Logged to `ai_usage`.
- **UI**: "Break It Down" button on `TaskCard`, `TaskDetailSheet`, and the Next Action card.
  - Modal shows the proposed steps with checkboxes pre-checked.
  - **Convert to subtasks**: writes each step as a new task in the same column right after the parent (we'll use a `parent_task_id` column — small migration adding nullable self-ref + index).
  - "Replace original" vs "Add as subtasks" options.
- **Anxiety Rescue ("I'm Stuck")**: same modal, different entry — asks "what's blocking you?" first, then runs `break-it-down` with that context. Two buttons: "Just the first step" (returns 1 micro-step) and "Show me all".

---

## Phase 3 — Brain Dump → Tasks

A free-text dumping ground that AI parses into structured tasks.

- New route `/brain-dump` (and a "Brain Dump" entry in the app sidebar + a big button on the dashboard).
- One large textarea, "Process my dump" button.
- **Edge function `parse-brain-dump`**: reuses the same Gemini model, returns an array of `{ title, due_date?, priority?, suggested_column, estimated_minutes? }` using `Output.array`.
- Review screen: each parsed task shown as an editable chip with column dropdown + checkbox to include. "Create N tasks" button writes them all in one batched insert.
- The existing `parse-task` edge function handles one-line quick-add; this is the multi-task sibling and can share the same prompt scaffolding.

---

## Phase 4 — Momentum Meter

Visual progress bar that rewards consistency.

- Reuses the `momentum_score` column from Phase 1.
- **Recompute logic** (server-side, idempotent):
  - Database trigger on `tasks` UPDATE → when a task moves into the "Done" column, +5 momentum (cap 100).
  - Daily cron edge function (already have `send-due-date-reminders` cron infra) decays score by −3 per day with no completions; never drops below 0.
  - 24h streak bonus: +10 if user completes ≥3 tasks in a calendar day.
- **UI**: thin gradient bar at top of the dashboard with emoji + label:
  - 0–25% 🌱 Starting · 26–50% ⚡ Building Momentum · 51–75% 🔥 In Flow · 76–100% 🚀 Unstoppable
  - Tooltip explains how it moves; hover/tap reveals last 7 days as sparkline.
- Feeds back into the scoring engine (Phase 1) — high momentum unlocks bigger task suggestions; low momentum biases toward quick wins.

---

## Phase 5 — Voice Capture

Mic button → multi-task creation.

- Mobile + desktop floating mic button.
- Uses browser `MediaRecorder` → uploads webm/opus to a new edge function `transcribe-voice` which forwards to Lovable AI Gateway (`google/gemini-3-flash-preview` accepts audio input) and pipes the transcript directly into the Phase 3 `parse-brain-dump` function.
- Returns the same review screen as Brain Dump so the user can confirm/edit before saving.
- Permission UX: explain mic use up front, gracefully fall back to Brain Dump textarea on denial.

---

## Cross-phase technical notes

- **Edge functions added**: `next-action-explain`, `break-it-down`, `parse-brain-dump`, `transcribe-voice`. All log to `ai_usage`.
- **DB migrations**: `user_preferences` table (Phase 1), `parent_task_id` column on `tasks` + index (Phase 2), `momentum_events` table (Phase 4, optional — can derive from `tasks.updated_at` instead to start). Each migration ships with its own GRANTs and RLS policies.
- **No new third-party dependencies** beyond what's already in package.json. Voice uses the native `MediaRecorder` API.
- **Cost ceiling**: cache Next Action explanations, debounce Break It Down so users can't spam, and tie all features into the existing `assistant_quotas` table so heavy users don't blow through credits.

## What I'd recommend shipping first

Phase 1 alone delivers most of the promise of the PDF and is the single most distinctive feature. I'd ship it, get feedback for a few days, then layer Phase 2 (Break It Down) on top — that one-two punch is the real category-shifter you described.

## Out of scope for this plan

- Replacing the Kanban board metaphor
- Mobile app shell (PWA install prompts, native wrappers)
- Cross-device sync of momentum (it's already user-scoped via Supabase)
- Team/collaborative momentum (single-user only for v1)
