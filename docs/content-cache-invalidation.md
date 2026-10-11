# Public content cache behavior

Public Convex query results are cached in Next.js for 24 hours under domain tags such as `public-projects`, `public-articles`, `public-about`, and `public-site`. Public page output uses a 24-hour ISR fallback where configured. The `/blog` route remains request-dynamic because it reads request search parameters; its filtered index data has a 24-hour fallback.

CMS Server Actions invalidate the affected data tags and public paths after their Convex mutation succeeds. A rejected mutation does not run its invalidation callback. New project and article slugs remain eligible for on-demand generation. Admin reads and mutation responses use `no-store` and are not placed in public caches.

Writes made directly to Convex outside these CMS actions do not trigger immediate Next.js invalidation. Such changes become visible when the relevant 24-hour data or page cache expires. Use the CMS actions when immediate public freshness is required.
