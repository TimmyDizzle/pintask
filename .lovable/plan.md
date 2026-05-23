# parse-task: Claude vs Lovable AI bake-off

`parse-task` is already migrated to Lovable AI (`google/gemini-3-flash-preview`) using tool-calling for structured output. No code changes needed in the function itself. This plan runs a one-off comparison to verify outputs match (or beat) the old Claude behavior.

## What I'll do

1. **Write a comparison script** at `/tmp/parse_task_bakeoff.ts` (Deno, run via `code--exec`).
   - Uses `ANTHROPIC_API_KEY` (already in secrets) for Claude 3.5 Sonnet with the same tool schema.
   - Uses `LOVABLE_API_KEY` for `google/gemini-3-flash-preview` with the identical prompt + tool schema currently in `parse-task/index.ts`.
   - Same system prompt, same `today` value, same fixtures sent to both.

2. **Fixtures** (~15 phrases covering the real surface area):
   - Relative dates: "call mom Friday", "dentist tomorrow 3pm", "review PR next Monday"
   - Urgency: "URGENT fix login bug", "ASAP send invoice to Acme", "immediately patch CVE"
   - No date: "buy groceries", "read book"
   - Mixed: "urgent! draft Q3 report by Friday end of day"
   - Title-cleaning: "remind me tomorrow to email John about the launch"
   - Edge: empty-ish text, very long text, ambiguous date ("soon")

3. **For each fixture, capture per provider**:
   - Parsed `{ title, dueDate, label, priority }`
   - Latency (ms)
   - Token usage (prompt / completion / total)
   - Estimated cost (µUSD) using the same pricing table from `_shared/aiUsage.ts`

4. **Output** to `/mnt/documents/parse-task-bakeoff.md`:
   - Side-by-side table per fixture (Claude result | Lovable result | match? ✅/⚠️)
   - "Match" = same `label`, same `priority`, same `dueDate` (date-equal), title within fuzzy similarity
   - Summary: match rate %, avg latency Claude vs Lovable, avg cost per call, total cost for the run
   - Flag any regressions for human review

5. **Report back in chat** with the headline numbers and link the artifact.

## Notes

- No edge function code is changed. No DB writes. No prod traffic.
- Script runs entirely in the sandbox against the two provider APIs.
- If Claude and Lovable disagree on >20% of fixtures, I'll surface the diffs and recommend either a prompt tweak or trying a stronger Lovable model (`gemini-2.5-pro` / `gpt-5-mini`).

## Files

- New (temp): `/tmp/parse_task_bakeoff.ts`
- New (artifact): `/mnt/documents/parse-task-bakeoff.md`
- No project files modified.
