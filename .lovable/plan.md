## What you already have

The `ai_usage` table and `/admin/ai-eval` dashboard already track tokens, cost (micro-USD), latency, provider, model, function, and user. Three functions log into it:

- ✅ `parse-task`
- ✅ `daily-briefing`
- ✅ `assistant-chat`
- ✅ `assistant-title`

## What's missing

Five AI-calling functions write zero rows to `ai_usage`, so their spend is invisible:

- ❌ `board-chat` — chat completions
- ❌ `weekly-report` — chat completions
- ❌ `embed-blog-post` — embeddings
- ❌ `semantic-search-blog` — embeddings
- ❌ `generate-blog-thumbnail` — image generation

Also: the pricing table is copy-pasted in each function (and incomplete — only Gemini Flash). One source of truth needed.

## Plan

### 1. Shared pricing helper

New file: `supabase/functions/_shared/aiUsage.ts`

- `PRICING` map: USD per 1M tokens for every model currently in use plus image pricing (per-image, since image models bill per-output not per-token).
  - `google/gemini-3-flash-preview`: in 0.075 / out 0.30
  - `google/gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `openai/gpt-5-mini`, `openai/gpt-5` — values already in `parse-task`
  - `google/gemini-embedding-001`: per-token rate
  - `google/gemini-2.5-flash-image` (Nano Banana): per-image rate
- `estimateMicroUsd(model, prompt, completion, images?)` — handles both token-priced and image-priced models.
- `logUsage({ supabaseUrl, serviceKey, userId, functionName, provider, model, usage, latencyMs, images? })` — fire-and-forget insert into `ai_usage`. Swallows errors so AI requests never fail because of logging.

All five new + existing functions will import from this file. (Existing four get migrated to it in the same pass to delete the duplicated `PRICING` blocks.)

### 2. Wire each function

For each: capture `t0 = performance.now()` before the fetch, capture `latencyMs` after, best-effort decode `userId` from JWT, call `logUsage(...)` after a successful response.

| Function | Model used | Tokens source | Notes |
|---|---|---|---|
| board-chat | gemini-3-flash-preview (chat) | response `usage` | per-user chat |
| weekly-report | gemini-3-flash-preview (chat) | response `usage` | scheduled / on-demand |
| embed-blog-post | gemini-embedding-001 | response `usage` (prompt only, completion=0) | server-to-server, may have no user JWT — log `user_id = null` |
| semantic-search-blog | gemini-embedding-001 | response `usage` | per-search |
| generate-blog-thumbnail | gemini-2.5-flash-image | n/a — pass `images: 1` | cost computed per-image |

No behavior change — only one extra non-blocking insert per call.

### 3. Dashboard tweaks (small)

`src/pages/AdminAiEval.tsx` already groups by `function_name + provider + model`. Two additions:

- **Provider rollup card** at the top: total cost grouped by `provider` (lovable today, but the column is there so future providers slot in).
- **Per-function sparkline** of daily cost over the selected range (24h / 7d / 30d) using `recharts` (already in deps). Helps you eyeball trends.

No schema change, no new edge function, no new secret.

### 4. Verification

After deploy:
1. Hit each of the 5 functions once (board chat message, run a weekly report, save a blog post, run a blog search, generate one thumbnail).
2. `SELECT function_name, provider, model, count(*), sum(total_tokens), sum(cost_micro_usd) FROM ai_usage WHERE created_at > now() - interval '15 min' GROUP BY 1,2,3;` — confirm 5 new rows.
3. Open `/admin/ai-eval` → confirm all 9 functions now appear and provider rollup matches the sum.

## Out of scope (flag if you want them next)

- Backfilling historical Claude-era spend (not in the table; would have to be estimated).
- Per-user quota enforcement on functions other than `assistant-chat`.
- Export to CSV / billing alerts when daily spend crosses a threshold.

## Files touched

- **new** `supabase/functions/_shared/aiUsage.ts`
- **edit** `supabase/functions/board-chat/index.ts`
- **edit** `supabase/functions/weekly-report/index.ts`
- **edit** `supabase/functions/embed-blog-post/index.ts`
- **edit** `supabase/functions/semantic-search-blog/index.ts`
- **edit** `supabase/functions/generate-blog-thumbnail/index.ts`
- **edit** `supabase/functions/parse-task/index.ts` (swap inline pricing for shared helper)
- **edit** `supabase/functions/daily-briefing/index.ts` (same)
- **edit** `supabase/functions/assistant-chat/index.ts` (same)
- **edit** `supabase/functions/assistant-title/index.ts` (same)
- **edit** `src/pages/AdminAiEval.tsx` (provider rollup + sparkline)