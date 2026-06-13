
# Plan: Surface ADHD Features + Add Voice Capture

## Context
Audit of the codebase confirms **4 of the 5 prioritized features already exist** in working form:

| Feature | State | File |
|---|---|---|
| AI Next Action Engine | Built + on Dashboard | `NextActionCard`, `lib/nextAction.ts`, `next-action-explain` edge fn |
| Break It Down | Built (incl. "I'm Stuck" blocker mode in backend) | `BreakItDownDialog`, `break-it-down` edge fn |
| Brain Dump → Tasks | Built | `parse-task` edge fn + quick-add |
| Momentum Meter | **Backend only** — `momentum_score` stored & used in scoring, no visible widget | `user_preferences.momentum_score` |
| Voice Capture | **Not built** | — |

The plan focuses on what's actually missing: **visibility for what we built** and **one genuinely new feature**.

---

## Phase 1 — Visibility Audit & Polish (≈ 2 hrs)

### 1.1 Build the Momentum Meter widget
Create `src/components/MomentumMeter.tsx` — a visible component on the Dashboard showing the four levels:

- 0–25% 🌱 Starting
- 26–50% ⚡ Building Momentum
- 51–75% 🔥 In The Zone
- 76–100% 🚀 Unstoppable

Reads `momentum_score` from `user_preferences`. Uses the existing `Progress` UI component with a gradient fill that shifts color by tier. Placed above or beside the AI Daily Briefing card.

### 1.2 Surface "I'm Stuck" / Anxiety Rescue
The `break-it-down` edge function already supports a `blocker` parameter for the "I'm Stuck" flow, but there is no dedicated UI entry point. Add:

- A subtle **"I'm Stuck"** button on the `NextActionCard` (next to "Start" and "Break It Down").
- Opens a small dialog with: *"What's blocking you right now?"* free-text input → calls `break-it-down` with `blocker` + `firstStepOnly: true` → returns ONE absurdly small first step.

### 1.3 Mobile Floating Action Button — "What's Next?"
Add a fixed-position FAB (mobile only, hidden ≥md) that triggers the Next Action recalc and scrolls/opens the recommendation. Hooks into existing `NextActionCard` data flow.

### 1.4 ADHD Mode toggle in Settings
Verify `adhd_mode` preference has a visible toggle in user settings/preferences UI. If not, add a single switch with one-line copy: *"Prioritize quick wins and easy starts."*

---

## Phase 2 — Voice Capture (≈ 3 hrs)

Browser-native via Web Speech API (free, no transcription cost — only the existing `parse-task` AI cost applies).

### 2.1 Component
`src/components/VoiceCapture.tsx` — microphone button that:
- Uses `window.SpeechRecognition || window.webkitSpeechRecognition`.
- Shows live transcript while recording (visual waveform optional).
- On stop: splits transcript into task fragments (sentence/comma-separated), sends each to existing `parse-task` edge function.
- Inserts parsed tasks into a chosen project/column.

### 2.2 Entry points
- Mic icon in the global quick-add bar.
- Optional FAB on mobile dashboard (paired with the "What's Next?" FAB).

### 2.3 Graceful degradation
- Detect API support; on unsupported browsers (Firefox desktop, some mobile) hide the button and show a tooltip: *"Voice capture works in Chrome, Edge, and Safari."*
- Handle `not-allowed`, `no-speech`, `network` errors with friendly toasts.

---

## What I'm Explicitly NOT Doing
- Not rebuilding `NextActionCard`, `BreakItDownDialog`, or the scoring engine — they exist and work.
- Not adding server-side Whisper transcription (per your choice).
- Not touching marketing copy in this pass.

---

## Technical Details (for reference)

- **Momentum widget** reads from `user_preferences` via React Query, falls back to 0.
- **Voice Capture** uses Web Speech API directly in the browser; no edge function changes. Re-uses `parse-task` for each detected task fragment.
- **"I'm Stuck"** dialog re-uses existing `break-it-down` edge function with `{ blocker, firstStepOnly: true }` — no new edge function.
- **FAB** uses Tailwind `fixed bottom-4 right-4 md:hidden`.

---

## Files to Create
- `src/components/MomentumMeter.tsx`
- `src/components/StuckDialog.tsx`
- `src/components/VoiceCapture.tsx`
- `src/components/NextActionFab.tsx`

## Files to Edit
- `src/pages/Dashboard.tsx` — mount `MomentumMeter`, `NextActionFab`.
- `src/components/NextActionCard.tsx` — add "I'm Stuck" button → opens `StuckDialog`.
- Wherever the global quick-add bar lives — mount `VoiceCapture` mic.
- Settings/preferences page — confirm/add ADHD Mode toggle.

## Estimated Total
~5 hours of focused work for both phases. Phase 1 alone (2 hrs) delivers ~70% of the perceived value because it makes invisible features visible.
