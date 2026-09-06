# Polish the homepage glow, motion, and readability

Four changes, all on the homepage visuals — no changes to how the app works.

## 1. Make "ADHD Brains" glow

- Give the purple "ADHD Brains" words a soft purple halo so they lift off the background.
- The rest of the headline stays as it is (dark, crisp, with its light backing).
- The glow is static — no flicker or pulsing, so it stays comfortable to read.

## 2. Lighter right side, same text sharpness

- Fade the colour wash on the right-hand side further and pull it away from the middle column where the words sit.
- Keep (and slightly tighten) the light backing panel behind the headline and subtitle so contrast does not drop when the glow moves.

## 3. Separate motion settings for phones and desktops

- On phones: turn the cursor-follow effect off entirely (there is no cursor), shrink the glowing ball, drop its brightness, and keep it above the headline so it never sits over words or buttons.
- On desktops: keep the current gentle cursor follow, but reduce how far each layer drifts so it feels calm rather than busy.
- Anyone who has "reduce motion" switched on still gets a completely still version.

## 4. High-contrast reading mode

- Add a small toggle in the footer area of the homepage labelled "High contrast".
- When it is on: the animated background and glowing ball are hidden, backgrounds go flat, and headings plus body text switch to the strongest text colours.
- The choice is remembered on that device, and it also switches on automatically for visitors whose device asks for higher contrast.

## Technical notes

- `LandingPage.tsx`: swap the `text-primary` span for a token-based glow class; responsive orb sizing/opacity via Tailwind breakpoints; tighten the hero scrim radial.
- `AmbientGradientBackdrop.tsx`: lower right-blob alpha, shift it further off-canvas, and add `md:`-only intensity so mobile gets a plainer wash.
- `PurpleLightningOrb.tsx`: gate the `mousemove` listener behind a `(pointer: fine)` media query and reduce depth multipliers; accept responsive size through class-based scaling.
- New `HighContrastToggle` + a `high-contrast` class on `<html>`, with `index.css` overrides (`.high-contrast` hides decorative layers, forces `--foreground`/`--muted-foreground` to AA-compliant values). Persist in `localStorage`; honour `prefers-contrast: more`.
- Verify final contrast ratios for the h1, subtitle, and section body text in both modes.
