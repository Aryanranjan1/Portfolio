# Backend migration inventory

Inventory captured from `src/db/schema`, migrations `drizzle/0000` through
`drizzle/0008`, the query and mutation modules, and read-only counts from the
configured Supabase PostgreSQL database on 2026-10-08. The Drizzle schema and
database were not changed.

## Relational model

`PK` marks primary keys; `?` marks nullable fields. Other listed columns are
non-null. UUID primary keys are generated with PostgreSQL `uuidv7()` unless
the table uses a natural/composite key.

| Table | Columns (application names) | Constraints, indexes, and references |
|---|---|---|
| `admin` | `id`, `singleton`, `email`, `displayName`, `active`, `createdAt`, `updatedAt` | PK `id`; unique `singleton`, `email`; singleton must be true. No row existed at inventory time. |
| `site_settings` | `id`, `singleton`, `siteName`, `personName`, `professionalTitle`, `shortDescription`, `bio`, `location`, `education?`, `interests?`, `availabilityStatus`, `availabilityText?`, `yearsBuilding`, `projectsCompleted`, `leetcodeSolved`, `learningHours`, `primaryEmail`, `siteDescription`, `canonicalOrigin`, `defaultSocialImageId?`, `resumeMediaId?`, `createdAt`, `updatedAt` | PK `id`; unique true singleton; both media refs set null when media is deleted. |
| `media` | `id`, `storageKey`, `url`, `filename`, `mimeType`, `fileSizeBytes?`, `width?`, `height?`, `altText?`, `deletionPending`, `createdAt`, `updatedAt` | PK `id`; unique `storageKey`; nonnegative size and positive nullable dimensions. |
| `project` | `id`, `slug`, `title`, `shortDescription`, `description`, `projectType`, `location?`, `year?`, `status`, `featured`, `publishedAt?`, `seoTitle?`, `seoDescription?`, `canonicalOverride?`, `robotsIndex`, `robotsFollow`, `socialTitle?`, `socialDescription?`, `socialImageId?`, `createdAt`, `updatedAt` | PK `id`; unique, lowercase hyphenated slug; status `draft/published/archived`; published requires `publishedAt`; nullable year 1900–2200; social media ref set null. Partial published/featured indexes and status/update index. |
| `project_category` | `id`, `name`, `slug`, `description?` | PK `id`; unique name and slug; lowercase hyphenated slug. |
| `technology` | `id`, `name`, `slug`, `description?`, `websiteUrl?`, `iconMediaId?` | PK `id`; unique name and slug; slug format check; media ref set null. |
| `project_category_assignment` | `projectId`, `categoryId` | Composite PK; project delete cascades; category delete restricted; reverse category/project index. |
| `project_technology` | `projectId`, `technologyId`, `position` | Composite PK; position >= 0; project delete cascades; technology delete restricted; indexes in both relationship directions and by project/order. |
| `project_section` | `id`, `projectId`, `type`, `title?`, `anchor?`, `position` | PK `id`; project delete cascades; unique `(projectId, position)` and `(projectId, type)`; allowed types `about/problem/solution/build/results/gallery/whats_next`; anchor slug format; position >= 0; project/order index. |
| `project_block` | `id`, `projectSectionId`, `type`, `position`, `data` | PK `id`; section delete cascades; unique section/position; position >= 0; `data` must be a JSON object; types `rich_text/quote/image/gallery/problem_list/objective_list/technology_list/process_steps/metrics/roadmap/callout`; section/order index. |
| `project_link` | `id`, `projectId`, `type`, `label`, `url`, `position` | PK `id`; project delete cascades; unique project/position; position >= 0; types `live/repository/case_study/documentation/demo/other`; project/order index. |
| `project_media` | `projectId`, `mediaId`, `role`, `position`, `caption?`, `altTextOverride?` | Unique project/media/role; project delete cascades; media delete restricted; position >= 0; roles `hero/preview/problem_gallery/wireframe/gallery/other`; project/order index. |
| `article_category` | `id`, `name`, `slug`, `description?` | PK `id`; unique name and slug; slug format check. |
| `tag` | `id`, `name`, `slug` | PK `id`; unique name and slug; slug format check. |
| `article` | `id`, `slug`, `title`, `excerpt`, `categoryId`, `status`, `featured`, `publishedAt?`, `seoTitle?`, `seoDescription?`, `canonicalOverride?`, `robotsIndex`, `robotsFollow`, `socialTitle?`, `socialDescription?`, `socialImageId?`, `createdAt`, `updatedAt` | PK `id`; unique slug; category delete restricted; media ref set null; same content statuses/publication rule as project; slug check; published/featured partial indexes and status/update index. |
| `article_tag` | `articleId`, `tagId` | Composite PK; article delete cascades; tag delete restricted; tag/article index. |
| `article_block` | `id`, `articleId`, `type`, `position`, `data` | PK `id`; article delete cascades; unique article/position; position >= 0; JSON object; types `heading/paragraph/image/gallery/video/quote/list/code/table/comparison/callout/tool/embed`; article/order index. |
| `comment` | `id`, `articleId`, `name`, `content`, `status`, `createdAt`, `updatedAt` | PK `id`; article delete cascades; status `pending/approved/rejected`; article/status/created index. |
| `skill_category` | `id`, `name`, `slug`, `description?`, `position` | PK `id`; unique name, slug, position; slug format and position >= 0. |
| `skill` | `id`, `categoryId`, `name`, `slug`, `description?`, `details?`, `iconMediaId?`, `position` | PK `id`; unique slug and category/position; category delete cascades; media ref set null; slug and position checks. |
| `about_technology` | `id`, `label`, `mediaId?`, `position`, `active`, `createdAt`, `updatedAt` | PK `id`; media ref set null; trimmed label length 1–100; position >= 0; active/position index. |
| `timeline_entry` | `id`, `year`, `title`, `description`, `tag?`, `position`, `active` | PK `id`; unique position; year 1900–2200; position >= 0. |
| `faq` | `id`, `question`, `answer`, `position`, `active` | PK `id`; unique position; position >= 0. |
| `contact_method` | `id`, `type`, `label`, `value?`, `url?`, `position`, `active` | PK `id`; unique position; type `email/linkedin/github/x/location/other`; position >= 0. |
| `footer_resource` | `id`, `label`, `url`, `active`, `position` | PK `id`; position >= 0; active/position index. |
| `footer_explore_item` | `id`, `label`, `url`, `active`, `position` | PK `id`; position >= 0; active/position index. |
| `contact_submission` | `id`, `name`, `email`, `subject`, `message`, `status`, `submittedAt`, `readAt?`, `repliedAt?`, `archivedAt?` | PK `id`; status `unread/read/replied/archived`; status/submitted index. |
| `slug_redirect` | `kind`, `entityId`, `oldSlug`, `newSlug`, `createdAt` | Unique `(kind, oldSlug)`; kind `project/article`; both slugs formatted and unequal. Entity ID is deliberately not an FK. |
| `request_rate_limit` | `keyHash`, `count`, `windowStartedAt` | PK `keyHash`; count > 0; window index. |
| `admin_login_throttle` | `scope`, `count`, `windowStartedAt` | PK `scope`; count > 0. |

All `timestamp` columns use PostgreSQL `timestamp with time zone`. The schema's
three enums are `content_status` (`draft`, `published`, `archived`),
`comment_status` (`pending`, `approved`, `rejected`), and
`contact_submission_status` (`unread`, `read`, `replied`, `archived`); slug
redirect kind is the `project/article` enum. The migrations create partial
indexes on published project/article rows and carry the table/index/FK
definitions above. FK update behavior is PostgreSQL's default `NO ACTION`.

## Query, mutation, and security behavior

- Public project/blog/article getters filter to published records. Draft and
  archived rows are kept out of public lists and detail pages. Published slug
  changes create/update redirect rows. Public lists sort by publication time
  with stable title/ID tie breaks; child blocks, project sections, links,
  technologies, media, and taxonomy use explicit position ordering.
- Public comments show only approved comments, newest first, capped at 20.
  Comment submission accepts only a published article, trims name/content,
  enforces name <= 100 and content <= 5000, and creates `pending`. Admin
  moderation permits approved/rejected; deletion removes a comment.
- Contact submission normalizes email to lowercase, validates required fields,
  email format and lengths (name 100, subject 200, message 5000), and creates
  `unread`. Admin status updates preserve first `readAt`, `repliedAt`, and
  `archivedAt` timestamps.
- Contact/comment rate limiting shares a SHA-256 key hash, fixed 10 minute
  window, and atomic upsert counter with limit 5; stale rows are probabilistically
  cleaned after 24 hours. Admin login uses an atomic 10 minute throttle of 5
  attempts and resets after a successful login.
- Admin Server Actions and the media upload route check the Auth.js session
  against configured `ADMIN_EMAIL`. Protected pages also call `requireAdmin`.
  Credential authentication uses Auth.js JWT sessions and a configured
  bcrypt password hash. This identity is environment-configured; `admin` has
  no row in the source database.
- Admin project/article writes use transactions for parent and child records,
  validate taxonomy/media references and ordering, and rely on PostgreSQL
  constraints for race-safe uniqueness. Media deletion first removes or clears
  known references and marks deletion pending, deletes from Supabase Storage,
  then removes the metadata row. A failed storage delete retains the pending
  record for retry.
- Settings, contact methods, footer collections, FAQs, timeline, About
  technologies, skills, SEO fields, resume reference, and taxonomy are read by
  their purpose-specific query functions. Public wrappers in `src/lib/about`,
  `src/lib/footer`, `src/lib/contact`, `src/lib/projects`, `src/lib/resume`,
  and `src/lib/blog` adapt the query results for components.

## Read-only source baseline

Row counts were read from the configured PostgreSQL source, one count query per
table. They are a point-in-time baseline, not a migration or verification.

| Table | Rows | Table | Rows |
|---|---:|---|---:|
| `media` | 86 | `contact_method` | 4 |
| `footer_explore_item` | 2 | `footer_resource` | 2 |
| `site_settings` | 1 | `project` | 10 |
| `project_block` | 140 | `project_category` | 15 |
| `project_category_assignment` | 31 | `project_link` | 30 |
| `project_media` | 40 | `project_section` | 70 |
| `project_technology` | 47 | `technology` | 14 |
| `article` | 33 | `article_block` | 312 |
| `article_category` | 11 | `article_tag` | 96 |
| `tag` | 23 | `comment` | 15 |
| `skill` | 10 | `skill_category` | 4 |
| `about_technology` | 10 | `contact_submission` | 2 |
| `faq` | 4 | `timeline_entry` | 3 |
| `admin` | 0 | `admin_login_throttle` | 0 |
| `request_rate_limit` | 0 | `slug_redirect` | 0 |

Total: 1,015 rows. Existing database FKs enforce declared relations. No source
rows or storage objects were written or deleted during this inventory.

## Media inventory and classification

The 86 `media` rows have `storage_key` prefixes `development` (30) and `unsplash`
(56). Their `url` values classify as 84 HTTP(S) URLs and 2 local paths; none of
the database media URLs is a Supabase public object URL. The Supabase
`portfolio-media` bucket contains 3 actual objects, and none has a matching
`media.storage_key` in the database. This means none of the 86 media metadata
records currently provides a confirmed link to those 3 stored objects.

Accordingly, no bucket object was downloaded or migrated. The 3 unreferenced
objects need reconciliation before classifying them as obsolete or attaching
them to records. External media URLs and local/public assets remain exactly as
they are. The static site also has hard-coded Supabase public image URLs in
`src/app/(public)/loading.tsx` and `src/components/footer.tsx`; these require
separate owner/source classification before any storage retirement.

## Migration status at inventory completion

| Category | Status | Evidence |
|---|---|---|
| Source schema and migration inventory | PASS | Tables, columns, key constraints, enums, FKs, and query/mutation rules documented above. |
| Source counts captured | PASS | Read-only count baseline above. |
| Media classification | PASS | Metadata URL/key grouping and recursive bucket object listing; 3 objects remain unmatched. |
| Convex schema drafted | PASS | `convex/schema.ts` now models all 30 tables, source fields, status values, stable legacy keys, nullable fields, and query indexes. |
| Convex schema deployed/validated | UNVERIFIED | Convex CLI could not reach its remote endpoint from this environment; no deployment was attempted. |
| Convex functions and authorization | UNVERIFIED | No Convex query/mutation layer exists yet; Auth.js integration and mutation-side equivalents for PostgreSQL constraints must be completed. |
| Data copied to Convex | UNVERIFIED | No Convex import performed. |
| Convex data verification | UNVERIFIED | No destination records to compare. |
| Application switch, production verification, old-backend deletion | UNVERIFIED | Not attempted. Drizzle and Supabase application paths remain active. |

Convex's `_id` remains platform-generated; every PostgreSQL primary key is
represented verbatim by `legacyId` (natural/composite source keys use a
deterministic string). PostgreSQL foreign key fields remain source IDs so
relationships can be compared directly during import verification. All source
unique keys need application-level checks: Convex indexes support those
lookups but do not themselves enforce uniqueness. Likewise, Convex does not
provide PostgreSQL foreign-key actions, so future mutations must validate
references and implement the existing cascade/restrict/set-null behavior.

The Convex schema validates the source status/type enumerations, JSON object
shape, and true singleton fields directly. PostgreSQL regex, integer/range,
conditional, and media-dimension checks cannot all be expressed by Convex's
table validators; mutation/import validation must retain those rules. Source
`timestamptz` fields use Convex number validators. The import representation
must preserve PostgreSQL sub-millisecond precision (for example, safe integer
epoch microseconds or fixed-width UTC strings); converting through JavaScript
`Date` milliseconds alone can lose precision.

The local schema comparison found and corrected these draft gaps: literal
validators for `contact_method.type`, project section/block/link types,
project media roles, and article block types; object validators for both block
`data` fields; a `true` validator for both singleton fields; and indexes
for `admin.singleton`, relationship composite keys on project category and
technology assignments, project media identity, article tags, and
`request_rate_limit.key_hash`. These are local design fixes only. No Convex
deployment or data import was performed by that review.
