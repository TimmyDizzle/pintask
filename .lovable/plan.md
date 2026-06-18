## About Page Content Swap

Replace the entire body content of `src/pages/AboutPage.tsx` with the new long-form copy provided by the user.

### What will change
- **Hero section**: New H1 "We Built the Task Tracker We Couldn't Find Anywhere Else" with expanded intro paragraph about frustration, rigid systems, and building PinTask as an extensible platform.
- **Section 2 — "Stop Losing Your Focus. Start Pinning Your Priorities."**: Intro + 4 bullet points (📌 See it, pin it, do it; 🧠 Distraction-proof; ⚡ Instant capture; 🔄 Works the way your brain works).
- **Section 3 — "The AI Productivity System Built for Professionals with ADHD"**: Intro + 5 checklist bullets (Focus, Prioritization, Daily execution, Overwhelm reduction, Accountability) + closing CTA.
- **CTA footer**: Retain a "Start Free" button.
- **useDocumentTitle**: Update to match the new page title.

### What stays the same
- `MarketingLayout` wrapper, `RevealSection` animations, and `Button` CTA pattern.
- Lucide icon imports removed (no icons used in new copy).
- `beliefs` and `timeline` arrays removed (not in new copy).

### Technical details
- Single file edit: `src/pages/AboutPage.tsx`
- No backend, routing, or dependency changes.
