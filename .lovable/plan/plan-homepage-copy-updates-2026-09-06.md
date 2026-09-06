# Plan: Homepage Copy Updates

Two text-only edits to `src/pages/LandingPage.tsx`. No structural, styling, or logic changes.

## Change 1 — Hero subtitle

Replace the current hero subtitle:

> Nested subtasks, AI-powered Next Action, Brain Dump capture, and momentum tracking. **Free forever** — no per-seat trap.

with:

> Turn scattered thoughts into clear next steps, break overwhelming projects into manageable tasks, and let your personal AI assistant guide your next move. Build momentum one win at a time.

This swaps the short feature-list tagline for a longer, ADHD-benefit-focused subtitle. The surrounding reveal animation and styling stay identical.

## Change 2 — Features section intro paragraph

Under the "Everything you need to stay productive" heading (currently followed only by "No bloat. Just the tools that matter."), add a new descriptive paragraph:

> Pintask combines visual Kanban task management with ADHD-friendly tools that help you organize the chaos, decide what to do next, and keep moving forward.

The existing "No bloat. Just the tools that matter." line stays as-is; the new paragraph is inserted beneath it, matching the same muted-foreground styling and reveal animation.

## Notes
- Both edits are text-only inside `src/pages/LandingPage.tsx`.
- No other files touched.
- Existing reveal-on-scroll behavior and responsive layout are preserved.
