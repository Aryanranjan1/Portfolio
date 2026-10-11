# Approved application asset storage migration

Status: both approved assets copied and verified. The third bucket object remains out of scope.

| Logical key | Source object | Convex storage ID | Convex URL | Source SHA-256 | Convex SHA-256 | Source bytes | Convex bytes | MIME | Status |
|---|---|---|---|---|---|---:|---:|---|---|
| `footerHalftoneMountain` | `portfolio-media/Halftone Moonlit Mountain Landscape.png` | `kg20ktrdrqqqn0v7qb7yja11w98fx97p` | `https://blissful-antelope-951.convex.cloud/api/storage/5d1bd654-d2d5-42f4-9f01-c2d1e8d604ab` | `8b35d75a5f301aa00128846b1ec42670d58805ca3a36ab38ab87fec868fc2707` | `8b35d75a5f301aa00128846b1ec42670d58805ca3a36ab38ab87fec868fc2707` | 1,441,755 | 1,441,755 | `image/png` | PASS |
| `loadingStagMoon` | `portfolio-media/Monochrome Stag Beneath the Moon.png` | `kg297sq625byv73n018j8w8s2n8fxhtm` | `https://blissful-antelope-951.convex.cloud/api/storage/b395e3d0-b614-4829-bbae-204f4ae7b1d2` | `50be103bda7cf0d7af3e39e2a19b5489228d365e979c3370f16da3a54de295e3` | `50be103bda7cf0d7af3e39e2a19b5489228d365e979c3370f16da3a54de295e3` | 1,627,055 | 1,627,055 | `image/png` | PASS |

## Implementation

- Logical keys and their Convex storage IDs, filenames, and URLs are in `src/lib/application-assets.ts`.
- `src/components/footer.tsx` now resolves `footerHalftoneMountain`.
- `src/app/(public)/loading.tsx` now resolves `loadingStagMoon`.
- `next.config.ts` allows the configured Convex `.convex.cloud/api/storage/**` host for `next/image`; existing Supabase and Unsplash patterns remain.
- No database schema or records were changed. Drizzle and PostgreSQL application access remain active.

Convex Storage currently contains exactly two files. Each was downloaded again from its unchanged Supabase source and from its Convex URL. SHA-256, byte size, MIME type, and system storage metadata matched. The storage API's file metadata does not carry the original filename; the verified filename is preserved in the logical application mapping.

## Verification

- Convex file existence and direct URL retrieval: PASS (2/2).
- Source/destination SHA-256 equality: PASS (2/2).
- Byte sizes and `image/png` MIME types: PASS (2/2).
- Application references resolve through logical keys: PASS.
- Exact old Supabase object URL references remain in application source: 0.
- TypeScript (`npx tsc --noEmit`): PASS.
- ESLint on changed app, config, and migration files: PASS.
- Existing tests (`npm test`): PASS (4/4).
- Production build: UNVERIFIED. Default Turbopack build could not bind its CSS worker port (`Operation not permitted`). `next build --webpack` also stopped because Next could not parse TypeScript's `--showConfig` output; the same TypeScript CLI output parsed successfully when run directly.

## Scope confirmation

- Supabase originals remain present and readable; no Supabase Storage object was modified or deleted.
- `.emptyFolderPlaceholder` was not uploaded. It remains the third object in Supabase Storage and is unresolved.
- Supabase PostgreSQL and Drizzle remain intact; application database access was not switched.
- No media or site settings rows were created.

## Rollback

Restore the original Supabase URL values in the two image references and remove the Convex image host pattern and `src/lib/application-assets.ts` mapping. The original Supabase objects remain available. The two Convex copies can be deleted later if no deployment uses them.
