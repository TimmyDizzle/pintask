## Goal
Expand the "Everything you need to stay productive" feature grid from 7 cards to 12 cards by adding all 5 recently shipped features, creating 4 clean rows of 3 on desktop.

## What to Build

Update `src/pages/LandingPage.tsx`:

1. **Import new Lucide icons** for the 5 feature cards:
   - `Target` — AI Next Action Engine
   - `Split` — Break It Down
   - `Lightbulb` — Brain Dump → Tasks
   - `TrendingUp` — Momentum Meter
   - `Mic` — Voice Capture

2. **Append 5 new entries** to the existing `features` array (or add inline after the mapped array) so the grid renders 12 cards total. Each card follows the existing visual pattern: icon in a primary-tinted circle, bold heading, short description.

### Card copy (titles + descriptions)

| # | Title | Description |
|---|-------|-------------|
| 1 | AI Next Action Engine | One click tells you the single best task to work on right now — scored by urgency, impact, and your energy. |
| 2 | Break It Down | Staring at a big task? AI splits it into tiny, actionable steps you can actually start. |
| 3 | Brain Dump → Tasks | Drop a wall of text, a note, or a voice ramble and convert it into clean, structured tasks instantly. |
| 4 | Momentum Meter | Track your daily productivity streak and see when you're building flow — or when to take a break. |
| 5 | Voice Capture | Speak naturally. Say tasks out loud and watch them appear on your board, parsed and prioritized. |

3. **Grid behavior**: The existing `lg:grid-cols-3` and `sm:grid-cols-2` classes already handle the layout; adding 5 more cards will naturally flow into 4 rows of 3 on large screens with no layout changes needed.

4. **Animation**: Reuse the existing `transitionDelay` stagger pattern so new cards fade in smoothly with the rest.

## Out of Scope
- No new routes, components, or backend changes.
- No pricing or FAQ edits.

## Verification
- Landing page `#features` section shows 12 cards.
- Cards are arranged in 4 rows of 3 on `lg` breakpoints.
- All icons render without import errors.