# Application-referenced Supabase Storage reconciliation

Status: investigation only. No file was uploaded, no application reference was changed, and no Supabase resource was modified.

## Exact application references

| Asset | Reference | Mechanism and visibility | Configuration |
|---|---|---|---|
| `Halftone Moonlit Mountain Landscape.png` | `src/components/footer.tsx:115` | Literal URL passed to `next/image` in the public footer. Decorative (`aria-hidden` container and empty image alt). Rendered as a public-facing footer hero image. | URL hardcodes the Supabase project host, bucket `portfolio-media`, and encoded object name; it does not read environment configuration. `next.config.ts` enables the project host through the `SUPABASE_URL`-derived image `remotePatterns` entry. |
| `Monochrome Stag Beneath the Moon.png` | `src/app/(public)/loading.tsx:7` | Literal URL assigned to `LOADING_IMAGE`, passed to `next/image` in the public client-side loading component. Decorative (empty alt). | URL hardcodes the Supabase project host, bucket `portfolio-media`, and encoded object name; it does not read environment configuration. `next.config.ts` enables the project host through the `SUPABASE_URL`-derived image `remotePatterns` entry. |

The filenames do not occur elsewhere as application references. The footer and loading image URLs were found as the only exact runtime references. They are not generated from media rows, site settings, metadata, CSS, or an asset manifest.

## Storage conventions and Convex capability

The generic Supabase Storage upload route is `src/app/api/admin/media/upload/route.ts`. It uses `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `SUPABASE_STORAGE_BUCKET` (default `portfolio-media`), uploads under generated category/UUID keys, and stores a public Supabase URL and object key with a database media row. The corresponding deletion helper is `src/lib/media/supabase-storage.ts`. Neither exact decorative asset follows the database media-row convention: the two bucket objects have no matching media record. The configured bucket has three objects total, including `.emptyFolderPlaceholder`.

No application Convex storage functions or storage ID references currently exist. The installed Convex API supports generating a short-lived upload URL with `ctx.storage.generateUploadUrl()`, posting file bytes to it to obtain an `Id<"_storage">`, and obtaining a serving URL from `ctx.storage.getUrl(storageId)`. A server-side action can also store a Blob directly and return its storage ID. Public pages could consume a resolved URL from a Convex query, or use a configured URL if a stable public URL is intentionally retained. `next.config.ts` would need to allow the Convex serving host for `next/image` when using Convex URLs.

The current `media` table models user-managed media records with `legacyId`, unique `storageKey`, filename, MIME type, dimensions, and database references. Adding these decorative files there would fabricate source metadata rows and imply media-library semantics that the assets do not currently have. The existing `siteSettings` row has only social image and resume references; repurposing either field is incorrect. No existing schema field safely represents these two app-shell assets.

## Recommended representation

Keep the two objects as application assets, not `media` or `siteSettings` database records. If approved for migration, maintain a small typed application-asset configuration mapping stable logical keys (for example, footer artwork and loading artwork) to Convex storage IDs. Resolve the IDs to URLs through a minimal Convex query (or an existing server-side Convex client in the later integration phase), then pass those URLs to the two image components. This avoids changing the 1,015-row relational migration semantics and avoids introducing a general asset-management abstraction for two fixed assets.

## Migration and rollback plan

1. Record the source object names, MIME types, byte lengths, and SHA-256 hashes with read-only downloads. Leave `.emptyFolderPlaceholder` out of scope.
2. Upload each PNG to Convex Storage, recording the returned storage ID and SHA-256. Verify file bytes/hash, MIME type, byte length, and that `ctx.storage.getUrl` returns a reachable file URL.
3. Add the two logical asset-to-storage-ID configuration entries and a narrow read-only resolver; update only `src/components/footer.tsx`, `src/app/(public)/loading.tsx`, and `next.config.ts` to use/allow the resolved Convex URLs.
4. Verify both public pages render the expected assets and compare source/destination hashes and metadata. Keep Supabase objects intact during and after this step.
5. Roll back by restoring the two literal Supabase URLs and the prior image remote-pattern configuration, then remove only the newly uploaded Convex files and resolver/config entries if they are no longer referenced. Do not alter source objects or database rows.

The actual upload and reference switch are a later, explicitly approved operation. The migration itself need not create a Convex database document; storage IDs can live in app-level configuration. If application data access remains on Drizzle, serving Convex storage URLs still requires a small independent Convex read path or persisted configuration, but does not require changing the relational database backend.

## Verification plan

- Confirm each exact source object exists at the expected bucket path and can be read without mutation.
- Compare source and Convex SHA-256, MIME type, and byte size; validate PNG signatures and dimensions.
- Confirm the storage ID resolves to a non-null Convex file URL and that the URL returns the same bytes.
- Check the two public component references and `next/image` host configuration.
- Confirm database media row count and all three Supabase Storage objects remain unchanged; confirm `.emptyFolderPlaceholder` was not uploaded, changed, or deleted.

## Explicit boundaries

- Supabase Storage source remains untouched.
- No object deletion occurs in this phase.
- No application backend switch occurs in this phase.
- `.emptyFolderPlaceholder` remains unresolved and unmigrated; do not move it.
- Supabase PostgreSQL and Drizzle remain unchanged.

## Source object URLs

- Footer: `https://ajgwjvvdvjjgkufohvwt.supabase.co/storage/v1/object/public/portfolio-media/Halftone%20Moonlit%20Mountain%20Landscape.png`
- Loading screen: `https://ajgwjvvdvjjgkufohvwt.supabase.co/storage/v1/object/public/portfolio-media/Monochrome%20Stag%20Beneath%20the%20Moon.png`
