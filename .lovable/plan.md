## Goal

Give every logged-in user a **Personal AI Assistant** — a private chat powered by Lovable AI, with a per-user monthly token quota. Admin pages (`/admin/blog`, `/admin/ai-eval`, ad revenue) stay locked down exactly as they are today.

## What the user gets

- New route `/assistant` (auth-required, in the app sidebar)
- A clean chat UI: message list, streaming responses, markdown rendering, "New chat" button
- Conversations are saved and listed in a left rail so users can resume them
- A quota meter at the top: "12,400 / 50,000 tokens used this month — resets Dec 1"
- Friendly empty-state with 3 suggested prompts ("Summarize my overdue tasks", "Draft an email about…", "Brainstorm names for…")
- When quota is hit: assistant politely refuses and shows an "Upgrade" link (placeholder for now — wired to your existing billing page)

## What stays the same

- `/admin/blog`, `/admin/blog/:id`, `/admin/ai-eval`, ad revenue views — **unchanged**, still gated by `AdminGuard`
- Existing `parse-task`, `daily-briefing`, `weekly-report`, `board-chat` functions — untouched

## Architecture

```text
[Sidebar: "Assistant"] ──► /assistant page
                                │
                                │ streams via fetch
                                ▼
                        assistant-chat edge function
                          1. verify JWT (user.id)
                          2. check quota (this month's tokens)
                          3. if over → 402-style refusal
                          4. else → stream from Lovable AI
                          5. on done → log usage to ai_usage
                                              + assistant_messages
```

## Database changes

Three small additions, all RLS-scoped to `auth.uid()`:

| Table | Purpose |
|---|---|
| `assistant_conversations` | One row per chat thread. Columns: `user_id`, `title` (auto-generated from first message), timestamps |
| `assistant_messages` | One row per message. Columns: `conversation_id`, `user_id`, `role` ('user' / 'assistant'), `content`, `prompt_tokens`, `completion_tokens` |
| `assistant_quotas` | Per-user monthly tier + override. Columns: `user_id` (PK), `tier` ('free' / 'pro'), `monthly_token_limit` (int), `period_start` (date). Default row auto-created on first chat with free tier = **50,000 tokens / month** |

A SQL helper `get_user_assistant_usage(_user_id)` returns `{ tokens_used, tokens_limit, period_end }` so the client can render the meter with a single RPC call.

## Edge functions

1. **`assistant-chat`** (new)
   - JWT-validates the caller
   - Reads/creates `assistant_quotas` row
   - Computes month-to-date tokens from `ai_usage` filtered by `function_name='assistant-chat'` and `user_id`
   - If over limit → returns `402` with friendly JSON
   - Else streams `google/gemini-3-flash-preview` from Lovable AI (SSE, per the AI Gateway guide)
   - On stream completion: inserts the assistant message + logs to `ai_usage` (extends your existing spend dashboard automatically)

2. **`assistant-title`** (new, tiny, non-streaming)
   - Called once after the first exchange to generate a 4-word title for the conversation list
   - Also logs to `ai_usage`

No changes to existing functions.

## Frontend

- `src/pages/AssistantPage.tsx` — chat shell + conversation rail
- `src/components/assistant/MessageList.tsx` — markdown via `react-markdown` (already in stack)
- `src/components/assistant/Composer.tsx` — textarea + send, Enter to send / Shift+Enter newline
- `src/components/assistant/QuotaMeter.tsx` — progress bar + reset date
- `src/hooks/useAssistantStream.ts` — SSE parser (line-by-line per the AI Gateway pattern)
- `src/hooks/useAssistantQuota.ts` — React Query hook around the RPC
- `src/components/AppSidebar.tsx` — add "Assistant" link with a sparkle icon

## Quota & cost protection

- **Hard cap**: server-side check before each request — can't be bypassed from the client
- **Default tier**: Free = 50,000 tokens/month (~25 short conversations); cheap on Gemini Flash (~$0.01/user/month worst case)
- **Bonus**: usage shows up in your existing `/admin/ai-eval` dashboard automatically, since we reuse the `ai_usage` table — you'll see per-function spend without extra work
- **Upgrade path stub**: "Upgrade to Pro" link points to `/billing` (your existing page). Future you can flip a user's `assistant_quotas.tier` to `pro` with a higher limit when they pay.

## Out of scope (call out for later)

- Actual paid upgrade flow (just a link for now)
- File/image upload to the assistant
- Tool-calling (e.g. "create a task for me") — clean follow-up once chat is stable
- Cross-device realtime sync of in-flight streams

## Success criteria

- A new logged-in user lands on `/assistant`, sends a message, sees streaming response, sees their quota tick up
- Refresh → conversation is still there in the rail
- Open a 2nd tab → both tabs read the same conversation list
- Admin pages unchanged and still admin-gated
- `/admin/ai-eval` shows a new `assistant-chat` row in the spend table
- Hitting the cap shows a friendly upgrade prompt, not a stack trace
