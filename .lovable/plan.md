## Fix: Page scroll-to-top + footer verification

### What's needed
1. **Scroll to top on every route change** — Currently, clicking internal nav links keeps the previous scroll position. A `ScrollToTop` component needs to be added inside `BrowserRouter` in `App.tsx`.
2. **Dynamic copyright year** — Already implemented across all footers (`{new Date().getFullYear()}`). No change needed.
3. **Add "© 2026 Pintask. All rights reserved."** — Already present at the bottom of every footer. No change needed.
4. **Mobile footer single-column stack** — Already implemented. All multi-column footers use `md:grid-cols-N` which collapses to a single column on mobile. No change needed.

### Technical details
- Create `src/components/ScrollToTop.tsx` using `useEffect` + `useLocation` from `react-router-dom` to call `window.scrollTo(0, 0)` on route change.
- Mount it inside `<BrowserRouter>` in `App.tsx`, before `<Routes>`.
- No other file changes required.

### Files to change
- `src/App.tsx` — add `<ScrollToTop />` inside router
- `src/components/ScrollToTop.tsx` — new component (or inline in App.tsx)