# Application database boundary inventory

Captured before changing application code for the Drizzle → Convex application integration. The source inventory and Convex migration reports remain the record of the database model and copied data. This document maps live application access paths and behaviors.

## A. Public reads

All are server-side Server Component, metadata, or route-handler reads. They are public and must never expose draft/archived content. Public reads have no user authorization requirement; they rely on published/active predicates. `React.cache` currently memoizes site settings, social image, contact methods, project/article detail bundles, and resume URL within a render/request. Server mutations use `revalidatePath` (and article detail uses `updateTag`) as noted below.

| File / function | Current Drizzle behavior and tables | Caller / validation / cache |
|---|---|---|
| `src/db/queries/site.ts`: `getSiteSettings`, `getDefaultSocialImage`, `getConfiguredResume`, `getContactMethods`, `getFooterResources`, `getFooterExploreItems`, `getTimeline`, `getFAQs`, `getAboutTechnologies`, `getSkills` | singleton settings; media lookup for resume/default image; active contacts, footer items, timeline, FAQs, technologies, skill categories/skills with position ordering | Root metadata/layout; public shell/footer/about/contact/resume/SEO helpers. No input validation beyond fixed DB predicates. Settings/default image/contact methods are request-cached. Settings mutations invalidate `/`, public layout, and affected pages; resource/contact/timeline/FAQ/technology/skill actions invalidate settings and relevant public routes. |
| `src/db/queries/projects.ts`: `getPublishedProjects`, `getDiscoverableProjects`, `getFeaturedProjects`, `getPublishedProjectBySlug`, `getProjectSlugById`, `getProjectRedirectSlug`, `getProjectCategories`, `getPublishedProjectCategoryNames`, `getProjectTechnologies`, `getProjectSections`, `getProjectBlocks`, `getProjectLinks`, `getProjectMedia`, `getProjectListingRelationships`, `getPublishedProjectPage` | published/robots filters; slug/redirect resolution; category, technology, section/block/link/media relationships and ordered listing data | Home/projects pages, sitemap, llms.txt, project detail and nested components. Slug is route input; all children are ordered by explicit position. Detail bundle is request-cached. Project writes invalidate `/`, `/projects`, and detail page paths. |
| `src/db/queries/articles.ts`: `getPublishedArticles`, `getArticleSlugById`, `getArticleRedirectSlug`, `getDiscoverableArticles`, `getPublishedBlogArticles`, `getFeaturedArticle`, `getPublishedArticleBySlug`, `getArticleCategory`, `getArticleTags`, `getArticleBlocks`, `getRecentArticles`, `getPreviousArticle`, `getNextArticle`, `getRelatedArticles`, `getPublishedArticlePage` | published/robots filters; category/tag/block/media joins; slug redirect; adjacent and related article selection; ordered blocks | Blog index/detail, sitemap, llms.txt and metadata. Detail bundle request-cached; children have explicit position and stable date/title ordering. Blog writes invalidate `/blog`, `/`, and article detail paths; article detail updates use `updateTag`. |
| `src/db/queries/blog.ts`: `getBlogContent`, `getBlogIndexData` | published article/category listing, search/filter/sort, count and pagination | `/blog`; query params parsed/normalized in route helper. Must preserve allowed sort values, pagination bounds, search and category semantics. |
| `src/db/queries/comments.ts`: `getCommentsByArticleSlug` | joins comments to article; approved only, newest first, limit 20 | Public article detail via `src/lib/blog/get-comments.ts`; slug lookup. Comment submission/moderation/deletion invalidates article detail. |
| `src/db/queries/media.ts`: `getMediaById` | media fields used for public project image metadata | Public project detail metadata. No direct caller input except a relationship ID read from project data. |
| `src/lib/site-origin.ts`: `getSiteOrigin`, `getAbsoluteSiteUrl`, `getCanonicalSiteUrl` | indirect `getSiteSettings`; validates configured origin and canonical overrides | Metadata, robots, sitemap, llms.txt. Invalid configured origins do not become canonical URLs. |

## B. Authenticated/admin reads

Admin pages are behind `src/app/admin/(protected)/layout.tsx` → `requireAdmin()`, which checks the Auth.js session email against `ADMIN_EMAIL`. Admin query handlers themselves must also enforce authorization after migration, because Convex endpoints are callable independently of page rendering.

| File / function | Current Drizzle behavior and tables | Caller / validation / cache |
|---|---|---|
| `src/db/queries/admin.ts`: `getAdminDashboardStats`, `getAdminDashboardData` | project/article counts and status groups; pending comments; unread submissions; media count/bytes; recent projects/articles/comments/messages; publication aggregates; category counts; settings | Admin dashboard. No query input. Dashboard data includes a `SELECT 1` DB-health probe. Writes invalidate domain page paths. |
| `getAdminMessages(status?, search?)` | contact submissions filtered by status/search, ordered by submitted date, bounded result set | Admin messages page; status is selected from the four contact states, search is trimmed/bounded by page. Status writes invalidate `/admin/messages`. |
| `getAdminProjects(options)` | projects filtered by status/featured/search/sort, stable ordering, limit 200 | Admin projects page. Inputs normalized from URL params. Project actions revalidate public and admin routes. |
| `getAdminProjectEditorData(projectId?)` | category/technology/media lists, optional project and category/technology/media/section/block/link joins with explicit order | New/edit project pages. Route ID is untrusted and must resolve to an existing record. Admin-only. |
| `getAdminArticles(options)`, `getAdminArticleFilters` | article status/featured/search/category/tag filters, sort; categories/tags filter lists | Admin blog page. Options are normalized by route. Admin-only. |
| `getAdminArticleEditorData(articleId?)` | category/tag/media lists, optional article, selected tags and ordered blocks | New/edit article pages. Admin-only. |
| `getAdminProjectTaxonomies`, `getAdminArticleTaxonomies` | categories/technologies/tags with usage counts via relationships | Admin taxonomy pages. Admin-only. |
| `getAdminSettingsData` | settings, contacts/footer collections, timeline/FAQ/about technologies/skills, image media, published indexable counts | Admin settings workspace. Admin-only; ordered settings collections. |
| `src/db/queries/comments.ts`: `getModerationComments(status)` | comments joined to article and filtered by moderation status | Admin comments page. Status is constrained to all/pending/approved/rejected. Admin-only. |
| `src/db/queries/media.ts`: `getMediaLibrary`, `getMediaUsage` | ordered media list; computes references through project media, social images, technology/skill/about settings, site settings, and IDs/URLs inside content JSON | Admin media page and deletion preview. Admin-only. Deletion preview is a safety check and must see every supported reference form. |

## C. Server mutations/actions and upload

Every admin action below calls `requireAdminAction()` before mutation and validates untrusted action/form input in the action/domain helper. Convex mutation endpoints must independently check a server-only credential or equivalent; action checks alone are insufficient. Existing cache invalidation listed per group is part of behavior.

| File / function family | Current Drizzle write / tables | Caller / validation / atomicity / revalidation |
|---|---|---|
| `src/app/actions/contact.ts` → `submitContactMessage` | insert normalized unread `contact_submission` | Public form action. Validates name/email/subject/message lengths and format; applies trusted-client rate limit before insert. No explicit route revalidation. |
| `src/app/actions/comments.ts` → `createComment` | validate published article then insert pending `comment` | Public form action. Validates/normalizes name/content and slug; rate limits; invalidates `/blog/[slug]` after success. |
| `src/app/admin/(protected)/messages/actions.ts` → `updateContactSubmissionStatus` | update status and first-set read/replied/archived timestamps | Admin action; validates status/ID; atomic update; invalidates `/admin/messages`. |
| `.../comments/actions.ts` → `moderateComment`, `deleteComment` | status update/delete comment; resolves parent article slug | Admin action; moderation only approved/rejected; invalidates admin comments and affected public article. |
| `.../projects/actions.ts` → category/technology/project CRUD and status actions | project/category/technology plus assignment, technology, media, section, block, link, redirect records | Admin action. Input validators check slugs, enums, year/publication state, positions, unique relationships and taxonomy/media existence. Parent and children are transactionally replaced; slug redirects written with publish-state logic. Revalidates admin lists/editors, `/`, `/projects`, and detail paths. Delete cascades child records. |
| `.../blogs/actions.ts` → category/tag/article CRUD and status actions | article/category/tag/tag join/block/redirect records | Admin action. Validates article/block schemas, slug, category/tags, ordered blocks and publication state. Article + child updates and redirects are transactional. Revalidates admin views, `/`, `/blog`, and affected details; `updateTag` for detail. |
| `.../settings/actions.ts` → site settings/contact/footer/timeline/FAQ/about technology/skill CRUD and reorder actions | singleton settings, contact/footer rows, timeline, FAQ, about technology, skills/categories, media references | Admin action. Input validation and uniqueness/range/order checks in helpers. Reorder and timeline/FAQ movement are transactional. Revalidates public root/layout and relevant about/contact/settings/media paths. |
| `.../media/actions.ts` → create/update/alt text/delete media | `media`; deletion clears project/article/site/technology/skill/about references and content JSON, marks pending | Admin action. Validates MIME/dimensions/size/URL and duplicate storage key; deletion preview confirms impact. Existing implementation then deletes Supabase Storage object and metadata row. Integration must not delete Supabase originals; object cleanup strategy must be consciously changed while preserving atomic reference cleanup. Revalidates all public media-bearing routes and admin media. |
| `src/app/api/admin/media/upload/route.ts` → `createMedia` | Supabase Storage upload followed by media metadata insert | Auth.js session email check plus upload validation; non-database external I/O. Convex integration needs Convex Storage upload URL/action and metadata mutation; upload + metadata failure compensation must be addressed. |
| `src/db/mutations/about-technologies.ts` | about technology CRUD and image validation | Invoked by settings Server Actions; active/position/media constraints; public about revalidation. |
| `src/db/mutations/skills.ts` | skill/category CRUD | Invoked by settings actions; uniqueness, category/media validation, ordering constraints; settings/about revalidation. |
| `src/db/mutations/slug-redirects.ts` | redirect upsert by entity and `(kind, oldSlug)` | Invoked inside project/article transactions; redirect only when published slug changes. Public redirect reads resolve only to still-published destination. |

## D. Authentication-related persistence

`src/auth.ts` uses Auth.js Credentials with `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, bcrypt comparison, `AUTH_SECRET`, and JWT sessions. There is no database credential lookup, no admin row in the source, and no database session persistence. PostgreSQL is used only by login throttling (`allowAdminLogin`/`resetAdminLoginThrottle` in `src/lib/contact-rate-limit.ts`). Protected page/action authorization compares the JWT session email to configured `ADMIN_EMAIL`. Therefore Auth.js credential/password/session behavior remains unchanged; only its throttle persistence is in scope for Convex.

## E. Rate limiting

| Boundary | Current behavior | Caller/security requirements |
|---|---|---|
| `allowRateLimit` | SHA-256 hash of key, atomic Postgres upsert counter; fixed 10-minute window, maximum 5; probabilistic cleanup after 24h | Public contact and comment actions. Key includes trusted client address; production requires trusted proxy header configuration. Counter check/increment must remain one atomic Convex mutation to prevent concurrent bypass. |
| `allowAdminLogin`, `resetAdminLoginThrottle` | atomic singleton-scope upsert, 10-minute window, maximum 5; reset after successful login | Auth.js Credentials `authorize`; authentication failures remain generic and throttle failure must fail closed. |
| `src/lib/comment-rate-limit.ts` | alias for `allowRateLimit` | Public comment action. |

## F. Migration/utility-only code

`src/db/seed.ts`, `convex/migration.ts`, `scripts/*`, `docs/*`, and the read-only source comparison/import verification scripts are not ordinary application read/write paths. Keep available as migration evidence/tooling; do not leave any imported module in the live app path merely for convenience. `src/db/index.ts` and schema/mutation modules are rollback reference code after switch.

## G. Non-application tooling

`drizzle.config.ts`, `drizzle/*`, package scripts `db:seed`, Drizzle/Postgres dependencies, and `DATABASE_URL` are developer/migration or rollback tooling. They must remain intact throughout this integration. Supabase Storage source objects and database remain untouched.

## Planned Convex mapping and preservation checks

- Public reads: server-only `ConvexHttpClient` calls from Server Components and route handlers, preserving SSR, request memoization, public filters, ordering, limits and SEO output. Public queries contain no admin data.
- Admin reads/writes: server actions retain Auth.js session checks and input validation; each admin Convex function also verifies a server-only shared credential. Mutations that replace parents and children, reorder rows, update redirect rows, or clear media relationships stay inside one Convex mutation transaction. Convex uniqueness and FK/cascade/restrict behavior need explicit index lookups and domain checks.
- Contact/comment/login throttles: one Convex mutation performs the full window reset/increment/check operation; no client-visible internal read/write sequence.
- Media: Convex Storage upload is coordinated with a metadata mutation; legacy Supabase asset objects remain untouched. Media-delete mutations clear Convex metadata references atomically but do not call Supabase deletion APIs.
- Cache/revalidation: keep current Server Action `revalidatePath` and `updateTag` calls; retain React request memoization around query bundles. No client-side data fetching is required for current screens.

## Inventory completion

Inventory completed before application source edits. This phase identified 7 query modules (public/admin), 8 primary mutation modules plus slug redirects, 2 public data actions, 7 admin action modules, one upload route, Auth.js throttle persistence, and shared public rate limiting. No application source code was modified during inventory.

## Application integration status

Application-facing public and admin query modules now call the server-side Convex query boundary. Public and admin Server Components, metadata, sitemap/llms routes, and existing Server Actions retain their call sites and rendering model. Admin mutations and reads also check the server-only `CONVEX_SERVER_SECRET` in Convex; existing `requireAdminAction()` checks remain in place. Auth.js credentials, bcrypt verification, JWT sessions, configured admin authorization, and generic login failures remain unchanged. Only login throttling moved to Convex.

Project/article parent plus child replacement, slug redirects, taxonomy relationship checks, ordering, status updates, deletion cascades, comment/message status changes, site settings, media reference cleanup, and the request/login rate-limit increments are each performed within a single Convex mutation. Convex-side checks enforce slug/name/position uniqueness and relationship existence where PostgreSQL previously enforced those constraints. Project/article editor updates preserve supplied child IDs and assign IDs only to new children.

Media uploads now use a server-generated Convex Storage upload URL and then create media metadata. Resume media keeps the established `resume/` storage-key prefix. Existing Supabase Storage references are not deleted by Convex media deletion; Convex objects are removed only when their key identifies a Convex Storage ID. No database schema was changed in this integration.

### Verification

- Convex development functions deployed successfully to `blissful-antelope-951`.
- Read-only remote inventory matched all 30 collections, 87/87 schema indexes, 1,015 documents, and the previously verified per-collection counts.
- Read-only public homepage settings, footer, about, skills, project/article listings and details, comments, sitemap/llms discoverability inputs, and admin dashboard/list/editor/comments/media/settings/taxonomy queries returned expected results. Active public lists matched admin configuration IDs and position order; public project/article visibility and absent-slug behavior were checked. Relationship IDs, nullable values, and timestamp DTOs were inspected.
- TypeScript passed; the four existing tests passed; ESLint passed for application source (`src` and `convex`).
- The full repository ESLint command passes after replacing broad `any` types in the two migration-only scripts with `unknown` and specific result shapes. Four warnings remain in generated Convex files for unused disable directives; there are no lint errors.
- Production build was attempted and stopped in Turbopack because the sandbox denied a child process from binding to a port (`Operation not permitted`). No application compile error was reported before that environment failure.
- Temporary draft article and project lifecycle checks passed through the application wrappers: create, update, child-ID preservation, status change, and cascade delete. Reversible temporary media metadata/reference, comment moderation, skill/about technology, footer/contact-method, timeline/FAQ, and project/article relationship writes also passed. A test-harness reporting variable failed after cleanup; independent checks then confirmed no temporary-named records and exact collection counts. Footer reorder restored original IDs and positions. Contact-submission writes, persistent rate-limit state/concurrency, singleton settings updates, slug redirects, and file uploads remain untested because there is no safe normal application cleanup path that restores those exact records/state. An actual Auth.js non-admin session also was not safely representable in this environment.
- Anonymous Convex admin query and mutation attempts were denied with `UNAUTHORIZED`; valid server-side admin access passed. Invalid ID, required field, enum/status, foreign relationship, ordering, and slug inputs were rejected before writes, with domain codes preserved through the application helper.
- Read-only final integrity checks: 30 collections; 1,015 documents; 0 missing/duplicate legacy IDs; 1,074 populated relationship references checked; 0 missing parents; 87/87 indexes. The previous temporary source snapshot is no longer present under `/tmp`, so this phase could not rerun the PostgreSQL-vs-Convex field-value comparison without querying Supabase.
- Rate limiting is implemented as a single atomic Convex mutation with a 10-minute fixed window and limit check/increment in the same transaction. Concurrency, expiration, and reset behavior were reviewed in code but not stress-tested because a unique request-rate row has no normal cleanup operation and would violate the exact-state requirement.
- Production upload route/file-byte verification was not run; no safe authenticated admin session was available. The earlier two approved application assets remain separate and unchanged.

### Remaining verification gaps phase (2026-10-08)

- Before any test writes, the verified development endpoint reported the same exact baseline: 30 collections, 1,015 documents, all per-collection counts matching `scripts/validate-convex-app.mjs`, 2 existing contact submissions, and 0 slug redirects, request rate-limit rows, and admin login-throttle rows. The singleton settings document was captured read-only.
- A temporary test-only Convex cleanup harness was prepared locally, but deployment setup stopped with `401 Unauthorized: AccessTokenInvalid` while fetching deployment metadata. This occurred before the temporary harness deployed and before any test fixture write. The temporary source file was removed. No fixture cleanup or settings restoration was necessary because no writes were made.
- Final read-only validation again matched all 30 baseline collection counts and 1,015 documents; all 87 indexes resolved. Contact submissions remained 2, while redirects and rate-limit rows remained 0. No temporary contact marker remained. No storage upload or object creation was attempted.
- Contact write/invalid-input/rate-limit integration, settings mutation and exact restore, slug redirect lifecycle, and rate-limit threshold/reset/concurrency remain untested because the CLI could not authorize temporary dev harness deployment. The current implementation was reviewed locally; no behavior changes were made for testing.
- The upload route was inspected: it checks the Auth.js admin email before reading the form, validates file signature/type/size, uploads to Convex Storage, creates media metadata, and attempts storage cleanup if metadata creation fails. No safe authenticated admin session was available, so the actual endpoint and file-byte lifecycle remain untested; authentication was not weakened.
- `requireAdminAction()` checks the Auth.js session email against `ADMIN_EMAIL`, while Convex admin functions require the server-only secret. Anonymous Convex admin denial was verified earlier. A non-admin Auth.js session could not be safely represented, so that specific session case remains untested.
- TypeScript passed (`npx tsc --noEmit`); all 4 tests passed (`npm test`); full ESLint passed with 0 errors and 4 unused-disable warnings in generated Convex files. Production build remains unverified because the prior Turbopack attempt was blocked by the sandbox denying the child process port bind (`Operation not permitted`); no application compilation error was emitted.
- This phase created no remote fixture data and changed no application or database code. Supabase PostgreSQL, Supabase Storage, Drizzle, and the production architecture remain untouched.

### Scope boundary

This completes code integration and development-deployment validation only. Production deployment, production environment setup, production verification, rollback exercise, and Drizzle/Supabase cleanup remain out of scope. Drizzle, PostgreSQL, Supabase Storage objects, dependencies, and old environment variables remain available as rollback resources.
