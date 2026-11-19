# Architecture rules
- Keep public route metadata and sitemap route coverage in `src/lib/seo.ts`; a shared registry prevents page URLs and search metadata from drifting.
- Use the existing `useDocumentTitle` hook for route metadata; static HTML keeps sitewide social fallbacks but must not force all routes to the homepage canonical.
- Sitemap modification dates must come from page-specific content timestamps, never the build date; omit timestamps when significant content changes cannot be established.
- Weekly blog slots are calculated in `src/lib/blogSchedule.ts`; use existing date-based public visibility rather than adding polling jobs, and require content and a date before scheduling.
- Keep route schema builders in `src/lib/structuredData.ts` and compose them through `useDocumentTitle`; link stable entity IDs to the static site graph without fabricated offers, ratings, or content dates.